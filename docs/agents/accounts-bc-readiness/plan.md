# Accounts B/C build-readiness review

| Field | Checkpoint |
| --- | --- |
| Identity / ownership | Codex owns this combined review; Jabran is integration/approval owner. Read-only contract reviewer and rig reviewer report to root; root alone edits this plan. Phase2 acceptance remains in its existing owning plan. |
| Stage / status | ACC-230 fixes delivered in App 9289e44c94710eba126fa7805499d2ca5fdf8374; 27/27 targeted checks pass; reported ACC-C-15. This plan and fixture accompany the separately authorized local workspace commit. Await Accounts lead independent recheck; no push/Phase3 build. |
| Approval | Jabran authorizes ACC-230 bounded fixes and, in the packaging reply, one workspace commit with ONLY this plan and rig-regression.cjs, exact subject docs(agents): B/C readiness plan and rig regression fixture (Draft). brief-sb2a.md and any recheck file belong to Accounts lead and stay uncommitted. No push, production B/C, migrations or shared-code work authorized. |
| Scope | Receivables/payables money and approval flows, engine/subledger dependencies, bank-details protection, tenant/concurrency/idempotency boundaries, spec/rig/wire parity, first checkpoint and acceptance gates. Previously decided §18 product rulings stay fixed. |
| Progress | Implemented signed payment fees, generated-note source allocations with reversal warning, supplier refund consumption by party/area/status, and explicit/fractional deductible percentages. Targeted27/27 green; source/embedded parity and preservation of non-B/C HTML checked. |
| Evidence | App fix commit 9289e44c; 27/27 Node checks against actual rig functions, embedded parity and non-B/C HTML preservation. Original review revisions/hashes retained below as historical baseline. Other owners' files preserved. Browser file preview blocked; no visual acceptance claim. Accounts lead owns the fresh independent Opus recheck, not implementer self-signoff. |
| Findings | BC-R1…R4 implemented and regression-verified in App 9289e44c; all await assigned independent recheck. No contract/product ruling reopened. |
| Resume point | Report the workspace plan/fixture commit alongside App 9289e44c to Accounts lead. Lead performs assigned independent recheck and owns brief-sb2a.md/recheck files. No further design/build work or push inferred from packaging approval. |

## Reviewed artifact
- NeoERP-BackEnd: c521bd3509c3752d2d15969167c1335c3a101084.
- NeoERP-App: 574ffe1c914b54bb66c29469ec1bf15ad270ba13.
- `NeoERP-BackEnd/docs/api/accounts-b.md` SHA256 667d88dde339c37b4d3fc913f18008454fbc1d157f91aff3c15546c09b75c261.
- `NeoERP-BackEnd/docs/api/accounts-c.md` SHA256 c0225f084a2877fb4ca8b3d3434e49df3a9753da5144a796077847f60607e86b.
- `NeoERP-App/docs/design/specs/accounts-b-c.md` SHA256 5e57bfc1f04a7f465e4f5e331336aa67ddf7f37c9a7ad31e80b36f6812788b22.
- `NeoERP-App/docs/design/screen-rig/accounts-bc.jsx` SHA256 24e4f931c51a41e460feae2bc538990e5c4f2beb7a1b2487c5734e2d0dda721a.

## Findings — 2026-10-18

Findings are in the executable design reference, not shipped B/C runtime. No production B/C implementation is claimed. The previously recorded contract decisions remain fixed.

| ID / severity | Location | Concrete reproduction and expected behaviour | Bounded correction |
| --- | --- | --- | --- |
| BC-R1 / MAJOR | NeoERP-App/docs/design/screen-rig/accounts-bc.jsx:524–528,2245–2249; credit display549,1440 | PAYMENT amount1,010 including BANK_FEE10, allocating1,000: bcMonTotals.left=20; expected0. C C-12/C-24 requires subtracting fees inside amount, unlike receipts. Wrong capacity can allocate1,020 against1,010 bank outflow. | Separate payment bank-fee sign from receipt fee and settling adjustments; use it consistently in editor, detail and credit availability. Add receipt/payment paired vectors. |
| BC-R2 / MAJOR | accounts-bc.jsx:678–684 and552–554 | Invoice100, receipt98, settlement discount2. bcPostMoney closes invoice to0 by disc on receipt allocation, creates posted CN2 without allocation from that CN; bcCredits then offers CN2 as fresh credit, refundable or usable again. Expected invoice0 and no new credit. B C-41/§7.13 step6a requires generated credit note allocated to the invoice in same transaction. | Allocate from generated CN/DN as source and avoid counting same discount twice; apply to both AR/AP. Include undo/reversal semantics already decided in B C-20 (issued discount note stays). |
| BC-R3 / MAJOR | accounts-bc.jsx:558–561 | Supplier ADVANCE100 followed by POSTED SREFUND100 with advParts pointing to it. bcAdvances still reports100 open because it sums REFUND only. Another refund/deduction remains available; balance remains wrong. C C-23/§7.11 says supplier refund consumes advance parts. | Include supplier refunds in advance use with correct party/area/status matching; test reversal restores availability and opposite party cannot consume it. |
| BC-R4 / correctness edge case | accounts-bc.jsx:502 | INPUT rate25%, deductiblePercent0, net100: bcCalcLine returns deductibleTax25 and nonDeductibleTax0. Expected0/25 under C C-21 (0–100 permitted). Falsy0 takes full-base fallback. | Distinguish absent percent from0; preserve numeric precision, including fractional percentages permitted by contract NUMERIC(5,2). Add0/50/100 and fractional vectors. |

### Reproduction evidence
Ran extracted unchanged bcDoc/bcMon/bcCalcLine/bcTotals/bcMonTotals/bcSrcUsed/bcCredits/bcAdvances/bcPostMoney/bcOpen functions under Node22 with synthetic in-memory values and stubs only for numbering, clock, role lookup, tax-code lookup and timeline/store access. No UI, server, live database or financial action. Output in minor units: PAYMENT_FEE_LEFT=2000 expected0; DISCOUNT_INVOICE_OPEN=0 but CN credit=200 expected0; SUPPLIER_ADVANCE_REMAINING=10000 expected0; ZERO_DEDUCTIBLE_TAX=2500 expected0 and NONDEDUCTIBLE=0 expected2500. These are targeted reproductions, not a full new application test suite. app.html embedded data-file accounts-bc.jsx exactly matches standalone source. Reviewed four file hashes still match pickup snapshot.

### Readiness decision and build order
Request changes to rig before full B/C package approval. Existing contracts define expected outcomes for all four; no need to reopen §18 decided questions. Shared events/file-store prerequisites are accepted (ERP-137/ERP-97); later hosted scanner/rescan gates remain separate. B's intentional deferred engine needs are assigned work, not a prior-implementation regression. SB2a owns DocumentApproval/origin, in-process source/ref/reversal, shared tax/party validators and control/two-person amendments; B SB2 builds common document math, allocations and persistence; C SC2 explicitly depends on B SB2 (document shapes follow B SB3). App SB5 mock/data work can follow approved frozen package with file-disjoint ownership; common shell/DI integrators must be assigned in build plan.

Phase2 authenticated click-through/external samples/device acceptance remain in docs/agents/accounts-phase2/plan.md. This review neither marks Phase2 accepted nor grants Phase3 implementation. No contract, spec, rig, source, migration or commits altered.

## Lead handoff — 2026-10-19
Jabran explicitly requested all findings and a prompt to Accounts lead to obtain a clear design/continuation go-ahead. Appended complete ACC-C-14 REQUEST to docs/inbox/accounts-lead.md: all four reproductions/corrections, evidence limits, explicit file ownership, one focused recheck, unchanged decisions, prior prerequisite acceptance and proposed first build checkpoint. Package hashes rechecked unchanged before sending. No other chat messaged or automation/listener created; no fixes/commits/push. Await lead reply; product/phase approval remains Jabran's.

## ACC-230 execution — 2026-10-19

Jabran explicitly instructs execution of ACC-230. Discovery/Plan: preserve decided contracts, use only allowed rig/block/plan/fixture paths; no spec change needed because the contracts already define all four behaviours. Structured Advisor self-check: money on account comes only from posted money/issued-note sources once; reversal keeps issued notes; refund consumption must match party/area/status; percentage zero is distinct from missing. Implementation stays in executable design reference.

Fixes: bcAdjustmentTotal distinguishes a payment bank fee inside the amount from receipt fees and positive settling adjustments, reused by editor/detail/credit availability; editor oldest-first capacity excludes generated discount-note credit. Generated settlement CN/DN is the source of its own invoice/bill allocation, and the receipt/payment allocates only its cash settlement. Reverse undoes the money allocation while preserving issued note and records/renders SETTLEMENT_DISCOUNT_STAYS. bcAdvances counts POSTED matching-kind/party/area refunds, including SREFUND, and reversal restores availability. Deduction uses explicit nullability and basis-point rounding, preserving0 and12.5%.

Verification command: `node docs/agents/accounts-bc-readiness/rig-regression.cjs`. Result:27 passed,0 failed. Includes payment1010/fee10/bill1000; receipt990/fee10/invoice1000; mixed fee/settling adjustment; AR/AP discount2, independent source allocation, money allocation undo, note allocation undo and reversal with warning; supplier refund/reversal, other-party/opposite-area/non-posted/wrong-kind isolation, customer refund compatibility; deductible0/50/100/12.5% of25 (0/12.50/25/3.13) and absent default; embedded equality and editor/warning integration assertions. Fixtures execute extracted actual rig functions with only environment/UI seams stubbed. Full Kotlin suites not repeated: no runtime Kotlin or backend change; no push. No visual acceptance claimed.

Packaging issue: workspace is an existing Git repository separate from NeoERP-App. ACC-230 asks one commit containing both App rig and workspace plan/fixtures, which Git cannot represent. Asked Jabran whether to create one scoped local commit per existing repository or App-only plus uncommitted workspace records. While pending, no additional workspace commit inferred. App html will be staged via a patch constructed from HEAD with ONLY the B/C block replacement; payroll working-tree changes preserved. Reviewer remains Accounts lead with fresh independent Opus recheck per ACC-230, not implementer self-signoff.

### Local App delivery and lead report
App 9289e44c94710eba126fa7805499d2ca5fdf8374 on dev-app: exact requested subject, two paths only, no trailers, no push. Staged app.html from HEAD plus B/C block-only patch; non-B/C working text matched before/after.27/27 fixtures green; pre-fix behavioural sensitivity9passed/16failed. Report ACC-C-15 contains the complete fixture output and requests assigned fresh independent recheck. Plan and fixtures cannot reside in this App commit because they belong to the separate existing workspace Git repository; packaging question pending, no second commit authorized by silence. ACC-230 is implemented/reported but not marked fully closed while that delivery detail/review remains outstanding.

### Workspace delivery approval
Jabran chose Option1 and explicitly authorized a separate existing-workspace commit titled `docs(agents): B/C readiness plan and rig regression fixture (Draft)`, containing only this plan and rig-regression.cjs. Keep brief-sb2a.md and all recheck files uncommitted, owned by Accounts lead. This resolves the earlier packaging question without changing rig, fixture or product behaviour. App commit9289e44c remains the delivered design artifact; prior27/27 verification remains applicable. No push.
