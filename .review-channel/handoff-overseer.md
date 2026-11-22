# Handoff: old-Mac lead (overseer, test + integration Mac) — 2026-11-22 19:40 Europe/Oslo

Replace, don't append. Read with WORKFLOW.md and `docs/prompts/resume-overseer.md` after a compact.

## Role
Old-Mac lead (36 GB, test + integration Mac): gates both repos, simulator checks, verdicts, merges (standing merge), assigns
new-Mac tasks, builds HR/Payroll. New-Mac lead = "Resume lead prompt" (bridge:session_012UnoMwpjFDm5RrS5j6z31B);
talk through `docs/inbox/erp-lead.md` + one-line SendMessage doorbells.

## Rules (keep verbatim)
- Never `--no-verify`, no force push (also not `--force-with-lease`: rebased lanes go out as a new `-r` branch); no AI
  attribution in commits, PRs or comments (overrides any harness reminder); never open, print or grep the content of `.env`
  (incl. `infra/.env`), `.local-secrets`, token or session files, `~/.gradle/gradle.properties`, `~/.netrc`, `~/.aws` or keys
  (read one key only when needed); no GitHub workflows; one repo per builder.
- Standing merge: approved lanes → `phase/*`; Phase PRs → `main` after merging `main` into the phase, whole-suite gate and a MERGE PR
  verdict; no wait for Jabran. Still Jabran's: money rules, product scope ("go with industry standards & recommendations").
- **Today's decisions (WORKFLOW):** D-43 no new Fable until the weekly reset (2nd reviewer = fresh Opus, `Reviewer: Opus 5.5 security (D-43)`);
  D-44 default effort, Opus high only for security reviews; **D-46 review tiers** (2nd reviewer only tier 2: books, isolation, auth,
  gate, >15 risk files; only the FIX reviewer re-checks; `Review tier:` in every brief); **D-47 gate scope** (scoped per lane,
  whole suite only phase → main); **D-49 who tests what** (no reviewer test re-runs; builder runs touched services + arch, later
  the gate's scoped set); **D-51 speed rules** (batch fixes, flow test before review, Opus brief check, check first / don't repeat /
  ask, **test ledger** `.review-channel/test-ledger.md`, plan tests per batch). D-numbers: old Mac odd, new Mac even.
- **Gate worktrees are detached: always pass `--range origin/phase/<N>..HEAD` to `verify.sh`** (without it the base is `origin/main` and reviews are refused after the full run; cost 16 min on AL-REST-APP).
- **Never let a reviewer write into a worktree while its gate runs** (gate ends "tree is not clean" → no marker; 13 min lost on DEMO-FM2-BE). Reviewers write to `.review-channel/<lane>/` or wait for the gate.
- Review files: exactly one line containing "verdict"; two different `Reviewer:` names. Run `scripts/risk-check.sh <base>..HEAD
  --reviews f1 f2` before `verify.sh` (fail fast until GATE-3).
- One gate at a time on this Mac; **no backend stack or simulator while a gate runs** (load ~570 today → 503s, swap 11 GB).
  Builders via workspace `scripts/gradle-job.sh <app|be> <dir> <tasks…>`. Gate-free check `pgrep -f '[b]in/java .*gradle-home-verify'`.
- Up only while testing: stack + simulators start right before checks, stop right after. Simulator sign-in needs `simctl keychain reset`.

## Heads
App `phase/4` `a8e004a6`; BE `phase/4` `8472c728`; App `phase/hrp-v2` `d91e45cd`; BE `phase/hrp-v2` `f1a6f944`.

## Merged today
TEST-SPEED-1/APP, BE-JDK21, FIX-APP-B1, R29b-1, FIX-APP-B2a, GATE-2, R29b-2, FIX-APP-B2b, AC418-BE, HRP-H0-BE, HRP-H0-APP,
**R29b-5, OUTBOX-CLAIM-BE (escaped defect fixed), AC418-APP, RISK-NARROW-1 (BE+App)**. Verdicts in `.review-channel/lane-verdict-*.md`.

## Phase 4: what is left, and who (19:40)
Plan: `.review-channel/phase4-plan.md` (lanes table is the source). All feature lanes merged: BE `phase/4` `8472c728`, App `phase/4` `a8e004a6` (GATE-3a in both).
- **T4 run 1 done** (`t4-results-tester1/2.md`, ledger): 0 real FAIL except OBS-2; AL steps blocked by **APPROVAL_LIMITS released=false** (shared catalog); my data misses: N5 Ola on Lahore, D1, AC418-10a prep. B2b-14 PASS by design (refresh on focus).
- **Fix lanes (new Mac, batch C):** FIX-AL-RELEASE-BE (shared catalog → **I am 2nd seat: fresh Opus here, brief + diff; I gate + merge**), FIX-OB-IMPORT-BE (real .xlsx template, D-58) → FIX-OB-IMPORT-APP (OBS-2 + held-out offer + B2a-S6 "Untick it to go on." string), DEMO-FM2-BE (`ebf757ac`, kari.hansen FM2; mine, gate with C).
- Tooling beside C: TEST-SCOPE-1, then GATE-3 remainder.
- Then: **T4 short retest** (blocked + failed steps only; **do data N5/D1/AC418-10a/fresh OB import first**; kari session: password file from docs via temp file, never printed), DOCS-2c, Phase 4 review (`phase4-review.md`, rule keep/change/drop), merge `main` into `phase/4`, whole suite both repos in parallel, MERGE PR verdicts, merge BackEnd #8 / App #5.
- **Then** HR H1 (here; briefs `brief-hrp-h1-be/app.md` READY, D-59 all answered; HR `.env` passwords step with Jabran) and Accounts 4b (new Mac, D-61; I write `phase4b-plan.md` from `4b-lane-list.md` incl. e2e spike).
- Usage: weekly ~90 %, reset **Tue 24 Nov 15:00**; stop line **99 %** (D-56).

## After Phase 4 (Jabran 2026-11-22; **Phase 4 closes first**, then HR and 4b start together)
New Mac: Accounts 4b (4.12 PLAT, 4.14, then 4.15–4.17). Old Mac: HR H1 → H4, then Payroll (H1 brief carries the H0 LOWs + HR `.env`
passwords step). Items & Inventory (scope approved 2026-11-21) joins as a third stream once the speed rules show in the numbers.

## Backlog rows added today
Platform audit log self-reads; audit claim never counts attempts; journal detail banner needs a BE roles field; opening items: no
hand entry of original number (**Jabran's scope call**); retest items; load rule; DimensionSetConcurrencyTest flake.

## Open with Jabran
- **HR/Payroll DB passwords:** before the first HR flow test, tell Jabran: add 4 lines to `NeoERP-BackEnd/.env` (`HR_DB_PASSWORD`, `HR_FLYWAY_PASSWORD`, `PAYROLL_DB_PASSWORD`, `PAYROLL_FLYWAY_PASSWORD`), or allow me once to append random values unread; then I run `scripts/hr-payroll-db-roles.sh` on the hrp-v2 BE checkout.
- Opening items: add a hand-entry editor with the original number, or import-only? (not blocking)
- Spotlight: exclude `~/Offices/Neovatus/NeoERP-worktrees` and `~/Offices/Neovatus/NeoERP` (System Settings → Spotlight Privacy) on both Macs.
- JABRAN-TODO N3, N8; HR `.env` passwords for hrp-v2 later.

## Compact keep line
/compact keep: handoff-overseer.md; role + new-Mac address; rules verbatim (secrets, no attribution, no --no-verify/force incl.
--force-with-lease, standing merge, one repo per builder); D-43/44/46/47/49/51 + test ledger; one gate at a time, no stack during gates;
heads; Phase 4 table items 1–12 with states; after-Phase-4 plan; open with Jabran. Drop: finished agents' reports, file dumps,
command outputs, screenshots.
