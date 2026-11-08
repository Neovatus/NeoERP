# BR-2 backend review (Opus), commit 5f8e66a, 2026-11-08

Scope: `git show 5f8e66a` in NeoERP-BackEnd (dev). Read-only review; tests not re-run (the code paths were clear from reading).
Accepted deviations (lead): no refusal at draft save (submit/approve only, as invoices/bills); `branchId` on a from-document note is 400 unknown key.

**Verdict: accept.** No High findings. One Medium test gap; the rest are Low doc/test polish.

## Checks

- **Tenant isolation: OK.** Both helpers check the given id against `facts.branches` from `orgFacts.require(scope.companyId)`, the caller's own company only (`ArDocumentDraftService.kt:598-611`, `ApDocumentWrites.kt:124-139`). Another company's branch is not in that list, so it gets 422 `DIMENSION_INVALID` / `BRANCH_INVALID`, the same as an unknown id.
- **Branch checks: OK.** An inactive branch is refused: the helper filters `active` first. With one active branch and none given, the server fills it in (`active.singleOrNull()`). This is the same helper invoices (`ArDocumentDraftService.kt:154`) and bills use.
- **PUT replace: OK, and the same as invoices.** `updateCreditNote` (`ArDocumentDraftService.kt:268`) and `DebitNoteDraftService.update` (`:134`) rebuild from the body through `onAccount → branch(input.branchId, facts)`, as `updateInvoice → build → branch(input.branchId, facts)` does (`:117`, `:154`). So a PUT without `branchId` clears the branch in a multi-branch company, and refills it in a single-branch one. Invoices behave exactly the same, so nothing differs. A from-document note's PUT goes through `creditNote`/`fromBill`, which always copies the source's branch (`:325`, `DebitNoteDraftService.kt:187`). The controller picks the from-document parser for those (`ReceivablesControllers.kt:347`, `DebitNoteController.kt:99`), so `branchId` is 400 there.
- **Posting: OK (unchanged shared path).** Notes post through the same approval services as invoices and bills, with `defaultBranchId = document.branchId` (`ArDocumentApprovalService.kt:168`, `ApDocumentApprovalService.kt:148`). The engine applies it to every branch-tagged line, the AR/AP control line included, exactly as for invoices. Line-level branches are still handled by `WireDimensions.documentLines` against the note's branch (`WireDimensions.kt:103-113`), as for invoices.
- **Locking and migrations: OK.** Org facts are fetched before the transaction, and the branch check is pure (no I/O, no locks). The lock order is unchanged, and the commit has no migration (the document `branch_id` column already exists).

## High

None.

## Medium

- **M1. Posting is not asserted for notes.** `OnAccountCreditNoteBranchTest.kt:28` and `OnAccountDebitNoteBranchTest.kt:26` check only `status == POSTED`. No test shows that the journal lines carry the note's branch, the AR/AP control line in particular, which this review was asked to confirm. The code is right because it is the shared invoice path, but one assertion would lock it in. The pattern to follow is `DocumentDimensionsApiTest.kt:45`: select `l.branch_id` from `accounts.journal_lines` for the posted journal and assert that every line, the control line included, equals `branch`.

## Low

- **L1. A PUT without `branchId` clears the branch, and no test covers it.** `OnAccountCreditNoteBranchTest.kt:31-33` and `OnAccountDebitNoteBranchTest.kt:28-30` cover a PUT that changes the branch only. Add a PUT with no `branchId` on a multi-branch draft that expects `branchId == null`. That is the invoice behaviour, and it shows the client must resend the branch on every PUT.
- **L2. The docs don't say that PUT replaces the branch.** `docs/api/accounts-b.md:1523-1531` and `docs/api/accounts-c.md:804-808` say "none given with more than one active branch: the draft saves with no branch". They should add that this also applies to a PUT, which clears an existing branch (whole-document replace, as invoices). Otherwise a client may expect the PUT to keep it.
- **L3. The body shapes in the docs still lack `branchId`.** The JSON shapes in `docs/api/accounts-b.md:1561-1563` (§7.11 on-account credit note) and `docs/api/accounts-c.md:796-799` (§7.8 on-account debit note) leave it out. The new paragraph below each one covers it, but the brief asked for the body key tables to be updated. The KDoc body summaries in `ReceivablesBodies.kt:245` and `BillBodies.kt:118` also leave out `branchId`.
- **L4. The accounts-b.md text mentions a path that is not built yet.** `docs/api/accounts-b.md:1529-1531` says a credit note "made from an invoice or opening item always copies the source's branch". `POST /credit-notes/opening/{id}` (C-44) is not built yet (no endpoint exists; `DebitNoteDraftService.kt:38` lists it as not built). The text is right as a rule, but say "(when built)" or drop "opening item" until C-44 lands.
- **L5. No test uses a real other-company branch.** `OnAccountCreditNoteBranchTest.kt:58` and `OnAccountDebitNoteBranchTest.kt:50` use a random UUID. That is the same code path, so it is acceptable. A second company in the harness would make the tenant-isolation case explicit (optional).
