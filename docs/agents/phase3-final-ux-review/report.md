# Accounts Phase 3 app screens — final UX/design review (2026-11-06)

Read-only Opus review of NeoERP-App dev-app 10422873 (no Gradle). Paths relative to
`composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/features/accounts/presentation/` unless noted.
Rules: neoerp-tokens.json, building-blocks.md, ux-principles §6/§15/§21–24, screen-standard, specs accounts-ob-import /
accounts-opening-items-import, FE plan §2.5 (approved), RULES.md.

All 3 Must + 14 Should from docs/agents/m5-payables-ux-review/report.md are fixed (N9 translations still open).

## Verdict per screen
| Screen | Verdict |
|---|---|
| OB import steps File / Check / Accounts / Confirm, result page, list | Approve with fixes (S8–S17, N1–N5) |
| OB → opening-items hand-off | Approve |
| OB → SIE wizard hand-off | Approve with fixes (S16, S17) |
| Feature-off pages | Approve with fixes (S1–S5) |
| Feature-off in-page actions | **Changes required** (M1, M2, S6) |
| Company → Modules labels | Approve with fixes (S7) |
| AP refunds received; AP advance screens | Approve |
| AR refund editor | Approve with fixes (S18) |
| AR write-off document | Approve with fixes (S6) |
| POSTING_RETRY / DIMENSION_* wording | Approve with fixes (S19) |

Hiding (not disabling) for a feature that is off is correct (FE plan §2.5, ux §6). Rule order: feature first (hide),
then right (disable with reason; Jabran 2026-11-04 rule stays for rights).

## Must fix
- **M1** REFUNDS_ADVANCES off: Write off… (receivables/SalesDocumentDetail.kt:167–174), credit-note Refund…
  (SalesDocumentDetail.kt:155–157, SalesDocumentDetailScreen.kt:355), receipt/advance Refund… (ReceiptDetailState.kt:102),
  customer-sheet Refund… (RefundDetail.kt:44–45, CustomersScreen.kt:235) still show disabled with "needs the … right".
  AccountsFeatureGates.kt:25–31 clears the rights, rules read that as no right. Fix: pass refundsAdvancesOn into the rules;
  off → refundCommand/customerSheet/writeOffCommand/ReceiptDetailRules.refundCommand return null. Rules test each.
- **M2** REFUNDS_ADVANCES off: BillEditor.kt:265,322–336 and InvoiceEditor.kt:198,227–237 always call gated
  `open-advances` → red Error notice with Try again (BillEditorScreen.kt:394–399, InvoiceEditorScreen.kt:320–321) and an
  entitlement re-fetch each time. Fix: flag into both editor VMs; off → no load, no Advances card; saved draft with
  deductions keeps read-only rows.

## Should fix
- S1 Plural feature names with "is" (strings_entitlements_off.xml:3–9) → "Refunds and advances are off for {company}".
- S2 feature_off_ask_admin → "Ask your company admin to turn it on." (name when known).
- S3 NotAvailable / NotForCountry use warn "denied" spot (designsystem/components/NeoFeatureOffNotice.kt:141–145) → neutral.
- S4 featureDisplayName (NeoFeatureOffNotice.kt:90–100) lacks SIE_SE, OPENING_BALANCE_IMPORT etc.; obimport/ObImportHost.kt:403
  shows "Module is off" → names for every NeoFeatureAction code, pass name from OB host.
- S5 Off page action "Go to dashboard" (strings_entitlements_off.xml:13) vs building-blocks "Back" → use Back.
- S6 Write-off document with feature off drops buttons silently (SalesDocumentDetailScreen.kt:54) → one neutral "is off" line.
- S7 Company → Modules: region tag + "Not for this country" doubles (CompanyModulesTab.kt:692); pill() (entitlement
  EntitlementModels.kt:64–68) may label ~16 foreign features → hide applies==false, pill only for a contradicting stored row;
  FeaturePillCell (:627–647) raw Text with ellipsis → NeoText, never clip.
- S8 OB list breaks §23 (obimport/ObImportPages.kt:190–219): tools/header button while empty, plain-text empty state, failure
  as Warning → SIE list toolbar pattern, NeoSpotState "No files imported yet" + Import a file, NeoFailureState, title count.
- S9 Status as caption text (ObImportPages.kt:167–171, 213–214) → NeoEntityStatus/MarkPill, file-type tile, NeoKeyValueList.
- S10 Result page: every journal "Waiting to post" (:179), Confirmed same words, raw id fallback → per-journal status, "Journal {n}".
- S11 All non-field errors Warning + Try again (ObImportHost.kt:109–111, ObImportPages.kt:204) → Try again only for
  NO_ANSWER/UNCERTAIN/server; business refusals with their fix; failed read (:233–236) gets Choose another file.
- S12 Accounts table: no minWidth, Balance not numeric (ObImportPages.kt:21–52); red "Needs an account" every row (:78) → neutral tag.
- S13 Ghost buttons after footer (ObImportHost.kt:122–125) → NeoMoreActionsButton by title (Imported files, Discard import).
- S14 Stepper meta lines missing (ObImportHost.kt:91–94; spec §2).
- S15 ob_import_strings.xml wording vs spec §6: too_large, saft_version, SAFT_COUNTRY_DIFFERS meaning, uncertain (use app-wide
  sentence), denied (say what they can't do), generic (drop "request").
- S16 One-option segmented controls: sie/imports/wizard/SieFileStep.kt:204–217, sie/imports/list/SieImportListScreen.kt:160,171–177 → hide.
- S17 ObFormatChoice above SieImportsHost title (ObImportHost.kt:77–78) → inside step 1 under the title.
- S18 AR RefundEditorScreen.kt:89 loadNotice Warning, no Try again → match AP (Error + Try again).
- S19 AccountsErrorWords constants (AccountsErrorWords.kt:13–17) bypass strings file → resolve in composable layer.

## Nice
N1 "Up to 0 MB" (ObImportHost.kt:182) hide. N2 "Creates 1 … journals" fallback (ObImportPages.kt:144) plurals/hide.
N3 Confirm repeats Check problems (:152). N4 read-only notice Info → neutral (ObImportHost.kt:95). N5 rename to
strings_accounts_ob_import.xml. N6 PaymentsListScreen.kt:69–70,83 reason as label + hard-coded text. N7 name the tag in
DIMENSION_CONFLICT when known. N8 Request button wording. N9 nb/sv/da/fi/is strings (backlog FE-5 (5)).
N10 SIE_SE off for SE company: obSieHolder null (AccountsRoute.kt:541–542); ensure format list follows the feature.
