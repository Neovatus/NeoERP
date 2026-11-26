# Rules check: time and attendance (all workers), 2026-11-26

Research only; not committed. Read first: `docs/drafts/ADR-035-rates-hours-time.md`, `docs/VISION.md` §3.
Method: web search plus page fetches. Primary law texts were often NOT reachable from here (lovdata, finlex, at.dk and av.se pages returned 404 or no text). So many lines carry **not verified** and need a lawyer or a second pass on the official site. Where I rely on a secondary source I say so. Nothing here is legal advice.

## 0. Verdict on the owner's idea
The idea holds: **recording working time is a legal duty for employers in the EU/EEA, for every employee, not a project feature.** Projects, customers and billing are optional layers on top. Two refinements:
1. The duty is on **employees (and workers under the employer's control)**. Contractors and consultants are not covered by working-time law; their hours are recorded for **invoicing and cost**, not as a legal duty. Hired agency workers: see §5.
2. The legal record (attendance: how long, when, rest) and the cost/billing record (hours on project X, customer Y) are **two views of the same hours**. Keep one hours record and let allocation lines split it (see §8).

## 1. Duty to record working time
EU base: Directive 2003/88/EC (eur-lex.europa.eu/eli/dir/2003/88/oj). CJEU C-55/18 CCOO v Deutsche Bank, 14 May 2019: member states must require employers to set up an "objective, reliable and accessible" system that records each worker's effective daily working time; cost is no excuse (curia press release cp190061: curia.europa.eu/jcms/upload/docs/application/pdf/2019-05/cp190061en.pdf; ruling text not opened by me).

| Country | Duty and source | What must be recorded | Retention / access | Exempt | Status |
|---|---|---|---|---|---|
| Norway | arbeidsmiljøloven §10-7: an overview showing how much each employee has worked (lovdata.no/lov/2005-06-17-62/§10-7, fetched) | Hours worked per person. No format set. | Must be available to Arbeidstilsynet and the employees' tillitsvalgte. **No retention time in §10-7** (fetched). Employee access not stated in §10-7. | Leading and independent positions are outside the hours chapter (aml §10-12): not verified | Law text verified; exemptions not verified |
| Denmark | Arbejdstidsloven amended, in force 1 July 2024 (secondary: Bird & Bird, Deloitte, IDA; at.dk page not reachable) | **Total daily hours only**; start/end not required; need not be digital | Each worker must be able to see own record; secondary sources say 5 years back | Managing directors, self-employed, "selvtilrettelæggere" (self-organisers) | Secondary only; section numbers not verified |
| Sweden | Arbetstidslagen (1982:673) with AFS rules on notes for jour, övertid, mertid (AFS 1982:17, now believed restructured as AFS 2023:2, vendor claim) | Overtime, extra time and on-call time per person. No general daily start/end duty found. | Kept at the workplace while the notes apply (old AFS 1982:17, av.se PDF; current text not verified) | Not verified | Sweden has no clear general recording duty; EU Commission criticised Sweden on the Directive (DLA Piper note). **Treat as uncertain: check av.se and riksdagen.se.** |
| Finland | Työaikalaki 872/2019 (finlex.fi/fi/lainsaadanto/2019/872), employer keeps working-time records (työaikakirjanpito) incl. overtime, emergency and Sunday hours (secondary summary) | Hours incl. supplements | Old law: until the claim period ended, two years after the calendar year (2010 government bill). **Current retention not verified.** | Leading position and similar are outside the act: not verified | Section number and retention not verified |
| Iceland | Act 46/1980 as amended by Act 58/2023 (althingi.is/altext/stjt/2023.058.html; island.is/s/vinnueftirlitid/skraning-vinnutima) | Daily and weekly hours, time of day, rest periods, days off, deviations from rest rules | Employee can see 12 months back; regular hours may be shown by contract, with deviations recorded | Not verified | Official island.is page found; section numbers not verified |

Product consequence: store **actual start, end, breaks and total per day**, plus rest-period flags. Denmark only needs totals, but Norway, Iceland and the CJEU test are met by start/end. Keep records at least as long as the strictest country (not verified; default to 5 years until a lawyer confirms; Denmark gives 5 years of employee access).

## 2. Tax-authority staff registers (cash-intensive trades)
| Country | Rule | Source | Notes |
|---|---|---|---|
| Sweden | **Personalliggare** in restaurants, vehicle service, hair/beauty/body care, food and tobacco wholesale, laundries; construction has separate rules (byggherre provides the electronic system) | skatteverket.se/foretag/arbetsgivare/personalliggare/safungerarpersonalliggare (fetched); skatteverket.se/personalliggarebygg | Record per day: name, ID number, **start and end of each shift**, entered as the shift starts/ends. Unpaid and agency staff included. Electronic system must **log every change (who and when)** and let Skatteverket review back in time. Fee **12,500 SEK plus 2,500 per missing person**. Keep until two years after the end of the tax year's calendar year. Legal basis: skatteförfarandelagen (2011:1244), chapter not verified. |
| Norway | **Personalliste** for serveringssteder (restaurants, cafes, catering), frisør and skjønnhetspleie, bilverksted/bilpleie/bilvask | skatteetaten.no/bedrift-og-organisasjon/arbeidsgiver/personalliste/ (fetched) | Everyone working, incl. owner, unpaid and hired staff, with start and end of each day. Electronic allowed (booking or time systems) but spreadsheets or documents that can be edited are not allowed; must print/show/send during inspection. Unique codes allowed instead of ID number if a code list is kept. Exempt if 75 percent or more of turnover is outside these trades. Fee: 2 rettsgebyr per missing person (1,345 NOK each in 2026, search snippet). Construction sites are **not** in the Skatteetaten personalliste (not mentioned); Norway's construction ID-card rule is a separate Arbeidstilsynet rule, not verified. Retention not verified. |
| Finland | Construction: tax number register (rakennusalan veronumerorekisteri), ID card with tax number on shared sites; contractors have a reporting duty to Vero | vero.fi/syventavat-vero-ohjeet/ohje-hakusivu/48413/ ; yrittajat.fi summary | Not a staff clock register as such. Monthly-reporting detail: not verified. |
| Denmark | No staff register found | not verified | |
| Iceland | None found | not verified | |

Software requirement (Sweden, Norway): tamper-evident log, no free editing, exportable on the spot, shift start/end recorded as it happens. NeoERP's attendance record would need an "inspection export" and an audit trail for later corrections.

## 3. Pakistan
Search did not reach the official texts (pakistancode.gov.pk, provincial portals). Findings are from ILO NATLEX copies and secondary sites.
| Law | What I found | Status |
|---|---|---|
| Factories Act 1934 | Overtime at double the ordinary rate beyond 9 hours/day and 48 hours/week, cited as **s.47** by Pakistani secondary sources (WageIndicator, Dawn). Do not rely on India's 1948 Act (s.59). ILO copy: ilo.org/dyn/travail/docs/999/Factories Act 1934.pdf | Secondary; section numbers need check |
| Sindh | Replaced locally by the Sindh Factories Act 2015/2016 (sources disagree on the year); Dawn cites s.68(1) for overtime | Not verified |
| Shops and Establishments | West Pakistan Shops and Establishments Ordinance 1969 (Punjab, KP, Balochistan copy at balochistan.gov.pk/wp-content/uploads/2024/10/The-west-pakistan-shops-and-establishments-ordinance-1969.pdf). Sindh: Sindh Shops and Commercial Establishments Act 2015. It has chapters on daily/weekly hours and overtime wages. A 2025 Punjab amendment reportedly raised limits (10 h/day, 144 h/quarter overtime, 12 h spread) | 2025 figures from DLA Piper blog; gazette not seen. Not verified |
| Payment of Wages Act 1936 | Not found in results. | Not verified |
| Registers, retention | Not found for Pakistan (the 2-year retention I saw is the **Indian** Punjab Act, ignore it) | Not verified |
Product consequence: Pakistan needs shift/overtime rules as a **province-aware pack** (Punjab, Sindh, KP, Balochistan, ICT differ). Get a Pakistani labour lawyer to confirm registers (attendance, overtime, wages) and retention before the Pakistan pack.

## 4. Overtime, night, weekend, shifts (high level)
| Country | Rule | Source / status |
|---|---|---|
| Norway | Overtime supplement at least 40 percent (aml §10-6(11)); night work 21:00-06:00 only if the nature of work requires it (§10-11); Sunday and holiday work §10-10 | lovdata fetch. Collective agreements add higher rates and special shift rules (so rule packs). |
| Sweden | Limits for overtime and extra time in arbetstidslagen §8 and §8a; rates and night/OB supplements are **set by collective agreements, not law** | Limits recalled, not verified; "rates by agreement" is general practice, not verified |
| Denmark | 48 h average over 4 months, opt-out discussed; supplements come from collective agreements (overenskomster) | Not verified |
| Finland | Overtime supplements set in työaikalaki (50 percent first hours, 100 percent after, from memory); agreements vary | Not verified |
| Iceland | 11 h daily rest, 48 h weekly average over 4 months (island.is); overtime rates and supplements from collective agreements (kjarasamningar) | Rest and 48 h verified on island.is; rates not verified |
| Pakistan | Double rate beyond statutory hours, province-specific | see §3 |
Conclusion: law sets limits and some minimums; **supplements, OB, shift premiums and averaging come from collective agreements in SE, DK, IS and partly NO, FI.** Product needs agreement-based rule packs (versioned, dated), owned by Payroll as ADR-035 says.

## 5. Contractors, consultants, temporary and agency workers
- Employees' working-time law does not cover genuinely self-employed contractors. Recording their hours is for the **invoice and cost** (supplier timesheet, purchase invoice from time). It also helps to show real independence; hours imposed and supervised like an employee raise the employment-status risk (general principle; per-country test not verified).
- Norway hired workers: staffing law is aml §14-12 to §14-12 c (§14-12 c: hirer joint liability for pay). The hirer is meant to share responsibility for working time of hired staff (2011-12 Storting document; current text not verified). The Skatteetaten personalliste **includes hired staff**, so the hirer's system must record them. Sweden's personalliggare also includes agency staff (fetched).
- Practical rule: the **hirer records attendance on site**, the agency owns the employment and pay; the agency invoices from the hirer's approved hours.
- ERP practice: supplier timesheet approved, then purchase invoice or accrual (not verified per vendor; common pattern).

## 6. Privacy and GDPR for clock-in
| Item | Position | Source |
|---|---|---|
| Biometrics (fingerprint, face) | Special-category data (GDPR Art. 9). **Denmark: fingerprints for ordinary time registration not allowed**; less intrusive means exist (Datatilsynet vejledende udtalelse 29 May 2019, ref 2018-211-0135, via lovguiden.dk, secondary copy). Sweden IMY: consent hard to rely on for facial recognition for attendance/access because of employer power imbalance (IMY blog, not primary). Norway: strict conditions for identity features; old REMA 1000 Personvernnemnda case outcome not verified; Datatilsynet page fetched says nothing on stempling | Treat **biometric clock-in as off by default, per-company opt-in, with documented necessity**; offer PIN, card/NFC, QR or app login. |
| GPS / location | Employer monitoring is intrusive; store only as long as needed, access only with a work need (Datatilsynet.no page, fetched). Denmark: data collected for another purpose then used for working-time control is a new control measure; employees must be told in advance; Datatilsynet planned 2026 checks on GPS (secondary summary) | Geofence **check at clock-in only** (inside/outside site, store the result not a track) is the lower-risk design; continuous tracking: avoid. Legal acceptability per country not verified. |
| EDPB | Guidelines on biometrics/employment not opened. Not verified | |
| Pakistan | No data protection law in force; Personal Data Protection Bill still draft (2023 draft treats biometrics as sensitive; secondary sources). PECA 2016 relevance not verified | Biometric clock-in is commonly used there; still keep it opt-in and consent-logged. |
Design: collect the minimum, tell the worker (notice text per country), keep log of who saw what, delete on schedule.

## 7. Industry benchmarks
Only partly verified (searches returned vendor pages; I did not open each product manual). Treat as pattern, check each before a design decision.
| Product | Pattern |
|---|---|
| Planday | Scheduling plus time clock; approved hours pass to payroll (integration with Tripletex payroll found) |
| Tripletex, Visma Severa, TimeLog | Timesheets with project/activity and invoicing; Severa is a PSA tool (projects, resourcing, time entries, invoices); TimeLog passes approved time to Tripletex payroll |
| Harvest | Hours, overtime and rest tracking with compliance pages for Norway (marketing) |
| Quinyx, Fortnox, PowerOffice, Visma Business, SAP SuccessFactors, Workday, Odoo | **Not verified in this pass.** From general knowledge: Odoo separates **Attendance** (check in/out) from **Timesheets** (hours on project/task, sale-order link); SAP and Workday separate time recording from absence and have wage-type or pay-code mapping to payroll; Nordic payroll vendors take approved hours as pay codes. |
Shared pattern: (1) attendance/shift record, (2) project or activity allocation, (3) absence as its own type, (4) approval period (week or month), (5) export to payroll as hours by pay type, (6) invoice from billable lines, (7) internal projects for non-billable time.

## 8. Recommendation: NeoERP module split
1. **HR "Time and attendance" (core, every company):** one **hours record per person per day**: start, end, breaks, source (clock, app, manual, import), status, approver. Applies to employees, part-time, hourly, temporary and agency workers on site. Contractors optional.
2. **Work-time law checks in HR/T&A:** daily and weekly rest, maximum hours, night flag, per-company country rule pack; warnings, not pay.
3. **Absence and leave** stay in HR; absence is a time type, not a project.
4. **Allocation lines (optional) on an hours record:** split the day over project, customer, cost centre or activity. This is the single bridge to Projects. Customer without project is allowed (cost or bill per customer).
5. **Payroll:** owns rules and pay: supplements (overtime, night, weekend, holiday), agreement packs, cost rate. Reads approved hours by type. Never computes in T&A.
6. **Projects and Time (optional module):** projects, tasks, budgets, **bill rates**, time entry UI, invoice proposals, margin. Reads attendance hours; can also accept **time-only entries** for people who have no clock (consultants, contractors).
7. **Workforce scheduling (optional):** rotas, shift templates, swaps, availability. Planned shift is not worked time; clock-in confirms it into the T&A record.
8. **Contractors and agency:** supplier timesheets in Projects and Time; approved hours produce a purchase invoice or accrual in Accounts. Agency workers on site: attendance row linked to the agency supplier.
9. **Country pack (per country, dated):** statutory limits, supplement tables, collective-agreement rules (NO, SE, DK, FI, IS), personalliggare/personalliste export, province rules for Pakistan.
10. **Tax staff register (SE, NO):** not a separate product; a **report and inspection export** of the attendance record with unalterable audit log, for the listed trades.
11. **Privacy settings per company:** clock-in methods allowed, biometrics off by default, geofence check only, retention period, employee self-view of own records.
12. **Must-have for a first sale:** Norway: daily hours overview (§10-7), personalliste for restaurants/hair/car. Sweden: personalliggare with change log for restaurants/construction. Denmark: daily totals visible to the employee. Finland: records with overtime split; Iceland: records plus 12-month employee view. Pakistan: attendance, overtime and shift reports; legal specifics to confirm.
13. **Integration API:** back-office-only customers send clock events and hours through the API with the same checks (matches ADR-035 item 5).
14. **Approval:** week or month period close per company; locked after payroll cut-off; later changes as dated corrections with reason.

### What ADR-035 gets wrong or misses
- It puts **clock-in/out and attendance under Workforce scheduling** (table row 5). Attendance is a legal duty for every company, so it belongs to **HR core**; scheduling only plans.
- Open question 2 ("internal time for all employees, or only project time?") is answered: attendance for all is a legal duty; project allocation is optional.
- Item 2 says a time entry "needs a project (or an internal activity)". Change to: **an hours record needs none; allocation lines are optional**, and may reference a customer without a project.
- Contractors and agency workers are not covered; add a worker-type field (employee, hourly, temporary, agency, contractor) and the supplier-timesheet route.
- "Order after Payroll: Projects first, then scheduling" should move the **attendance record into HR H1/H2**, otherwise Payroll cannot take hours and the legal duty is unmet.
- Add legal retention and audit log requirements (SE, NO registers; tamper-evident log) and the privacy defaults (§6).
- Add: collective-agreement rule packs are versioned data owned by Payroll (already said), but T&A also needs the **legal limit rules** (rest, max hours) as a separate pack, since those are law, not pay.
- Pakistan: shift and overtime rules are provincial; ADR text says only "country".

## Not verified (list for a follow-up)
Denmark arbejdstidsloven section numbers and at.dk guidance; Sweden current recording duty (AFS 2023:2) and ATL §8/§8a; Finland TAL record section and retention; Iceland section numbers; Norway §10-12 exemptions and retention; SE skatteförfarandelagen chapter; NO personalliste legal basis and retention; Denmark and Iceland staff registers; all Pakistan registers and retention; EDPB guidance; IMY primary decision; benchmark products beyond Planday/Tripletex/Severa/Harvest.
