# AC418-APP simulator retest (steps 15 and 16)

Date 2026-11-22. Local stack, iPad Pro 11 (omar.farooq) and iPad mini (bjorn.eriksson).
Environment note: host load average was about 570 during the run, so every screen took 20 to 60 s to load, and the Accounts calls returned AUTHZ_UNAVAILABLE (HTTP 503) on the first omar session until the session was re-created.

| Check | Device/user | PASS/FAIL/N-A | What you saw |
|---|---|---|---|
| 15a Trial balance at Sialkot Mills (Reports) | iPad Pro / omar.farooq | PASS | Loaded, FY2026-27 Jul-Nov 2026, e.g. 1500 Trade receivables debit 182,000.00, credit 138,000.00, closing 44,000.00 Dr. |
| 15b Switch chip to Lahore Textiles from Trial balance | iPad Pro / omar.farooq | PASS | Header became Lahore Textiles (Finance Manager); Lahore trial balance loaded (FY2026-27; 1500 closing 200,000.00 Dr, 1920 300,000.00 Dr, 1930 25,000.00 Dr). No "We couldn't find this". |
| 15c Menu then Reports again at Lahore | iPad Pro / omar.farooq | PASS | Reports opened, Lahore trial balance shown. |
| 15d Switch back to Sialkot Mills | iPad Pro / omar.farooq | PASS | Sialkot trial balance again (1500 Dr 182,000.00, Cr 138,000.00; 1600 27,000.00 Dr). |
| 15e Switch Sialkot to Lahore while on Balance sheet | iPad Pro / omar.farooq | PASS | Balance sheet at Sialkot loaded (total assets 91,900.00); switching to Lahore landed on Lahore Reports (tab back at Trial balance) with Lahore amounts, no "We couldn't find this". |
| 16a Create bill (Bergen Kontorservice AS, RT-1001, 1 line 1000 + 25% tax) as Bjorn and Save | iPad mini / bjorn.eriksson | PASS | Draft BILL-DRAFT-000035 saved (1 250,00 NOK), shows in the Bills list with status Draft. |
| 16b Submit the bill for approval | iPad mini / bjorn.eriksson | BLOCKED | Submit for approval (tried twice, once after a fresh app launch) ended with the banner "Draft BILL-DRAFT-000035 saved. We couldn't confirm that this went through. Reload before trying again." The list after reload still showed Draft. Likely the load above (timeout), not verified as an app fault. Screenshot: sim-shots/retest-1.png. |
| 16c Bjorn tries to approve the bill, message "You sent this for approval, so someone else must approve it." | iPad mini / bjorn.eriksson | N-A | Bill never reached "waiting for approval" (16b), so no Approve control or message could be reached. Needs a rerun on a quiet machine. |
| 16d Own submitted journal detail banner (JV-DRAFT-000034, Waiting to post) | iPad mini / bjorn.eriksson | PASS (record only) | Banner text is the general sentence: "You wrote, changed or submitted this journal, so someone else must post it." Only a Reject button is offered, no Post control. List card shows "You wrote it". |

Other: the Advances panel on the bill form showed "We couldn't confirm that this went through. Reload before trying again." with a Try again link (also load related). The Journals menu badge shows 2.
