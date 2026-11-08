# BR-1 report: Branch on document headers

Builder: Sonnet 5.5. Repo: NeoERP-App, branch dev-app. Commit: **fe7594e9** (on top of dd924421, the quick-add review fixes; not pushed).

## Cause (confirmed)
1. The app never sent `branchId` on any document (no field in the bodies, models or editors).
2. The "Line ?" text had a second cause: `AccountsA2Transport.refusal` (used by invoices, bills, receipts, payments, notes) never read `details.lines[]` for `DIMENSION_INVALID`. Only the journals API did. So the wording found no lines and printed "Line ?".

## What changed
- **Wire.** `branchId` added to the invoice, bill, receipt and payment bodies and detail DTOs, the domain drafts and details, and the mappers. PUT sends the held branch, so it round-trips (a full replace). The mock repositories round-trip it too.
- **Lookups.** `ReceivablesLookups.branches()` and `PayablesLookups.branches()` return `DocumentBranches(options, personBranchId)`. `AccountsRoute` feeds them from the existing `orgDimensions` loader and `selectedBranchId` (the same source as the journal editor's default branch).
- **Field.** New shared `DocumentBranchField` (core label `core_label_branch`). Shown only when more than one active branch. Default: the person's branch, else the first (head office) branch. A saved branch is kept as loaded. Changing it on a draft changes nothing on the lines. Added to the invoice, bill, receipt and payment headers. The branch is Org setup data, so the picker has no quick add (rule 4 of building-blocks "Quick add").
- **Refusal wording.**
  - The transport now keeps `details.lines[].index/problem/dimension` for `DIMENSION_*` codes. A draft-save refusal that names the header's own branch with no line index (`lines[{field: branchId, problem: BRANCH_INVALID}]`) is read into `JournalErrorDetails.headerProblem`.
  - `ReceivablesRefusals` (used by receivables and payables, so also payments and bills) puts `BRANCH_REQUIRED` on the Branch field as "Pick a branch." and `BRANCH_INVALID` as "That branch is closed. Pick another." Other problems read "Line n: ...". A refusal with no line never says "Line ?".
  - After a refused submit, the editors show the notice and also mark the Branch field.
- **Strings (English only, naming standard).** `core_label_branch` in `strings_core_fields.xml`; `accounts_error_branch_required`, `accounts_error_branch_invalid`, `accounts_error_branch_note` in `strings_accounts_errors.xml`, read through `AccountsErrorWords`.
- **Docs.** `docs/backlog.md` DIM-B item (1) marked done (workspace file; I edited it but did not commit it, because the workspace backlog also holds another agent's uncommitted QA-1 lines).

## Contract findings (what the backend actually takes)
Checked in accounts-b C-25, accounts-c C-19 and the controllers' allowed-key sets:
| Document | Takes `branchId` in its body? |
|---|---|
| Invoice, bill, receipt, payment | Yes (create and PUT). Server checks it is active (`DIMENSION_INVALID`, `BRANCH_INVALID`, no index). |
| Credit note and debit note **from a document** | No key allowed. The server copies the invoice's or bill's branch. |
| Credit note and debit note **on account** | No key allowed. `DebitNoteDraftService.onAccount` and `ArDocumentDraftService` call `branch(null, facts)`, which fills a branch only when the company has exactly one active branch. |
The receipt's and payment's allocations take the document's branch (C-25: allocation across branches of one customer is allowed; no separate branch on an allocation).

## Deviation from the brief, and an open question for the lead
The brief asked for a Branch field on the note editors. I did **not** add one: the note bodies' allowed keys exclude `branchId`, so sending it would be a 400. Instead a branch refusal on a note editor is shown as a notice ("A note takes the branch of its invoice or bill. A note on account can't pick one yet, so it can't be sent while the company has several branches.").
**This is a real backend gap.** An on-account credit or debit note in a company with 2+ branches has no branch, so `checkDimensions` refuses it with `BRANCH_REQUIRED` at submit/approve, and the person cannot fix it. It needs a backend change (accept `branchId` on `POST/PUT /credit-notes` and `/debit-notes` for the on-account subtype, default the person's branch). When that lands the app change is small (the same field and the same fields on the two drafts). I did not touch the backend.

## Tests
New: `commonTest/.../receivables/DocumentBranchTest.kt` (11) and `commonTest/.../payables/DocumentBranchTest.kt` (8), plus 3 parity assertions in `jvmTest/.../AccountsErrorWordsTest.kt`.
Covered: field shows only with several branches; default is the person's branch, then head office, then a closed or unknown person branch falls to head office; `branchId` sent on invoice, bill, receipt, payment (create and PUT) and read back; a change moves the document and leaves lines alone; `BRANCH_REQUIRED` shows on the field for invoice, bill and payment (submit refused, draft kept, cleared on pick); header `BRANCH_INVALID` without an index; line index wording for payment and bill, never "Line ?"; note editors get a notice.

Run (one Gradle run, jvmTest, targeted): DocumentBranchTest (both), AccountsErrorWordsTest, InvoiceEditorViewModelTest, PaymentEditorViewModelTest, ReceiptEditorViewModelTest, BillEditorDimensionsTest, JournalWordingTest, PayablesRefusalsAndReferenceTest, PaymentRefusalsAndDtoTest, ReceiptRefusalsAndDtoTest, NoteEditorsDimensionsTest, DimensionReviewFixesTest, AdvancePaymentStateTest, BillsAndDebitNotesTest, AccountsDtoTest, QuickAddTest. All pass. Full suite not run (lead runs it).

## Notes
- The compose resource accessors had to be regenerated (`generateComposeResClass`, `generateResourceAccessorsForJvmMain`, `--rerun-tasks`) before the first compile, because the new strings were not in the generated code. Kotlin compile needed no extra heap.
- Mid-task the reviewer's uncommitted quick-add edits sat in the same tree and briefly broke the compile; they were then committed as dd924421. My commit contains only BR-1 files.
- Not done: no Compose UI test for the field itself (rule and view-model tests only, as for the rest of the editors). Opening invoices/bills have no editor, so nothing to change there.

## Review fixes (Opus review, second commit)
Commit: see the SHA in the reply (on top of fe7594e9). Not pushed.
- **H1.** `DocumentBranches.toSend(held)`: field shown sends the picked branch; exactly one active branch sends null (the server fills it, like the journal editor); no options at all (Org unread) keeps the held branch so a several-branch draft is not cleared. All four editors use it. A refusal aimed at the Branch field while it is hidden becomes a notice (`ReceivablesRefusals.placed`), on invoice, bill, receipt and payment, at save and at submit. Tests: Org unread (payment: notice, held branch kept on save) and stale branch with one branch left (payment and invoice: null sent, server fills), plus the hidden-field invoice notice.
- **M1.** The transport marks refusals of `submit` and `approve` posts as posting-time (`JournalLineProblem.onForm = false`); their index counts journal posting lines. Those line problems are worded without a number ("A tag value was removed or doesn't fit its tag. Pick it again."); branch problems still go to the Branch field. Draft-save refusals keep "Line n" (checked in the backend: ArDocumentRules:582, BillRules:893, DraftDimensionCheck and WireDimensions use document line positions). The old test that asserted numbering at posting was replaced by tests of both cases.
- **L1.** The shell's "global" never matches a branch option, so it falls to the first branch (test added; the "first = head office" assumption stays: Org has no head-office flag).
- **L2.** The parser also matches `defaultBranchId` (journal header refusal).
- **L3.** A closed branch on a receipt or payment adjustment goes to that adjustment (`adj.<key>`) when the header branch is a valid option, there is no header problem, and an adjustment holds a branch no longer offered.
- **L5.** Key renamed to `accounts_error_branch_on_note`.
- Left as asked: L4 (waits for BR-2), L6, L7. L8: backlog.md edit still uncommitted for the lead.
Tests (one jvmTest run, JAVA_HOME jbr-21.0.7): both DocumentBranchTest classes, AccountsErrorWordsTest, InvoiceEditorViewModelTest, PaymentEditorViewModelTest, ReceiptEditorViewModelTest, BillEditorDimensionsTest, JournalWordingTest, PayablesRefusalsAndReferenceTest, PaymentRefusalsAndDtoTest, ReceiptRefusalsAndDtoTest, NoteEditorsDimensionsTest, DimensionReviewFixesTest, AdvancePaymentStateTest, BillsAndDebitNotesTest, AccountsDtoTest, PayablesDtoTest, ReceivablesDtoTest. All pass.

## L4 (BR-2 app side)
On-account credit and debit note editors now hold `branches`/`branchId`, show `DocumentBranchField` (only on account, with several branches), send `branches.toSend(branchId)` on create and every PUT, and read it back. Notes from an invoice or bill still send no `branchId` (bodies unchanged). The temporary note notice and its key (`accounts_error_branch_on_note`, `branchOnNote`, `ReceivablesRefusals.onNote`) are removed; branch refusals use `placed(...)` and also mark the field after a refused submit. A closed branch copied from the source document on a from-document note shows as a notice, since there is no field. Mocks round-trip `branchId` on on-account notes. Tests added to both DocumentBranchTest classes: default/send/round-trip, one-branch stale not sent, BRANCH_REQUIRED on the field, from-document bodies have no branchId. Targeted jvmTest run (DocumentBranchTest x2, AccountsErrorWordsTest, NoteEditorsDimensionsTest, BillsAndDebitNotesTest, CreditAndDetailTest, JournalWordingTest, Payables/Receivables Dto, refusal tests, invoice/payment/receipt editor tests) passes.
