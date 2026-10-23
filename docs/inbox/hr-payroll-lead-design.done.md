# Done: hr-payroll-lead-design

Owner (the main) only. One line per handled brief.
HRP-15 (+HRP-29 amend) · DES-1 reported in hr-payroll-lead.md (HRP-D-1) | HRP-22 applied (Opus plan+reviews, Haiku/Sonnet workers) | HRP-32 superseded by HRP-33, applied (light load check) | HRP-16 (DES-2) not started, waiting for DES-1 acceptance
HRP-34 · small fixes a–d done, reported in hr-payroll-lead.md (HRP-D-2) | DES-2 (HRP-16) next after /compact
HRP-37 · ATP_PAYABLE 2771 applied in payroll-data.jsx (source); app.html block sync pending in DES-2 INT (W10) | HRP-39 · DES-2 started: plan in NeoERP-App/docs/agents/hrp-des-2/plan.md (Opus); wave 1 (W1 data, W2 ui, W3 rig) running on Haiku
HRP-39 · W3 rig hooks reported internally; open: London/Helsinki early return (lead decision needed)
HRP-39 · W2 UI reported (partials logged in plan); waiting for W1 data
HRP-39 · W1 data reported; name collisions found and being renamed in rig and ui files
HRP-39 · hr3-ui rename done (hr3UiCan); waiting for rig rename
HRP-39 · rig rename re-sent to correct worker (W3); waiting
HRP-39 · rig rename done; Hr3ModuleNav duplicate sent to W3 to remove; wave 2 waits
HRP-39 · wave 1 clean (no duplicate top-level names); wave 2 next
HRP-40 · string keys use <module>_<area>_<name> (underscore, not dotted), file strings_<module>_<area>.xml; applied to wave 2 briefs
HRP-39 · wave 2 workers started (W4 leave, W5 time, W6 approvals, W7 lifecycle, W8 ESS); HRP-40 keys applied
HRP-39 · W6 approvals reported; 3 shared-file issues logged for a fix pass after wave 2
HRP-39 · W7 lifecycle reported; fix pass needed: hr3CreateEmployee ended-national-id refusal (H4-4)
HRP-39 · W5 time reported (202 keys; roster copy-week and shift reactivate not built)
HRP-39 · W8 ESS reported; lead conflicts logged: ended banner text and Me after end date (H2-A7 / H4 §8.12)
HRP-39 · W4 leave reported; wave 2 complete (W4-W8). Fix pass next.
HRP-41 · applied in fix pass (F1-F4 running); listener restarted
HRP-41 · F2 (hr3-ui Notices) done
HRP-41 · F1 (hr3-data) done
HRP-41 · F3 (ess ended rules) done; lead to confirm leave/time after end: ended card vs read-only history
HRP-41 · F4 (re-hire offer) done; wizard now offers re-hire for ended matches
HRP-39 · listener switched to shared listen.sh (ERP lead request)
HRP-42 · listener is docs/inbox/listen.sh hr-payroll-lead-design (already switched; restarted after its wake)
HRP-43 · handled: ended Leave and Time keep the ended card only (H2-A7); Home text unchanged
HRP-44 · started: W9a and W9b (Haiku, 20 min each); no DES-2 file changed since 18:34 (checked)
HRP-44 · W9a+W9b done (spec notes appended); W10 integration written to app.html (60 blocks, untouched hashes verified); W11 check next
HRP-44 · time box reported in HRP-D-3: W9 done, W10 integrated (60 blocks), W11 NOT done, Opus review 1 PASS / 5 PARTIAL / 1 FAIL, fixes not done
HRP-44 · handoff written; stop requested by Jabran (ERP lead) — DES-2 paused at W11 / review fixes
HRP-84 · batch F (HRP-80) started: Opus plan running (read-only); no rig file edited yet
HRP-80 · seen; batch F plan in progress (Opus); HRP-84 addressee confirmed
HRP-84 · batch F: plan done (Opus); workers W1–W5 running on Haiku; integration and review to follow
HRP-84 · axe-core not in npm cache; axe pass marked not run; rest of check continues
HRP-84 · W1 wave 0 + renames done; rest of W1 continuing
HRP-84 · W3 partial: time/approvals/lifecycle items done except HR3_DESIGNS Send-row entry (needs W2) and labels audit
HRP-84 · W4 payroll partial: most items done; SE karens still shows day/degree facts (open); PAY_DESIGNS run ids to verify
HRP-84 · W2 partial: Sweden protection done; router deep link needs a W1 fix (segment 6 dropped by hrHash)
HRP-84 · W5 check stopped (not run); W1 report requested again
HRP-84 · integrated into app.html (20 blocks); not done list in plan; check and review not run; no commits
HRP-84 · HRP-D-4 written (partial batch F; check and review not run; no commits)
HRP-86 · started: F-A (hr-rig router, contact edit, sticky bar), F-B (payroll SE karens, B2 folds, run ids, labels), F-C (HR3 send row, approvals WritesTo, labels, Esc), F-D (top-task tables in four specs). Check run and Opus review after they report; contrast via small script (HRP-86 1c); commit Draft after checks.
HRP-86 · F-D top-task tables written in four specs
HRP-86 · F-A done: deep link, contact Edit (3 clicks), sticky bar (within head card); hook already above early return
HRP-86 · F-C done (partial on keyboard pass: roster editor and End-step Enter not audited)
HRP-86 · F-B done; integrated; next check + review + commit
HRP-86 · check started (no axe)
HRP-86 · fixed protection card T-error and danger-bar contrast; re-integrated; check rerun started
HRP-86 · Opus review: fixes first (gate, Writes-to, Undo onDone); fix workers A and B running
HRP-86 · commit prep ready (HEAD-based app.html blob); waiting for check rerun
HRP-86 · batch F committed as Draft (565d5986, 24 files; app.html via index blob); HRP-D-5 sent; stopped
HRP-87 · started (fix workers P payroll, H HR, S specs); HRP-88 Post confirm in P; check rerun and Draft commit to follow; HRP-D-6 after
HRP-87 · H done (409 wording, protection card to top, route list); P and S still running
HRP-87 · S done (Sweden section, Post and Find employee notes); P still running
HRP-87 · P, H, S done; integrated; full check started (route sweep, keyboard, 200%, contrast); then Keyboard column, Draft commit, HRP-D-6
HRP-87/88 · HRP-D-6 sent; batch F fixes committed as Draft 3648357e; stopped
ERP-216 · Payroll overlap fix: .pay-demo and .pay-pastnote negative margins removed; .hr-ctx + .hr-sub gets 4 px top margin (Payroll only, HR left for pass 2); duplicate "Writes to" removed in the calculated-run action bar
ERP-219 · same as ERP-216 for .pay-demo (payroll-data) and .pay-pastnote
ERP-221 · Payroll first: started; overlap check (ov/) and Opus review of separation of duties running; integrate, commit Draft, report, then stop (ERP-223)
ERP-224 · item 2 (separation of duties): payRunApprove refuses an approver who created the run or entered a one-off line (oneOff rows now carry by); Opus review pending
Hold lifted for Payroll: pause file for hr-payroll-lead-design removed on Jabran's instruction (2026-10-23)
ERP-216/219/221/224 · Payroll part reported in HRP-D-7; commit 0cb400e6 (Draft); overlap acceptance not met; stopped
HRP-93 · HOLD received; finishing current step only; HRP-D-8 one-line status sent; waiting for RESUME
HRP-97 · received (Finish Payroll pass, ERP-227 answers); workers A and S were already running; continuing the Payroll pass as briefed
HRP-97 · A layout worker partial: floating link removed; country-rules wrap; setup overlaps and ESS tab overlap not done; approval worker S still running
HRP-98 · RESUME received; integrated; overlap re-measure and Opus re-review running; report will be HRP-D-9
ERP-227 · already in HRP-97; ERP-228 · started (overview fixes in worker); HRP-D-9 pending
HRP-99 · overview fixes (ERP-228) done in worker; other Payroll screens in progress; HRP-D-9 pending
HRP-99 · runs screen: card action top-right NOT done (needs JSX); other rules done or partial
HRP-100 · applied: Lahore approver persona is now EMP-0088 (wage, WRK run); approver check still pending in review
HRP-99/100 · all Payroll blocks parse and integrate; Opus re-review running; HRP-D-9 next
HRP-D-9 · Payroll pass 2 committed as Draft 964f6080; report sent; stopped
HRP-101 · pass 3 started: Sonnet (runs card action, send-back, tax pay inputs, reopen) and Haiku (icon variant, header at 390); then integrate, overlap + route sweep, definition-of-done report HRP-D-10
HRP-101 · runs card: no matching element in payroll-runs (the card lives in overview, already top-right)
HRP-101 · icon variant (12 buttons) and header wrap at 390 done; integrating next
HRP-101 · integrated; overlap and route sweep running; token guard open (160 px font-size literals)
HRP-98 · pass-2 overlap measure done (pre-fix): 1440 29 routes / 857 pairs; 390 59 routes / 1109 pairs; pass-3 check still running
HRP-103 · Payroll touch height now (pointer: coarse) only; no width-based height bumps in Payroll blocks; integrated
HRP-D-10 · Payroll pass 3 committed as Draft 3caeba96; ERP-230 items: hard checks pass; 1,2,3,4,5,6 open with reasons; stopped
HRP-104 · pass 4 started: step 1 codes to labels (9 routes) first
HRP-104 · step 1 (labels not codes) committed as Draft 9839bcb1; step 2 (country setup overlaps) in progress (Haiku, payroll-setup.jsx); steps 3–8 to follow in order; HRP-D-11 at the end
HRP-104 · step 2 CSS applied in payroll-setup (unconfirmed); measuring country routes
HRP-D-11 · pass 4 progress: step 1 done (9839bcb1); step 2 open (measured); steps 3–8 not started; reported
HRP-105 · filtered re-measure and screenshot started (measure only); markup fix waits for it
HRP-D-12 · step 2 measured: closed-fold false positives removed; no real visible overlap on setup routes; steps 3-8 next
HRP-106 · undo done (payroll-setup clean); harness committed 52a7848a (reviews/tools); step 3 tokens running (Haiku); steps 4–8 next; HRP-D-13 at the end
