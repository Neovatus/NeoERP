# Opus review: I18N round 1 (i18n-merge1 d91117b1..9e71155a) — 2026-11-10

**Verdict:** no-go until High is fixed. After the fixes it is a go.

**Clean:**
- Every key exists in nb, sv and da.
- No wrong quotes or straight apostrophes; placeholders match.
- Refusals keep line numbers and names again.
- AuditWording keeps its details.
- iamApiError covers the user-service rule codes.

## High: NeoUiText toString leaks (raw "Res(res=…)" on screen)
Each needs `.resolve()` / `.load()`, or the value passed as a text() argument:
1. RequestInboxScreen.kt:526-529: status.label in a template. Also the English " by $it" and "Reference $it." → keys `org_requests_fmt_decided_by` and a Reference key.
2. CompanyBranchDetail.kt:402: iconLabel template.
3. CompanyOverviewCards.kt:114: joinToString of row.detail and ASK_OWNER_TO_ADD.
4. CompanyModulesTab.kt:336-344: moduleSourceLine.
5. CompanyLegalCard.kt:206-207: legalRecordedLine.
6. CompanyRequestsUi.kt:328-331: orgRequestMeta.
7. AccessSheetAdjust.kt:131.
8. PersonAccessTab.kt:528.
9. AccessSheetRoles.kt:73: blockedReason.
10. PlatformRolesScreen.kt:129: roleHoldersLabel passed to pluralStringResource.
11. AccountsTaxCodesTab.kt:350-351: "Used for: ${roleName}".
12. ChartTemplateTabs.kt:272: "From ${neededFromLabel}" → core_fmt_valid_from.
13. JournalListingState.kt:140: journalTypeName in joinToString.

**Guard:** make toString() of Res/Plural/Item/Joined return a visible marker (e.g. ⟦key⟧), and add a source-scan test for NeoUiText members used in `$`, `${}` or joinToString.

## Medium
1. English passed into sentences:
   - nameError(name, "branch"/"location") → whole-sentence keys;
   - "on/off" in OrgPlaceListRules:50 → org_branch_fmt_module_on/_off.
2. accounts_home_msg_equity_zero_*: "0.00" is written into the string.
3. iam_people_error_pick_least_one_role_end: the nb/sv/da meaning is wrong.
4. iam_people_sheet_msg_removed_taken_away: the text is nonsense → "No longer taken away: %1$s" + translations.
5. Danish "Deres…" at the start of a sentence (23 keys) reads as formal "Your".
6. Dr/Cr: use "Debet"/"Kredit" in nb/sv/da, not "Deb."/"Kre.". Side.bridgeLabel stays English until L4.
7. NeoErrorDisplay: text wins before isForeignNotFound, so a 404 without a code says "not found" instead of "server unavailable".

## Low
**Translations:**
- sv/da genitive glued onto a placeholder (franchise agreement texts).
- Split compounds: "Standard X" labels.
- da "Kontrollér" everywhere.
- da "Hver primosaldo".
- core_label_joined → "Medlem siden" / "Medlem sedan" / "Medlem siden".
- nb "Kunne ikke lastes inn" consistency.
- Årsavslutningsbilag / Årsafslutningsbilag.
- da "Norfolkøen".
- Pakistani sample names in Nordic hints.

**Review-note decisions:**
- Accept: Franchiseavgift/-gebyr, Bilagstekst/Verifikationstext, Holdt utenfor/Undantagen/Holdt ude, Ligger i/Finns i/Ligger i, Overskrift/Rubrik/Overskrift, Kontroll/Kontrol, Åpent/Öppet/Åbent, WHT, Tilkøb, Finance Manager.
- Go live as a verb: "Start regnskapet" / "Starta bokföringen" / "Start regnskabet", with the toast "Regnskapet er startet" / "Bokföringen har startats" / "Regnskabet er startet". The nouns oppstart / driftstart / opstart stay.
- Used for: "Used for: all linked" → "Brukes til: alt er koblet" / "Används till: allt är kopplat" / "Bruges til: alt er knyttet".

**Repeats:**
- iam_roles_error_above_own_rights = iam_people_error_can_only_give_what_have → core.
- reason too short (accounts, org) → core_error_reason_required, with no hard-coded numbers.
- accounts_common_title_cant_save → core_title_cant_save.
- core_error_sign_in_again_continue → core_error_sign_in_to_continue.
- platform_agreement_label_manual_renewal = _renewal_manual.
- Keys that differ only by a full stop.
- 34 `_2`/`_3` keys and 20 `_lower` glue keys.
- core_status_required vs core_a11y_required.

**State:**
- DimensionValuePanel.kt:362 remember keys.
- org_fiscal_error_only_company_accounts_finance_has shows "(FINANCE)".

**Fit:**
- PeriodCloseScreen YEAR_SELECT_WIDTH → widthIn(min).
- PeriodCloseScreen:313 maxLines=1 without an ellipsis.
- da keep_editing → "Rediger videre".
