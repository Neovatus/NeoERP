# NeoERP — the rules behind the screens

Read this before the README. Every screen in the bundle is an expression of the
rules below. Know the rules and you can rebuild a screen correctly from a
one-line description; know only the screens and you will implement the pixels
and break a rule on the first change request.

Each rule states **what** and **why**. The why matters more — it is what tells
you whether a future request is a variation or a violation.

---

## The two sides

**Neovatus** is us: the platform operator. Super Admin is our console.
**The tenant** is a customer company: an owner, managers, staff.

Almost every rule here exists to keep those two sides from blurring. A tenant
must never be able to do something that changes what they are paying for; we must
never do something to a tenant's data that leaves no trace.

---

## §1 — Nobody signs up

There is no self-registration anywhere in the ERP.

- **Companies** are enrolled by Super Admin only.
- **The first owner** is invited by Super Admin during enrollment.
- **Everyone after that** is invited by their own company's admin.
- **Branches** are requested by the owner and created by Super Admin (§6).

*Why:* an ERP tenant is a contract, not an account. A signup form implies
someone can create a company without an agreement existing, and then you have a
tenant nobody sold anything to. The storefront (out of scope here) is the only
place self-signup ever appears, and that is a customer, not a staff account.

**Consequence for the build:** there is no registration page, no "create
account" link, and Keycloak's registration must be disabled at realm level.

## §2 — Agreements, not plans

There are no tiers. No Standard/Pro/Enterprise, and no presets pretending
otherwise. Each company has an **agreement** with a reference, term, start, end,
renewal mode, a set of modules and a set of limits.

*Why:* tiers are a pricing artifact. The moment the product knows about tiers,
every entitlement question becomes "which tier is this in" instead of "what did
we agree", and the first customer who negotiates something off-menu breaks the
model. An earlier version had *Single site / Multi-branch / Group* presets — that
was a tier ladder wearing a different hat, and it was removed.

**Consequence:** never introduce a `plan` field. Module access is a list on the
agreement. Limits are numbers on the agreement.

## §3 — The entitlement chain

What a user can actually reach resolves through four levels, top down:

1. **Agreement ceiling** — is this module in the agreement at all?
2. **Company default** — of what is entitled, what is on by default?
3. **Branch override** — `inherit` / `on` / `off`, per branch.
4. **Feature override** — the same three-way, per feature within a module.

`inherit` is the default at every level and is the value that should exist in
the data 95% of the time. An override is a deviation and should look like one.

*Why:* branches differ. A franchise doesn't run the group's payroll; a warehouse
site has no point of sale. Without per-branch resolution the only options are
"everyone gets it" or "nobody does", and the customer ends up buying modules for
sites that will never open them.

**Consequence:** store overrides sparsely (`{branchId: 'on'|'off'}`), never
materialise a full matrix, and always show the *resolved* effect next to the
override control — the operator needs to see the answer, not compute it.

## §4 — The ceiling is soft, but it remembers

Super Admin **can** switch on a module outside the agreement. It is not blocked.
But doing so:

- requires a **reason** (≥ 6 characters) **and an amendment reference**;
- turns the confirmation notice red and the button into *Extend agreement & apply*;
- badges the module **Outside agreement** until renewal absorbs it;
- shows in the entitlement summary as a separate red `+1` extension count.

*Why:* we hold the agreement, so a hard wall is theatre — the operator would just
amend the agreement and come straight back, having learned nothing and recorded
nothing. Letting the change through while making the debt visible is both faster
and more honest. What must never happen is the screen saying "5 of 5, all within
contract" at the moment that stopped being true.

**Consequence:** presentation keys off actual state (`on`), and the
outside-agreement condition is a separate, additional signal. Conflating them
makes an enabled extension look disabled.

## §5 — Every entitlement change is a contract event

No entitlement, limit or module change applies without passing a **reason gate**:
a modal requiring a written reason, with an optional amendment reference (required
for extensions, §4). Both are written to the audit log with actor and timestamp.

*Why:* six months later the only question that matters is *who agreed to this*,
and a toggle cannot answer it. This is also the difference between a renewal
conversation you can defend and one you cannot.

## §6 — Branches are requested, then granted

The company owner **requests** a branch. Super Admin creates it. The owner cannot
create one directly.

The owner *can* **activate and deactivate** existing branches freely.

*Why:* a branch consumes an agreement limit and may change what is billed, so
creation is a commercial event. Day-to-day operation is not — making an owner
file a ticket to close a shop for renovation is the kind of friction that makes
people stop using the system.

**Consequence:** two different verbs, two different owners. See §9.

## §7 — Books belong to companies (revised 2026-10-06, Accounts A0)

Every branch posts into the books of its owning company and carries a branch
tag; branch P&L comes from the tag. A franchise is a separate company with its
own Owner, sign-in and books. Its franchisor relationship may allow reporting
consolidation. Consolidation and commercial billing never give one company
access to another company's ledger.

When something new is requested, the choice is shown as two cards that spell
out the consequences, not a dropdown:

| Company-owned branch | Franchise (a new company) |
|---|---|
| Posts to the company's books, tagged with the branch | Its own books and P&L |
| Rolls into the company's P&L | Its own owner with their own sign-in |
| Managed by your staff | Can be invoiced directly by Neovatus |
| No separate invoice | Can hold its own agreement |

*Why:* this decides where the money lands and is very hard to change once
trading starts. A site that needs separate books is created as a company, never
as a branch.

**Three separate decisions on a franchise, deliberately not inferred from each other:**

- `company_type` — owned / franchise (a franchise always has its own books)
- `consolidates_into_parent` — a reporting flag only: the group sees the
  franchise's figures added in
- `billing_mode` — own account / billed to group

**The consolidation rule, which Accounts must honour:** the group sees a
franchise's numbers consolidated; the franchise sees only its own, never the
group's.

## §8 — A franchise can hold its own agreement

Three arrangements, all supported:

1. **Covered by the group** — inherits the group's agreement and its expiry.
2. **Group agreement + addendum** — an extension scoped to that branch for
   modules the group hasn't bought, billed to the franchisee's sub-account. The
   group still holds the contract.
3. **Its own agreement** — its own reference, term and expiry, entitled by its
   own contract.

*Why:* a franchisee is a separate business. Forcing them onto the group's paper
means either the group buys modules it doesn't want, or the franchisee can't have
what it needs.

**Consequence — the one that bites:** when a branch holds its own agreement,
**two agreements expire on different days**. Never show one and imply the other.
Branch detail shows the franchise's countdown *and* names the group's separate
expiry. Always resolve via `agreementForBranch()`; never `.find()` your way to a
contract.

## §9 — Deactivate ≠ suspend

Two words, on purpose:

- **Deactivate** — operational, owner-initiated, reversible by the owner. The
  shop is shut for renovation.
- **Suspend** — commercial, Neovatus-initiated, only we can lift it.
  Non-payment or a compliance hold.

*Why:* one button for both is how a paying customer's shop gets switched off by
accident, or how a non-paying one gets switched back on by their own admin.

## §10 — Limits are hard, and unlimited is explicit

The tenant is **blocked at the limit** and must raise a request. They are never
silently allowed past it and billed for an overage.

`0` in the data means unlimited, but the UI **never** expresses it that way — there
is an explicit **Unlimited** checkbox, and the input shows `∞` when checked.

*Why:* overage billing means a customer discovers the limit on an invoice. A hard
block means they discover it at the moment they cross it, when they can do
something about it. And zero-means-infinity is a convention that eventually locks
someone out of their own system.

## §11 — Agreement expiry must be impossible to miss

- **Super Admin** — a dashboard panel listing every agreement, company and
  franchise together, soonest first.
- **The tenant** — a prominent banner inside 30 days, plus a full countdown card
  on their own screen.
- **Everywhere else** — a status chip with days remaining.

The org-service computes this once, per agreement, and every surface reads the
same three fields off the record — `state`, `daysRemaining`, `percentElapsed` —
never recomputes them from `startsOn`/`endsOn`. Five states, the backend's own
names: `ACTIVE` · `RENEWAL` (90d) · `SOON` (30d) · `CRITICAL` (7d) · `EXPIRED`.
Shown to a person as Active · Renewal window · Expiring soon · Expires this
week · Expired.

*Why:* a table chip, a countdown card and the dashboard queue must never
disagree about whether something is "expiring" — an expired agreement is a
service interruption for the customer and a revenue hole for us, and the
failure mode is not "nobody was told", it is "three screens said three
things".

## §12 — Password resets belong to the company admin

The company admin resets their own users. Super Admin **can**, but it is framed
as support-on-request, is reason-gated, and is logged.

*Why:* if we routinely reset tenant users' passwords, we become their help desk
and the tenant never learns their own tools. But refusing outright means a locked
-out sole owner has nobody to call.

## §13 — Impersonation is visible, reasoned and logged

Super Admin can enter any company or branch, as read-only or with full access.

- **A reason is required** before entering.
- **A banner is always visible** while active — fixed, non-dismissable, stating
  who you are acting as and why, with a live timer and an always-present Exit.
- **Every action is double-logged**: once as the acting user, once as you.
- Entry points are on the company and branch pages, **visible only to Super
  Admin** — never in the tenant's own chrome.

*Why:* the ability to act as a customer is the most dangerous permission in the
platform. It cannot be ambient. The banner exists so you can never forget you are
inside someone else's company, and the double log exists so the tenant can always
tell what was them and what was us.

## §14 — Environment switching lives in Settings

Dev / staging / production, switchable from Settings, with a persistent topbar
indicator whenever you are not in production.

*Why:* it is a development-phase tool, not daily furniture. In the topbar it is
one mis-click from a real tenant's production data.

## §15 — Requests are one inbox

Branch creation, limit increases, module additions, user resets — all one queue,
one detail panel, one approve/decline with reason.

*Why:* four inboxes means three of them go unread.

---

## Design rules

Not domain rules, but they will affect the port.

- **Tokens are authoritative.** `neoerp-tokens.json` → `styles.css` custom
  properties → components. Never hardcode a colour. Five values are AA
  corrections; reverting them reintroduces a documented failure.
- **Shared classes live in the stylesheet.** A class used by more than one
  component must be in `styles.css`. Declared inside a component's `<style>`
  block, it exists only while that component is mounted — which produced real
  unstyled-heading bugs in this build.
- **Never split a foreground from its background.** If a selected state sets
  `background`, it sets `color` in the same rule. Splitting them across rules of
  different specificity produced an invisible white-on-white icon here.
- **Resolve, don't guess.** Use `agreementFor()`, `agreementForBranch()`,
  `branchRecord()`, `allAgreements()`. When a record genuinely doesn't exist,
  show an empty state — a wrong owner and contract reference is worse than a blank.
- **Every `<td>` needs a `data-label`** for the sub-720px card reflow;
  `data-label=""` on action cells; first-column identity cells suppress theirs
  and become the card heading.
- **44px touch floor** below 720px, regardless of density setting.
- **Explain consequential choices inline.** Where a control commits the user to
  something costly to reverse — branch type, deactivate vs suspend, unlimited —
  the consequences are written next to it, not in documentation.
