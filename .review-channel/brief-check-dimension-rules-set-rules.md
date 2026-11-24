# Brief check: dimension-rules flow 1 `set-rules` (BE + App) · 2026-11-24 · read from origin/main (BE 5b22aca4, App 35bee31d)

Verdict: GAPS

Confirmed OK: V44__accounts_dimensions_codes.sql exists (user-service); next free numbers are accounts-service V80, user-service V51 (`core/phase-4-fixes` adds none); `ACCOUNTS.DIMENSIONS.READ` built (AccountsPermissions.kt:148); `scripts/money-invariants.sh`, `docs/api/accounts-a1.md`, `chart-and-used-for.md`, `db-design.md`, `verify.md` exist; App files named in the App Scope exist; rig route `#accounts:kyst|dimensions|rules` exists (accounts-dims.jsx:11); `ScreenSizes.QaSize` exists. Rules 1, 3, 4, 6, 7 match ADR-021 D6 and OD-1…OD-4.

1. **BE Rules 1–2 (be.md:18-28): precedence vs storage is undefined, and it breaks ranges as written.** OD-1 keeps pack rules in `account_dimension_rules` (source PACK). If a PACK row counts as an "account rule", it beats every range rule, so a range never applies to a pack account. Add account writes `["branch"]` by default (AccountDtos.kt:13), so a COMPANY row would also block the test "account created later at 6750 takes RANGE" (be.md:88). Source: spec §4.6 acdim.md:231 (A = set on this account, R = range, none = chart); ADR D6 adr021.md:125-126. **Fix:** say PACK rows (and the defaults of an added account) are the *chart* level, below ranges, and COMPANY rows are the *account* level. Map the read `source` as COMPANY→ACCOUNT, range→RANGE, PACK→CHART. A locked chart rule also beats a loosening range rule. Say what the backfill writes for user-created accounts (`status_source USER`).
2. **BE Rule 5 (be.md:36) contradicts Q7.** "Loosen only what it tightened itself" forbids loosening an unlocked pack REQUIRED. ADR Q7 (adr021.md:228) says "yes otherwise", and D6 (adr021.md:125) leaves that case to Q7. **Fix:** "a company may loosen any rule that isn't locked". Define the order (NOT_ALLOWED < OPTIONAL < REQUIRED) so "loosen" can be tested. App Rule 1 (app.md:19) is fine.
3. **BE Rule 2: template-level storage is missing.** The `:required` suffix and `locked` have no home in the pack layer. `coa_template_accounts.allowed_dimensions TEXT[]` (V6__a0_baseline.sql:69-82), `PackFiles.kt:215` splits `dimensions` on `|`, and `PackRules.kt:75` rejects any value outside `Dimensions.ALL`, so `cost_centre:required` fails validation today. OD-1 tables are keyed by company `account_id`. **Fix:** name the template-side storage (e.g. a template rules table or a parsed array with rule and locked), the CSV grammar (`branch|cost_centre:required`), the PackRules change, and `PlatformChartTemplatesController.kt:255` (it serves the template dims).
4. **BE Step 1 (be.md:62): the flow-1/flow-2 cut changes posting now. Decide it in the brief; don't leave it to the plan.** The SQL readers read the column directly: JournalJdbcAdapter.kt:933, ReferenceJdbcAdapters.kt:167, YearEndJdbcAdapter.kt:100, ChartJdbcAdapters.kt:164. A "derived" value only in DTOs leaves posting and the screens disagreeing. If the column is written through instead, flow 1 changes the following:
   - NOT_ALLOWED refusals (PostingValidator.kt:667-681);
   - header default cost centre dropped (PostingValidator.kt:702);
   - branch defaulting and C-13 (PostingValidator.kt:685, 731-737) and the org prefetch (PostingValidator.kt:295);
   - DraftDimensionCheck.kt:95, RecurringTemplateCheck.kt:232, SieImportPreviewer.kt:413 and the year-end tags.

   This is safe for `main`, because the feature lands as one PR after flow 3 (accounts-plan.md:12). It is not covered by the review plan: flow 1 gets Opus only. **Fix (rec):** write the column through, in the same transaction as every rule write. Add a BE row: "set NOT_ALLOWED → step 6 refuses; back to OPTIONAL → posts; REQUIRED not enforced until flow 2". Name these posting effects in the flow 2 Fable brief.
5. **BE Step 1 / Scope: writers the brief doesn't name.**
   - Add account (`POST /accounts` under `COA_CREATE`, ChartController.kt:81-101): a COA_CREATE holder sets rules without `DIMENSION_RULE.UPDATE`. Decide the permission, the source (see 1) and whether a reason is needed.
   - `SieOpeningConfirmService.kt:307` copies `like?.allowedDimensions`.
   - `ChartMaterializer.kt:49` and `ChartBuilder.kt:205` (pack → company).
   - `packs/2026.5/pk-layouts/adoption.sql:38`, and Pack2026Writer, Pack2026_3Writer and PackWriter for new companies.

   **Fix:** list them all. Add a row: "a new company from each pack (NO, SE, PK, base) gets derived = pack dims". The backfill row covers only companies that are already seeded.
6. **App Scope (app.md:39): `allowedDimensions` readers the brief misses.**
   - `ChartTemplateDtos.kt:71`, `ChartTemplatesRepositoryImpl.kt:112` and `ChartTemplateTabs.kt:205`;
   - `AccountsChartTab.kt:521` (reader) and `:610` (Add account writer), and `AccountsSetupMapper.kt:264` (writer);
   - `PayablesSupport.kt:78`, `ReceivablesSupport.kt:114`, `DefaultLineAccount.kt:28`, `DimensionCatalog.kt:157/324`, `AccrualDialogState.kt:376/522`, `JournalEditorRules.kt:429/639/661`, and the Bill and Invoice editors;
   - the mocks `MockAccountsSetupRepository.kt:350/396` and `MockChartTemplatesService.kt:85`.

   **Fix:** list them. Say the editor and role readers keep the derived `allowedDimensions` until flow 2, and that the template and chart tab readers move in flow 1.
7. **BE Rule 2 / Feature checklist: the read shape and its permission aren't named.** Name:
   - which reads gain `dimensionRules`: account list, setup chart (SetupDtos.kt:244), journal LineAccountDto (JournalDtos.kt:223), recurring (RecurringDtos.kt:161);
   - the item shape: `{dimension, rule, source, locked}`, plus range bounds for "from 6000–7999" (acdim.md:231) and the country for the lock text (acdim.md:334).

   The account list is under `COA_READ` (ChartController.kt:50), but Rule 4 (be.md:32) says rules are read under `DIMENSIONS.READ`. **Fix:** pick one. The overview counts "Required on 312 · optional on 96" and "3 range rules, 4 single-account rules" (acdim.md:102,109) need a source, named in both briefs. The role-accounts read (ADR D6, adr021.md:130; old brief BE-5) is in no flow; put it in flow 2.
8. **BE Rule 3 / Scope: endpoint paths and the bulk set are not specified.** The spec has no bulk endpoint, only the UI (acdim.md:237). The old brief named `GET/PUT /api/accounts/accounts/{id}/dimension-rules` and `GET/POST/PUT/DELETE /api/accounts/dimension-range-rules` (brief-4b-414-be.md:62), and the new brief dropped them. **Fix:** name the paths. For the bulk set, give the body (`accountIds`, dimension, rule, reason), all-or-nothing, a maximum n and the refusal `details.accounts[]`. Also say how a reason reaches a DELETE, and that "Use the range rule" (acdim.md:235) removes the account's own rule.
9. **BE Rule 3: the impact shape is thinner than the spec.** Spec §4.6 (acdim.md:222) and DM-7 (acdim.md:383) need:
   - the accounts affected;
   - the own rules that still win, as a list with number and name;
   - drafts per kind (journals, bills, invoices).

   The brief has "drafts, recurring templates, accounts". The spec's query `dimension, from, to, rule` doesn't cover a cell change or a bulk change (`accountIds`). A NOT_ALLOWED change should count the drafts that carry the value. Header accounts are left out. **Fix:** write the response JSON in the brief.
10. **BE Contract (be.md:45): the refusal `details` aren't named.** **Fix:** `RULE_RANGE_OVERLAP {dimension, from, to, ruleId}` of the other rule (acdim.md:333); `RULE_LOCKED {accountNumber, accountName, dimension, country}` (acdim.md:334); `REASON_REQUIRED {min, max}`.
11. **Both Rules: which dimensions take rules.** `Dimensions.ALL` holds branch, stock_location, department, cost_centre, project, item and free1–4 (ChartTypes.kt:86-96). The BE brief drops the branch C-13 exception (ADR D6, adr021.md:127). The spec shows branch as "Required (2 or more branches)" (acdim.md:233). **Fix:** say whether branch, stock location, item and department rules can be edited in flow 1; branch is recommended C-13-only, read-only. Also say how free slots behave under `FINANCE.FREE_DIMENSIONS` off, and what happens to rules on a deactivated company dimension (accounts-dims.jsx:626 "rules stop applying").
12. **BE Rule 2: table columns.** `dimension_range_rules` has no `company_id` in its text (be.md:24), and there is no `version` for the "version refusal" row (be.md:101). **Fix:** add `company_id` (scoped like every Accounts table, REVOKE pattern), plus `version`, `created_by/at` and `updated_by/at` on both tables.
13. **BE Scope (be.md:50): the user-service migration doesn't say where the new code is carried from.** The V44 pattern carries a "Taken away" mark from older codes (V44:12-15). **Fix:** name the source code (rec: from `ACCOUNTS.DIMENSIONS.MANAGE`) and `entitlement_module 'FINANCE'`. Add the constant to `AccountsPermissions.kt:148-208`, and on the App side to `DimensionCodes` in `presentation/DimensionsAccess.kt`. That file is not under `dimensions/` as app.md:38 suggests.
14. **BE: behaviour before go-live is unspecified.** The spec makes every Dimensions screen read-only before go-live (acdim.md:66). **Fix:** set `BooksRequirement` on the writes (rec: LIVE for writes, CREATED for reads) and add a row. Add a row for the platform actor (Enter company): writes 403.
15. **BE Test table (be.md:84-106): case kinds §5 asks for but no row covers.**
    - contract: an unknown `rule` or `dimension` in a request → 400; an explicit `null` for `rule`, `reason` or `from` → 400;
    - success: remove a range rule and remove an account rule with a reason, each with its audit entry and before/after (this is in the DoD, be.md:81, but has no row);
    - tighten, then loosen your own rule; a range trying to loosen a locked account;
    - edge: header accounts inside a range are left out of counts; a range with from > to; `FREE_DIMENSIONS` off; a stand-in user.

    Split the ambiguous row "from > to, non-numeric, from = to → 400 / saved" (be.md:92) into one row per case.
16. **App Test table (app.md:73-88): rows missing.**
    - edit and remove a range rule through the reason gate;
    - "Use the range rule";
    - Add account rule selects (acdim.md:392);
    - the account panel "Dimensions on lines" (`accounts_home_label_tags_on_lines`);
    - FINANCE off and free dimensions off;
    - the before-go-live notice (in the DoD, app.md:70, but no row);
    - the `RULE_LOCKED` words with the country;
    - the impact lines' content;
    - bulk with one locked account: nothing saved, and the account named;
    - the overview counts.
17. **App Scope (app.md:38): name clash.** `presentation/dimensions/DimensionRules.kt` already holds an `object DimensionRules` for value-form checks. **Fix:** tell the builder to name the new type differently (e.g. `AccountRuleResolver`), or rename the old one with a reason.
18. **Both, Read first / Standards: builders get one repo** (CLAUDE.md "Builders get one repo"). `docs/domain/RULES.md`, `docs/templates/review.md` (named in the hand-back, be.md:114, app.md:96) and the workspace `brief-4b-414-be.md` decisions are not in either repo. **Fix:** the lead copies RULES §3/§7/§8 and `review.md` into `docs/agents/dimension-rules/` in each repo. Mark `docs/modules/accounts/dimensions.md` as **new**: it doesn't exist on origin/main.
