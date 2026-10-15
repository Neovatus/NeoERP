# Implementation readiness — Super Admin

Written for whoever picks this up, human or agent. It says what is safe to build
from, what is specified but unproven, and what does not exist yet. Read
`RULES.md` first regardless.

---

## Short answer

**Yes for desktop. Yes for tablet. Mobile is specified but not proven.**

Super Admin is 19 screens, all reachable, all consistent with `RULES.md`. A
developer can start on the backend domain model and the desktop frontend today.

The honest caveat is below, and it matters more than the summary.

---

## Responsive: what is actually verified

| Breakpoint | Status |
|---|---|
| **Desktop** ≥1280 | Verified. Every screen reviewed at full width |
| **Tablet** 720–1024 | Verified. Sidebar → drawer, KPI 2-up, auth art hidden. The bundled screenshots are this width |
| **Mobile** <720 | **Rules written, not visually verified on all screens** |

### What that means precisely

`styles.css` carries a complete mobile layer — tables reflow to cards via
`td::before { content: attr(data-label) }`, KPI grid drops to one column, the
44px touch floor clamps every control, the sidebar becomes a drawer. The older
screens (Companies, People, Entitlements, Enrollment, the 13 auth screens) were
built against it and reviewed.

The **three newest screens — Audit log, Branches, Agreements — have never been
seen at a real mobile viewport.** They were built with the same primitives and
carry the right structure (`data-label` on every cell, `flex-wrap` on the row
layouts, a `@media (max-width: 720px)` block in the audit log), so they should
reflow correctly. "Should" is doing real work in that sentence.

Three specific things to check first on a phone:

1. **Audit log rows** — `.aud-hd` is a 5-part flex row (timestamp, icon, action,
   tags, chevron). It wraps, but the expanded body's `padding-left: 100px`
   aligns under the icon column, which is wrong once the header has wrapped. The
   720px block resets it to 20px; confirm that fires.
2. **Branches table** — 7 columns is a lot to card-reflow. Every `<td>` has a
   `data-label`, so it should stack cleanly, but this is the widest table in the
   product and the most likely to look cramped.
3. **Agreements rows** — `.agl-row` wraps to a second line at narrow widths, and
   the action buttons may end up on their own row. Acceptable, but check the
   `Renew` / `Open` pair does not split.

### Is mobile even the right target?

Worth a decision rather than an assumption. Super Admin is an operator console:
9-column tables, entitlement matrices, agreement pipelines. Nobody administers a
multi-tenant ERP from a phone. **Tablet is a real use case** (a walkthrough, a
review meeting); phone is mostly "the page loaded and I could read it".

The design supports phone because the design system mandates it, not because the
workflow demands it. If you are prioritising, treat phone Super Admin as
"must not be broken", not "must be excellent". The tenant-side screens — first
run, and the role dashboards not yet designed — are where mobile actually
matters, because a branch manager or sales person genuinely will use one.

---

## What is complete

**Authentication — 13 screens.** Workspace entry, sign in, SSO, 2FA, recovery
code, forgot/sent/reset/success, invite, password expired, verify email, account
locked, page expired. Eleven are Keycloak login-theme templates; each names its
`.ftl` file. See `01-auth/README.md`.

**Super Admin — 19 screens.**

| Area | Screens |
|---|---|
| Overview | Dashboard, Audit log |
| Tenants | Companies list, Company detail (5 tabs), Enrollment (4 steps), Branches, Branch detail, Agreements, Entitlements |
| Requests | Inbox, Branch request detail, Request-a-branch (tenant side) |
| People | Platform staff, Person detail, Super Admins |
| Platform | Impersonation launcher + banner, Settings, Tenant first run |

**The design system** — tokens, components, responsive rules, focus treatment,
reduced motion, AA contrast pass.

## What does not exist yet

- Company Owner dashboard
- Role dashboards — Manager, Sales, Accountant, Employee
- The functional modules — Finance, HRMS, Payroll, Inventory, Sales
- Customer storefront and its self-signup

`RULES.md` §3, §7 and §13 already constrain all of these. Read them before
designing any of it.

---

## Where to start

**Backend first, and `RULES.md` is your domain model.** These are schema
decisions, not UI decisions, and they are expensive to retrofit:

1. **§3, the entitlement chain** — agreement ceiling → company default → branch
   override → feature override. Store overrides sparsely
   (`{branchId: 'on'|'off'}`); never materialise a full matrix.
2. **§7, three independent flags** — `ownership`, `books`, `billing`. Do not
   infer any from another. A managed franchise can have its own owner and group
   books; a franchisee with own books can be billed through the group.
3. **§8, agreements attach at two levels** — a franchise may hold its own
   contract with its own expiry. Any query answering "what is this branch
   entitled to" must resolve through the branch's own agreement first.
4. **§5 and §13, the audit log is a first-class table** — actor, tenant, action,
   reason, amendment reference, timestamp, and for impersonation a second actor.
   Append-only. Every reason gate in the UI writes to it.

**Then Keycloak**, because it gates everything: realm-per-tenant, brute force on,
rememberMe on, reset flow on, OTP 6/30s, recovery codes 12 single-use, email
verification required, **registration disabled** (§1).

**Then the frontend**, desktop-first, starting with the shell and the design
system so every screen after it is assembly rather than invention.

---

## Known debt, stated plainly

- **`dashboard.jsx` is an orphan.** Superseded by `platform-dashboard.jsx`, kept
  only so the bundle stays runnable. Do not port it.
- **`ENT_MODULES` and the entitlement screen use their own module ids**
  (`finance`, `hrms`…) while `MOCK.MODULES` uses another set (`fin`, `acc`,
  `hrms`…). One canonical module registry, please.
- **Mock data is illustrative.** Shapes are right; values are invented. The
  Pakistani and Nordic tax references (FBR, EOBI, PESSI, Altinn, A-melding) are
  real systems named as placeholders — verify every one before building against
  it.
- **No loading, empty or error states on the three newest screens.**
  `feedback.css` has the patterns; they were not applied to Audit, Branches or
  Agreements.

## Expect design feedback during implementation

This design has been through many review rounds, and the defects found were
almost all one shape: **one fact with two definitions.** A count computed two
ways, a predicate duplicated across files, two datasets describing the same
tenants, a label testing ids that had been renamed.

When you find the next one — and you will — the fix is to collapse the
duplication, not to correct the wrong copy. Every time that shortcut was taken
here, the same bug reappeared somewhere else within two rounds.
