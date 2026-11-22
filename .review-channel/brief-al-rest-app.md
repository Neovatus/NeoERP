# Brief: AL-REST-APP — approval steps on journals, payments and refunds; Owner switch and report; S6 click-through (App, 2026-11-22)

**Roadmap:** `docs/drafts/accounts-roadmap.md` "Phase 4, rest" 4.8 (app steps card, then S6 acceptance), app parts of
4.9 and 4.11. **Repo / lane:** NeoERP-App, branch `phase/4-b2-al-rest-app` from `origin/phase/4`, worktree
`NeoERP-worktrees/al-rest-app`. Copy this file to `docs/agents/al-rest/brief-app.md` as the first commit.
**Slicing:** L37 option B. **Money display lane.** **Builder:** Opus 5.5 high, builder Mac.
**Reviews:** fresh Opus + Sonnet (money display, locale), diff + brief only.
**Starts when:** AL-REST-BE's builder report has its API table and the lead OKs it (shapes below). Until then build
against the contract with mocks only for BE-3…BE-6 (journal endpoints already exist since S4).

## Goal
A person sees on a journal, a supplier payment and a customer refund how many approvals it needs, who approved, who is
next, and can approve the step that is theirs (or sees the line that says why not); the last step posts. The Limits
area uses the new reads; the Owner switch and the self-approval report are on screen; S6 has click-through steps.

## Evidence (read first)
- Spec `docs/design/specs/accounts-approval-limits.md` §1.1, **§4.5** (Approvals card, lines that replace a button,
  timeline), §4.6 (applies to single payments), **§4.7** (Waiting for you), §5–§9 (states, money and dates, AL rules,
  wording, refusals in words), **§10 app tests**, §11 rig routes; rig `docs/design/screen-rig/accounts-al.jsx`
  (`|approval-limits|examples`); `docs/design/specs/approval-card.md` (AC-8 raced decision; HR reuses the steps card).
- Contract snapshot `docs/agents/approval-limits/backend-contract.md` — refresh it from BackEnd `docs/api/accounts-approval-limits.md`
  on `origin/phase/4` (§10.3–10.7, §11) and from AL-REST-BE's API table.
- What P1 built: `brief-p1.md`, `presentation/approvallimits/*`, `data/remote/ApprovalLimitsApi.kt`, `dto/ApprovalLimitsDtos.kt`,
  `LimitsViewModel.kt:95` (History read fallback for `confirmedByUserId`), `LimitsEditorViewModel.kt:43`
  (`/api/rbac/roles` fallback), `ApprovalLimitsScreenSizeTest`.
- Item screens to amend: `journals/detail/*`, `journals/state/JournalDetailViewModel.kt` (post sends no `expectedStep`
  today), `payables/PaymentDetailScreen.kt` + state, `receivables/RefundDetailScreen.kt`, `dto/PaymentDtos.kt:251`,
  `dto/RefundDtos.kt:218`; `docs/design/specs/building-blocks.md`, `screen-standard.md`, `docs/agents/i18n/naming-standard.md`.

## Decided (do not reopen)
1. AL-D1…AL-D19, §2.1, contract (Jabran 2026-11-15/16): earlier steps = Approve (reason "What you checked" on
   journals; note ≤ 500 on payments/refunds), last step = the existing Post / Approve with `expectedStep`; reject in
   More at every step; never a disabled button alone (ux §6); "Nobody can approve step 2" (AL-D19).
2. Payments/refunds: bank details confirmed on **every** step (PAY-6); `PAYEE_CHANGED_DURING_APPROVAL` → item back to
   draft, words from spec §9 (SR-H4).
3. Owner's own fills one step (AL-7); the "confirmed alone" banner rules of P1 stay (SR-L3).
4. Strings en/nb/sv/da in `strings_accounts_approval_limits.xml` (+ the item feature's file); money and dates per spec §6
   (NO and PK formats). Feature off (AL-D13): steps read-only, snapshot shown as stored.
5. Reminders and "Reminded 8 Oct" wait for ADR-025 (AL-D17): not built; no placeholder text.

## Decisions (Jabran 2026-11-22: "od oa as recommended": OA-1, OA-2 decided as recommended below; build them)
- **OA-1 Steps card component.** Rec: a shared `NeoApprovalSteps` in `designsystem/components` (plan P3: reusable by
  HR), Opus check of the component API. Why: HR H2–H4 need the same ladder; a second copy would drift. (A shared
  component change is a stop-and-ask in P1's brief; this asks it once, up front.)
- **OA-2 Where the 4.11 switch and report sit.** Rec: the switch on the Limits page per kind (if Jabran takes BE OD-2),
  the report as a fifth Limits tab "Owner's own" with CSV. Why: same people (READ/UPDATE/CONFIRM), same two-person
  flow. Follows the BackEnd OD-1…OD-3 answers.

## Scope
| ID | Item |
|---|---|
| APP-1 | DTOs + mappers: `approval` block, `actions.approve`, new `blockedBy`, `approvalProgress`, timeline `APPROVED_STEP`, new error codes (tolerant of unknown enums); refresh contract snapshot. |
| APP-2 | `NeoApprovalSteps` (per OA-1): head "Needs 2 approvals · 1 done", band line + "Why 2 approvals?", one row per step (approved / next / stand-in / "Next: you" / unfillable / `nextUnknown`). |
| APP-3 | Journal detail: card, Approve on earlier steps (`POST /journals/{id}/approval-steps/{n}/approve`), Post with `expectedStep`, lines that replace a button, timeline entries, raced decision (AC-8) refresh. |
| APP-4 | Payment detail: same with `/payments/{id}/approval-steps/{n}/approve`, approve + `expectedStep`, PAY-6 on every step, payee-changed outcome. |
| APP-5 | Refund detail: same with `/refunds/{id}/...`. |
| APP-6 | Lists and badges (§4.7): "Waiting for you" under the step rule, "Step 2 of 2 · for Siri Dahl", "1 of 2 approved", capped counts; Home card stand-in line. |
| APP-7 | Owner's draft approve/post answering `SUBMIT_FIRST`: words + Submit offered. |
| APP-8 | Limits editor uses `decide-roles` (BE-9) for everyone; drop the `/api/rbac/roles` path. |
| APP-9 | Limits uses `confirmedByUserId` (BE-10); drop the History read fallback at `LimitsViewModel.kt:95`. |
| APP-10 | 4.11 switch UI and `OWNER_OWN_NOT_ALLOWED` words on every Owner's-own action (per BE OD-1/OD-2). |
| APP-11 | Self-approval report screen + CSV (per BE OD-3 / OA-2), states of spec §5. |
| APP-12 | S6 click-through: `docs/agents/al-rest/test-steps.md` (sign-in, numbered clicks, Expected per step): journal 2 steps, payment 3 steps with stand-in, refund payee change, keep-later-step, Owner switch, report, NO + PK companies. |

## API needed from AL-REST-BE
BE-3/BE-4 endpoints and bodies; BE-6 detail/list/count fields; §11 codes incl. `PAYEE_CHANGED_DURING_APPROVAL`,
`SUBMIT_FIRST`; BE-9 decide-roles; BE-10 `confirmedByUserId`; BE-11 switch read/write and `OWNER_OWN_NOT_ALLOWED`; BE-12 rows.

## Neighbours (outside this scope)
- All server rules: AL-REST-BE. Batch release (spec §4.6 batch) and bank entries: D3 / D (Phase 5).
- A4 leftovers (Automatic reversals tab, recurring notice): 4.10 / App B2. 4.18 report follow-ups: own lane.
- HR approval screens reuse `NeoApprovalSteps`: HRP-2 (old Mac). User-guide screenshots: DOCS-2c.

## Tests
- Spec §10: `JournalApprovalUiTest.{stepOneThenPost, keepLaterStepOpenHidesApprove, alreadyApprovedLine,
  ownerOwnFillsOneStepOnly}`, `StandInTest.{activeStandInCountsInWaitingForYou, noChains, standInNeverDecidesOwnItem}`,
  `ApprovalSnapshotTest.ruleChangeDoesNotMoveWaitingItems`, `ApprovalLimitsReadOnlyTest`; the same set for payment and
  refund (`PaymentApprovalUiTest`, `RefundApprovalUiTest`) incl. PAY-6 per step and payee changed.
- **Old FAIL / new PASS** per changed behaviour: Post on a 2-step journal sends `expectedStep` (today it does not);
  Acknowledge hidden from the alone-confirmer without a History read; editor lists roles without `IAM.ROLE.READ`.
- Money display: band amounts and step amounts in NO (`500 000,00`) and PK (`5,000,000.00`) formats; strict "over"
  wording; no float math (amounts stay decimal strings to the screen).
- DTO decode of every contract example and BE API-table example; unclear writes (no answer / 5xx): re-read before
  deciding, never approve twice; i18n scans (4 languages); `BuildingBlockChecksTest`; size tests for every new or
  changed screen (device matrix, en/nb/font130).
- Targeted `jvmTest --tests …` only, plus the compiles below; no whole-suite run (the old Mac runs the gate).

## Rules
- One repo (App). Gradle only through `lockf -k /private/tmp/neoerp-gradle-app.lock`, log to a file, one watcher;
  never `gradlew --stop`. Do not start the app on this Mac.
- Plain commits, **no AI attribution, no Co-Authored-By**. No push, merge or rebase.
- **Never open or print** `.env`, `.local-secrets/*`, token/session files, `~/.gradle/gradle.properties`, `~/.netrc`,
  `~/.aws`, keys.
- Migrations: none in this repo (BackEnd V77 is frozen once applied).
- Docs: user guide new `docs/user-guide/accounts/approval-limits.md` (steps on items, switch, report; screenshot
  placeholders); amend `journals.md`, `refunds-and-write-offs.md` and the payments page; developer
  `docs/modules/accounts/journal-screens.md` + a new `approval-limits.md`. List each or "none: reason".
- Stop and ask: spec, rig and contract disagree on behaviour; a shared component other than OA-1's must change.

## Builder self-check (L36; in the report)
| ID | Proof (test, file:line, size-test screenshot) | Status |
|---|---|---|
| APP-1 … APP-12 | | |
L36: compile **JVM tests + iOS (`compileKotlinIosSimulatorArm64`) + Android** before hand-back; every finding fixed
with its own old-FAIL/new-PASS test; review files in gate format from round 1 (`Reviewer:/Reviewed:/Range:/Verdict:`).

## Reviews
Fresh Opus (whole diff, component API) → `docs/agents/al-rest/review-app-1-opus.md`; Sonnet money display and locale →
`review-app-2-sonnet.md`. **Report:** `docs/agents/al-rest/builder-report-app.md`.
**Lane-ready:** `.review-channel/lane-ready-al-rest-app.md`.

## Timeline (lane-ready, MEASURE-1)
```
## Timeline
- Build: … · Rework: … · Review: … · Test: … · Waiting: …   (minutes; tokens per agent; FIX rounds; waiting for BE API)
```

## Done when
APP-1…APP-12 proven; targeted tests 0 failed; JVM, iOS and Android compile; both reviews ACCEPT; docs listed;
test steps written; lane-ready with the Timeline; the old Mac's gate green and Jabran's click-through after both lanes merge.
