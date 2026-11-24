# Workflow v2: independent check (D-79)

Date: 2026-11-24. Reviewer: fresh Opus 5.5, read only. I did not read the lead's conclusion files (`phase4-review.md`,
`phase4-review-compare.md`, `workflow-review-topics.md`).
Short paths used below: **V2** = `docs/process/workflow-v2-draft.md`, **WF** = `WORKFLOW.md`, **BT/RT/TT** =
`docs/templates/brief.md` / `review.md` / `tester.md`, **D81** = `.review-channel/lead-decisions.md:758-768`,
**ED** = `docs/process/escaped-defects.md`, **RW** = `docs/process/phase4-rework.md`, **S1/S2** = the seam reviews
`phase4-seam-review-1-money.md` / `-2-isolation.md`, **NM** = `workflow-review-input-new-mac.md`,
**AD** = `arch-data-calls-decisions.md`.

Overall: the draft follows D-81 closely and is much shorter than WF. Its main weaknesses are:
(a) it cannot work with today's hooks and gate;
(b) it drops the second reviewer on money and security without saying so;
(c) it drops a few cheap rules that Phase 4 evidence shows are needed: "where else?", the company-isolation
guardrail, migrations against origin, and builders never push;
(d) its contract wording ("missing or empty fields") misses the exact bug class that the seam reviews found (an explicit `null`).

---

## 1. Does the draft implement D-81 faithfully?

| D-81 point | Draft | Verdict |
|---|---|---|
| Branches: `main` → `<module>/phase-<x>`, straight in with one builder per repo, batch branches only for parallel work, deleted at merge (D81:760) | V2:18-24 | **Faithful.** But V2:28 defers the names to GATE-3 ("keep `phase/<n>`"), and that does not work for two modules at once (see 4.1). |
| Phase end: whole-phase review by feature, BE+App together → fixes → whole suite → PR (merge commit) (D81:760) | V2:33-35 | Faithful. **Added:** "two reviewers split by feature… Fable, medium" (V2:34). D-81 says "by feature… like the Phase 4 seam reviews", but S1/S2 were split by *angle* (money, isolation), not by feature. Also "medium" effort conflicts with V2:87 (default effort; high for security). |
| Batch = unit, full flow brief → discovery+plan → plan check → build BE then App → tests → flow test → one review → fix → merge (D81:761) | V2:37-46 | Faithful. **Added:** step 7, the simulator session (from D-69, fine), and the brief check in step 1 (from D-51, fine). |
| Brief = frame, not fence; "not a limit"; standard wins (D81:762) | BT:3-9 | Faithful. |
| Every agent owns the flow, records "decisions I took" and "found outside the brief"; money rules, scope and contract go to the lead (D81:763) | V2:16, BT:51 | **Weakened for reviewers and testers.** RT and TT have no "decisions I took" or "found outside the brief" lines (RT:19-36, TT:20-25). D-81 says "every agent". **Added** to the stop list: "a new pattern where one exists, a write outside its repo" (V2:16). That is fine, it comes from WF:286. |
| Discovery is the builder's first step; the same agent builds and fixes; the lead writes the brief and checks the plan (D81:764) | V2:41, :44, BT:28-31 | Faithful. **Ambiguous:** a batch has a BE builder and an App builder (V2:42). Does the App builder do its own discovery and plan, and when? See 5. |
| DoD with tests for all cases, a test table first, a missing case is a finding (D81:765) | V2:50-57, BT:46-48, RT:15-16 | Faithful. **But** the contract case says "missing or empty fields" (V2:53). D-81 says the same, and both miss explicit `null` (see 3). |
| Review: own end-to-end pass first, then a verdict per builder decision, checks the test table (D81:766) | V2:60, RT:8-17 | Faithful. |
| Builders read both repos, write only their own (D81:767) | BT:24-25, V2:42 | Faithful. |
| Not in D-81: **one reviewer for books, money, isolation and auth** (V2:44, :61) | | **Added, and it weakens a guardrail.** WF:121, :346 and the memory rule "money/security guardrails: mandatory, not trials" require a second, different reviewer on tier 2. D-81 says "one review of the batch", which most readers take as replacing it, but it does not say so. Jabran should decide this one point explicitly (see 2.6 and 4.2). |
| Not in D-81: "changing this workflow only at a phase review" (V2:95-96), the merge script that records cost automatically (V2:81) | | Added. The first is reasonable. The second is GATE-3 work: nothing records cost until it exists, and a bash script cannot see token cost (see 5). |

## 2. Lost rules

The verdicts are **KEEP** (add it back), **COVERED** (already there, and where) or **DROP OK** (safe to drop, with the reason).

### Safety
1. **Secrets.** COVERED at V2:90 and BT:54. KEEP three things:
   - RT has **no secrets line at all**. The 2026-11-22 leak was a reviewer printing `~/.gradle/gradle.properties` (WF:342).
   - The rule "never delete the tracked secret files in a worktree (a tracked deletion could be committed)" is gone (WF:342).
   - BT:54 leaves out `~/.npmrc`, keychains and the `chmod` step that V2:90 has.
   The App builder now reads the BackEnd repo, where `.env` and `infra/.env` are tracked. So briefs should also say
   "exclude them from grep" (`grep --exclude=.env -r`, or `git grep` with exclusions).
2. **No `--no-verify`, no force push, no AI attribution.** COVERED at V2:26 and BT:54.
3. **No GitHub Actions.** COVERED at V2:91 and BT:54. DROP OK for the why (WF:341 history).
4. **Builders never push; the lead pushes only after reading "BUILD SUCCESSFUL" and "0 failed" in a separate step** (WF:62-63, :224).
   **KEEP.** V2 says work "goes straight in" the phase branch (V2:21) but never says who commits and who pushes to it.
   With one builder working directly on the phase branch, this rule is what stops a builder from pushing.
   V2:27 ("pushes only from the checkout that holds the marker") is close, but it is not the same rule.
5. **"Nothing is merged uncompiled; test runs fail on unexpected skips"** (WF:346). COVERED by the gate: verify.sh checks
   "skips within the allowlist" (BE `scripts/verify.sh:61`). DROP OK if V2 §7 points to it.

### Money and security guardrails (WF:343-348, "not trials")
6. **A second, different reviewer on tier 2** (books, isolation, auth, gate scripts, large changes; WF:121, :346).
   **Dropped silently.** V2:63 says "money and security keep their guardrails" and lists three of them, but not this one.
   Evidence that it mattered:
   - RW:182: 45% of first-round HIGH/MEDIUM rows were found by one reviewer only.
   - RW:188: in 4 fix checks, one reviewer's ACCEPT covered a diff in which the other found a MEDIUM or HIGH.
   - RW:179: on R29b-1 (isolation), 4 of 6 MEDIUM were found by one reviewer only (Fable).

   The gate also still *requires* two ACCEPT files on a RISK range (BE `scripts/verify.sh:53-54`).
   KEEP in a reduced form, or have Jabran drop it explicitly (see "Must change" 2).
7. **Money invariants after every seed and full run.** COVERED at V2:63. Two related points:
   - KEEP "the scoped gate always adds `:architecture-tests` and the money invariants" (WF:125). V2:66 says only "scoped".
   - Unresolved, and older than V2: the invariants run only "when the local stack is up" (BE `verify.sh:51`), while V2:67
     says "no backend stack… during a gate". Say which one wins.
8. **A test per money or security finding.** COVERED at V2:54 and :63.
9. **Accountant sign-off and pen test before go-live.** COVERED at V2:63. DROP OK for the owners and the ERP-Q refs; they live in the go-live doc.
10. **Company isolation** (WF:348): the tenant architecture test covers every service; database RLS comes by ADR
    before the first customer; **Payroll's rebuild must carry the company column.** **KEEP: it is dropped entirely.**
    HR and Payroll are the next module phase, and S2:229-234 notes that RLS is not on in Phase 4. Isolation rests on the
    scoped repository layer alone.
11. **Opus builds anything that touches money, security, auth, locking, concurrency or migrations** (WF:145).
    Partly COVERED: V2:84 lists money, security and migrations. KEEP **auth, locking and concurrency**.
    The outbox claim defect (ED:10) was a concurrency defect.

### Records and ownership
12. **Start or resume** (WF:24-37): read the state, then check branch, HEAD and dirty paths; never take another worker's task.
    **KEEP as 3 lines.** CLAUDE.md says reading state is mandatory "per WORKFLOW", and V2 has no such section.
    DROP OK for the long checkpoint table (WF:66-83). The batch folder and handoff file replace it.
13. **"One owner per decision; agents never reopen a decision recorded in the spec's decision table; design is frozen at
    commit"** (WF:155-157, :172-174). **KEEP.** V2 gives builders wide decision rights (V2:16, BT:8), so this is the
    line that stops a builder "deciding within the standards" from overriding an approved spec.
    FBE-4 (RW:72, a 6-character minimum that no decision covered) is this failure.
14. **Escaped-defects register** (`docs/process/escaped-defects.md`). **KEEP** in the records table (V2:71-81). It is the
    only measure of whether v2 works.
15. **Test ledger** (WF:132), `lane-ready` and `lane-verdict` files, the probation (WF:349), the lessons register (WF:353).
    - DROP OK for lane-ready, lane-verdict and probation: D-61 ends them, and V2's batch folder plus merge record replace them.
    - The test ledger: KEEP or state its replacement. TT:8 still refers to "(test ledger)", but V2 §8 does not list it.
    - The lessons register: DROP OK only if V2 says that `docs/lessons.md` is archived and V2:96's "topics list" replaces it.
16. **A failure in an unrelated test gets a backlog row with an owner the same turn, or it blocks** (WF:225). **KEEP** (one line).
    Without it, scoped gates in two parallel phases will step over each other's red tests.

### Approval boundaries (what still needs Jabran)
17. COVERED at V2:13: product scope, money rules, statutory rules, design approval, the workflow, FIX or failed gate.
    KEEP these:
    - **"Login or sign-in changes need his explicit approval"** (WF:148). Dropped. Seam M1 (S2:32-64) was a sign-in lock-out.
    - **The design gate** (WF:184): no build until the contract and the screen design (rig) are approved. V2 names design
      approval as Jabran's, but nothing stops a batch from starting before it.
    - **"Drafts that change scope, rules or decisions on workspace `master`"** (WF:350).
    - DROP OK: "moving or retiring a document needs Jabran's OK" (WF:330), which is low value.
18. **Standing merge conditions** (WF:350). Mostly COVERED by V2:45, the merge script and V2:35. The "no open question for
    Jabran" condition is missing from step 6. KEEP as a "Done when" word.

### Gradle and machine limits
19. One job per repo, the old Mac's double gate, no stack during a gate, Docker after a restart: COVERED at V2:67.
    - DROP OK: "run verify.sh without a `lockf` wrapper", `--stop` after Android/iOS, the `gradle-job.sh` slots, the OOM
      fallback. Move them to `verify.md`, which V2:67 already points to. Check that they are there first.
    - KEEP "builders spawn no helper agents" (WF:223, memory). A builder that "owns the flow" will be tempted to spawn them.
    - Changed: the new Mac used to run "no full gates" (WF:352). V2:92 lets it run "scoped gates for its module".
      That fits D-61, but it should be stated as a change.

### Docs as part of done (WF:203-210)
20. Partly COVERED at V2:56 and BT:38 (user-guide and developer pages, or "none: reason").
    KEEP: `tools/shots.json` and regenerated screenshots, `glossary.md` and `decisions.md`, and **"pages describe what is
    built, not the spec"**. The three docs lanes produced 6 of the 15 category-2 rows by describing unbuilt screens
    (RW:252, D2A-1..3, D2B-1).

### UI quality gates (WF:241-274)
21. **One shared piece per concept.** Partly COVERED: V2:55 says "nothing duplicated" and BT:6 says "reuse". KEEP the
    rule "a missing piece is added to the design system and `building-blocks.md` first, with its lint check" (gates 1-2).
    "Nothing duplicated" does not say what to do when the piece doesn't exist yet.
22. **"Where else?"** (gate 7, BE and App: search the siblings, fix in the shared piece or in every sibling, list the
    places found). **KEEP: it is dropped.** V2:51 "every path discovery found" is about the flow's own paths, not about
    sibling code with the same pattern. Seam M3 (S2:105-133) is exactly a missed "where else?": OUTBOX-CLAIM fixed the
    7 queries with SKIP LOCKED and missed the user and auth outboxes that have no claim at all.
23. **Realistic data.** COVERED at BT:36 and V2:56.
24. **Screenshots before Jabran** (light, dark, phone width), and **review includes consistency** ("a screen that differs
    from its siblings is a finding"). Partly dropped. KEEP the sibling-consistency line in RT step 1.
25. **Size tests.** WEAKENED. V2:53 says "size tests in en, nb, sv, da". WF:270-274 has the device matrix (4 phones,
    3 tablets, 4 desktops including 1024×700), **large font**, and the automatic layout checks.
    KEEP "on the shared device matrix incl. large font".
26. **Builder brief review checklist** (WF:337-338):
    - "desktop and keyboard behaviour unchanged": dropped.
    - "shared component changes list their callers": dropped.
    - "JVM and iOS compile": dropped, and **Android** should be added (B1-G1, RW:96: an Android compile failure found only at the gate).
    KEEP all three in BT's checklist.
27. **The write-scope check before merge** (`git diff --stat` inside the write scope, WF:288). Dropped. KEEP: it is one
    line in the merge script.
28. **Loop guardrails:**
    - Two strikes: COVERED at V2:48.
    - A finding needs evidence: COVERED at V2:48 and RT:22.
    - **Time box** (WF:170): dropped. KEEP (see 4.3).
    - **"No new scope inside a review"** (WF:164): dropped. KEEP. RT asks the reviewer to "add any decision the builder
      should have taken", which invites new scope.
    - **What happens after the one fix round** (WF:158-161): unclear (see 5).
29. **Reviews `git fetch` first and list new migration files against the latest origin; migrations freeze once applied**
    (WF:118, memory). **KEEP: dropped.** With two Macs on two phase branches, Flyway version clashes and edits to
    applied migrations are more likely than before.
30. Codex as builder or second reviewer: V2 §9 names only Claude models, while WF:5 said tool-neutral. DROP OK if Codex is
    retired; otherwise say so in one line.

## 3. Would v2 have prevented Phase 4's problems?

### Escaped defects (ED)

| Defect | Draft step that catches it | Confidence |
|---|---|---|
| ED:9 `PATCH` email `""` clears the email without the Keycloak sync | DoD 2 edge value "empty" (V2:53), plus discovery "every path" (V2:41) | likely |
| ED:10 claim query `LIMIT … FOR UPDATE SKIP LOCKED` touches every row | **none reliably.** "Very large" and "repeats and races" are generic. The bug needs ANALYZE plus a batch larger than the limit. It is now caught by the db-design §1 standard, which V2 points to. | low |
| ED:11 the App never sends `expectedStep` | batch = both repos (V2:37), discovery reads both repos, contract case "the App sends exactly them" (V2:53), one review across BE and App | high |
| ED:12 duplicate opening receivables (HIGH) | DoD "repeats" (double submit, same event twice), the money rule goes to Jabran (V2:16), Fable review | likely |
| ED:13 `hasPermission` 403 instead of 503 | DoD "refusals with the right error code" (V2:53), if the brief lists D-25 in its rules | likely |
| ED:14 App verify took the BE lock; ED:15 App gate older than BE | **none.** V2 has no rule for gate or tooling batches. Gate lanes were 36 of 75 HIGH/MEDIUM rows (RW:249). The new-Mac lead's proposal of a done line for open-ended lanes (NM:24) is not in V2. | none |
| ED:16 semantic merge break (rebase compiled nowhere) | mostly avoided by design: straight into the phase branch with one builder per repo means fewer rebases. The scoped gate on combined code and "counts from that run" (V2:57) cover the rest. | high |
| ED:17 feature built but `released = false` | BT:34 release flag, plus flow test on the local stack (V2:45) | high, but TT should say "start from the Modules page as a company admin" (ED:17's own lesson). It does not. |

### Seam-review MEDIUMs

| Finding | Draft step | Confidence |
|---|---|---|
| S1 M1: `null` flags make Limits unreadable (strict Json) | **probably none.** V2:53 and BT say "missing or empty fields". A *missing* field with a default decodes fine. It is an *explicit `null`* for a non-nullable App field that fails (S1:36-42, S2:139-142). The contract examples show only `true`/`false` (S1:42), so "BE accepts the published examples" also passes. | Fix the wording: "every field the BE declares nullable is sent as `null` in a contract test, and the App decodes it". A cheaper alternative is an App architecture rule: DTO nullability matches the BE DTO. |
| S2 M4 `actorId: null`; S2 M5 null email; S2 L5 null code | same as above | same |
| S2 M1: the V50 email index locks a person out at sign-in | discovery "every path the change touches" (V2:41, BT:30), if read as "every writer of the changed column". The EMAIL-UNIQ brief and reviews listed 3 write paths and missed the sign-in sync (S2:56-57). | medium. Make it explicit: "every writer and reader of the data you change (grep the column and the repository method)". |
| S2 M2: every org request runs a full bootstrap | batch review "architecture kept" is too vague. The whole-phase review caught it (V2:34). AD §1 also shows editor chains of 9-11 calls, and nothing in V2 or the standards it links checks call cost. | low per batch, medium at phase end. Put "a read never writes; every outbound call has a timeout; no full bootstrap as an auth check" in BE `ARCHITECTURE.md`, not in V2. |
| S2 M3: audit events recorded twice (user and auth outboxes have no claim) | **none**, because V2 dropped "where else?" (2.22). DoD "same event twice" covers only the batch's own code. | none as drafted |
| AD §2: 4 App decisions with no BE answer, ~7 duplicate masks (and S1 L2) | none in V2. It is a standard question ("the server decides, the App reads `actions`") and belongs in App `ARCHITECTURE.md`. | none |

### Rework causes (RW:247-253)
- Brief or spec gaps (22 rows): the brief check (V2:40) plus discovery and the plan check (V2:41) address these well. This is the draft's strongest part.
- Fix-caused findings (13 of 75; 10 of 26 FIX rounds): V2 keeps the same reviewer for the fix check, alone. RW:188 shows
  single fix checks missing fix-caused MEDIUM/HIGH 4 times. Nothing in V2 makes fix checks wider. Cheap mitigation: the fix
  check reads the whole changed function and its callers, not only the fix diff, and each fix brings a failing-first test (V2:54 already).
- Gate-script lanes (48%): not addressed (see ED:14/15 above).

## 4. New risks and simple mitigations

1. **Hooks and gate don't know the new branches.**
   - Both pre-push hooks gate only `^refs/heads/(main|phase/[0-9]+)$` (BE `.githooks/pre-push:116`, App `:63`).
     **Any other name, including `accounts/phase-4b` or `accounts/4b-x`, pushes with no gate at all.**
   - V2:28 says "keep `phase/<n>`", but `4b` does not match `[0-9]+`, and two modules need two numbers.
   - verify.sh picks its default range from a branch name that starts with `phase/<N>`, otherwise `origin/main`
     (App `scripts/verify.sh:251-257`). So a batch branch with a new name gets the whole suite, and light or scoped
     markers are refused.

   Mitigation: until GATE-3 lands, use integer phases recorded in PROJECT-STATE (e.g. `phase/5` = Accounts 4b,
   `phase/6` = HR H1) and batch branches `phase/5-<batch>` (already accepted as lane branches). Make the hook change a
   done line of the GATE-3 phase. D-77 already puts GATE-3 before the parallel phases, so say "v2 branch names start
   after GATE-3".
2. **One reviewer, and the gate wants two.**
   - BE `verify.sh:53-54` refuses a marker on a RISK range without two ACCEPT files from two different reviewers.
     V2's one-review flow cannot get a marker on money or isolation code until GATE-3 item 3 (V2:102).
   - The Fable budget is limited (paused or a 45% stop in the memory rules), yet V2 makes Fable the single reviewer for
     every money, isolation and auth batch and both phase reviewers.
   - When Fable is out, Opus alone would have missed 4 of 6 on R29b-1 (RW:179).

   Mitigation: for books, isolation, auth and gate batches keep a second, independent reviewer (Opus, high effort, given
   the diff and brief only). That is a small subset of batches. If Jabran prefers one reviewer, the interim rule is "Fable
   or wait; never Opus alone on books or isolation", and GATE-3 must ship before the first such batch.
3. **Builders "owning the flow" drift out of scope.**
   - BT:8 ("do it… and record it as a decision") has no size limit.
   - Phase 4 already shows drift: FBE-4 (RW:72) and BD1-1 (go-live P-8 rewritten beyond the brief, RW:52).

   Mitigation: anything outside the plan the lead OK'd is reported *before* it is built if it changes behaviour a user
   sees, data, a rule or a contract; other extras (refactors, siblings found by "where else?") are built and listed.
   Bring back the time box: no green test in N hours → report.
4. **Findings pile up at phase end.**
   - The whole-phase review comes after every batch (V2:33-34), and then "fixes (one batch)".
   - Seam reviews found 6 MEDIUM across Phase 4. A longer v2 phase with less per-batch review could find more, all at the
     end, when the code is cold and other work waits.

   Mitigation: a seam check every ~3 batches (one reviewer, the batches merged since the last check), or cap a phase at
   ~5 batches.
5. **Two phase branches drift from `main` and from each other.**
   - Shared code (`shared/**`, user-service, org-service, the design system) is touched by both modules.
   - V2 merges `main` into the phase branch only before the PR (V2:25).

   Mitigation: shared-code changes go only through the integration lead's batch to `main`. Each phase branch merges
   `main` at the start of every batch, not only at the end. Migration version numbers are claimed in `claims.md`
   (see 2.29).
6. **Reading both repos.** It costs context, and the builder may read the wrong state (Jabran's checkout on another
   branch). Mitigation: the brief names the other repo's sha or worktree and says to read it with `git show <sha>:path`
   or in a read-only worktree. Add the `.env` grep exclusion (2.1).
7. **Straight into the phase branch with no batch branch.**
   - A batch that fails review leaves half-done code on the shared phase branch.
   - The App builder may read a BE that is not reviewed yet.

   Mitigation: commits stay local (or on a batch branch) until step 6. "Straight in" means the lead merges after the gate;
   the builder does not commit on the shared tip. This needs one sentence.
8. **The merge script does not exist** (`scripts/merge.sh` is absent in all three repos). V2:27 and :81 describe it as
   present. Say what the interim manual steps are (the WF:350 sequence).
9. **"Same builder resumed" for fixes** (V2:44, :86) fails when that builder's context is near the 80% handoff.
   Fallback: a fresh builder reads the builder's hand-back and plan.

## 5. Simplicity and ambiguity (where two agents would act differently)

- **One builder or two per batch?** V2:42 says "builders, each writing only in its own repo". V2:41 says "the builder (BE first)".
  - Does the App builder write its own plan?
  - Does the App build start after BE is built, after BE is reviewed, or after BE is merged?
  - Does the flow test (step 4) wait for both?

  State it: two builders, BE plan → BE build → App plan (with the BE contract) → App build, then one flow test and one review.
- **Where the files live.** The batch folder is "in each repo" (V2:76), but the review covers both repos in one file (RT).
  Which repo holds it? Is the test table in the brief (BT:46) or in the plan? One sentence settles it.
- **After the one fix round.** V2:61 says "one fix round, checked by the same reviewer". If that check finds a fix-caused
  MEDIUM, as happened in 10 of 26 rounds (RW:212), does a second round start, or two strikes, or escalation?
- **Severity has no definition** in V2 or RT. S2:107-109 shows a reviewer re-rating a HIGH as MEDIUM against the brief.
  Add one line each for HIGH, MEDIUM and LOW, as S1:15-19 does.
- **The review model is defined in three places:** the phase plan (V2:31), step 5 by subject (V2:44), and the gate reading
  the brief (V2:102). Keep one: the brief's line, set from the step 5 rule.
- **Effort:** "Fable, medium" (V2:34) against "default; high for security reviews" (V2:87).
- **The phase review split:** "by feature" (V2:34) or by angle, as in Phase 4.
- **"Tests for all cases"** (V2:53) lists about 20 kinds. One agent will test "other currency" on a stand-in screen;
  another will skip half the list. Add: "each kind is a row; not applicable → N/A + reason", and say which kinds apply
  only to App or only to BE batches.
- **The invariants need the stack,** but the stack is not up during a gate (see 2.7).
- **"The merge script records… cost"** (V2:81). A bash script cannot read sub-agent token use. Either the lead records cost
  in the hand-back, or drop cost.
- **TT:8 refers to a "test ledger"** that V2 §8 no longer lists.
- On complexity, V2 is close to the right size. The only parts that could be cut further are §10's usage and compact
  thresholds, which belong in the lead's memory.

---

## Must change before approval (ranked)
1. **Branches and gate:** until GATE-3 ships the hook and verify changes, keep integer `phase/<N>` names (one per module
   phase, recorded in PROJECT-STATE) and `phase/<N>-<batch>` batch branches. Today any other name pushes ungated
   (BE pre-push:116, App :63).
2. **Second reviewer:** keep a second, independent reviewer for books, isolation, auth and gate batches, or have Jabran
   drop that guardrail explicitly. If dropped, the fallback is "Fable or wait", never Opus alone. Either way, square it
   with `verify.sh:53` until GATE-3.
3. **Contract case wording:** "every nullable BE field sent as `null` is decoded by the App" (S1 M1, S2 M4, M5, L5),
   plus "every writer and reader of the changed data" in discovery (S2 M1).
4. **Add back "where else?"** for fixes and patterns, with the list of places found (S2 M3).
5. **Add back** these one-liners:
   - company isolation (WF:348, Payroll's company column, RLS by ADR);
   - builders never push;
   - migrations checked against origin, applied migrations never edited;
   - login and sign-in changes and the design gate need Jabran;
   - approved spec decisions are not reopened by builders;
   - an unrelated red test gets a backlog row or blocks;
   - scoped gate always runs `:architecture-tests` and the invariants.
6. **Add a secrets line to RT** and the `.env` grep exclusion for cross-repo reading.
7. **Resolve the ambiguities:** two builders and their order; the file locations; what follows a failed fix check; the
   severity definitions; one place for the review model.
8. **Add a start/resume rule** (read state, then check branch, HEAD and dirty paths) and say what replaces the test ledger
   and the lessons register.

## Could change later
- A seam check every ~3 batches instead of only at phase end.
- A done line for gate and scan batches (the list of cases they must catch, or a time-boxed spike) (NM:24). Needed before
  the GATE-3 phase starts, really.
- Standards, not workflow: App DTO nullability matches the BE (architecture test); "the server decides, the App reads
  `actions`" (AD §2); BE outbound calls need timeouts and a read never writes (S2 M2); a call budget per screen (AD §1).
- The device matrix with large font in the DoD size tests; Android compile in the checklist; "desktop and keyboard unchanged".
- Docs: screenshots, glossary and "describe what is built".
- Opus for auth, locking and concurrency; "no helper agents" for builders; the time box.
- Escaped-defects register in §8; Codex's role in one line; the merge script's cost field.

Brief: unclear or missing — The brief does not say whether the Fable budget is available again after today's reset. That
changes how risky "one Fable reviewer" is. It also does not say whether Codex is still used as a builder or second reviewer.
I read the hook and verify regexes myself (BE and App `.githooks/pre-push`, `scripts/verify.sh`) to judge the branch-name
risk; nothing was run.
