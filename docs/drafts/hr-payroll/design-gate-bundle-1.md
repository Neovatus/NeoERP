# HR & Payroll — design gate, bundle 1 (for Jabran)

Owner: Code · HR & Payroll lead (trial). 2026-10-15. Answer "all as recommended" or "all, except …".

| # | Question | Recommendation | Consequence if yes |
|---|---|---|---|
| G-1 | Approve rig drop 1 (HR employee record, organisation, ESS shell) and drop 2 (Payroll) in `NeoERP-App/docs/design/screen-rig/app.html`, with specs `hr-h1.md` and `payroll-p.md` | Yes, after your click-through | They become the build reference |
| G-2 | Approve contracts H0, H1 (HR foundation, employee record), P0–P4 (Payroll foundation, engine + PK pack, posting, pay and publish, PK filings) and `docs/drafts/hr-payroll/reserved-roles.md`, as amended to 2026-10-15 | Yes | Builds start when the ERP lead says so (after Accounts Phase 1) |
| G-3 | A run can be reversed after payslips are published, with an acknowledgement; ESS shows the old payslips as "Replaced" (P3 Q13, PR-5) | Yes | Mistakes are fixed before payment without a separate correction run |

Known, not blocking:
- ESS bank-account requests answer "Sign in again" until auth_time exists (ERP-89).
- Rig payroll journals fall back on a few accounts until the Accounts lead regenerates the demo chart (HRP-35).
- Country figures are "to verify" until the J-8 practitioner; PK leave/time corrected from official sources (2026-10-13), PK payroll figures not yet confirmed.
- Reviews: ERP-9 / ERP-11 findings all fixed (HRP-36); bank-details security gaps cleared (ERP-83).

Click-through routes: HR employee bank card (Lahore, EMP-0058); `#pay:lahore|run|RUN-LHR-2026-10-SAL` (requester bar); Sialkot Owner's own; reverse → ESS "Replaced".
Bundle 2 (drop 3: Leave, Time, lifecycle; contracts H2–H4) follows after DES-2.
