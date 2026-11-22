# Handoff: old-Mac lead (overseer, test + integration Mac) — 2026-11-22 09:00 Europe/Oslo

Replace, don't append. Read with WORKFLOW.md and `docs/prompts/resume-overseer.md` after a compact.

## Role
Old-Mac lead (36 GB, test + integration Mac): full gates both repos, simulator checks, verdicts, merges (standing merge), assigns
new-Mac tasks, builds HR/Payroll and 4.18 here. New-Mac lead = "Resume lead prompt" (bridge:session_012UnoMwpjFDm5RrS5j6z31B);
talk through `docs/inbox/erp-lead.md` + one-line SendMessage doorbells.

## Rules (keep verbatim)
- Never `--no-verify`, no force push; no AI attribution in commits, PRs or comments (overrides any harness reminder); never open,
  print or grep the content of `.env` (incl. `infra/.env`), `.local-secrets`, token or session files, `~/.gradle/gradle.properties`,
  `~/.netrc`, `~/.aws` or keys (read one key only when needed); no GitHub workflows; one repo per builder.
- Standing merge: approved lanes → `phase/*`; Phase PRs → `main` after final whole-suite gate + MERGE PR verdict; no wait for Jabran.
  Still Jabran's: money rules, product scope, rule/scope drafts (he said "go with industry standards & recommendations").
- L36 (self-check, test per fix, gate-format reviews from round 1, all targets compiled, neighbours); L37 A/B/C comparison on real
  lanes; MEASURE-1 five-bucket Timeline + changed files + item count; escaped-defects log (table rows).
- One Gradle lock per repo; `verify.sh` without a lockf wrapper, pass `--reviews <f1> <f2>`; builders via `scripts/gradle-job.sh`.
  Before parallel gates shut simulators and stray daemons; stop only own daemons by PID/home. chmod 700/600 `.local-secrets` after
  `git worktree add`. HR lanes: hook does not gate `phase/hrp-v2`; run verify.sh by rule.

## Heads
App `phase/4` `8d7e8a96`, BE `phase/4` `16d9a3fe`; App `phase/hrp-v2` `b91d4abf`, BE `phase/hrp-v2` `16d9a3f`.

## Running (this Mac)
- Builders: HRP-H0-APP (Sonnet, `NeoERP-worktrees/hrp-h0-app`), HRP-H0-BE (Opus, `hrp-h0-be`), AC418-BE (Opus, `ac418-be`).
- Gate: R29b-2 BE (`NeoERP-worktrees/r29b-2`, reviews `docs/agents/r29b/review-2-3-opus.md` + `review-2-4-fable.md`).
- Jar-mode backend stack: **not running** since the 08:5x session crash (restart from `NeoERP-worktrees/be-jdk21`, move it to BE `phase/4` first). B2b iOS app built in scratchpad `ios-dd-b2b` (stale after B2b's fix).
- 08:5x: the Claude session went down; the Mac did not reboot (uptime 4 days). Load average peaked 227 on 14 cores (gate with 3 workers + 3 builders + Testcontainers). Keep at most one gate + two Gradle builders at a time on this Mac. **Backend stack only on demand** (Jabran 2026-11-22): start it right before simulator checks or Jabran's own testing, stop it after; gates and builders never need it (Testcontainers).

## Next steps
1. R29b-2 gate → verdict → merge → doorbell (new Mac cuts R29b-3U + R29b-5; AL-REST-BE rebases).
2. B2b: FIX sent (A4ScreenSizeTest.importCreated overlaps). On its re-hand-back: gate, simulator checks (iPhone Anna 1,2,4,8,9,11,
   15,12-phone; iPad Air 13 `E946C073` Ayesha 5,6,7,16,17; iPad Pro 13 Ola 12,13; defer 3,10,14), verdict, merge; then start
   AC418-APP (brief `.review-channel/brief-ac418-app.md`, from App `phase/4`).
3. H0 lanes and AC418-BE on hand-back: reviews (H0-BE Opus+Fable; H0-APP Opus; AC418-BE Opus+Fable), gate, merge
   (H0 into `phase/hrp-v2`). AC418-BE migration V78 provisional vs AL-REST-BE V77: second to merge renumbers.
4. Fable's 4b conditions into the 4.15/4.16/4.17 briefs; 4.12/4.14 briefs ready for after the Phase 4 PR.
5. Retest round brief: record the origin lane of every defect (escaped-defects). Then DOCS-2c, scorecard, Phase 4 PRs.

## Open with Jabran
- Fable's four spec-changing conditions (SP-1 c1, c2, c5; A8 c1) in `docs/drafts/fable-check-4b-money-decisions.md`.
- JABRAN-TODO N3, N8, N9 (GATE-3). Answered today: N10 refuse, N11 no import bank accounts, HR OD-1, AL OD/OA, 4b decisions.

## Decisions today (2026-11-22)
Standing merge (+ Phase PRs); RISK-NARROW-1 and TEST-SCOPE-1 approved; R29b trial B (3U + 5); L36, L37; AL-REST OD-1..3/OA-1..2;
HR: rebuild (delete v1), base-driven start, H0 now, H1 after R29b-3U + AL-REST-BE; plan "Accounts first"; N10, N11; 4.12/4.14 as
recommended; 4.15 spec approved (SP-2..10), A1–A6, A9, ADR-022 stage 1 accepted, B1–B4, B6–B8; SP-1, A7, A8, B5 via Fable (no REJECT).

## Compact keep line
/compact keep: handoff-overseer.md; my role and the new-Mac address; standing rules verbatim (secrets sentence, no attribution,
no --no-verify/force push, standing merge incl. Phase PRs, one repo per builder, L36, L37, five-bucket Timeline, escaped-defects,
one lock per repo, chmod secrets); running builders/gates/stack with worktrees; next steps 1–5; open items with Jabran; today's
decisions. Drop: finished agents' full reports, file dumps, command outputs, screenshots.
