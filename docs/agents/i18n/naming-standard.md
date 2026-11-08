# App text: files and key naming standard (Approved by Jabran, 2026-11-08)

Applies to every text in NeoERP-App (`composeApp/src/commonMain/composeResources/values*/`).
I18N-1 moves this into `NeoERP-App/docs/` and into `AGENTS.md` / `ARCHITECTURE.md` so Claude and Codex builders follow it.

## 1. Two homes

| Home | What goes there | Test |
|---|---|---|
| **Core** | Words and sentences any module can use | "Would HR or Inventory say exactly this too?" Yes → core |
| **Module** | Terms that belong to one module | Only this module uses it → module |

A module key that a second module needs is **moved to core and renamed**, never copied.

## 2. File names

Same file names in every language folder (`values`, `values-nb`, `values-sv`, `values-da`).

| Kind | Pattern | Examples |
|---|---|---|
| Core | `strings_core_<group>.xml` | `strings_core_actions.xml`, `strings_core_states.xml`, `strings_core_fields.xml`, `strings_core_status.xml`, `strings_core_errors.xml`, `strings_core_format.xml` |
| Module | `strings_<module>_<area>.xml` | `strings_accounts_journal.xml`, `strings_accounts_ob_import.xml`, `strings_hr_leave.xml` |

Module codes: `accounts`, `hr`, `payroll`, `org`, `iam`, `inventory`, `sales`, `purchasing`, `platform`, `shell`.

## 3. Key pattern

All keys are lower snake_case.

- Core: `core_<kind>_<meaning>`
- Module: `<module>_<area>_<kind>_<meaning>`

The key starts with the file's scope (`core_`, `accounts_journal_`), so you can tell where a key lives from its name.

**Kinds (fixed list):**

| Kind | Used for | Core example | Module example |
|---|---|---|---|
| `action` | buttons, menu items | `core_action_save` | `accounts_journal_action_post` |
| `title` | page, section, dialog titles | `core_title_details` | `accounts_journal_title_list` |
| `label` | field labels | `core_label_amount` | `accounts_invoice_label_due_date` |
| `col` | table column headers | `core_col_status` | `accounts_ledger_col_debit` |
| `tab` | tabs | `core_tab_history` | `accounts_customer_tab_statement` |
| `step` | wizard steps | — | `accounts_ob_import_step_check` |
| `hint` | placeholder and helper text | `core_hint_search` | `accounts_ob_import_hint_file` |
| `status` | status pills | `core_status_draft` | `accounts_journal_status_posted` |
| `msg` | notices, toasts, confirm text | `core_msg_saved` | `accounts_journal_msg_post_confirm` |
| `empty` | empty states | `core_empty_nothing_yet` | `accounts_journal_empty_title` |
| `error` | refusals and validation | `core_error_offline` | `accounts_error_dimension_conflict` |
| `a11y` | screen-reader descriptions | `core_a11y_close` | `accounts_journal_a11y_line_menu` |
| `fmt` | format patterns | `core_fmt_date_range` | `accounts_report_fmt_period` |

## 4. Rules

1. **Name by meaning, not by the English text.** `core_action_open` (button) and `core_status_open` (status) are two keys. The same English word gets one key per meaning, because nb/sv/da often differ (Åpne / Åpen).
2. **No repeats.** The build check fails when two keys have the same English text. The one exception is a real difference in meaning, and the second key then carries `<!-- context: … -->`.
3. **Backend refusal codes:** `<module>_error_<code in lower case>`, e.g. `accounts_error_period_locked` for `PERIOD_LOCKED`. Shared codes (`PERMISSION_DENIED`, `FEATURE_NOT_ENABLED`) are `core_error_…`.
4. **Feature and module names** shown to users: `core_feature_<code>` / `core_module_<code>` (e.g. `core_feature_refunds_advances`).
5. **Whole sentences with placeholders.** Never glue texts together in code, because word order differs between languages. Arguments are numbered (`%1$s`, `%2$s`), and each one is described above the key: `<!-- args: 1 = company name, 2 = date -->`.
6. **Counts use `<plurals>`**, named after the counted thing: `accounts_journal_msg_lines` (one / other). Never write "1 lines" or "line(s)".
7. **No abbreviations in English** ("Amount", not "Amt"). Leave about 30% extra room in layouts, because Norwegian, Swedish and Danish are often longer.
8. **No text in Kotlin code.** Screens and view models use keys only; the build check fails on new hard-coded UI text.
9. **Every key exists in all four languages** (en, nb, sv, da) in the same commit, from I18N-2 onward. If a key is missing, the app falls back to English, and the build check also fails.
10. **Delete unused keys** in the same change that stops using them.

## 5. Moving today's keys

Today's 2,200 keys (mostly `strings_accounts_*`, with a mix of patterns) are renamed in I18N-1 with a script: one rename map, keys and all their uses in code changed together, and the old names removed. Generic words found in module files (Save, Cancel, Edit, Delete and Back, about 18 copies today) are merged into core.
