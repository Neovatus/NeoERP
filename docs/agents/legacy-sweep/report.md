# Legacy-shaped decisions sweep (Opus, read-only, 2026-11-16)

NJ = needs Jabran (sign-in/auth/security). Ranked by cost if left.

| # | Where | Now | Target | Effort |
|---|---|---|---|---|
| 1 NJ | App auth-architecture-decision/plan.md:77-78; backlog D-202 | token `sub` = old username; user-service matches identity id then username; AL matches old rows by sub | one person id: `sub` = stable identity id, IAM user id in every table; reseed dev data, delete both fallbacks now | M |
| 2 NJ | ADR-012:202-206,237-245 | hr-service takes companyId from client; 124 unscoped repo methods allowlisted | trusted tenant resolver in shared security now; new HR/Payroll on CompanyTenantScope from day one; delete old repos from allowlist | L |
| 3 NJ | security/standard-roles.md:79,191 | HR/Payroll role defaults on coarse interim codes | new HR/Payroll ship fine-grained codes + manifest architecture test | M |
| 4 | ADR-019:150,157 | HR→user EXITED direct call; Payroll reads HR directly; daily went_live safety job | new HR publishes lifecycle events on the relay; drop the daily job | M |
| 5 | ADR-021:41 | Department dimension owned by hr-service | Department as shared org dimension (org-service) | M |
| 6 | RULES.md:254-259; ADR-004; backlog:184 | two request queues (OrgRequest, workflow_items) | one request/approval model (shared approval-model) → one inbox | M |
| 7 NJ | ADR-016:57,64,67,85 | legacy scopes accepted; 7 audit legacy machine paths | only `neoerp.app` + capability scopes; delete transition list | S |
| 8 NJ | App app-shared-1/plan.md:84 | session role guessed from permissions | bootstrap returns membership roles | S-M |
| 9 NJ | accounts-decisions-for-jabran.md:254 | plaintext bank columns kept; backfill each start | run once, drop columns, delete BankDetailsBackfill | S |
| 10 | ADR-020:15-21,55,169-177 | HR/Payroll temp document stores + copy jobs | new HR/Payroll write FileStore directly; drop D14 copy | S |
| 11 | fe-plan/plan.md:62,238 | legacy replace-all modules endpoint (no history) | retire; only setCompanyModule | S |
| 12 | App cp-a2.2/plan.md:136 | Payroll source links plain text | new Payroll contract defines pay-run deep link | S |

Also: EMPLOYEE_ADVANCES control kind (new Payroll); roadmap pairs Payroll+ESS under one owner.
