# QA-1: Quick add from pickers (approved by Jabran, 2026-11-08)

**Why (Jabran):** the person stays on the form they are filling in. They shouldn't have to close it, go to another page, add the record there, then come back and start over.

## The rule

1. **Where it shows.** A picker inside a form or editor gets a last row "Add “<typed text>”" (or "Add <thing>" when nothing is typed). It applies to pickers of everyday records, and only for people allowed to create that record.
   - Never in list filters.
   - Never where the record must already exist, such as a refund's payment.
2. **What opens.** A short quick-add side panel opens over the form.
   - It shows only the required fields. The typed text fills the name field.
   - The form underneath keeps its state.
   - On save the new record is picked in the field.
   - The panel has an "Open full record" link, which opens the record after save in the normal place.
3. **Same server rules.** Use the existing create endpoint, rights, duplicate checks and approvals. No bank details in quick add (ADR-018 Q1 and the building-blocks bank-details rule).
4. **Setup data is not quick-added.** This covers chart accounts, tax codes, currencies, fiscal years, number series and bank accounts. Their picker shows "Not found. Add it in <place>" as a link, for holders of the right; nothing is created inline. The account picker already does this (accounts-a1 LC-10).
5. **Built once.** One shared component plugs into `NeoSearchSelect(onAdd)`, and each record type gives its short form. Every new picker either uses quick add or states in its spec why not.

## Scope (NeoERP-App, branch dev-app, work in the checkout)

**A. Shared component.** Put it in `designsystem/` next to `NeoSearchSelect`. Its name and API are up to you; keep it plain, with no feature imports. It takes the panel title, the content slot, save/cancel and a busy/error state. Use `NeoSidePanel` conventions and the phone/tablet behaviour of the existing panels.

**B. Accounts pickers.**

| Picker | State today | Quick add fields |
|---|---|---|
| Supplier: bill editor, debit-note-on-account step, **payment editor** (new) | Opens the full `SupplierSheetHost` and ignores the typed text | Name (prefilled), plus whatever create requires (check the repo/backend) |
| Customer: invoice editor, credit-note-on-account step, **receipt editor** (new) | Same as supplier | Same as supplier |
| Cost centre, project, company dimension values in `LineDimensionPickers` | No add row | Code + name (or whatever create requires). Only with `ACCOUNTS.DIMENSIONS.MANAGE` / `COST_CENTER` create rights, and company values only when FINANCE.FREE_DIMENSIONS is on |

- Pass the typed query into the name.
- After save, refresh the picker source so the new record shows and is selected.

**C. Picker panel bug.** A typed miss shows "Nothing matches “x”." and then "No matches" again at the bottom (Jabran's screenshot, Pay in advance supplier picker). Only the first should show. Fix it in the shared select code.

**D. Docs, in this commit.**
- `NeoERP-App/docs/design/ux-principles.md` §242: replace the picker sentence with the rule above, kept short.
- `docs/design/specs/building-blocks.md`: the "Empty picker" block, plus a new "Quick add" block (component, rules 1–5).
- `NeoERP-App/AGENTS.md`: a one-line builder rule: every new picker uses quick add or its spec says why not.

**E. Text.** New texts go into string resources following `docs/agents/i18n/naming-standard.md` (workspace).
- Generic texts are core keys, for example `core_action_open_full_record` and `core_msg_quick_add_…`.
- Module texts are `accounts_…` keys.
- English only for now (I18N-2 adds nb/sv/da).
- Don't move existing hard-coded text; that is I18N-1.

**F. Tests (commonTest).**
- The add row shows only with the right, and never in filters.
- The typed text prefills the name.
- Save picks the new record and the form state is kept.
- A server refusal shows in the panel and keeps what was typed.
- The duplicate "No matches" line is gone.

Run targeted tests only. The lead runs the full suite.

## Rules

- **Commits:** one Gradle run at a time in the checkout. Don't push. Commit with `git -c user.name=jabransiddiqui -c user.email=jabransiddiqui@outlook.com commit -m "<msg>"`.
- **Forbidden:** don't touch PROJECT-STATE*.md, .local-secrets, sign-in/auth code, or the backend.
- **Done:** write `docs/agents/quick-add/report.md` (workspace) with what changed, commit SHAs, tests run, and anything left open.
