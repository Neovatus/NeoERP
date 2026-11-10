# Opus review: I18N-1b rename map (e949160a, e332652c) — 2026-11-09

**Verdict:** go, once H1 and H2 are in the apply commit. Fold M1–M4 into rename-overrides.csv and fix M5 in rename.py before you apply.

## High
- **H1. Two English changes break tests.** Update the assertions, preferably through `.en()`.
  - The apostrophe in `core_title_no_access_to_this` affects:
    - NeoFailureMapperTest:45
    - JournalsAccessTest:189
    - JournalsListStateTest:389,441
    - NeoPageStatesUiTest:55
    - PeoplePageStateTest:32,69
    - JournalsListScreenTest:347
    - StandardRolesPageStateTest:49
    - check NeoPageStateRulesTest:109
  - Retry→Try again (`neo_offline_retry` → `core_action_try_again`) affects:
    - NeoOfflineStripTest:14
    - PeoplePageStateTest:83
    - CPUI3OrganizationRenderTest:52,71
    - RolesPageStateTest:155
    - JournalsListScreenTest:372
    - PeopleSheetsPageStateTest:144
- **H2. Nothing writes new-core-translations.csv.** Add an `apply-translations` step. It creates values-{nb,sv,da}/strings_core_status.xml and strings_core_features.xml and turns `core_fmt_status_count` "one: … | other: …" into `<plurals>`.

## M1. Missed merges
- `core_status_offline` (4 module titles + picker) → merge into `core_title_offline` ("You’re offline").
- `core_action_send_for_approval` (from `accounts_sir_confirm_history_button`) and `core_action_submit_approval` → one key `core_action_submit_for_approval`, "Submit for approval".
- `core_status_read_only_short` ("Read only") → `core_status_read_only`.
- `core_error_no_answer` ≡ `core_error_server_unreachable` → keep one.
- `core_error_our_side` ≡ `core_error_server_failed` → keep one.
- `accounts_writeoff_source` → (was `accounts_writeoff_fmt_open_named`) is the button "Open INV-1" (SalesDocumentDetailScreen.kt:385) → merge into `accounts_common_action_open_named`. Its distinct note is wrong.
- `accounts_refund_tl_reversed` → (was `accounts_common_status_tl_reversed`) has the same English and kind as `accounts_common_status_reversed` → merge. Its note "…is the tab" is wrong.
- `accounts_refund_label_transfer_account` and `accounts_common_label_account` are both the label "Account" → merge.
- Pairs that differ only by a full stop or similar → merge:
  - `accounts_common_title_refresh_failed` / `accounts_supplier_refund_title_refresh_failed`
  - `accounts_dimension_hint_company_dimension` / `accounts_dimension_msg_setup`
  - `accounts_sie_import_msg_vouchers_unbalanced_unknown` / `accounts_sie_import_title_unbalanced`
- Pairs that differ only by capitals → merge in sentence case:
  - `core_title_audit_log` "Audit Log" / `core_title_audit_log_menu` "Audit log"
  - `core_title_self_service` "Self Service" / `core_feature_self_service` "Self service"
  - `core_title_platform_admin` "Platform Admin" / `core_label_role_platform_admin` "Platform admin"
  - `core_title_sign_in` "Sign In" → sentence case

## M2. Wrong kind
- These are sentences, so → `_msg_`:
  - `accounts_dimension_title_delete_dimension_confirm`
  - `accounts_dimension_title_deactivate_confirm`
  - `accounts_dimension_title_reactivate_confirm`
  - `accounts_dimension_title_delete_confirm`
  - `accounts_dimension_title_deactivate_dimension_confirm`
- `accounts_sie_import_error_file_checking` ("Checking the file") is a status, not an error.
- `accounts_common_status_tl_*` and `accounts_fiscal_status_tl_rejected`: `tl` → `timeline`.

## M3. Wrong home
- `core_title_write_offs` is only a receivables filter option (ReceivablesUiParts.kt:99) → `accounts_invoice_label_type_write_offs`; sv "Avskrivningar", da "Afskrivninger".
- `accounts_dimension_status_starts` is also used by fiscal (from `accounts_fbr_settings_upcoming`) → `accounts_common_status_starts`.
- SIE-import keys merged into `accounts_ob_import_*` → `accounts_common_*`. This applies to status_chosen, status_needs_account, status_new_account, status_remembered, status_ready_to_check, step_check, col_in_file, label_confirmed, title_discard, and every other key both areas use.
- `accounts_sie_import_error_no_access` is also used by year actions → `accounts_common_error_no_access`.
- `core_label_quote_change` now also heads the statement Change column (from `accounts_st_col_change`) → rename to `core_label_change`.

## M4. Dismiss on the year card
`accounts_yc_dismiss` (YearCard.kt:223, a warning notice) keeps its own key `accounts_year_action_dismiss_notice`, "Dismiss". The other five Dismiss→Close merges are fine.

## M5. Script: section comments
Section-header comments stay in the source file. Only `args:` and `distinct:` comments travel with a moved block.

## Low
- Running apply twice changes comments again (`accounts_sie_import_*` → `accounts_sie_import_import_*`): skip a match already followed by the target.
- About 94 English strings still use a straight apostrophe → normalise all of them to ’. This includes `core_msg_feature_off_{suspended,inactive,branch_inactive}`.
- `core_fmt_value` (`%1$s`, 4 merges) → remove it and pass the value directly.
- Show-more keys:
  - `core_action_show_more` ("Show %1$d more · %2$d remaining") → `core_action_show_more_count`
  - `core_action_show_more_rows` ("Show more") → `core_action_show_more`
- Drop the `_short` suffixes (`core_title_not_available_yet_short`, `core_msg_file_saved_short`, `core_title_session_expired_short`) and the module `_unknown` suffixes (e.g. `accounts_sie_export_error_too_large_size_unknown`). Name each key by its meaning.
- Counts that should be `<plurals>`:
  - `core_label_{minutes,hours,days,weeks,months,years}_ago`
  - `accounts_report_fmt_line_count`
  - "%2$s files" in `core_error_file_count_limit`
  - `accounts_party_fmt_days_*`
- Glued fragments in core → whole sentences: `core_label_your_company`, `core_label_picker_drop_one`/`_many`, `core_label_picker_any_file_type`.
- Capitals → sentence case: "CHANGE" (`core_label_change_overline`), "TIP" (`core_label_tip`), "PREVIEW MODE", "ROLE PREVIEW", "Pending Setup", "On Leave", "Choose a Role to Preview".
- Old key names in docs: 13 mentions in 7 files under docs/modules/accounts/*.md and docs/agents/*.

## The distinct pairs
**Merge these** (same meaning, same nb/sv/da):
- `core_fmt_join_dot` ↔ `core_fmt_module_chip`
- `core_hint_description` → `core_label_description`
- `accounts_dimension_title_values` / `core_col_values`
- `accounts_fiscal_title_card` / `accounts_fiscal_label_filter_fbr`
- `accounts_common_title_advances` / `accounts_common_label_advances`
- the three "SIE" keys; the three "SIE file" keys
- `core_a11y_close` → `core_action_close`
- "Held out" ×3
- `accounts_report_label_kind_{profit_loss,balance_sheet,cash_flow}` ↔ the `tab_*` keys
- `accounts_year_end_title_close` / `step_close_year`
- `accounts_year_title_year_end_named` / `accounts_journal_fmt_source_year_end`
- `core_feature_period_close` / `core_title_period_close`
- `core_label_approved` / `core_status_approved`
- `core_tab_all` / `core_label_all`
- `core_label_art_*` ↔ `core_feature_*` (Receivables, Payables, Payslips)

**Wrong notes:**
- `accounts_writeoff_fmt_open_named` and `accounts_common_status_tl_reversed` are not distinct (see M1).
- `accounts_sie_import_step_accounts` means ledger accounts: compare it with `accounts_common_label_ledger_accounts`, not with the module.

**Rightly distinct (keep):**
- `accounts_common_label_open_amount`
- `accounts_common_label_ledger_accounts` vs the module
- `accounts_common_tab_posted` vs the status (sv plural)
- `accounts_common_col_draft_number`
- `accounts_home_label_company_unknown`
- `core_status_open`; `core_step_done` / `core_status_done`; `core_step_confirm`
- `accounts_report_label_sub_revenue` / `sub_inventory` vs the module names
- `accounts_supplier_advance_status_advance`
- the counted `create_submit_journals`
- `core_feature_payroll` / `finance` vs the module names

## Translation fixes (new-core-translations.csv)
- Drop the rows for keys merged away: `core_action_send_for_approval`, `core_status_read_only_short`, `core_hint_description`.
- `core_step_done` sv: "Klar".
- `core_title_write_offs`, now accounts: sv "Avskrivningar", da "Afskrivninger".
- `core_fmt_export_expires` sv: "Går ut %1$s".
- `core_error_amount_example`:
  - nb "Skriv inn et beløp, for eksempel %1$s."
  - sv "Ange ett belopp, till exempel %1$s."
  - da "Angiv et beløb, for eksempel %1$s."
- `core_error_file_count_limit`, first sentence:
  - nb "Du kan legge til %1$s flere."
  - sv "Du kan lägga till %1$s fler."
  - da "Du kan tilføje %1$s flere."
- `core_error_picker_no_access` sv: "Du har inte åtkomst till att lägga till en fil här."
- `core_action_collapse_all`: nb "Skjul alle", sv "Komprimera alla", da "Skjul alle". Add glossary rows for Expand all and Collapse all.
- Optional: `core_status_closed` uses the year/period wording; give generic "Closed" its own key only if a module needs it.
