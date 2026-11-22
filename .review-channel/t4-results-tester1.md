# T4 retest, tester 1 (Kystgruppe Nordic). Local stack, jar mode. Machine load was very high at start (load avg 420 at 18:48), lists took 5-10 s to load.

## Setup + G1 (18:46-18:58, 12 min)
| Step | Feature | Device/user | Result | What I saw |
|---|---|---|---|---|
| S0.1 | OB | Pro 13 ola, mini bjorn | PASS | Top bar "Kystgruppe Nordic . Norway . NOK" + person on both devices |
| S0.2 | OB | Pro 13 ola | PASS (partial) | Approval limits is in the Accounts menu; the Company > Modules page shows Finance 18 of 20 features. I did not open the feature switches one by one. Change history on Modules said "This request couldn't be completed" once (load) |
| B2a-S5 step 1 | B2a | Pro 13 ola / mini bjorn | PASS | Toast "Journal JV-DRAFT-000036 submitted"; Bjorn's Waiting-to-post chip stayed at 4 |
| B2a-S5 step 2 | B2a | mini bjorn | PASS | After Home + 4 s + reopen: chip 5, JV-DRAFT-000036 listed |
| B2a-S5 step 3 | B2a | mini bjorn | PASS (weak) | Chip toggles off/on and the list follows; I did not count rows against the number (5) card by card |
| B2a-S5 step 4 | B2a | mini bjorn posts, Pro 13 ola | PASS | Posted as JV-2026-000004 with "What you checked"; Ola reopened it from the list: Posted, "Posted by Bjorn Eriksson", no Post button. I did not do "Home then Back" on the same open page; I reopened through the Journals list |
| AC418-16 submit | AC418 | mini bjorn | PASS | New bill (Bergen Kontorservice AS, 1000 + 25% = 1 250,00) -> toast "BILL-DRAFT-000037 sent for approval"; it is listed under Waiting for approval |
| AC418-16 approve | AC418 | mini bjorn | PASS (wording differs) | The bill detail shows NO Approve button for the writer (only "Withdraw to draft" and a menu with Reject). Text on the page: "You wrote, changed or sent this bill, so someone else must approve it." Not the exact sentence "You sent this for approval, so someone else must approve it." and no tap/toast, but nothing could be approved. Bill left waiting for Ola (G3) |
| B2a-S2 step 2 | B2a | mini bjorn | PASS with caveat | One tap on Save saved the new recurring journal (toast "Saved. Next journal on 1 Dec 2026."), reached the detail. CAVEAT: the soft keyboard was never shown (simulator ignores show; hardware keyboard mode), so the "keyboard visible" condition was NOT reproduced. First Save attempt gave "Another recurring journal is called A4T-R02" (name used by the earlier run), so I saved as A4T-R02-T4 |
| B2a-S2 step 3 | B2a | mini bjorn | N-A | Not run (second recurring journal with keyboard closed); same one-tap behaviour seen in step 2 |
| B2a-S2 step 4 | B2a | mini bjorn | PASS | New journal arrow > Import journals > "Earlier imports" opened with ONE tap (5 imports listed) |

## G2 (18:58-19:03, partly)
| Step | Feature | Device/user | Result | What I saw |
|---|---|---|---|---|
| AL-J1 | AL | iPhone anna | BLOCKED (AL not released; lead confirmed) | Journal JV-DRAFT-000038, 750 000,00 (6300 D / 1920 C), submitted: toast "Journal JV-DRAFT-000038 submitted". The list row and the detail show only "Waiting to post" / "You wrote it": NO "0 of 2 approved" and no approval-steps card for the writer (screenshot t4-shots/AL-J1.png). Not shown to Anna as the writer; may be role-gated (like AC418-16) |
| AL-J3 | AL | Pro 13 ola | BLOCKED | Ola opens JV-DRAFT-000038: only Reject/Post, no "Needs 2 approvals" card, no "Why 2 approvals?" link. Approval limits page: "Approval limits are switched off for this company"; Company > Modules > Finance lists Approval limits as "Not in this release / Coming later" (no switch). All AL steps depend on this |
Notes: iPhone date fields take raw text (no mask), typing under load drops characters; Save/Submit worked.

## G3 (AL part BLOCKED, rest partly)
| Step | Feature | Device/user | Result | What I saw |
|---|---|---|---|---|
| AL-J7, AL-P6, AL-P7, AL-P9, AL-O1 | AL | - | BLOCKED | Approval limits feature not available on this stack (see AL-J3); no stand-in/limits set; the lead's API rows AL-L2..AL-P5 not seen in the app (no 2-step journal, no 3-step payment) |
| B2a-S3.3 | B2a | - | BLOCKED | Needs D1 journal from the lead (API); not done |
| AL-O1/AC418-10b | AC418 | - | BLOCKED (not run) | Needs lead's AC418-10a prep (not done at this time); the bill BILL-DRAFT-000037 still waits |

## G4 (partial)
| Step | Feature | Device/user | Result | What I saw |
|---|---|---|---|---|
| B2b-14 | B2b | Pro 13 ola + Pro 11 jonas | PASS | Ola on Record refund received form (Payables > Refunds received); Jonas switched Refunds, advances and write-offs off (Company > Modules > Finance, reason recorded). The Ola form did NOT react while the app stayed in the foreground (~1 min). After Home + reopen: toast "Refunds, advances and write-offs were switched off." / "This form was closed. Nothing was saved."; page shows "Refunds, advances and write-offs are off for Kystgruppe Nordic" with Ask Neovatus; crumbs Companies / Kystgruppe Nordic / Accounts / Payables / Refunds received, title Accounts. NOTE: refresh only on return from background (there is no live poll); the "off page title" is Accounts as expected. Jonas switched it back on (18 of 20) |
| SW-A1 | SWITCH | Pro 13 ola | BLOCKED | Needs N5: Ola's company chooser lists only Kystgruppe Nordic, Kyst Danmark ApS, Kyst Suomi Oy, Kyst Island ehf. No Lahore Textiles, so no switch possible |
| SW-B6 | SWITCH | Pro 13 ola | BLOCKED | Same (no Lahore membership for Ola, N5 missing) |

## G5
| Step | Feature | Device/user | Result | What I saw |
|---|---|---|---|---|
| B2a-S6 step 1 | B2a | iPhone anna | PASS | Draft JV-DRAFT-000033 (Reverse automatically already ticked), editor open, Submit for posting enabled |
| B2a-S6 step 2 | B2a | iPad Pro 11 jonas | PASS | Recurring journals and accruals switched off with a reason (dialog "Record the reason"); the feature list shows 17 of 20. I did not see the exact toast "Change recorded with its reason" (screenshot taken 4 s later showed the list updated) |
| B2a-S6 step 3 | B2a | iPhone anna | PASS (text differs) | Home, reopen: Submit for posting greyed; note "Reverse automatically is part of Recurring journals and accruals, which is off for this company." The plan's last sentence "Untick it to go on." was NOT shown; no red banner. Jonas switched it back on (18 of 20) |

## Rerun B2a-S2 step 3 (mini, bjorn) and rest
| Step | Feature | Device/user | Result | What I saw |
|---|---|---|---|---|
| B2a-S2 step 3 | B2a | iPad mini bjorn | PASS (partial) | New recurring journal "A4T-R02-KB" (6300 D 5 000 / 1920 C 5 000, memo): Credit cell focused, ONE tap on Save saved it (toast "Saved. Next journal on 1 Dec 2026.", detail opened). Soft keyboard was NOT visible at that moment: the simulator tool's set_keyboard shows it only through the on-screen keyboard pill ("Show Keyboard") and it disappears on scroll or when focus moves, so I could not hold it visible while tapping Save. When it was visible (Name field focused) the Save bar sat above the keyboard. The keyboard-visible variant is NOT proven. Needs a real device or the tester with a hardware-keyboard-off simulator |
| B2b-3 | B2b | - | NOT RUN | Needs a two-user live cost-centre delete (Dimensions), Pro 13 + mini; skipped for time after the AL block. Re-add to the short retest |
| B2b-17 | OB | - | BLOCKED | Lahore data (Ayesha, N7); lead agreed it goes into the short retest |
| AL-R3, AL-Lang, AL-O1, AL-J7, AL-P6/7/9, B2a-S3.3, AC418-10b | AL/B2a/AC418 | - | BLOCKED/NOT RUN | AL feature not released; D1/AC418-10a prep not available |

Data left behind (Kystgruppe): JV-DRAFT-000036 posted as JV-2026-000004; JV-DRAFT-000038 (750 000, waiting to post, Anna); BILL-DRAFT-000037 waiting for approval; recurring journals A4T-R02-T4 and A4T-R02-KB. Features Recurring journals and Refunds are switched back ON.
