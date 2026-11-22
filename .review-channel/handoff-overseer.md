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
App `phase/4` `430bc5ab` (B2b), BE `phase/4` `095a8989` (AC418-BE); App `phase/hrp-v2` `d91e45cd` (H0-APP), BE `phase/hrp-v2` `f1a6f944` (H0-BE).

## Running now
- **AC418-APP builder** (Opus, worktree `NeoERP-worktrees/ac418-app`, from App `430bc5ab`; API reference = AC418-BE report; A13 covers 409 at submit/approve). On hand-back: reviews (Opus fresh + Sonnet if money display), gate (App), simulator checks if the brief lists them (backend + simulators up only for them), merge.
- Nothing else here. Backend stack and simulators **stopped**.

## Merged today (this Mac's gates)
TEST-SPEED-1/APP, BE-JDK21, FIX-APP-B1, R29b-1, FIX-APP-B2a, GATE-2 (BE+App), R29b-2, FIX-APP-B2b, AC418-BE (V78), HRP-H0-BE, HRP-H0-APP. Verdict files in `.review-channel/lane-verdict-*.md`.

## Next steps
1. AC418-APP (above). 2. New Mac lanes as they ring: AL-REST-BE (must renumber V77 → V79, rebase on `095a8989`), RISK-NARROW-1 (BE+App), R29b-3U + R29b-5, TEST-SCOPE-1, AL-REST-APP. Gate, checks, merge each.
3. Suspected escaped defect: Accounts `AuditOutboxJdbcAdapter` claim query: prove with a test (3 due, limit 1), fix in a small BE lane.
4. H1 brief (after R29b-3U + AL-REST-BE merge): carry H0 LOWs (column grants on outboxes, RlsPolicyCheck expression compare, binder-off guard, floor 4150 → ~4300, Dashboard bounce, wording) + HR `.env` passwords step.
5. Retest round brief (origin lane per defect; data-missing items from B2a/B2b: S4, S5, S6, S2 soft keyboard, S3.3, B2b 1-italic rows, 3, 5, 6, 10, 14, 16a, 17; skeleton-rows-until-tap; template .csv name). Then DOCS-2c, scorecard, final gates, Phase 4 PRs (merge without Jabran after MERGE PR verdict).
6. L36 addition into `docs/lessons.md`: full suite of every touched service + `:architecture-tests` before hand-back; both reviewers re-stamp when a fix changes risk paths.

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
