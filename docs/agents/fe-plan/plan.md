# FE — Feature entitlements enforced: implementation plan

Written against NeoERP-BackEnd `dev` c3f33bf (org migrations up to V40, user up to V43, accounts up to V58) and NeoERP-App `dev-app` d4179874. Read-only planning; nothing was changed. Build starts after SB2d is merged (README "FE", catalog approved 2026-11-03).

---

## 1. Current state (file:line)

**Catalog**
- `services/org-service/.../domain/model/module/ModuleFeature.kt:36-79` holds 24 feature codes, keyed by (module, feature). Fields: `defaultEnabled`, `kind` (INCLUDED/ADD_ON/BETA) and `region`. There is no `statutory` flag and no "replaced" marker. `PURCHASING` is an INVENTORY add-on (line 67).
- `.../module/CompanyModuleEntitlement.kt:39-55` holds the module catalog: CORE/ORG/IAM are platform modules. FINANCE/HRMS/PAYROLL are implemented. INVENTORY/SALES/MANUFACTURING are not implemented. There is no PURCHASING module.
- The database has no CHECK constraints on module or feature codes (V11, V13, V22 store varchar). **Adding codes needs no schema migration.**
- `services/user-service/.../shared/kernel/security/ModuleCodes.kt:38`: `COMMERCIAL_MODULES` is kept by hand. Line 33 names `ModuleCodesContractTest`, which does not exist (backlog line 181).

**Resolver**
- `.../entitlement/EntitlementResolution.kt:152-265` already resolves agreement → company → branch → feature, and sets `outsideAgreement` and `source`. `source` exists only on modules, not on features (lines 37-52, 243).
- **Bug 1 (region):** lines 199-229. `applies` (does the company's country match) feeds the default only. A company row or branch override can still switch a region feature on for the wrong country, because `effective = effective && featureOverride.applyTo(companyDefault)` never checks `applies`.
- **Bug 2 (statutory):** region features in an entitled module do default on (line 208). But a company row can switch them off (line 212). In an extension module (switched on outside the agreement) they default off (line 210).
- `EntitlementService.kt:388-424` (`gatherInputs`) runs about 8 queries for each resolution. There is no cache.
- **Bug 3:** `EntitlementService.kt:444-454` (`requireCommercialModule`) accepts unimplemented modules. INVENTORY can therefore be switched on as an extension, even though an agreement cannot include it.

**How services check entitlement today (module only, company level only)**
- `shared/neoerp-security/.../web/client/ModuleEntitlements.kt:25-50` calls `GET /api/org/companies/{id}/modules` with the caller's token on **every request**. That endpoint returns the raw level-2 rows (`CompanyModuleService.kt:52-55`). It ignores branch overrides and features.
- `ServiceAuthorization.kt:96-103` refuses with 403 `MODULE_NOT_ENABLED`, or 503 `ORG_UNAVAILABLE` when org cannot answer. The branch is known at line 87 but is not used for the module check.
- Only accounts uses the shared path (`AccountsEndpoint.kt:33-38`, 251 annotated handlers; `neoerp.security.module-code=FINANCE`).
- hr and payroll have their own clients that call the same `/modules` endpoint: `HrModuleAccessClient.kt:23-30`, `PayrollModuleAccessClient.kt:64-79`, `PayrollAccessRules.kt:87`.
- Machine posting checks modules through internal facts: `MachinePostingService.kt:217-238`. Its refusal message says "isn't part of your plan" (line 236). RULES §2 forbids "plan".
- org-service and audit-service set no `module-code` (security-tiers.md:216, backlog line 117).
- `POST /api/internal/org/facts/resolve` (`OrgFactsService.kt:32-90`) answers `moduleChecks` from level-2 rows only.

**App**
- **Mismatch found:** the app reads `enabledModules` (`AuthSessionDtos.kt:110`). The backend sends `selectedCompanyModules: [{moduleCode, enabled}]` (`user-service .../AppBootstrapDtos.kt:35`, filled at `AppBootstrapService.kt:115,163-175`). The app therefore always falls back to modules derived from permissions (`AuthSessionMapper.kt:257-268`). **Today the app hides modules by permission only, never by entitlement.**
- Menu gating is in `NeoShellHelpers.kt:231-233` (`isModuleEnabledForSession`). There is no feature-level gating anywhere in the app.
- The company feature grid already opens the reason gate: `CompanyModulesTab.kt:560-580` (`onRequest(PendingEntitlement(...CompanyFeature...))`).

**The §5 reason gate on the company feature toggle**
- The finding comes from `NeoERP-BackEnd/docs/agents/agreements-entitlements-review/review.md:83`: "The company-level feature toggle bypasses the reason gate entirely."
- Backend: already closed. `EntitlementService.setCompanyFeature` (lines 203-248) calls `validate()` (lines 467-482). That requires a reason of 6+ characters, plus an amendment reference for an extension.
- App: already closed (CompanyModulesTab.kt:572).
- **Still open:**
  - (a) The design rig, which builders copy, still toggles without a gate: `NeoERP-App/docs/design/screen-rig/entitlements.jsx:27` (`toggleFeature` applies at once) and `:263` (`<Switch onChange={() => toggleFeature(...)}>`).
  - (b) No test proves that a company-level feature change without a reason is refused. The entitlements-modules.md tests table lists only the replace-all case.
  - (c) The legacy `PUT /api/org/companies/{id}/modules` replace-all (`CompanyModuleService.kt:101-128`) takes a reason but writes no `entitlement_changes` row. Those changes are missing from the company's change history.

**Franchise**
- `AgreementService.kt:55-84` and `AgreementResolution.kt:76-104` resolve own → addendum → parent → NONE.
- Feature decisions come from the governing agreement only (line 82). Addenda carry modules, not feature decisions.
- No agreement expiry check: an ACTIVE agreement past its end date keeps granting (`findFirstByCompanyIdAndStatus`). FE does not change this.

---

## 2. Target design

### 2.1 Resolved-feature model
- One computation stays in org-service: `EntitlementResolver`. Its output gains:
  - `ResolvedFeature.source` (INHERITED / OVERRIDDEN / ADDENDUM / OWN_AGREEMENT / NOT_ENTITLED, the same rules as for modules);
  - `ResolvedFeature.statutory`;
  - `ResolvedFeature.applies` (country match);
  - `ResolvedFeature.offCause` when the feature is off: `MODULE_OFF`, `NOT_IN_AGREEMENT`, `OFF_FOR_COMPANY`, `OFF_FOR_BRANCH`, `NOT_FOR_COUNTRY`, `REPLACED`.
- Rule fixes in the resolver:
  - A region feature is effective only where `applies` is true, whatever the rows say (fixes Bug 1).
  - A statutory feature in an effective module, for a matching country, has `companyDefault = true`. A company row cannot change that. Only a branch override can turn it off (catalog Q5: the switch exists only for branches that do not trade). This also covers extension modules. Fixes Bug 2.
  - A replaced feature (INVENTORY.PURCHASING) is never effective and is not offered.
- **New compact endpoint:** `GET /api/org/companies/{companyId}/entitlements/effective?branchId=`.
  - Response: `{ contractVersion: "EffectiveEntitlementsV1", companyId, branchId, etag, modules: ["FINANCE",…], features: ["FINANCE.GENERAL_LEDGER",…], off: { "FINANCE.BUDGETS": "NOT_IN_AGREEMENT", "HRMS": "OFF_FOR_BRANCH", … }, statutory: ["FINANCE.VAT_RETURN_NO",…] }`.
  - The `ETag` header is a hash of the content.
  - Readable by any active member of the company, and by platform staff who have company access.
  - It carries **no** agreement references, extension references or reasons. Those stay on the existing platform screens.
  - A `branchId` from another company → 404.
- **Internal facts:** `POST /api/internal/org/facts/resolve` gains `featureChecks: [{companyId, branchId?, moduleCode, featureCode}]`. Its `moduleChecks` move to the resolved chain. These are for machine paths: machine posting, and user-service bootstrap if it uses a machine token.

### 2.2 How the answer reaches each service — options

| Option | Latency | How stale an answer can be | Cost / risk |
|---|---|---|---|
| A. Claim in the token | 0 calls | Until token refresh (minutes). Branch switch needs a new token. | About 110 codes per branch makes tokens large. Puts commercial data in auth-service/Keycloak. **Auth change, needs Jabran.** |
| B. Bootstrap only | 0 calls | Until the next bootstrap | App only. It cannot enforce anything. |
| C. Per-request call to org, cached in the shared library | 1 call per (company, branch) per cache period | ≤ cache period | Same owner as today. Today's per-request `/modules` call is replaced, so org load goes **down**. |

**Recommendation: C for services, plus B for the app.**
- The shared library keeps an in-memory cache per service instance, keyed by (companyId, branchId or null).
- Cache period 30 s (`neoerp.security.entitlement-ttl`). Maximum entries are configurable.
- If org is down:
  - a read may use an answer up to 5 min old (`entitlement-stale-window`, the same idea as `iamAuthzStaleWindow`);
  - a write needs an answer ≤ 30 s old, otherwise 503 `ORG_UNAVAILABLE`.
- Fail closed.
- The cache is filled only after the permission check passes, as today. The data is per company, not per person, so sharing it between people of the same company is safe.
- Switching a feature off takes effect within 30 s. No new event and no version column are needed.

### 2.3 One shared check (the `shared/neoerp-security` library)
- `ModuleEntitlementSource` is replaced by `EntitlementSource.effective(bearer, companyId, branchId)`, which reads the new endpoint. A `CachedEntitlementSource` wraps it.
- `@ServiceEndpoint` gains `features: Array<String> = []`. Every listed code must be on. Module codes come from `module-code`.
- `ServiceAuthorization` step 4 becomes:
  1. check the module at the person's branch (line 87's `branchId`, or company level when null); then
  2. check each feature.
- For hr and payroll (tier-1 `@PreAuthorize` rules), a public bean `EntitlementGate.require(bearer, companyId, branchId, module, feature)` gives the same check and the same refusal. `HrModuleAccessClient` and `PayrollModuleAccessClient` switch to it, so their own `/modules` calls are removed.
- Startup check: an unknown feature code, or a feature of another module, fails startup. In a service with `module-code` set, every `@ServiceEndpoint` must declare `features`, or set `features = ["*MODULE"]` to say "module only". Deny by default, as ADR-016 does for permissions.
- Codes come from one place: a new tiny pure-Kotlin module `shared/entitlement-catalog` holding the module and feature list (see Q6). org-service `ModuleFeature.kt` keeps its API and delegates to it. user-service `COMMERCIAL_MODULES` is derived from it, which closes the drift in backlog line 181.

### 2.4 Error contract
- **403 `FEATURE_NOT_ENABLED`**
  - Message is fixed: "{Feature name} is not on for this company" or "… at this branch".
  - `details: { moduleCode, featureCode, branchId|null, cause }`, where cause is one of `MODULE_OFF | NOT_IN_AGREEMENT | OFF_FOR_COMPANY | OFF_FOR_BRANCH | NOT_FOR_COUNTRY | REPLACED`.
- **403 `MODULE_NOT_ENABLED`**: the code is unchanged. It gains `details { moduleCode, branchId, cause }` and now also fires for a branch override that is off.
- **503 `ORG_UNAVAILABLE`**: unchanged.
- Order of checks: token → permission → module → feature → the service's own checks.
- Machine posting uses the same codes. Replace "isn't part of your plan" with "Finance is not on for this company".
- New org write refusals (409, through the existing `AgreementConflictException` style):

| Code | When |
|---|---|
| `STATUTORY_FEATURE_REQUIRED` | Company-level OFF on a statutory feature for its own country |
| `FEATURE_NOT_FOR_COUNTRY` | Switching on a region feature for another country |
| `FEATURE_REPLACED` | Any write to INVENTORY.PURCHASING |
| `MODULE_NOT_IMPLEMENTED` | Switching on an unimplemented module (fixes Bug 3) |

### 2.5 App behaviour (ux-principles §6: "the app never offers something the backend will refuse")
- **Session.**
  - Bootstrap gains `selectedContextEntitlements` (the EffectiveEntitlementsV1 body for the selected company and branch). user-service fills it from org.
  - The app reads it into `NeoUserSession.entitlements` (modules, features, off causes, etag).
  - Fix the field mismatch: read the backend's real field. Keep the permission fallback only when the field is absent (older backend).
- **Hidden.**
  - A module or feature that owns a whole menu item, tab or route is hidden, the same as having no view permission.
  - An action inside a screen that is otherwise on is hidden: Import SIE, Send e-invoice, free-dimension columns on entry, and so on.
  - Every `NeoDestination` and action declares its feature in one map (`NeoFeatureMap`). There is no ad-hoc check per screen.
- **Disabled with a reason** only where data already exists. Example: posted lines that hold free-dimension values stay visible read-only after FREE_DIMENSIONS is switched off. They carry one line: "Free dimensions are off for {company}."
  - Owners also get **Request**, which uses the existing FEATURE request kind (OrgRequestService).
  - Other people see "Ask your company admin."
  - For a `NOT_IN_AGREEMENT` cause, the Owner's text says Neovatus decides.
- **Statutory features.**
  - On Company → Modules they show a "Required by law" pill in place of the company switch, and keep the branch override.
  - Region features for other countries stay shown as scoped, never as "off", as today.
- **Stale answers.**
  - A 403 `FEATURE_NOT_ENABLED` or `MODULE_NOT_ENABLED` re-fetches the effective set, then shows the page error (§22) with the cause sentence.
  - The app also re-fetches on context switch, and on focus after 5 min.
- **Platform view.** It stays as today (sees everything). In an Enter-company session it follows the company's answer.

---

## 3. Data and migrations (numbers = next free on origin/dev at build; check with `git fetch`)

| Service | Migration | Content |
|---|---|---|
| org | V41+ `fe_statutory_and_region_rows` | 1. Delete `company_feature_entitlements` rows with `enabled=false` for statutory features where the company's country matches. 2. Delete rows with `enabled=true` for region features where the country does not match (they were a bug). 3. For each deleted row, insert an `entitlement_changes` row and an `audit_event_outbox` row with the fixed reason "Statutory duty on by law for {country} (FE)" or "Region feature does not apply to {country} (FE)", actor `system:FE`. Builder reports counts per environment first. See Q5. |
| org | none for codes | No CHECK constraints on codes. INVENTORY.PURCHASING rows (if any) stay and resolve off. INVENTORY was never sellable, so there is nothing to move. Builder runs the count query and reports it. |
| user | none | Bootstrap is code only. Optional later: `iam.permissions.entitlement_feature`, so the role editor greys out codes of features that are off. Not in FE (see Q9). |
| accounts, hr, payroll, audit | none | — |

Expected numbers at the time of writing: org V41. SB2d takes accounts V59–V62; FE adds nothing to accounts.

---

## 4. Franchise handling

A franchise is its own company (RULES §7). Its company switches and branch overrides are its own. The franchisor's company switches and extensions never flow down. Each case:

| Source | Agreement level used | Features |
|---|---|---|
| INHERITED | Parent's agreement modules and feature decisions | The franchise's own company and branch rows |
| ADDENDUM | Parent's modules plus addendum modules (only while the addendum is in force) | Addendum modules follow catalog defaults. An add-on in an addendum module is not covered, so it is off unless switched on as an extension with an amendment reference (see Q11). |
| OWN_AGREEMENT | Own agreement only; parent ignored | Own decisions. The group's expiry is still shown separately (§8). |
| NOT_ENTITLED (NONE) | Nothing | Only extensions are effective |
| OVERRIDDEN | Branch deviation wins the label | As today, now also reported per feature |

- Statutory and region rules use the **franchise's** country, not the franchisor's.
- Tests are in `FranchiseEntitlementResolutionTest`, listed in FE-2. This closes backlog line 159 ("resolver handling of franchises not traced").

---

## 5. Statutory region features

- Each catalog entry gains `statutory: Boolean`, allowed only with `region`.
- Recommended statutory list (Q4): TAX_FILING_PK, FBR_DIGITAL_INVOICING_PK, VAT_RETURN_NO/SE/DK/FI/IS, SAFT_NO, SAFT_DK, STATUTORY_FILES_FI, STATUTORY_FILES_IS (one code per country, catalog Q4), STATUTORY_PK/NO/SE/DK/FI/IS (payroll), EINVOICE_SEND_NO (needed before 2027-01-01).
- Region but not statutory: SIE_SE, EINVOICE_SEND_SE/DK/FI/IS. These follow the normal default rules.
- Catalog Q5 overrides the catalog table's "Default on? No" for VAT returns and SAF-T. The builder follows Q5.
- Behaviour:
  - On automatically when the module is effective and the country matches.
  - Company OFF → 409 `STATUTORY_FEATURE_REQUIRED`.
  - Branch OFF is allowed with the normal reason gate.
  - An agreement cannot leave one out (`Agreement.normalizeFeatures` already refuses region features).
  - A country change re-resolves on the next read. Nothing is stored.
- HR_GDPR stays a plain INCLUDED feature, on by default and not locked. GDPR does not apply to PK companies.

---

## 6. The RULES §5 reason-gate fix (slice FE-0)
1. Backend tests that prove the gate on every entitlement write path. A missing reason or one under 6 characters → 400 `fieldErrors.reason`, and nothing is written (no row, no history, no audit). Paths: company feature on, off and clear; company module; branch module; branch feature; request approval.
2. Legacy replace-all `PUT /api/org/companies/{id}/modules`: route each changed module through `EntitlementService.setCompanyModule`, so each change gets an `entitlement_changes` row. Or retire the endpoint if nothing calls it; the builder greps the app and the services, then decides with the lead.
3. Rig: `screen-rig/entitlements.jsx:27,263`. `toggleFeature` calls `setPending({kind:'feature', …, extends: …})` like `toggleModule`. Sync the block in `app.html:6144`.
4. App test: `CompanyFeatureGateTest`. The checkbox opens the gate. Cancel leaves the value as it was. Turning off uses the destructive gate.

---

## 7. Slices (in order)

| Slice | What | Size | Builder / reviewer | Tests (named) | Parallel? |
|---|---|---|---|---|---|
| **FE-0** | §5 closure (section 6) | S | Sonnet / Sonnet | `StatusChangeReasonTest.companyFeatureWithoutReasonIsRefusedAndChangesNothing`, `…companyFeatureClearWithoutReasonIsRefused`, `…requestApproveNeedsReason`, `CompanyModuleReplaceHistoryTest.replaceAllWritesOneChangeRowPerChangedModule`, app `CompanyFeatureGateTest` | Yes. Touches no accounts code; can run during SB2d. |
| **FE-1** | Catalog. `shared/entitlement-catalog` (if Q6 = yes). 84 new codes: FINANCE 43, HRMS 15 (no PERFORMANCE_GOALS, catalog Q6), PAYROLL 16, INVENTORY 2, SALES 2, PURCHASING 4, MANUFACTURING 2. PURCHASING module (`implemented=false`). INVENTORY.PURCHASING marked `replacedBy = module PURCHASING`. `statutory` flag. user-service `COMMERCIAL_MODULES` derived from the catalog. | M | Sonnet / Sonnet | `ModuleFeatureCatalogTest.existing24CodesUnchanged` (golden list), `…codesUniquePerModule`, `…regionIsOneIso2`, `…statutoryImpliesRegion`, `…matchesApprovedCatalog`, user `ModuleCodesContractTest` | Yes, alongside SB2d (org and user only) |
| **FE-2** | org resolver and API. Bugs 1–3. Statutory rule. Per-feature `source`, `offCause`. The `/entitlements/effective` endpoint with ETag. `featureChecks` in internal facts. The 409 codes. The V41 data migration. Contract doc `docs/api/org-entitlements-effective.md` written **first**. | M–L | Opus / **Opus** (commercial and security) | `EntitlementResolverTest.regionFeatureNeverAppliesOutsideItsCountry`, `…statutoryOnWithoutCompanyRow`, `…statutoryOffAtBranchWithReason`, `…replacedFeatureResolvesOff`, `…featureSourceNamesEachProvenance`; `EntitlementServiceTest.statutoryOffAtCompanyIs409`, `…regionOnForOtherCountryIs409`, `…replacedFeatureWriteIs409`, `…unimplementedModuleOnIs409`; `EffectiveEntitlementsWebTest.memberReadsOwnCompany`, `…otherCompanyMemberRefused`, `…platformWithoutCompanyAccessRefused`, `…branchOfOtherCompanyIs404`, `…noReferencesOrReasonsInBody`, `…etagStableWhenUnchanged`; `OrgFactsFeatureChecksTest`; `FranchiseEntitlementResolutionTest` (inherited, addendum, lapsed addendum, own, none); `V41StatutoryRowsMigrationTest.removesOffRowsAndWritesHistory` | Yes, alongside SB2d (org only) |
| **FE-3** | Shared check. `EntitlementSource` and cache. `@ServiceEndpoint.features`. Branch-aware module check. `FEATURE_NOT_ENABLED`. Startup check. `EntitlementGate` bean. Accounts maps all handlers to features, with a golden map file reviewed by the lead. FREE_DIMENSIONS gates SB2d free-dimension writes. ADR-016 amendment. | L | Opus / **Opus** | `EntitlementGateTest.moduleOffAtBranchRefused`, `…featureOffRefusedWithCause`, `…cacheHitWithinTtl`, `…writeAfterTtlWithOrgDownIs503`, `…readWithinStaleWindowAllowed`, `…cacheKeyIncludesBranch`, `…cacheFilledOnlyAfterPermission`; `ServiceEndpointFeatureStartupCheckTest.unknownCodeFails`, `…otherModuleCodeFails`, `…undeclaredEndpointFails`; `NeoErpRefusalAdviceTest.featureNotEnabledBody`; accounts `AccountsEndpointFeatureMapTest` (golden), `FreeDimensionFeatureTest.writeRefusedReadAllowed`; full accounts test run green | **After SB2d is merged** (accounts endpoints) |
| **FE-4** | hr and payroll adopt `EntitlementGate` and map their endpoints. Machine posting checks FINANCE.PAYROLL_POSTING and PAYROLL.PAY_POSTING. The "plan" wording fix. | M | Sonnet / **Opus** | `HrFeatureGateTest`, `PayrollFeatureGateTest`, `MachinePostingFeatureTest.payrollPostingOffRefused`, `…messageSaysNotOnNotPlan` | Alongside FE-5 |
| **FE-5** | Bootstrap `selectedContextEntitlements` (user-service). App: session, fix the field mismatch, `NeoFeatureMap`, hide and disable, 403 re-fetch, Request for owners, statutory pill. | L (backend S, app L) | Sonnet / Opus for the bootstrap part, Sonnet for the app | `AppBootstrapEntitlementsTest.selectedContextCarriesEffectiveSet`, `…orgDownOmitsFieldNotEmptyList`; app `AuthSessionMapperEntitlementsTest.readsBackendField`, `DestinationFeatureAccessTest`, `FeatureRefusalRefetchTest`, `StatutoryFeaturePillTest`; iOS compile (`compileKotlinIosSimulatorArm64`) | Alongside FE-4; the app part can start on mocks once the FE-2 contract exists |
| **FE-6** | Docs: entitlements-modules.md (effective endpoint, statutory, codes), security-tiers.md (step 4 and 5, org/audit decision), agreements.md, standard-roles.md (PURCHASING module roles stay reserved), user guide, backlog closures (lines 117, 159, 181) | S | Sonnet / Sonnet | — | Last |

---

## 8. Interaction with SB2d
1. **FREE_DIMENSIONS** is an ADD_ON, off by default. FE-3 gates SB2d's free-dimension maintenance and any line or `DimensionSetV1` free-slot value on writes, including machine posting. Reports on stored values stay readable. Branch, cost centre, project and department are foundations and are never gated (catalog Q3).
2. **DIMENSION_REPORTING** is INCLUDED but off by default. If it gated SB2d-4's report filters, FE would hide them for every tenant. Recommendation: it gates only the later dedicated dimension reports (Q8).
3. **Branch.** SB2d keeps a branch on document headers and on each journal line, and a journal may carry several branches. FE checks at the **person's branch** (session or selected branch), not each line's branch. A company-wide accountant may still post a line tagged to a branch whose FINANCE is off by override. Books belong to the company (§7); the override governs people working at that branch (Q3). A per-document branch check is left for branch-located features such as POINT_OF_SALE when Sales is built.
4. **Migrations.** FE adds none to accounts, so there is no conflict with SB2d's V59–V62.
5. **Timing.** FE-3's accounts map must be written against the merged SB2d endpoint set. Hence "after SB2d".

---

## 9. Risks
- **Locking out live features.** A wrong endpoint→feature map, or a feature that defaults off but is live today, refuses real work. Possible cases: APPRAISALS (BETA, off), SIE endpoints outside SE, statutory exports. Mitigation: the golden map is reviewed by the lead, the builder lists every "default-off but live" endpoint before enforcement (Q9), and only demo data exists today.
- **Branch module overrides start to bite.** Existing OFF overrides that were ignored before will now refuse. The builder reports counts per environment first.
- **Org outage.** Writes fail closed after 30 s. This is already the case today, because every request calls org. The cache lowers both the load and the exposure.
- **Up to 30 s of staleness** after a switch. This is accepted, and the app re-fetches on refusal.
- **Data migration without an operator reason.** It writes changes with a system reason; this needs Jabran's approval (Q5).
- **Catalog drift.** Without the shared module (Q6), codes are duplicated in org, user and the services.
- **Size of the accounts map.** There are 251 handlers, and SB2d adds more. Tie the map to the startup check so a new handler cannot be added without one.
- **PURCHASING module code vs PURCHASING feature code.** They are keyed separately, (module) vs (module, feature), so they do not clash. Docs must say which one is meant.
- **Agreement expiry.** It does not stop entitlement today. FE keeps that; enforcement makes it more visible.

---

## 10. Needs Jabran's approval (auth / sign-in / security)
- **ADR-016 amendment.** Tier-2 step 4 becomes module (branch-aware) plus feature checks, with a new refusal `FEATURE_NOT_ENABLED`, cache and stale rules, and a startup check that requires every endpoint to declare its features.
- **Bootstrap (sign-in session payload).** Adds `selectedContextEntitlements`. Additive only. No change to tokens, Keycloak or auth-service.
- **New org endpoint readable by every company member.** It exposes codes only.
- **Backlog line 117.** Confirm that org-service and audit-service stay without a module check, because they are platform layer, and record that in ADR-016.
- **If a token claim is preferred over Option C**, that is an auth-service/Keycloak change and needs a separate approval.

---

## 11. Questions for Jabran (recommendation first)
1. **How do services get the answer?** *A call to org per company and branch, cached 30 s in the shared library. Reads may use an answer up to 5 min old if org is down; writes may not. Not a token claim.* Fast, low staleness, and no auth change.
2. **Error contract?** *403 `FEATURE_NOT_ENABLED` with `cause`. `MODULE_NOT_ENABLED` also gains `cause` and the branch.* It matches the existing module refusal, and the app can phrase who to ask.
3. **Which branch is checked?** *The person's branch, not each line's.* Books belong to the company; the override is about people at that branch.
4. **Statutory list?** *The list in section 5. EINVOICE_SEND_NO is statutory; the other e-invoice codes and SIE_SE are region-only.* Matches catalog Q5 and current legal dates.
5. **Existing company "off" rows on statutory features?** *Remove them in the migration, with a system reason and history rows.* Otherwise the data contradicts the rule forever.
6. **Where does the catalog live?** *A new tiny shared module (`shared/entitlement-catalog`) that `ModuleFeature.kt` delegates to.* One list for org, user and the services. Same pattern as SB2d Q10.
7. **Old INVENTORY.PURCHASING?** *Keep the row, mark it replaced, resolve it off, refuse writes with 409 `FEATURE_REPLACED`, move no data.* INVENTORY was never sellable.
8. **DIMENSION_REPORTING vs SB2d-4 filters?** *It gates only the later dedicated dimension reports, not the plain filters.* Otherwise SB2d-4's filters vanish for everyone.
9. **Built endpoints whose feature defaults off (e.g. APPRAISALS)?** *Enforce the catalog defaults as approved; the builder lists them first for a yes or no.* Only demo data exists.
10. **Role editor greying codes of features that are off?** *Later, not in FE.* Enforcement does not need it.
11. **Add-ons on a franchise addendum?** *Not now. An extension with an amendment reference, or the franchise's own agreement.* Addenda carry modules only today.
12. **Start FE-0 to FE-2 during SB2d?** *Yes. They touch no accounts code.* FE-3 waits for SB2d.

---

### Critical files for implementation
- /Users/jabransiddiqui/Offices/Neovatus/NeoERP/NeoERP-BackEnd/services/org-service/src/main/kotlin/com/neovatus/org/domain/model/module/ModuleFeature.kt
- /Users/jabransiddiqui/Offices/Neovatus/NeoERP/NeoERP-BackEnd/services/org-service/src/main/kotlin/com/neovatus/org/domain/model/entitlement/EntitlementResolution.kt
- /Users/jabransiddiqui/Offices/Neovatus/NeoERP/NeoERP-BackEnd/services/org-service/src/main/kotlin/com/neovatus/org/application/service/entitlement/EntitlementService.kt
- /Users/jabransiddiqui/Offices/Neovatus/NeoERP/NeoERP-BackEnd/shared/neoerp-security/src/main/kotlin/com/neovatus/security/web/authz/ServiceAuthorization.kt (with `web/client/ModuleEntitlements.kt` and `web/authz/Endpoints.kt`)
- /Users/jabransiddiqui/Offices/Neovatus/NeoERP/NeoERP-App/composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/features/auth/data/mapper/AuthSessionMapper.kt (with `AuthSessionDtos.kt:110` and `ui/shell/NeoShellHelpers.kt:233`)

Also touched: `services/user-service/.../shared/kernel/security/ModuleCodes.kt`, `services/user-service/.../app/bootstrap/AppBootstrapService.kt`, `services/accounts-service/.../configuration/security/AccountsEndpoint.kt`, `services/accounts-service/.../posting/MachinePostingService.kt:236`, `services/hr-service/.../security/HrModuleAccessClient.kt`, `services/payroll-service/.../security/PayrollModuleAccessClient.kt`, `services/org-service/.../module/CompanyModuleService.kt`, `NeoERP-App/docs/design/screen-rig/entitlements.jsx:27,263`, `NeoERP-App/.../organization/presentation/organization/CompanyModulesTab.kt:560-580`.
