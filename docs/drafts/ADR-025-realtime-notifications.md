# ADR-025: Real-time updates (SSE), action ids, push notifications and one notification service

## Status
Draft (ERP lead, 2026-11-14, Opus planner; lead-checked). Not accepted. Waiting on Jabran's answers (Q1–Q17) and review by the ERP, Accounts and HR/Payroll leads. Moves to `NeoERP-BackEnd/docs/adr/` when accepted.
Builds on ADR-016, ADR-019, ADR-020, ADR-023, ADR-008; changes none. Amends ADR-019 Q7 only to say where notifications live.

## Direction (Jabran)
Real time only where needed; event based; every write returns an action id (wait or carry on); events tell the app to update; push for some services; one notification service for all modules.

## Context: today
Backend
- ADR-019 relay (outbox, pull feed, inbox; consumers poll 5 s). Machine-only; the gateway never routes it.
- Notifications live in **audit-service** (`V2__notifications.sql`): free-text title/body, `org_id` nullable, no unique `request_id`, no retention. Every channel except IN_APP is **simulated** (`NotificationService.kt:79-100`).
- Command API `POST /api/notifications` (scope `notification.command.write`); people read `GET /api/notifications`; `userId`/`email` filters refused 400 `FILTER_NOT_ALLOWED` (`NotificationController.kt:78-79`).
- Producers each write English text: user-service fire-and-forget (drops on error), auth-service publisher unused, org-service agreement e-mails, accounts bank-change notices with own delivery table and retries.
- Workflow inbox in audit-service; "my inbox" design open (backlog line 48).
- Long jobs: each its own shape. Accounts exports answer 202 + Location + `{jobId,status}`; opening import and SIE have their own status rows.
- Idempotency-Key across accounts writes; HR keeps keys 7 days.
- FBR/e-invoice: fiscal states via `fiscal_outbox`; only a Noop provider.
- Gateway: reactive Spring Cloud Gateway; in-memory rate limits; services are servlet stack.
- No service sends e-mail (only Keycloak → Mailpit). No broker/Redis. No push.

App
- Inbox (old pattern) loads on open/refresh; no badge, no polling. **Bug (verified):** `InboxRepositoryImpl.kt:21` sends `userId`, backend refuses it → live inbox fails.
- Accounts polls: badges 60 s, exports/SIE 7 s, OB import 1.5 s, books-being-created 4 s; no offline/hidden signal (ACC-205).
- Entitlements re-read after refusals, context switch, focus after 5 min (FE-5).
- `NeoErpNetworkRuntime` already has an authenticated `stream()`; fixed 30 s request timeout per platform would cut a long stream.
- No FCM/APNs; Android manifest only INTERNET. `ARCHITECTURE.md:15` still lists Web.

## Decision

### D1. Three blocks, kept apart — all carry ids, never records
| Block | For | Who |
|---|---|---|
| Action id | Did my request finish, and how? | The writer |
| Change stream (SSE) | Something you can see changed; refetch if you care | The open app |
| Notification | A person should know, even with the app closed | Modules, via one service |
The app always refetches through the normal module API, so ADR-016 checks stay server-side.

### D2. Action ids
- **Synchronous writes** (< ~2 s): normal 200/201 + header `NeoERP-Action-Id` (= correlation id, goes into ADR-019 `correlationId` and audit; lets the app recognise its own changes). Nothing stored.
- **Asynchronous writes** (exports, SIE/OB imports and runs, payroll runs, period/year close, FBR/e-invoice submission, bulk actions, scheduled reports, anything calling outside systems): `202`, `Location: /api/{module}/actions/{actionId}`, body `{actionId, kind, status: QUEUED, subject, statusUrl}`.
- Status `GET /api/{module}/actions/{id}`: `QUEUED|RUNNING|SUCCEEDED|SUCCEEDED_WITH_PROBLEMS|FAILED|CANCELLED`, progress, result links, error `{code, details}` (codes, never server text), timestamps.
- Readable by the starter (+ platform staff read-only), company-bound; others 404.
- Same Idempotency-Key + same body → same actionId (200 `Idempotent-Replay`); other body → 409. The action id is never the idempotency key.
- Existing jobs are not migrated; they add `actionId` and the shared status names.
- Finish writes `{service}.action.finished` to the outbox in the same transaction as the final status.
- Kept 7 days after finish. Shared module `:shared:actions` (table `action_runs`, status helper, header filter, completion event, retention).
- App: "Working…" + "Continue in background"; `NeoActionWaiter` listens on the stream, falls back to polling (2 s for 20 s, then 10 s); completion toast + in-app notification for long jobs.

### D3. One SSE stream per signed-in session
- `GET /api/stream?companyId=…`, bearer header (never token in URL), served by notification-service; one gateway route, no timeout, no buffering.
- Envelope: `{type, companyId, branchId, subject{type,id}, subjectVersion, actionId, actorIsYou, occurredAt}` — no amounts, names or numbers.
- Topics: `user:{me}` (notification created/counts, my `action.finished`, `access.changed`, `session.ending`); `company:{id}:{module}` (entity types declared in the module's **stream contract** with a read permission; checked at open, on `access.changed`, on reconnect, cached ≤ 60 s). Never streamed broadly: payroll per-employee, HR sensitive subjects, bank-detail changes.
- Token expiry: server closes at `exp` with `event: reauth`; app refreshes and reconnects with Last-Event-ID; lifecycle re-checked on every connect.
- Replay: sequence ids; 10-minute window (Q10); older → `event: reset`, app refetches open screens, badges, entitlements. Back-off 1…30 s with jitter.
- Fan-out: notification-service is one ADR-019 consumer; writes `stream_events` (24 h) and `NOTIFY` inside its own DB; every instance LISTENs. Redis/broker only at ADR-019 D14 thresholds or ~20,000 streams.
- Latency ~2–7 s (relay poll 2 s). Limits: 5 streams/person (Q11), heartbeat 25 s, 500-event queue per connection, same-subject merge within 1 s, overflow → reset; virtual threads + async SseEmitter.
- SSE not WebSocket: one direction is enough; plain HTTP through the existing JWT chain, rate limits and logs; Last-Event-ID built in.
- Platforms: desktop open while signed in (paused after 10 min hidden); Android and iOS foreground only, push covers background.
- Ktor: `openEventStream()` on top of the authenticated `stream()`; common SSE line parser; no request timeout, ~60 s socket timeout. To check: KMM-Network per-call timeout; Android engine streaming (else OkHttp).

### D4. App side (`core/realtime`, plain Kotlin)
`NeoEventStreamClient`, `NeoRealtimeHub` (one connection; status Live/Connecting/Reconnecting/Offline/Polling), `NeoRealtimeEvents` (the only interface features see), `NeoActionWaiter`, `NeoRealtimeSessionBridge` (`access.changed` → entitlement refetch; `session.ending` → sign-out). Koin builds the hub once; features get interfaces by constructor; ViewModels turn events into MVI events, never write UI state directly.
Opt in: declare stream types; filter in the ViewModel; lists refetch the visible page (≤ once per 2 s); detail screens reload quietly or show "Changed by someone else" when there are unsaved edits; badge polls drop to 5 min while live. Indicator only after 10 s not live; no modals.

### D5. One notification service
New `notification-service` (own DB, platform capability). Takes over notifications from audit-service; workflow items stay there for now (Q12).
- Command API `POST /api/internal/notifications/commands` (audience `neoerp-notification-internal`, scope `notification.command.write`, pinned clients): `{requestId, companyId, branchId, templateKey, params, recipients[userId | permission@branch], subject, priority, groupKey, expiresAt}`. Permissions resolved to people at send time via user-service; membership and module re-checked. Outside e-mail only for templates marked `external` (Q8). `companyId` NOT NULL; platform notices explicit.
- Producers use `:shared:notification-client` with a command outbox and retries (30 s → 1 h, 10 tries); `(producer, requestId)` unique. Replaces user-service fire-and-forget and accounts' own bank-notice delivery.
- Templates by key, versioned, in the repo, en/nb/sv/da (fallback en). In-app items carry key + params and the app renders its own strings ("backend gives codes, app owns words"); push and e-mail rendered server-side in the recipient's language. Templates declare which params may appear in push.
- Channels: in-app (always, the record); push via APNs + FCM directly (Q3); e-mail via Spring Mail (Mailpit locally, P-9 provider in production); SMS not built; desktop OS notifications opt-in, HIGH only (Q14).
- Preferences per person/category/channel (`security`, `legal` can't be switched off); quiet hours per person (in-app never held); optional digest; `groupKey` dedupe within 10 min.
- Delivery rows per recipient/channel (PENDING/SENT/FAILED/SUPPRESSED/DEFERRED/EXPIRED); APNs 410 / FCM UNREGISTERED revokes tokens; provider errors server-side only.
- `company_id` NOT NULL everywhere; inbox bound to the caller and to active memberships (Q7). Audit records template changes, operator retries, admin preference changes.
- Retention (Q6): in-app 90 days after read / 180 unread; deliveries 30 days; no stored e-mail bodies; device tokens deleted 30 days after revoked/last seen.
- Push shows only category + company short name; data part only `notificationId` + deep link (Q4).
- Devices: register/delete endpoints; app deletes before sign-out; server revokes on suspension, deactivation and refresh-token reuse (needs user/auth as relay producers, Q13). One installation = one person.
- Stores: iOS push entitlement, in-context permission prompt, privacy manifest; Android `POST_NOTIFICATIONS`, channels, Firebase config, Data safety; credentials in the secret store.

### D6. Real time first (ranked)
1. Long-job completion (removes most polling). 2. Approvals / "waiting for you" counts (needs RT-0 and the my-inbox design for HR). 3. Permission and feature changes. 4. FBR / e-invoice status (with the FBR provider). 5. Record changed while open (journals, invoices, bills first).
Not real time: reports and dashboards, setup screens, master data lists, audit viewers, platform admin lists, HR records other than approvals, payroll results (action id only).

### D7. Build plan
| Slice | Content | Repo | Effort | Risk | After |
|---|---|---|---|---|---|
| RT-0 | Fix inbox `userId` bug; ARCHITECTURE.md Web line | App | S | Low | — |
| RT-1 | `:shared:actions`; accounts exports, SIE, OB runs add actionId | BackEnd | M | Low | — |
| RT-2 | notification-service skeleton, command API, templates ×4 languages, client outbox; move producers; gateway repoint; retire audit tables after a release | BackEnd | L | Medium | — |
| RT-3 | Stream hub (consumer, stream_events + LISTEN/NOTIFY, `/api/stream`, permission filter, reauth, replay, limits); gateway route | BackEnd | L | Med-high | RT-2 |
| RT-4 | App `core/realtime` + lifecycle per platform + ACC-205 signals (maybe KMM-Network change) | App | M-L | Medium | RT-3 (fake server to start) |
| RT-5 | First adopters: exports/SIE/OB via waiter; Accounts badges via events; access.changed | Both | M | Low | RT-1, RT-3, RT-4 |
| RT-6 | Real e-mail, digest, preferences, quiet hours | BackEnd + App | M | Medium | RT-2, mail vendor |
| RT-7 | Push (devices, APNs/FCM, revocation, app registration, store forms) | Both | L | High | RT-2, Q3/Q4/Q13 |
| RT-8 | FBR status events; changed-while-open banners; HR approvals | Both | M | Medium | RT-3, RT-5, FBR provider |
Order: RT-0 → RT-1 ∥ RT-2 → RT-3 → RT-4 → RT-5; RT-6/RT-7 when vendor answers are in.

Hosting items to add: P-27 proxy idle ≥ 60 s, HTTP/2, no buffering on `/api/stream`; P-28 one dedicated non-pooled LISTEN connection per instance (PgBouncer transaction mode breaks LISTEN); P-29 open-connection capacity from load test; P-30 push credentials in the secret store, Neovatus-owned Apple/Firebase accounts; P-31 egress allowlist for APNs, FCM, mail host; extend H-7 (processors, DPA, PK region) and P-18 (store forms).

## Alternatives rejected
WebSocket (two-way not needed, own auth/replay); faster polling (load, battery, nothing reaches closed apps); stream in the gateway (gateway must stay thin); stream per module (up to 8 connections); Redis now (LISTEN/NOTIFY enough at our size); full records in events (moves permission checks to the client); notifications derived from events (producer knows who to tell; ADR-019 Q7 stays); push aggregators (extra processor that sees recipients); keep in audit-service (different retention and scaling).

## Consequences
One shape for long work; most polling goes away; changes visible in seconds with permissions server-side; one place for templates, languages, channels, preferences, retention. Costs: a new service with long-lived connections and outside vendors; user/auth become relay producers; each live module writes a stream contract; push adds store-review, privacy and support work.

## Open questions for Jabran
| # | Question | Recommendation |
|---|---|---|
| Q1 | Where does the stream hub live? | Inside notification-service; split out only if load demands |
| Q2 | Action id on every write or only async? | Header on every write; 202 + status row only for async |
| Q3 | Push vendor | APNs and FCM directly; Neovatus owns the Apple Developer account and Firebase project (needs your decision + Google DPA) |
| Q4 | Lock-screen content | Category + company short name only |
| Q5 | Quiet hours default / HIGH override | No default; only security and named urgent categories override |
| Q6 | Retention | In-app 90 d read / 180 d unread; deliveries 30 d; no stored e-mail bodies (check GDPR/DPA) |
| Q7 | Inbox across companies? | All active memberships, labelled; acting switches company |
| Q8 | E-mail outside NeoERP | Only `external` templates, no free text; no outside schedule recipients in release 1 |
| Q9 | Notifications from events? | No: commands for notifications, events for the stream |
| Q10 | Replay window | 10 minutes |
| Q11 | Streams per person | 5 |
| Q12 | Workflow items move too? | No, until the my-inbox design |
| Q13 | User/auth become relay producers for access changes | Yes (else revocation reaches the stream only at token expiry ≤ 15 min) |
| Q14 | Desktop OS notifications | Yes, opt-in, HIGH only |
| Q15 | PK push/e-mail via foreign providers | Ask the PK legal adviser with ACC-R24; until then PK push carries no business data |
| Q16 | Production mail provider | EU/EEA-hosted with DPA; ERP lead lists options in RT-6 |
| Q17 | Urdu templates | Not in release 1 |
