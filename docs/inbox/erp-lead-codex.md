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
