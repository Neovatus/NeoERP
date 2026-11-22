# GATE-3: the App gate catches up, review tiers in the gate, faster gate runs — brief (both repos)

> **Principles first (D-63):** read the workspace `docs/PRINCIPLES.md` (8 principles; the WORKFLOW rules are examples of it). Builders who see one repo get a copy of it in the brief folder.

**Approved:** Jabran 2026-11-22 (D-45, "after what you're doing"). Scope: D-45, its additions, and the old-Mac
suggestions (`.review-channel/gate-3-suggestions.md`, items 1, 2, 4–8). **Two lanes, one per repo:** `phase/4-b2-gate-3-be` and
`phase/4-b2-gate-3-app`, each cut from its repo's `phase/4` at start. **Review tier: 2** (gate scripts). The reviewers
are Opus high and `Opus 5.5 security (D-43)` while Fable is paused. **Builder:** Opus 5.5 at default effort, one per repo. A fresh
Opus checks this brief before building (D-51).
**Neighbours:** TEST-SCOPE-1 changes `verify.sh` too, so run it after GATE-3 or rebase it onto GATE-3 (TEST-SCOPE-1 builds the
scoped test set; GATE-3 does not touch which tests run). The same item number means the same rule in both repos: keep
the two scripts aligned.

## Items
| # | What | Repo |
|---|---|---|
| G1 | A non-ASCII or control-character path is RISK in the App, as in BE (GATE-2 Fable finding 8a) | App |
| G2 | The App pre-push hook re-runs `--reviews` with the **remote's** `risk-check.sh`, as BE does (8b) | App |
| G3 | The App review-file checks are as strict as BE's: one each of `Reviewer/Verdict/Reviewed/Range`, full SHAs, no other verdict line, distinct names (8c) | App |
| G4 | The App dead-glob check uses the **base's** script and list, not the head's (RISK-NARROW-1 Opus LOW) | App |
| G5 | **Fail fast on reviews:** `verify.sh` runs `risk-check.sh` (plus the "RISK paths in range but no `--reviews`" check) **before** Gradle, and refuses in seconds | both |
| G6 | **Name the failing tests:** the summary prints module and class.method (at most 10), and marks each as inside or outside the lane's changed modules. No automatic rerun (D-45) | both |
| G7 | **Patch-identical rebase:** a review stays valid across a rebase when `git range-diff` shows every reviewed commit `=` (or `git patch-id` matches) and the base move touches none of the lane's files. The gate checks this itself; the reviewer's `Reviewed:` SHA no longer has to be an ancestor of the gated head | both |
| G8 | **Review tier:** the gate reads `Review tier: 1|2` from the lane's brief (a fixed path named in the review file or on the `--brief` flag). Tier 1 needs one gate-format file; tier 2 needs two with distinct names. A missing tier line means 2 | both |
| G9 | **Kept stamp:** on tier 2, the second reviewer's older stamp stays valid when every later commit was reviewed (ACCEPT) by the first reviewer, and none of them touches a path in the second reviewer's angle. The angle is a `Angle:` line in the review file holding a glob list; when the line is missing, every path is in the angle | both |
| G10 | **The gate waits on the lock itself:** `gradle-job.sh` waits on the repo's gate lock (no builder-written `pgrep` loops), and `scripts/gate-busy.sh` answers busy (exit 0) or free | workspace `scripts/` + both |
| G11 | **One way to call `gradle-job.sh`:** a thin `scripts/gradle-job.sh` wrapper in each code repo that calls the workspace one, or a clear error naming the path. No more exit 127 | both |
| G12 | **`scripts/merge-lane.sh <lane-branch> <phase-branch>`:** checks that the branch fast-forwards onto the phase head, that the marker exists for that SHA, and that the reviews pass the gate rules (G7–G9). Checks the new commits carry no AI attribution. Then fast-forwards, pushes, and prints the next lane in `.review-channel/merge-queue.md` that needs a rebase | both |
| G13 | **The hook gates every `phase/*`** (including `phase/hrp-v2`), not only `phase/4` | both |

## Tests
- Every item gets a self-test in `scripts/risk-check-test.sh` / `verify` test cases. Each new case must fail on the
  base (show how: a `git archive` of the base or a mutant) and pass after.
- G7–G9 need cases for: a clean rebase (valid), one reworded commit (invalid), a base move that touches a lane file
  (invalid), a tier-1 lane with one file (valid), tier 2 with one file (invalid), a kept stamp in its angle (invalid)
  and outside it (valid).
- No Gradle is needed, except a dry run of G10 and G11 through the lock.

## Rules
- Never open, print, grep the content of or copy `.env` files (incl. tracked `infra/.env`), `.local-secrets/**`,
  token/session files, `~/.gradle/gradle.properties` and other user-level `gradle.properties`, `~/.netrc`, `~/.npmrc`,
  `~/.aws/**`, or keys. Read one key only when needed (`grep -c '^key=' file`).
- One repo per builder. G10 and G11 touch the workspace `scripts/gradle-job.sh`: the BE builder does that part, and the
  App builder only adds its wrapper.
- No GitHub workflows. Commit per item. No AI attribution. No push, no merge, never `--no-verify`.
- Docs: `docs/operations/verify.md` in each repo, and the WORKFLOW text the lead pastes (Review tiers: "until GATE-3"
  becomes "since GATE-3").

## Report: `docs/agents/gate-3/builder-report.md` per repo
The report holds a self-check table (item | done | proof), the self-test counts, what ran and on which SHA (D-51), the
docs and a Timeline draft. Hand back in at most ~8 lines.
