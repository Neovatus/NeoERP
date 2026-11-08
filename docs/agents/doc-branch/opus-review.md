# BR-1 review (Opus): fe7594e9, NeoERP-App dev-app

Read-only review. No Gradle was run. Checked against the brief, the report, accounts-b C-25 and its Branch rule, accounts-c C-19,
`PostingValidator.checkDimensions`, the save-time branch checks (`ArDocumentDraftService:605`, `ReceiptRules:449`,
`ApDocumentWrites:134`, `PaymentRules:475`) and the controllers' allowed-key sets.

**Verdict: fix H1, then merge.** The wire work is correct. `branchId` is in the invoice, bill, receipt and payment bodies,
including the advance payment and advance receipt. It is read back and sent on every PUT. The only PUT callers are the four
editors, and nothing else on the drafts changed: lines, dimensions, itemId and tax overrides take the same paths as before.
The header `{field: branchId, problem: BRANCH_INVALID}` with no index is read. The journal line wording has not regressed.
No architecture rule is broken.

## High

**H1. A branch refusal while the Branch field is hidden is silent on payments and receipts. On every editor's draft save it is a dead end.**
- Where:
  - `presentation/payables/PaymentEditor.kt:551` and `presentation/receivables/ReceiptEditor.kt:570` put a `RefusalPlace.Field`
    refusal into `fieldErrors["branch"]` and set `notice = null`.
  - `InvoiceEditor.kt:576` and `BillEditor.kt:759` do the same on the draft-save path.
  - `DocumentBranchField` draws only when `branches.visible` (`DocumentBranches.kt:17`).
  - So when the field isn't on the page, nothing on the page shows the words.
- Failure 1, Org can't be read:
  - The person opens Pay in advance at Kystgruppe Nordic (3 branches) while the Org overview read fails or returns no company
    (a network error at panel open; `SetupPayablesLookups.branches` catches it and returns `NONE`).
  - Then `branches = NONE`, the field is hidden and `branchId = null`. `PaymentRules` saves the draft with no branch, because
    `singleOrNull` of 3 is null.
  - Submit gets 422 `DIMENSION_INVALID / BRANCH_REQUIRED`, and the panel clears `busy` and shows nothing at all.
  - This is the reported flow: "Line ?" has become silence.
  - On the invoice and bill the submit path shows "Draft X saved. Pick a branch." with no field to pick from.
- Failure 2, stale branch:
  - A draft was saved with branch B while A and B were both active. B is then closed, so A is the only active branch.
  - On load, `branchId = d.branchId ?: …` (`InvoiceEditor.kt:191`, `BillEditor.kt:257`, `ReceiptEditor.kt:237`,
    `PaymentEditor.kt:217`) keeps B. The field is hidden because only one branch is active, and the PUT sends B.
  - The save-time check refuses `BRANCH_INVALID` (header, no index). The editor sets `fieldErrors["branch"]` with no notice,
    so the save silently does nothing, and it does so on every retry.
  - So with one branch, a stale branch **is** sent.
- Fix:
  - (a) When `!branches.visible`, send `branchId` only if it is one of the options. With exactly one active branch, send null
    and let the server fill it, as the journal editor does at `JournalEditorRules.kt:329`
    (`defaultBranchId.takeIf { hasSeveralBranches }`). Keep the loaded id only when the lookup failed (`NONE`), so a
    multi-branch draft isn't cleared.
  - (b) When a refusal targets `BRANCH_FIELD` and the field is not visible, show it as a notice.
  - (c) Add a test for each of these two cases. The current tests only use `DocumentBranches(three, …)`, where the field is
    shown.

## Medium

**M1. "Line n" on a document at submit or approve uses the journal's line number, not the form's.**
- Where:
  - `PostingValidator.checkDimensions` reports `index` over the **posting lines**. For an advance payment
    (`SupplierAdvanceRules.kt:296–327`) these are: bank CR first, then per advance line the carrying line, plus a tax line when
    tax is deductible.
  - The new transport mapping (`AccountsA2Transport.kt:152`) passes these through to `AccountsWording.journalRefusal`
    (`AccountsWording.kt:401`, `lineNo()` = index + 1).
- Failure:
  - Two advance lines, the first with deductible VAT, and the second line's cost centre closed. The server sends
    `index: 3`, and the panel says "Line 4: that cost centre is off." The form has two lines.
  - Index 0 (the bank or control line) would read "Line 1" for a line the person never typed.
  - Before this commit the text was "Line ?"; now it is a confident wrong number.
  - The test `aPayInAdvanceRefusalReadsTheLineIndex…` (payables `DocumentBranchTest.kt:117`) asserts this numbering, so it
    locks the behaviour in.
- Note: the draft-save checks (`ArDocumentRules:582`, `BillRules:893`) use document positions, so one code has two index
  spaces.
- Fix (either):
  - for posting-time refusals on documents, word the line problems without a number (`dimensionInvalid` /
    "A line's cost centre is off."); or
  - ask the backend to map posting indices back to document lines. This is a backend item and should be logged next to BR-2.

## Low

- **L1. The person's branch is the shell's selected context, not the person's home branch.**
  - Where: `AccountsRoute.kt:823/853` pass `selectedBranchId` = `context.branchId` (`NeoSmartContentArea.kt:337`). It can be
    the `"global"` sentinel (`AuthSessionMapper.kt:82`).
  - In practice the default then falls back to the first branch, which is the same rule the journals use, so this is
    acceptable.
  - "First = head office" assumes Org order. The app's branch model has no head-office flag, so a company whose HQ is not
    first defaults to another branch. Write this assumption down, or ask Org for a flag.
- **L2. The journal's header branch refusal still gets the generic words.**
  - `JournalsMapper.kt:259` matches `field == "branchId"` only. `JournalDraftService:507` sends `field: "defaultBranchId"`.
  - So a journal saved with a closed default branch now reads "A tag value was removed or doesn't fit its tag. Pick it again."
  - That is better than "Line ?" and not a regression, but it is not "That branch is closed. Pick another." Matching
    `defaultBranchId` as well would fix it.
- **L3. Branch problems on adjustments go to the header field.**
  - Where: `ReceivablesSupport.kt:207` `branchRefusal` sends **any** `BRANCH_*` problem in `lines[]` to the header Branch
    field.
  - Receipt and payment adjustments keep their own `branchId` (Branch rule, last sentence). A closed branch on an adjustment
    would mark the header field, which is already correct.
  - This is rare (the adjustment pickers don't offer branch today), but limit it to header problems, or problems with no
    other branch source.
- **L4. Note editors have no Branch field, and the refusal becomes a notice.**
  - Where: `ReceivablesRefusals.onNote` (`ReceivablesSupport.kt:222`). This is reasonable while BR-2 runs.
  - The text "…A note on account can't pick one yet…" is also shown for a note **from a document** whose invoice's or bill's
    branch was closed since (`BRANCH_INVALID`). There it is misleading: the cause is the closed branch, not the note type.
  - BR-2 is in the backend working tree (uncommitted): `ON_ACCOUNT` keys now include `branchId` in `BillBodies.kt` and
    `ReceivablesBodies.kt`. When it lands:
    - the on-account note editors must hold and send `branchId` on every PUT (full replace);
    - this temporary string must be removed.
  - Add it to the BR-2 follow-up.
- **L5. One key name doesn't fit the naming standard.**
  - `accounts_error_branch_note` (`strings_accounts_errors.xml:16`) is not a refusal code (standard rule 3), and `_note`
    reads like an English word, not a meaning.
  - Suggest `accounts_error_branch_on_note` (or `accounts_note_msg_branch_unavailable`).
  - `core_label_branch`, `accounts_error_branch_required` and `accounts_error_branch_invalid` follow the standard.
- **L6. The view models never read the new XML strings.**
  - Where: `ReceivablesRefusals.branchRefusal` / `onNote` use `AccountsErrorWords()` defaults (hard-coded English). The XML
    strings reach users only through the composable `accountsErrorWords()`.
  - The parity test keeps them equal in English, but nb/sv/da translations won't show here.
  - This is the existing pattern; note it for I18N-1.
- **L7. The new branch reads catch cancellation.**
  - Where: `runCatching { orgBranches(companyId) }` (`PayablesSupport.kt`, `ReceivablesSupport.kt`) and
    `runCatching { lookups.branches(…) }` in the payment and receipt editors.
  - These swallow `CancellationException`. This is the same as the neighbouring lookups and does no harm here.
- **L8. The backlog edit is not committed.** The DIM-B (1) backlog mark is in the uncommitted workspace `docs/backlog.md`. The
  lead should commit it with the BR-1 push.

## Checked and fine

- **Bodies and PUT.** `branchId` is in all four create and PUT bodies, and the advance payment body too
  (`PaymentEditor.kt:419` and the ordinary payment at 430).
  - Document lines and advance lines still strip the line branch, as the Branch rule requires.
  - The mocks round-trip it.
- **Default branch.** It is applied only to a new draft (`takeIf { draftId == null }`). A loaded draft keeps what was saved.
- **Changing the branch.** It touches only the header (`setBranch`), and it clears the field error and the notice.
- **Refusal parsing.**
  - `details.lines[]` is read with `index/problem/dimension`.
  - A header entry with no index is kept out of `lines` and read into `headerProblem`.
  - `DIMENSION_INVALID` with no line never says "Line ?" (`AccountsWording.kt:436`).
  - `DIMENSION_CONFLICT` already guards with `takeIf { first() != null }`.
- **Journal refusal wording.** The line branch is unchanged, and `JournalWordingTest` is in the run set.
- **Architecture.** There is no Koin below di: Org comes in as a lambda from the routing boundary. There is no Compose in
  view models: `DocumentBranches` is plain `@PresentationState`, and `DocumentBranchField` is a screen composable.
- **Branch picker.** It has no quick add, which is correct: branches are Org setup data.
