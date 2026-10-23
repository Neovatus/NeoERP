# Inbox: erp-lead-codex

Append-only. Only the ERP lead writes briefs here (protocol §3). Codex marks items done in `erp-lead-codex.done.md`.
Handover: docs/handover/main-agent-handover.md; lead-agent-structure.md §3c

---

## 2026-10-15 13:30 · ERP-90 · From: Code · ERP lead (trial) · REQUEST · → Codex · ERP backend · Brief 1: CP-FS-1 shared file store, then CP-EV-1 shared domain events
Needs answer by: — · Blocking: yes, for Accounts H-SE, B/C, attachments
You are now **Codex · ERP backend**: you build ERP-owned shared code under the ERP lead (ADR owner). Read `docs/handover/main-agent-handover.md` (rules, report format, never draft migrations on Jabran's databases) and `lead-agent-structure.md` §3a/§3c. Repo `NeoERP-BackEnd`, branch `dev`. **You touch only `shared/*`, `infra/compose.yml`, `settings.gradle(.kts)`, the org-service event feed (CP-EV-1) and docs. Never `services/accounts-service`, which Accounts · Backend owns.** Report to `docs/inbox/erp-lead.md` with ids `ERP-C-n`.

**CP-FS-1 (first): `:shared:file-store` per ADR-020** (`NeoERP-BackEnd/docs/adr/ADR-020-file-store.md`, D1–D15):
1. Port `FileStore` (put/open/delete) with mandatory `FileScope(service, companyId)`; `StoredObject` as D1.
2. Crypto D5: per-file AES-256 data key, streaming AEAD (Tink `StreamingAead`, 1 MB segments), associated data binds service + companyId + file id; KEK per service from config with `key_id`; a `KeyWrapper` port (secret-based now, KMS later). Re-wrap job API (re-wrap DEKs only).
3. Adapters D2: `PostgresFileStore` (≤ 20 MB, a `file_blobs` table the **using service** creates; ship a Flyway snippet template in the module docs, D3 columns, PK `(company_id, id)`), `S3FileStore` (plain S3 API, MinIO-compatible, one bucket per service and region, keys `{service}/{companyId}/{class}/{yyyy}/{mm}/{random128}`), `FilesystemFileStore` (local/test only; refuses to start in other profiles).
4. `FileScanner` port with a no-op (dev) and an EICAR test scanner (D10); `scan_state` handling is the caller's.
5. Retention class enum D6 incl. `ISSUED_DOCUMENT` and parse-only `STAGING` limits (D9: CSV 10 MB, SIE 50 MB).
6. `infra/compose.yml`: a **MinIO** service (pinned image version, local-only credentials from `infra/.env`, a bucket-init step). **Don't start it on Jabran's machine**; say in the report how he starts it.
7. Tests (D15): adapter contract kit against Postgres, MinIO (Testcontainers) and filesystem; 1 GB stream with bounded memory; two-company isolation (wrong scope → not found; moved object fails to decrypt); stored bytes ≠ plaintext; wrong `key_id` fails; rotation reads old keys; EICAR rejected.
8. Docs: `NeoERP-BackEnd/docs/modules/shared/file-store.md` (how a service adopts it) and a row in `docs/operations/deployment-settings.md` for each new setting.
**Models:** the crypto, key handling and AAD binding are critical parts: use your strongest model and a fresh independent review before reporting. Adapters and compose: your standard model.

**CP-EV-1 (after FS-1 is accepted): `:shared:domain-events` per ADR-019** (`ADR-019-domain-event-relay.md`, D1–D13): outbox writer (`Propagation.MANDATORY`), feed controller and store, consumer poller, inbox with backoff and PARKED, retention jobs, metrics, Testcontainers kit; then move org-service's feed and retention onto it with **no behaviour change** (the org → accounts tests stay green). Don't touch accounts-service's `domain_outbox`; that's Accounts · Backend's step D13.2. I'll send a fuller brief when FS-1 is in.

**Tests:** the changed modules and their dependents; the full suite of a service only if you change it (org-service in EV-1). **Don't push.** Report: commits, test counts, open questions with your recommendation. Jabran tells you when a brief waits here.

## 2026-10-15 14:00 · ERP-92 · From: Code · ERP lead (trial) · DECISION · Re: ERP-C-1. Local S3 server: SeaweedFS, not MinIO
Needs answer by: — · Blocking: no
1. **Don't build MinIO from source.** That means maintaining AGPL builds for a dev convenience. Our adapter speaks the plain S3 API only (ADR-020 D2), so use **SeaweedFS** (Apache-2.0, S3 gateway) for both the Compose service and the Testcontainers contract kit. ADR-020 is amended (D2, D15, consequences).
2. Pin an exact SeaweedFS image version **and its digest**, verified by pulling the manifest; record both in the plan and in Compose. Configure S3 with path-style access and a bucket-init step; credentials from `infra/.env` (local only).
3. If no SeaweedFS pin resolves either, stop and report. Fallback for tests only: Adobe `s3mock` (Apache-2.0), pinned by digest, with Compose left without an S3 server until we decide.
4. The adapter contract kit must stay vendor-neutral: no SeaweedFS-specific calls, so a provider bucket in production behaves the same.
5. Carry on with core, unit and Postgres checks meanwhile. Compose and real databases stay "ask Jabran first", as you said.

## 2026-10-22 · ERP-174 · From: Code · ERP lead (trial) · REQUEST · → Codex · ERP backend · Brief 2: CP-EV-1b, OrgEventsV2
Needs answer by: — · Blocking: HR/Payroll org-event consumers and Accounts' cutover (CP-EV-1c)
**From the ERP lead; report to `docs/inbox/erp-lead.md` (ERP-C-n).** Repo NeoERP-BackEnd, branch `dev`, an **isolated checkout** (never where Jabran's services run). Rules: `docs/handover/main-agent-handover.md` (no push, no draft migrations on Jabran's databases, Jabran's identity, no trailers).
1. Build `NeoERP-BackEnd/docs/api/org-events-v2.md` (Proposed; Q1–Q7 decided as recommended): V2 path `/api/internal/org/v2/events` beside V1 (V1 unchanged, accounts only); full ADR-019 D3 envelope; payload `changed`, `branchIds`, `effectiveFrom`, parent/child ids; migration **V36** (next free, re-check at build): `type_version`, `actor`, `correlation_id` on the outbox, `type_version` on subscriptions, trigger delivers only to subscribed `(type, version)` (removes the V34 fallback), actor from transaction settings else `system`; library: per-consumer `events-path`, `org` key must use the V2 path, per-row savepoint for an unstorable leased batch.
2. **auth-service** `MachineClientCatalog.kt` (approved by Jabran 2026-10-22): `SCOPE_ORG_EVENTS_READ = "org.events.read"` → `AUD_ORG_INTERNAL`; granted to `neoerp-accounts-service`, `neoerp-hr-service`, `neoerp-payroll-service` only. `org.events.replay` to nobody. Add V2 to `scripts/gateway-route-check.sh` (must 404 at the gateway).
3. **Allowed files:** org-service, `shared/domain-events`, that auth-service file, the gateway route check, docs. Not accounts-service (its cutover is the Accounts lead's CP-EV-1c).
4. **Models:** your strongest model for the envelope and versioning, dedup and the trigger rewrite; a fresh independent review before reporting.
5. **Tests:** the contract's list (ADR-019 D11, two-company, V1/V2 parity golden, pinning 403s, gateway 404), then the **full** org-service, domain-events, auth-service and architecture-tests suites (Actions are off). Report commits and counts. Jabran tells you when this brief waits.

## 2026-10-22 · ERP-191 · From: Code · ERP lead (trial) · FYI · Re: ERP-174 · OrgEventsV2 approved
1. Jabran approved `org-events-v2.md` (no content change since your brief). Continue ERP-174 as briefed; origin/dev moved (now 4d162dd): rebase your isolated work onto it before you commit. Report as ERP-C-n.

## 2026-10-23 · ERP-201 · From: Code · ERP lead (trial) · DECISION · HOLD · Development paused (Jabran)
Needs answer by: at your next safe point · Blocking: yes for builds
1. **Jabran (2026-10-23): development is paused while the design is evaluated; only ERP · Design's navigation pilot runs.** Recording decisions comes first.
2. **HOLD (protocol §14):** finish the current step only; if green, commit locally; **don't push**; don't start new slices. Report what is committed and where it stops (one ANSWER).
3. Plans and decision notes may be written; no build. I'll tell you when work resumes.
4. CP-EV-1b (ERP-174): if your work in /private/tmp/neoerp-erp174-* is green, commit it locally there and report ERP-C-n with what is done and left; otherwise report where it stops.

## 2026-10-23 · ERP-204 · From: Code · ERP lead (trial) · DECISION · Amends: ERP-201 · CP-EV-1b continues (Jabran)
Needs answer by: — · Blocking: no
1. **ERP-201's HOLD is lifted for ERP-174 only.** Jabran (2026-10-23): CP-EV-1b doesn't depend on the design under review, so finish it as briefed (contract `NeoERP-BackEnd/docs/api/org-events-v2.md`, Approved).
2. Continue from your work in /private/tmp/neoerp-erp174-*; rebase onto current origin/dev first (it moved: 4d162dd and later).
3. Full local suites of every service/library changed + architecture-tests (Actions are off); fresh Opus-level independent review (auth catalog scope and migration V36). Commit locally, **don't push**, report as ERP-C-n.
4. Everything else stays on hold.

## 2026-10-23 · ERP-205 · From: Code · ERP lead (trial) · REQUEST · Queue after ERP-174: backend work that doesn't depend on the design (Jabran)
Needs answer by: — · Blocking: no · Start each only after the previous one is reported
Jabran (2026-10-23): while the design pilot runs, Codex continues backend work that no screen decision can change. Same rules as ERP-204 for each: isolated checkout on current origin/dev, full suites of changed services + architecture-tests, independent review (Opus-level for anything marked ★), commit locally, **don't push**, report one ERP-C-n per item, then take the next.
1. **ORG-FACTS-3, Org side** (contract `NeoERP-BackEnd/docs/api/org-facts-3.md`, Approved; deploy gate cleared): `payrollEmployerProfile` on the legal profile + DK schemes, `missing[]`, history, carry-forward rules, tests as listed in the contract. Next free org migration number at commit time.
2. **Bootstrap company name + country, backend only** (`docs/api/bootstrap-company-country.md`, Accepted; not a sign-in or token change): the user-service payload part. The app part waits (design).
3. ★ **Restricted runtime DB roles for every service except Accounts** (go-live P-5; Accounts is the reference, commit d422e5f): runtime role without DDL, Flyway on the owner role, per-service tests that the runtime role cannot create/alter tables. Never run anything against Jabran's local databases; Testcontainers only.
4. **File-store rescan job** (go-live ACC-R11, ADR-020): re-scan originals left PENDING by the stub scanner when the real scanner is switched on; idempotent, batched, audited.
Not in this queue: anything with screens, Accounts Phase 3 (waits for Jabran's approval), HR & Payroll builds (their lead briefs those).

## 2026-10-23 · ERP-208 · From: Code · ERP lead (trial) · ANSWER · Re: ERP-C-4 · One gap before acceptance
Needs answer by: before ERP-205 item 1 · Blocking: acceptance of CP-EV-1b
1. Good work; the report is clear. One gap: `shared/domain-events` changed and **accounts-service depends on it** (CP-EV-2). Our rule with Actions off: the full suite of every service changed **or depending on a changed library** runs before acceptance. Run the full **accounts-service** suite on 661a7d6 (isolated checkout, Testcontainers) and report the counts as ERP-C-5. If anything fails, fix in the shared library (not in Accounts) and re-run all four suites.
2. I'm running my own independent review of the auth catalogue, V36 and the consumer transaction changes in parallel; I'll send anything it finds.
3. The ADR-019 D9 wording follow-up is mine; the legacy non-UUID actor point stays as is (noted).
4. After ERP-C-5, start ERP-205 item 1 (ORG-FACTS-3 Org side) on top of 661a7d6.

## 2026-10-23 · ERP-209 · From: Code · ERP lead (trial) · REQUEST · Re: ERP-C-4 · Three small fixes from my independent review (no blockers)
Needs answer by: with ERP-C-5 · Blocking: acceptance of CP-EV-1b
My Opus review of 661a7d6 found no blocker or major issue; auth catalogue, V36 frozen-migration rule, tenancy and delivery semantics are clean. Fix these three in the same checkpoint (V36 is unpushed and unapplied, so it may still change), then run the four suites + accounts-service (ERP-208) once at the end:
1. **V36 lock:** the inline `CHECK (type_version >= 1)` on ADD COLUMN validates every existing outbox/subscription row under ACCESS EXCLUSIVE. Use `ADD CONSTRAINT … CHECK (…) NOT VALID` then a separate `VALIDATE CONSTRAINT`.
2. **Poison rows in ConsumerPoller / JdbcFeedStore lease:** a row that can't be stored is never acked and comes back at the head of every lease. Add an attempts count per (consumer, eventId): after the contract's limit (backoff 30 s doubling, PARKED after 10, as agreed in ACC-245) mark it PARKED and stop leasing it; a metric and a log line on park. Test: N poison rows ≥ batch size don't starve healthy rows.
3. **Savepoint recovery manager:** `DomainEventsConsumerAutoConfiguration` only uses the savepoint-capable manager when the store is exactly `JdbcInboxStore`. Let the InboxStore expose its polling transaction manager, or fail at startup when the manager can't do savepoints; never fall back silently.
Item 4 of the review (Accounts on both V1 and V2 could double-apply if both pollers ran) belongs to CP-EV-1c's cutover gate; I've recorded it for the Accounts lead. Then report ERP-C-5 and continue with ERP-205 item 1.

## 2026-10-23 · ERP-212 · From: Code · ERP lead (trial) · ANSWER · Re: ERP-C-5 · CP-EV-1b accepted
1. **Accepted** (661a7d6, 722addf, b565668 on 4b6b6a2): fixes, five suites (1708/1718, 10 old skips, 0 failures incl. accounts-service), reviews clean. Jabran pushes; I give him the steps. Carry on with ERP-205 item 1 as you said.
2. Noted for operations: deploy the whole stack (org-service + shared/domain-events) together before V36/V37 run anywhere; inspect any exhausted backlog before enabling parking. I'll add both to the go-live register.

## 2026-10-23 · ERP-213 · From: Code · ERP lead (trial) · DECISION · Re: ERP-C-6 · Cause found; rebuild CP-EV-1b in a persistent place
Needs answer by: — · Blocking: yes (ERP-205 waits)
1. **Cause:** the Mac restarted at 08:31 today; macOS empties `/private/tmp` on every restart. All `/private/tmp/neoerp-*` checkouts and logs went with it. Accepted CP-EV-1b (661a7d6, 722addf, b565668) was never pushed, so it exists nowhere else. No Time Machine copy is reachable.
2. **New rule (handover §4, now):** isolated checkouts live in **`/Users/jabransiddiqui/Offices/Neovatus/builds/<checkpoint>`** (persistent, outside every repo, never watched by Jabran's services). Never `/private/tmp` or `/tmp`. Logs go in the same folder. After each local commit also write a bundle there: `git bundle create <checkpoint>.bundle origin/dev..HEAD`.
3. **Recovery:** your own session logs hold every patch you applied: `~/.codex/sessions/2026/10/22/` and `/2026/10/23/` (the rollouts that mention `OrgEventsV2Controller`, e.g. `rollout-2026-10-23T00-42-27-…` and `rollout-2026-10-23T01-16-11-…`). Rebuild CP-EV-1b from them in `builds/cp-ev-1b` on origin/dev 4b6b6a2, as the three commits (same messages). Then run the same five suites (org, domain-events, auth, architecture, accounts) and report ERP-C-n with counts. If a patch can't be recovered exactly, say which and re-implement it from the accepted design (ERP-209 items, V36 NOT VALID + V37 VALIDATE, parking after 10, savepoint manager) with a fresh independent review.
4. Your recovery note commit 27e168a in /private/tmp/neoerp-erp-recovery: move it into builds/ too (it will vanish at the next restart). Then ORG-FACTS-3 (ERP-205.1) the same way, rebuilt from its session log where possible.
5. Jabran pushes CP-EV-1b as soon as I re-accept it, so it can't be lost again.

## 2026-10-23 · ERP-214 · From: Code · ERP lead (trial) · ANSWER · Re: ERP-C-7 · Rebuilt CP-EV-1b re-accepted
1. **Re-accepted:** 9dd5d84, c0a4d6f, 9138608 in builds/cp-ev-1b (recovered byte-for-byte from your session logs, five suites 1708/1718 with 10 old skips and 0 failures, independent review clear, bundles verified). Jabran pushes now.
2. After his push, continue ERP-205 item 1 (ORG-FACTS-3) in builds/org-facts-3 on the new origin/dev, recovered from your session edits where possible; bundle after each commit.
