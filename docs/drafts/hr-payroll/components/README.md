# Shared component contracts for HR and Payroll

Drafted by the HR & Payroll lead, 2026-10-09, for ERP-lead approval. One contract per component, in the style of
`NeoERP-App/docs/design/specs/list-controls.md`. They are built in a design-system checkpoint (Kotlin Multiplatform
Compose, `designsystem/**`) before HR's first screen build. On approval the files move to
`NeoERP-App/docs/design/specs/` and building-blocks gets one bullet per component pointing to its file.

Already built and reused, not redone: `NeoMoney` / `NeoNumberFormat` / `NeoDateFormat` (CP-A1.2a),
`NeoSearchSelect` / `NeoMultiSelect` (list-controls, LC-n), `NeoDataTable`, `NeoTabs`, `NeoWizardStepper`,
`NeoSidePanel`, `NeoDialogSheet`, `NeoReasonGateDialog`, `NeoQuoteBlock`, `NeoOfflineStrip`, `NeoSkeleton`,
`NeoLoadError`, `NeoSafeArea`, `Modifier.neoBottomObstruction`.

## Index

| Component | File | Used by | Status |
|---|---|---|---|
| `NeoDateRangeField` (+ `NeoCalendarLocale`) | [date-range-field.md](date-range-field.md) | H2 leave requests, H3 periods, payroll runs and filters, report periods | Approved 2026-10-09 (ERP-1); moved to NeoERP-App/docs/design/specs/ |
| `NeoTimeField` | [time-field.md](time-field.md) | H3 attendance corrections and shifts, H2 hourly leave, ESS Time | Approved 2026-10-09 (ERP-1); moved to NeoERP-App/docs/design/specs/ |
| `NeoCalendarMonth` | [calendar-month.md](calendar-month.md) | H2 team calendar, record Leave tab, ESS "my month", pay-group calendar preview | Approved 2026-10-09 (ERP-1); moved to NeoERP-App/docs/design/specs/ |
| `NeoTimeGrid` | [time-grid.md](time-grid.md) | H3 rosters and timesheets | Approved 2026-10-09 (ERP-1); moved to NeoERP-App/docs/design/specs/ |
| `NeoStepper` | [stepper.md](stepper.md) | Payroll pay run (P2), H4 onboarding; enrollment via `NeoWizardStepper` wrapper | Approved 2026-10-09 (ERP-1); moved to NeoERP-App/docs/design/specs/ |
| `NeoVarianceTable` | [variance-table.md](variance-table.md) | Payroll 6.2 Calculate & review | Approved 2026-10-09 (ERP-1); moved to NeoERP-App/docs/design/specs/ |
| `NeoFileDownload` | [file-download.md](file-download.md) | Bank and payee files, filing files, payslip PDFs, CSV exports, attachments | Approved 2026-10-09 (ERP-1); moved to NeoERP-App/docs/design/specs/ |
| `NeoTabs` (extended) | [tabs.md](tabs.md) | H1 employee record, payroll inputs and setup; existing screens | Approved 2026-10-09 (ERP-1); moved to NeoERP-App/docs/design/specs/ |
| `NeoBottomTabBar` + `NeoPhoneSheet` | [bottom-tab-bar-and-phone-sheet.md](bottom-tab-bar-and-phone-sheet.md) | ESS shell (Home · Pay · Leave · Time · Me), employer switcher, request forms; phone form of other contracts | Approved 2026-10-09 (ERP-1); moved to NeoERP-App/docs/design/specs/ |
| `NeoApprovalCard` | [approval-card.md](approval-card.md) | H1 change requests, H2/H3 approvals inbox, H4 job changes, ESS My requests | Approved 2026-10-09 (ERP-1); moved to NeoERP-App/docs/design/specs/ |

Rule prefixes: DR, TF, CM, TG, ST, VT, FD, TB, BT/PS, AC.

## Changes these contracts make to existing pieces

- `NeoCalendarLocale` (new, `core/time/`): week start, week numbers, clock per country (DR-10, TF-1).
- `NeoDateField` adopts company-format typing, still accepting ISO (DR-12).
- `NeoWizardStepper` becomes a wrapper over `NeoStepper`; enrollment looks the same (ST-10).
- `NeoDataTable` gains a `footer` slot (VT-10).
- `NeoTabs` gains keys, an Underline style, counts and attention; the index overload stays (TB).
- `NeoSafeArea(consumeBottom = false)` for the ESS shell (BT-3).
- Standing departures for screen-standard: horizontal scroll in `NeoTimeGrid` (TG-1); full-width phone button in
  `NeoFileDownload` (FD §7).

## All open questions

**`NeoDateRangeField`**
1. Should `NeoDateField` move from ISO typing to company-format typing? *Recommend:* yes, same checkpoint, still accept ISO.
2. Week start and week numbers per country. *Recommend:* approve the table as a draft; the HR lead verifies each row with the leave packs before H2.
3. Own calendar or Material `DateRangePicker`? *Recommend:* own token-drawn grid (half days, per-day reasons, week start).

**`NeoTimeField`**
4. 24-hour everywhere except the US? *Recommend:* yes; revisit PK only if pilots ask (one row of `NeoCalendarLocale`).
5. Which zone is "the branch's"? *Recommend:* the branch's IANA zone, falling back to the company's; Org adds the field (*to verify* with the ERP lead).
6. Store the chosen offset for DST-overlap times? *Recommend:* yes; the API takes an ISO instant with offset.

**`NeoCalendarMonth`**
7. Spanning bars or a chip per day? *Recommend:* spanning bars with stable lanes per week.
8. Who may see a colleague's leave type? *Recommend:* the person's managers and HR see the type, others "Away"; health-related types are "Away" for managers too unless HR grants it (*to verify* per country).
9. ESS hours as "7,5 h" or "7:30"? *Recommend:* decimal in the company number format.

**`NeoTimeGrid`**
10. Allow horizontal scroll for this grid only? *Recommend:* yes, as a recorded standing departure.
11. Paste a block from a spreadsheet? *Recommend:* later; single-cell copy and paste now.
12. Enter moves down or right? *Recommend:* down, as the journal grid (LC-18).

**`NeoStepper`**
13. Does a Skipped step open? *Recommend:* yes when its page explains what happens instead; otherwise no.
14. Payslips and Filings as steps or tabs of one step? *Recommend:* keep seven steps.

**`NeoVarianceTable`**
15. Add an absolute floor (`minAbs`) to the variance setting? *Recommend:* yes, default off.
16. Can the person who checked a flag also approve the run? *Recommend:* yes; four-eyes is on approval.
17. Percent-sign spacing per country? *Recommend:* add `NeoNumberFormat.percent()` (*to verify* per country).

**`NeoFileDownload`**
18. Audit every bank-file and payslip download? *Recommend:* yes for bank, filing and admin payslip downloads; not an employee's own payslip.
19. Do generated files expire? *Recommend:* signed links expire after 15 minutes; "Make again" (*to verify* with the file-store ADR).
20. Full-width phone button as a departure? *Recommend:* accept for this component only.

**`NeoTabs`**
21. Drop disabled tabs for "selectable with the reason in the panel"? *Recommend:* approve (matches the H1 Pay tab).
22. Underline as a style of `NeoTabs` or a separate component? *Recommend:* one component, two styles.
23. Replace (not push) the route on tab change? *Recommend:* replace, so Back leaves the record.

**`NeoBottomTabBar` + `NeoPhoneSheet`**
24. ESS at ≥600: sidebar group or bottom bar in the 560 column? *Recommend:* sidebar group "Self-service".
25. `NeoSafeArea(consumeBottom = false)` for the ESS shell? *Recommend:* yes.
26. Rebuild `NeoSelectSheet` on `NeoPhoneSheet(height = Full)`? *Recommend:* yes, later, with no visual change.

**`NeoApprovalCard`**
27. No buttons or disabled buttons for someone who can't decide? *Recommend:* no buttons (ux-principles §6); amend hr-h1 §5 and the rig.
28. Bulk approve in the inbox? *Recommend:* not in v1.
29. Glossary "Request" means an ask to Neovatus. *Recommend:* add "Change request" and "Leave request"; never "request" alone in HR screens.

## Country items marked *to verify*

Week start and ISO week numbers per country (DR-10); 12-hour use in PK timesheets (TF-1); which zones have DST
(TF-5); privacy of leave types (CM-9); percent spacing (VT-2); bank and filing file names and formats (FD-3); audit of
downloads (FD-8); `ModalBottomSheet` on iOS in Compose Multiplatform 1.10 (PS, §9).
