# NeoERP QA guide

Standing rules for every QA round, retest and test batch, in every module. Written 2026-11-21 from QA round 1, its
retest and the simulator checks of FIX-APP-A. Each round's brief adds only what is special to that round (scripts,
devices, known findings) and points here for the rest.

Where a rule already lives elsewhere, this guide links to it and does not repeat it. The sources stay the owners:

| Topic | Owner |
|---|---|
| Fix rule, tester chunks, guardrails, lessons register | [WORKFLOW.md](../../WORKFLOW.md) "QA rounds and limits" |
| Which tests run when, merge-batch run, push | [WORKFLOW.md](../../WORKFLOW.md) "Checkpoints", "Test scope"; BackEnd [verify.md](../../NeoERP-BackEnd/docs/operations/verify.md); App [verify.md](../../NeoERP-App/docs/operations/verify.md) |
| Layout, resizing, controls, rig sizes | App [screen-standard.md](../../NeoERP-App/docs/design/screen-standard.md) §2–§9 |
| Short heights, Larger Text, touch entry | App [ux-principles.md](../../NeoERP-App/docs/design/ux-principles.md) §25 |
| Numbers, percentages, dates per country | App [building-blocks.md](../../NeoERP-App/docs/design/specs/building-blocks.md) "Numbers and money" |
| Roles and separation of duties | BackEnd [standard-roles.md](../../NeoERP-BackEnd/docs/security/standard-roles.md) §1 rule 7 and §2–§3 |
| Domain rules (entitlement chain, books per company) | [RULES.md](../domain/RULES.md) §3, §7 |
| Countries and packs | [target-countries.md](../handover/target-countries.md) |

## 1. Roles

| Who | Model | Does | Never |
|---|---|---|---|
| **QA tester** (sub-agent) | Sonnet | Runs the scripted steps on the devices it is given, checks the data read-only, writes one report file per test and appends to `summary.md`. Writes a SCRIPT line when a step is wrong. | Changes code, scripts or seeds; commits; pushes; fixes; signs in or out. |
| **QA main** (integrator) | Opus | Writes the round's brief and the scripts (or updates them), plans chunks and device sets, desk-checks the steps against the build, groups the findings, writes the fix list, `summary.md` with Lessons, and the script-fix list. | Fixes code; starts a fix lane. |
| **Lead** | — | Boots simulators, installs the app, refreshes sessions, grants simulator access (lessons L08), resets or seeds the stack when the brief plans it, approves the brief, sends the fix list to Jabran, starts the fix lanes, runs `scripts/verify.sh`, commits the round's files, gives the verdict. | Lets a tester touch the stack or the sessions. |
| **Fix-lane builders** | per [WORKFLOW.md](../../WORKFLOW.md) "Working mode" (Opus default; Sonnet only for fully decided fixes; money and security by Opus) | Fix the findings in their lane, each with a regression test (§6) and a "where else?" list (WORKFLOW "UI quality gates" 7). | Fix outside the lane's write scope. |
| **Reviewers** | per WORKFLOW "Working mode", "Review" | One fresh Opus review per lane; on money and security lanes the re-runs and a second, different reviewer. | Review their own work. |
| **Retester** | Sonnet | Re-runs only the screens and steps a fix lane touched (lessons L01). Records fixed / still broken / partly / changed. | Re-walks whole scripts unless a group needs the setup. |
| **Desktop tester** | Codex on macOS, run by Jabran | The desktop-only pass ([brief](../agents/qa-desktop/brief-codex.md)). | Money actions. |
| **Jabran** | — | Product decisions, approves the fix list, clicks through user-visible fixes, approves merges. | — |

**Who closes a finding.** The lead's verdict, after the retest says "fixed". A money or security finding closes only
with an automated test (WORKFLOW guardrail 1). A user-visible checkpoint closes after Jabran's click-through. What is
left goes to [backlog.md](../backlog.md) or a numbered fix-lane row, never silently dropped. While the new Mac's lead is
on probation, its lanes close through `lane-ready` and the old Mac's `lane-verdict` (WORKFLOW "Two Macs, two leads").

## 2. Limits

Exact commands and wording are in the round 1 brief, "Limits (hard)" and "Devices"
([qa-round1/brief.md](../agents/qa-round1/brief.md)). In short:

- **Local stack and seeded demo people only.** Never a hosted stack or a real account. Full flows (Post, Approve, Pay,
  Refund) are allowed there ([tester-agent-full-flows.md](../lead-memory/tester-agent-full-flows.md)).
- **Sign-in only through dev session files.** The lead makes them with `NEOERP_DEV_SESSION=1 scripts/make-demo-tokens.sh <users>`
  (BackEnd) and copies them with `tools/dev-session-to-simulator.sh <user>` (App)
  ([lead-runs-demo-tokens.md](../lead-memory/lead-runs-demo-tokens.md)). Testers never run either script.
- **Never see or print secrets.** Never open, print or copy `.local-secrets/`, `*.jwt`, `*.session.json` or
  `neoerp-demo-tokens.env`, and never type a password. A device on the sign-in screen: stop and report "needs a new
  session file for" and the user name. Sessions end after 30 minutes idle: touch every device still needed every 20 minutes.
- **SQL is read-only:** `SET default_transaction_read_only = on`, `SELECT` only, never columns that hold secrets
  (tokens, bank numbers in clear text). `scripts/money-invariants.sh` is read-only and may be run by testers.
- **One person per simulator.** A test that needs another person uses the device that person is on. Never sign out,
  reinstall the app or reset a simulator. Shut down simulators not in use.
- **No backend starts, stops or restarts, no data resets** by testers. Delete only what a step says to delete.
- **No App edits while Jabran is testing** in his checkout; collect, then fix
  ([collect-then-fix-per-test.md](../lead-memory/collect-then-fix-per-test.md)).
- **Money or security findings on a shared or hosted stack** stop the round for that area (lessons L23). On the local
  stack they are collected like the rest, as Blocker or High.

## 3. What to check

Each script names its flows. For every flow, run the checklists below. Write each expected → actual line in the report.

### Flows end to end

- Every flow from start to the end state, including **Post, Approve, Pay, Refund**, Reverse, Import and Cancel.
- After each step that changes data:
  - **Screen:** status, totals, open amount, history or audit entry with the right person and time.
  - **Ledger:** the journal balances, uses the right accounts, period, branch and dimensions; the source link goes
    back to the document.
  - **Reports:** trial balance, ageing and the related report move by exactly the amount; drill-down lands on the entry.
  - **Database (read-only):** the rows match the screen.
- **One wrong path per flow**, short: the wrong role, a closed or locked period, a double tap on Post, the same person
  submitting and approving, an amount above the open amount, Back mid-flow, the module or feature off, a stale page
  after someone else acted, a retry after an error. A wrong path that **succeeds** is a money or security finding.

### Page states

Every main screen, each state that can happen there
([building-blocks.md](../../NeoERP-App/docs/design/specs/building-blocks.md) "Page states: spot illustration vs
notice"; [ux-principles.md](../../NeoERP-App/docs/design/ux-principles.md) §22 page errors, §23 empty states):

- Empty: nothing exists yet, with the create action for people who may create.
- Loading: skeleton, no jump when content arrives.
- Error by cause: load failed, not found, no access and conflict each say what happened; never server text.
- No access: the page or action says so; nothing leaks.
- Module or feature off: the off page, menus updated ([RULES.md](../domain/RULES.md) §3).
- Read-only: the same controls, read-only, at full contrast.
- Offline: the offline strip over shown content; nothing claims to be saved.
- No matches: "Try a different search or clear filters", distinct from empty.

### Permissions

Per role, from [standard-roles.md](../../NeoERP-BackEnd/docs/security/standard-roles.md) §2–§3:

- What each role sees **hidden**, sees **read-only**, and may **act on**. Try each forbidden action once: the server
  must refuse it, not only the screen hide it.
- **Separation of duties** (standard-roles §1 rule 7): nobody approves or posts what they submitted or contributed to.
  The Owner exception applies only to the standard Company Owner role, and is written to the audit log.
- **Bank details** (BackEnd [accounts-c.md](../../NeoERP-BackEnd/docs/api/accounts-c.md) C-3, and the refund rule
  C-39 in `accounts-b.md`): a change needs a second person's approval; whoever changed them in the last 30 days cannot
  approve a payment to that party; they show in full only to `PAYMENT.CREATE` / `PAYMENT.APPROVE` holders, otherwise
  masked to the last 4; a payment shows the snapshot, not the current details.
- Approval limits, where built: each step's approver is a different person; a payee change between steps cancels the
  approval (BackEnd `docs/api/accounts-approval-limits.md` SR-H4).

### Country

The company's Org country decides the format ([building-blocks.md](../../NeoERP-App/docs/design/specs/building-blocks.md)
"Numbers and money"). Check per company country **NO, SE, DK, FI, IS, PK**:

- Numbers shown (`1 250 000,00` Nordic, `1,250,000.00` PK) and typed (both separators; ambiguous input refused).
- Percentages (`12,5 %` Nordic, `12.5%` PK).
- Typed dates in the company format (NO/DK/FI/IS `09.10.2026`, SE `2026-10-09`, PK `09/10/2026`); shown dates in the
  one style `9 Oct 2026`.
- "Coming" where no pack exists ([target-countries.md](../handover/target-countries.md) tiers 2 and 3: country chart
  coming, Payroll coming, no statutory exports).
- Demo companies exist for NO (Kystgruppe Nordic), SE (Stockholm Handel) and PK (Sialkot Mills, Lahore Textiles). DK,
  FI and IS have none: those countries are covered by the automated per-country tests (§5) and reported as "not run
  on device: no demo company" until one is seeded.

### Two-company isolation

- The other company never sees the record: lists, search, pickers, reports, counts, notifications.
- A deep link or id from company A opened in company B is refused or "not found", never shown.
- After switching company (Omar has two), nothing of the first company stays on screen.
- Rule: [RULES.md](../domain/RULES.md) §7; tests: §5 below.

### Money invariants

Run `scripts/money-invariants.sh` (BackEnd, read-only; [verify.md](../../NeoERP-BackEnd/docs/operations/verify.md)
"Money invariants") after each chunk that posted, and write its result line in `summary.md`. It checks:

- debits = credits per journal;
- ledger = sum of postings;
- subledgers = control accounts;
- no double post or double pay on retry (also try a double tap and a retry on screen);
- rounding per currency.

A break is a Blocker and stops the push (WORKFLOW guardrail 2).

### Layout and buttons

Per [screen-standard.md](../../NeoERP-App/docs/design/screen-standard.md) and
[ux-principles.md](../../NeoERP-App/docs/design/ux-principles.md) §25, at the sizes in §4:

- §2: rotating or resizing never loses typed values or an open wizard; no layout flips back and forth.
- §3: each size looks made for its size (header actions, stats, toolbar, tables to tight grid to cards).
- §4: nothing clipped, overlapping or scrolling sideways (matrix grids scroll inside their card); button labels whole.
- §6: controls in a row share a height.
- §7: lists have both empty states.
- §8: fields, errors, disabled primary with its "still needed" line, sticky page bar, sticky footer (one home per
  action), focused field never under the footer or the page bar.
- ux §25 short heights (375 and 402 pt tall): only the top bar and a one-row footer stay pinned; with the keyboard up
  the footer gives way.
- ux §25 Larger Text: what may end in "…" and what never may (amounts, dates, numbers, codes, status words, buttons,
  toasts, column headings, account names); dialog actions stack; split buttons keep ▾.
- Touch targets at least **44 pt**.
- Touch number entry: number keyboard with Done, no letters, both separators, Done formats the value.

### Typing on iOS

Type on the **on-screen keys**, one tap per key, for every check that involves typing, keyboards, autocorrect or lost
text. The simulator's text input arrives as hardware-keyboard keystrokes and skips autocorrect and the soft
keyboard's word commit, so it hides real bugs and shows false ones (lesson of 2026-11-21,
[simulator-checks-2026-11-21.md](../agents/qa-round1-retest/simulator-checks-2026-11-21.md)). The text input may fill
setup values only where typing is not under test; the report says so. The iPad hardware keyboard (Tab, Return) is a
separate check.

## 4. Sizes

One list for rig review, simulator QA and the desktop pass. It is UX-1's settled list (App
[screen-standard.md](../../NeoERP-App/docs/design/screen-standard.md) §9, merged 2026-11-21). It replaces the round 1
brief's ladder (480/720/1024/1280/1440 with 402, 1210 and Split View), the old rig list (1440 · 1280 · 1024 · 768 ·
390) and the "6 positions" line in WORKFLOW. The App keeps the same table in screen-standard §9 for builders, who see
only the App repo; the two must match.

### Size positions

| # | Size (pt) | Device and orientation | Window band | Why this size |
|---|---|---|---|---|
| 1 | 375×667 | iPhone SE, portrait | below 600 | Narrowest real phone; footer and keyboard room |
| 2 | 667×375 | iPhone SE, landscape | 600–720 | Short height (ux §25) |
| 3 | 874×402 | iPhone Pro, landscape | 720–1024 | Short height at a tablet width |
| 4 | 744 | iPad mini, portrait | 720–1024 | Cards and the drawer menu |
| 5 | 1032 | iPad Pro 13, portrait | 1024–1280, just above 1024 | Tight tables, narrow tablet |
| 6 | 1376 | iPad Pro 13, landscape | 1280 and up | Full sidebar on touch |
| 7 | 1440 | Desktop window on the Mac | 1280 and up | Design width, mouse and keyboard |

- **The breakpoints 600, 720, 1024 and 1280 are code thresholds, not test sizes.** The sizes sit between them, so each
  band is seen once. The automated sweep lands on the thresholds (§5).
- **Duplicates, not extra positions:** iPhone Pro portrait (402) is the band of position 1; iPad Pro 11 landscape
  (1210) is the band of position 5 and may stand in for it when the iPad Pro 13 is busy with another person's flow;
  iPad Pro 11 portrait (834) and iPad Air are the band of position 4; iPad Split View half (about 680) is the band of
  position 2 and is used only to check that resizing keeps state (screen-standard §2).
- **Flow tests** run on whatever device the person is on. The **layout pass** covers each test's main screens at
  positions 1–6 on the simulators, portrait and landscape as listed.
- **Larger Text:** each simulator position once per round with iOS Larger Text on (Accessibility Medium and the largest
  size), dialogs and pickers included.
- **Desktop (position 7):** the Codex pass on macOS at 1440×900, plus the short window 1024×700 (the desktop short
  height, where the footer once covered the lines). 320 wide, 1280×800, 1920×1080 and full screen are left to the
  automated size tests.

### Automated sizes

- Screenshot tests: fixed frames 1440 and 390, plus the 320–1440 sweep in 20 dp steps (screen-standard §9).
- Size tests over the device matrix in `ScreenSizes.kt` (WORKFLOW "UI quality gates" 8): today 320×568, 360×640,
  390×844, 430×932, 744×1133, 820×1180, 1180×820, 1024×700, 1280×800, 1440×900, 1920×1080, variants en, nb and 130 %
  text (200 % per screen where asked).
- **Gap:** the matrix does not yet hold positions 1, 2, 3, 5 and 6 (375×667, 667×375, 874×402, 1032×1376, 1376×1032).
  Adding them is code (lessons L06); until then those positions are simulator-only.

## 5. Automated tests

What each level must have. The rules that decide *which* tests run are in WORKFLOW "Test scope"; this is the list of
kinds.

| Level | What | Where the rule lives |
|---|---|---|
| Unit | Domain and application logic, view models, formatters | BackEnd [AGENTS.md](../../NeoERP-BackEnd/AGENTS.md) §9 |
| Integration | Persistence-sensitive behaviour (Testcontainers); an unexpected skip fails the run | BackEnd AGENTS §9; verify.md "Skip allowlist rule"; lessons L18 |
| Contract mapping | Any API or DTO change: the producer's and every consumer's tests, backend and App; readers ignore unknown fields | WORKFLOW "Test scope" and "Every builder brief"; [module-lead-playbook.md](../handover/module-lead-playbook.md) "Readers tolerate new fields" |
| Tenant and two-company | Company scope on every repository (`TenantRepositoryArchitectureTest`, all services); a cross-company test per gateway route; row-level security per ADR-026 | WORKFLOW guardrail 5; lessons L17 |
| State transitions | Per document type: every transition × role, owner, entitlement, period lock, two-person rule | lessons L19 |
| Money | Invariants after every seed and full run (`MoneyInvariantsTest`, `money-invariants.sh`); golden figures for money, tax and payroll calculations and for report engines | WORKFLOW guardrail 2; [lead-agent-structure.md](../handover/lead-agent-structure.md) §3a "Critical-parts list" |
| Statutory output | Golden files per country, validated against the official schema (SIE, SAF-T, VAT, A-melding, AGI, FBR) | lessons L29; lead-agent-structure §3a |
| App build rules | Money parsed and formatted only through `NeoFormat` / `NeoNumericInput`; per-country round trip; keyboard type per numeric field | App [verify.md](../../NeoERP-App/docs/operations/verify.md), gate "Build rules"; lessons L06, L24 |
| Screens | Screenshot tests (1440, 390, 320–1440 sweep) and size tests with automatic layout checks | screen-standard §9; WORKFLOW "UI quality gates" 3 and 8 |
| Per finding | Blocker, High and Medium fixes: a test that fails on the old code and passes on the fix | [regression-test-per-finding.md](../lead-memory/regression-test-per-finding.md); lessons L21 |

### When the full suite runs

The current rule (WORKFLOW "Test scope"; BackEnd and App verify.md). It supersedes the older "builder runs the full
suite before every push" text that was in lead-agent-structure §3a and main-agent-handover §2.

1. **Builders** run targeted tests per step: new and changed tests, the changed classes' tests and their dependants,
   through the Gradle lock (`lockf`, one Gradle run per machine). Wording lanes compile only. Docs only: no tests.
2. **Reviewers** re-run the builder's tests from clean only on money and security lanes.
3. **The lead** runs `scripts/verify.sh` once per merge batch (at most 3 related slices) in each repo the batch
   touches, before the push to `phase/<N>` or `main`: BackEnd runs every service, `shared/*`,
   `:architecture-tests` and the money invariants; App runs `:composeApp:jvmTest` and the iOS compile. A RISK range
   needs the two review files (`--reviews`).
4. **The pre-push hook** refuses a push to `phase/<N>` or `main` without the marker `build/verify/<sha>.ok` for that
   commit and range. Lane branches pass the hook. Never `--no-verify`.
5. Read `verify: OK, marker …` (and "0 failed") in a separate step before pushing
   ([check-test-result-before-push.md](../lead-memory/check-test-result-before-push.md)).

## 6. Report format

All files go in the round's folder, `docs/agents/<round>/`. No artifact or review page unless Jabran asks
([qa-report-no-artifact.md](../lead-memory/qa-report-no-artifact.md)).

### One file per test

Name: `T{nn}.md`, `A{nn}.md`, `G{nn}.md` (retest group) or `SIZES-<device>.md`. Write it as soon as the test is done.

```text
# T{nn}: {title}
Result: passed | passed with findings | failed | blocked | not run (why)
Devices: iPad Pro 13 portrait (Ola), iPhone 18 Pro portrait (Anna)
Build: App <branch> <sha>, BackEnd <branch> <sha>

## Steps
1. passed | finding | failed | blocked: what you saw, one line

## Data checks
- Expected → actual (screen | ledger | report | DB)

## Findings
1. Step n: what is wrong, the exact on-screen text in quotes, where, how to reproduce.
   Severity: Blocker | High | Medium | Low. Kind: money | security | data | flow | layout | wording | keyboard.
   Rule: the rule it breaks (for example ux §25, screen-standard §8, accounts-c C-3), if known.
   Device and orientation. Screenshot: T{nn}-step{n}-{device}.png. Time: HH:MM

## Script
- SCRIPT step n: what in the script is wrong (expected text, button name, setup)

## Data created
- documents, drafts, settings changed, and what was switched back
```

Quote screen text exactly. Never include a password, token or session content.

### Severity

| Severity | Meaning | Fixed |
|---|---|---|
| **Blocker** | The flow cannot be finished on that device and there is no workaround, or it blocks other tests; or a money or security break: a wrong path succeeds (self-approval, cross-company access, double post or pay), an invariant breaks, a secret shows | At once |
| **High** | Wrong data saved or shown (amount, account, branch, period, person), typed text lost, a money or security problem that does not stop testing, or a main action unreachable on one device class | In the round's fix batch, with a regression test |
| **Medium** | The flow works but is hard: the focused field hidden, extra taps, stale lists, content cut but reachable, a breach of screen-standard or ux §25 | In the fix batch, with a regression test |
| **Low** | Cosmetic, wording, alignment, or seen once and not reproduced (mark "unconfirmed") | Small ones in the batch; bigger ones to a fix-lane row or the backlog |

A money or security finding is never below High. The kind (money, security, data, flow, layout, wording, keyboard;
desktop also mouse and file) is written beside the severity, so the groups can be ranked.

### Screenshots

Saved next to the reports. Names: lower case device names (`iphonese`, `iphone`, `iphonemax`, `ipadmini`,
`ipadpro11`, `ipadpro13`, `ipadair`), orientation only when not portrait.

- Test steps: `T{nn}-step{n}-{device}[-landscape][-{short-note}].png`
- Size pass: `SIZE-{screen}-{device}[-landscape].png`
- Larger Text: `LT-{screen}-{device}[-{text-size}].png`
- Desktop pass: `{screen}-{W}x{H}.png`

### summary.md

- A table: one line per test or group, result, findings count, tester.
- Blockers, the top 5 findings, new findings per chunk.
- Data created, steps not reached, the state devices were left in.
- The money invariants result line.
- **Lessons** (3–5 lines): way of working changed, automated test added, spec changed (WORKFLOW "After each round").

The QA main adds `findings-grouped.md` (ranked money and security, data, blockers, flow, layout, wording), the fix list
for Jabran (`fix-list.md`) and `script-fixes.md`.

## 7. Round flow

1. **Brief.** The QA main writes it from the template below; the lead approves it.
2. **Scripts.** Test steps exist for each flow (§8), in the format of
   [test-steps-format.md](../lead-memory/test-steps-format.md). Expected results for money and permission steps come
   from RULES.md and the contract, with the rule id (lessons L26). The QA main desk-checks them against the build
   (WORKFLOW "UI quality gates" 5).
3. **Setup.** The lead boots the simulators, installs the app, copies the sessions, grants simulator access and seeds
   the stack if the brief says so.
4. **Run in chunks.** Sonnet testers, about 4 tests or 6 groups each, 10–20 minutes, one device set per chunk (WORKFLOW
   "Testers"; lessons L02). Money invariants after each chunk that posted.
5. **Group.** The QA main groups the findings and writes the fix list, asking "where else?" for each. Nothing is fixed
   until Jabran approves the list.
6. **Fix once at the end.** One fix batch per round; only blockers that stop other tests are fixed at once (WORKFLOW
   "Fix rule").
7. **Retest.** Only the changed screens and steps (lessons L01).
8. **Script fixes.** The SCRIPT lines go into `script-fixes.md` and are applied to the scripts (a Sonnet job).
9. **Lessons.** `summary.md` ends with Lessons; the lead adds them to [lessons.md](../lessons.md) as Proposed and
   updates the Trial evidence.
10. **Close.** The lead commits the round's files, gives the verdict and a short chat summary.

### Brief template

Every QA brief has these parts, and nothing that this guide already says:

1. **Read first:** [WORKFLOW.md](../../WORKFLOW.md) "QA rounds and limits", this guide, the previous round's
   `summary.md` and its known findings.
2. **Build and stack:** App and BackEnd branch and sha; whether the stack was reset and reseeded; seeded state that
   matters (locked months, org numbers).
3. **Devices:** simulator, udid, person, company; the size positions (§4) each device covers.
4. **Scripts:** files and order; what to retry first.
5. **Known and accepted:** findings not to report again, with links.
6. **Allowed actions:** full flows on the local stack, or "no money actions" (as the desktop pass).
7. **Report folder:** `docs/agents/<round>/`, format §6.

## 8. Test-step coverage

Test steps that exist today, and the ones still needed. Owner proposed: the QA main of the module's lead (Opus), who
writes the steps before the module's first QA round. New steps go in [docs/test-steps/](../test-steps/) as
`<module>-<area>.md`.

### Steps that exist

| Module and area | Steps |
|---|---|
| Accounts: invoices and credit notes | [accounts-M1-invoices.md](../test-steps/accounts-M1-invoices.md) |
| Accounts: receipts, allocation, ageing, statement | [accounts-M2-receipts.md](../test-steps/accounts-M2-receipts.md) |
| Accounts: suppliers, bills, debit notes, payments, bank-detail change | [accounts-M3-payables.md](../test-steps/accounts-M3-payables.md) |
| Accounts: opening-items import (M4) | BackEnd `docs/demo-files/opening-items/M4-test-steps.md` |
| Accounts: customer advances (M5) | BackEnd `docs/test-steps/M5-advances-test-steps.md` |
| Accounts: advances, refunds, write-offs, opening balances import, SIE import, dimensions, pickers, report filters, feature switches (T1–T24) | [phase3-test-steps.md](../agents/phase3-test-steps.md) |
| Accounts: accruals, recurring journals, journal import, automatic reversals (A1–A18) | [a4-test-steps.md](../agents/a4-test-steps.md) |
| Shared: quick add, lines as a table, branch on documents | [quick-add](../agents/quick-add/test-steps.md), [line-block](../agents/line-block/test-steps.md), [doc-branch](../agents/doc-branch/test-steps.md) |
| Shared: app languages | App `docs/agents/i18n/test-steps-*.md` |
| Desktop only (mouse, keyboard, files, sign-in) | [qa-desktop/brief-codex.md](../agents/qa-desktop/brief-codex.md) |

### Steps still needed

| Module and area | What the steps must cover | Proposed owner |
|---|---|---|
| Accounts: manual journals | Create, submit, post, reject, reverse; Accountant vs Finance Manager; control accounts | Accounts lead, QA main |
| Accounts: setup and go-live | Chart and Used for, tax codes, fiscal calendar, go-live at each demo company (T12 covers Lahore only) | Accounts lead, QA main |
| Accounts: period close and year-end | Close, reopen, lock; period 13; year-end wizard; who may | Accounts lead, QA main |
| Accounts: reports | Trial balance, general ledger, journal listing, P&L, balance sheet, cash flow, tax report: figures, filters, drill-down, export | Accounts lead, QA main |
| Accounts: approval limits | Steps per amount, holders, payee change cancels, Owner's own (S1–S4 and P1 built; S5 payments and refunds when built) | Accounts lead, QA main |
| Accounts: bank | Bank accounts, payment references, payment files and Mark as paid, bank-detail masking per role | Accounts lead, QA main |
| Accounts: statutory exports | SIE export, SAF-T and VAT files as built, checked against the golden files | Accounts lead, QA main |
| Accounts: budgets | When built (spec `accounts-budgets.md`) | Accounts lead, QA main |
| Org, people and roles | Companies, branches, locations; invitations; roles and overrides; "not above your own rights"; password reset by the company admin ([RULES.md](../domain/RULES.md) §12) | ERP lead, QA main |
| Platform admin | Agreements, modules and features (T8–T11 cover labels and one switch), impersonation ([RULES.md](../domain/RULES.md) §13), audit log | ERP lead, QA main |
| Sign-in and session | Sign-in, sign-out, expired session, company switch | ERP lead, QA main |
| HR v2 | Written with the build from the v2 specs (`hr-h1`, `hr-h2-h3`, `hr-h4`); old HR is out of QA | HR & Payroll lead, QA main |
| Payroll v2 | Written with the build from `payroll-p`; golden figures per country (PK, NO, SE) | HR & Payroll lead, QA main |
| ESS | Written with the build from `ess` | HR & Payroll lead, QA main |
| Countries DK, FI, IS | Formats and "coming" notices once a demo company exists | ERP lead, QA main |
