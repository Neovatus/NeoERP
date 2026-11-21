# Lane ready: ISO-R1 (shared tenant binder and database roles, ADR-026 step R1) — 2026-11-21

**Repo / branch:** `NeoERP-BackEnd`, `phase/4-b2-iso-r1` (pushed, head `6f5481a3`). Merge target: `phase/4` (at `d0dd5441`).
**Range:** `d0dd5441..6f5481a3` (21 commits).
**Brief:** `docs/agents/iso-r1/brief.md`, from the accepted ADR-026 (Jabran 2026-11-21: D1–D11 as recommended, Q5 = (b)); amended by lead decisions D-13 (binder switch off in R1; start-up refused when RLS tables exist and the binder is off) and D-14 (savepoint ban with `ConsumerPoller` the one exception), both Fable APPROVE with conditions.
**Builder:** Opus 5.5 high. **Reviewers:** Opus 5.5 (fresh) and Fable 5.2 security review (independent: diff, brief and ADR only); round-3 small fix confirmed by Opus and Sonnet (two different reviewers, budget rule).

## Reviews (`docs/agents/iso-r1/` on the branch)
- Round 1: `review-1-opus.md` FIX (3 MEDIUM: setting ban matched literal names only; OFF mode skipped the D-13 refusal; switch read two ways) and `review-2-fable-security.md` FIX (4 MEDIUM, **proven on Postgres as a non-superuser role**: session-level setting via constant/concatenation leaked rows to unbound transactions; `enabled=on|yes|1` gave no binder but passed start-up; hr/payroll had no start-up check; method-reference callers missed by the allowlist). Core verdict: every lost bind ends in an error or no rows, never another company's rows. Merged in `fix-list-round1.md`; each MEDIUM fixed with a regression test **old FAIL (c2fc351c) / new PASS**.
- Round 2: `review-1b-opus-round2.md` FIX (1 new MEDIUM: savepoint rule no longer saw multi-line raw strings), `review-2b-fable-security-round2.md` **ACCEPT** (all four attacks re-run and refused; 3 LOWs).
- Round 3 (raw strings, case-insensitive setting names, `SET $NAME`): `review-1c-opus-round3.md` and `review-2c-sonnet-round3.md` **ACCEPT** (Sonnet re-ran the old-code proof: exactly the three new tests fail on `e292550e`; ~20 extra variants checked). **Final pair** for the marker.

## Full run (`scripts/verify.sh` on `6f5481a3`, 2982 s)
**`verify: OK`**, marker written: **4295 tests, 0 failed, 59 skipped** (16 modules; before this lane 4222/0/59 — the 73 added are the new binder, domain-events, architecture and role tests; skips unchanged and within the allowlist). Money invariants: OK (9 companies, 25 posted journals, 73 lines). Risk: RISK with the final review pair. Gradle exit 0.

## What it holds
- `TenantTransactionBinder` (shared/tenant-security): transaction-local setting, one bind kind per transaction, mixing throws and refuses the commit, `REQUIRES_NEW` gets its own bind, repository advice inside the transaction interceptor. **Switch `neoerp.tenant.binder.enabled` off in every service** (D-13); strict `true`/`false` only.
- The five flag functions (M2) as a shared template, drift-tested against the dev page.
- Architecture bans: session-level tenant settings (constants, interpolation, concatenation, quoted/unbraced `SET`, case-insensitive, `BIND_SQL` private) and savepoints (multi-line strings), with the named exceptions (Flyway init SQL; `ConsumerPoller`, R4 must bind before its first savepoint); bind-caller allowlists incl. method references (system-job and platform lists empty).
- Shared role template rendered per service: hr and payroll owner (`NOSUPERUSER NOBYPASSRLS`, CREATE on its database: Fable judged needed and safe), app and backup roles; app role cannot write `flyway_schema_history`; schema REVOKE restored. Shared `RuntimeRoleCheck`: RLS tables with the binder off **refuse start-up in every mode**; wired in accounts, hr and payroll (WARN locally).
- `DomainEventWriter` and the inbox processor bind from their scope; poison-row test at binder level.
- **No RLS policy on any table, no applied migration changed, no behaviour change while the switch is off.**

## Write-scope check
`shared/tenant-security/**`, `shared/domain-events/**`, the three services' wiring and role tests, `architecture-tests/**`, `infra/postgres/initdb/{hr,payroll}-db-roles.psql`, `scripts/{hr-payroll-db-roles,reset-local-dev}.sh`, build files of the touched modules, `docs/**` below, `docs/agents/iso-r1/**`. All in the brief's scope. No AI attribution (checked, 0).

## Docs pages
- **Developer:** `docs/modules/shared/tenant-binder.md` (new), `docs/operations/deployment-settings.md`, `docs/operations/hosting-and-go-live-requirements.md`, `docs/local-demo-data.md` (hr/payroll roles line).
- **User guide:** none: no user-facing change.

## Follow-ups (not blocking)
- Not fixed, with reasons in `fix-list-round1.md`: allowlists empty (the obligation to fill them is recorded for R2+R3/R4); class scan covers all of `com.neovatus`.
- Sonnet LOW (pre-existing): an indented `SET $name` on a later raw-string line with no `;` before it is missed by the text rule.
- R4 obligations written into the ADR copy: bind first inside `ConsumerPoller`, before its first savepoint (D-14 conditions).
- Merge order: R1 before R34-BE (R34 changes the hook; R1 is judged by today's hook).

## For Jabran
Verdict. After MERGE: fast-forward BE `phase/4` to `6f5481a3` through the hook. With your HR/Payroll approval, R4 (HR v2's first migration with RLS) can then start, beside Accounts R2+R3 (Q5 = b).
