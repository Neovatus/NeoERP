# Accounts plan (workflow v2 trial, D-81) — module lead: new Mac · DRAFT for Jabran's review · 2026-11-24

Replaces the Accounts part of `phase4b-plan.md` and `4b-lane-list.md` (they stay as history). The scope and decisions are unchanged: `brief-4b-plan.md` "Decisions" (4.14 OD-1…OD-4 and the rest as recommended; Fable's four spec conditions accepted). What changes is how the work runs: features and flows, not lanes and tiers (`docs/process/workflow-v2-draft.md`).
Read `docs/PRINCIPLES.md` first.

**Starts after** `core/phase-4-fixes` is on `main` (the old Mac rings). No code or Gradle on this Mac before that.

## Features in order

| # | Feature (branch, same name in both repos) | Simple / split | Flows, in order | Modules touched | Review (each flow · feature) | Depends on |
|---|---|---|---|---|---|---|
| 1 | **`accounts/dimension-rules`** (roadmap 4.14) | simple: flows in order on one branch, one PR | 1 `set-rules` · 2 `post-with-rules` · 3 `branch-default` | BE: accounts-service, user-service (permission code), org-service (branch field) · App: accounts, organization | 1 Opus · 2 **Fable high** (posting refusals) · 3 **Fable high** (a cross-service id on the branch write, company isolation) · feature: **Fable high** | `main` with the Phase 4 fixes |
| 2 | **`accounts/spreading`** (4.15) | split: `accounts/spreading/feature` + flow branches | `schedule` (spread a prepaid line over months) · `run` (monthly run posts, pause, resume, post again with an approver who isn't a writer) | BE: accounts-service · App: accounts | **Fable high** (posts) · feature Fable high | 1 merged (reads the rules); Fable SP-1 c1/c2/c5 rows in its brief |
| 3 | **`accounts/budgets`** stage 1 (4.17) | split | `entry` (budget by account × dimension × period) · `approval` (the B5 state machine) · `vs-actual` (budget against actual by dimension) | BE: accounts-service · App: accounts | Opus (never posts) · feature Opus | 1 merged; ADR-022 stage 1 set to Accepted in its first flow |
| 4 | **`accounts/allocations`** (4.16) | split | `keys` (key versions) · `run` (run by key version; the run journal lists its contributors, A8 c1) · `headcount-key` (A5) | BE: accounts-service, **HR read** (headcount) · App: accounts | **Fable high** (posts) · feature Fable high | 2 merged (shared run table, SP-5); `headcount-key` waits for HR H1's headcount read |

**Dimension-rules flow cut (after the brief check):**
- **Flow 1** stores and serves the rules, and writes the existing `allowed_dimensions` column through. So from flow 1 on, setting **Not used** already refuses that dimension at posting (the existing step 6).
- **Flow 2** adds REQUIRED on every path and the role-accounts read. Its Fable review also covers flow 1's posting effects.
- Nothing reaches `main` before the feature review.
- Briefs: `brief-accounts-dimension-rules-set-rules-be.md`, `-app.md`. The check is in `brief-check-dimension-rules-set-rules.md`: 18 gaps, all applied.

**Why budgets before allocations:** budgets need only feature 1. Allocations wait for spreading's run table and for HR H1. Budgets fill the gap while HR H1 runs on the old Mac. The roadmap numbers stay as they are.

Two features never run at once on this Mac: 16 GB, one Gradle job, and features 2–4 share accounts-service files.

**Flows for features 2–4 are a first cut.** Each feature's first discovery confirms or changes them, and I note any change here before its brief.

## Shared work (`core/*`, integration lead = old Mac, per v2 §1) — question for Jabran
The 4b list also holds shared platform items. Under v2 they are `core/*` work:
- `core/platform-actions`: 4.12 A (RT-1, `Prefer`, A3, N5 locks).
- `core/platform-data`: 4.12 B, data Stage 0.
- `core/notifications`: 4.12 C, notification-service plus the App inbox.
- `core/realtime`: 4.13 RT-3/RT-4/RT-5.
- `core/strict-fakes`: the App's shared fake backend checks company scope, ids and required fields.
- `core/e2e-spike`: Maestro against AXe, one money flow, with a time box.

D-61's addendum had the new Mac build the platform items. v2 §1 gives `core/*` to the old Mac.
**Rec:** the old Mac owns and merges them; this Mac builds one only when the old Mac asks, between Accounts features.
**Strict fakes:** v2's Definition of Done already asks for contract tests in every flow. Rec: `core/strict-fakes` runs before `accounts/dimension-rules` flow 2, so flow 2's UI tests run on the strict fakes. If Jabran prefers, it can wait.

## Later (not planned yet)
`core/backend-decisions` (the App shows decisions the server makes: `canApprove` with a reason, `canConfirm`), `accounts/editor-speed` (fewer calls per screen), and the carried rows in `handoff-implementer.md`. They come after this list, or when Jabran moves them up.

## Per flow (v2 §4, short)
1. I write the brief from `docs/templates/brief.md`. A brief-check agent opens the code and rules it names.
2. Discovery and plan: the BE builder first, then the App builder. Both read both repos. I check each plan (~10 min).
3. Build and tests, BE first. The App builder gets the BE contract and examples.
4. Flow test: a Sonnet tester on the local stack, on this Mac after the gate, or on the old Mac when the stack is too heavy here.
5. One review of BE and App together.
6. All findings go to one fixer per repo, the same builder resumed.
7. I run the scoped gate and merge.

At the feature's end:
- the feature review;
- the whole suite in both repos with `main` merged in, run on the old Mac;
- the PR to `main` (integration lead).

## Test-session slots (old Mac simulators, v2 §4 step 8)
| Feature | Session | When (rough) |
|---|---|---|
| dimension-rules | flow 1 rules page + matrix; flow 2 line cells in the editors; flow 3 branch default (NO and PK companies) | one session after flow 3 (3 personas, accessibility pass) |
| spreading | schedule + run | after `run` |
| budgets | entry + approval + vs-actual | after `vs-actual` |
| allocations | keys + run | after `run` |
I ask the old Mac one day ahead in the inbox.

## Measures
One line per flow at merge in `v2-trial-measures.md`:
- time;
- first-pass gate result;
- review and fix rounds;
- cost in tokens;
- the brief-gap line;
- swap during the gate (this Mac).

Check-in after feature 1: keep, or change the flow cut.

## For Jabran
1. The feature order (budgets before allocations) and the three-flow cut of dimension rules.
2. The `core/*` owner and `core/strict-fakes` before dimension-rules flow 2.
3. Review models: Fable high on flows 2 and 3 of dimension rules and on the feature review. That is 3 Fable reviews for feature 1, within the Fable budget.
4. **Add account and rules** (lead's recommendation, in the BE brief rule 8):
   - A new account takes its rules at chart level from the template or from the account it was created like, so range rules apply to it.
   - Picking rules on Add account also needs the new `ACCOUNTS.DIMENSION_RULE.UPDATE`; `COA_CREATE` alone can't set them.
   - No reason is asked on create.
