# HRP-DES review 1

Reviewer: Opus 5.5 (fresh, read-only)
Reviewed: 5f1468535e24
Range: 854ad08706ee..5f1468535e24 (branch base 13ce4a2, 5 commits behind origin/master; only `docs/drafts/hr-payroll-design-refresh.md` is added)
Verdict: **FIX**

All line numbers below are in `docs/drafts/hr-payroll-design-refresh.md` unless another file is named. Workspace paths
are relative to the workspace root. App and BackEnd paths are at the commits the draft names (App `f19a101b`, UX-1
`be956110`, BackEnd `d0dd5441`).

## Findings

1. **BLOCKER: PY.4 and decision 6 contradict AL-D16, which Jabran decided on 2026-11-15.** At :104, :166-167 and in
   "Not changed" at :189-190, the draft keeps pay-run approval to one approver and moves multi-level approval to
   "later". But `docs/agents/approval-limits/plan.md:45` lists under "Decided (Jabran 2026-11-15)": "the new Payroll's
   pay-run approval uses the shared limit model (bands, steps, stand-ins, two-person limit changes) from day one".
   `docs/backlog.md:369` repeats this for the new Payroll design. The draft cites only the spec (:43-44) and the gap
   check's priority 2, and leaves out AL-D16. The "later" wording in plan.md:69 is the planner's recommendation, and
   :45 replaced it. Also, :33 calls approval limits "a draft spec", but Jabran approved the contract on 2026-11-16
   (plan.md:9).
   **Fix:** rewrite PY.4 so Payroll uses the shared model in its first approval slice. The Standard policy (one band,
   one decide-code step) is today's four eyes, and scope rule 4 (four eyes, Owner's own, fails closed) stays inside it.
   Square payroll's Owner's own (L-1, L-2) with the model's Owner rule (`accounts-approval-limits.md:55` says that rule
   is Accounts-only). Turn decision 6 into "confirm how AL-D16 is built in P0/P1", or drop it. Correct :33 and
   :189-190.

2. **MAJOR: PY.2 and decision 4 reverse Jabran's country-order decision without saying so.**
   - At :102 and :160-162 the draft proposes SE → NO → PK → FI → IS → DK. It does not name what this overturns:
     D1, PK → NO → SE → DK → FI → IS, decided by Jabran on 2026-10-09
     (`docs/drafts/hr-payroll/HR-PAYROLL-LEAD-REVIEW.md:531-533, :565`; `docs/handover/erp-lead-decisions.md:123`).
     It also overturns J-8 "PK first" (`NeoERP-BackEnd/docs/api/payroll-v2-p1.md:880`).
   - It does not weigh the reason PK was put first: two demo companies and the simplest rules
     (`docs/handover/target-countries.md:21-22`, "all three before launch").
   - J-8 says all six countries are signed off before launch. If that still holds, the payroll order does not decide
     when the first sale happens, so "checking Pakistan first delays the first sale" does not follow.
   - The gap between the Accounts and Payroll country orders was already known and accepted
     (`docs/inbox/hr-payroll-lead.md:48`).
   - Moving the SE pack and AGI into P1 rewrites the P1 contract (written around the PK pack) and P6. That is size L,
     not M.

   **Fix:** label decision 4 "amends D1 and J-8 (Jabran)". Give at least two options with their trade-offs: (a) P1
   keeps PK and only the filing slices P4–P9 are reordered with SE first; (b) SE moves into P1. Ask whether J-8 ("all
   six signed off before launch") still holds. Change the size to L.

3. **MAJOR: H1.3, PY.5 and decision 8 misstate the source.** At :63 the draft says Accounts uses `:shared:file-store`
   for bank details at rest, citing `services/accounts-service/build.gradle.kts:35-39`. That is not what the file says:
   - The file store is used for export files (:35-36).
   - Bank details use Tink AEAD (:38-39) through accounts-service's own
     `infrastructure/crypto/BankDetailsCrypto.kt`.

   There is no shared field cipher, so "Both are built" (:173) holds only for the file store.
   **Fix:** state that the cipher must first move into a shared module, or that HR copies the same Tink scheme. Name
   that as a build step with a security review. Keep the item critical.

4. **MAJOR: X.2 (:43) leaves out ADR-026's database roles (M5) and test rule (D8).** Only Accounts has a runtime role
   (`NeoERP-BackEnd/infra/postgres/initdb/accounts-runtime-role.psql`). hr-service and payroll-service have none, so
   row-level security does nothing while either service connects as the owner or a superuser.
   **Fix:** add the following to the isolation block:
   - An owner role used only by Flyway.
   - An app role that is `NOSUPERUSER NOBYPASSRLS NOINHERIT` and owns nothing (P-5).
   - `RuntimeRoleCheck`, including the `relrowsecurity` and `relforcerowsecurity` checks.
   - The binder and the M2 functions.
   - Service tests running as the runtime role from the first slice.

   Sources: `docs/drafts/ADR-026-row-level-security.md:106-111, :132, :165`; `docs/backlog.md:208`.

5. **MAJOR: H23.2 and decision 5 (:77, :163-165) miss AL-D5.** AL-D5 is a target design Jabran decided on 2026-11-15
   (`docs/agents/approval-limits/plan.md:43`): the relation step types exist now, and "the new HR supplies the people
   from its start". The draft keeps HR to "one band, one step", which is the spec's October limit. That now runs
   against AL-D16's "from day one", the 2026-11-15 rule "target design first" (`docs/backlog.md:367-368`), and approval
   chains being priority 1 for large customers (`large-customer-gap-check.md:12`).
   **Fix:** cite AL-D5. Offer HR kinds on the shared model with bands and steps the company can set (at most 3 per
   band, AL-D2), with one step as the Standard default. If the draft keeps one step only, present it as a named
   narrowing of scope for Jabran to decide.

6. **MAJOR: some items are labelled non-critical but fall in the critical classes.**
   - X.13 (:54) cites product direction itself, and it removes the `(:companyId IS NULL OR …)` filters that ADR-024 F5
     says "weaken isolation" (`ADR-024-data-at-scale.md:48`).
   - X.4 (:45): the money half (`NeoMoney`, no Double, the L24 guardrail) is payroll money.
   - PY.7 (:107): the sign of a payroll one-off amount is payroll money.
   - H23.8 (:83) restates G-6, a statutory decision Jabran made.

   **Fix:** mark these critical, or split X.4 into a money part and a format part. Update the counts (:130-141) and
   the sentence at :143.

7. **MINOR: PY.3 (:103) misses gap-check D7.** D7 adds a dimension override on `one_off_inputs`, marked "Before P1
   build" (`docs/drafts/hr-payroll/large-customer-gap-check.md:56`). **Fix:** add it to PY.3 and decision 7.

8. **MINOR: X.3 (:44) misses two guardrails.** L17 (a generated cross-company test for every gateway route) and L18
   (an unexpected skipped test fails the run) are both Conventions (`docs/lessons.md:60-61`) and apply to every new HR
   and Payroll route. Also, "today it lists only migrations" is not quite right:
   `NeoERP-BackEnd/docs/risk-paths.txt:87` also covers each service's security configuration. **Fix:** add L17 and L18,
   and correct the wording.

9. **MINOR: X.12 (:53) misses the ADR-025 phasing for the rebuild.** `docs/backlog.md:351-352` says the rebuild sits
   "on the foundation from day one (leave approvals with push …)", with mobile push RT-7 coming with the HR/ESS
   rebuild. **Fix:** add push for leave approvals and the RT-7 dependency. Consider marking the "sensitive data as ids
   only" part critical (security).

10. **MINOR: ADR-023 (reporting layer) is not mentioned.** It is still Proposed. It expects a payroll cost-line fact,
    visibility classes (`PAYROLL_PERSONAL`, `PAYROLL_AGGREGATE`, `HR_CONFIDENTIAL`) and HR job facts over time,
    fetched through a scoped, audited read (`NeoERP-BackEnd/docs/adr/ADR-023-reporting-layer.md:49, :60, :73, :82`).
    **Fix:** add a "Not changed, checked" bullet: no v2 contract change while ADR-023 is proposed, and v2 events
    already carry no pay (ADR-019 D3).

11. **MINOR: quick add from pickers (QA-1, Jabran 2026-11-08) is not checked.** The rule is in building blocks
    (`UX-1 bb:256-280`; setup data is link-only, :274). **Fix:** add one non-critical item saying which HR and Payroll
    pickers (department, position, reports-to, pay group, element) offer "Add “x”" and which are setup data.

12. **MINOR: decision 2's reasoning (:155-157) needs tightening.**
    - Keeping v1 running would need the old tables kept (D9), not a backfill.
    - Hiding the v1 menu entries is an App change to modules that "stay untouched" (`PROJECT-STATE.md:25`;
      `ADR-026:171`).

    **Fix:** tie decision 2 to D9, and name the menu change as the one touch for Jabran to confirm. Also cite Jabran's
    2026-11-15 rule "We're in dev: target design first" (`docs/backlog.md:367-368`) as support for decisions 1–3, since
    ADR-026 is not yet accepted.

13. **MINOR: X.1 (:42) has the wrong migration range.** It says "Applied migrations V1–V5 of the old services", but
    hr-service has V1–V9 (`V9__employee_optional_login.sql`) and payroll-service V1–V5. V9 also means people-access's
    "`user_id NOT NULL` today" is already out of date for v1 (PA.1). **Fix:** correct the wording.

14. **MINOR: the D-10 status is out of date (:34, :49, :144-145).** On master, Jabran confirmed D-10 as a trial on
    2026-11-21 (a6bc823; `lead-decisions.md` D-10 status). The branch base is 5 commits behind, and a two-dot diff
    against origin/master shows reverts of PROJECT-STATE, lead-decisions and design-brief-common. **Fix:** rebase on
    origin/master before lane-ready, then update the D-10 wording.

15. **MINOR: H1.7 and H4.4 settle the same kind of contradiction in opposite directions.**
    - H1.7 (:67) follows §5 and the O1 table row (wizard replaces quick add) over the 2026-10-09 lead decision "O1:
      keep H1's quick add" (`hr-h4.md:496`).
    - H4.4 (:93) follows the lead decision over the table for O5.
    - hr-h1, approved at G-1, still has the quick-add panel, so H1.7 chooses between two specs Jabran approved.

    **Fix:** say why each source wins (for O1: §5 :88, §19 :533 and G-4). Pass H1.7 to Jabran as approved scope, not
    to Fable.

16. **MINOR: PY.6 (:106) presents a pending recommendation as settled.** "A5, with the AC-IP core" is the Accounts
    roadmap's decision 6, which is still waiting for Jabran (`docs/drafts/accounts-roadmap.md:253-254`). **Fix:** say
    it is pending. Also a citation nit: X.13 should cite `accounts-roadmap.md:14`, not :13.

## Checked correct

- **Spot-checked items.** All 18 critical items plus X.5, X.6, X.8, X.10, X.12, X.13, H23.7, H23.8, H4.2, H4.4, ES.2
  and PA.2, 30 items in all. Every cited line exists and says what the draft says, apart from the points above. This
  covers:
  - ADR-026 :4, :27, :76, :87-104, :113-121, :130, :144, :161, :166, :171, :174.
  - The hr-h1 H0/H1 inventory rows; hr-h2-h3 :16-17, :377, :417-419, :886, :926, :1511, :1559.
  - hr-h4 :8-10, :88, :95, :119, :385, :468, :496-513, :849.
  - payroll-p :149-357 and PC/P1/P3/P4 rows, :1290.
  - Payroll scope :3, :11, :16-18, :29-30, :43-47, :66-79, :95-99.
  - Launch order (BackEnd `accounts-roadmap.md:92`; workspace `accounts-roadmap.md:18`, :116, :150, :158, :241,
    :248-254, :275-279).
  - ADR-020 :5, :55, :169-177; ADR-021 :5; ADR-022 :5; ADR-024 :47-48, :59-61; ADR-025 :42, :49, :54, :83, :94, :97.
  - Go-live P-9, P-17, ACC-R15; P0 :4, :465; P2 :78, :417; A5 :3, :87, :93, :152.
  - hrms-v2-h1 :4 (CA-6, Q17), :78-80, :680-682; `ApprovalTypes.kt:17-29`; approval-limits spec :41-55, :296, :300,
    :313.
  - Gap check :12, :41, :51-58; lessons L03, L11-L16, L19, L24, L25, L29; WORKFLOW :114-116, :142-145, :250-256, :314,
    :323-328.
  - UX-1 ux :8, :71, :267-288 (§25); bb :70, :127, :358-382, :394-403, :434-445; ss :186, :250; D-1…D-10 line ranges.
  - Component contracts: time-field :101, stepper :71, approval-card :91-95, phone sheet :72, :84, :88-89.
- **Completeness.** Covered: ADR-020, 021, 022, 024, 025 and 026 (R4, D9, Q1); building blocks; the one-format rule
  (L03, L24); UX-1 §25; HRP-2; the payroll scope. Missing items are findings 1, 4, 5 and 7-11.
- **Decisions 1, 3, 7, 9, 10, 11 and 12** follow from their sources. Decision 3 is correctly flagged as amending the
  signed-off scope, and correctly conditional on ADR-026 D1 and D9.
- **H0 stores deciders by IAM user id** (`hrms-v2-h0.md:61`), which already matches AL-D14 (one id everywhere).
- **Style.** One H1. Every change table has the same seven columns (the brief's six plus Class). No raw HTML (the
  `<file>` placeholder is inside code). Plain English, if dense. Counts match the rows: 57 items, 18 critical.
