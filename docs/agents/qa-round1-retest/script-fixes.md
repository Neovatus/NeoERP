
## Script fixes after QA round 1 retest

Format: test/step -> what changed -> source note. phase3-test-steps.md:

- phase3 Read this first: start state + tester tips -> added bullets (fresh reset/seed, rows used up, T12-T15 rerun, 5-10 s after Home, 30 min sessions, device per person) -> QA1 retest tips, SCRIPT T12-T15 and T10
- phase3 Amounts bullet -> amounts/dates follow company country, screen dates '1 Dec 2026', locked months = Jan-Mar 2026 only at Kystgruppe (old text said only Nov open) -> G45 retest, round 1 SCRIPT A1 locked months
- phase3 Seed amounts Sialkot -> added 'only after a fresh reset and seed' -> retest tips (RFD-DRAFT-000006 is posted)
- T1 step 2 -> Paid from default is 1921 Kystgruppe operating bank, not 1920 -> round 1 SCRIPT T1 2/4
- T1 step 4 -> 1920 changed to 1921 in the No bank details pill reason -> round 1 SCRIPT T1 2/4
- T1 step 4 -> Approve notice text is 'Someone other than the person who wrote or sent it approves it.' -> round 1 SCRIPT T1 2/4
- T8 note -> run as the Owners directly, jonas.moe not needed (old known issue removed) -> round 1 SCRIPT T8 note, T8 retest
- T10 intro -> plan device ownership per tester -> round 1 SCRIPT T10 3
- T10 step 3 -> confirm sheet, toast on closing, Home-and-back alternative with 5-10 s wait (replaces '5 minutes') -> G16 retest
- T10 step 5 -> removed old known issue; the Owner sees the feature list and its row -> T10 round 1 step 5
- T12 step 3 -> menu lists two more entries (New accrual or prepayment, Import journals) -> round 1 SCRIPT T12 3
- T14 step 5 -> Branch field on the Accounts step, choose Lahore HQ -> T16 retest setup (T13/T14)
- T14 step 5 known issue -> button is not offered at all (was 'offered but refused') -> T14 round 1 step 5, T16 retest G19
- T16 step 1 -> hand-off file is customers-opening-items.csv (was opening-items-ar-lahore-tb.csv) -> round 1 SCRIPT T16 1
- T16 step 3 -> set Default branch Lahore HQ and tick Create missing customers before Create 2 balances -> T16 retest steps 1 and 3
- T16 intro -> needs T12-T15 done on the same database -> round 1 SCRIPT T12-T15
- T16 step 4 -> set Default branch again and tick Create missing suppliers -> T16 retest steps 3-4
- T18 intro -> fixture now saved as PC8 matching its #FORMAT line; recopy the file to the device -> round 1 SCRIPT T18 4
- T18 step 4 -> Company in the file with org number, Character set PC8 without warning, no 'no org number' notice -> round 1 SCRIPT T18 4 (fixture, seed)
- T18 step 5 -> choose #IB (Difference 0,00), pick Default branch Stockholm; #UB figures (98 750/100 000/250, Difference 1 000) moved to an optional variant; 'Where the difference goes' is 'Put the difference on' -> T18 retest, round 1 T18 step 5
- T19 step 1 -> one 'Company dimension' row (Not set up, Set up) instead of a row per slot -> round 1 SCRIPT T19 1
- T19 step 2 -> button is New project, not Create project (the panel's save button is Create project) -> round 1 SCRIPT T19 2-4
- T19 step 3 -> New project; reason needs at least 6 characters -> round 1 SCRIPT T19 2-4, T19 step 3
- T19 step 4 -> button is New cost centre -> round 1 SCRIPT T19 2-4
- T20 step 1 -> slot is chosen via the single 'Company dimension' row; File column pre-fills from Name, retype upper case -> round 1 SCRIPT T19 1 / T20 1 (G46)
- T20 step 4 -> retype File column, reason at least 6 characters, back to the single 'Company dimension - Not set up' row -> T20 round 1 step 4
- T21 step 1 -> entry date today instead of 'a date in November 2026' -> T19 round 1 finding 3 (valid from today)
- T21 step 4 -> Submit asks for Document reference and Document date first -> T21 round 1 step 4
- T24 step 0 -> button names New cost centre / New project (empty lists: Add the first ...) -> round 1 SCRIPT T19 2-4, T24 retest step 0
a4-test-steps.md:

- A4 Company bullet -> dates on screen '1 Dec 2026' vs typed dd.mm.yyyy; locked months are Jan-Mar 2026 seeded by seed-demo-a4.sh, otherwise reset and reseed -> round 1 SCRIPT A1 setup, A1 steps 7-10 dates
- A4 header -> new bullet fresh reset/seed, 5-10 s after Home, 30 min sessions, device per person; demo-data bullet says the script also locks Jan-Mar -> retest tips, round 1 SCRIPT A1 setup, SCRIPT T10
- A4 recipe R1 -> if 2950 is suggested pick 2960 by hand (G06 still open) -> G06 retest, round 1 A1 step 5
- A1 step 6 -> no quick add in the Cost centre picker (setup data is link-only) -> round 1 SCRIPT A1 6, G29
- A5 step 8 -> only Mar is Locked (seed locks Jan-Mar); Apr-Oct open, no tags -> round 1 A5 step 8, SCRIPT A1 setup
- A7 intro -> three skipped dates Jan-Mar 2026 (Apr is open, so a second date no longer gives a skipped run) -> A7 retest setup, round 1 SCRIPT A1 setup / A7
- A7 step 1 -> Starts 01.01.2026, Times 3; Expected three Locked tags and the 3-journal notice -> A7 retest setup
- A7 step 3 -> three skipped rows; the journal is Ended at once (skipped dates count) and hidden by the default Active/Paused list, use Status -> Ended -> A7 retest finding 1
- A7 step 4 -> preset date is 01.04.2026 with the seeded locks (was 01.11.2026 likely) -> A7 retest step 4
- A7 step 6 -> Dismiss the 01.02.2026 and 01.01.2026 rows (April is open so there is no skipped 01.04.2026 row) -> A7 retest step 6
- A7 step 7 -> include Ended in Status first; chip may be missing on a phone -> A7 retest step 7
- A8 step 7 -> A4T Old fee is already Ended after A7 (skipped dates count), open via Status -> Ended; End only if still Active -> A7 retest finding 1
- A13 step 3 -> Bjorn has no Discard (rule decided in G01: only the Owner may discard someone else's check) -> round 1 SCRIPT A13 3-4, G01 retest
- A13 step 6 -> Owner sees Discard with a required reason; cancel it so step 7 still has Anna's check; optional Owner-discard variant -> round 1 SCRIPT A13 3-4, G01 retest
- A15-A17 section intro -> labels seen in round 1; wait for the full reason text before Apply change -> round 1 SCRIPT A16 1 (and A15 2/A16 1 labels)
- A16 step 4 -> reach the off state through the 'Import journals' breadcrumb; Expected is the off page 'Journal import is off for Kystgruppe Nordic' -> round 1 A16 step 4, G16 retest
Not applied (product bugs stay as Expected): G05 (bill Description keeps one word), G06 (2950 suggested; only a hand-pick hint added to R1), G07 (month text 'mar. 2026'), G12, G24 (GL has no cost-centre column), G40 (Owner toast, 'Reject' word), G13/A6. Not changed: T20 sales channel seed (script already lists Retail, Wholesale, Export; seed now matches), T13 template file name (wording finding, not SCRIPT).
