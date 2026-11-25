# Done list: <flow> · branch `<module>/<feature>/<flow>` · repo(s) <BE / App>

One list per flow, kept in `docs/agents/<feature>/done.md` in each repo the flow changes (D-87, Jabran 2026-11-25). It travels with the flow from the brief to the merge. **Every step verifies the rows before it adds its own**, and moves on only when they hold.

## Open inside the scope of the Definition of Done
- **Every row serves the brief's goal and its Definition of Done, inside the scope edges.** Something you find outside the scope is written under "Outside the scope" below (reported, or a backlog row), not built in this flow. If you think the scope itself is wrong, stop and ask the lead.
- Inside that scope the list is open: anyone at any step **adds rows**: the lead from the brief, the builder from discovery and the plan, the reviewer for what it finds missing, the tester for what it sees. Write what the flow needs, in your own words: cases, paths, callers, screens, data, docs, anything the Definition of Done needs. Within the scope, the brief and this template never limit what goes in.
- A row is never deleted. A row that does not apply gets "not needed, because …" with evidence.

## Verify, don't just tick
A tick means **you verified it yourself in this step**, not that someone said so:
- **Evidence from now, not from memory.** Re-read the file, run or read the test, look at the screen. A resumed or compacted agent re-reads before it claims anything. A summary, an earlier hand-back or "I remember" is not evidence.
- **Check the test proves the row.** Open the test: does it exercise this case (inputs, path, real BE answers where the row needs them) and assert the expected result? A test that exists but checks something else is an empty row.
- **Evidence column:** the test name + the run's counts and sha, the file:line, or the shot path. Copied from the run, not retyped.

## Each step, before it starts its own work
| Step | Verifies first | Then adds |
|---|---|---|
| Brief (lead) | — | the Definition of Done lines and the brief's own lines as rows |
| Discovery (builder) | the brief rows are understood; asks if one is unclear | a row per path, caller (both repos), writer, reader, screen, event, doc found |
| Plan (builder) | every discovery row is in the list | per row: how it is built and the test (name, inputs, expected); cases the rows imply (errors, explicit `null`, rights, other company, repeats, sizes, languages) |
| Lead / flow lead (plan check) | the caller greps really match the rows (re-run one or two); every row has a test planned | missing rows → back to the builder before any code |
| Build (builder) | — | evidence per row from its own run; **no hand-back with an empty row** (only a real block: money rule, scope, contract → said why) |
| Review | opens the named tests for the rows that matter most (money, rights, seams) and confirms they prove them; re-checks any row whose evidence looks retyped or old | a missing or unproven row = a finding |
| Tester | the screen rows match what it sees | ticks screen/simulator rows with shots; anything seen that is not a row → a new row (and a finding if it fails) |
| Fix (builder) | the rows the findings touch | the failing-first test per finding as evidence |
| Merge (lead) | every row has its evidence and ticks; spot-checks two rows itself | — |

## Outside the scope (reported, not built here)
| Found | By (step) | Where it goes (backlog row / lead / other flow) |
|---|---|---|

## Rows
| # | Row (what must be true) | From (brief / discovery / plan / review / tester) | How verified (test name + run counts + sha, file:line, shot) | Builder ✓ | Review ✓ | Tester ✓ |
|---|---|---|---|---|---|---|
