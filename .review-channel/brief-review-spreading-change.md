# Brief review: `brief-accounts-spreading-change.md` (2026-11-25, read-only)

**Verdict: READY WITH CHANGES.** The vision and the Definition of Done are strong. Three points will stop the flow lead or a builder before the build (C1–C3), and about ten Definition of Done gaps are money or rights rules the sources already decide but the rows leave out.

## Contradictions (fix first)
| # | Brief | Source | Fix |
|---|---|---|---|
| C1 | One flow: "flow 2 of 2", one planner, one BE builder | D-96 first bullet: flow 2 **splits into 2a and 2b**; rules check §3 "Split recommended" | Say which holds. Either "D-96 split withdrawn: the planner sizes it, template's 5 000-line rule decides" (record it as a decision), or brief 2a only. Dropping the size line left D-96 unanswered. |
| C2 | "Spec texts R-8 and R-10 are aligned with these" | On `accounts/spreading/feature` (App) R-8 still says "A1 Reverse", R-10 "banded on the new remaining amount"; §4.3 still gives Post again to EDIT; no branch has the aligned text | Say "the spec is **not** yet aligned; D-96 and c1/c7 win; the App builder aligns R-8, R-10, §4.3 in this flow". |
| C3 | "This is the one exception to D-95" | D-95 (Jabran): "then flow 2 cut from `main`". No decision records the exception | Record it in `lead-decisions.md` (Jabran's word or a D-number) and cite it; a brief can't change an approved decision by itself. |
| C4 | "Sonnet tester" | workflow-v2 line 139: Opus medium for a flow with new screens, Sonnet for re-tests | Flow 2 has new screens (change dialog, close row, History). Align or cite the decision. |
| C5 | Row 8: "the run posts on its next try" | D-91 G4 / R-9: the person "posts again"; O7: Post again = non-writer APPROVE | Say who triggers it: the job's next run, or Post again by a non-writer (the fixer is a writer). |

## Remove or move
| Line | Why | Where it belongs |
|---|---|---|
| "`period_runs` has no `SUPERSEDED` status" · "check `ck_period_runs_posted` with a test" | Table and constraint names from a "quick look" (the check itself says "plausible"); the builder will fix these two and stop looking | One line: "Known flaws E1–E4 (rules check §5): verify them in discovery, they are not the full list." The outcomes are already in rows 1 and 5. |
| "Migrations: accounts from **V86**, user from **V55**, org from **V44**" | Discovery's fact; goes stale; implies user and org migrations are needed (a plan choice) | Drop the numbers; keep "V84/V85/V54 are applied and frozen; check the head" (workflow §5.6). |
| "`lastDetails` per version (backlog 519), SKIP audit (511) and the FL-9 move credit line (512)" | Field names, not outcomes; unreadable without the backlog | Rows: "a run's details show the version it ran under"; "a move skipped at approval is in the audit"; "the move's credit line passes the branch check". |
| The "In:" list (11 bullets) | Repeats rows 1–10 as a build list; two lists invite ticking items | Replace by scope **edges** (see Add 1); keep "Out". |
| "How it runs" model list; "One simulator session on this Mac …"; "The flow lead opens the money steps' screenshots itself" | Flow-lead process, placed inside the Definition of Done | A "Flow lead" section after Hand-back; the DoD keeps rows, invariants, proof. |
| "(attempt n+1)" in row 6 | Mechanism | Invariant already covers it; say "posts once". |

## Add
| What | Why |
|---|---|
| 1. Scope edges (template "Write / Read"): may the flow change the shared posting/reversal path, AP/AR credit-note posting (O10), the period-close checklist and the journal screen? | These are other areas' code; without the edge a builder stops and asks, or doesn't look there. |
| 2. Pause/Resume and the History/close-row screens have **no screen spec** (spec has no Pause text at all) | App builder will stop. Say "design it from the design system and §4.3; update the spec in this flow" or give the section. |
| 3. Row 1 exceptions: v2 **rejected** or withdrawn → v1 goes on unchanged; a second change while one waits; a change while paused is allowed (O5) | Reject is a main path, not an edge case. |
| 4. Row 1 output: the dialog says posted periods keep their account and a reclassification journal corrects them (O3) | O3 is decided and nowhere in the rows. |
| 5. Row 5 exceptions: the period of the reversed journal is closed or locked (where does the reversal date?); reversing twice; server refuses without the right (not only "isn't shown") | Reversal date is a money rule with no source; a builder must ask. |
| 6. Row 6: the Owner posts again only through the 4.11 switch, flagged `ownerSelfApproval` (c1); test data has both Owners | Decided, tested in flow 1, missing here. |
| 7. Row 9: End early, Resume, Reverse, Retry and the dimension fix with the feature **off** (c11 lists only six actions); books FINANCE off / not LIVE → the job skips and catches up (c11) | Each unlisted action is a stop-and-ask. |
| 8. Row 4: a due period that is closed at Resume waits + Needs you (c10); Resume with nothing due | O5 "each under c10". |
| 9. Invariants: no right → refused by the server; versions, snapshots and runs never hard-deleted (D-90, ≥ 10 years); the reconciliation ties after every action in rows 2, 3, 5, 6 | The first two are decided; the third is the reason O2 exists. |
| 10. Contract line: BE publishes the additions to `NeoERP-BackEnd/docs/api/accounts-spreading.md` first; `SUPERSEDED` is a new enum value the App must read | Template "Standards that apply" is not filled; unknown-enum handling is workflow §5.2. |
| 11. Goal: one "why" sentence (today a wrong approved schedule can only be corrected by hand journals, and the close can't show that the balance account ties) | Template asks "why it matters". |

## Reword
| Line | Better |
|---|---|
| Row 1 "amount, end, method, accounts, dimensions" | "remaining amount, end, method, P&L account, dimensions, memo (R-6); kind, source and the balance account of posted periods never change" (say whether the balance account may change going forward). |
| Row 3 "A reason of 5 characters or fewer → refused" | "A reason outside 6–500 characters → refused". |
| Rows 3, 10 "left on 1749", "Open account 1749" | "{balance account}" (the spec's example is 1720). |
| Row 7 "against a spread bill line" | "a spread bill or invoice line" (O10: AP and AR). |
| Invariant "no journal posts twice for one schedule, period and attempt" | "at most one live journal per schedule and period" (rules check §1; per attempt is trivially true). |
| "posted (live) + remaining = approved" | Add how LEAVE remainders, a route (b) release and superseded periods count, or "per approved version, c9". |
| Row 10 "(Finance Manager)" · row 3 "(EDIT)" | Name the right for the close row; row 3 POST_REST: "approved by a non-writer, banded on the remaining (c7)". |
| "`docs/agents/spreading/decisions.md`" (Who answers) | Give the repo (`NeoERP-BackEnd/…`, as line 43 does). |

## What's good
- The Goal reads as what the accountant can do; five actions plus the close view.
- Rows 1–10 are action → output → exceptions with the decision id on each; almost every cell is testable as written.
- "These rows are the floor" names the edge-case classes without listing them: a frame, not a fence.
- Invariants are real money invariants (no re-dating, approved version only, Enter-company never approves).
- "Out" is precise and gives the reason each item waits. No code paths or class names in the rows.
- No process check is posed as an outcome in the table itself; proof is kept in its own paragraph.
