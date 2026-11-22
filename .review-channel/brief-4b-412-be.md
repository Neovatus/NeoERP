# Brief: 4B-412-BE — platform lane: action ids, data at scale Stage 0, notification service (BackEnd, draft 2026-11-22)

**Roadmap:** `docs/drafts/accounts-roadmap.md` "Phase 4b" 4.12 (ADR-025 RT-1, RT-2 with A1–A3; ADR-024 Stage 0; backlog:347).
RT-0 is App work: lane 4B-412-APP (plan row 4). **Base:** `phase/4b`, cut from `main` the day the Phase 4 PR (4.19) merges.
**Slicing:** L37 option B, three BackEnd lanes, labelled at assignment:

| Lane | Branch / worktree | Content | Kind | Reviews |
|---|---|---|---|---|
| PLAT-A | `phase/4b-plat-a` · `NeoERP-worktrees/plat-a` | RT-1 `:shared:actions`, A2 `Prefer`, A3 rule; ADR-024 N5 (locks share the export files) | platform | fresh Opus |
| PLAT-B | `phase/4b-plat-b` · `plat-b` | ADR-024 Stage 0 N1–N4, N6–N8 | money read (F1 balances) | fresh Opus + Fable |
| PLAT-C | `phase/4b-plat-c` · `plat-c` | RT-2 notification-service, client outbox, producers moved, gateway | **security** | fresh Opus + Fable |

A and C start together; B starts with them except N7 (`infra/compose.yml`), which C rebases onto. **Builders:** Opus 5.5
high, builder Mac, targeted tests only. Copy this file to `docs/agents/plat-4b/brief-be.md` as the first commit, with
reference copies of the workspace ADRs as `docs/agents/plat-4b/ref-ADR-024.md` and `ref-ADR-025.md` (the lead supplies
them: builders see one repo; the workspace files stay the source of truth, Jabran 2026-11-21).

## Goal
Long writes answer with one action-id shape the app can wait on; the database is measured and its known hot spots
fixed before large-customer data; one notification service, in-app first, replaces each module's own.

## Evidence (read first)
- ADR-025 (ref copy): D1, **D2** action ids, **D5** notification service, D7 build plan, **Additions A1–A3**, Q1–Q17.
- ADR-024 (ref copy): §1 findings F1–F10 and platform notes, **§2 D1–D5**, **§3 Stage 0 N1–N8**, §7 tests.
- Code: `audit-service/.../NotificationController.kt:78-79` (`userId` filter refused), `NotificationService.kt:79-100`
  (simulated channels), `V2__notifications.sql`; `accounts-service/.../infrastructure/notification/BankNoticeHttpSender.kt`;
  user-service fire-and-forget producer; org-service agreement e-mails; accounts export jobs (202 + `{jobId,status}`),
  SIE and OB import status rows; session locks `ExportJobJdbcAdapter.kt:297-327`, `LedgerCheckJdbcAdapter.kt:132-140`,
  `OrgSyncJdbcAdapters.kt:164-172` (also check `BalanceRepositories.kt:111`, `OrgSyncPorts.kt:117`);
  F1 `ReceivablesReadJdbcAdapter.kt:61-63`, `PayablesReadJdbcAdapter.kt:46-47`; F2 `org-service/.../OrgAuthorization.kt:70`;
  F3 `CompanyService.kt:235`; F6 Ar/ApDocumentReadService, Receipt/PaymentReadService; `infra/compose.yml:19` (postgres:15).

## Decided (do not reopen)
1. ADR-024 and ADR-025 accepted (Jabran 2026-11-16, fully 2026-11-21 with A1 event snapshots, A2 `Prefer`, A3 rule
   after the foundation; roadmap decision 3; backlog:385). ADRs stay in the workspace (Jabran 2026-11-21).
2. No Elasticsearch/OpenSearch/BigQuery/ClickHouse until measured (ADR-024 Q1, Jabran 2026-11-14). Postgres 16 target.
3. Action ids exactly as D2: header `NeoERP-Action-Id` on sync writes; 202 + `Location` + `{actionId, kind, status,
   subject, statusUrl}` for async; shared statuses; starter-only, company-bound reads (others 404); same key + body →
   same actionId, other body → 409; existing jobs keep their ids and add `actionId`; finish event in the same
   transaction; kept 7 days; module `:shared:actions` (`action_runs`).
4. Notification service as D5: own DB, `POST /api/internal/notifications/commands` (audience `neoerp-notification-internal`,
   scope `notification.command.write`, pinned clients); `(producer, requestId)` unique; `companyId` NOT NULL;
   recipients resolved at send time with membership and module re-checked; templates by key en/nb/sv/da, fallback en;
   in-app carries key + params ("backend gives codes, app owns words"); retention 90/180 days, deliveries 30 days.
   RT-2 is **in-app only**: e-mail (RT-6), push (RT-7) and the stream (RT-3, lane 4.13) are not in this brief.
5. A2: writes accept `Prefer: return=representation | respond-async | return=minimal`. A3: every new slice returns an
   action id for async work and sends messages through the notification service (architecture test).
6. Target design, no workarounds for old code (Jabran 2026-11-15). Single writer: `PostingEngine.kt` / `Posting.kt` untouched.

## Open decisions for Jabran (each with a recommendation)
- **OD-1 ADR-025 question answers.** The ADR is accepted but does not record per-question answers. **Rec:** confirm the
  recommendations for the ones this lane builds on: Q1 (hub in notification-service), Q2 (header on every write, row
  only for async), Q6 (retention), Q7 (inbox across memberships), Q9 (commands, not events), Q12 (workflow items stay
  in audit-service), Q13 (user/auth become relay producers), Q17 (no Urdu templates in release 1).
- **OD-2 Old in-app rows.** **Rec:** do not copy audit-service notification rows (demo data only); the gateway moves
  `/api/notifications` to the new service; the audit tables are dropped a release later (ADR-025 D7 RT-2).
- **OD-3 A2 reach now.** **Rec:** `Prefer` handled by the `:shared:actions` filter and honoured on the RT-1 adopters
  and the new service only; other writes adopt it with A3, screen by screen.
- **OD-4 Load target for N3.** **Rec:** ADR-024 Q6 as recommended: the ADR-023 D14 tenant (30 companies, 20M lines,
  5,000 employees) plus one 3× headroom run; sizes from `docs/agents/arch1/capacity-model.md` (lead supplies a copy).

## Scope
| ID | Lane | Item |
|---|---|---|
| A-1 | A | `:shared:actions`: `action_runs` (UUID v7 ids), status helper, header filter, idempotency link, finish event, 7-day retention job. |
| A-2 | A | Adopters: accounts exports, SIE export/import, OB import return `actionId` + shared statuses; `GET /api/accounts/actions/{id}`. |
| A-3 | A | A2 `Prefer` (three forms) in the filter; adopters honour it. A3 architecture test (async handlers return an action id). |
| A-4 | A | N5: session advisory locks → transaction-level locks or lease rows in the three adapters (+ any other found). |
| B-1 | B | N1: `pg_stat_statements`, `auto_explain` > 500 ms, Prometheus on an internal port with Hikari metrics (local compose). |
| B-2 | B | N2: code rules + architecture tests (no in-memory paging, no optional-tenant filters, capped counts on new lists). |
| B-3 | B | N3: large-tenant generator (extends the P-24 load check) + k6/Gatling scripts; numbers into `db-design.md`. |
| B-4 | B | N4: F1 (stored per-party balance or lateral for the page rows only), F2, F3 (paged). |
| B-5 | B | N6 UUID v7 for new high-volume rows; N7 local Postgres 15 → 16; N8 batched detail lookups (F6). |
| C-1 | C | `notification-service`: own DB, command API, inbox read (`GET /api/notifications`, caller-bound, `userId`/`email` filters still 400). |
| C-2 | C | Templates (key, version, 4 languages, push-safe params declared); `groupKey` dedupe 10 min; retention jobs. |
| C-3 | C | `:shared:notification-client` with command outbox and retries (30 s → 1 h, 10 tries). |
| C-4 | C | user-service machine read: `permission@branch` → people at send time. Producers moved: user-service, accounts bank notices (own delivery table retired), org agreement notices. |
| C-5 | C | Gateway: `/api/notifications` → notification-service; the internal command route never exposed. |

**API table** (builder report, lead OK before 4B-412-APP / 4.13 start): A-2 status body and codes; A-3 `Prefer`
answers; C-1 inbox item shape (`templateKey`, `params`, counts, read/unread).

## Neighbours (outside this scope)
RT-0 + inbox rendering by template key: 4B-412-APP. RT-3 stream, RT-4, RT-5: lane 4.13. RT-6 e-mail, RT-7 push: Phase 5.
ADR-024 Stage 1 (keyset, trigram, PgBouncer, partition spike): release gate before the first large customer.
4.14 dimension lane runs in parallel: it owns `PostingValidator.kt`, chart and dimension files; do not touch them.

## Tests
- A: replay same key + body → same actionId (200 `Idempotent-Replay`); other body 409; another user's or company's
  action 404; finish event and final status in one transaction (rollback test); 7-day purge; three `Prefer` forms;
  export, ledger-check and org-sync concurrency tests green with transaction-level locks (old session-lock FAIL behind
  a transaction-mode pooler simulation / new PASS).
- B: F1 old/new party balances equal on generated data (reconciliation test) and list time recorded; two-company: no
  party, company or balance of B in A's answer; full Flyway on Postgres 16 for every service.
- C (security, a test per rule): wrong audience/scope/client 401/403; duplicate `(producer, requestId)` stores once;
  recipient without membership or module skipped; `companyId` null refused; inbox of A never shows B; `userId` filter
  400; template fallback en; client outbox retries then stops at 10; bank-change notice delivered exactly once after the move.
- Old FAIL / new PASS per changed behaviour (say how the base commit was run). Targeted runs only (`:shared:actions:test`,
  `:services:<svc>:test --tests …`, `:architecture-tests:test`); no whole-suite run, no `verify.sh` (old Mac gate).

## Rules
- One repo (BackEnd). Gradle only through `lockf -k /private/tmp/neoerp-gradle.lock`, Java 21, log to a file, one
  watcher; never `gradlew --stop`; stop only your own daemons. Do not start the stack.
- Plain commits, **no AI attribution, no Co-Authored-By**. No push, merge or rebase (the lead does).
- **Never open or print** `.env`, `infra/.env`, `.local-secrets/*`, token/session files, `~/.gradle/gradle.properties`,
  `~/.netrc`, `~/.aws`, keys. Push/mail credentials are not part of RT-2.
- Migrations freeze once applied. Take each migration number as **next free in that service at build time**; two
  lanes on one service: the second to merge renumbers before anyone applies it (ask the lead).
- Docs: developer pages `docs/modules/shared/actions.md`, `docs/modules/shared/notifications.md` (new), `docs/database/db-design.md`;
  user guide: none (no screens). List each or "none: reason" in the lane-ready.
- Stop and ask: a change to `PostingEngine`/`Posting.kt`, auth-service tokens, an applied migration, or a shape outside §API.

## Builder self-check (L36; in the report, one row per scope row)
| ID | Proof (test class.method, file:line) | Status |
|---|---|---|
| A-1 … C-5 (own lane's rows) | | |
L36: every review finding fixed with its own old-FAIL/new-PASS test and a re-run of the touched targets; review files
in gate format from round 1 (`Reviewer:/Reviewed:/Range:/Verdict:`).

## Reviews
Fresh Opus (whole diff, every lane) → `docs/agents/plat-4b/review-<lane>-1-opus.md`; Fable on B (F1 balances) and C
(audience, recipients, isolation) → `review-<lane>-2-fable.md`, diff + brief only. Only a FIX reviewer re-checks.
**Report:** `docs/agents/plat-4b/builder-report-<lane>.md`. **Lane-ready:** `.review-channel/lane-ready-4b-plat-<a|b|c>.md`.

## Timeline (lane-ready, MEASURE-1)
```
## Timeline
- Build: … · Rework: … · Review: … · Test: … · Waiting: …   (minutes; tokens per agent; FIX rounds)
- Files: … changed (main …, test …, docs …) · Items: … scope rows (… done, … moved, … dropped)
```

## Done when
Each lane's rows proven in its self-check; targeted tests 0 failed; reviews ACCEPT; API table OK'd; docs listed;
lane-ready with the Timeline; the old Mac's `verify.sh` green before merge to `phase/4b`.
