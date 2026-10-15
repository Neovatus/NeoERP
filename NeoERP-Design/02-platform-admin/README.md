# 02 — Platform Admin (Super Admin)

The Neovatus-side console: enrol companies, hold agreements, grant entitlements,
approve branch requests, manage people, enter any tenant.

Read **`../RULES.md` first** — the screens here are an expression of those
rules, and several are unguessable from the UI alone (why branch creation is a
request, why "franchise" sets three independent flags, why a module outside the
agreement can still be switched on).

Auth is documented separately in `../01-auth/README.md`.
Tokens and components in `../00-design-system/README.md`.

Not in scope yet, deliberately: company-owner and role-based dashboards
(Manager, Sales, Employee), the functional modules, and the customer storefront.

## Screens & states

Screenshots were removed — see the root `README.md` for why. Use `../FLOWS.md`
for the flows and `../flows.json` for the same content machine-readable, and run
the prototype to see any screen in any state.

## About the design files

The files in this bundle are **design references created in HTML** — prototypes
showing intended look and behaviour, **not production code to copy**. They are
React 18 with in-browser Babel and components on the global scope, which is a
fast way to build a design artifact and a poor way to ship software.

Your task is to **recreate these designs in the target codebase's environment**
using its established patterns. If no environment exists yet, choose the
framework that fits the product and implement there. Two constraints survive
whatever you choose:

- **The 11 Keycloak-served auth screens must be a Keycloak login theme**
  (FreeMarker templates + stylesheet). Keycloak owns those URLs, the form
  actions, the CSRF tokens and the error states. Rendering them inside your SPA
  is a known dead end.
- **`styles.css` is written against CSS custom properties that map 1:1 to
  `neoerp-tokens.json`.** It is directly reusable, including inside the Keycloak
  theme. Prefer porting it over re-deriving values from screenshots.

## Fidelity

**High-fidelity.** Final colours, typography, spacing, geometry, motion and
interaction states, on a token file already reconciled against a parallel
Kotlin/Compose implementation including a WCAG AA contrast pass.

---

## Shell

Every Platform Admin screen renders inside one shell (`shell.jsx`).

- **Sidebar** 260px (compact density 232), `bg/sunken`, 1px right border.
  Collapses to a 280px drawer below 1024px behind a menu button.
- **Topbar** 64px, `bg/canvas`, 1px bottom border, sticky. Holds the workspace
  switcher, search, environment indicator (non-prod only), and account menu.
- **Content** max-width 1400px, padding 28px (22px below 720px).
- **PageHead** — breadcrumbs (11.5px `text/tertiary`, `/` separators, clickable
  segments as `.crumb-btn`), H1 at 28/700/−0.025em, optional sub, and a right
  action cluster that wraps below 720px.
- **Toasts** bottom-right, 180ms rise, auto-dismiss 4s, `zIndex 1000`.

Sidebar sections and items:

- **Overview** — Dashboard, Requests (badge = open count)
- **Tenants** — Companies, Branches, Entitlements, Agreements
- **People** — Platform staff, Tenant users
- **Platform** — Audit log, Settings

---

## Screens

### 1. Platform Dashboard — `platform-dashboard.jsx`

The Neovatus operator's landing screen. Answers "what needs me today".

- **Split layout**, `rgrid rgrid-7-5`: work queue left, portfolio right.
- **KPI strip** — 4 cards: Companies, Branches, Users, Open requests. Value at
  26/700/−0.025em, label 11/600/+0.06em uppercase `text/quaternary`, delta at
  12px in `success-text`/`danger-text`.
- **Needs attention** — the queue. Each row: severity pin (6px dot, `success-dot`
  / `warning-dot` / `danger-dot`), title 13.5/500, sub 12px `text/tertiary`,
  tenant + env chips, age, and a CTA button. Empty state is a real state, not a
  blank card.
- **Agreements panel** — every agreement on the platform, company and franchise
  together, **soonest expiry first**. Franchise rows carry a black `Franchise`
  badge and name their parent group. This is the only place the whole renewal
  picture exists; individual tenant screens each show one.
- **Platform health** — env status rows, latency, error rate, last deploy.
- **Portfolio** — tenant list with country, users, branches, agreement chip.

### 2. Companies — `companies.jsx`

List and detail.

- **List**: table with Company, Country, Users, Branches, **Agreement** (chip,
  or "None on file"), Status. Row click → detail. Search + country filter.
- **Detail tabs**: Overview · Branches · Modules · Users · Activity.
  - **Overview** — identity card, agreement card with countdown, limits usage.
  - **Branches** — cards per branch with ownership badge, status, `Enter`
    (impersonation) and `Open` (branch detail).
  - **Modules** — the `.mgrid` card grid (below). A notice points to
    Entitlements for anything beyond a flat on/off read.
  - **Users** — tenant users with role, status, last seen, reset action.
- **Enter company** button, super-admin only, top right of detail.

### 3. Company Enrollment — `enroll.jsx`

Four steps: **Company & region → Agreement → Owner invitation → Review & send**.
Super-admin only; there is no self-serve company signup anywhere.

- **Stepper** — numbered circles, active filled `accent/base`, complete shows a
  check, connecting 1px rules. Step 3 label switches to "Owner" when the owner
  already exists (no invitation is sent), so the stepper agrees with the card
  title, the review row and the button.
- **Step 2 — Agreement.** Reference, term, start/end, renewal (auto/manual).
  Then **Modules in this agreement** as `.mgrid` cards, headed
  *"This is the ceiling. Branches can switch these off, never on."*
  Then **Limits** as `.lrow` rows, each with a description of what it counts and
  an explicit **Unlimited** checkbox.
  There are **no plan tiers** — see RULES §2.
- **Step 3 — Owner.** Name, email, role. Sends a Keycloak Execute-Actions
  invitation; never sets a password.
- **Step 4 — Review.** Every value, each with a link back to its step.

### 4. Entitlements — `entitlements.jsx`

The most rule-dense screen. Resolves the four-level chain in RULES §3.

- Company selector, then a card per module.
- **Module header**: icon, name, `In agreement` / `Outside agreement` pill,
  feature count, seats, override count, and a Switch.
- **Summary**: `5 / 5` plus a red `+1` when extensions exist, labelled
  *"In agreement, plus 1 extension awaiting renewal"*.
- **Expanded body**: per-feature switches, then a **per-branch override row**
  per branch — a three-way `inherit / on / off` `.tri` control, the resolved
  effect (`.ent-eff`), ownership and billing badges, and any own-agreement note.
- **Reason gate** — every change opens a modal. Reason ≥ 6 chars always
  required; amendment reference optional normally, **required for extensions**,
  where the notice turns red and the button reads *Extend agreement & apply*.

### 5. Branch Detail — `branch-detail.jsx`

- Header: name, ownership badge, active/deactivated pill, `Enter branch`, Edit,
  Deactivate.
- **Facts list**: Ownership · Owner · **Financials** (own books vs group ledger,
  stated in words) · Billing · Agreement — with the group's separate expiry shown
  when the franchise holds its own.
- **Own agreement card** with its own countdown when it holds one.
- **Entitlements here** — resolved per module with a provenance tag:
  `Inherited` / `Overridden` / `Addendum` / `Own agreement` / `Not entitled`.
- **Warehouses & stores** table.
- **Deactivate vs suspend** explainer card (RULES §9).
- **Missing-record state**: if the branch isn't on file, the page says so and
  offers a way back — it never falls back to another tenant's owner and contract.

### 6. Requests — `requests.jsx`, `branch-requests.jsx`

One inbox for everything a tenant asks for: branch creation, limit increases,
module additions, user resets.

- **Split**: list left (source badge, tenant, age, type), detail right.
- **Branch request detail** — the requested facts, then **your decisions**:
  Ownership · **Financials** (own books / group books) · Billing · Modules
  (inherit or pick). Each with a note explaining the consequence.
- Approving creates the branch. Declining requires a reason, which is sent back.

### 7. Request a Branch (tenant side) — `branch-requests.jsx`

What the company owner sees. Included because it defines the contract between
the two sides.

- Name, city, code.
- **Type** as two `.type-card` options, not a dropdown — each lists what it
  commits to (RULES §7), headed *"This decides where the money lands."*
- Owner details when franchised. Reason. Submit.

### 8. People — `people.jsx`

Platform staff (Neovatus) and tenant users, separated. Role, status, last seen,
MFA state. Actions: send reset, revoke sessions, deactivate. Tenant user rows
note that the company admin can do this themselves (RULES §12).

### 9. Impersonation — `impersonation.jsx`

- **Launcher**: pick company, optionally branch, optionally a specific user;
  choose read-only or full; **reason required**; confirm.
- **Active banner**: fixed, full-width, `accent/base` ground, states who you are
  acting as and why, with a live timer and **Exit** always visible. Non-dismissable.
- Every action taken while impersonating is double-logged (RULES §13).

### 10. Settings — `settings.jsx`

Platform settings, including the **environment switcher** (dev/staging/prod) —
placed here rather than the topbar because it is a development-phase tool, not
daily furniture. Non-prod environments show a persistent topbar indicator.

### 11. Agreements — `agreement.jsx`

Shared components rather than a standalone screen:

- `AgreementChip` — status pill reading `state` off the record (org-service's
  own `ACTIVE`/`RENEWAL`/`SOON`/`CRITICAL`/`EXPIRED`, shown as Active / Renewal
  window / Expiring soon / Expires this week / Expired), colour-keyed, with
  `daysRemaining`.
- `AgreementCard` — full countdown: days remaining at 34px mono, elapsed
  percentage, term bar, dates, renewal mode, Renew action.
- `AgreementBanner` — tenant-side prominent warning inside 30 days.
- `allAgreements()` / `agreementForBranch()` / `branchRecord()` — the resolvers.
  **Use them.** Ad-hoc `.find()` calls against one dataset are how a contract
  reference ends up on the wrong tenant's screen.

---

### Audit log — `audit.jsx`

Where every reason gate lands. Without it the gates collect justifications and
discard them, which makes them ceremony rather than accountability (RULES §5, §13).

- Four KPIs: entries, **agreement extensions awaiting paperwork**, impersonation
  sessions, **missing a reason** (red when non-zero).
- Filter chips per kind, search across actor / tenant / reference.
- Rows expand to the reason verbatim; impersonation rows expand further into the
  actions taken inside the session, double-logged.
- An entry with no reason and a human actor renders a red notice, not a blank.

### Branches — `cross-tenant.jsx`

Every branch across all tenants — the view that does not exist when the only path
to a branch is through its company.

- Filter company-owned / franchised; search name, company, city.
- Columns: branch (+ city · code), company, type, owner, books, agreement.
- `branchNeedsOwner()` decides the owner cell: a franchise without one is red
  **Unassigned**; a company-owned branch is neutral **Group-run**.

### Agreements — `cross-tenant.jsx`

The renewal pipeline. Company and franchise contracts together, soonest first.

- KPIs: total, **inside 30 days**, **manual renewal** ("will lapse untouched"),
  auto renewal.
- Filters: all / manual renewal / franchise-held.
- `Renew` appears inside 90 days; `Open` routes to the company or the branch.

## Shared component vocabulary

Defined in `styles.css`, used across screens. Do not redefine them locally —
that was a real bug in this build: a shared class declared inside one component's
`<style>` block only exists while that component is mounted.

| Class | Use |
|---|---|
| `.mgrid` / `.mcard` | Module selection cards — 2-col grid, 38px icon block that fills when on, name, description, feature count, switch |
| `.lrow` | Limit row — label, description, number input, Unlimited checkbox |
| `.tri` / `.tri-opt` | Three-way inherit/on/off segmented control |
| `.ent-eff` | Resolved effect indicator — check + "Active" or x + "Off" |
| `.ent-own` / `.ent-bill` | Ownership and billing badges |
| `.ent-sub-hd` / `.ent-sub-note` | Section heading + inline explanatory note |
| `.type-card` | Consequential choice card with a bullet list of what it commits to |
| `.agr-chip` | Agreement status chip |
| `.req-reason` | Quoted request reason block |
| `.wdw` | "What this means" explainer rows |
| `.crumb-btn` | Clickable breadcrumb segment |
| `.wiz-foot` | Wizard footer action bar |

---

## Interactions & behaviour

- **Motion**: 80ms hover/border · 120ms switch, checkbox, tab · 150ms scrim,
  chevron · 180ms modal rise and toast, `cubic-bezier(.2,.8,.2,1)` · 220ms drawer
  · 400ms bar growth. `prefers-reduced-motion: reduce` drops all to 1ms and
  cancels the drawer slide, modal rise and toast entry outright.
- **Focus**: `:focus-visible` → `outline: 2px solid focus/ring; offset 2px`;
  offset inverts to `-2px` inside `overflow: hidden` parents. Checkbox and switch
  draw the ring on their visual proxy.
- **Touch floor**: below 720px every interactive control clamps to 44px
  regardless of density.
- **Tables**: below 720px they reflow to cards via
  `td::before { content: attr(data-label) }` — **every `<td>` needs a
  `data-label`**, with `data-label=""` on action cells. First-column identity
  cells intentionally suppress theirs and become the card heading.
- **Reason gates**: modal, `Apply change` disabled until reason ≥ 6 characters
  (and reference ≥ 3 for extensions).

## State

Local per screen; no global store beyond three contexts: `useToast`,
`usePlatform` (env, impersonation), and the density/theme attributes on `<html>`.
Nothing fetches — all data is mock. `platform-data.jsx` holds `TENANT_TREE`,
`ENT_MODULES`, `ENT_BRANCHES`, requests and queue items; `data.jsx` holds the
older `MOCK.COMPANIES` set. **Two datasets is technical debt in the prototype,
not a design intent** — collapse to one when you build.

## Design tokens

Authoritative: **`neoerp-tokens.json`** (Tokens Studio format, v1.1.0). The spec
page and `styles.css` derive from it, never the reverse. Full tables — colour
light/dark, focus, elevation, typography, spacing, density, radius, breakpoints —
are in `../00-design-system/README.md`, and are the same values here.

Five colour values are **WCAG AA corrections — do not revert them**:
light `text/tertiary` `#5F5F5F`, light `text/quaternary` `#707070`,
dark `text/quaternary` `#8A8A8A`, `success-text` `#0E783C`,
`danger-text` `#CA2222`.

Fonts: **Inter Tight** (UI) and **JetBrains Mono** (identifiers, codes, tabular
figures). Both SIL OFL 1.1, not bundled. Body sets
`font-feature-settings: "ss01","cv11"` and `letter-spacing: -0.005em` — carry
both, or every screenshot will look subtly wrong.

## Assets

No images anywhere. 43 hand-authored Lucide-style icons in `icons.jsx`, 24×24
grid, 1.75 stroke, round caps, `fill: none`, `stroke: currentColor`. Swap for
your icon library if you have one — match the 1.75 weight, since a heavier stroke
visibly changes the density of the whole design.

## Files

| File | Contents |
|---|---|
| `../RULES.md` | **Read first** — the domain rules the screens express |
| `../_prototype/NeoERP Super Admin.html` | Prototype entry point, routing, Tweaks jump list |
| `platform-dashboard.jsx` | Dashboard, KPIs, queue, agreements panel, health |
| `companies.jsx` | Company list, detail tabs, module grid |
| `enroll.jsx` | Four-step enrollment wizard |
| `entitlements.jsx` | Module/feature/branch entitlement resolution + reason gate |
| `branch-detail.jsx` | Branch page, resolved entitlements, warehouses |
| `branch-requests.jsx` | Tenant request form + super-admin approval panel |
| `requests.jsx` | Unified request inbox |
| `people.jsx` | Platform staff and tenant users |
| `impersonation.jsx` | Launcher, active banner, exit |
| `agreement.jsx` | Chip, card, banner, and the resolvers |
| `settings.jsx` | Platform settings, environment switcher |
| `firstrun.jsx` | Tenant first-run — included for the handover contract |
| `../01-auth/*.jsx` | The 13 auth screens |
| `../_prototype/shell.jsx` | Shell, PageHead, Field, Switch, Checkbox, Pill, Toast |
| `../00-design-system/icons.jsx` | Icon set |
| `../00-design-system/styles.css` | Tokens as custom properties + all shared component CSS |
| `../00-design-system/feedback.css` | Skeletons, empty states, offline, permission denied |
| `../00-design-system/neoerp-tokens.json` | **Authoritative** token file |
| `platform-data.jsx`, `data.jsx` | Mock data — shapes only |
| `../_prototype/tweaks-panel.jsx` | Prototype control panel. **Do not port** |

**To run**: `cd ../_prototype && python3 -m http.server 8000`, then open
`NeoERP Super Admin.html`. `file://` will not work. Use the Tweaks panel to jump
to any screen and to toggle theme, density and environment.

**Do not port**: `tweaks-panel.jsx`, the `.ftl` badges in the auth screens, the
"Open Reset (demo)" button, and the `000000` OTP failure shortcut.
