# Handoff — 2026-11-19 — C1 + C2 merged

**phase/4 (pushed):** backend 82301ee = + C1 backend (allocation document numbers/kinds; accounts+arch 2155 green). App e2d05085 = + C1 app (allocation references as links with in-host way back, view-only receipt/refund pages, NeoKeyValueList touch room on linked rows) + C2 (one report filter pattern; defaults unchanged; balance sheet "As at"; GL Year to date; journal list All periods chip) — full app 3787 green. Codex built C1/C2 (C2 finished by an Opus builder after Codex's limit); all Opus-reviewed. No worktrees left.
**Jabran's checkouts:** on phase/4 but behind — `git pull` both before running.
**New rule 2026-11-19:** every brief names a write scope + read scope (WORKFLOW.md "Builder scope"); lead checks diff paths before merge.
**Proposed, waiting for Jabran's yes:** dev-only token sign-in for simulator testing — local dev build only (compiled out of release, test proves it), localhost backend only, token file made by Jabran via scripts/make-demo-tokens.sh (lead never sees passwords or token text), normal expiry, no backend change; then an iPhone/iPad simulator UI round against UX principles + screen standard (focused, screenshots are costly). Android: no emulator tool.
**Next:** AL S5 (payments/refunds, accounts V73) → AL app P2 (steps card); platform lane after ADR-024/025 OK; A4 click-through; Codex retest round. Backlog: C2 follow-ups (phone period collapse, TB-drill hint, P12/P13 note, older table layouts), decide-roles read, confirmedByUserId, Reports journal exact dates.

# Handoff — 2026-11-16 ~16:30 — STOPPED (Jabran: finish current work, then stop)

**phase/4 now (pushed):** backend e621e20 = main + AL S4 (V71, money-reviewed, fixes) + SEC-1 (V72 = drop plaintext bank columns, renumbered from V73; security-reviewed) — full backend run green after 2 migration-head test fixes (user-service context failures were flaky, green on re-run). App 4e2a6973 = main + AL app P1 (Limits area, two-person confirm, stand-ins, history; shapes verified against backend; review fixes; 2548 tests green).
**Jabran's checkouts** are on phase/4 but BEHIND (not pulled; backend stopped). `git pull` in both before the next run; accounts V71+V72 apply on start.
**Codex (Jabran runs):** C1 payment numbers (worktrees c1-be + c1-app), C2 report filters (c2-app; answers given: balance sheet "As at", GL default year-to-date, journal list "All periods", Reports journal listing periods only). On their reports: lead runs tests, Opus review, merge into phase/4.
**Next (when restarting):** AL S5 payments/refunds (accounts V73) → AL app P2 steps card; platform lane after Jabran accepts ADR-024/025 (summaries given; 3 additions to ADR-025 proposed); A4 click-through by Jabran; Codex retest round on clean data.
**Backlog added today:** decide-roles read, confirmedByUserId, Reports journal exact dates, shopper NeoERP ID idea, decisions 2026-11-16.

# Handoff — 2026-11-16 ~12:30

**Merged to main:** BackEnd PR #7 (c6d5a6f), App PR #4 (370ad7a6). `phase/4` = new main in both repos; Jabran's checkouts on `phase/4`; all merged worktrees removed (remote branches kept). **Running:** AL S4 (Opus) in `NeoERP-worktrees/al-s4`, branch `phase/4-al-s4` (base = main tree) → Opus review → merge into phase/4. **Waiting:** Codex retest (brief `docs/agents/phase3-retest/brief-codex.md`, when Jabran is away from the PC); A4 click-through steps `docs/agents/a4-test-steps.md` for Jabran. Decisions 2026-11-16 in `docs/backlog.md`.

# Handoff — ERP lead session (2026-11-16, ~09:00) — STOPPED at 92% weekly (reset 13:00)

## Full run done on the combined branches (both pushed, both `combined/phase3-4`)
- **Backend** `NeoERP-worktrees/combined-be` = phase/4-id1 (A4 + AL S1–S3 + ID-1a/1b) + fix/phase3-batch-be; A4 features released; arch fixes (journal-import queue classified, recurring line writer reviewed, inventory 117); unreleased tests moved to BUDGETS. Full run 4,166 tests: all green after fixes (entitlement-catalog 11/0, architecture 36/0, org 85/0 re-run; the rest green in the full run).
- **App** `NeoERP-worktrees/combined-app` = phase/4-id1-app (A4 + size tests + ID-1c) + fix/phase3-batch-app2 (Phase 3 batches 1+2); conflicts resolved (Journals list keeps Recurring link + first-use New journal menu; LayoutChecks from batch 2). Full run 3,721 tests, 1 failure = `NeoErpAuthRuntimeTargetTest` live probe against Jabran's running old auth-service (environment, re-check after reset). Android + iOS compile clean.

## Next (needs Jabran)
1. Restart + reset plan: Jabran's checkouts move to `combined/phase3-4` (backend + app) — a jump from fix/phase3-test-fixes to the Phase 4 line; then `NEOERP_CONFIRM_RESET=yes scripts/reset-local-dev.sh`, start services, run the Accounts seeds, everyone signs in again; re-check the auth probe test.
2. Codex retest T1–T24 on clean data (brief to write).
3. AL S4 journals; AL app screens; then remaining Phase 4.
**Jabran 2026-11-16 decided (yes to all):** (1) empty card lines hidden, never "—" (0,00 still shows); (2) phone top-bar search as an icon; (3) DEVCO bootstrap retired — DONE 6ad3c84 on combined-be; (4) DONE 6ad3c84: separate seeded Super Admin, display name "NeoERP Super Admin" everywhere (incl. org-request seed actors, was 'Neovatus Support').


**ID-1b reviewed + fixed (00fdb01, pushed; reset no longer runs the legacy DEVCO bootstrap). After the 13:00 reset, in order:** (2) ID-1c app one id (Sonnet) + rewrite dev-seed-users.md; (3) lead full run; (4) Jabran runs `scripts/reset-local-dev.sh` (needs NEOERP_CONFIRM_RESET=yes) after merging; (5) restart merge of Phase 3 batches 1+2 into his checkouts; (6) Codex retest round T1–T24; (7) AL S4 journals.

## Status 2026-11-16 ~04:50 (weekly 89%: nothing new until the 13:00 reset)
- **Stopped at 90% weekly (~05:30).** Nothing running. Phase 3 batch 2 + review fixes DONE and pushed (`fix/phase3-batch-app2`, f4f92486; 3060 tests green; size tests clean; Android/iOS compile not run — run once before the restart merge).
- **ID-1a done + security-reviewed + fixed, ID-1b done** (Sonnet: seeds, docs, AL §13 rewrite D-204, DIRECT→Direct, reset-local-dev.sh) — both pushed on `phase/4-id1`. **ID-1b still needs its Opus review** (after reset). Then ID-1c (app NeoSession one id, Sonnet) → lead full run → Jabran runs the reset.
- ID-1b open questions for Jabran: (1) DEVCO bootstrap (bootstrap-local-company.sh / run-all-services.sh sign in as superadmin/org.admin/employee) breaks under invite-only — retire it or seed IAM rows; (2) separate seeded Super Admin 1a…0030 vs an existing persona; (3) org-request seed display name 'Neovatus Support' vs Super Admin; (4) stale rows in dev-seed-users.md.
- Batch 2 decisions for Jabran to confirm: hide empty card lines (not '—'); phone top-bar search as an icon.

## Earlier (now done)
- **ID-1a** (Opus) in `NeoERP-worktrees/id1-be`, branch `phase/4-id1` (from phase/4-al): token sub = identity id, user-service id-only resolver, refuse first sign-in without IAM row, user V49 (CHECK + delete V9 local users), shared-security userId==sub check. Approved by Jabran (plan `docs/agents/one-person-id/plan.md`, 9 points, A refuse / B keep claim / C delete). Next: **Opus security review** → fixes → ID-1b (seeds, docs, AL §13 rewrite, Sonnet) → ID-1c (app NeoSession one id, Sonnet) → lead full run → reset + reseed (wipes local data).

## Done tonight (all pushed)
- A4 app P1–P4 + review fixes + **size tests** (device matrix 4 phones/3 tablets/4 desktops × en/nb/font130, automatic layout checks; `phase/4-a4`). Shared-component faults (6) logged in `docs/agents/phase3-test-findings/cross-cutting.md` for the next Phase 3 batch.
- Approval limits: contract approved; **S1** model (63 tests), **S2** user-service V47/V48 + deciders read (security-reviewed, fixed), **S3** accounts V70 limits/proposals/history (reviewed, fixed, 2060 tests) — all on `phase/4-al`. Next: S4 journals after ID-1.
- Legacy sweep: `docs/agents/legacy-sweep/report.md` (item 1 = ID-1 approved; 2–6, 10–12 go to the new HR/Payroll design brief; 7, 9 security clean-ups).
- Rules added: WORKFLOW UI gate 8 (size tests per screen batch); Opus default builder; usage 90/92 stop.

## Phase 3
- Testing paused until after the ID-1 reset (proposed; Jabran asked "we can test again"). Re-run 3: T14, T15 passed; T16 to retry first; T24 setup step 0 added. Rebuilt Dev.app installed (launcher uses new jar; old jar leftover unused).
- Waiting for Jabran's yes: start the next Phase 3 fix batch (queue in phase3-test-findings + shared-component faults).
- "restart" batches: backend `fix/phase3-batch-be`, app `fix/phase3-batch-app`.

## Usage
85% weekly at 02:00, reset 13:00. At 90%: start nothing new; 92%: stop + handoff.

## 2026-11-19 late: QA round 1 done, fix batch running
- DT-1 dev token merged (phase/4: BE 0903e01, App 29dc4b3b + e3316d6b iOS NO/YES rename). Simulators: one person per device (table in docs/agents/qa-round1/brief.md); Jabran runs `NEOERP_DEV_SESSION=1 scripts/make-demo-tokens.sh [users]`; lead copies with NeoERP-App/tools/dev-session-to-simulator.sh (keychain reset first if the device held another person).
- QA round 1 (T1–T24, A1–A18) done; reports+screens committed (workspace 9ba919a, 9d1a331); review page https://claude.ai/artifact/Mv6o5fHZUtCEZHGmHP6se1 ; 47 groups / 189 findings in docs/agents/qa-round1/findings-grouped.md.
- Jabran decisions: G01 only uploader may discard an import check, Owner with written reason; G29 cost centres stay link-only (fix script). Fix rule: collect all, fix once at end; only blockers mid-round.
- Fix batch lanes: BE (worktree be-qa1, running), APP-A touch/input (app-qa1-a, running), then APP-C layout/wording (after A), APP-B flows + BE contracts (after BE). Accounts V73 reserved for AL S5; BE uses V74+.
- After lanes: Opus review each, full runs, merge to phase/4, new simulator build, retest round (fixed groups + NOT-RUN list), then device de-dup (notes in scratchpad size-dedup-notes) and QA devices doc + setup script; Codex desktop brief ready docs/agents/qa-desktop/brief-codex.md.
