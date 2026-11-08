# BR-2: Branch on on-account credit and debit notes (backend, found in BR-1, 2026-11-08)

**Gap.** In a company with more than one active branch, an on-account credit note (`POST/PUT /credit-notes`) or debit note (`POST/PUT /debit-notes`) gets no branch. The server sets it with `branch(null, facts)`, which fills one only when the company has exactly one branch. The allowed body keys exclude `branchId`, so a client can't send one. The note is then refused with `BRANCH_REQUIRED` at submit or approve, and the person can't fix it. Contract accounts-b C-25 / accounts-c C-19: a document has one branch, required when there is more than one active branch.

## Scope (NeoERP-BackEnd, branch dev, in the checkout)

1. **Accept `branchId`** on the on-account create and update bodies for credit notes (ArDocumentDraftService) and debit notes (DebitNoteDraftService). Apply the same rules as invoice and bill:
   - required with more than one active branch: refuse at draft save, exactly as the invoice does;
   - filled by the server when there is one branch;
   - an inactive branch refused as for invoices.
2. **Notes made from a document keep copying the source's branch.** A `branchId` sent there that differs from the source is refused, the same as the line rule (422 `DIMENSION_INVALID`, `dimension: branch`), or ignored if that is what invoices do; follow the existing pattern and say which.
3. **No migration if the column already exists**; check first. Migrations already applied are frozen.
4. **Docs:** update the C-25 / C-19 note and the body key tables in `docs/api/accounts-b.md` and `docs/api/accounts-c.md`.
5. **Tests:** multi-branch on-account notes with and without a branch, single-branch default, inactive branch, and from-document copy. Run targeted tests only (one Gradle run at a time).

**Rules:**
- Commit, don't push. Commit with `git -c user.name=jabransiddiqui -c user.email=jabransiddiqui@outlook.com commit -m "<msg>" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"`.
- Don't touch PROJECT-STATE*.md, .local-secrets, auth or sign-in code.
- The services are running locally; don't restart them.
- Report to docs/agents/doc-branch/report-be.md.
