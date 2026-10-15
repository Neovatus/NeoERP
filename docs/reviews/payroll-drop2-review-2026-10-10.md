# Design review addendum 2026-10-10: Payroll drop 2

Cowork · ERP lead (now reviewer). Export of the addendum to `design-review-2026-10-09.md` that was only in the project copy. Sent as ERP-11 to the HR & Payroll lead.

| Area | Verdict | Blocking items |
|---|---|---|
| **Pay runs (stepper)** | Ready after small fixes | PR-1 (the bank-change rule is missing in the pay step), PR-2 (Mark as paid has no guard) |
| **Setup, employee pay, payslips, filings** | Not ready yet (fixable) | PS-1 (a payroll admin can change her own salary), PS-2 (a missing NO tax card blocks the whole run instead of 50 % withholding), PS-3 (pay dates ignore public holidays) |

The money checks out: journals balance, and the s.149, AGA, OTP and feriepenger figures were recomputed and match. Every payslip line traces back to its rule version. Four-eyes and its refusals are well designed.

**ERP-lead clarification on the Owner's own rule (PR-3):** it is allowed only when **no other person in the company holds a payroll calculate or approve right**. If another payroll person exists, they calculate and the Owner approves, so four-eyes is always used when it's possible. This tightens ERP-4.

## Pay runs
| id | sev | finding | fix |
|---|---|---|---|
| PR-1 | **High** | Bank-details rule 4 (the 30-day notice; the requester can't release payment) is missing from the pay step and the spec | Per-employee "Bank details changed…" in review and bank file; block that requester from making or releasing the bank file |
| PR-2 | **High** | Mark as paid: future dates allowed, no bank file needed, no confirmation; it's one-way | Refuse future dates; warn without a bank file; confirm with totals and "only a correction run can change it" |
| PR-3 | Med | Owner's own offered while other payroll people exist | ERP-lead clarification above |
| PR-4 | Med | "Pick another posting date" with no date control | Add the field after the refusal, or drop the phrase |
| PR-5 | Med | Reverse run doesn't say published payslips will be replaced | Say it; mark them "Replaced" |
| PR-6 | Med | Correction run says "today's pay data" (rule 2) | Corrected data for {period} with the {period} rules |
| PR-7 | Med | Bank file has no control totals | Payments, amount, debit account, value date |
| PR-8 | Med | Errored employees not counted as left out; error copy contradicts the data; approver not reminded | Count them, align the copy, repeat on Approve and Pay |
| PR-9 | Low | Role name mismatch; Post enabled when it will fail | One name; disable with the reason |
| PR-10 | Low | Audit times go backwards | Fix the data |
| PR-11 | Low | Variance flag below threshold without a reason | Show the reason |
| PR-12 | Low | PSID offered for a private fund; mixed date styles | Bank transfer; one style |
| PR-13 | Low | New run for November enabled while October is unpaid | Say it up front; disable |
| PR-14 | Low | Wrong joiner tag; hours period not shown | Fix; "Hours: September 2026" |
| PR-15 | Low | Sidebar group mixes companies | Key it to the route's company |
| PR-16 | Low | Wrong "next step" toast | Derive it from the state |
| PR-17 | Low | Spec and rig name different owners | Align them |

## Setup, employee pay, payslips, filings
| id | sev | finding | fix |
|---|---|---|---|
| PS-1 | **High** | A payroll admin can change her own salary and then run it | Lock your own pay record, or route own-record changes to the approver; flag them in audit |
| PS-2 | **High** | A missing NO tax card blocks the whole hourly run | Withhold at 50 % with a per-employee warning; re-import for old cards |
| PS-3 | **High** | Pay calendar moves only weekend dates, not public holidays | Holidays from the country rules; "Moved from 25 Dec (Christmas Day)" |
| PS-4 | Med | "Ready for runs" while every row is not checked | Ready only when all rows are Checked (or labelled demo) |
| PS-5 | Med | Mid-month change: no proration preview, affected periods, recalculation link; FTE only as text | Preview the split; name periods and arrears; FTE as a field |
| PS-6 | Med | Moving pay group has no effective date | Ask for the date or period |
| PS-7 | Med | Every payroll admin sees executive pay in the list | Confidential pay group with its own code; amounts on open, logged |
| PS-8 | Med | Many payslips "Not in ESS" with no PDF or email route; leaver status inconsistent | Delivery column; batch PDFs; leavers keep their final payslip |
| PS-9 | Med | Total employer cost shows 0,00 | Fix the total |
| PS-10 | Med | NO June holiday cycle missing (ferietrekk, June feriepenger, half tax in December, over-60 supplement) | Add the elements and rule rows |
| PS-11 | Med | Two pension providers as one payee; OTP locked; skattetrekkskonto misdescribed; no union payee | One payee per provider; OTP as a company element with a 2 % floor; describe the company's own blocked account; add a union |
| PS-12 | Med | No payment deadlines (NO forskuddstrekk/AGA, PK PSID deposit); nowhere to record challan or payment | Payee payment rows with "Record payment"; link to s.165 |
| PS-13 | Med | EOBI, PESSI and SESSI on one role and account; employee EOBI mislabeled | Withdrawn by ERP-19 (D-85/D-97 stand) |
| PS-14 | Med | "Unpaid leave" set up as a taxable earning | A pay reduction |
| PS-15 | Low | PESSI not on payslips without a reason; SESSI head count; version diff wrong; PF 8.3 vs 8.33 % | Say why; fix the data |
| PS-16 | Low | Hourly joiner's first-pay copy wrong | Fix the copy |
| PS-17 | Low | No receipt attachment; no replacement A-melding path; misleading reissue example | Add them |
| PS-18 | Low | Setup tabs cut off on phone; Accountant can't see filing totals | Scroll fade or More menu; read-only totals |
