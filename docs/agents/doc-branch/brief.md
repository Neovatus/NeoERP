# BR-1: Branch on document headers (bug, found by Jabran 2026-11-08)

**Symptom.** Kystgruppe Nordic has three active branches (Oslo HQ, Bergen, Tromsø). Pay in advance → Submit for approval is refused with 422 `DIMENSION_INVALID`, and the app shows "Line ?: check its branch, stock location and cost centre."

**Cause.**
- The app never sends a document `branchId`. Contract accounts-b C-25 and accounts-c C-19 (NeoERP-BackEnd/docs/api) say a document has one `branchId`. It is required when the company has more than one active branch, defaults to the person's branch, and the server fills it when there is only one branch.
- The backend validator (`PostingValidator.checkDimensions`) raises `BRANCH_REQUIRED` with details `lines[{index, dimension, problem}]`.
- The payment wording doesn't read those details, so the message falls back to "Line ?".

## Scope (NeoERP-App, dev-app, in the checkout)

1. **Branch field.** Add a **Branch** field to the header of the invoice, bill, receipt, payment, and the credit and debit note editors (on account and from a document).
   - Show it only when the company has more than one active branch. Use the existing org/branch lookup the app already has; find it.
   - Default to the person's branch, falling back to the HQ/first branch when the person has none.
   - Send `branchId` in the draft body. Read it back from responses and round-trip it on PUT, because PUT is a full replace.
   - Changing it on a draft moves every line, so nothing on the lines changes.
   - Find out whether the receipt and payment for an allocation also take the branch (contract C §C-19, B §C-25), and follow the contract.
2. **Refusal wording.**
   - Payment, receipt, invoice, bill and note editors must read `details.lines[].index/problem/dimension` for `DIMENSION_INVALID`.
   - `BRANCH_REQUIRED` says "Pick a branch." and is attached to the Branch field.
   - Line problems name the line number. The "Line ?" text must never appear. This also closes the DIM-B backlog item "refused save uses general wording" for these editors; mark it in docs/backlog.md.
3. **Text.** New texts go into string resources as described in docs/agents/i18n/naming-standard.md, English only.
4. **Tests (commonTest).**
   - The Branch field shows only with more than one branch, and its default is the person's branch.
   - `branchId` is sent and round-tripped.
   - A `BRANCH_REQUIRED` refusal shows on the field.
   - The line index wording works.

Run targeted tests only. Commit, but do not push.

**Rules:** the same as docs/agents/quick-add/brief.md. Report to docs/agents/doc-branch/report.md.
