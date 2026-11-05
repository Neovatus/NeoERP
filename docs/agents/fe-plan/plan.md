# FE — Feature entitlements enforced: implementation plan (revised after the Opus review)

Written against NeoERP-BackEnd `dev` c3f33bf (org migrations to V40, user to V43, accounts to V58) and NeoERP-App `dev-app` d4179874. Read-only planning; no files changed. The README "FE" section says FE is built after SB2d. This revision applies every review point (wrong facts, H1–H2, M1–M7, Low items, question changes).

---

## 1. Current state (file:line)

**Catalog**
- `services/org-service/.../domain/model/module/ModuleFeature.kt:36-79` holds 24 feature codes, keyed by (module, feature).
  - Fields: `defaultEnabled`, `kind` (INCLUDED/ADD_ON/BETA), `region`.
  - There is no `statutory`, `scope` or "replaced" field. PURCHASING is an INVENTORY add-on (line 67).
- `.../module/CompanyModuleEntitlement.kt:39-55` holds the modules.
  - FINANCE, HRMS and PAYROLL are implemented. INVENTORY, SALES and MANUFACTURING are not. There is no PURCHASING module.
- The database has no CHECK constraints on codes (V11, V13, V22 store varchar). Adding codes needs no schema migration.
- `user-service .../shared/kernel/security/ModuleCodes.kt:38`: `COMMERCIAL_MODULES` is kept by hand. The `ModuleCodesContractTest` it names (line 33) does not exist (backlog line 181).
- **The catalog's Status column is stale.**
  - SIE is live in accounts: `/api/accounts/sie-imports` (`SieImportController.kt:52`) and `/api/accounts/exports/sie4` (`StatutoryExportController.kt:26`). Period close is live too.
  - So "built" must come from the code, not from the catalog. If SIE_SE is enforced as a region feature, non-SE demo companies that use SIE today would be refused.

**Resolver**
- `.../entitlement/EntitlementResolution.kt:152-265` resolves agreement → company → branch → feature. `source` exists on modules only (lines 37-52, 243).
- **Bug 1:** lines 199-229. The country match (`applies`) only feeds the default. A company row or branch override can still turn on a region feature in the wrong country.
- **Bug 2:** a company row can turn a statutory region feature off (line 212). In an extension module, region features default off (line 210).
- **Bug 3:** `EntitlementService.kt:444-454` accepts unimplemented modules. INVENTORY can be switched on as an extension.
- **Bug 4:** company status is not part of resolution. `RecordStatus` is ACTIVE / INACTIVE / SUSPENDED (`domain/model/common/RecordStatus.kt:7`). A suspended company still resolves its modules as on.
- `gatherInputs` (`EntitlementService.kt:388-424`) runs about 8 queries per resolution. There is no cache.

**How services check today: module only, at company level, with the person's token**
- `shared/neoerp-security/.../web/client/ModuleEntitlements.kt:25-50` calls `GET /api/org/companies/{id}/modules` with the caller's token on every request.
  - That endpoint returns raw level-2 rows (`CompanyModuleService.kt:52-55`). Branch overrides and features are ignored.
- `ServiceAuthorization.kt:96-103` runs after the permission step (88-94).
  - Refusals: 403 `MODULE_NOT_ENABLED`; 503 `ORG_UNAVAILABLE` when org cannot answer.
  - The person's branch is known at line 87 but not used for the module check.
- Accounts uses this shared path: `AccountsEndpoint.kt:33-38`. The review counts 249 handlers; the builder recounts at build. One handler sets `financeModule = false` (the preflight).
- **hr checks the module before the permission:** `HrAuthorization.kt:230` (`moduleAccessClient.isEnabled(...)` runs before `authzPermissions`).
- hr and payroll use their own clients: `HrModuleAccessClient.kt:23-30`, `PayrollModuleAccessClient.kt:64-79`, `PayrollAccessRules.kt:87`.
  - **When org is down they refuse as "module disabled", not 503.** FE changes this to 503 `ORG_UNAVAILABLE`. That is a visible behaviour change.
- Machine posting checks modules through internal facts (`MachinePostingService.kt:217-238`).
  - The internal facts endpoint answers from level-2 rows only (`OrgFactsService.kt:32-90`).
  - Its refusal message says "isn't part of your plan" (line 236), which RULES §2 forbids.
- org-service and audit-service set no `module-code` (security-tiers.md:216; backlog line 117).

**App**
- **Field mismatch.** The app reads `enabledModules` (`AuthSessionDtos.kt:110`). The backend sends `selectedCompanyModules` (`user-service AppBootstrapDtos.kt:35`; filled at `AppBootstrapService.kt:115,163-175`).
  - So the app always falls back to modules derived from permissions (`AuthSessionMapper.kt:257-268`). It never hides anything by entitlement.
- **Platform persons see every module, even inside an Enter-company session.**
  - `resolveEnabledModules` returns all modules when `platformSuperAdmin` (`AuthSessionMapper.kt:262`).
  - `isModuleEnabledForSession` short-circuits on `platformSuperAdmin` (`NeoShellHelpers.kt:233`).
- There is no feature gating in the app.
- The company feature grid already opens the reason gate (`CompanyModulesTab.kt:560-580`).

**The RULES §5 reason gate on the company feature toggle** (the finding is in `docs/agents/agreements-entitlements-review/review.md:83`)
- The backend calls `validate()` on every entitlement write (`EntitlementService.kt:467-482`).
- But `validate()` uses `require()`, which throws `IllegalArgumentException`. That becomes a 400 **without `fieldErrors`** (`GlobalExceptionHandler.kt:217-229`).
  - The gate's contract is `fieldErrors.reason`, as given by `ReasonGate.requireReason` (`application/service/common/ReasonGate.kt`).
  - So the entitlement paths answer in a different shape, and the app cannot place the error next to the reason box.
  - There is no field-error form for the amendment reference either.
- Still open:
  - the design rig toggles without a gate (`NeoERP-App/docs/design/screen-rig/entitlements.jsx:27,263`);
  - no test covers the company feature path;
  - the legacy replace-all (`CompanyModuleService.kt:101-128`) writes no `entitlement_changes` row.

**Franchise**
- `AgreementService.kt:55-84` and `AgreementResolution.kt:76-104` resolve: own → addendum → parent → NONE.
- Feature decisions come from the governing agreement only. Addenda carry modules only.
- An ACTIVE agreement past its end date keeps granting (`findFirstByCompanyIdAndStatus`).

---

## 2. Target design

### 2.1 Resolved-feature model (org-service, one resolver)

**Catalog fields (new)**
- `statutory: Boolean`. Allowed only with `region` and `kind = INCLUDED`.
- `scope: COMPANY | BRANCH`.
  - COMPANY features: VAT returns, SAF-T, statutory files, EU sales lists, budgets, budget control, consolidation, intercompany, fixed assets, period close, financial statements, SIE, payroll statutory reporting, and similar.
  - BRANCH features: FBR digital invoicing, e-invoice sending, point of sale, attachments, and similar.
  - The builder proposes the full column. The lead reviews it.
- `replacedBy` (INVENTORY.PURCHASING → module PURCHASING).

**Each `ResolvedFeature` gains**
- `source`: INHERITED / OVERRIDDEN / ADDENDUM / OWN_AGREEMENT / NOT_ENTITLED.
- `statutory`, `scope`, `applies`.
- `offCause`: one of `MODULE_OFF`, `NOT_IN_AGREEMENT`, `OFF_FOR_COMPANY`, `OFF_FOR_BRANCH`, `NOT_FOR_COUNTRY`, `REPLACED`, `COMPANY_SUSPENDED`, `COMPANY_INACTIVE`, `BRANCH_INACTIVE`.

**Rules**
- A region feature is effective only when the company's country matches, whatever the stored rows say (fixes Bug 1).
- A statutory feature, in an effective module and for a matching country, is on. A company row does not change it (fixes Bug 2).
- A BRANCH-scope statutory duty may be switched off at a branch that does not trade, with the reason gate.
- A COMPANY-scope feature is resolved at company level only. Branch overrides on it are refused (see 2.4).
- A replaced feature never resolves on.
- A suspended or inactive company resolves to nothing, with the cause. An inactive branch resolves to nothing for that branch, with cause `BRANCH_INACTIVE` (Q11).
- **No data migration** (review M2).
  - Stored rows that contradict a rule are ignored by the resolver.
  - The Company → Modules screen shows "Required by law" or "Not for this country" next to them.
  - Clean-up happens through normal reason-gated writes.

### 2.2 How the answer reaches each service (review H1)

| Option | Latency | Staleness | Verdict |
|---|---|---|---|
| A. Claim in the token | 0 calls | Until token refresh | Rejected. Large tokens, commercial data in auth, and an auth change. |
| B. Bootstrap only | 0 calls | Until next bootstrap | For the app only. Cannot enforce. |
| C. Service reads org with its **machine token**, cached per (company, branch) | 1 call per cache period | ≤ 30 s | **Recommended for services.** |

**Recommendation: C for services.**
- Services read through `POST /api/internal/org/facts/resolve`, using their own machine token (scope `org.facts.read`, as user-service does today).
  - It gains `featureChecks [{companyId, branchId?, moduleCode, featureCode}]`.
  - Its `moduleChecks` move to the resolved chain: branch-aware, status-aware.
  - One request returns the whole effective set for the (company, branch).
- The read happens **only after step 3 has authorised the person** at that company and branch. A person's token never fills a cache that other people use.
- Cache:
  - 30 s per service instance (`neoerp.security.entitlement-ttl`), with a maximum number of entries.
  - **401, 403 and 404 answers are never cached and never become 503.** A 403 from org is a configuration error: it is logged and answered as 503 `ORG_UNAVAILABLE` for that request only, never stored.
  - The stale window (`entitlement-stale-window`, 5 min) applies only to transport errors and 5xx, and only for reads.
  - Writes need an answer that is at most 30 s old, otherwise 503 `ORG_UNAVAILABLE`.
- **The app and bootstrap** use a separate endpoint, `GET /api/org/companies/{companyId}/entitlements/effective?branchId=`.
  - It has its own read rule: any active member of that company, or platform staff with company access, per IAM rules.
  - It returns codes and off-causes only. No agreement references, extension references or reasons.
  - It sends an ETag.
  - The contract doc must say plainly that off-causes such as `NOT_IN_AGREEMENT` tell members a commercial fact. This is accepted.
- **Which branch is checked (review M1).**
  - Only the trusted selected context: a branch session, or the branch the person selected (`ServiceAuthorization.kt:87`). Never a request parameter or body field.
  - If the branch cannot be resolved on a read, the check falls back to company level, matching line 175-180 behaviour. This is written down in the contract. A write without a resolved branch is already 503 `AUTHZ_UNAVAILABLE`.

### 2.3 One shared check (`shared/neoerp-security`)
- `ModuleEntitlementSource` is replaced by `EntitlementSource.effective(companyId, branchId)`. It uses the machine client, and `CachedEntitlementSource` wraps it.
- `@ServiceEndpoint` gains `features: Array<String> = []`.
- `ServiceAuthorization` step 4 becomes:
  1. module check, branch-aware;
  2. feature checks — COMPANY-scope features at company level, BRANCH-scope features at the person's branch.
- **Default rule (review M4).**
  - A feature gates writes.
  - Reads of existing records stay allowed unless the map says `gateReads = true`. Example: an Owner can still read old budgets after BUDGETS is turned off.
  - The golden map has a "reads gated" column.
- Public bean `EntitlementGate.require(companyId, branchId, module, feature, read)` gives the same check and the same refusal. hr and payroll use it.
- **Startup check.**
  - Unknown codes, or codes of another module, fail startup.
  - In a service with `module-code`, every `@ServiceEndpoint` must declare `features` or `features = ["*MODULE"]` (module only).
  - `moduleCheck = false` endpoints may declare no features. The check lists them.
  - The list of `*MODULE` endpoints and `moduleCheck = false` endpoints is printed in the build report for the lead to review.
- **Codes come from one place:** a new pure-Kotlin module `shared/entitlement-catalog` (Q6).
  - org `ModuleFeature.kt` delegates to it.
  - user-service `COMMERCIAL_MODULES` is derived from it.

### 2.4 Error contract
- **403 `FEATURE_NOT_ENABLED`** (new)
  - Message is fixed: "{Feature} is not on for this company" or "… at this branch".
  - `details { moduleCode, featureCode, branchId|null, cause }`.
- **403 `MODULE_NOT_ENABLED`**: the code stays. It gains `details { moduleCode, branchId, cause }` and now fires for branch overrides, suspension and inactivity.
- **503 `ORG_UNAVAILABLE`**: unchanged. hr and payroll now give this too.
- Order of checks: token → permission → module → feature → the service's own checks. Applies to hr and payroll too.
- Machine posting uses the same codes. The "plan" wording goes.
- New org write refusals (409):

| Code | When |
|---|---|
| `STATUTORY_FEATURE_REQUIRED` | Company-level off on a statutory feature for its country |
| `FEATURE_NOT_FOR_COUNTRY` | Turning on a region feature for another country |
| `FEATURE_COMPANY_SCOPED` | Any branch override on a COMPANY-scope feature |
| `FEATURE_REPLACED` | Any write to INVENTORY.PURCHASING |
| `MODULE_NOT_IMPLEMENTED` | Switching on an unimplemented module (fixes Bug 3) |

### 2.5 App behaviour (ux-principles §6)
- **Session.**
  - Bootstrap gains `selectedContextEntitlements`: the effective set for the selected company **and the selected branch**.
  - The app reads it into `NeoUserSession.entitlements`. The field mismatch is fixed.
  - The permission fallback stays only when the field is absent.
- **Platform persons (review item 3).**
  - Inside an Enter-company session they follow the company's entitlements.
  - Change `resolveEnabledModules` and `isModuleEnabledForSession`: the "all modules" shortcut applies only in the platform view, not when `companyAccess.inside`.
- **Hidden.** A module or feature that owns a menu item, tab, route or action is hidden. One map, `NeoFeatureMap`, links each `NeoDestination` and action to its feature.
- **Disabled with a reason** only where records already exist. They are read-only, with one line ("Budgets are off for {company}").
  - Owners get **Request** (the existing FEATURE request).
  - Others see "Ask your company admin".
  - For `NOT_IN_AGREEMENT`, the Owner's text says Neovatus decides.
- **Statutory.**
  - Company → Modules shows "Required by law" in place of the switch.
  - The branch override shows only for BRANCH-scope duties.
  - Contradicting stored rows show "Required by law" or "Not for this country".
- **Refusals.** A 403 `FEATURE_NOT_ENABLED` or `MODULE_NOT_ENABLED` re-fetches the set and shows the page error (§22). The app also re-fetches on context switch, and on focus after 5 min.

---

## 3. Data and migrations (numbers = next free on origin/dev at build)

| Service | Migration | Content |
|---|---|---|
| org | **none** | No code constraints. Contradicting rows are ignored by the resolver (M2). INVENTORY.PURCHASING rows (if any) resolve off. The builder reports counts per environment: contradicting statutory and region rows, INVENTORY rows, OFF branch overrides. |
| user | none | Bootstrap is code only. Permission → feature greying is later (Q10). |
| accounts, hr, payroll, audit | none | — |

There is no clash with SB2d's accounts V59–V62.

---

## 4. Franchise handling (each franchise is its own company, RULES §7)

| Source | Agreement level used | Features |
|---|---|---|
| INHERITED | Parent's modules and feature decisions | The franchise's own company and branch rows. **Note:** it inherits the parent's bought add-ons; billing must know (§8 arrangement 1). |
| ADDENDUM | Parent's modules plus addendum modules (only while the addendum is in force) | Addendum modules follow catalog defaults. An add-on there is off unless switched on as an extension (Q12). |
| OWN_AGREEMENT | Own agreement only | Own decisions. Group expiry is still shown (§8). |
| NOT_ENTITLED (NONE) | Nothing | Extensions only |
| OVERRIDDEN | Branch deviation | Reported per feature too |

- Statutory and region rules use the **franchise's own country**.
- Franchisor switches and extensions never flow down.
- Closes backlog line 159.

---

## 5. Statutory region features

- Recommended statutory list (Q4):
  - FINANCE: TAX_FILING_PK, FBR_DIGITAL_INVOICING_PK, VAT_RETURN_NO/SE/DK/FI/IS, EINVOICE_SEND_NO.
  - Asked as a question, not decided silently: SAF-T NO/DK, STATUTORY_FILES_FI/IS, and payroll STATUTORY_PK/NO/SE/DK/FI/IS.
- Not statutory (region only): SIE_SE, EINVOICE_SEND_SE/DK/FI/IS.
- **HR_GDPR:** catalog Q5 says legal duties come on automatically. GDPR does not apply to PK. Asked in Q4, not a silent deviation.
- Behaviour:
  - On automatically when the module is effective and the country matches.
  - Company off → 409.
  - Branch off only for BRANCH-scope duties.
  - An agreement cannot leave one out (`Agreement.normalizeFeatures` already refuses region features).
  - A country change re-resolves on the next read.

---

## 6. The §5 reason-gate fix (slice FE-0)
1. **Make `EntitlementService.validate()` (lines 467-482) use `ReasonGate`.**
   - Missing reason, or one under 6 characters → 400 with `fieldErrors.reason`.
   - Add `ReasonGate.requireAmendmentReference(ref)` → 400 with `fieldErrors.amendmentReference` when an extension lacks one.
   - Same shape as every other gate (`CompanyFieldValidationException`), not the bare `IllegalArgumentException` (`GlobalExceptionHandler.kt:217`).
   - The app's `NeoReasonGate` already places field errors. The builder checks it handles `amendmentReference`.
2. Tests on every path, each asserting the body shape and that nothing was written (no row, no history, no audit): company feature on, off and clear; company module; branch module (both platform and company callers); branch feature; request approval.
3. **Legacy replace-all:** route each changed module through `setCompanyModule`, so one history row is written per change. If nothing calls the endpoint, retire it. The builder greps first.
4. **Rig:** `entitlements.jsx:27,263`. `toggleFeature` opens `setPending` like `toggleModule`. Sync the block in `app.html:6144`.
5. **App test:** the checkbox opens the gate, cancel reverts, and turning off uses the destructive gate.

---

## 7. Slices (in order)

| Slice | What | Size | Builder / reviewer | Tests (named) | Parallel? |
|---|---|---|---|---|---|
| **FE-0** | §5 closure (section 6) | S | Sonnet / Sonnet | `StatusChangeReasonTest.companyFeatureWithoutReasonIs400FieldErrorReasonAndWritesNothing`, `…companyFeatureClearWithoutReason…`, `…extensionWithoutReferenceIs400FieldErrorAmendmentReference`, `…companyModule…`, `…branchModuleByCompany…`, `…branchFeature…`, `…requestApproveNeedsReason`; `CompanyModuleReplaceHistoryTest.replaceAllWritesOneChangeRowPerChangedModule`; app `CompanyFeatureGateTest` | Org and rig only. Can run during SB2d, but only in its own worktree. |
| **FE-1** | Catalog. `shared/entitlement-catalog` module. 84 new codes: FINANCE 43, HRMS 15 (no PERFORMANCE_GOALS, catalog Q6), PAYROLL 16, INVENTORY 2, SALES 2, PURCHASING 4, MANUFACTURING 2. PURCHASING module (`implemented=false`). INVENTORY.PURCHASING `replacedBy`. `statutory`, `scope`. user-service derives `COMMERCIAL_MODULES`. | M | Sonnet / Sonnet | `ModuleFeatureCatalogTest.existing24CodesUnchanged` (golden), `…codesUniquePerModule`, `…regionIsOneIso2`, `…statutoryImpliesIncludedAndRegion`, `…everyCodeHasScope`, `…matchesApprovedCatalog`; user `ModuleCodesContractTest` | See ordering note below |
| **FE-2** | org resolver and API. Bugs 1–4. Statutory and scope rules. Per-feature source and offCause. Status causes. `/entitlements/effective` (app only, ETag). `featureChecks` plus resolved `moduleChecks` on internal facts. The 409 codes. Contract doc `docs/api/org-entitlements-effective.md` written **first**. | M–L | Opus / **Opus** | `EntitlementResolverTest.regionFeatureNeverAppliesOutsideItsCountry`, `…contradictingStatutoryOffRowIgnored`, `…statutoryOnWithoutCompanyRow`, `…branchScopeDutyOffAtBranch`, `…companyScopeIgnoresBranchOverride`, `…replacedFeatureResolvesOff`, `…suspendedCompanyResolvesNothing`, `…inactiveCompanyResolvesNothing`, `…inactiveBranchResolvesNothing`, `…featureSourceNamesEachProvenance`; `EntitlementServiceTest.statutoryOffAtCompanyIs409`, `…regionOnForOtherCountryIs409`, `…branchOverrideOnCompanyScopeIs409`, `…replacedFeatureWriteIs409`, `…unimplementedModuleOnIs409`; `EffectiveEntitlementsWebTest.memberReadsOwnCompany`, `…otherCompanyMemberRefused`, `…platformWithoutCompanyAccessRefused`, `…enterCompanySessionReads`, `…branchOfOtherCompanyIs404`, `…noReferencesOrReasonsInBody`, `…etagStableWhenUnchanged`; `OrgFactsFeatureChecksTest.machineTokenOnly`, `…moduleChecksNowBranchAndStatusAware`; `FranchiseEntitlementResolutionTest` (inherited incl. add-ons, addendum, lapsed addendum, own, none, `…statutoryUsesFranchiseOwnCountry`) | See ordering note |
| **FE-3** | Shared check. Machine-token `EntitlementSource` and cache. `features`, `gateReads`, scope handling. Branch from the trusted context only. `FEATURE_NOT_ENABLED`. Startup check. `EntitlementGate`. Accounts golden map (with "reads gated" column, and `*MODULE` / `moduleCheck=false` lists). FREE_DIMENSIONS on SB2d free-dimension writes. ADR-016 amendment. | L | Opus / **Opus** | `EntitlementGateTest.moduleOffAtBranchRefused`, `…featureOffRefusedWithCause`, `…companyScopeCheckedAtCompany`, `…cacheHitWithinTtl`, `…org403NotCachedAndNot503Cached`, `…org401And404NotCached`, `…staleOnlyForTransportOr5xxOnReads`, `…writeAfterTtlWithOrgDownIs503`, `…personBServedFromCacheOnlyAfterBPermissionCheck`, `…requestParamBranchIgnored`, `…unresolvedBranchOnReadFallsBackToCompany`, `…platformEnterCompanySession`, `…branchSession`, `…readsAllowedUnlessGateReads`; `ServiceEndpointFeatureStartupCheckTest.unknownCodeFails`, `…otherModuleCodeFails`, `…undeclaredEndpointFails`, `…moduleCheckFalseEndpointsListed`; `NeoErpRefusalAdviceTest.featureNotEnabledBody`; accounts `AccountsEndpointFeatureMapTest` (golden), `FreeDimensionFeatureTest.writeRefusedReadAllowed`, `SieFeatureTest` (per Q9); full accounts run green | **After SB2d is merged** |
| **FE-4** | hr and payroll use `EntitlementGate`. **Reverse hr's order** (permission first, `HrAuthorization.kt:230`). Org down → 503, not "module disabled". Map endpoints, including ESS. Machine posting checks FINANCE.PAYROLL_POSTING and PAYROLL.PAY_POSTING. "Plan" wording fix. | M | Sonnet / **Opus** | `HrFeatureGateTest.permissionCheckedBeforeModule`, `…orgDownIs503NotModuleDisabled`, `HrEssFeatureTest.ownLeaveWithLeaveAttendanceOff`; `PayrollFeatureGateTest`, `PayrollEssFeatureTest.ownPayslipNeedsPayrollPayslips`; `MachinePostingFeatureTest.payrollPostingOffRefused`, `…messageSaysNotOnNotPlan` | Alongside FE-5 |
| **FE-5** | Bootstrap `selectedContextEntitlements` (user-service, per selected branch). App: session, field-mismatch fix, platform-in-company fix, `NeoFeatureMap`, hide/disable, 403 re-fetch, Request, statutory pill and contradiction labels. | L (backend S, app L) | Sonnet / Opus for bootstrap, Sonnet for app | `AppBootstrapEntitlementsTest.perSelectedBranch`, `…orgDownOmitsField`; app `AuthSessionMapperEntitlementsTest.readsBackendField`, `…platformInsideCompanyFollowsCompany`, `DestinationFeatureAccessTest`, `FeatureRefusalRefetchTest`, `StatutoryFeaturePillTest`; iOS compile | Alongside FE-4; the app can start on mocks after the FE-2 contract |
| **FE-6** | Docs: entitlements-modules.md, security-tiers.md, agreements.md, standard-roles.md, user guide, backlog closures (lines 117, 159, 181) | S | Sonnet / Sonnet | — | Last |

**Ordering note (review M6).**
- The README says FE comes after SB2d. FE-0 to FE-2 touch no accounts code, so they may run alongside SB2d only if Jabran agrees, in separate worktrees (Q13).
- FE-1 and SB2d (its Q10 `DimensionSetV1` module) each add a shared Gradle module to `settings.gradle.kts`. Merge SB2d's first; FE-1 rebases on it.

---

## 8. Interaction with SB2d
1. **FREE_DIMENSIONS** (ADD_ON, off by default) gates writes of free-dimension values and their maintenance, including machine posting. Stored values stay readable. Branch, cost centre, project and department are foundations and are never gated.
2. **DIMENSION_REPORTING** (off by default) must not hide SB2d-4's filters. It gates only the later dedicated reports (Q8).
3. **Branch.** SB2d puts a branch on headers and on each journal line. FE checks at the person's trusted branch, not each line's branch.
   - A company-wide accountant may post a line tagged to a branch whose FINANCE is off.
   - BRANCH-scope features such as POINT_OF_SALE get a per-document branch check when Sales is built.
4. No accounts migration from FE.
5. The FE-3 accounts map is written against the merged SB2d endpoints.
6. Shared Gradle module ordering: see section 7.

---

## 9. Risks
- **Locking out live features.**
  - SIE is live (`/api/accounts/sie-imports`, `/exports/sie4`). As a region feature it would refuse non-SE demo companies (Q9).
  - Period close and other live endpoints must default on.
  - Mitigation: the "default-off but live" list is built from the code, not from the catalog's Status column, and reviewed before enforcement.
- **Branch overrides and suspension start to bite.** Counts are reported first.
- **hr/payroll behaviour change.** When org is down they now return 503 instead of "module disabled". The app must show the "try again" page error, not "not enabled".
- **Org outage.** Writes fail closed after 30 s. The cache lowers load compared with today's call on every request.
- **Up to 30 s of staleness** after a switch. The app re-fetches on refusal.
- **Contradicting stored rows stay in the data** until cleaned through normal writes. The screen labels them.
- **Off-causes tell members commercial facts.** Accepted; stated in the contract.
- **Size of the accounts map** (about 249 handlers, plus SB2d). The startup check prevents gaps.
- **Out of scope:**
  - seats and limits (RULES §10, existing guards);
  - agreement expiry (Q14);
  - addendum add-ons (Q12).

---

## 10. Needs Jabran's approval (auth / sign-in / security)
- **ADR-016 amendment.**
  - Step 4 becomes branch-aware module plus feature checks.
  - `FEATURE_NOT_ENABLED`.
  - Machine-token read after the person is authorised.
  - Cache rules: no caching of 4xx; stale window only for transport/5xx reads.
  - The startup declaration rule.
  - hr's check order is reversed.
- **New machine-scope use:** accounts, hr and payroll call `/api/internal/org/facts/resolve` with `org.facts.read`. Each needs a registered machine client.
- **Bootstrap (session payload):** adds `selectedContextEntitlements`. No change to tokens, Keycloak or auth-service.
- **Platform persons inside Enter-company** lose the "all modules" shortcut in the app.
- **Backlog line 117:** org-service and audit-service stay without a module check (platform layer). Record it in ADR-016.

---

## 11. Questions for Jabran (recommendation first, plain language)
1. **How do services learn what is on?** *Each service asks the organisation service with its own system login, after it has checked the person's rights, and remembers the answer for 30 seconds. Not inside the sign-in token.* It is fast, and a switch takes effect within half a minute.
2. **What does a refused person see?** *"{Feature} is not on for this company" (or "at this branch"), with the reason it is off.* The app can then say who to ask.
3. **Branch or company?** *Company-wide features (VAT returns, SAF-T, budgets, consolidation) are decided for the whole company and cannot be changed per branch. Branch features (invoicing to FBR, e-invoice sending, point of sale) can be changed per branch. People are checked at their own branch.* That matches how each feature is used.
4. **Which features are "required by law" and on automatically?** *Yes for: PK sales tax filing, FBR invoicing, VAT returns (NO, SE, DK, FI, IS), Norway e-invoice sending. Please confirm three more: (a) SAF-T NO and DK and the FI/IS statutory files — recommend yes; (b) payroll statutory rules per country — recommend yes; (c) GDPR tools — recommend on by default but not locked, because GDPR does not apply in Pakistan.*
5. **Old saved settings that contradict the law?** *No data clean-up script. The system ignores them and the screen labels them "Required by law" or "Not for this country". Someone tidies them with a normal, reasoned change.* No change happens without a reason.
6. **One shared list of feature codes?** *Yes, a small shared code module used by every service.* No copies to drift apart.
7. **The old "Purchasing" feature under Inventory?** *Keep it as a record, mark it replaced by the new Purchasing module, and never switch it on.* Inventory was never sold, so nothing moves.
8. **Dimension reporting?** *It controls only the future dedicated dimension reports, not the simple filters the dimensions work adds.* Otherwise those filters disappear for everyone.
9. **SIE (Swedish file import/export) is already live.** *Make it Sweden-only as approved. Non-Swedish demo companies lose the SIE screens.* The builder lists every other live screen that would switch off for your yes or no first.
10. **Grey out role permissions for features that are off?** *Later, not in this work.* Enforcement does not need it.
11. **Suspended or inactive company or branch?** *Nothing is on for it, and the person is told why ("Company suspended", "Branch inactive").* Safer than letting work continue.
12. **Paid extras for a franchise covered by the group's addendum?** *Not now. Use an extension with an amendment reference, or give the franchise its own agreement.*
13. **Start the first three steps while the dimensions work is still being built?** *Only if you want it sooner: separate workspaces, and the dimensions work merges its shared module first.* Otherwise wait, as the plan says.
14. **Expired agreements?** *Not part of this work. Add a release-gate item: decide a grace period after expiry, then stop features.* Today an expired agreement keeps everything on.

---

### Critical files for implementation
- /Users/jabransiddiqui/Offices/Neovatus/NeoERP/NeoERP-BackEnd/services/org-service/src/main/kotlin/com/neovatus/org/domain/model/entitlement/EntitlementResolution.kt
- /Users/jabransiddiqui/Offices/Neovatus/NeoERP/NeoERP-BackEnd/services/org-service/src/main/kotlin/com/neovatus/org/application/service/entitlement/EntitlementService.kt (with `application/service/common/ReasonGate.kt` and `application/service/facts/OrgFactsService.kt`)
- /Users/jabransiddiqui/Offices/Neovatus/NeoERP/NeoERP-BackEnd/services/org-service/src/main/kotlin/com/neovatus/org/domain/model/module/ModuleFeature.kt
- /Users/jabransiddiqui/Offices/Neovatus/NeoERP/NeoERP-BackEnd/shared/neoerp-security/src/main/kotlin/com/neovatus/security/web/authz/ServiceAuthorization.kt (with `web/client/ModuleEntitlements.kt`, `web/authz/Endpoints.kt`)
- /Users/jabransiddiqui/Offices/Neovatus/NeoERP/NeoERP-App/composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/features/auth/data/mapper/AuthSessionMapper.kt (with `AuthSessionDtos.kt:110`, `ui/shell/NeoShellHelpers.kt:233`)

Also touched:
- `services/hr-service/.../configuration/security/HrAuthorization.kt:230` and `HrModuleAccessClient.kt`
- `services/payroll-service/.../security/PayrollModuleAccessClient.kt` and `PayrollAccessRules.kt:87`
- `services/accounts-service/.../configuration/security/AccountsEndpoint.kt`
- `services/accounts-service/.../posting/MachinePostingService.kt:236`
- `services/user-service/.../shared/kernel/security/ModuleCodes.kt`
- `services/user-service/.../app/bootstrap/AppBootstrapService.kt`
- `services/org-service/.../module/CompanyModuleService.kt`
- `services/org-service/.../delivery/http/error/GlobalExceptionHandler.kt:217`
- `NeoERP-App/docs/design/screen-rig/entitlements.jsx:27,263`
- `NeoERP-App/.../organization/presentation/organization/CompanyModulesTab.kt:560-580`
- `settings.gradle.kts` (shared module ordering with SB2d)

---

## 12. Jabran's decisions (2026-11-05)
- **Q1 approved:** services check the company's agreement → company → branch modules and features (machine-token read of org, 30 s cache), on top of the person's role permissions.
- **Q5 changed:** we are in development with no released customers, so **upgrade the data**: an org migration (FE-2) removes saved company/branch feature rows that contradict the statutory/region rules, writing one `entitlement_changes` history row per removed row with the system reason "FE upgrade: {rule}". No audit-outbox rows written from SQL. Builder reports the counts.
- **Q7 changed:** Inventory and Purchasing are not built yet, so there is nothing to keep — **upgrade**: move any `INVENTORY.PURCHASING` rows to the new PURCHASING module (module rows, with history), then remove the old code from the catalog instead of keeping a "replaced" marker. `FEATURE_REPLACED` is not needed. Expected row count is 0 (demo data only); the builder confirms it.
- Q2–Q4, Q6, Q8–Q14: awaiting confirmation.
