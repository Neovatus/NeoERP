> **DEPRECATED (2026-11-20) — history only. Do not use for planning or state. The current state is [PROJECT-STATE.md](PROJECT-STATE.md).**

# NeoERP — project state

> **Proposal from Claude.** Codex is producing `PROJECT-STATE.codex.md` against the
> same outline. Merge into `PROJECT-STATE.md`, then archive both.
> An exclusion list — what I read and deliberately left out — is at the end.

**The one document to read after the repo guide for whichever root you are in.**

Rules live in the repo guides. Decisions live in ADRs. Working notes live in
`docs/agents/<slug>/`. **State lives here, and only here.**

Last verified against the running system: 2026-09-06.

---

## 1. What is being built

A multi-tenant ERP for Neovatus. Markets in rollout order: **Pakistan → Norway →
Sweden → Nordics**.

Two surfaces are in flight. Tenant dashboards (Company Owner, Manager, Sales,
Employee) and the customer storefront are deliberately out of scope.

| Surface | Status |
|---|---|
| Authentication | **Done** — Keycloak-hosted, 13 screens, custom login theme |
| Platform Admin (Super Admin) | **Backend 2 of 8 steps. No screens yet.** |

## 2. Where things live

```
NeoERP/
├── NeoERP-App/       Kotlin Multiplatform + Compose — desktop, tablet, mobile
├── NeoERP-BackEnd/   Kotlin + Spring Boot, 8 services
└── NeoERP-Design/    design source of truth — read in place, never re-uploaded
```

`NeoERP-Design/RULES.md` is **the domain model**, not UI guidance. §3 (entitlement
chain), §7 (financial flags) and §8 (franchise agreements) are schema decisions.
`BACKEND-FEEDBACK.md` is feedback flowing back the other way.

## 3. Settled decisions

Do not relitigate without reading the source.

| Decision | Source | One line |
|---|---|---|
| Keycloak is the IdP, auth-service brokers it | ADR-002 | The app never sees credentials |
| **`authorization_code + PKCE` for frontend auth** | AGENTS.md §8 | The password endpoint still exists for local identities — see §7 and §8 |
| A franchise is a **company**, never a branch | ADR-013, ADR-015 | Own ledger, own tenant boundary, may hold its own agreement |
| Agreements are held by **companies** | ADR-015 | No polymorphic holder; addenda scope to a child company |
| Company-scoped roles | ADR-014 | A tenant role may never shadow a platform role |
| **No plan tiers, ever** | RULES §2 | Modules are a list on the agreement; limits are numbers |
| Platform capabilities ≠ commercial modules | V12 | `CORE`/`ORG`/`IAM` unconditional. `FINANCE` (not `ACCOUNTS`) / `HRMS` / `PAYROLL` are sold |
| Unlimited is **NULL**, never 0 | V11 | Zero-means-infinity locks people out |
| `ROLE_SUPER_ADMIN` only from user-service | AGENTS.md §8 | Never a token claim — that comes from a Keycloak realm role |
| **No per-module seats** | BACKEND-FEEDBACK | One user limit, company-level, whatever role |
| Limits carry a **scope** | V14 | `COMPANY` = shared total (sub-allocate down only). `PER_BRANCH` = allowance each. `USERS`/`BRANCHES` are COMPANY-only |
| Tenant isolation is a sealed capability | ADR-012 | `CompanyTenantScope` unforgeable at bytecode level |

## 4. Current state

### Backend — 310 tests, 0 failures across 8 services

**Complete and verified against a running system:**

- **Auth** — brokered Keycloak login, identity claims correct, refresh tokens for public clients, platform super-admin grant/revoke/list with a last-admin guard.
- **Agreements** — create, renew (supersedes), amend limits and modules mid-term, addenda. Five expiry states computed server-side. Resolution own → addendum → parent, always carrying the group's agreement so two expiry dates both reach the client.
- **Entitlement chain** — all four levels. Tri-state overrides stored sparsely (absence = inherit). `outsideAgreement` is a separate signal from `effective`, derived not stored.
- **Limits** — `USERS`, `BRANCHES`, `WAREHOUSES` with scope and branch allowances, enforced at provisioning. Blocked at the line; an existing breach is reported, never corrected.
- **Reason gate** — every entitlement and agreement change carries a reason; an amendment reference is required only when a change crosses the ceiling.

**Not built:** requests inbox, impersonation, settings/environments, entitlement
change-history API, ADR-015's `consolidates_into_parent` / `billing_mode`,
renewal-queue pagination.

**Open debt:** 126 legacy unscoped methods across 29 tenant-owned repositories
(Accounts 6, HR 14, Payroll 9); baseline is shrink-only. **org-service (5),
user-service (15), audit (3) and auth (3) repositories are unclassified** — the
architecture test covers HR/Payroll/Accounts only, so an unscoped method added to
org-service passes CI today. That includes the agreement and entitlement
repositories added this week.

### App

- **Auth** — full browser hop (desktop loopback, iOS `ASWebAuthenticationSession`, Android Custom Tabs), PKCE + state, real refresh, platform-secure storage.
- **Shell** — `NeoEnterpriseShell`, `NeoSmartSidebar` (already renames its group to "Platform Admin" on `session.platformSuperAdmin`), `NeoSmartContentArea`.
- **Design system** — ~50 composables. Missing vs `feedback.css`: offline strip, partial-failure summary, saving/pending indicator, skeletons beyond the list.
- **Feature slices** — organization, iam, dashboard, hr, payroll, accounts, ess, inbox, reports, profile.
- **Entitlement slice** — endpoints, DTOs, mapper, service, repository done. **ViewModel and UI not started.**

**No Platform Admin screen exists.** This is the gap.

## 5. What's next

1. ✅ Agreements + limits
2. ✅ Entitlement chain
3. ⏳ **Entitlements screen (Compose)** — data layer done, UI next
4. Branch model (§7 flags, §9 suspend vs deactivate) + requests inbox
5. Remaining console screens
6. Enrollment enrichment — add the agreement step; drop `password` from `OrgEnrollmentAdminDraft` (owners are invited, never given a password)
7. People screen over the existing super-admin API
8. Impersonation — alone, last, double-logged

Build what everything else reads before the screens that read it; keep the most
dangerous capability isolated at the end.

## 6. How to work here

Pointers, not copies. These are live and referenced:

| Need | Read |
|---|---|
| Backend rules, Definition of Done | `NeoERP-BackEnd/AGENTS.md` |
| Backend architecture, layering | `docs/architecture/architecture-and-standards.md` |
| Schema | `docs/database/db-design.md` + the owning service's migrations |
| API contracts | `docs/api/<service>.md` |
| App architecture | `NeoERP-App/ARCHITECTURE.md`, `docs/enterprise-architecture.md` |
| App stage pipeline | `docs/agent-stage-pipeline.md` |
| Definition of Done (app) | `docs/definition-of-done.md` |

```bash
./gradlew runAllServices          # backend + infra
./scripts/seed-demo-tenants.sh    # demo tenants — idempotent, dev-only
```

Demo tenants exercise the rules rather than looking plausible: all five agreement
states, all three franchise arrangements, a deactivated branch, a breached limit,
NULL-unlimited values. Credentials in `docs/dev-seed-users.md`.

## 7. Handoff — what a new agent needs to know

This section replaces `docs/frontend/`'s sixteen files. Read it instead of them
until they are fixed (see §8).

### Sign-in: use the browser hop

The app has **two** sign-in paths in code today:

| Path | Call | Use it? |
|---|---|---|
| **Browser hop (PKCE)** | `signInWithBrowser()` → `/oauth2/authorize` → Keycloak → `/oauth2/token` | **Yes.** This is the flow AGENTS.md §8 mandates |
| Password grant | `signInWithCredentials()` → `POST /api/auth/login` | **No, for the frontend.** The endpoint still exists and works — it backs local identities — but AGENTS.md line 123 forbids a password grant for frontend auth |

The browser hop, end to end:

1. App builds `/oauth2/authorize` with PKCE `S256` and a `state`
2. Opens it in a **system browser** — desktop loopback, iOS `ASWebAuthenticationSession`, Android Custom Tabs. Never a WebView (RFC 8252 §8.12)
3. auth-service brokers to Keycloak; the user signs in on the themed Keycloak page
4. Redirect returns to `com.neovatus.neoerp.app://auth/callback` (or the desktop loopback)
5. App verifies `state`, exchanges the code with `code_verifier`
6. `GET /api/app/bootstrap` → profile, memberships, permissions, `platformSuperAdmin`, `selectedCompanyModules`
7. Build navigation from bootstrap; refresh before expiry; `POST /api/auth/logout` to end

### Authorization rules the frontend must respect

- **Frontend visibility is never a security control.** The backend re-checks everything.
- `platformSuperAdmin` comes from `bootstrap`, resolved from `iam.platform_role_assignments`. Never infer it from a token claim.
- `selectedCompanyModules` returns **commercial** modules only (`FINANCE`, `HRMS`, `PAYROLL`). `CORE`/`ORG`/`IAM` are unconditional and absent by design — do not hide the app shell because they are missing.

### Entitlement contract, for the console

- `effective` drives the switch; `outsideAgreement` drives the badge. **Never conflate them** — an extension is enabled, and treating the two as one makes it look disabled.
- Overrides are three-state. `enabled: null` means inherit and deletes the row.
- The summary reads `inAgreementCount` **plus** a separate `extensionCount`. Never a total exceeding `entitledCount`.
- Ask for an amendment reference **only** when a change takes a module beyond the ceiling. A reason is always required; an amendment is not.
- Load the entitlements screen from `GET /companies/{id}/entitlements/branches` — one call for the company and every branch.

## 8. Contradictions found while writing this — resolve before trusting the docs

**The frontend handoff pile is misleading.** `docs/frontend/` holds 16 files
(5,225 lines) with **three competing "start here" documents**, and **twelve of the
sixteen present `POST /api/auth/login` as the way to sign in.**

That is not a dead endpoint — it exists and works. But AGENTS.md line 123 forbids
a password grant for frontend flows, and the browser hop is what this session
built and verified. So code, docs and rules disagree three ways, and
`frontend-final-handoff.md` — which calls itself *"the single file to give
frontend agents first"* — is on the wrong side of it.

**The open question underneath:** should `signInWithCredentials` remain in the app
at all? If it is legacy, remove it and the docs follow. If it is deliberate (an
offline or local-identity fallback), say so somewhere, because right now every
document implies it is the primary path.

Also unresolved:

- **`v1-done-criteria.md` gates Accounts behind a v1 lock** that has already been crossed — accounts-service ships and `FINANCE` is sellable.
- **`master-roadmap.md`'s "Current Recommended Focus"** is Phases 1–3, all long delivered.
- **Auth screens assume realm-per-tenant**; we built a single realm. Workspace Entry copy needs a pass.
- **Account Locked screen** shows failed-attempt count and IP, conflicting with the anti-enumeration rule in the same document.

## 9. Traps this project has already hit

Every item below cost real time.

- **Green tests prove less than you think.** Every cross-service client is stubbed; a module-code rename drifted between org-service and three consumers with 299 tests passing.
- **Super admin short-circuits module checks.** Manual testing as `superadmin` will not reveal a broken tenant path. Test as `org.admin` too.
- **A test that injects an authority proves nothing.** `.authorities(SimpleGrantedAuthority("ROLE_SUPER_ADMIN"))` fabricates what production never produced — that is how twelve dead authorization checks shipped.
- **An in-memory repository must enforce what the schema enforces**, or it validates nothing.
- **Unit tests bypass DTO mapping.** A field silently dropped by a mapper is invisible until an HTTP round-trip.
- **Kotlin block comments nest.** `/api/admin/**` in a KDoc breaks the build.
- **`docker exec` needs `-i`** for heredoc SQL, or nothing runs and nothing complains.

---

## Exclusion list — read and deliberately left out

So the merge can tell a considered omission from an oversight.

| Excluded | Why |
|---|---|
| `agent-stage-pipeline.md` (621 lines, 8 refs), `enterprise-architecture.md` (6 refs), `definition-of-done.md` (4 refs), `v1-architecture.md` (3 refs), `folder-structure.md`, `review-checklist.md`, `toolchain-constraints.md`, `architect-checklist.md`, `agent-hierarchy.md`, `agent-ownership.md` | **Rules, not state.** Live and referenced. Folding them in produces an 800-line file nobody reads. Linked from §6 instead |
| All 15 ADRs | **Decisions, not state.** Append-only by design. Summarised in §3 with pointers |
| `sprint-1,3,4,5,6,7,8-board.md` | **History, not state.** Zero references. Recommend `docs/archive/` |
| `master-roadmap.md`, `parallel-delivery-plan.md`, `delivery-pipeline.md`, `v1-module-scope.md`, `v1-done-criteria.md` | Zero references, mostly March, and their "current focus" is long delivered. The live parts — delivery principles, the v1 gate — are contradicted by shipped reality (§7). Recommend archive **after** someone confirms the v1 gate is intentionally abandoned |
| 16 files in `docs/frontend/` | **Superseded by §7**, which carries the correct flow. They are not summarised because twelve of them teach a flow the frontend should not use; merging them would propagate the error. They need deleting or rewriting against §7 |
| `docs/agents/<slug>/` in both repos (15 folders) | **Per-task working notes.** Correctly scoped and short-lived |
| `docs/api/*.md`, `db-design.md`, `SRS.md` | Reference material. Pointed at, not duplicated |
| `.docx` files in `NeoERP-App/docs/` | Binary; not read |
| `NeoERP-Design/*` | Design source of truth, owned by the designer. Pointed at in §2 |

**Recommended actions beyond this document**, in priority order:

1. **Fix or delete `docs/frontend/`.** Twelve documents present a flow the frontend should not use. Decide first whether `signInWithCredentials` stays in the app (§8) — the answer determines whether those docs are wrong or merely out of date.
2. Archive the seven sprint boards and five unreferenced planning docs to `docs/archive/` with a README saying `PROJECT-STATE.md` is current. Move, do not delete — they are the record of how the project got here.
3. Write the placement rule into both repo guides: **state → `PROJECT-STATE.md`; rules → the repo guide or a doc it links; decisions → an ADR; working notes → `docs/agents/<slug>/`.** Without it the pile regrows.
4. Classify org-service, user-service, audit and auth repositories in `architecture-tests`, so tenant-scope violations there stop passing CI.
