# Handoff: old-Mac lead (overseer, test + integration Mac) — 2026-11-22 09:40 Europe/Oslo

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
- L36 (self-check, test per fix, gate-format reviews from round 1, all targets compiled, neighbours, every size test of touched
  screens); L37 A/B/C comparison on real lanes; MEASURE-1 five-bucket Timeline + changed files + item count; escaped-defects (table rows).
- One Gradle lock per repo; `verify.sh` without a lockf wrapper, pass `--reviews <f1> <f2>`; builders via `scripts/gradle-job.sh`
  (zsh: pass task names as separate words). At most one gate + two Gradle builders on this Mac (load 227 crashed the session 08:5x).
  Reviewers/builders run Gradle only when `pgrep -f '[b]in/java .*gradle-home-verify' | wc -l` is 0 (a plain 'gradle-home-verify' pattern matches the waiting shells themselves and deadlocks: 3 agents stuck ~30 min on 2026-11-22). chmod 700/600 `.local-secrets` after `git worktree add`.
- **Up only while testing (both leads):** backend stack and simulators start right before simulator checks or Jabran's testing,
  stop right after (`pkill -f 'services/.*/build/libs/.*\.jar'`; `xcrun simctl shutdown all`). Docker infra stays.
- Simulator sign-in: `simctl uninstall` + `simctl keychain <dev> reset` + install + `tools/dev-session-to-simulator.sh <user>` + launch
  (the keychain keeps old users). Jar build: build jars first via gradle-job.sh (`:services:<svc>:bootJar` ×8), then run-all-services.
- HR lanes: the hook does not gate `phase/hrp-v2`; run verify.sh by rule before merging there.

## Heads
App `phase/4` `8d7e8a96`, BE `phase/4` `409f45e5` (R29b-2 merged); App `phase/hrp-v2` `b91d4abf`, BE `phase/hrp-v2` `16d9a3f`.

## Running now
- **B2b simulator checks** (gate OK 3992/0 on `430bc5ab`, reviews `review-5-opus.md` + `review-6-sonnet.md`): Ola (iPad Pro 13)
  12, 13 PASS; Anna (iPhone `45AD3FD4`) 1,2,4,8,9,11,15,12-phone running; Ayesha (iPad Air 13 `E946C073`) 5,6,7,17,16 running
  (re-signed after keychain reset). Results in scratchpad `b2b-sim-*.md`. Deferred to retest: 3, 10, 14; observation: lists stayed
  on skeleton rows until a tap (iPad Pro 13). Then: **stop backend + shut simulators**, verdict, merge B2b (App `phase/4`), start AC418-APP.
- Backend stack running (jar mode, BE `409f45e5`, from worktree `be-jdk21`) only for these checks.
- AC418-BE fix round 1 (builder, worktree `ac418-be`, head `62b6e1f` + fixes): Fable F1 HIGH (N10 for hand entry: DB unique index +
  409 at submit/approve), F2, Opus L2, L3. Then **Fable fix check** only, then gate (BE), merge. V78 provisional vs AL-REST-BE V77.
- HRP-H0-APP fix (builder): hide People "link employee" + Org headcount, remove dead `/api/hr/employees` calls; pushed `52ce3e31`
  before the fix. Then Opus review, App gate on `phase/hrp-v2` base, merge into App `phase/hrp-v2`.
- HRP-H0-BE: built `f78da66` (pushed); Opus + Fable reviews running (scratchpad `hrp-h0-be-review-*.md`). Builder open points: test
  floor 4300→4150 (confirm at gate); `.env` needs HR/PAYROLL DB + FLYWAY passwords before an hrp-v2 stack runs (local, never printed:
  decide with Jabran when H1 testing needs it); no hosted stack (confirmed). Merge into BE `phase/hrp-v2` after gate.

## Next steps
1. Finish B2b (above). 2. AC418-BE → Fable fix check → gate → merge. 3. H0-APP and H0-BE → reviews → gates → merge to `phase/hrp-v2`.
4. Suspected escaped defect: Accounts `AuditOutboxJdbcAdapter` claim query (LIMIT inside `UPDATE … FROM (… FOR UPDATE SKIP LOCKED)`):
   prove with a test (3 due, limit 1), then fix in a small BE lane (assign to the new Mac or here).
5. AC418-APP after B2b merges. 6. Retest round brief (origin lane per defect). Then DOCS-2c, scorecard, Phase 4 PRs.
7. New Mac: AL-REST-BE, RISK-NARROW-1 reviews, R29b-3U + R29b-5 (trial B), TEST-SCOPE-1 after RISK-NARROW-1.

## Open with Jabran
- Nothing blocking. JABRAN-TODO N3, N8, N9 (GATE-3). Later: HR `.env` passwords for the hrp-v2 stack.

## Decisions today (2026-11-22)
Standing merge (+ Phase PRs); RISK-NARROW-1 and TEST-SCOPE-1; R29b trial B; L36, L37 (A/B/C on real lanes); AL-REST OD/OA;
HR rebuild, base-driven, H0 now, H1 after R29b-3U + AL-REST-BE; plan "Accounts first"; N10 refuse (all entry paths), N11; AC418
OD-1..3 + OD-A1; 4.12/4.14; 4.15 spec (SP-2..10), A1–A6, A9, ADR-022 stage 1, B1–B4, B6–B8; Fable check SP-1, A7, A8, B5 accepted
with its four stricter spec conditions; backend/simulators up only while testing; Docker stays.

## Compact keep line
/compact keep: handoff-overseer.md; my role and the new-Mac address; standing rules verbatim (secrets sentence, no attribution,
no --no-verify/force push, standing merge incl. Phase PRs, one repo per builder, L36, L37, five-bucket Timeline, escaped-defects,
one lock per repo, load limit, up only while testing, simulator keychain reset); running checks/builders/reviews with worktrees and
heads; next steps 1–7; today's decisions. Drop: finished agents' full reports, file dumps, command outputs, screenshots.
