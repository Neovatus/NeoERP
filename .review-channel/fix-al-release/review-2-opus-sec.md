Reviewer: Opus 5.5 security (D-43)
Reviewed: 3d643b6c7cf8c07319306312a00c350fdf95187d
Range: 8472c728b6efa0452b78f34d2a3cc15dbe64c4e4..3d643b6c7cf8c07319306312a00c350fdf95187d
Verdict: ACCEPT

Read-only review from the brief and `git diff 8472c728..3d643b6c` plus the consumers it touches. No Gradle run.

| # | Sev | Area | Finding |
|---|-----|------|---------|
| 1 | OK | Release state | Only `fin("APPROVAL_LIMITS", …)` loses `released = false`; default stays `false`, kind INCLUDED, scope COMPANY. Every other `released = false` line is unchanged; `unreleasedFeaturesAreExactlyTheComingLaterList` pins the remaining set exactly (drops only APPROVAL_LIMITS), so an accidental second release would fail it. |
| 2 | OK | Entitlement chain (RULES §3) | `released` is read only from the Kotlin catalog (`ModuleFeatures` ← `EntitlementCatalog`), no DB copy. Resolver: `effective = moduleEffective && on`, so a company row cannot make AL effective when FINANCE is not in the agreement/switched on; branch override stays INHERIT (COMPANY scope). Write path still runs the country/statutory checks after `requireReleased`. |
| 3 | OK | accounts-service | `ApprovalLimitController`: reads need `APPROVAL_LIMIT_READ` (check: READ or the kind's create/decide codes); propose/withdraw need `APPROVAL_LIMIT_UPDATE`; confirm/decline/acknowledge-alone need `APPROVAL_LIMIT_CONFIRM`. FEATURE_NOT_RELEASED was only an org write-path refusal; accounts gates on the effective feature from org, which still defaults off. Nothing is opened without a permission code. |
| 4 | OK | user-service | Stand-ins: `ApprovalFeatureGate` needs FINANCE on and `APPROVAL_LIMITS` effective (fails closed 503 when org is unreachable); `@PreAuthorize canUseApprovalStandIns` plus per-kind decide codes are unchanged. |
| 5 | OK | Features endpoint / App DTO | `CompanyModuleService` / `CompanyModuleHttpMapper` pass `feature.released` through; only the value changes. `offCause` moves from NOT_AVAILABLE to OFF_FOR_COMPANY for companies that have not switched it on. |
| 6 | OK | Demo seed | Change is in `scripts/seed-demo-tenants.sql` (run only by `seed-demo-tenants.sh` / `reset-local-dev.sh` through `docker exec psql` on the local container), not in any Flyway path. It runs inside the file's BEGIN/COMMIT; DELETE-then-INSERT on the two demo company ids makes reruns idempotent. It seeds no limits and no agreement row (correct for INCLUDED). |
| 7 | OK | Moved tests | `EntitlementServiceTest`: DIMENSION_REPORTING (INCLUDED, no countries, not statutory) passes every later write check, so removing `requireReleased` would make `assertRefused("FEATURE_NOT_RELEASED")` fail. `EntitlementResolverTest`: with stored `true` rows and FINANCE on, removing the `!feature.released` branches would turn `companyDefault`/`effective` true for DIMENSION_REPORTING, IMPORTED_DOCUMENTS and BUDGET_CONTROL (ADD_ON, which also keeps add-on coverage); `assertFalse(f.released)` also pins the catalog. Both kill the mutation. |
| 8 | LOW | Test gap | No AL-specific case for "company row on, FINANCE off/not in agreement → AL not effective". The generic `effective = moduleEffective && on` rule covers it, and TAX_FILING_PK's MODULE_OFF test exercises it (resolver test l.344). Optional: one assertion in `approvalLimitsResolvesOnWhenTheCompanySwitchesItOn`. |
| 9 | LOW | New positive test | `approvalLimitsCanBeSwitchedOnByTheCompany` calls `service(country)` twice per loop (re-stubs mocks). Harmless, and it proves no refusal for NO and PK. |

No new HIGH or MEDIUM findings.
