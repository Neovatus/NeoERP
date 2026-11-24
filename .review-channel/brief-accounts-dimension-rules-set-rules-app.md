# Brief: set-rules (flow 1 of 3) · branch `accounts/dimension-rules` · repo: App · review: Opus

Read first: `docs/PRINCIPLES.md`, the standards below, and this brief. **This brief is a frame, not a fence.**
The App builder starts after the BE builder's hand-back. The input is the BE contract table and its published examples (BackEnd `docs/agents/dimension-rules/` and the API doc it names).
Brief check: `.review-channel/brief-check-dimension-rules-set-rules.md` (applied; v2 of this brief).
**At the start, the lead copies into `docs/agents/dimension-rules/`:**
- this brief as `brief-set-rules-app.md`;
- `ref-principles.md`;
- `ref-rules-domain.md` (RULES §3, §7, §8);
- `ref-review-template.md`;
- `ref-adr-027.md` (flow endpoints and contract rules, accepted).

## Not a limit
Follow the project standards. Reuse what already exists: building block, pattern, mapper, fake, test harness. Don't duplicate it, and don't depart from the architecture.
Where this brief and a standard disagree, the standard wins; tell the lead.
Where the flow needs something this brief doesn't mention, do it within the standards and record it as a decision.
You own the whole flow, not only the items named here.

## Goal
A Finance Manager sets Required / Optional / Not used per account and per range of accounts on the Account rules page. Before saving, they see what the change will touch.
The account panel, Add account and the dimensions overview show the rules in words. Users with READ see everything and change nothing.
Line cells in the editors (flow 2) and the branch default (flow 3) come later on this branch.

## Rules for this feature (decided; don't reopen)
1. **Levels and precedence** (AC-DIM §4.6, §7; ADR-021 D6):
   - Three levels: account (mark A) → range (mark R) → chart (no mark).
   - A locked rule shows a lock and can't be loosened. A company may loosen any rule that isn't locked.
   - Rules apply to lines saved from now on; posted lines never change.
2. **Wording** (AC-DIM §8):
   - "Required · Optional · Not used";
   - "Range rule; from 6000–7999";
   - "Not tagged by {dimension}".
   - Refusal words follow §9: `RULE_RANGE_OVERLAP`, `RULE_LOCKED` (with the country), `REASON_REQUIRED`.
3. **Every change** asks for a reason (6–500 characters) and shows the "what follows" lines from the impact read (§4.6). Add account asks for no reason.
4. **Which dimensions are editable** (same as the BE brief, rule 9):
   - **Editable:** cost centre, project, free 1–4 (free slots only while free dimensions are on).
   - **Branch:** read-only, "Required (2 or more branches)".
   - **No Department column** (backlog:320).
   - **Stock location, item:** as the BE plan decides.
   - A deactivated dimension's rules show as not applying.
5. **Before go-live** every Dimensions screen is read-only, with the notice (spec).
6. **Permission:** `ACCOUNTS.DIMENSION_RULE.UPDATE` writes, `ACCOUNTS.DIMENSIONS.READ` reads. Add it to `DimensionCodes` in `features/accounts/presentation/DimensionsAccess.kt`. Add account's rule selects show only with `DIMENSION_RULE.UPDATE`.
7. **Languages:** en, nb, sv and da on every new string (Jabran 2026-11-10); no hard-coded text.
8. **ADR-027:**
   - The rules page opens with one flow read: `GET /api/accounts/app/dimensions/account-rules`.
   - The App shows the server's decisions (`actions.<x>.{allowed, blockedBy}`) and owns the words for each `blockedBy` code. It doesn't recompute rights or locks.
   - Flow DTOs use one tolerant `Json` (`ignoreUnknownKeys`, `coerceInputValues`, `explicitNulls = false`); enums are read as text, and an unknown value maps to `Unknown`.
   - Keep a copy of the BE fixtures under `composeApp/src/jvmTest/resources/fixtures/app/accounts/dimension-rules/set-rules/` (as `DocumentMathVectorsTest` does).
9. **Footer buttons** (Jabran 2026-11-24, industry standard): one end-aligned group, Cancel first, then the primary button; totals on the left (screen-standard §8 and the design-system contracts).
10. **No new window-width reads in feature code** (Fable design-system verdict): measure the space you're given (for example `BoxWithConstraints`), not the window.

## Standards that apply
- Domain: `ref-rules-domain.md`. ADR-021 in the BackEnd repo (read it there).
- Design: `docs/design/specs/accounts-dimensions.md` (AC-DIM) §2, §4.1, **§4.6**, §5, §6, **§7**, §8, **§9**, **§10**, §11 rig routes. Rig `docs/design/screen-rig/accounts-dims.jsx`. `screen-standard.md`, `ux-principles.md`, `specs/building-blocks.md`, `list-controls.md`, `tabs.md`, `bottom-tab-bar-and-phone-sheet.md`. Tokens `docs/design/design-system/neoerp-tokens.json` (authoritative).
- Code: `ARCHITECTURE.md`, `AGENTS.md`.
- Contract: the BE flow-1 contract and examples.

## Scope
- **Write:** this repo only.
  - `features/accounts/presentation/dimensions/*`, `presentation/DimensionsAccess.kt`, `data/remote/DimensionsApi.kt`, `dto/DimensionDtos.kt`, strings `strings_accounts_dimension.xml` ×4, the docs below.
  - **Naming:** `dimensions/DimensionRules.kt` already holds an `object DimensionRules` (value-form checks). Give the new type another name (e.g. `AccountRuleResolver`), or rename the old one and say why.
- **Readers of `allowedDimensions` that move to `dimensionRules` in this flow:**
  - `ChartTemplateDtos.kt`, `ChartTemplatesRepositoryImpl.kt`, `ChartTemplateTabs.kt`;
  - `AccountsChartTab.kt` (reader, and the Add account writer);
  - `AccountsSetupMapper.kt` (reader and writer), `AccountsA0Dtos`, `AccountsA1Dtos`;
  - the A0 account panel "Tags on lines" → "Dimensions on lines" (`accounts_home_label_tags_on_lines`);
  - the mocks `MockAccountsSetupRepository.kt`, `MockChartTemplatesService.kt`.
- **Readers that keep the derived `allowedDimensions` until flow 2** (don't change them now; list them in the plan):
  - `JournalsMapper`, `RecurringMapper`;
  - `PayablesSupport.kt`, `ReceivablesSupport.kt`, `DefaultLineAccount.kt`, `DimensionCatalog.kt`, `AccrualDialogState.kt`, `JournalEditorRules.kt`;
  - the Bill and Invoice editors.
- **Read:** both repos. Read the BE side of every endpoint you call: controller, DTO, refusal `details`.
- **Out of scope:** line cells in the editors (AP-4): flow 2. Manual line defaults and the branch default (AP-5, AP-6): flow 3. DIM-B L4 extras: backlog:321.

## Step 1: discovery and plan (before any code)
Write `docs/agents/dimension-rules/plan-set-rules-app.md` and stop for the lead's OK. It must cover:
- every screen that reads `allowedDimensions`: the lists above, checked and completed, with what each reads after this flow;
- the route and tab for Account rules (§11: `#accounts:kyst|dimensions|rules`) and the phone layout (one card per account) from shared blocks;
- "where else?": other matrix or "rule per row" screens to reuse (sticky first column, cell menu, multi-select bulk action), and an existing reason dialog with a preview;
- how the shared fake backend answers these endpoints (company scope, ids, required fields), so the UI tests catch wrong requests;
- your decisions and open questions.

## Feature checklist
- [ ] Release flag: the page follows the Accounts FINANCE switch; free slots follow free dimensions.
- [ ] Permissions and company scope: READ sees a read-only matrix with no write controls; UPDATE edits; another company's data never shows after a company switch.
- [ ] Demo data: the NO demo company shows the range rule, the overriding account rule and an account added after the range; the PK company shows no rules (all chart).
- [ ] Four languages (en, nb, sv, da) on every new string.
- [ ] User-guide page "Account rules" (en; nb/sv/da through the I18N files) and a developer note for the rules read. Or write "none: reason".
- [ ] Every endpoint used, with the BE side read.

## Definition of Done
WORKFLOW v2 §5 (end to end on every path discovery found; tests for all cases from a test table written first; a test per fix that fails on the old code; standards kept; checklist done; hand-back complete) plus:
- **Compose UI test of the main flow** (D-69): add a range rule with the impact preview and a reason, and see it in the matrix. It runs on a fake server with the real route, and fails on the base.
- **Contract test:** the App's requests equal the BE's published examples. The App reads responses with `dimensionRules: []`, with a field set to an explicit `null`, with a field missing, and with an unknown `rule` or `source` value, without breaking.
- **Size tests:** en, nb, sv and da for the rules page, the matrix (phone cards), the range dialog with the keyboard up, the account panel and Add account, at the six QA sizes (`ScreenSizes.QaSize`).
- State tests: loading, empty, error, loaded, read-only, and the read-only notice before go-live.
- NO and PK number and date formats (`#accounts:kyst`, `#accounts:lahore`).

## Test table (fill before coding; the reviewer checks it)
| Case | Kind | Expected | Test name |
|---|---|---|---|
| add a range rule with the impact preview and a reason | success | saved; the matrix shows R marks | |
| edit and remove a range rule through the reason gate | success | saved; the matrix updates | |
| "Use the range rule" on an account | success | the A mark goes, R shows | |
| impact lines show the counts and the own-rule list from the read | success | the §4.6 words | |
| overlapping range | refusal | the §9 words inside the dialog; nothing saved | |
| loosening a locked rule | refusal | the lock shows; refused in words, with the country | |
| reason 5 characters, empty, 501 characters | refusal / edge | Save disabled or the §9 words | |
| account rule wins over range in the matrix and the account panel | success | A mark, words | |
| account panel "Dimensions on lines" shows the rules in words, with a link to Account rules | success | words, link | |
| Add account: rule selects with UPDATE; none without it | success / rights | as rule 6 | |
| bulk "Set rule for {n} accounts…" | success | n rows changed | |
| bulk with one locked account | refusal | nothing saved; the account named | |
| overview counts "Required on {n} · optional on {m}" and the rules summary | success | §4.1 words | |
| READ-only user | rights | no write controls | |
| Accounts off; free dimensions off | rights | page hidden / free columns hidden | |
| before go-live | rights | read-only with the notice | |
| company switch while the page is open | rights | the old company's rules never show | |
| double tap Save | repeat | one request | |
| `dimensionRules` empty, explicit `null`, missing; unknown `rule` / `source` | contract | screen stays usable; unknown shown neutral | |
| requests equal the BE examples | contract | pass | |
| phone card layout, long names in nb/sv/da | screen | no cut text at the six sizes | |
| loading / empty / error / read-only | screen | the §5 states | |

## Hand-back (≤ 15 lines + files)
- Commits and range.
- What ran: command, sha, and the counts from that run.
- **Decisions I took.**
- **Found outside the brief** (fixed / reported).
- Reused vs new, with the reason.
- The filled review checklist (`ref-review-template.md` §Checklist).
- `Brief: unclear or missing — …` (or none).
- Jabran's click-through steps: sign-in, numbered clicks, Expected per step.

## Never
- `--no-verify`, force push, AI attribution (no Co-Authored-By), GitHub workflows, writes in the other repo.
- No push, merge or rebase: builders commit, the lead pushes.
- Gradle only as the lead says (one job on this Mac at a time). Never `gradlew --stop`. Don't run the app against a stack while Jabran tests.
- Never open, print, grep the content of or copy `.env` files (incl. tracked `infra/.env`), `.local-secrets/**`, token/session files, `~/.gradle/gradle.properties` and other user-level `gradle.properties`, `~/.netrc`, `~/.npmrc`, `~/.aws/**`, or keys. Read one key only when needed (`grep -c '^key=' file`).
