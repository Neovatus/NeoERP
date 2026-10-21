# HR, Payroll and ESS — design gate (for Jabran)

Owner: Code · HR & Payroll lead (trial). 2026-10-21. Supersedes design-gate-bundle-1.md and -2.md (same G-1…G-6, plus G-7…G-9 for the Nordic payroll). Answer "all as recommended" or "all, except …". Everything is Draft until you approve; approval changes the status lines, not the files.

| # | Question | Recommendation | If yes |
|---|---|---|---|
| G-1 | Rig drops 1 and 2: HR employee record, organisation, ESS shell; Payroll runs, payslips, setup, PK filings (`NeoERP-App/docs/design/screen-rig/app.html`, specs `hr-h1.md`, `payroll-p.md`) | Yes, after your click-through | Build reference for HR H0/H1 and Payroll P0–P4 |
| G-2 | Contracts H0, H1, P0–P4 and the reserved roles, as amended to 2026-10-21 | Yes | Builds can start when the ERP lead allows |
| G-3 | A run can be reversed after its payslips are published (with an acknowledgement), including runs not yet posted; old payslips show "Replaced" | Yes | Mistakes are fixed before payment without a separate correction run |
| G-4 | Rig drop 3: Leave, Time, approvals inbox, lifecycle (hire, move, re-hire, leaver), ESS Leave and Time (specs `hr-h2-h3.md`, `hr-h4.md`) | Yes, after your click-through | Build reference for H2–H4 |
| G-5 | Contracts H2 (leave), H3 (time), H4 (lifecycle) | Yes | HR builds after H0/H1 |
| G-6 | Young-worker roster checks only in the six full countries; no school-term hour limits in v2 | Yes | Fewer rules to verify before launch |
| G-7 | Nordic payroll design (NO, SE, DK, FI, IS): tax-card import, country pay settings with money traces, reporting and corrections, posting preview (rig `#pay:<company>\|setup\|country`; flows `docs/drafts/hr-payroll/payroll-p5…p9-*.md`) | Yes, as a Draft baseline | Country work continues on this shape; nothing is called country-ready |
| G-8 | Contracts P5–P9 plus the shared amendments (P1-43 import, P4-A9…A14 reporting, P2 Nordic roles), as Draft baselines | Yes, as Draft baselines | Each country is built only after its facts, pack roles and practitioner check (J-8) are in |
| G-9 | The supported/blocked country matrix in `payroll-p.md` (PK, NO, SE, DK, FI, IS, base) is the honest launch-readiness view | Yes | Sales and pilots use it; blocked items name their owner |

**Known, not blocking design approval:**
- Country figures are "Pending verification" until each country's practitioner (J-8). PK leave and time were corrected from official sources; PK payroll figures still need confirming.
- Nordic company facts come with ORG-FACTS-3 (ERP lead). Nordic posting roles come with Accounts pack 2026.4.
- ESS bank changes say "Sign in again" until `auth_time` is built (approved, ERP-89).
- Sweden's high-risk sick-pay protection has an HR contract (H2 §7.11i) but no HR screen yet, so SE sick pay shows a blocker.
- The rig is a design stand-in: no real parser, official file, authority call or production crypto.

**Reviews behind this:**
- every design batch had a fresh Opus review, and every High or Medium finding was fixed and re-checked: drop 3, the contract audit (35 findings), and batches 0, A, B1, B2, C, D and E;
- the last pass made 4,794 screen visits at six widths, including 320 px, with zero errors.
