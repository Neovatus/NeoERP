# HR & Payroll — design gate, bundle 2 (for Jabran)

Owner: Code · HR & Payroll lead (trial). 2026-10-16. Answer "all as recommended" or "all, except …".

| # | Question | Recommendation | Consequence if yes |
|---|---|---|---|
| G-4 | Approve rig drop 3 (Leave, Time, approvals inbox, lifecycle: hire, move, re-hire, leaver; ESS Leave and Time) in `app.html`, with specs `hr-h2-h3.md` and `hr-h4.md` | Yes, after your click-through | They become the build reference |
| G-5 | Approve contracts H2 (leave), H3 (time), H4 (lifecycle), as amended to 2026-10-16 | Yes | HR builds after H0/H1 when the ERP lead allows builds |
| G-6 | Young-worker roster checks only in the six full countries (base-pack countries get none), and no school-term hour limits in v2 (H3 Q17) | Yes | Fewer rules to verify before launch; base-pack companies see no young-worker warnings |

Known, not blocking:
- Country rows are "to verify" until the J-8 practitioner. PK leave and time corrected from official sources (2026-10-13). Statutory leave never expires in the rig until each country's reminder lead time is checked.
- The compact time picker and calendar are rig stand-ins; the real ones come from the design-system checkpoint.
- Reviews: drop 3 Opus review (docs/reviews/hrp-drop3-review-2026-10-16.md) 1 High, 4 Med, 11 Low, all fixed (e4ecba2b) and re-checked PASS; two small follow-ups fixed after the re-check.

Click-through: #hr leave and time for Lahore and Kyst (NO); approvals inbox; hire wizard with bank details (waiting card); end an employment, then ESS as that person (ended card, payslips); London/Helsinki/Reykjavík show real HR screens.
