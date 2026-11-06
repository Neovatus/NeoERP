# BE-14 live run report (claude/be-14, latest commit e81bbc6)

Branch claude/be-14 in worktree NeoERP-worktrees/be-14-be; 7e027dc sits on 725a8b5, which sits on 933a2bd. Not pushed, not merged. No service code changed.

## Kystgruppe reopen
- FY2026 reopened with POST /api/accounts/fiscal-years/{id}/reopen as the Kystgruppe owner, reason "Reopened for Phase 3 acceptance run (BE-14)". HTTP 200, year OPEN.
- Period 11 (Nov 2026) reopened via POST /api/accounts/periods/{id}/reopen, now OPEN.
- Jan-Mar are LOCKED and the API refuses to reopen LOCKED periods (409 PERIOD_STATE), so none were unlocked. Scripts date documents today, so only period 11 was needed.

## Results
- seed-demo-phase3.sh, first full run: exit 0, 86 steps ok, 0 warnings, 0 skipped.
- b-acceptance.sh: exit 0, PASS, 167 checks, 0 skipped.
- c-acceptance.sh: exit 0, PASS, 141 checks, 0 skipped.
- Idempotent seed rerun: exit 0, 71 steps ok, 0 warnings, 0 skipped, 0 creates.
- b and c were not run a second time.

## Fixes in 7e027dc
- scripts/seed-demo-phase3.sh: Kystgruppe documents dated today, not go-live (go-live is in a LOCKED period).
- scripts/phase3-lib.sh p3_refused / p3_refused_any: restore the previous response body after a refusal (the next approve call failed with "version required").
- scripts/phase3-lib.sh new p3_ntn, used by scripts/b-acceptance.sh and scripts/c-acceptance.sh: fresh NTN per run for the PK party (409 DUPLICATE_CUSTOMER_TAX_ID against the seeded party).
- scripts/c-acceptance.sh: bill numbers C-ADV-, C-DIM-, C-PK- start with a distinct digit (duplicate check compares digits only, 409 DUPLICATE_SUPPLIER_INVOICE).
- docs/local-demo-data.md: documents today's date and the LOCKED-period limit.

Earlier fixes in 725a8b5 (scripts/phase3-lib.sh, scripts/seed-demo-phase3.sh, docs/local-demo-data.md): absent country-scoped feature counts as off, likeAccountId for new accounts, branchId on documents, PK withholding codes get a 5 % demo rate and are activated, Sialkot documents dated today.

## Notes
- One stale Kystgruppe draft invoice was deleted via the API with a reason (HTTP 204), because fixed Idempotency-Keys replay old draft bodies.
- To get the local database working I also ran seed-demo-tenants.sh (FREE_DIMENSIONS entitlements were missing locally).
- Services are running, started by run-all-services.sh from the NeoERP-BackEnd checkout.

## Still failing
Nothing.

## Review-fix round (commit e81bbc6, on 7e027dc)
Opus review items 1-12 done in scripts and docs only (phase3-lib.sh, a1-acceptance.sh, b/c-acceptance.sh, seed-demo-phase3.sh, docs/local-demo-data.md).
- p3_refused_any deleted; every refusal pins status and code (422 OWNER_CONFIRMATION_REQUIRED, 422 OTHER_APPROVER_EXISTS, 403 PERMISSION_DENIED on the Accountant refusals), codes confirmed against the service code and accounts-b.md.
- New per-script scenario: the Finance Manager drafts, submits and tries to approve her own invoice / bill: 403 TWO_PERSON_RULE; she then withdraws and deletes the draft.
- Final step checks INV, CN, WO, RCT, ADV, RFD, BILL, PAY, DN, SRF numbers against accounts.document_sequences (read-only SQL), per company.
- p3_tax: only the seed (P3_SEEDING=1) activates codes, only PK-WHT-*; acceptance stops with "run seed-demo-phase3.sh first".
- p3_create fails on a 200 replay of a draft dated differently from P3_DATE, naming the draft; seed header corrected.
- p3_control_difference requires a control with difference 0.
- Route check asserts the gateway port; the /api/internal 404 must carry no service problem code.
- Dimension SQL: UUID check plus BEGIN READ ONLY. Sialkot sections run under a real `set -e` subshell. Docs: exit 3, typo, PERIOD_STATE (409 on reopening a LOCKED period; PERIOD_LOCKED on submit), reopen-by-hand note.
- p3_ntn removed: one fixed PK customer / supplier per company, found by name. a1_guard requires a loopback NEOERP_AUTH_BASE_URL.

Results after this round (local stack, no failures, 0 skipped):
- seed-demo-phase3.sh: exit 0 (71 steps ok, 0 warnings), run twice.
- b-acceptance.sh: exit 0, PASS, 175 checks.
- c-acceptance.sh: exit 0, PASS, 149 checks.
Still failing: nothing.
