# Simulator steps: dimension-rules flow 3 `branch-default` (tester template)

Code: BE `accounts/dimension-rules` ad4e3234 (fix round may move it), App 8097bc2d. Not pushed yet; the module lead pushes.
Data: the BE demo step `NEOERP_ORG_STEP=branch-defaults`. Kystgruppe Nordic: Oslo HQ (OSL) → OSL-OPS. Bergen (BRG) and Tromsø (TRO) have no default. Run its dry run first; the step prints the Sialkot cross-company refusal.
Persona: Owner of Kystgruppe Nordic (holds ACCOUNTS.COST_CENTER.UPDATE). Step 9 uses a user without that code (the Kyst accountant, if it lacks the code; check the rights first).
Tester: Opus medium (new screens), driven with AXe by testTag where one is listed. Chunks of ~4 steps.

| # | Persona | Do | Expected |
|---|---|---|---|
| 1 | Owner · iPad · en | Accounts › Dimensions › Cost centres. | The tree has a "Default for" column: OSL-OPS shows "Oslo HQ". Under the tree, the "Branch defaults" card (`branchDefaults.card`) has one row per active branch (`branchDefaults.row.OSL`, `.BRG`, `.TRO`). Oslo shows OSL-OPS; Bergen and Tromsø show "None". |
| 2 | Owner | Bergen row › select (`branchDefaults.row.BRG.select`) › pick a cost centre › the reason gate opens. Try a 5-character reason, then a valid one (6–500). Confirm. | A reason under 6 characters can't be confirmed (required marker announced). After confirm, the Bergen row shows the new cost centre, and that cost centre's "Default for" shows Bergen. Cancel on a second try puts the old value back. |
| 3 | Owner | Org › Branches › Bergen. | The branch page shows "Default cost centre: {code} {name}". Oslo shows OSL-OPS; Tromsø shows none. |
| 4 | Owner | Journals › New. Branch Oslo, no header default cost centre. Add line 1 on an expense account that takes a cost centre. | Line 1's cost-centre cell is filled with OSL-OPS and says it is from branch Oslo (`journal.line.1.cc.fromBranch`; in the grid only in the spoken name, on phone cards as a caption). |
| 5 | Owner | Same journal: clear line 1's cost centre ("None"). Balance it with a 1920 line. Save the draft, reopen it, save again. | The cell stays empty after both saves and the reopen; nothing refills it. |
| 6 | Owner | New journal with a header default cost centre set, branch Oslo, add a line. Then change one line's branch to Bergen before touching its cost centre. | With a header default, the line takes the header default, not OSL-OPS. On the branch change, an untouched line takes Bergen's default (from step 2). |
| 7 | Owner | Sales › New on-account credit note, branch Oslo, one line on an expense/revenue account that takes a cost centre. Then Purchases › New on-account debit note, same. | Both lines now have a cost-centre picker (`credit.…costCentreId.select`, `debit.…`) prefilled with OSL-OPS from branch Oslo. On an account where the cost centre is Required, clear it and Save: the line is marked (`….required` / `….refused`) and the message is visible without scrolling. |
| 8 | Owner | Cost centres › OSL-OPS › Deactivate. | Before the reason gate, the warning (`deactivate.warnings`) says it is the default for Oslo: "New Oslo lines will have no default cost centre until you choose another", plus the draft count. Cancel; don't deactivate. Delete on OSL-OPS is refused because it is a branch default. |
| 9 | user without ACCOUNTS.COST_CENTER.UPDATE | Cost centres. | Branch-default rows are read only (`branchDefaults.row.{code}.readOnly`) with the reason as a muted line; no select. |
| 10 | Owner · small iPhone · nb · largest text | Steps 1, 2 and 8 (card, gate, warning). | Norwegian text, nothing cut, targets ≥ 44 pt, every control has a label. Known and allowed: at SE landscape, the table's sticky heading slides under the page bar at the end of the table (backlog; don't log it). |
| 11 | Owner · iPad · sv / da | Step 1 and the deactivate warning. | Swedish and Danish wording, no cut text. |
| 12 | (lead adds) | Flow 1–2 re-checks: flow 2 F1/F2 on phone cards; the write-off prefill with the seed invoice `DEMO-DR WRITE-OFF PREFILL`; flow 1 F1, the 6705 side sheet; the labels. | (lead) |

Afterwards, put Bergen back to "None" (reason gate), so the data matches the seed.
Results to `.review-channel/dr-flow3-sim-results.md`, please.
