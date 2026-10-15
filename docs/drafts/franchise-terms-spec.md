# FT-1 — Franchise terms (spec)

**Status:** Draft for Jabran's approval, 2026-10-04. Nothing here is a contract
yet. Once approved, the API part goes into `NeoERP-BackEnd/docs/api/org.md` and
the codes into `docs/security/permission-actions.md` and `standard-roles.md`.

**Step:** 0, "Franchise terms", in `NeoERP-App/docs/module-sequence.md`.
**Used by:** Accounts slice F, "Franchise charges" (`docs/agents/accounts/scope.md`).

## 1. What this is

A franchise's fee lines with its franchisor: what the franchise owes, how it is
worked out, and from when. Org stores the terms. Accounts reads them and does
all the money work in Step 1.

- One set of terms per franchise. It is a list of **versions**, each starting on a date.
- Each version holds **fee lines** (royalty, fixed fee, marketing fund, …).
- The franchisor's admins edit them, always with a reason.
- The franchise sees them read-only. Neovatus staff can read them.
- Every change is audited on both companies.

## 2. What it rests on

| Source | What it gives this spec |
|---|---|
| RULES §7 | A franchise keeps its own books. The franchisor never sees the franchise's ledger through this feature; the franchise never sees the group's. `ownership`, `books` and `billing` stay independent. |
| RULES §8 | A franchise can hold its own agreement with **Neovatus**. That is a different thing from franchise terms (the franchise's deal with its **franchisor**). The screens must never mix them. |
| RULES §5 / ux §4–5 | A change to something in force is an action with a reason gate, never a silent save. |
| RULES §11 pattern | State is computed once by org-service and read by every screen, never recomputed in the app. |
| ADR-013 / ADR-015 | A franchise is a `companies` row (`company_type = FRANCHISE`, `parent_company_id` = franchisor). Terms hang off that company. No branch rows. |
| V10, V16 | `company_type`, `parent_company_id`, `consolidates_into_parent`, `billing_mode` already exist. |
| V11 `agreements` | Model to copy: dated rows, history kept, `uq_..._active` style guards, no `plan` field. |
| V18 `org_requests` | The request inbox is tenant → Neovatus. Franchise terms are franchisor → franchise, so they do **not** go through it. |
| V24 `entitlement_changes` | Model to copy for a typed, company-scoped change history that a screen reads. |
| `ReasonGate`, `ChangeReason` | Reason ≥ 6 characters, 400 with `fieldErrors.reason` otherwise. Reused as is. |
| `permission-actions.md` | One code per action; platform parity; reasons on money decisions. |

**Step 0 dependency:** "Block parent loops" (franchisor must be `OWNED`) lands
first or in the same change. Terms assume a two-level tree.

## 3. Domain model

### Records

**Terms version** (`franchise_terms_versions`)

| Field | Notes |
|---|---|
| `id` | uuid |
| `franchise_company_id` | The franchise. Must be `FRANCHISE`. |
| `franchisor_company_id` | Copy of the franchise's `parent_company_id` at write time. Checked equal on every write. Used for access and audit. |
| `version_no` | 1, 2, 3 … per franchise. |
| `effective_from` | Date the version starts. Required. |
| `effective_to` | Not stored. Derived: the day before the next version starts, or open. |
| `ends_on` | Optional. Set only on the last version, when the franchise relationship ends. |
| `currency` | The franchisor's company currency, stamped at write time. See FT-Q4. |
| `contract_reference` | Optional. The franchise agreement or addendum number between franchisor and franchisee (e.g. "FA-2026-014 add. 2"). |
| `reason` | Why this version exists. Required, ≥ 6 chars. |
| `created_by`, `created_by_name`, `created_at` | Who wrote it. |

**Fee line** (`franchise_fee_lines`), many per version

| Field | Notes |
|---|---|
| `fee_type` | `INITIAL`, `RENEWAL`, `FIXED_PERIODIC`, `ROYALTY`, `MARKETING_FUND`, `TECHNOLOGY` (the Accounts v1 list). |
| `label` | Optional words shown on the line and later on the invoice ("POS licence"). |
| `basis` | `FIXED_AMOUNT` or `PERCENT_OF_REVENUE`. |
| `amount` | For `FIXED_AMOUNT`. `numeric(19,4)`, > 0. |
| `rate` | For a flat %. `numeric(7,4)`, 0 < rate ≤ 100. |
| `tier_mode` | Only when tiers exist: `WHOLE_AMOUNT` (the reached tier's rate applies to all revenue) or `ABOVE_ONLY` (each rate applies only to the part inside its band). |
| `minimum_amount` | Optional, % lines only. The least charged per period. |
| `period` | `ONE_OFF`, `MONTHLY`, `QUARTERLY`, `YEARLY`. |
| `starts_on`, `ends_on` | Optional, inside the version. For a royalty holiday or a fee that stops early. Empty = whole version. |

**Tier** (`franchise_fee_tiers`), many per % line

| Field | Notes |
|---|---|
| `from_amount` | Revenue in the period from which `rate` applies. First tier is 0. Strictly ascending. |
| `rate` | % for this band. |

### Which fields each fee type allows

| Fee type | Basis | Period | Tiers / minimum |
|---|---|---|---|
| Initial fee | Fixed | One-off (due on its start date) | — |
| Renewal fee | Fixed | One-off (due on its start date) | — |
| Fixed periodic fee | Fixed | Monthly / quarterly / yearly | — |
| Royalty | % of revenue | Monthly / quarterly / yearly | Tiers and minimum allowed |
| Marketing fund | % of revenue, or fixed | Monthly / quarterly / yearly | Tiers and minimum allowed when % |
| Technology fee | Fixed | Monthly / quarterly / yearly | — |

Revenue for a % line is defined by Accounts (D-A6: income accounts flagged
"counts toward franchise fees"). Org only stores the rate.

### Examples (one franchise, currency PKR)

| Line | Stored as | In words |
|---|---|---|
| Initial fee | `INITIAL`, fixed 500,000, one-off, starts 2026-11-01 | 500,000 once, due 1 Nov 2026 |
| Royalty, flat | `ROYALTY`, 6%, monthly | 6% of each month's sales |
| Fixed monthly fee | `FIXED_PERIODIC`, 25,000, monthly | 25,000 every month |
| Royalty, tiered | `ROYALTY`, tiers 0 → 5%, 1,000,000 → 4%, `ABOVE_ONLY`, monthly | Sales of 1,500,000 → 50,000 + 20,000 = **70,000**. With `WHOLE_AMOUNT` → 4% × 1,500,000 = **60,000**. |
| Minimum | `ROYALTY`, 6%, minimum 40,000, monthly | Sales of 600,000 → 36,000, so **40,000** is charged |
| Marketing fund | `MARKETING_FUND`, 2%, monthly | 2% of each month's sales into the ad fund |
| Royalty holiday | `ROYALTY`, 6%, monthly, line `starts_on` 2027-05-01 | No royalty for the first six months |
| Technology fee | `TECHNOLOGY`, 8,000, monthly, label "POS licence" | 8,000 a month |

### Rules a fee line must pass (400 with `fieldErrors`)

- Basis matches type (table above). Amount for fixed, rate or tiers for %; never both.
- Tiers: first `from_amount` is 0, ascending, no duplicates, 2–10 tiers; `tier_mode` required with tiers, forbidden without.
- `minimum_amount` only on % lines, and only with a recurring period.
- One-off lines must have `starts_on` (the due date) or take the version's `effective_from`.
- At most **one line per fee type** in a version. Two technology fees are one line with the total, or FT-Q6.
- Line `starts_on` / `ends_on` lie inside the version; `ends_on` ≥ `starts_on`.
- A version may have zero lines. That means "no fees from this date" (a fee-free period).

## 4. Versioning and dates

- **One version in effect on any date.** Versions are ordered by `effective_from`; each runs until the day before the next. No gaps are possible and no overlaps are possible. Unique index on (`franchise_company_id`, `effective_from`).
- **States**, computed by org-service and returned on every version: `SCHEDULED` (starts in the future), `IN_EFFECT`, `ENDED` (a later version took over, or `ends_on` passed). Shown as Scheduled · In effect · Ended. The app never works this out from dates.
- **Changing terms = adding a version** from a date. The new version starts as a copy of the one in effect; the editor changes only what differs (ux §3). History shows only the differences ("Royalty 6% → 5%, + Technology fee 8,000/month").
- **The past is fixed.** A version that has started (`effective_from` ≤ today) can never be edited or deleted. A past period is always charged on the terms that applied then.
- **The future can change.** A `SCHEDULED` version can be edited or withdrawn, with a reason.
- **No backdating** in v1: `effective_from` ≥ today in the franchisor's time zone. Corrections for past periods are made in Accounts (credit note or adjustment). See FT-Q2.
- **First terms** may start on any date ≥ the franchise's creation date, so terms can be set up just after enrollment for a franchise that started trading that day (FT-Q2).
- **Ending:** "End terms" sets `ends_on` on the last version. After it, nothing is charged. Ending again later is a new version.
- **Franchise inactive or suspended:** terms stay as they are and stay editable. Whether to charge is Accounts' call.
- **Franchisor currency changes:** not possible once anything is posted (Accounts rule); terms keep the stamped currency.

## 5. Who can see and change them

| Who | See | Change |
|---|---|---|
| Franchisor: Owner, Finance Manager | Yes, for all its franchises | Yes |
| Franchisor: Company Admin | Yes | Per the brief yes; see FT-Q1 |
| Franchisor: Accountant, Accounts Viewer, Auditor | Yes | No |
| Franchise: Owner, Finance Manager, Accountant, Accounts Viewer, Auditor | Its own terms only | Never |
| Neovatus: Super Admin, Support, Read-only | Yes, companies in scope | No (FT-Q7) |

**How the backend decides:** the franchise's terms are reachable from two
companies.

- **Read:** `ORG.FRANCHISE_TERMS.READ` at the franchise **or** at its franchisor, or `PLATFORM.FRANCHISE_TERMS.READ` with either company in scope (platform scope already reaches a franchise through its franchisor, `PlatformAccess.reaches`).
- **Change:** the code at the **franchisor** only. The same code held at the franchise does nothing. This is what makes the franchise read-only, by rule, not by hiding buttons.
- **Read-only Enter company** is respected: no writes.

### Permission codes to add

| Code | Label | Action | Reason |
|---|---|---|---|
| `ORG.FRANCHISE_TERMS.READ` | View | See terms, versions and their history | — |
| `ORG.FRANCHISE_TERMS.UPDATE` | Edit | Add a version (including the first), edit a scheduled version, end terms | Yes |
| `ORG.FRANCHISE_TERMS.DELETE` | Delete | Withdraw a scheduled version (real delete; started ones can't be) | Yes |
| `PLATFORM.FRANCHISE_TERMS.READ` | View | Platform parity for staff | — |

This replaces the indicative `ORG.FRANCHISE_TERMS.{READ,WRITE}` in the Accounts
scope. No `CREATE`: the first version is the same act as any later one.

### Defaults (manifest, `standard-roles.md` §3 "Org")

| Code | Owner | Admin | Finance Mgr | Accountant | Accounts Viewer | Auditor | Branch Mgr |
|---|---|---|---|---|---|---|---|
| `ORG.FRANCHISE_TERMS.READ` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| `ORG.FRANCHISE_TERMS.UPDATE` | ✓ | FT-Q1 | ✓ | — | — | — | — |
| `ORG.FRANCHISE_TERMS.DELETE` | ✓ | FT-Q1 | ✓ | — | — | — | — |

| Code | Super Admin | Support | Read-only |
|---|---|---|---|
| `PLATFORM.FRANCHISE_TERMS.READ` | ✓ | ✓ | ✓ |

Owner gets every new code (rule O-1). Separation of duties (rule 7) does not
apply: setting terms is not approving a submission.

## 6. Screens

### Where it lives

| Who | Path | What |
|---|---|---|
| Franchisor admin | Company → **Franchises** (list of its franchises) → franchise → **Franchise terms** tab | Full editor |
| Franchise user | Own company → **Franchise terms** tab | Read-only, same layout |
| Neovatus | Companies → franchise → **Franchise terms** tab; also from the franchisor's page | Read-only |

**Gap found:** a franchisor's people normally have no membership in their
franchises, and `GET /companies` only returns companies they belong to. Today
the app finds a franchisor's franchises only among companies already loaded, so
a tenant franchisor admin cannot open a franchise at all. FT-1 therefore needs
a narrow **franchisor view of a franchise**: name, code, status, country,
currency, its owner's name, and the terms tab. Nothing from the franchise's
books, people or modules. See FT-Q3.

The tab shows only for `FRANCHISE` companies and only with a read code. No
view permission → no tab (ux §6).

### The tab

1. **Header card "In effect"** (`NeoSectionCard`): version no., "In effect since 1 Nov 2026", contract reference, currency, `NeoEntityStatusPill` (In effect). Fee lines below as `NeoListRow`s: type + label, the rule in words ("6% of monthly sales, minimum 40,000"), period. Tiers open under their line (ux §2).
2. **Scheduled card** (only if one exists): the next version, "Starts 1 Jan 2027", with its differences from the one in effect as a `NeoQuoteBlock` (`quoted = false`). Actions: Edit, Withdraw (destructive).
3. **History card**: `NeoDataTable` of versions (No., From, To, State, Changes, Reason, By). Row opens the version read-only.
4. **Primary action** (franchisor, with UPDATE): "Change terms" (or "Set up terms" when none). "End terms" as a secondary action.
5. A one-line notice at the top, always: "These are the fees this franchise pays its franchisor. The franchise's subscription with Neovatus is on the Agreement tab." (RULES §8: never mix the two.)

### Editor

- `NeoSidePanel` (full screen below 600), like record forms.
- **Effective from** (`NeoDateField`, default: first day of next month), **contract reference**.
- Lines: "Add fee" opens a type picker; only types not yet used are offered. Each line is a small card: type, label, basis (segmented: Fixed amount / % of sales, only where the type allows), amount or rate, period, optional start/end, tiers ("Add tier"; "Rate applies to: All sales / Only the part above"), minimum.
- **Live preview** under each % line: "At 1,500,000 sales: 70,000". Helps people read tiers right.
- Consequence written next to the date (RULES "explain consequential choices"): "From this date these terms replace the current ones. Past periods keep their terms. Once this date has passed, it can't be changed."
- Save → **reason gate** (`NeoReasonGateDialog`): summary of changes ("+ Technology fee 8,000/month · Royalty 6% → 5%"), reason (≥ `NeoChangeReason.MIN_REASON_LENGTH`), hint `NeoReasonGateCopy.REASON_HINT`. Withdraw uses the destructive variant.
- Toast after save: "Terms change scheduled for 1 Jan 2027" / "Terms in effect from today". After withdraw: "Scheduled change withdrawn".

### States

| State | What shows |
|---|---|
| Loading | Card skeletons |
| Load error | `NeoLoadError` with Try again |
| None yet, can edit | Empty state: "No franchise terms yet" + "Set up terms" |
| None yet, read-only | `emptyLine`: "No franchise terms recorded" (franchise side: "Your franchisor hasn't recorded terms yet") |
| Read-only | Same layout, no actions, controls at full contrast |
| Ended | Header shows "Ended on 31 Dec 2027"; "Change terms" still offered to restart |
| Franchisor not `OWNED` | Can't happen after the parent-loop block; backend 409 if it does |
| Save fails | Panel stays open, values kept, error at the field or as a notice (ux §8) |
| Conflict | Another person added a version meanwhile: 409, "These terms changed while you were editing. Reload to see the latest." |
| Date in the past | Field error: "Pick today or later. Past periods keep the terms that applied then." |

Rig: add `franchise-terms.jsx` to the Screen Rig with all states at 1440, iPad and 390.

## 7. Audit

Each change writes one outbox event per company: on the franchise (`orgId` =
franchise) and on the franchisor (`orgId` = franchisor), so both Audit logs show
it. Both carry `reason` and `amendmentReference` = `contract_reference`.

| Resource | Action | Wording in the Audit log |
|---|---|---|
| `franchise-terms` | `SET_UP` | "Set up franchise terms for {franchise}, from {date}" |
| `franchise-terms` | `ADD_VERSION` | "Changed franchise terms for {franchise} from {date}: {differences}" |
| `franchise-terms` | `EDIT_SCHEDULED` | "Edited the scheduled terms for {franchise} (from {date}): {differences}" |
| `franchise-terms` | `WITHDRAW_SCHEDULED` | "Withdrew the scheduled terms for {franchise} (from {date})" |
| `franchise-terms` | `END` | "Ended franchise terms for {franchise} on {date}" |

Payload: before and after (lines with amounts, rates, tiers). Readable by
whoever can read the audit log at that company. Add these to the
recorded-actions catalogue (Step 0 audit baseline).

## 8. API sketch (org-service)

Paths under `/api/org`. All writes take `reason`; 400 `fieldErrors.reason` if short.

| Method & path | Who | Does |
|---|---|---|
| `GET /companies/{franchisorId}/franchises` | READ at franchisor / platform | The franchisor's franchises: id, code, name, status, country, currency, owner name, terms state |
| `GET /companies/{franchiseId}/franchise-terms` | READ at franchise or franchisor / platform | Current, scheduled and history; each version with `state` and lines |
| `GET /companies/{franchiseId}/franchise-terms/versions/{versionId}` | same | One version |
| `POST /companies/{franchiseId}/franchise-terms/versions` | UPDATE at franchisor | Add a version (first or later) |
| `PUT /companies/{franchiseId}/franchise-terms/versions/{versionId}` | UPDATE at franchisor | Edit a `SCHEDULED` version; 409 if started |
| `DELETE /companies/{franchiseId}/franchise-terms/versions/{versionId}` | DELETE at franchisor | Withdraw a `SCHEDULED` version; body `{reason}` |
| `POST /companies/{franchiseId}/franchise-terms/end` | UPDATE at franchisor | `{endsOn, reason}` |

Write body (sketch):

```json
{
  "effectiveFrom": "2027-01-01",
  "contractReference": "FA-2026-014 add. 2",
  "reason": "Royalty cut agreed at annual review",
  "expectedLatestVersionNo": 3,
  "lines": [
    { "feeType": "ROYALTY", "basis": "PERCENT_OF_REVENUE", "period": "MONTHLY",
      "tierMode": "ABOVE_ONLY", "minimumAmount": "40000.00",
      "tiers": [ { "fromAmount": "0", "rate": "5.0" }, { "fromAmount": "1000000", "rate": "4.0" } ] },
    { "feeType": "TECHNOLOGY", "label": "POS licence", "basis": "FIXED_AMOUNT",
      "amount": "8000.00", "period": "MONTHLY" }
  ]
}
```

- Money and rates as decimal strings, never floats.
- `expectedLatestVersionNo` guards against two editors (409 on mismatch).
- Errors: 400 field errors (rules in §3), 403 no permission, 404 not a franchise or not found, 409 started version / stale version / franchisor not `OWNED` / `parent_company_id` changed.
- **Internal, for Accounts:** `POST /api/internal/org/franchise-terms/resolve`, machine credentials with a new scope `org.franchise-terms.read` (same pattern as `org.facts.read`). Never a human token. Not routed by the gateway.

## 9. Migration sketch

**org-service `V<next free>__franchise_terms.sql`** (number taken at build time; see ERP-12) (or the next free number after the
parent-loop block's migration):

- `franchise_terms_versions` with `uq (franchise_company_id, effective_from)`, `uq (franchise_company_id, version_no)`, `ck ends_on IS NULL OR ends_on >= effective_from`, index on `franchisor_company_id`.
- `franchise_fee_lines` with checks: basis vs amount/rate, `rate` 0–100, `amount` > 0, `minimum_amount` only when basis is %, `uq (version_id, fee_type)`.
- `franchise_fee_tiers` with `uq (line_id, from_amount)`, `from_amount >= 0`.
- `franchise_terms_changes`: typed change history (actor, action, version, before/after summary, reason, reference), like V24.
- FK from versions to `companies(id)` for both company columns (same service, so allowed).
- A trigger or service check that `franchise_company_id` is `FRANCHISE` and its parent equals `franchisor_company_id`. Service check plus the V10 constraints is enough; no trigger needed.

**user-service `V<next free>__franchise_terms_permissions.sql`** (number taken at build time): the four codes in
`iam.permissions` (module ORG, record FRANCHISE_TERMS), defaults per §5, standard
role versions raised with a change-log line.

Demo seed: one franchise with a flat royalty in effect, one with tiers + minimum
and a scheduled change, one with no terms, one ended.

## 10. What Accounts will consume (Step 1, slice F)

`POST /api/internal/org/franchise-terms/resolve` with `{franchisorId, from, to}`
returns, per franchise:

- franchise id, name, currency;
- each version that overlaps the range, clipped to it (`from`, `to`), with version id and number;
- its lines with fee type, basis, amount or rate, tiers and mode, minimum, period, line dates, line id.

Accounts then:

- works out revenue per period from the franchise's own ledger (D-A6 flag);
- applies tiers and minimums, splits a period that crosses a version change;
- stores version id and line id on every draft charge as evidence (stable, because started versions never change);
- posts the invoice and the matching bill (D-A5).

Org does none of that math. Proration, tax and posting accounts are Accounts'
decisions (FT-Q5).

## 11. Out of scope

- Calculating, invoicing and posting charges (Accounts slice F).
- Tax on fees; which income and expense accounts the fees post to (Accounts).
- Proration rules for partial periods (Accounts; see FT-Q5).
- Markup on supplies, profit share, master-franchise fee splits (Accounts "out of scope").
- Multi-currency terms.
- The franchise acknowledging or disputing terms in the app; e-signature; attaching the contract PDF.
- Franchise terms for an `OWNED` company or a branch (a branch is never a franchise, ADR-015).
- Changing a franchise's franchisor (re-parenting is unsupported, ADR-013).

## 12. Open questions

| # | Question | Recommendation |
|---|---|---|
| FT-Q1 | The brief lists Company Admin as an editor. `standard-roles.md` says Company Admin must never "post or approve money". Fee terms are money terms. | Company Admin **reads only**. Owner and Finance Manager edit. A company that wants its admin to edit can add it as an exception. |
| FT-Q2 | Allow backdating a new version? | No, except the first version may start on the franchise's creation date. Past corrections go through Accounts as credit notes or adjustments. Keeps "a past period is charged on the terms that applied then" true. |
| FT-Q3 | How does a franchisor's admin reach a franchise they have no membership in? | Add the narrow franchisor view (§6): list + franchise header + terms tab, authorised by the franchisor's own codes. It reads only the franchisor's own contract data, so it does not need the ADR-013 group scope. Don't hand out memberships in franchises. |
| FT-Q4 | Franchisor and franchise in different currencies? | Block in v1: setting up terms is refused (409) unless both companies have the same currency. Matches D-A7. Multi-currency later. |
| FT-Q5 | Partial periods (version or line starting mid-month): prorate fixed fees and minimums? | Yes, by days, for fixed periodic fees and minimums; % lines are naturally partial. Decide it in the Accounts contract, but agree the rule now so the UI preview can state it. |
| FT-Q6 | One line per fee type per version, or several (two technology fees)? | One per type in v1. Simpler rules, no double charges. Revisit if a real franchisor needs two. |
| FT-Q7 | Can Neovatus staff edit terms? | No direct platform edit. Support can still act through full-access Enter company, which is reasoned and double-logged (RULES §13). |
| FT-Q8 | Periods: calendar months/quarters/years, or the franchisor's fiscal year? | Calendar months and quarters; yearly follows the franchisor's fiscal-year start (D-13). |
| FT-Q9 | Should the franchise be told when terms change? | Yes: an in-app notice to the franchise Owner and Finance Manager through audit-service notifications, as requests already do. Small, and avoids "surprise" bills. Can slip to Accounts slice F if Step 0 is tight. |
| FT-Q10 | Where in the franchisor's company page does the franchises list sit: in Branches (ADR-015 union) or its own "Franchises" tab? | Its own "Franchises" tab for v1. Branches stays company-owned rows; the ADR-015 union can come later without blocking this. |

## 13. Build order (after approval)

1. Contract: this API, codes and audit actions into `docs/api/org.md`, `permission-actions.md`, `standard-roles.md`.
2. Rig: `franchise-terms.jsx` with all states; Jabran reviews.
3. Backend: migrations, domain rules, endpoints, internal resolve, audit, tests (overlaps, no backdating, started versions locked, franchise can't write, cross-company read).
4. App: franchisor Franchises tab and franchise view, terms tab, editor, reason gate, read-only side.
5. Seed, gateway route check for the new paths, click-through as franchisor admin, franchise owner and Neovatus Read-only.
