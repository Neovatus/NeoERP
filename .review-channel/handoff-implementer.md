# Handoff — 2026-11-21 evening — new-Mac lead, before compacting

## Handoff — 2026-11-22 ~15:15 (new-Mac lead; supersedes ~13:40)
- **Usage:** weekly 85 % (all models), Fable 42 % and paused until Mon 15:00 (D-43). The usage rule says start nothing
  new at 90 %; finish the merge queue first.
- **Rules since 13:40:**
  - D-46 review tiers (Jabran; old Mac): `Review tier: 2|1` in every brief, no Sonnet second review, only the reviewer
    who said FIX re-checks.
  - D-47 gate scope (Jabran): the whole suite runs only phase → main; phase lanes get the scoped gate.
  - D-numbers: the old Mac takes odd numbers and the new Mac even; mine continue at D-50.
  - The second Opus seat signs `Reviewer: Opus 5.5 security (D-43)`.
- **Merged today:** R29b-2, B2b, AC418-BE, R29b-5, OUTBOX-CLAIM-BE, AC418-APP, HR H0. In the old Mac's gates now:
  RISK-NARROW-BE (`-be-r3` df80e554) and RISK-NARROW-APP (`-app-r2` 3fc42d32).
- **Lane-ready, waiting for the ring to rebase once and re-stamp:**
  - **R29b-3U:** `phase/4-b2-r29b-3u` 5f6d65b6 on 409f45e5. Both Opus seats accepted fa045702. The rebase will
    conflict in the baseline file and cap with R29b-5; after it the cap is 0. Re-check that conflict resolution and
    write the lane-ready. Add the release-gates and backlog rows: "the owner accepts before go-live" (D-46u), arch
    rule for internal save/findById, the staff-email signals on the pen-test list.
  - **AL-REST-BE:** `-be-r2` b7c8a123 on 095a8989. Both accept. Check overlap with OUTBOX (db-design §1), and fix
    the "before V77" text in the report.
  - **AL-REST-APP:** `phase/4-b2-al-rest-app` 4da0be01 on 430bc5ab. Opus and Sonnet accept;
    `lane-ready-al-rest-app.md` is written. It merges after AL-REST-BE.
- **Next lanes, when usage allows:**
  - **FIX-APP-SWITCH:** backlog MEDIUM, wrong-company journal after a company switch; `key(holder)` plus a test; tier
    1; after AL-REST-APP merges.
  - **EMAIL-UNIQ-BE:** a unique index on `lower(email)` (Jabran D-46u).
  - **GATE-3** (D-45 scope plus the additions) and **TEST-SCOPE-1** (lead note: Jabran's D-47 scope): after
    RISK-NARROW-1 merges.
  - **DEV-TOOLS:** suggestions 9–11.
  - After R29b-3U merges: delete `docs/agents/r29b/evidence/`.

## Handoff — 2026-11-22 ~13:40 (new-Mac lead)
- **Rules added today:**
  - D-43: no new Fable work until the weekly reset (Mon 2026-11-24, 15:00 Oslo); the second reviewer is a fresh,
    independent Opus.
  - D-44: Opus and Fable run at the default effort; Opus high only for security reviews; Sonnet high if needed.
  - L36 addition: before hand-back, run the full suites of every touched service (App: every size test plus the
    accounts package).
  - The `pgrep` bracket form for wait loops.
  - "Up only while testing": no stack, simulators or idle daemons left running.
- **Merged today:** R29b-2 (BE 409f45e5), B2b (App 430bc5ab), AC418-BE (BE 095a8989, V78), HR H0.
- **Lane-ready, waiting on the old Mac's merge queue** (BE: R29b-5 → OUTBOX-CLAIM-BE → RISK-NARROW-BE; App: AC418-APP
  → RISK-NARROW-APP):
  - **R29b-5:** `phase/4-b2-r29b-5-r` 1560d0d6 on 095a8989.
  - **RISK-NARROW-1:** App `phase/4-b2-risk-narrow-app-r` 66f612e1; BE `-be-r2` e62aa5af. Rebase and re-stamp once,
    when the old Mac rings.
- **AL-REST-BE:** `phase/4-b2-al-rest-be-r2` b7c8a123 on 095a8989, V79. Opus and Fable fix checks accept it; the API
  table is OK'd. Next: when the old Mac rings (after R29b-5, OUTBOX and RISK-NARROW-BE merge), rebase once, check the
  OUTBOX overlap (db-design §1), fix the "before V77" text in the report, re-stamp with a fresh Opus pair, then write
  the lane-ready.
- **Running:**
  - **R29b-3U builder:** the D-40/D-41 step (the direct add becomes an invite, Jabran). Then reviews: Opus high plus a
    fresh, independent Opus (no Fable). Then a rebase onto the then-current BE phase/4.
  - **AL-REST-APP builder:** started on App 430bc5ab. Reviews: Opus plus Sonnet. Rebase after AC418-APP merges.
- **Next:**
  - **GATE-3** (approved, D-45 scope): starts after RISK-NARROW-1 merges.
  - **TEST-SCOPE-1:** after RISK-NARROW-1.
  - **DEV-TOOLS:** backlog items 9–11.
  - **Lead after R29b-3U merges:** delete `docs/agents/r29b/evidence/`.
- **Decisions today:** D-36 to D-45.

**Merged today (through the hooks):** BE `phase/4` = `4b924f08` (Lane 0 BE, DOCS-2b, ISO-R1, R34-BE). App `phase/4` = `69a5deb0` (DOCS-2a, Lane 0 App). Workspace master: ROADMAP-A and ISO-1/ISO-1b drafts (ADR-026 **accepted**, Q5 = b), HRP-DES (**approved**, all 17 decisions + PY.10), INV-SCOPE lane-ready. Draft Phase 4 PRs: BE #8, App #5. Jabran's checkouts: BE at `4b924f08`, App at `69a5deb0`, both clean. BE hook: absolute `core.hooksPath` (`.git/neoerp-hooks`); App hook: relative `.githooks` until R34-App.
**Running (background):** FIX-BE builder (`phase/4-b2-fix-be`, Opus high; R04 cause reported, R07/R08/R09/R10/R13/R17/R19/R20/R25/R29/R30; decisions D-15..D-19 answered, D3/D5 = D-16/D-18 approved by Jabran → building). App A builder (`phase/4-b2-fix-app-a`, Opus high; R03, R05, R06, R12, R14, R15, R22, to UX-1 §25). UX-1 `verify.sh` (`/private/tmp/.../scratchpad/ux1-verify.sh`, NORMAL, then fast-forward App `phase/4` through the hook; verdict MERGE given).
**Next:** UX-1 push after its verify → cut `phase/hrp-v2` from App `phase/4` and start the HR/Payroll spec-update lane (apply HRP-DES to hr-h1, hr-h2-h3, hr-h4, payroll-p, ess, people-access; Opus high + one review) → H1 build with ADR-026 R4 (RLS in the first migration, v1 HR/Payroll/ESS code deleted). FIX-BE and App A: reviews (Opus + Fable security for money/security), lead verify, lane-ready, Jabran verdict. Then App B (incl. R31–R33 and the App items from FIX-BE: R04 report-404 fix, R07 2960, NeoFormat month mirror test, D-16 TB row label), App C, R34-App, R29b, DOCS-2c, retest.
**Waiting on Jabran:** Items/Inventory 21 critical decisions (`lane-ready-inv-scope.md`); Accounts roadmap §7 (15 open; first market group decided). Decided today: sector order (Production, Subscription billing, Projects+/Construction, Grants/NGO, Leases, Fleet, Farm; POS inside Sales), no pilot country, Pakistan + Nordic first, GitHub Actions off on all repos, Fable ≤50 % and for substantial work only, model table (Opus medium for docs/design from specs).
**Rules learnt today (in memory and claims.md):** decision log `.review-channel/lead-decisions.md` (small → lead/Opus, substantial → Fable medium batched, critical → Jabran); fix rounds > 2 for gate lanes are fine when a reviewer proves a real hole, but deliberate local bypasses are documented limits (verify.md threat model).

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


## Handoff — 2026-11-22 ~08:30 — new-Mac lead (read this first)
- **Rules now:** standing merge (approved lanes merge to `phase/*` without Jabran; phase → main PRs too, once all lanes merged + final gates + PR verdict MERGE). L36 in every brief: self-check table, test per fix, gate-format reviews from round 1, JVM+iOS+Android, neighbours. Timeline in every lane-ready: five buckets (Build/Rework/Review/Test/Waiting) + changed-file and item counts. Escaped defects → `docs/process/escaped-defects.md`. GATE-2 merged: one lock per repo, verify.sh without a lockf wrapper. Dev secrets stay tracked: chmod 600 after `git worktree add`, never delete.
- **Lane-ready, waiting for the old Mac's gate:** FIX-APP-B2b (`phase/4-b2-fix-app-b2b-r` `56b6ba03`), R29b-2 (`phase/4-b2-r29b-2-r` `409f45e5`). Merged today: GATE-2, R29b-1, FIX-APP-B1, B2a, BE-JDK21.
- **Running here:** AL-REST-BE builder (`phase/4-b2-al-rest-be`, worktree `al-rest-be`; BE-9 waits for R29b-2's merge, then rebase); RISK-NARROW-1 reviews (Opus + Fable, both lanes: BE `a29e0ac9` no change, App `da221f03` 78/20/3; the open point is new deciding files in narrowed folders).
- **Next, in order:** after R29b-2 merges: R29b-3U (rest of user-service incl. R29b-2 follow-ups F1–F5 and Fable N1–N3/Opus N1, see lane-ready-r29b-2) and R29b-5 (audit + auth) in parallel (trial B), cut from its head; rebase AL-REST-BE. After RISK-NARROW-1: TEST-SCOPE-1 (brief `.review-channel/brief-test-scope-1.md`). After AL-REST-BE's API table: AL-REST-APP (brief `.review-channel/brief-al-rest-app.md`). MEASURE-1 back-fill (`docs/process/phase4-lane-timing-newmac.md`, Sonnet reader; notes in `docs/process/phase4-timing-notes-newmac.md`) when a slot is free.
- **Jabran's open items (JABRAN-TODO):** N8 as-built notes (+ GL at 744), N9 GATE-3, N10 receivables duplicate refuse/warn (money rule), N11 import may create a bank account.
- Decisions today: D-26 … D-35 in `lead-decisions.md`.

## Handoff — 2026-11-22 ~03:00 — new-Mac lead (read this first; then the ~02:05 section below for roles)

- **R29b-1** (`phase/4-b2-r29b-1-r`, base `e872b28f`, built head `7b09f97d`): Opus FIX 0H/2M/6L (`docs/agents/r29b/review-1-1-opus.md`, re-ran 70+490 tests, 0 failed), Fable FIX 0H/5M/9L (`review-1-2-fable.md`); no isolation hole found. **Fix round 1 running** (same builder; D-26 lead decisions). Held for Jabran: D-26 (a) directory/overview pinned ADR-012 exception, (b) Enter-company writes keep `enterCompany` attribution — lead recommends yes to both. After fixes: only the FIX reviewers re-check the fix commits (L35); commit the review files; lane-ready `lane-ready-r29b-1.md`; doorbell the old Mac.
- **FIX-APP-B2 part a** (`phase/4-b2-fix-app-b2`, pushed `e082f53a`): 8 rows done, R02 not reproduced (simulator S2), 440 targeted tests 0 failed, iOS compile green. **R21 Delete draft being built** (D-27: editor ⋯ in five editors). Then Opus + Sonnet reviews (builder's 5 own calls listed in D-27), fixes, lane-ready.
- **Rebase:** BE-JDK21 is now `phase/4-b2-be-jdk21-r2` at `6c31dfbb` (on TEST-SPEED-1 final `50ac03dc`; -r is stale). After R29b-1's fix round: rebase onto -r2 as new branch `phase/4-b2-r29b-1-r2` (no force push), then the re-checks.
- **Merged (Jabran MERGE):** BE `phase/4` = `50ac03dc` (TEST-SPEED-1 + BE-RUN-1 + BE-DOCS-1), App `phase/4` = `496c1517` (TEST-SPEED-APP). Hooks re-installed on this Mac in both clones (2026-11-22, from `origin/phase/4`). New lanes branch from these heads. **App B2a:** after its R21 commit, rebase its own commits (`c4da3143..HEAD`) onto **App `phase/4-b2-fix-app-b1-r` `ce1e7ad8`** (rebased B1 on `496c1517`, same content as `c4da3143`) as new branch `phase/4-b2-fix-app-b2-r`, no force push; then its reviews.
- Next: R29b-2 (user resolver + RBAC), App B2 part b; ring the old Mac when a slot frees.

## Handoff — 2026-11-22 ~02:05 — new-Mac lead (builder Mac; read this first)

Roles (WORKFLOW "Builder Mac and test Mac", inbox DECISIONs 2026-11-22): this Mac owns each lane up to the gate (brief, build, decisions per rule 2, Opus + second-reviewer reviews with re-runs, fix rounds ≤2, push, lane-ready with review files); the old Mac checks files, runs the full gate, merges after Jabran's MERGE and assigns tasks. Parallel builders allowed (own worktree, no shared files, one Gradle job per repo, `scripts/gradle-job.sh` under the L33 lock). Hand-backs ≤10 lines (L35); secret-files sentence in every brief; doorbell the old-Mac lead (`SendMessage`) on each lane-ready or blocker; compact at ~50% context.

In flight: **R29b-1** (org; `phase/4-b2-r29b-1-r` `7b09f97d` on BE-JDK21-r `e872b28f`): built, 10 entries classified, baseline 44→35 (+R34 1→0), arch 70/0; Opus (re-runs) + Fable reviews running; builder open points in `docs/agents/r29b/builder-report-1-org.md`. **FIX-APP-B2 part a** (App `phase/4-b2-fix-app-b2` from B1 `c4da3143`): building (R31 A4 screens, R21, R01, R02, R18, R19, R25 G44, R16/R23); then Opus + Sonnet reviews. Next: R29b-2..5 one at a time (D-25 approved by Jabran 2026-11-22), App B2 part b; ring the old Mac when a slot frees.

## Handoff — 2026-11-22 ~01:10 — new-Mac lead stopping (read this first)

Jabran asked the lead to stop after the three builders and hand over to a new session. **Nothing is running** (no builder,
no Gradle, no backend; Docker infra up). All three lanes are **built, committed and pushed as lane branches**; none is
reviewed, verified or merged.

### Lanes built tonight (each: next = two reviews → lead `verify.sh` → lane-ready → Jabran MERGE)
| Lane | Repo / branch / worktree | Head | Builder result | Range |
|---|---|---|---|---|
| TEST-SPEED-1 | BackEnd `phase/4-b2-test-speed-1`, `NeoERP-worktrees/test-speed-1`, on BE-DOCS-1 `32b07dac` (on BE-RUN-1 `e3009697`) | `2825c64d` | Full run **54 → ~15 min** (3 workers, both locks): 4320 tests, 0 failed, money invariants OK. Year-end test 17 min → 14 s (stale statistics; prod preview/close ~1.2 s at 100,001 lines). accounts in 3 forks (own Postgres per fork; `tmpdir` classes alone first). `--continue`. Light gate (73 risk-check cases). Flaky `SupplierBankEventsTest` fixed (+2 tests). | RISK: two reviews |
| TEST-SPEED-APP | App `phase/4-b2-test-speed-app`, `NeoERP-worktrees/test-speed-app`, from `324d3039` | `280f6b73` | Full run **36 → 11¼ min** (3 forks; timed at 768m, committed 512m: the lead's verify is its first full run): 3905 tests, 0 failed, 1 allowlisted skip; 1786 shot files byte-identical. Size-test 25 ms sleep removed; PNGs encoded off-thread. Light gate (66 cases; `docs/design/**` never light). | RISK: two reviews |
| FIX-APP-B1 | App `phase/4-b2-fix-app-b1`, `NeoERP-worktrees/fix-app-b1`, from `324d3039` | `692b8697` | F1/F1+/F9/F10/F5 (top bar on top, phone search across the bar, side menu), F2/F3/F4 (side panels handle the keyboard; Return/tap ends typing; amounts mono tabular), R32 (`neoKeepInViewWithKeyboard`, all editors/panels/wizards size-tested except Review and go live), F6, F7 not reproduced, F8 partly, A-L1–A-L4. 24 new/changed tests pass, 92-test regression 0 failed. **iOS compile NOT done: Gradle daemon OOM at 2 GiB heap — rerun with `-Dorg.gradle.jvmargs=-Xmx4096M`.** Simulator checks C1–C7 in its builder report. | Opus + Sonnet reviews (amount display) |

**Order for the next lead:**
1. Start the reviews: TEST-SPEED-1 and TEST-SPEED-APP (each Opus fresh + a second, different reviewer, diff + brief only;
   compare the two light gates: script names, marker fields `gate=full|light`, hook rule; they must match before either
   merges). FIX-APP-B1: Opus fresh + Sonnet, after its iOS compile passes.
2. **BE-JDK21:** Jabran approved starting it right after the TEST-SPEED-1 builder (2026-11-21 "Yes, start it then"),
   on the TEST-SPEED-1 head, while TEST-SPEED-1 is in review; rebase onto its review fixes. Brief draft:
   `.review-channel/brief-draft-be-jdk21.md` (copy into BackEnd `docs/agents/be-jdk21/brief.md` in the lane).
3. Full runs (lead): BackEnd `verify.sh --range a50eabbb..HEAD --reviews <f1> <f2>` on TEST-SPEED-1 merges BE-RUN-1
   (Jabran MERGE) + BE-DOCS-1 (old-Mac MERGE, `lane-verdict-be-docs-1.md`) + TEST-SPEED-1 in one fast-forward. App:
   TEST-SPEED-APP first; then rebase FIX-APP-B1 onto it (both touch `docs/design/screen-standard.md`) and run its
   gate. Full runs take both locks: `lockf -k /private/tmp/neoerp-gradle-app.lock scripts/verify.sh …`.
4. FIX-APP-B1 needs the lead's iOS simulator look (C1–C7) before its merge (QA guide "Layout lanes").
5. Then GATE-SLOW-1 (5 slowest classes per full run, approved), App B2, the rest of Phase 4 (see the night section
   below), HR v2 H1 on the old Mac from Monday.

**Questions for Jabran (from the builders; also on JABRAN-TODO):** A-L2 "Saving…" as an info toast or in the
editors' footer (ux §24 says toasts are for finished actions); F4 mono tabular figures on every Amount field app-wide
(cause: Inter Tight's thin no-break space) or only the accrual panel; the old Mac's merge-rule question for
`WORKFLOW.md:328` (answer not known to this lead); the old-Mac split (coding here, full runs + merges there): not
decided yet.

**Findings for a fix row (not built):** five more "7947 in text with random UUIDs" flakes (`SupplierBankNoticeTest:39`,
`BankChangeSignalsTest:59`, `BankNoticeHttpSenderTest:60`, `BankDetailsCryptoTest:32`, `BankSignalsTest:58`);
`EncryptedFileNeoErpTokenStoreTest` clears the real `~/.neoerp` token store on every App run (signs a developer out);
`CreditNoteEditor` `s.customer!!` on an on-account credit note with no customer (guard in `persist`); App test floor
`min_tests=3500` vs 3905 measured (raise = RISK gate change); verify's 4 GB Gradle + 3 GB Kotlin daemon heaps make
every full-run compile swap on 16 GB (separate decision); `-PaccountsTestForks=<n>` and `-Pneoerp.jvmTest.forks=<n>`
are new overrides.

**Gradle (trial L33):** two locks, App first then BackEnd; whole-suite runs take both. Swap episodes tonight only when
a full-size run ran beside another job or with 4 BackEnd workers. Worker count could follow machine memory (old Mac
34 GB) — suggested for the speed lanes' review fixes.

## Handoff — 2026-11-21 night — new-Mac lead (read this first)

**Jabran's direction (2026-11-21, ~23:00): complete Phase 4 first.** Tooling lanes BE-JDK21 (brief drafted in the
lead's scratchpad, `be-jdk21-brief.md`; copy into a lane when it starts) and TEST-SPEED-1 were moved ahead on 2026-11-21 ~23:20 (see the update below).

**In flight:**
- **BE-RUN-1** (opt-in jar mode, `NEOERP_RUN_MODE=jar`): Jabran said **MERGE**. Lane `phase/4-b2-be-run-1` head
  `e3009697` (pushed), lane-ready filed. `scripts/verify.sh --range a50eabbb..HEAD` running in the worktree
  `NeoERP-worktrees/be-run-1` (started 22:29, ~54 min, risk NORMAL). When `verify: OK`: fast-forward BE `phase/4` to
  `e3009697` through the hook, push, record (claims, PROJECT-STATE, lane-verdict file), remove the worktree after.
- **BE-DOCS-1** (docs catch-up): lane `phase/4-b2-be-docs-1` on top of `e3009697` + QA pointer `4ce6b1f5`. Builder done
  (6 commits); Opus review 1 = FIX (M1 P-8 gate restore, M2 ELMA wording, LOWs), decisions in
  `docs/agents/be-docs-1/review-1-opus.md`; builder applying them. Then a short re-review, lane-ready. It rides on
  the next BackEnd full run (no separate 54-min gate for docs alone).
- Backend, simulators and Gradle daemons are stopped (L32). Docker stays up.

**Phase 4 remaining (approved Accounts roadmap):** 4.2 App B (split **B1** layout and input: F1–F10, R32, App A
LOWs; **B2** R21/R31 A4 screens = 4.10, R07, FIX-BE App items, remaining R rows, money parts get a second reviewer),
App C, R34-App incl. R34i, retest; 4.3 R29b; 4.5 DOCS-2c screenshots; 4.18 report and QA1 follow-ups; 4.7 AL S5 →
4.8 P2/S6 → 4.9 small reads → 4.11 owner switch; 4.19 Phase 4 PR. S4 (two iPad keyboard steps) on Jabran's to-do.
**Next for the lead:** App B1 brief (from `docs/agents/qa-round1-retest/fix-list.md`, `simulator-checks-2026-11-21.md`
F1–F10, App A reviews' LOWs), App lane on App `phase/4` `324d3039`.

**Update 2026-11-21 ~23:20 (Jabran: "we should fast the testing before testing more"):** the BE-RUN-1 gate was stopped (script/docs lane). Running now: **TEST-SPEED-1** (BackEnd, `NeoERP-worktrees/test-speed-1`, on BE-DOCS-1; its one full run merges BE-RUN-1 + BE-DOCS-1 + itself; includes the light gate and the flaky `SupplierBankEventsTest` fix) and **FIX-APP-B1** (App, `NeoERP-worktrees/fix-app-b1`). **TEST-SPEED-APP** (App, `NeoERP-worktrees/test-speed-app`, test infrastructure only) runs too (Jabran ~23:30); App B1 is rebased onto it before its gate; BE-JDK21 after TEST-SPEED-1 (brief in the lead's scratchpad).

**Baseline plan for parallel work (Jabran 2026-11-21, ~23:00: "finish the pending things and Phase 4, and the base
line so we can work in parallel"):**
1. BE-RUN-1 merge (gate running) → BE-DOCS-1 lane ready, rides on the next BackEnd full run.
2. **App B1** (App, Opus) and **BE-JDK21** (BackEnd, Opus; brief in the lead's scratchpad `be-jdk21-brief.md`) run as
   two builders in parallel; Gradle: two locks, one per repo, App lock first then BackEnd, whole-suite runs take both
   (WORKFLOW "Test scope", L33); full gates one after the other
   (BE-JDK21 + BE-DOCS-1 in one BackEnd run, then App B1). Go back to one lane if reviews or tests suffer.
3. **R34i** (hooks guard `phase/hrp-v2`) with or before App B1.
4. After App B1 merges: merge App `phase/4` into `phase/hrp-v2` → clean HR base. HR/Payroll v2 **H1 runs on the old Mac from Monday 2026-11-23**, on `phase/hrp-v2`, once App B1 has merged and App `phase/4` is merged into `phase/hrp-v2` (the clean HR base); the old Mac uses its own Gradle locks; the new Mac hands the HR stream over then (Jabran 2026-11-21); in parallel with the rest of
   Phase 4 here.
5. Rest of Phase 4 on this Mac: App B2, App C, R34-App, R29b, retest, 4.18, AL S5 → P2/S6 → small reads → owner
   switch, DOCS-2c, Phase 4 PR.

**Today's other outcomes:** QA guide additions (scroll-then-search check, iOS look before layout merges L31, clean-up
L32 incl. "never `gradlew --stop` on /tmp/gradle-home while the backend runs"); Jabran's App checkout fast-forwarded
to `324d3039`; Kotlin Multiplatform plugin installed in Android Studio 2026.2 (needed the marketplace plugin).

## Handoff — 2026-11-21 late evening — new-Mac lead

- **Merged today (Jabran MERGE):** FIX-BE (BE phase/4 `a50eabbb`), FIX-APP-A (App phase/4 `324d3039`), HRP-SPECS (App phase/hrp-v2 `f15782fa`), INV-SCOPE, VENDORS, Accounts roadmap with all 16 decisions, ARCH-1 step 1 (gap map + capacity model) — all on workspace master. Jabran's checkouts fast-forwarded (BE `a50eabbb`, App `87ae114c`; App now behind phase/4 `324d3039` — fast-forward only with his OK).
- **Decided today:** all 21 inventory + 16 Accounts roadmap decisions; ADR-024/025/026 stay in the workspace (system-level); vendor picks SES / Maventa / PRAL; JABRAN-TODO.md is his to-do list (keep current).
- **Paused:** ARCH-1 step 2 (the new ADRs 017, 027–034) until Jabran has read gap-map.md and capacity-model.md.
- **Simulator checks** (`docs/agents/qa-round1-retest/simulator-checks-2026-11-21.md`): S1–S3 pass on iPhone 18 Pro, R05/R06 do not reproduce; new findings F1–F8 for App B. S4 (iPad) waits for Jabran to grant simulator access. Backend running from Jabran's BE checkout (all 8 services).
- **QA guide done** (`docs/qa/qa-guide.md`, five choices approved by Jabran). Pointer edits approved by Jabran: App `phase/4-b2-qa-guide-app` `15e8316d` and BE `phase/4-b2-qa-guide-be` `8c2cd193` (worktrees in NeoERP-worktrees/qa-guide-app, qa-guide-be): carry them into App B and BE-DOCS-1 (cherry-pick) so they merge with those lanes' verify runs.
- **S4 (iPad):** Jabran granted access 2026-11-21; app launched on iPad Pro 13-inch (M5) (portrait, 1032×1376 pt, not signed in yet). Next: rotate to landscape, sign in as Anna (Keycloak page scrolls when the keyboard opens: use the keyboard's next-field arrow), then S4. Jabran said yes; attach `iPad Pro 13-inch (M5)` (he grants access in the panel), launch the same .app (scratchpad ios-dd), sign in as Anna, landscape, hardware keyboard (set_keyboard hide), run S4 per the App A builder report; append results to simulator-checks-2026-11-21.md.
- **Was running:** QA guide writer (docs/qa/qa-guide.md + pointers; App/BE pointer edits on lane branches phase/4-b2-qa-guide-app / -be, not pushed). After it: check, push workspace, FYI to each lead inbox (docs/inbox/*-lead.md), ≤10-line report to Jabran.
- **Next:** App B brief (R01, R02, R11, R16–R21, R23–R27, R31–R33, FIX-BE App items, LOWs from App A reviews, F1–F8), R34-App incl. R34i (hooks guard phase/hrp-v2), BE-DOCS-1, R29b, HR v2 H1 build on phase/hrp-v2.

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
- 2026-11-19: QA1 BE lane uses accounts V74; **AL S5 moves to V75** (Flyway has no outOfOrder). G08 rule (lead): only ON equal to the agreement becomes INHERIT; explicit OFF stays stored; no INHERIT→INHERIT history rows. BE review fixes sent back to the BE builder (G07 actorSource only on CREATED/UPDATED/SUBMITTED, docs, G39 catalog rename, seed guard).

## STOP at 95% (2026-11-19 ~16:50, 5-h window resets 18:00 UTC) — QA1 fix batch state
- **BE lane** (be-qa1, phase/4-qa1-be, 14 commits, clean): built + reviewed + review fixes done. Full backend `./gradlew test` was running in background (log: scratchpad be-qa1-full.log). If green → fast-forward push to phase/4 (V74; AL S5 moves to V75). Remove be-qa1 after merge.
- **App A** (app-qa1-a, 7 commits + ~20 UNCOMMITTED files = in-progress review fixes: picker focus for hardware keyboard, desktop select-on-entry gate, iOS NumbersAndPunctuation + toolbar removal, paste filtering, focus after pick, explicit number format, onFocusBehavior, spec updates). Resume the lane-A builder (SendMessage to it) to finish + commit; do NOT commit its half work blindly.
- **App C** (app-qa1-c, based on A's 7 commits, ~109 UNCOMMITTED files, layout/wording G34–G38, G39–G47 app side, tokens json). Resume the lane-C builder to finish, commit, then merge phase/4-qa1-app-a (after A's fixes) before final compile.
- **App B** (app-qa1-b, 7 commits + ~11 uncommitted; last commit G23; was mid "placeholders end to end"). Resume the lane-B builder to finish (G15–G30 flows + BE contracts G01–G44 app side).
- Then: Opus review of C and B (A already reviewed; check its fix commits), full app jvmTest + iOS compile once on the combined branch (merge A→C→B or A, C, B into one merge branch), push phase/4, new simulator build, Jabran runs reset (Stockholm org number needs reseed) + make-demo-tokens, retest round (fixed groups + NOT-RUN list + Split View/Larger Text + iPhone Duo/resizable check), then device de-dup.
- **App B update (stopped early, uncompiled):** commits f34e2e3f G04, 42cc13c7 G01+G18, e636a7fa G07+G44, 863f9549 G21+G02, 47522dcc G13+G18, 4f0d585c G23, 78db5910 G10. NOT compiled — run compileLocalKotlinJvm + compileKotlinIosSimulatorArm64 + i18n + accounts tests first. NOT done: G03, G08, G11, G15, G16, G19, G20, G24, G25, G28, G29, G30 (needs a second B builder pass). BE gaps: import history row lacks discardedByName; 403 roles detail not parsed.
- **BE lane MERGED** to phase/4 (6b67792) after full backend run green (42 min). be-qa1 removed. Jabran told to reset + reseed now (no simulator session files yet).
- **App A DONE** incl. all 9 review fixes (b8aa34c6; compiles JVM+iOS; 949 targeted tests green). Two commit messages still say "WIP: not yet compiled" (they compile now). Lane C must merge phase/4-qa1-app-a before its final compile. Retest on sim: NumbersAndPunctuation keyboard, onFocusBehavior=DoNothing with side panels/dialogs, hardware keyboard on iPad pickers, G14.

## 2026-11-19 night: QA1 fixes merged, retest running
- phase/4: BE 6b67792 (QA1 BE, V74; AL S5 → V75). App f42afb54 (lanes A+B+C merged, full jvmTest green after size fix). Reset+reseed done (3 LOCKED months at Kystgruppe, Stockholm org no).
- Simulators: new build installed on 9 devices, fresh sessions (Ola, Anna, Bjørn, Omar, Hina, Ayesha*, Erik*, Sara*, Jonas); *shut down after their tests.
- Retest brief docs/agents/qa-round1-retest/brief.md; results in that folder (no artifact). West tester done (fixed G08 G09 G10 G11 G46; partly G03 G19 G39 G41; broken G25; new: SIE says no org number though DB has it, 2081 line no branch, Back to receivables opens wizard, Enter as opening items still offered after create, Omar sees Withdraw on Ayesha's import, iPhone17 amount letters keyboard, unconfirmed "500"→"5,00").
- Running: Opus Kystgruppe journals tester; Sonnet Sialkot leftovers (G04, G40, Larger Text). Next: Sonnet chunk for remaining Kystgruppe groups (G15 G16 G24 G27 G35 G37 G38 G40 G45–G47; needs a fresh Jonas session for feature switches) + size checks on the 6-size set (iPhone SE needs app + session). Then group retest results → second fix batch.
- New rules (WORKFLOW.md "QA rounds and limits"; memory usage-efficiency-plan, qa-simulator-sizes, qa-report-no-artifact, check-test-result-before-push).
- After retest: Sonnet job fixes phase3-test-steps.md + a4-test-steps.md from the SCRIPT list; add Lessons section to qa-round1-retest/summary.md.

- STOP after retest wrap-up (fix list, script-fix job, Lessons, commit). Do NOT start the second fix batch until Jabran says go (2026-11-19).
- Retest wrap-up DONE (6fa0b72): fix list docs/agents/qa-round1-retest/fix-list.md (R01–R28 + layout/wording + 4 decisions). Waiting for Jabran: go for batch 2 and the 4 decisions. All simulators shut down; sessions will need refresh (lead runs make-demo-tokens.sh).

## Evening plan (Jabran approved 2026-11-20)
Fable process review: docs/reviews/process-review-fable-2026-11-20.md; lessons L15–L29 sorted in docs/lessons.md; WORKFLOW guardrails 5–6 (review strength, isolation).
1. Lane 0 machine gates (Sonnet, both repos, ~1 h): scripts/verify.sh + pre-push hook (failed = 0 AND skipped within allowlist; marker per HEAD); money invariant check script (L12) run after seed and full run; tenant arch test to all 8 services; docs/risk-paths.txt (L16); backend CI trigger dev → phase/** + PR (Actions stay off); first build rules (NeoFormat/NeoNumericInput only, no Double money, no hardcoded colours).
2. In parallel: Sonnet docs clean-up of contradictions (review H1: push, review scope, compaction 80 vs 50, retired models) → WORKFLOW.md single source; memory keeps lead habits only (L25).
3. ADR: row-level security (ERP-Q4) — Opus draft for Jabran.
4. Fix lanes from docs/agents/qa-round1-retest/fix-list.md behind the gates; money/security lanes: reviewer re-runs tests + second different reviewer.
5. One Sonnet retest of changed screens only; scorecard + lessons update.
Omar's role: resolved (same role, doc fixed).
- PROJECT-STATE: resolved 2026-11-20 — refreshed to today (7b0eb44); .claude/.codex copies deprecated; lead updates it every batch.
