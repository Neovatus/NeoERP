# Pakistan leave, holiday and working-time values: verification

Date checked: 2026-10-13. Inputs: PK rows of `NeoERP-BackEnd/docs/api/hrms-v2-h2.md` (§4.5, §4.5a, §7.4, §7.5, §7.11, Q17) and `hrms-v2-h3.md` (§5 PK row, §5.1 young-worker rows). No contract was edited.

Status: MATCH (our value equals the official text), DIFFERS (official text says something else), NOT FOUND (no official text retrieved, or the contract holds no value to compare; marked "(no contract value)" where the contract has none).
Source class: **O** = official government site, **S** = secondary (mirror, ADB, FAOLEX, law-firm or news copy; text read, but not the government's own page).

## Totals

| MATCH | DIFFERS | NOT FOUND | Total |
|---|---|---|---|
| 18 | 17 | 14 | 49 |

Retrieval limits: `punjablaws.gov.pk`, `pakp.gov.pk` (KP) and `ilo.org/natlex` refused or blocked the connection from this machine. Punjab Factories Act text therefore comes from a secondary copy (clr.org.pk, Punjab-amended text including the 2022 Act); KP acts and the Punjab Shops Ordinance were not opened. The federal (ICT) Factories Act text was not retrieved.

## Sources used

| Key | Document | URL | Class |
|---|---|---|---|
| FA-PB | Factories Act 1934 as amended in Punjab (to Act XXVI of 2022) | https://clr.org.pk/Labour-Laws/Punjab/Punjab%20Factories%20Act%201934.pdf (official page: http://punjablaws.gov.pk/laws/168a.html, not reachable here) | S |
| FA-SD | Sindh Factories Act 2015 (Sindh Act XIII of 2016) | https://www.sindhlaws.gov.pk/Setup/Publications_SindhCode/PUB-NEW-18-000110.pdf | O |
| SH-69 | West Pakistan Shops and Establishments Ordinance 1969 (Balochistan Government copy) | https://balochistan.gov.pk/wp-content/uploads/2024/10/The-west-pakistan-shops-and-establishments-ordinance-1969.pdf (Punjab copy: http://punjablaws.gov.pk/laws/230.html, not reachable) | O (Balochistan) |
| SH-SD | Sindh Shops and Commercial Establishment Act 2015 (Sindh Act XII of 2016) | https://www.sindhlaws.gov.pk/Setup/Publications_SindhCode/PUB-NEW-18-000109.pdf | O |
| ECA-91 | Employment of Children Act 1991 (federal) | https://lpr.adb.org/sites/default/files/2024-07/pakistan-employment-of-children-act-1991.pdf | S |
| CH-PB | Punjab Restriction on Employment of Children Act 2016 | https://faolex.fao.org/docs/pdf/pak164577.pdf and https://mcjhelum.lgpunjab.org.pk/wp-content/uploads/Restriction-on-Employment-of-Children-Act-2016.pdf | S |
| CH-BA | Balochistan Employment of Children (Prohibition and Regulation) Act 2021 (Act XII of 2021) | https://faolex.fao.org/docs/pdf/pak215795.pdf | S |
| ICT-BILL | Islamabad Child and Adolescent Labour (Prohibition and Regulation) Bill 2025 (introduced, not shown as enacted) | https://www.na.gov.pk/uploads/documents/689b4af2a0869_756.pdf | O (bill text) |
| MPL-23 | Maternity and Paternity Leave Act 2023 (Act XXXI of 2023) | https://na.gov.pk/uploads/documents/64b10b71ea5b7_929.pdf | O |
| CAB-26 | Cabinet Division circular F.No. 10-1/2025-Min-II, 19 Jan 2026, Public and Optional Holidays 2026 | https://www.cabinet.gov.pk/SiteImage/Misc/files/Holidays/2026/Public-Holidays-2026.pdf (index: https://cabinet.gov.pk/Detail/OTE2ODBiYmItZmI0MS00NDAwLWE5NGUtYmE1MGVjYzllMzAz) | O |
| CAB-N | Cabinet Division notifications: Eid-ul-Fitr 15 Mar 2026; Eid-ul-Azha 20 May 2026; Ashura 22 Jun 2026; Eid Milad-un-Nabi 21 Aug 2026 | https://www.cabinet.gov.pk/SiteImage/Misc/files/Holidays/EidulFitr%202026.pdf ; .../Holidays/2026/Eid-ul-Azha-holidays-Notification-20_05_2026.pdf ; .../Press%20Release/Notification_Ashura%20Public%20Holiday%2C%202026.pdf ; .../Press%20Release/Notification-Eid-Milad-un-Nabi-2026.pdf | O |

## A. Leave (hrms-v2-h2)

| ID | Our value (where) | Official value | Source | Status |
|---|---|---|---|---|
| L01 | Annual 14 days after 12 months, `ANNIVERSARY`, Factories Act s.49-B, Punjab and ICT (§7.4) | s.49-B(1): 14 consecutive days after 12 months' continuous service, inclusive of the weekly holiday | FA-PB s.49-B (S); ICT federal text not retrieved | MATCH (Punjab) |
| L02 | Same, Sindh Factories Act 2015 | s.73(1): 14 consecutive days after 12 months | FA-SD s.73 (O) | MATCH |
| L03 | Same, Shops Ordinance 1969 | s.14(1): 14 days with full wages after 12 months' continuous employment | SH-69 s.14 (O, Balochistan copy) | MATCH |
| L04 | Same, Sindh Shops Act 2015 | s.14(1): 14 days, full wages, after 12 months | SH-SD s.14 (O) | MATCH |
| L05 | Counting basis `CALENDAR_DAYS` if the factories act means "14 consecutive days" (§4.5 table) | Factories acts (FA-PB s.49-B, FA-SD s.73): "fourteen consecutive days, inclusive of" weekly holiday, so calendar days | FA-PB (S), FA-SD (O) | MATCH (factories) |
| L05b | Counting basis for shops acts (§4.5 table) | s.14 says "fourteen days" with no counting rule | SH-69, SH-SD | NOT FOUND |
| L06 | `carry_cap` PK draft 28 days (§7.5) | Factories: carried-forward holidays "shall not exceed fourteen" (FA-PB s.49-B(2); FA-SD s.73(2)), so 14 carried, 28 only as a total in the following year. Shops: total accrued leave may not exceed 30 days (s.14(2)(a), both shops texts); unused leave may instead be paid out at the employee's request (s.14(2)(b)) | FA-PB (S), FA-SD (O), SH-69 (O), SH-SD (O) | DIFFERS (cap meaning and shops figure 30) |
| L07 | Sick leave 16 days, half wages (§4.5, Q17), Punjab | s.49-H(2): "sixteen days' sick leave on half average pay in a year" | FA-PB s.49-H (S) | MATCH (Punjab factories) |
| L08 | Sick leave cited to "Factories Act 1934 s.49-B" (§4.5) | s.49-B is annual holidays; sick leave is s.49-H(2); the Ordinance section is s.15(2) | FA-PB (S), SH-69 (O) | DIFFERS (citation) |
| L09 | Sick leave 16 days half wages, Sindh (§4.5: both Sindh acts) | Sindh Factories Act s.79(2): 16 days sick leave on **full pay** | FA-SD s.79 (O) | DIFFERS (pay rate) |
| L10 | Sick leave 16 days half wages for shops (Ordinance 1969, Punjab) | s.15(2): **8 days** full wages a year; unused days carry forward, accumulation at most 16 | SH-69 s.15 (O, Balochistan copy; Punjab copy not opened) | DIFFERS (days and pay) |
| L11 | Same for Sindh Shops Act | s.15(2): 8 days full wages; accumulation at most 16 | SH-SD s.15 (O) | DIFFERS |
| L12 | Sick leave KP and Balochistan "once covered" | KP Factories Act 2013 (Act XVI of 2013) and KP Shops Act 2015 (Act XX of 2015) operative text not opened (site refused connection); secondary guides conflict (16 days half pay vs full pay). Balochistan: no own factories act found | pakp.gov.pk unreachable | NOT FOUND |
| L13 | `certificate_from_day` PK draft 3 (§7.11) | No certificate rule in s.49-H(2) or SH-69 s.15; no statutory day found | FA-PB, SH-69 | NOT FOUND |
| L14 | `PK.CASUAL`: no amount in the contract | Informational: 10 days full pay a year (FA-PB s.49-H(1); FA-SD s.79(1); SH-69 and SH-SD s.15(1), not ordinarily more than 3 days at a time, not accumulated) | as listed | NOT FOUND (no contract value) |
| L15 | `PK.MATERNITY` (N): no days in the contract | Informational: Act 2023 s.3: 180, 120, 90 days on full pay for 1st, 2nd, 3rd birth, at most three times; Sindh acts refer to the Maternity Benefits Ordinance 1958 (FA-SD s.79(3), SH-SD s.14(4)) | MPL-23, FA-SD, SH-SD | NOT FOUND (no contract value) |
| L16 | `PK.PATERNITY` "ICT rows, ICT Maternity and Paternity Leave Act 2023" (§4.5) | The Act is the federal "Maternity and Paternity Leave Act, 2023" (XXXI of 2023); it applies to public and private establishments under federal administrative control "wherever they may be" (s.1(2)), not only ICT. s.4: up to 30 days full pay, at most three times | MPL-23 ss.1(2), 4 (O) | DIFFERS (name and scope) |
| L17 | Paternity "other provinces only where their own act gives it" | Punjab Factories Act s.49-J (inserted 2022): 7 days full pay, full pay limited to two births, apply 7 days ahead. So Punjab factories need a paternity row | FA-PB s.49-J (S) | DIFFERS (Punjab row missing) |
| L18 | Act names: Sindh Factories Act 2015; Sindh Shops and Commercial Establishments Act 2015; KP Factories Act 2013; KP Shops and Establishments Act 2015; Punjab Shops and Establishments Ordinance 1969 (§4.5) | Official titles: "Sindh Factories Act, 2015" (Sindh Act XIII of 2016); "Sindh Shops and Commercial Establishment Act, 2015" (XII of 2016, singular, trivial); KP Factories Act 2013 (XVI of 2013); KP Shops and Establishments Act 2015 (XX of 2015); "The Punjab Shops and Establishments Ordinance, 1969" | FA-SD, SH-SD (O); KP and Punjab titles from search listings of pakp.gov.pk and punjablaws.gov.pk | MATCH |
| L19 | "Balochistan's own factories and shops acts, names to verify" | Balochistan Government publishes the West Pakistan Shops and Establishments Ordinance 1969 as its shops law; no separate Balochistan shops act found | SH-69 (O) | DIFFERS (no own shops act found) |
| L20 | Balochistan factories act | Not found; secondary guides say the federal Factories Act applies | none | NOT FOUND |
| L21 | Note: SH-69 s.18 says ss.14 to 17 (leave) do not apply to "commercial establishments" as defined in the Standing Orders Ordinance 1968 | Not reflected in the contract; relevant to which leave pack row applies to shops | SH-69 s.18 (O) | NOT FOUND (no contract value) |

L21 is an extra finding, not counted in the totals above (it has no contract value to compare).

## B. Public holidays

Official 2026 federal list (CAB-26, circular of 19 Jan 2026, final dates after the later notifications CAB-N):

| Holiday | Circular date | Final notified date |
|---|---|---|
| Kashmir Day | Thu 5 Feb | same (notification 5 Feb) |
| Pakistan Day | Mon 23 Mar | same |
| Eid-ul-Fitr | Sat 21, Sun 22, Mon 23 Mar | Fri 20 and Sat 21 Mar (notification 15 Mar) |
| Labour Day | Fri 1 May | same |
| Youm-e-Takbeer | Thu 28 May | same |
| Eid-ul-Azha | Wed 27 to Fri 29 May | Tue 26 to Thu 28 May (notification 20 May) |
| Ashura | Wed 24, Thu 25 Jun | Thu 25, Fri 26 Jun (notification 22 Jun) |
| Independence Day | Fri 14 Aug | same |
| Eid Milad-un-Nabi | Tue 25 Aug | Wed 26 Aug (notification 21 Aug) |
| Allama Iqbal Day | Mon 9 Nov | same |
| Quaid-e-Azam Day / Christmas | Fri 25 Dec | same |
| Day after Christmas | Sat 26 Dec, Christians only | same |

Muslim-festival dates in the circular are anticipated and subject to the moon; separate notifications follow (footnote of CAB-26). Optional holidays: one for Muslims, three for non-Muslims per year (CAB-26 para 3).

| ID | Our value | Official value | Source | Status |
|---|---|---|---|---|
| H01 | Iqbal Day, 9 Nov 2026, public holiday (h2 §7.1 and §9.3 examples) | Allama Iqbal Day, Monday 9 Nov 2026, public holiday | CAB-26 (O) | MATCH |
| H02 | Rest of the federal 2026 list: the contract holds no dates (pack CSV not yet written) | Table above | CAB-26, CAB-N (O) | NOT FOUND (no contract value) |
| H03 | Eid and other lunar dates ship as `EXPECTED` (h3 §5) | Circular dates are anticipated and were changed for Fitr, Azha, Ashura and Milad-un-Nabi by later notifications | CAB-26 footnote, CAB-N (O) | MATCH (mechanism) |
| H04 | Public holidays 2027 (`PK 2027.1`) | No 2027 circular on the Cabinet Division site as of 2026-10-13 (site lists 2025 and 2026 only) | cabinet.gov.pk index (O) | NOT FOUND |
| H05 | Provincial lists `PK-PB`, `PK-SD` (h3 §5) | Provincial holiday notifications not retrieved | none | NOT FOUND |
| H06 | Next year's holidays arrive before 1 Oct of the prior year (h2 §4.1) | The 2026 circular is dated 19 Jan 2026, after the year began (2025 circular: 23 Dec 2024, per press, S). Federal lists do not arrive by 1 Oct | CAB-26 (O) | DIFFERS (timing assumption) |

## C. Working time (hrms-v2-h3 §5 PK row)

| ID | Our value | Official value | Source | Status |
|---|---|---|---|---|
| T01 | `MAX_DAY` 9 h, adult factory worker | Punjab s.36: 9 h a day (male adult in a seasonal factory 10 h). Sindh s.57: 9 h including breaks (seasonal male 10 h). Shops: 9 h (SH-69 s.8, SH-SD s.8) | FA-PB (S), FA-SD (O), SH-69, SH-SD (O) | MATCH |
| T02 | `MAX_WEEK` 48 h | s.34 (Punjab) and s.54 (Sindh): 48 h, seasonal factory 50 h, continuous-process 56 h. Shops: 48 h. Contract has no seasonal or continuous-process rows | as T01 | MATCH |
| T03 | "Spread-over limit" (no number) | Punjab s.38: 12 h; Sindh s.59: 10.5 h (seasonal 11.5); shops: 10 h winter, 11 h summer (adult), 9 and 8 (young person) | FA-PB (S), FA-SD (O), SH-69 s.10 (O) | NOT FOUND (no contract value) |
| T04 | "Ramadan hours where notified" | No statutory Ramadan hours rule found in the texts read | none | NOT FOUND |
| T05 | `WEEK_START` `SUN` (week begins at midnight on Saturday night) | "week" means seven days beginning at midnight on Saturday night (FA-PB s.2(e); FA-SD s.2(l); SH-69 s.2(x)). The federal child act uses Thursday night (ECA-91 s.2(xii)) | FA-PB (S), FA-SD (O), SH-69 (O) | MATCH |
| T06 | Weekly holiday Sunday unless substituted | FA-PB s.35, FA-SD s.55: no adult works on Sunday unless a whole-day holiday within the 3 days before or after, with notice; no more than 10 consecutive days. Shops s.6: one day a week, not tied to Sunday | FA-PB, FA-SD, SH-69 | MATCH (factories) |
| T07 | `OT_100`, premium 100% ("twice the ordinary rate") above 9 h a day or 48 h a week, `legal = yes` | FA-PB s.47(1), FA-SD s.68(1): twice the ordinary rate above 9 h a day or 48 h a week (seasonal: 9 h/50 h Punjab, 10 h/50 h Sindh). Shops s.9: double rate, and overtime allowed only in the proviso cases of s.8, capped at 150 h a year adult, 100 h young | as T01 | MATCH |
| T08 | Sources "Factories Act 1934 s.2 (week), ss.34-37, s.45, s.47" | s.45 is "Further restrictions on the employment of women" (6 a.m. to 7 p.m.), not working time; night-shift rule is s.46; overtime pay is s.47. Others correct (s.2 week, ss.34-37, s.47) | FA-PB (S) | DIFFERS (s.45 citation) |

## D. Young workers (hrms-v2-h3 §5.1)

| ID | Our value | Official value | Source | Status |
|---|---|---|---|---|
| Y01 | Federal: below 14 not employable in factories or scheduled occupations (ECA 1991 ss.2-3, FA s.50) | ECA-91 s.3 bars a child (under 14) only from Schedule occupations and processes, not all work; FA s.50 minimum age is 15 in Punjab (FA-PB s.50 as amended) and 14 in Sindh (FA-SD s.81). Federal (ICT) FA s.50 text not retrieved | ECA-91 (S), FA-PB (S), FA-SD (O) | DIFFERS (scope of ECA; Punjab threshold 15) |
| Y02 | Federal `YOUNG_14_14`: 5 h a day, ban 19:00-06:00 (FA ss.2(c), 52-54) | FA-PB s.54 (child's hours) was omitted by the Punjab 2022 Act; federal text not retrieved. ECA-91 s.2(i) treats a 14-year-old as an adolescent; the s.7(2)-(5) limits (3 h then 1 h rest, 7 h total, no work 19:00-08:00, no overtime) apply to a child under 14 | ECA-91 s.7 (S), FA-PB (S) | DIFFERS |
| Y03 | Federal `YOUNG_15_17`: 7 h including 1 h interval after 3 h, ban 19:00-08:00, no overtime (ECA s.7) | ECA-91 s.7(1) leaves adolescent hours "as prescribed"; the 7 h, interval, night ban and overtime ban sit in s.7(2)-(5) and name only "child". The values equal Punjab Act 2016 s.5 (Y05). The 2025 ICT Bill (not shown as enacted) would instead give 6 h a day including a 1 h break after 3 h, ban 19:00-08:00, no work on a school day | ECA-91 (S), ICT-BILL ss.2, 5 (O, bill) | DIFFERS (legal basis for ICT) |
| Y04 | `PK-PB`: below 15, `YOUNG_0_14`, `MAX_WEEK` 0 | Child = under 15 (Punjab Act 2016 s.2; FA-PB s.2(c), s.50) | CH-PB (S), FA-PB (S) | MATCH |
| Y05 | `PK-PB` `YOUNG_15_17`: 7 h incl. interval, ban 19:00-08:00, 1 weekly holiday | Act 2016 s.5: periods up to 3 h, then at least 1 h interval, total including interval at most 7 h; no work 19:00-08:00; hours must not clash with school; s.6: at least one whole day a week. No weekly-hours figure and no overtime clause in the Act | CH-PB ss.5-6 (S) | MATCH (weekly maximum NOT FOUND; shops "young person" 42 h a week, SH-69 s.8) |
| Y06 | "with a certificate of fitness the factory adult rows may apply" | FA-PB s.53(1): an adolescent with an adult-fitness certificate is deemed an adult for Chapter IV; without it deemed a child (s.53(2)). Same in Sindh (FA-SD s.84) | FA-PB (S), FA-SD (O) | MATCH |
| Y07 | `PK-SD` below 14, `YOUNG_0_13`, `MAX_WEEK` 0 | FA-SD s.81: no child under 14 in a factory; "adolescent" is 14 to 17 (s.2(a)) | FA-SD (O) | MATCH |
| Y07b | `PK-SD` source "Sindh Prohibition of Employment of Children Act 2017" | Text not retrieved | none | NOT FOUND |
| Y08 | `PK-SD` `YOUNG_14_17`: drafted as federal row (7 h, ban 19:00-08:00) | Factories: adolescents may work only between 07:00 and 19:00 (government may vary to any 13-hour span between 06:00 and 19:30), s.54 weekly limit applies (FA-SD s.85); certificate-holders are deemed adults (s.84). Shops: 7 h a day, 42 h a week, 09:00-19:00 only (SH-SD ss.7(4), 8), spread-over 9 h winter, 8 h summer (s.10) | FA-SD (O), SH-SD (O) | DIFFERS |
| Y09 | `PK-KP` ages, hours, ban all "to verify" | KP Factories Act 2013 and KP Prohibition of Employment of Children Act 2015 (XIX of 2015) not opened (pakp.gov.pk refused connection). A search extract of the 2015 Act reads: 3 h before a 1 h interval, 7 h total, no work 19:00-08:00 | none opened | NOT FOUND |
| Y10 | `PK-BA` "Prohibition of Employment of Children Act (2021, name and year to verify)", values to verify | Official name: Balochistan Employment of Children (Prohibition and Regulation) Act, 2021 (Act XII of 2021). Adolescent or young person = 14 to 17; at most the establishment's hours or 8 h a day; periods of 3 h then at least 1 h rest; no work 19:00-08:00; overtime up to 8 h a week allowed at overtime rates (s.7) | CH-BA s.7 (S) | DIFFERS (name; overtime not banned) |
| Y11 | `PK-IS` young-worker basis (federal row, ICT) | ICT Bill 2025 would repeal ECA-91 for ICT (cl.15); enactment status not found | ICT-BILL (O, bill) | NOT FOUND |
| Y12 | PK young bands: overtime none, `OT_CAP_7D` 0 | Shops: young person may do overtime in the s.8 proviso cases, up to 100 h a year (SH-69, SH-SD s.8); Balochistan: up to 8 h a week; ECA-91 s.7(5): none for a child; Punjab Act: silent, 7 h cap | SH-69, SH-SD (O), CH-BA (S), ECA-91 (S) | DIFFERS (not a universal ban) |

## E. What the HR & Payroll lead should act on

1. Sick leave is not one rule: factories 16 days half pay (Punjab, ICT as drafted), factories Sindh 16 days full pay, shops 8 days full pay with accumulation up to 16 (L07 to L11). Fix the citation to s.49-H (L08).
2. Carry-over: factories carry at most 14; shops accumulate up to 30 (L06). The "28" draft is not a carry cap.
3. Maternity and paternity: the 2023 Act is federal, not ICT-only (L16); Punjab factories add 7 days paternity (L17).
4. Holidays: final Eid, Ashura and Milad dates moved after the circular (section B); there is no 2027 list yet and the "before 1 Oct" assumption does not match federal practice (H04, H06).
5. Young workers: ECA 1991 s.7 limits apply to under-14s, not 14 to 17; Punjab (Act 2016 s.5), Sindh (07:00-19:00 factories, 09:00-19:00 shops) and Balochistan (8 h, overtime allowed) each differ (Y01 to Y12). Remove the s.45 citation (T08).
6. Still to open: KP acts (Factories 2013, Shops 2015, Children 2015), Sindh Children Act 2017, Punjab Shops Ordinance copy and Punjab Factories Act on punjablaws.gov.pk, federal Factories Act (ICT), provincial holiday notifications, Standing Orders Ordinance 1968 (commercial establishments, L21).
