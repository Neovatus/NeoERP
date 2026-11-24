# Brief: set-rules (flow 1 of 3) · branch `accounts/dimension-rules` · repo: BackEnd · review: Opus

Read first: `docs/PRINCIPLES.md`, the standards below, and this brief. **This brief is a frame, not a fence.**
Feature plan: workspace `.review-channel/accounts-plan.md`, feature 1. Flow 2 `post-with-rules` and flow 3 `branch-default` follow on the same branch.
Brief check: `.review-channel/brief-check-dimension-rules-set-rules.md` (18 gaps, all applied below; v2 of this brief).
**At the start, the lead copies into `docs/agents/dimension-rules/`** (builders see one repo for writing):
- this brief as `brief-set-rules-be.md`;
- `ref-principles.md` (workspace `docs/PRINCIPLES.md`);
- `ref-rules-domain.md` (RULES.md §3, §7, §8);
- `ref-review-template.md` (workspace `docs/templates/review.md`);
- `ref-ac-dim.md` (the App spec `docs/design/specs/accounts-dimensions.md`);
- `ref-adr-027.md` (workspace `docs/drafts/ADR-027-flow-endpoints-and-orchestration.md`, accepted).

You may read the App repo directly.

## Not a limit
Follow the project standards. Reuse what already exists: pattern, service, endpoint, helper, test harness. Don't duplicate it, and don't depart from the architecture.
Where this brief and a standard disagree, the standard wins; tell the lead.
Where the flow needs something this brief doesn't mention, do it within the standards and record it as a decision.
You own the whole flow, not only the items named here.

## Goal
A company can say, per account or for a range of account numbers, whether each dimension is Required, Optional or Not used. It sees what a change will touch before saving it. Packs set the starting rules, and nothing already posted changes meaning.
This flow stores, serves and audits the rules, and keeps the existing `allowed_dimensions` column in step with them.
Flow 2 enforces REQUIRED on every posting path and adds the role-accounts read. Flow 3 adds the branch default cost centre.

## Rules for this feature (decided; don't reopen)
1. **ADR-021 D6** (`docs/adr/ADR-021-shared-dimensions.md` §D6):
   - The rule per dimension is `REQUIRED | OPTIONAL | NOT_ALLOWED`. The order used for "tighten" and "loosen" is NOT_ALLOWED < OPTIONAL < REQUIRED.
   - A dimension listed in `allowed_dimensions` today reads OPTIONAL; one not listed reads NOT_ALLOWED.
   - Rule changes apply forward only; posted lines are never re-validated.
2. **Three levels, highest first** (spec §4.6: A = set on this account, R = range, none = chart):
   1. **ACCOUNT:** a rule the company set on this one account (`source COMPANY`).
   2. **RANGE:** a company range rule.
   3. **CHART:** what the pack (or, for a user-created account, the account it was created from) gives (`source PACK`).

   Pack rows and the defaults of a newly added account are CHART level, below ranges. So a new account at 6750 takes the 6000–6999 range rule.
   The read's `source`: COMPANY → `ACCOUNT`, range → `RANGE`, PACK → `CHART`.
   Exception: a **locked** CHART rule beats a range that would loosen it.
3. **Storage (OD-1, Jabran 2026-11-22):**
   - Company tables:
     - `account_dimension_rules (company_id, account_id, dimension, rule, source PACK|COMPANY, locked, version, created_by/at, updated_by/at)`;
     - `dimension_range_rules (company_id, id, dimension, from_number, to_number, rule, reason, version, created_by/at, updated_by/at)`.
   - Both are scoped and REVOKE'd like every other Accounts table.
   - A range is compared on the account number as a number; overlapping ranges for one dimension → `RULE_RANGE_OVERLAP`. Ranges that only touch (6000–6999 and 7000–7999) are allowed.
   - **Template side:** packs need a rule and `locked` per template account. `coa_template_accounts.allowed_dimensions TEXT[]` (V6__a0_baseline.sql) holds names only.
     - Name the storage in your plan: a template rules table, or a parsed form.
     - Name the CSV grammar: `branch|cost_centre:required`; a bare name means OPTIONAL; `:locked` is reserved and unused (rule 6).
     - Name the `PackRules.kt:75` change (it rejects `cost_centre:required` today) and the `PlatformChartTemplatesController.kt` read.
4. **`allowed_dimensions` stays and is written through.** Every rule write updates the column in the same transaction, so every SQL reader stays right: `JournalJdbcAdapter`, `ReferenceJdbcAdapters`, `YearEndJdbcAdapter`, `ChartJdbcAdapters`, SIE preview.
   - Column = every dimension whose resolved rule is REQUIRED or OPTIONAL.
   - **Effect on posting in this flow:** setting NOT_ALLOWED removes the dimension from the column, so the existing step 6 refuses it (`DIMENSION_NOT_ALLOWED`), and defaulting no longer applies to that dimension. REQUIRED is not enforced until flow 2.
   - Test this (table below). Flow 2's brief names these effects for its Fable review.
5. **Impact read (OD-2):** the counts the App shows before saving. The JSON is under Contract below. Drafts are never re-saved; the Submit and Post check is flow 2.
6. **Locked rules (OD-4, ADR-021 Q7):**
   - Ship the `locked` column and the mechanism.
   - **A company may loosen any rule that isn't locked**, and may tighten any rule.
   - Loosening a locked rule → `RULE_LOCKED`.
   - **No pack rule is marked locked yet**; that waits for the per-country double review. Tests set `locked` directly.
7. **Permission (OD-3):**
   - New code `ACCOUNTS.DIMENSION_RULE.UPDATE` for Owner and Finance Manager, `entitlement_module 'FINANCE'`.
   - The user-service migration takes the V44 pattern (`V44__accounts_dimensions_codes.sql`) and carries the new code from `ACCOUNTS.DIMENSIONS.MANAGE`.
   - Add the constant to `AccountsPermissions.kt`.
   - The rule pages' reads are under `ACCOUNTS.DIMENSIONS.READ`. `dimensionRules` on the account list and chart reads stays under their existing code (`COA_READ`), as `allowedDimensions` is today.
8. **Add account** (`POST /accounts`, `COA_CREATE`; lead's recommendation, Jabran may change it in the plan review):
   - Without explicit rules, a new account takes CHART level from the template, or from the account it was created like.
   - Explicit rule picks on Add account need `DIMENSION_RULE.UPDATE` as well; without it they are refused (403). No reason is asked on create.
9. **Which dimensions take rules in this flow:**
   - **Editable:** `cost_centre`, `project`, and `free1`–`free4` (free slots only while `FINANCE.FREE_DIMENSIONS` is on; otherwise read-only and ignored).
   - **`branch`:** keeps C-13 (required on tagged accounts when the company has 2 or more active branches). Read-only here, shown as its own rule.
   - **`department`:** no rules until the HR read exists (backlog:320).
   - **`stock_location`, `item`:** read-only unless spec §4.6 lists them as editable. Say which in the plan.
   - A deactivated company dimension keeps its stored rules, and they stop applying (rig `accounts-dims.jsx`: "rules stop applying").
10. **Before go-live:** reads work from books CREATED; writes need books LIVE (spec: every Dimensions screen is read-only before go-live). Use the existing `BooksRequirement` pattern.
11. **Platform actor** (Enter company): writes 403, reads as today.
12. **Two companies:** a rule, range, count or id of another company never applies or shows; its id → 404 (RULES §7, §8: a franchise is its own company).
13. **Reason:** 6–500 characters on every change and removal (not on create of the account). Kept in the audit entry with before and after.

## Standards that apply
- Domain: `ref-rules-domain.md` (RULES §3, §7, §8). ADR-021 D4, D5, **D6**, Q5–Q7, and its tests in "Rules".
- Spec (ref copy): AC-DIM §4.1 overview counts, **§4.6** account rules, §7 rules, §9 refusal codes, §12 DM-6/7/8.
- Code: `ARCHITECTURE.md`, `AGENTS.md`, `docs/modules/accounts/*`, `docs/database/db-design.md`, `docs/operations/verify.md`.

## ADR-027 (accepted 2026-11-24; ref copy `ref-adr-027.md`): how the contract is shaped
- **Flow endpoint for the Account rules page** (the screen needs several reads): `GET /api/accounts/app/dimensions/account-rules?companyId=`.
  - It returns the matrix (posting accounts with their resolved `dimensionRules`), the range rules, the overview summary, and the decisions `actions.<x>.{allowed, blockedBy}` for `editRule`, `addRange`, `bulkSet`, with `blockedBy` codes such as `NO_RIGHT`, `BOOKS_NOT_LIVE`, `RULE_LOCKED`.
  - Folders as ADR-027 Design 1: `delivery/http/app/dimensions/accountrules/`, `application/appflow/dimensions/accountrules/`.
  - No rules in the flow class: it calls the same application services as the resource endpoints. No `@Transactional`; aim for ≤ 150 lines per class.
  - `shared/app-flow` (F0) doesn't exist yet. Don't build it here; keep the flow local and record that as a decision.
- Writes stay commands on the application service, one transaction each. Resource endpoints (below) serve them; an action flow may wrap them if you prefer. Say which in the plan.
- **Contract rules (Design 5):**
  - Every nullable field is marked in `docs/api/app-flows/accounts-dimension-rules.md` and shown as `null` in at least one example.
  - Example files go in `docs/api/fixtures/app/accounts/dimension-rules/set-rules/`: `open.json`, `open-nulls.json`, `open-degraded.json` (if a part can be missing), and per write `<action>-request.json` and `<action>-refused.json`.
  - Enums may grow.
  - BE tests accept every request example and produce every response example (field names, nullability).

## Contract (publish it with an example request and response per endpoint; the resource endpoints go in `docs/api/accounts-a1.md` or a new `docs/api/accounts-dimension-rules.md`)
- `GET /api/accounts/accounts/{id}/dimension-rules` and `PUT` (body `{rules:[{dimension, rule}], reason, version}`).
- `GET`, `POST`, `PUT /api/accounts/dimension-range-rules[/{id}]`. Removal carries a reason: reuse the repo's existing pattern for a reasoned removal (say which in the plan).
- "Use the range rule" removes the account's own rule for that dimension, with a reason.
- **Bulk:** `PUT /api/accounts/dimension-rules/bulk` with body `{accountIds[], dimension, rule, reason}`.
  - All or nothing, at most 500 ids.
  - Refusal `details.accounts[{id, number, code}]`.
- **Impact:** `POST /api/accounts/dimension-rules/impact`.
  - Body: `{dimension, rule, from?, to?, accountIds?}` (range, cell or bulk).
  - Answer: `{accountsAffected, accountsKeepingOwnRule:[{id, number, name, rule}], drafts:{journals, invoices, bills, adjustments}, recurringTemplates, headerAccountsExcluded}`.
  - For NOT_ALLOWED it counts the drafts that carry a value on that dimension; for REQUIRED, the drafts missing one.
- **Summary** for the overview counts ("Required on 312 · optional on 96", "3 range rules, 4 single-account rules"): its own read or part of the range list. Name it.
- **Reads that gain `dimensionRules:[{dimension, rule, source: ACCOUNT|RANGE|CHART, locked, range?:{from, to}, lockCountry?}]`:**
  - the account list;
  - the setup chart (`SetupDtos`);
  - the journal `LineAccountDto`;
  - the recurring DTOs.

  The list is always present (`[]` when empty). `allowedDimensions` stays, derived.
- **Refusals:**
  - `RULE_RANGE_OVERLAP {dimension, from, to, ruleId}` (of the other rule);
  - `RULE_LOCKED {accountNumber, accountName, dimension, country}`;
  - `REASON_REQUIRED {min:6, max:500}`;
  - unknown `rule` or `dimension`, or an explicit `null` for a required field → 400.

## Scope
- **Write:** this repo only.
  - `services/accounts-service`: migration V80 or the next free number at build time, domain, application, delivery, packs, audit.
  - `services/user-service`: migration V51 or the next free number.
  - The docs below.
- **Writers of `allowed_dimensions` to route through the rules** (check this list in discovery):
  - Add account `ChartController.kt` POST;
  - `SieOpeningConfirmService.kt` (copies `like?.allowedDimensions`);
  - `ChartMaterializer.kt`, `ChartBuilder.kt` (pack → company);
  - `Pack2026Writer`, `Pack2026_3Writer`, `PackWriter`;
  - `packs/2026.5/pk-layouts/adoption.sql`.
- **Read:** both repos, including the App's readers of `allowedDimensions` and its dimension screens.
- **Out of scope:**
  - REQUIRED enforcement on every path (`PostingValidator` step 6, `DraftDimensionCheck`, recurring, import, AR/AP, adjustments) and the role-accounts read: flow 2.
  - The branch default: flow 3.
  - Department, "group only" nodes, "Used on lines" counts and history: backlog:320.
  - `PostingEngine.kt` and `Posting.kt` stay untouched.

## Step 1: discovery and plan (before any code)
Write `docs/agents/dimension-rules/plan-set-rules-be.md` and stop for the lead's OK. It must cover:
- every writer and reader of `allowed_dimensions` (the lists above, checked and completed);
- the template-side storage and the CSV grammar (rule 3);
- the backfill: what each existing account gets, at CHART or ACCOUNT level, including user-created accounts (`status_source USER`);
- where the resolve function lives, as one pure function that flow 2's checkers will call;
- "where else?": other per-account lists of allowed values;
- what you will reuse: audit writer, reason validation, reasoned removal, REVOKE pattern, `BooksRequirement`, count queries;
- the migration numbers checked on the latest `origin/main`;
- your decisions and open questions.

## Feature checklist
- [ ] Release flag: rules follow the Accounts FINANCE switch like the other dimension endpoints; free slots follow `FINANCE.FREE_DIMENSIONS`.
- [ ] Permissions and company scope on every path: reads, writes, impact, bulk, summary, CSV import, Add account.
- [ ] Demo data with awkward cases:
  - NO demo company: a range 6000–6999 cost centre REQUIRED, one account rule overriding it, one account added after the range;
  - one PK company with no rules (derived = today);
  - a second company whose rules never show.
- [ ] Four languages: none in this repo (refusal codes are stable keys).
- [ ] Docs: developer page `docs/modules/accounts/dimensions.md` (**new**: rules, levels, ranges, the write-through); `chart-and-used-for.md` (CSV grammar); `db-design.md`; the API doc. User guide: none in this repo.
- [ ] The App's side of every endpoint read.

## Definition of Done
WORKFLOW v2 §5 (end to end on every path discovery found; tests for all cases from a test table written first; a test per fix that fails on the old code; standards kept; checklist done; hand-back complete) plus:
- **Backfill proof:** for every account in every seeded company (both packs), the column after backfill equals the column before. Run on a fresh Flyway database and on seeded data.
- A new company from each pack (base, NO, SE, PK) gets the pack's dimensions as CHART rules, and the same column as today.
- No ledger line is written or changed by any rule change; `scripts/money-invariants.sh` is green after the seed.
- Audit entries `accounts-dimension-rule` CREATE, UPDATE and DELETE with reason, before and after.
- The contract examples are published, and a BE test accepts them.

## Test table (fill before coding; the reviewer checks it)
| Case | Kind | Expected | Test name |
|---|---|---|---|
| account rule REQUIRED saved, read back source ACCOUNT, audit entry | success | 200; ACCOUNT; audit before/after | |
| range 6000–6999 applies to 6500 (pack account) and to an account added later at 6750 | success | RANGE on both | |
| account rule wins over range; range wins over chart | success | precedence | |
| locked CHART rule vs a loosening range | edge | locked rule stays | |
| tighten a pack OPTIONAL, then loosen it back; loosen an unlocked pack REQUIRED | success | saved | |
| loosen a locked rule (account, range, bulk) | refusal | 422 `RULE_LOCKED` with details | |
| overlapping range, same dimension | refusal | 422 `RULE_RANGE_OVERLAP` with the other rule | |
| touching ranges; same range on another dimension | edge | saved | |
| from > to | refusal | 400 | |
| from = to | edge | saved | |
| a non-numeric account number in a company chart | edge | stated behaviour (plan) | |
| header accounts inside a range | edge | not counted, not ruled | |
| edit a range rule; remove a range rule; "use the range rule" on an account, each with a reason | success | saved, audit entry | |
| reason 5 / 501 characters / missing / explicit `null` | refusal | 422 `REASON_REQUIRED` / 400 | |
| reason 6 / 500 characters | edge | saved | |
| impact for a range, a cell and a bulk change; NOT_ALLOWED counts drafts carrying a value | success | exact counts per kind, the own-rule list | |
| bulk for n accounts, one locked | refusal | nothing saved; the account named | |
| bulk with 501 ids | refusal | 400 | |
| set NOT_ALLOWED → posting with that dimension refused; back to OPTIONAL → posts; REQUIRED → still posts without the value (flow 2 enforces) | edge | step 6 behaviour exactly | |
| column = resolved rules after every write (account, range, bulk, remove) | edge | equal | |
| Add account without rules → CHART level; with rule picks and no `DIMENSION_RULE.UPDATE` → 403 | rights | as rule 8 | |
| caller without `DIMENSION_RULE.UPDATE`; platform actor writes | rights | 403 | |
| another company's account id, range id; their counts | rights | 404; never in lists or counts | |
| Accounts off; free dimensions off; books not LIVE (write) / CREATED (read) | rights | as rules 9–10 | |
| a stand-in user | rights | their own codes apply, nothing more | |
| same PUT twice; two users saving overlapping ranges; stale `version` | repeat | idempotent; one wins, the other gets the overlap or the version refusal | |
| chart CSV `cost_centre:required`, bare `cost_centre`, unknown suffix | success / refusal | REQUIRED / OPTIONAL / row refusal | |
| backfill on every seeded account; a new company per pack | edge | column unchanged | |
| `dimensionRules: []` on an account with none; unknown `rule` / `dimension` in a request | contract | always present; 400 | |
| published examples accepted | contract | 200 | |
| rule change after posting: lines and balances unchanged | edge | money invariants green | |

## Hand-back (≤ 15 lines + files)
- Commits and range.
- What ran: command, sha, and the counts from that run.
- **Decisions I took.**
- **Found outside the brief** (fixed / reported).
- Reused vs new, with the reason.
- The filled review checklist (`ref-review-template.md` §Checklist).
- The contract table for the App builder.
- `Brief: unclear or missing — …` (or none).

## Never
- `--no-verify`, force push, AI attribution (no Co-Authored-By), GitHub workflows, writes in the other repo.
- No push, merge or rebase: builders commit, the lead pushes.
- Gradle only as `docs/operations/verify.md` and the lead say (one job on this Mac at a time). Never `gradlew --stop`. Don't start the backend stack unless the lead says so.
- Migrations: next free number at build time; never edit an applied migration.
- Never open, print, grep the content of or copy `.env` files (incl. tracked `infra/.env`), `.local-secrets/**`, token/session files, `~/.gradle/gradle.properties` and other user-level `gradle.properties`, `~/.netrc`, `~/.npmrc`, `~/.aws/**`, or keys. Read one key only when needed (`grep -c '^key=' file`).
