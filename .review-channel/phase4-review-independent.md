# Phase 4 review — independent (process, not code) · 2026-11-24

Written without reading the lead's review. Sources: `lead-decisions.md`, `phase4-plan.md`, `claims.md`, lane-ready/verdict
files, `test-ledger.md`, `t4*-results-*.md`, `docs/process/phase4-*.md`, `escaped-defects.md`, `docs/inbox/erp-lead.md`,
`docs/lessons.md`, WORKFLOW git history, and the `docs/agents/**/review*` file lists on `origin/phase/4` in both repos.

## 1. Top 5 problems

**P1. Gate and tooling work used a large share of the phase and keeps growing.**
- Evidence: on `origin/phase/4`, 88 of about 215 Phase 4 review files are gate/tooling lanes. BE: risk-narrow-1 10, r34 9,
  test-scope-1 8, lane0-gates 7, gate-2 6, gate-3a 6, test-speed-1 5. App: lane0 8, test-scope-1 6, risk-narrow-1 6,
  gate-2 6, gate-3a 6, test-speed-app 5. In the first 15 lanes, the five gate lanes held 36 of 75 HIGH/MEDIUM findings and
  26 of the 28 "gate format/process" rows (`phase4-rework.md` A2/A3). R34-BE needed 3 FIX rounds and Lane 0 App needed 4.
- TEST-SCOPE-1 alone took about 6 h of build and 3 fix rounds, with 4×2 BE and 3×2 App review runs (`lane-ready-test-scope-*.md`).
  It saves about 5–7 min per gate (gates were already 8–13 min, `phase4-timing-analysis.md`), and no Phase 4 lane used it.
- GATE-3a cost about 780 k tokens (`lane-ready-gate-3a.md`) and introduced a forgery hole (a short-SHA tag), which seat 2
  found (D-52). It was built to save re-stamps that cost 0.7–3.7 min of agent time each (`phase4-timing-notes-newmac.md`).
- Now the GATE-3 remainder is a whole phase that 4b and HR wait for (D-77).
- Cost: by my estimate, about a third of reviewer and builder effort went to a gate for a solo-dev project with CI off.

**P2. Seam defects got past tier-2 reviews. Only the end-to-end session found them.**
- Approval limits merged in BE and App with two reviewers each, but it stayed `released = false`, so no company could use it
  (`escaped-defects.md`).
- The App never sent `expectedStep` (`escaped-defects.md`). A rebase that had no text conflicts still broke the build,
  because two lanes no longer fitted together (R29b-3U × AL-REST-BE).
- Why it happens: reviewers get "brief + diff only" by design (D-43, D-46), and the flow test that D-51 asks for before
  review was skipped for AL-REST because it "needs AL-REST-BE merged" (`phase4-plan.md` Sequence 2). So nobody looked at the
  joined behaviour until T4.
- Cost: T4 run 1 for tester 1 had about 14 BLOCKED against about 17 PASS (`t4-results-tester1.md`, ledger). This took
  FIX-AL-RELEASE-BE plus DEMO-FM2-BE, a T4b round and a short retest. D-73 itself puts each such bug at about 2–4 h.

**P3. Many rules were added in one day, before any measurement.**
- Every rule from D-43 to D-75 is dated 2026-11-22. WORKFLOW.md grew from 28.4 KB to 46.2 KB (+62 %) in three days.
- The workspace repo got 608 commits on 11-21 and 11-22. The inbox carried about 60 lead-to-lead messages on 11-22
  (`erp-lead.md` 934–1294).
- Rules were reversed within hours:
  - D-54 and D-71 record the same 90 % stop on two Macs, and D-56 replaced both about 40 min later.
  - D-43 was tightened the same day.
- Decision numbers collided (D-46u, D-47u) and there are gaps (D-66/68/70/72/74/76 do not exist).
- D-63 says "measure, then change", but the measurements were never filled in:
  - "First-pass gate: pending" was never filled in on any of the 8 lane-readies that carry it.
  - The slicing comparison promised by L37 (`docs/process/slicing-comparison.md`) was never written.
- Each topic folder in the repos now carries its own copy of `PRINCIPLES.md`, so the text can drift.

**P4. Fix rounds add defects, and that costs review loops.**
- 13 of 75 HIGH/MEDIUM findings were caused or left open by a fix or a rebase, which accounts for 10 of the 26 FIX rounds
  (`phase4-rework.md` A6).
- FIX-BE had 11 review files. R29b had 26.
- In 4 fix checks, one reviewer ACCEPTed a diff in which the other found a MEDIUM or HIGH.
- R34-BE round 2 was fixed from one reviewer's file before the other's arrived.

**P5. Test runs and sessions were often lost to setup and operations mistakes.**
- T4 ran with load average 420. A bill submit failed under load 570 (`t4-results-tester1.md`, ledger).
- Data N4, N5 and D1/AC418-10a were missing in run 1 and still wrong in T4b: Ola was a Viewer, Erik had no company
  (`t4b-results-tester1.md`).
- The plan's expected results for AL-P6/P7/O3 were wrong, so testers logged FAILs that were by design (D-64).
- Gate reruns came from the lead's own actions, not from tests (`phase4-lane-timing-oldmac.md`):
  - `--reviews` left out (11 min);
  - review files not in gate format;
  - a `kill` of java processes that stopped a gate;
  - the DEMO-FM2 rerun on a dirty working tree.
- A hand-back reported counts read from stale result files (CORRECTION, `erp-lead.md` 1214).

## 2. What worked
- **Standing merge** (Jabran, 11-22) removed the biggest wait: 13.7 h of MERGE waiting, with night verdicts held until
  morning (`phase4-timing-analysis.md`). Every lane after it merged within the day (`claims.md`).
- **Test speed:** BE gate 54 → 11 min, App 36 → 8–11 min, and the BE and App gates now run in parallel (GATE-2, 13 min each).
- **A second reviewer on high-risk lanes found real defects:**
  - AC418-BE: Fable found a HIGH where Opus said ACCEPT (`lane-verdict-ac418-be.md`).
  - GATE-3a: seat 2 found the forgery.
  - R29b-3U: reviewer B found a cross-company write (B M1).
- **Old-FAIL / new-PASS tests and an honest defect log.** OUTBOX-CLAIM proved 7 old queries wrong. `escaped-defects.md`
  names the lanes they came from, and the CORRECTION message was sent quickly.
- **Fix lanes grouped by feature after T4** (D-57/D-69): FIX-APP-SWITCH, FIX-AL-RELEASE-BE and FIX-OB-IMPORT-APP each
  needed 0 fix rounds (their lane-readies).
- **One phase plan with a live lanes table** (D-53/D-55): `phase4-plan.md` stayed current, with merged SHAs per lane.
- **MEASURE-1 rework data:** `phase4-rework.md` is the best evidence in the phase. It was collected once and not acted on
  further (see P3).

## 3. Rules D-43 … D-77
| Rule | Call | Why (evidence) |
|---|---|---|
| D-43 Fable stop at 45 % / no Fable | drop (expired) | Temporary until the 11-24 reset. Fable gave AC418's HIGH; bring back a *different model* as the tier-2 second seat. |
| D-44 default effort; high only for security reviews | keep | Small fix lanes at default effort needed 0 fix rounds; no sign of harm. |
| D-45 GATE-3 scope | change | Cut it to items with incident evidence (fail-fast review check: two 11-min reruns; failing-test names; lock wait). Move the rest to the backlog. |
| D-46 review tiers | keep, change | 68 % of review runs were repeats and all findings came from first reviews. Change: the tier-2 second seat must be a different model or angle (seams/integration), not a second Opus with the same blind spots. |
| D-47 whole suite only phase → main | change | The 11-24 plan drops the phase → main suite when `main` has not moved. With scoped gates, nothing then ever runs the whole suite on the combined head, yet D-62 counts on it. Keep a whole-suite run per phase once gates are scoped. |
| D-49 who tests what | keep | Gate failures came from tests outside the targeted set (AC418-BE gate 1). The insurance of full touched-service suites paid off. |
| D-51 speed rules + test ledger | change | The ledger is used (26 rows) and should stay. "Flow test before review" had an exception that let AL slip (P2). A BE+App pair must be flow-tested on both lane heads before either merges. |
| D-53 one plan owner | keep | The plan stayed coherent across two Macs. |
| D-55 plan efficiency | keep 1, 4, 5; change 2 | Two parallel testers lost runs to load and missing data. They start only after a scripted data check passes and the machine is idle. |
| D-57 lanes by feature | keep | Fix lanes grouped by feature needed 0 fix rounds; the mixed B2a/B2b lanes widened reviews. |
| D-61 Accounts on the new Mac | too early | Starts in 4b. Measure inbox messages per lane as well as gate minutes: coordination is already heavy (P3). |
| D-62 read-scan bar | change | "Every natural form, unsure = FULL" took TEST-SCOPE-1 to 4 rounds. It counts on a phase → main suite that is now skipped (see D-47). |
| D-63 principles, measure, prune | keep, enforce | Nothing was measured under it: "first-pass: pending" stayed everywhere. A new rule needs a metric and a check date, or it does not go in. |
| D-65 fewer sub-agents / resume builder | too early | Trial from 4b; no data yet. |
| D-67 brief-gap line | keep (cheap) | Used in about 6 lane-readies, and it already found a wrong-cause brief (B2A-REFRESH). |
| D-69 automate what repeats | keep | B2a-S6 was closed by 3 UI tests when the simulator was down. |
| D-54 / D-71 90 % stop | drop | Replaced by D-56; two records of one event. |
| D-56 use up to 99 % | keep | Jabran's budget call; not a process-quality rule. |
| D-60 flows = Gradle only | keep | A scope decision, not a rule. |
| D-73 seam tests | keep | Directly targets the defects that escaped. Add "brief names the release flag and demo seed" explicitly. |
| D-75 personas, accessibility, AXe | too early / defer | Sessions already overran on data. Add personas after data setup is reliable. |
| D-77 GATE-3 as its own phase | change | Time-box it to 1 day with a named item list, or run it beside 4b/HR. Holding product work for dev tooling repeats P1. |
| D-48/50/52/58/59/64, D-46u/47u | n/a | Lane or product decisions. The u-renames show the numbering needs one owner or per-Mac prefixes. |

## 4. What the lead is likely to miss or be too kind about
- **Their own operations mistakes:**
  - missing `--reviews`;
  - the java `kill`;
  - the dirty-tree rerun;
  - T4 run under load 420;
  - unseeded data twice;
  - wrong expected results in the T4 plan.

  These are lead errors, not tool gaps. More tooling (GATE-3) is not the fix; checklists and a data script are.
- **Rules counted as "added this phase" with 0–3 lanes behind them.** Calling them "keep" is not evidence. Most should say
  "too early".
- **Re-stamp cost was overstated.** The inbox gives about 15 min, the agent notes give 0.7–3.7 min, and GATE-3a cost far more
  and opened a hole.
- **Independence has a price.** "Brief + diff only" reviewers cannot see seams, and every escaped defect in the register is
  a seam or a pre-existing cross-lane gap.
- **The whole-suite gap between D-47/D-62 and the 11-24 fast-forward rule** (see D-47 above).
- **Process before product.** The order is now workflow review → GATE-3 phase → 4b/HR. That is three process steps before
  any feature. Product output in Phase 4 was 4.18, approval limits, isolation (R29b) and QA fixes.
- **Coordination overhead between the two leads:** a RING per merge, ACKs and about 60 messages a day. D-61 adds more
  boundaries (shared code, simulator slots, second seats).
- **Reviewer diversity was quietly lost when Fable paused.** Opus + Opus is not the same check as Opus + Fable.

## 5. Top 3 changes for 4b and HR
1. **Freeze the process during a phase.**
   - Add a new rule mid-phase only to fix a defect or a blocker.
   - Every rule names a metric and a check date, or it does not go in.
   - Back-fill first-pass and cost per lane at merge, and write the L37 slicing comparison before planning 4b lanes.
   - Trim WORKFLOW back to about 30 KB.
   - One decision-number owner.
2. **Test the seams before merge.**
   - Each BE+App feature pair runs one flow on a stack built from both lane heads before either merges. The flow starts
     from Company > Modules (release flag and demo seed).
   - Contract tests per endpoint (D-73).
   - A scripted test-data check (`N1…Nn` verified, machine idle) gates every T session.
   - The brief check verifies the plan's expected results against the spec.
3. **Cap gate tooling.**
   - The GATE-3 remainder gets 1 day and only the items with incident evidence; everything else goes to the backlog.
   - 4b and HR start from `main` beside it, or right after, not after an open-ended tooling phase.
   - Restore a whole-suite run at each phase → main once scoped gates are live.
   - The tier-2 second seat uses a different model whenever one is available.
