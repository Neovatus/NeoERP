# Workflow review — input from the new-Mac lead (2026-11-24)

The lead's view for topic 1 (briefs and builders). It comes from this Mac's last 7 Phase 4 lanes (lane-ready files). It is one input; the independent review (D-79) reads the raw sources itself.

## What the lanes show

| Lane | Tier | Fix rounds | Findings that caused rework | Brief gap (builder's own line) |
|---|---|---|---|---|
| FIX-AL-RELEASE-BE | 2 | 0 | — | step 5 covered the feature switch, not ladders |
| FIX-OB-IMPORT-BE | 2 | 1 | 2 MEDIUM: the match had a date rule the duplicate key lacks (**my brief**), and edge tests were missing | the date rule itself |
| FIX-OB-IMPORT-APP | 2 | 0 | — | none written |
| FIX-B2A-REFRESH-APP | 2 | 0 | — | the brief put the cause in the editor; it was `AppSession.reread()` |
| DOCS-2c | 1 | 1 | 2 MEDIUM (screenshot content) | Creates mode for the editor shot; dialog shot with or without its page |
| TEST-SCOPE-1 BE | 2 | 3 | 1 HIGH + 6 MEDIUM across rounds, all read-scan forms | the read-scan bar was set during the build (D-62), not in the brief |
| TEST-SCOPE-1 App | 2 | 2 | 3 HIGH + 5 MEDIUM, all read-scan / always-run forms | lead correction 10 ("always run design.*") cancelled the saving |

**Pattern.** The fix lanes with a narrow, tested brief passed first time (3 of 4). The rework came where the brief left a rule open, or where I wrote the rule wrong: the OB date rule, the D-62 bar, correction 10. Gate-script lanes took 2–3 rounds because every round found new code forms to scan. That is open-ended work with no done line in the brief.

## Proposals (for Jabran's decision)

1. **A feature checklist in every feature brief:** release flag, demo data, permissions, four languages, user-guide page, the contract path it calls. AL-RELEASE and the escaped Keycloak email defect are both rows this list would have caught.
2. **The brief check verifies, not only reads:** it opens the contract paths, the code the brief names as the cause, and the rule it relies on (here, the C-20 duplicate key) before the build. B2a and the OB date rule would have been caught at this step.
3. **Builders run the reviewer's checklist themselves** and attach the filled table (L36 self-check); reviewers then check the table and the seams.
4. **A done line for open-ended lanes:** gate and scan lanes name the cases they must catch up front (a list plus D-62), so a later round can't keep finding new forms. Otherwise they go into a time-boxed spike.
5. **Fewer review passes (matches the review direction):** one re-check after a fix round, by the seat that raised the finding. Small RISK lanes (under ~200 lines, no money logic) get one reviewer. The mandatory guardrails stay for money and security (second, different reviewer).
6. **Measure:** first-pass rate per lane and per builder model, recorded in the lane-ready file. Rules change only when that number moves (D-63).

## Rows already in other lists (not repeated here)
`ScreenSizes.kt` split; AL stand-in words and `canConfirm`; OB detail load and App LOWs; iOS `kotlinx-coroutines-test`; untick sentence shown twice; B2a LOWs; empty strip under the recurring detail head; the Keycloak email sync defect. See `handoff-implementer.md` and `brief-gate-3.md`.
