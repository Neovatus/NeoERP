# Lane ready: R29b-1 (org-service company scope, sub-lane 1 of 5) — 2026-11-22

**Repo / branch:** `NeoERP-BackEnd`, `phase/4-b2-r29b-1-r2` (pushed, head `64509abe`, on BackEnd `phase/4` `6c31dfbb`,
BE-JDK21 merged). Built and reviewed on the **builder Mac**. Compile and targeted tests only: the full gate is the old Mac's.
**Brief:** `docs/agents/r29b/brief-1-org.md` (with `brief.md` and the evidence folder). Approved: Jabran 2026-11-22.
That covers D-25 with Fable's conditions, D-26 (a) and (b) ("Ok"), and the lead decisions D-26, D-29 (rule 2).
**Builder:** Opus 5.5 high. Report: `docs/agents/r29b/builder-report-1-org.md` (fix rounds 1 and 2, follow-up rows).
**Security / company-isolation lane: RISK.** Reviews (this Mac): Opus fresh + Fable. Each said FIX in round 1, and
both accept after 2 fix rounds.

## Review files (commit them with the lane; the gate reads the final two)
- Final, in gate format: `docs/agents/r29b/review-final-1-opus.md`, `docs/agents/r29b/review-final-2-fable.md`
  (Range `6c31dfbb..cc191e87`, Reviewed `cc191e87`; the one commit after it adds only these two files; `risk-check.sh --reviews` on this Mac: REVIEWS OK).
- History: `review-1-1-opus.md` (FIX 0H/2M/6L), `review-1-2-fable.md` (FIX 0H/5M/9L), `review-1-3-opus-fixcheck.md`
  (ACCEPT, re-run), `review-1-4-fable-fixcheck.md` (FIX: 1 MEDIUM), `review-1-5-fable-fixcheck2.md` (ACCEPT).

## What it does
- The 10 org entries are classified: 9 off `tenant-classification-baseline.txt` (44 → 35), the R34-scan entry
  `AuditEventOutboxStore` (1 → 0). `MAX_UNCLASSIFIED` 35, `MAX_UNCLASSIFIED_R34_SCAN` 0. Ratchet system list 16 → 26,
  platform-wide list 0 → 1, `TENANT_SCOPE_2026_11_21` untouched (98).
- `OrgScopeResolver`: the caller's reach is minted by the resolver from ACTIVE memberships, or from a checked platform
  permission. Owner lookups return only company, branch or warehouse ids and are pinned to the resolver. Scope-all
  staff get their own lookup, keyed by the permission. A reach failure answers 503.
- Platform writes write their audit event in the same transaction (`saveAndFlush`), and a failed audit refuses the
  write with 503. Company-less writes go through small pinned ports with frozen methods. Platform-wide reads are
  recorded before the read (503 if the record fails).
- Arch rules: pins by class and method (calls and method references), the platform-wide read is minted only in
  `CompanyController.list` and `.overview` (D-26 a), and the sweeper's system scopes stay private.

## Answers that changed (wrong or failing callers only; correct callers get the same responses)
| Endpoint | Before | After |
|---|---|---|
| `requests/{id}` read, withdraw, review, approve, decline, enrolled | missing or another company's request: 403 | 404 (inside the reach without the permission: still 403) |
| `requests/{id}/enrolled` | enrolled company read across all companies | 404 outside the staff member's reach |
| Scope-all staff without the endpoint's permission, by-id resources | 403 | **404** (no permission means no reach; D-29 item 3: not on the D-25 list, so listed here for Jabran and the App retest) |
| Every by-id org endpoint for a tenant, user-service failing | ignored (200 if the permission call answered) | 503 `AUTHZ_UNAVAILABLE` |
| `GET /companies`, `/overview`, user-service failing | 200 with an empty or platform-only list | 503 |
| Every platform write; the 3 platform-wide reads | no platform audit | refused when the audit cannot be written: 503 (write was 500) |

**App retest:** the 404s above on the request pages and on by-id pages for staff, and the 503 messages when
user-service is down. These are App-visible status changes with no shape change.

## Tests on this Mac (Java 21, BackEnd lock, Docker up)
- The Opus re-run on `1d2d199a`: `:architecture-tests:test` 75/0; org-service, the 14 changed classes 219/0
  (including `PlatformWriteRealTransactionTest` 6, executed).
- Fix round 2 (builder, `5ffb0248`): `TenantRepositoryArchitectureTest` 25/0, enrollment provisioning 40/0,
  `PlatformWriteRealTransactionTest` 7/0 (executed), `CompanyFiscalFactsLockTest` 18/0, audit outbox 3/0.
- Base run (old code `e872b28f`, temp checkout): the 3 changed HTTP tests and the reach-client 429 case FAIL there and PASS on the lane.
- Not run here: the full suite, the money invariants, the jar-mode start (all for the test Mac).

## For the old Mac (test Mac)
1. Check the two final review files (format, Range, Reviewed).
2. `scripts/verify.sh --range origin/phase/4..HEAD --reviews docs/agents/r29b/review-final-1-opus.md docs/agents/r29b/review-final-2-fable.md`
   (`PlatformWriteRealTransactionTest` needs Docker; it must show executed, not skipped).
3. Jar-mode start: 8 healthy; org endpoints answer as before for the demo users.
4. Verdict; merge after Jabran's MERGE.

## Docs pages
Developer: `docs/adr/ADR-012-tenant-query-isolation.md` (§2 reach-bounded owner lookups; §3 org's company-less writes,
the `/companies` + `/overview` exception, the Enter-company attribution), `docs/api/org.md` (status changes and audit
records). User guide: none, because no user-visible message changed; the App shows its existing 404 and 503 texts.
`docs/agents/r29b/evidence/` is kept until R29b-5, because sub-lanes 2–5 use D-25 and ADR-026.

## Follow-up rows (not in this lane)
1. `OrgIamAccessClient.hasPermission`: a user-service failure answers 503, not 403 (fails closed today, inside the
   reach): **in R29b-2**.
2. Enrollment refactor: the operation log's machine methods move with the sweep and are pinned to the sweeper. Plus
   Fable L9, folding `OrgPlatformFactsScopes` into `OrgScopeResolver`: backlog, when enrollment is next reworked.
3. `OrgIamAccessClient.accessibleOrgIds` is unused: delete it, or make it fail closed (with R29b-2).
4. Small notes from Fable: the fiscal-facts service has no read-scope check of its own (it is reached only through the
   resolver); one stale `platformAllows` KDoc line; the real sweeper `SystemScopes` has no test of its own (an optional `sweep()` test).

## For Jabran
1. Verdict after the old Mac's gate. The lead's call: **MERGE** if the full run passes.
2. FYI (D-29 item 3): staff without an endpoint's permission now get 404 instead of 403 on a single record,
   consistent with your D-25 rule.
