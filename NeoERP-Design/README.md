> **Where design lives (Jabran, 2026-10-15):** this folder holds the domain rules (`RULES.md`), flows, the design tokens and the design-system pages. **All screens and module design live in `NeoERP-App/docs/design/`** (`screen-rig/`, `specs/`). The old screen copies and `_prototype/` were removed; git history keeps them.

# NeoERP — Design

The design source of truth for **NeoERP**, a multi-tenant Enterprise ERP built by
**Neovatus**. Everything a frontend or backend developer needs to build what has
been designed so far, and to understand why it is shaped the way it is.

Markets, in rollout order: **Pakistan → Norway → Sweden → Nordics.**

---

## Read in this order

| # | Read | Who it is for | Time |
|---|---|---|---|
| 0 | **`IMPLEMENTATION-READINESS.md`** | Whoever is starting the build | 5 min |
| 1 | **`RULES.md`** (this folder) | **Everyone. Non-optional.** | 15 min |
| 2 | **`FLOWS.md`** + `flows.json` | Frontend, backend, agents | 20 min |
| 3 | `00-design-system/README.md` | Frontend, designers | 10 min |
| 4 | `01-auth/README.md` | Frontend, backend, DevOps | 20 min |
| 5 | `02-platform-admin/README.md` | Frontend, backend | 25 min |

**`RULES.md` is the most important file in this bundle.** It is the ~20 domain
rules the screens express, each with the reason behind it. A developer who knows
the rules can rebuild any screen correctly from a one-line description. A
developer who only has the screens will implement the pixels faithfully and break
a rule on the first change request — because nothing on screen tells you *why*
branch creation is a request rather than a button.

Backend engineers: `RULES.md` is effectively the domain model. §3 (entitlement
chain), §7 (three independent financial flags) and §8 (a franchise can hold its
own agreement) are schema decisions, not UI decisions.

---

## Structure

```
NeoERP-Design/
├── README.md                  ← you are here
├── RULES.md                   ← the domain rules. Read first.
├── IMPLEMENTATION-READINESS.md ← what is proven, what is not, where to start
├── FLOWS.md                   ← every flow as a state machine
├── flows.json                 ← the same, machine-readable, for agents
│
├── 00-design-system/          Tokens, CSS, icons, spec pages
│   ├── README.md
│   ├── neoerp-tokens.json     ← authoritative source of every design value
│   ├── styles.css             ← tokens as CSS custom properties + components
│   ├── feedback.css           ← skeletons, empty, offline, error states
│   ├── icons.jsx              ← 43-glyph icon set
│   ├── NeoERP Design System.html        ← the spec page
│   ├── NeoERP Component Library.html    ← every component, every state
│   ├── NeoERP Responsive Showcase.html  ← breakpoint behaviour
│   ├── NeoERP Token Audit - Response.html  ← the AA contrast reconciliation
│
├── 01-auth/                   Authentication — 13 screens, Keycloak-backed
│   ├── README.md
│   ├── auth.jsx
│   ├── auth-keycloak.jsx
│
├── 02-platform-admin/         Super Admin — the Neovatus console
│   ├── README.md
│   ├── *.jsx                  16 files
│
└── _prototype/                Runnable. Everything in one flat folder.
    └── NeoERP Super Admin.html
```

Group folders hold **canonical copies for reading**. `_prototype/` holds a
**complete runnable set** — the same files, flattened, because the prototype
loads them as siblings.

### Running the prototype

```
cd _prototype && python3 -m http.server 8000
```

Open `http://localhost:8000/NeoERP Super Admin.html`. **`file://` will not
work** — the Babel-transformed scripts are blocked by CORS.

Use the **Tweaks panel** (right edge) to jump to any screen and to toggle theme,
density and environment. Every screen in every screenshot is reachable from it.

---

## What is designed, and what is not

**Complete and ready to build:**

- Authentication — 13 screens, including the Keycloak required actions most
  projects forget until integration week (invite acceptance, forced rotation,
  email verification, brute-force lockout, page expiry).
- Super Admin — 19 screens: dashboard, audit log, companies, enrollment,
  entitlements, branches, branch detail, agreements, requests, people,
  impersonation, settings.
- The design system — tokens, components, responsive behaviour, accessibility.

**Designed as a contract, not fully built:** tenant first-run
(`firstrun.jsx`) — what the company owner sees on day one. Included because it
defines the handover between our side and theirs.

**Not started, deliberately:**

- Company Owner dashboard
- Role-based dashboards — Manager, Sales Person, Employee
- The functional modules themselves — Finance, HRMS, Payroll, Inventory, Sales
- Customer-facing storefront and its self-signup

The rules in `RULES.md` already constrain those, particularly §3, §7 and §13.
Read them before designing or building any of the above.

---

## About these files

They are **design references created in HTML** — prototypes showing intended
look and behaviour, **not production code to copy**. React 18 with in-browser
Babel and components on the global scope: a fast way to build a design artifact,
a poor way to ship software.

Recreate them in your target environment using its established patterns. Two
constraints survive whatever stack you pick:

1. **The 11 Keycloak-served auth screens must be a Keycloak login theme** —
   FreeMarker templates plus a stylesheet. Keycloak owns those URLs, form
   actions, CSRF tokens and error states. Rendering them inside your SPA is a
   known dead end. `01-auth/README.md` names the `.ftl` template for each screen.
2. **`styles.css` is reusable as-is**, including inside that Keycloak theme. Its
   custom properties map 1:1 to `neoerp-tokens.json`. Port it rather than
   re-deriving values from screenshots.

**Fidelity: high.** Final colours, typography, spacing, geometry, motion and
interaction states, on a token file already reconciled against a parallel
Kotlin/Compose implementation — including a WCAG AA contrast pass that corrected
five colour values.

---

## There are no screenshots, on purpose

They were removed. A PNG captures one width and one moment; it cannot express a
guard, a transition, a disabled state or a validation rule — which is most of
what this design is. They also went stale the moment a screen changed, and they
misrepresented the responsive behaviour by only ever showing tablet width.

What replaced them:

- **`FLOWS.md`** — every flow as a state machine, with the guards written out.
- **`flows.json`** — the same content structured for an agent: screens, routes,
  params, states, transitions, guards, shared predicates, rule references.
- **The prototype** — run it and use the Tweaks panel to reach any screen in any
  state, at any theme, density and environment. More accurate than any capture.

## On Figma

Honest answer: **these PNGs are near-useless in Figma.** They import as flat
images — not layers, not components, not editable. If a Figma library is wanted,
there are two real paths:

1. **Tokens via the Tokens Studio plugin.** `neoerp-tokens.json` is already in
   Tokens Studio format. It imports directly and produces real Figma variables
   and styles — colour, type, spacing, radius, the lot. This is the high-value
   step and takes minutes.
2. **Components by hand, from the Component Library page.** Roughly a day's work
   for someone who knows Figma. Worth it only if design continues in Figma.

If the team is building straight to code — which this bundle supports — **skip
Figma entirely.** `styles.css` plus the token file is a stronger contract than a
Figma file, because it cannot drift from what ships. A Figma library that nobody
regenerates becomes wrong within a month, and then two sources of truth disagree.
That exact drift was caught and fixed once already in this project; the audit is
in `00-design-system/`.

---

## Conventions that will bite if ignored

Each is in `RULES.md` with its reasoning. Listed here because they cause bugs,
not debates.

- **Tokens are authoritative.** Never hardcode a colour.
- **A class used by more than one component belongs in `styles.css`** — inside a
  component's local styles it exists only while that component is mounted.
- **Never split a foreground from its background.** A rule that sets `background`
  sets `color` too.
- **Resolve, don't guess.** Use `agreementFor()`, `agreementForBranch()`,
  `branchRecord()`. Show an empty state when a record is missing — a wrong
  contract reference on screen is worse than a blank.
- **Every `<td>` needs a `data-label`** for the sub-720px card reflow.
- **44px minimum touch target** below 720px, whatever the density setting.
- **`prefers-reduced-motion` is mandatory**, not a nicety.
