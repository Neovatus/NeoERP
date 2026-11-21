# ARCH-1 step 1: architecture gap map

Researcher A, 2026-11-21. Brief: `docs/agents/arch1/brief.md` (with the two extra requests from the lead the same day:
topic 9, the loyalty/cashback case, the apps section under topic 4, and local-first stores under topic 5). Research and writing only. Nothing here is
decided; every "Recommend" waits for Jabran. Jabran's decisions of 2026-11-21 listed in the brief (one deployment per
region, company column + RLS, POS daily summaries, exactly-once posting through an outbox, public API later behind a
platform ADR, quality bar not lowered, all bases from the start, GitHub Actions off) are treated as fixed.

## How to read this

Path prefixes: **BE** = `NeoERP/NeoERP-BackEnd/`, **App** = `NeoERP/NeoERP-App/`, **WS** = the workspace repo (this
worktree). Line numbers are from the checkouts read on 2026-11-21 (BE and App working trees as they stood; WS at
`phase/4-b2-arch1`). `drafts/` means `WS/docs/drafts/`. Web facts carry a link and the date read (all 2026-11-21).

Status words per topic:

| Word | Meaning |
|---|---|
| **Decided** | An accepted ADR or an approved decision says how; line cited. |
| **Partly** | Some of it is decided; the missing part is named. |
| **Missing** | Nothing written down, or only a one-line gate. |
| **Conflict** | Two documents say different things. |

ADR status as found (it matters for several conflicts below):

| ADR | Status in its file | Note |
|---|---|---|
| 001–006, 012–016, 018–021 | Accepted | ADR-004 and ADR-002 carry later amendments |
| 007, 008, 009, 010, 011 | **Proposed** (BE `docs/adr/ADR-007…:5`, `ADR-008…:5`, `ADR-009…:5`, `ADR-010…:5`, `ADR-011…:5`) | ADR-011 is already implemented in the App (web targets removed, App `ARCHITECTURE.md:56`) |
| 017 | **Does not exist** | Referenced as the cross-company write capability (BE `docs/adr/ADR-018…:95`, `:128`; BE `docs/api/accounts-decisions-for-jabran.md:127`; BE `docs/api/accounts-roadmap.md:155`) |
| 022, 023 | Proposed (BE `docs/adr/ADR-022…:5`, `ADR-023…:5`) | ADR-022 stage 1 before 4.17; ADR-023 at the start of Phase 5b (`drafts/accounts-roadmap.md:21-23`) |
| 024 | File says **Draft, not accepted** (`drafts/ADR-024-data-at-scale.md:4`) | Accepted by Jabran 2026-11-21 (`WS/PROJECT-STATE.md:33`; `drafts/accounts-roadmap.md` decision 3) |
| 025 | Accepted (`drafts/ADR-025-realtime-notifications.md:4`) | Still in `drafts/` |
| 026 | Accepted (`drafts/ADR-026-row-level-security.md:4`) | Still in `drafts/` |

## 1. Database for many companies

### What is decided

| Part | Decision | Source |
|---|---|---|
| Physical layout | One Postgres instance, one database per service | BE `docs/adr/ADR-001-db-per-service.md:13`; BE `docs/database/db-design.md:8` |
| Per region | One managed Postgres primary (all service databases) + HA standby + PITR; grow by scale-up → replica → pooler → separate reporting instance | `drafts/ADR-024-data-at-scale.md:70` (D13) |
| Tenant boundary | The company; branch is a filter inside it; a franchise is its own company | BE `docs/adr/ADR-013…:29-34`, `:50-51` |
| Shared tables | Company column on every company-bound row; every tenant repository method takes `CompanyTenantScope` first; architecture test | BE `docs/adr/ADR-012…:101-122`, `:162-187` |
| Second wall | RLS on accounts now, payroll/hr from their rebuild, reporting store, every later business service from its first migration; one company per transaction | `drafts/ADR-026-row-level-security.md:87` (M1), `:204` (D4) |
| Roles | Flyway as a non-superuser owner, service as a runtime role that owns nothing, separate backup role | `drafts/ADR-026…:125-130`; BE `docs/operations/hosting-and-go-live-requirements.md:27` (P-5) |
| Regions | One EU/EEA region for the Nordics; Pakistan separate; each region its own databases, buckets, keys, backups; no cross-region replication | hosting `:11` (H-1), `:15` (H-5), `:16` (H-6); BE `docs/adr/ADR-020-file-store.md:156-160` |
| Scale steps | Measure → indexes/keyset → pooler → read replica → partition by year; not by company | `drafts/ADR-024…:57-70` (D1–D13) |
| Dedicated database for one customer | "Not now" (Q7); listed as Stage 2 step L7 "only on a measured trigger" | `drafts/ADR-024…:106`, `:87` |

### What is missing

1. **The dedicated-database option has no design.** ADR-024 names it (L7) but not how. A large or regulated customer
   will ask "can we have our own database?". The pieces it needs, none written:
   - **Cell model.** A "cell" = one full set of service databases (and buckets) on its own Postgres server, for one
     customer or a group. The shared deployment is cell 0 of the region. Each company row in org-service records its
     cell; the gateway (or each service's datasource router) picks the cell from the trusted company, never from the
     request. ADR-012's `CompanyTenantScope` already carries the company, so routing can hang off it.
   - **What stays shared.** auth-service, Keycloak, user-service (memberships span companies, ADR-013 `:54-57`) and
     org-service (agreements, entitlements) stay in cell 0; only business services (accounts, hr, payroll, inventory,
     sales, reporting, audit rows of that company) move. Otherwise one person in two cells needs two sign-ins.
   - **Migrations across many databases.** Each service already owns its Flyway history (ADR-001 `:29`). With N cells a
     release runs each service's migrations N times. Needed: one release orchestrator that migrates cell by cell, stops
     on the first failure, and a rule that every migration is expand/contract so old and new code run side by side while
     cells are at different versions (today's rule "additive and safe for ordered rollout", BE
     `docs/architecture/architecture-and-standards.md:237`, is not enough: ACC-R10 already needed a recreate deploy,
     hosting `:79`).
   - **Moving a company between cells** (shared → dedicated) needs an export/import per service with company-bound
     rows; the company column and RLS make the extract a `WHERE company_id = …` per table, but sequences, file objects
     (ADR-020 keys are per service per region, `ADR-020:80`) and outbox/inbox state must move with it. Not designed.
   - **Cost to operate.** Each cell adds a Postgres server (+ standby + PITR storage), monitoring, a migration run per
     release and a restore test. Researcher B's `capacity-model.md` prices it; this map only notes that the cost is
     per cell, not per customer row, so the price list needs a "dedicated" tier.
2. **Iceland and Pakistan residency are not met by "one region each".** Iceland: records stored in Iceland (abroad at
   most six months) until a new act (hosting `:12` H-2, `:91` ACC-R21, `:110`). Pakistan: whether records hosted
   abroad satisfy the keep-in-Pakistan duty is open (hosting `:93` ACC-R24, `:112`). So the "EU/EEA region for the
   Nordics" does not cover IS, and a PK region must be in Pakistan unless the legal opinion says otherwise. Iceland is
   the first real case for a small "in-country copy" or a separate cell; nothing decides which.
3. **Platform services under RLS.** ADR-026 leaves org, user and auth on application checks (`drafts/ADR-026…:9`). With
   cells that is fine (they stay shared). Without cells it is the accepted design.

### Conflicts

- `WS/docs/large-customer-roadmap.md:39` plans "partitioning by company and year"; ADR-024 D7 rejects partitioning by
  company (`drafts/ADR-024…:64`, `:95`).
- ADR-001 `:15-27` and db-design `:10-18` list only today's eight databases (with hr and payroll v1, which the rebuild
  deletes, `WS/PROJECT-STATE.md:26`); ADR-023 (reporting-service) and ADR-025 (notification-service) add databases.
  Stale, not contradictory.

### Recommendation

**New ADR-027 "Tenancy cells and dedicated databases"** (or an ADR-024 amendment if Jabran prefers fewer files): cell
model, what stays shared, routing from the trusted company, release orchestration across cells, expand/contract
migration rule, company move procedure, trigger (customer contract, regulation, or ADR-024 measured load), and the
Iceland copy question.

## 2. Groups spanning regions

### What is decided

| Part | Decision | Source |
|---|---|---|
| Regions do not talk | No cross-region query, replication or BI feed | BE `docs/adr/ADR-023-reporting-layer.md:127` (D12); ADR-020 `:160`; hosting `:15` |
| Assumption | "One customer group lives in one region, so group reports never cross regions" | ADR-023 `:127` |
| Group view | Needs its own audited group-scope capability, never a relaxed `CompanyTenantScope` | ADR-013 `:62-65`; ADR-015 `:133-135` |
| Consolidation | Accounts owns it, later (Phase 7); reporting supplies per-company facts | ADR-023 `:129-131`; `drafts/accounts-roadmap.md:185-192` |
| One person | One identity, one `sub` across companies | BE `docs/adr/ADR-016…:173-179`; ADR-013 `:57-58` |
| RLS | One company per transaction; group views loop per company | `drafts/ADR-026…:204`, `:219` |

### What is missing

Jabran's example (a group with Norwegian and Pakistani companies) breaks ADR-023's assumption. Nothing answers:

1. **Sign-in.** Each region runs its own auth-service and Keycloak (implied by H-5: own databases, keys). A person who
   works for both the NO and the PK company would have two identities and two sign-ins, and ID-1's "one person id"
   holds only inside a region.
2. **Membership and the context switcher.** user-service memberships live in one region; the app's company switcher
   (App `ARCHITECTURE.md:76-96`) reads one bootstrap.
3. **Group views and consolidation.** A consolidated TB needs at least each company's period balances. Whether
   aggregated balances (no personal data) may leave Pakistan is part of the open ACC-R24 question (hosting `:93`).
4. **Group catalogue, inter-company transfers.** Inventory's group catalogue and inter-company transfers assume one
   database set (`drafts/items-inventory-scope.md:670-674`); cross-border pairs are already "later" (S3c-1x).

Options for the ADR (to decide, not decided):

| Option | How | Pro | Con |
|---|---|---|---|
| A. Home region per group | The whole group lives in one region (ADR-023 as written) | Nothing new | Fails PK residency if PK records must stay in PK; fails IS |
| B. Global identity, regional data | One small identity and directory tier (people, sign-in, which company lives in which region), no business data; each region keeps memberships and data; the app holds one token per region and merges contexts | One sign-in; data stays put | New cross-region trust (token audience per region), more app work |
| C. Two separate tenants, linked | Separate sign-ins; the group links them; consolidation by importing each company's TB (file or audited API) | Simplest, residency clean | Two sign-ins; consolidation not live |

### Conflicts

- ADR-023 `:127` (groups never cross regions) against the product direction "large multi-company customers"
  (`WS/docs/large-customer-roadmap.md:7`) and the first market group "Pakistan + Nordic together"
  (`drafts/accounts-roadmap.md:24-27`): a Nordic–Pakistani group is the likely first large group case.
- H-5 and ADR-020 D12 still say "no cross-region replication **until C4**" (hosting `:15`; ADR-020 `:160`), but C4 is
  decided (hosting `:11`; `WS/docs/handover/target-countries.md:45`). The rule for after C4 is unwritten.

### Recommendation

**New ADR-028 "Cross-region groups"**: pick A, B or C (lead's lean: C for the first release, B as the target), the
identity model across regions, the group-scope capability ADR-013 asked for, what data may cross (aggregates only?),
and an amendment to ADR-023 D12. Depends on the PK legal opinion (ACC-R24).

## 3. Deployment and environments

### What is decided

| Part | Decision | Source |
|---|---|---|
| Region | EU/EEA for Nordics; PK separate; provider not picked | hosting `:11` (H-1) |
| Containers | Each service in its own container with a memory limit, scale by instances | hosting `:48` (P-26) |
| Database hosting | Managed Postgres 16 per region, HA standby, PITR, readable replicas, pooler, needed extensions | `drafts/ADR-024…:70`, `:89`, `:104` (Q5) |
| Object store | S3-compatible, bucket per service per region, versioning, 35-day old versions | hosting `:23` (P-1), `:32` (P-11); ADR-020 `:57-80` |
| Secrets | Secret store; hosted stacks generate their own; dev key fingerprint refused | hosting `:26` (P-4), `:131` (ERP-Q5) |
| Keys | KMS or Vault Transit wraps file and credential keys | hosting `:24` (P-2, open) |
| Backups | Database PITR + bucket versions to the same time; keys backed up apart | hosting `:29` (P-7); ADR-020 `:162-167` |
| Egress | Allowlist per service per environment; hosts from config only | hosting `:28` (P-6); ADR-016 `:145-146` |
| CI | Paused (Actions off); must be back on before the first hosted environment | hosting `:30` (P-8); `drafts/accounts-roadmap.md:222` (G.4) |
| Monitoring (part) | Event backlog metrics and alerts; `pg_stat_statements`, `auto_explain`, Prometheus on an internal port | ADR-019 `:83`; `drafts/ADR-024…:59` (D2) |
| Deploy notes | Recreate (not rolling) for accounts V18; quiet windows for lock-taking migrations; coordinated org + consumers for V36/V37 | hosting `:79`, `:81`, `:34`, `:36`; BE `docs/operations/deployment-settings.md:42` |
| Assurance | ISAE 3402 / SOC 1 Type II; control period starts before the first large customer | hosting `:41` (P-19) |

### What is missing

1. **Provider and container platform.** Not picked (H-1). ADR-026 R6a needs the provider check before the pick
   (`drafts/ADR-026…:166`). No choice between managed Kubernetes, a simpler container service, or VMs.
2. **Environment list.** Only "hosted stage" appears (ERP-Q2, hosting `:128`). No written set such as dev (local),
   test/QA, stage per region, prod per region, plus a PK stage; no rule for which data each holds (demo only, never
   customer data) or who may access prod.
3. **CI/CD at go-live.** P-8 says turn CI back on; nothing says how releases reach stage and prod (build once, promote
   the same image; who approves; signed images; rollback).
4. **RPO and RTO.** P-7 says how backups are taken, not how much data may be lost or how fast service returns. No
   numbers, no restore-test schedule (P-19 needs "backups with tested restores"), no second-site or cross-zone rule,
   no disaster plan if the region fails (cross-region copies are banned by H-5, so DR is in-region only unless decided).
5. **Monitoring and alerts as a whole.** Only event metrics and DB statistics. Missing: logs (where, how long, no
   personal data), tracing across services (the `correlationId` exists, ADR-019 `:63`), uptime checks, alert routing,
   on-call (ADR-019 `:83` says "the owning module lead's on-call", which does not exist yet).
6. **Zero-downtime upgrades and Flyway across services.** Rule today: "additive and safe for ordered rollout"
   (architecture-and-standards `:237`). Missing: an explicit expand/contract rule (add → dual write → backfill →
   switch → drop in a later release), the order in which services deploy when contracts change (P-15 shows the need),
   how long old app versions are supported against new APIs (topic 4), and the maintenance-window rule: P-24 measured
   about 2.5 minutes with accounts stopped at 5M lines and "15+ min" at 10× (hosting `:46`), which conflicts with
   "zero downtime" for a large customer.
7. **Store-server fleet.** ADR-007 says the store-server fleet must be "budgeted from the start" (`ADR-007:132`):
   patching, backup, replacement runbook. No operations design (see topic 5).

### Recommendation

**New ADR-029 "Hosting, environments and operations"**: provider criteria (from ADR-024 Q5, ADR-026 R6a, H-7, P-2),
container platform, environment list and data rules, release pipeline (build once, promote, approvals, rollback),
RPO/RTO per tier with restore tests, monitoring/logging/tracing/alerting/on-call, expand/contract migrations and
deploy order, maintenance windows. Decisions for Jabran: provider shortlist, RPO/RTO numbers, whether DR may copy
backups to a second region of the same jurisdiction.

## 4. Client release and updates

### What is decided

| Part | Decision | Source |
|---|---|---|
| Platforms | Android, iOS, desktop (Windows, macOS, Linux); no web client; Chromebooks via Android | ADR-011 `:26-35` (Proposed) |
| Store readiness | Current Xcode SDK, privacy manifest, account deletion or employer-managed answer (5.1.1(v)), Sign in with Apple only if a third-party login is added (4.8), reviewer demo account, app-like (4.2) | hosting `:40` (P-18) |
| Push | APNs + FCM directly; store forms; Neovatus-owned Apple and Firebase accounts | ADR-025 `:72`, `:79`, `:99` (P-30) |
| What the server already controls | Modules and features per company and branch (entitlements), permissions; country rates and rules as data | ADR-016 `:156-165`; ADR-010 `:98-103` |
| Texts | In-app items carry key + params and the app renders its own strings; push and e-mail rendered on the server | ADR-025 `:71` |
| Event versioning | Additive changes keep `typeVersion`; breaking changes ship side by side | ADR-019 `:69` |

### Store rules that bind the design (read 2026-11-21)

| Rule | What it means for NeoERP | Source |
|---|---|---|
| Apple 2.5.2 | An app may not download or execute code that adds or changes features. Compose is compiled, so there is no "code push"; only data (config, entitlements, texts, country rates) may change without review | [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) |
| Apple 2.5.19 | No hidden, dormant or undocumented features. Feature switches are fine for reviewed features; every module in the binary must be visible to the reviewer (demo account with all modules on, 2.1(a)) | same |
| Apple 4.2 / 4.2.3 | Must be more than a repackaged website; must work without another app | same |
| Apple 4.8 | No Sign in with Apple needed while sign-in is our own or an enterprise/business account | same |
| Apple 5.1.1(v) | Apps that support account creation must offer in-app deletion. NeoERP business accounts are invite-only (ADR-016 `:177`), so the P-18 "employer-managed" answer applies; a consumer app with self-sign-up must offer deletion | same |
| Apple 4.2.6, 4.3(a) | Template/white-label apps are rejected unless submitted by the content provider; "Services should not submit apps on behalf of their clients"; no multiple Bundle IDs of the same app | same |
| Apple SDK minimum | From 2026-04-28 uploads must be built with Xcode 26 and the iOS 26 SDK (deployment target may stay lower) | [Apple upcoming requirements](https://developer.apple.com/news/upcoming-requirements/?id=04282026a) |
| Apple private distribution | Custom apps to named organisations through Apple Business (Manager) and unlisted apps by direct link; both go through App Review | [Unlisted distribution](https://developer.apple.com/support/unlisted-app-distribution/); [Apple Business custom apps](https://support.apple.com/guide/business/axm58ba3112a/web) |
| Google Play | No self-update outside Play; no downloaded dex/JAR/.so; JavaScript in a webview is allowed | [Device and Network Abuse](https://support.google.com/googleplay/android-developer/answer/9888379) |
| Google Play target API | New apps and updates (phones) target Android 16 / API 36 from 2026-08-31; existing apps API 35 to stay available | [Target API requirements](https://developer.android.com/google/play/requirements/target-sdk) |
| Desktop | The Compose Gradle plugin packages with jpackage and signs on macOS only; no built-in auto-update; notarization runs on macOS; Conveyor (commercial) or community plugins add signed packages and background updates | [Compose native distributions](https://github.com/JetBrains/compose-jb/blob/master/tutorials/Native_distributions_and_local_execution/README.md); [Conveyor](https://github.com/hydraulic-software/conveyor) (community sources, not verified against vendor docs) |

### What is missing

1. **Release and update policy.** No document on release cadence, store tracks (TestFlight, Play internal/closed
   testing), staged rollout, who submits, or review lead time.
2. **Forced minimum version and version skew.** Nothing defines a minimum supported app version, how the app learns it
   (bootstrap field or a header such as an app-version header answered with a fixed "update required" code), how many
   older app versions the API supports, or an API versioning rule for public HTTP contracts (events have one, HTTP does
   not).
3. **What may change without a store release.** Partly true in practice (entitlements, permissions, tax rates, country
   packs on the server, server-rendered push/e-mail), but never written as a rule. Open: in-app texts are compiled into
   the app (ADR-025 `:71`), so a wording fix needs a release; server-delivered string bundles (data, allowed under 2.5.2)
   are a choice to make. Server-driven screen layouts are not recommended (2.5.19 risk, and against ADR-011's
   compiled-UI model).
4. **Desktop distribution and auto-update.** Packaging, code signing (Apple notarization, Windows signing), update
   channel and forced update are not decided. This matters most for tills on Windows and store servers.
5. **Web.** See the conflict below.

### Apps: one or several

ADR-011 decides one role-based business app now (`ADR-011:41-48`), future entry points `:app:*` for Till, ESS/employee
and customer or supplier companions from the same code (`:77-81`), and split triggers (`:83-95`). Assessment per app:

| App | Store listing | Review points | Release cadence | Sign-in | For the release/update ADR |
|---|---|---|---|---|---|
| **Business app** (head office, back office, approvals, platform admin) | One public listing per store under Neovatus; optionally Apple custom-app or unlisted distribution for a customer that wants it | 4.2 app-like; 2.1 demo account with every module on; 2.5.19 all switch-gated modules shown to the reviewer; 5.1.1(v) employer-managed answer (invite-only) | Normal (e.g. every 2–4 weeks) | Our own PKCE sign-in (ADR-002 amendment, `ADR-002:3`); no Sign in with Apple (4.8 exception) | The main track; sets minimum-version and API-window rules |
| **Till / POS** | Separate entry point `:app:till`; on iPad/Android usually through MDM (Apple Business custom app; managed Google Play) rather than a public listing; on Windows a signed installer with its own updater | Kiosk: iOS Single App Mode / Guided Access via MDM; Android dedicated-device mode. Store server is a server, not a store app | **Slower and staged** (ADR-011 `:91` names this trigger): a till must not update mid-shift; updates only at shift close, per store, with rollback | Device enrolment + cashier PIN, offline window (ADR-008 `:80-84`, `:99-103`) | Needs its own channel, "update at close" rule, and a compatibility window between till, store server and cloud |
| **Employee self-service** | Inside the business app first (role-based); split only on a trigger (ADR-011 `:83-95`) | Same as business app | Same as business app | Same identity; ESS permissions | No separate track now |
| **Shopper app** (retailers' loyalty/cashback) | Consumers must never install the ERP. Options: (a) one Neovatus rewards app with a "picker" of retailers (the model 4.2.6 allows); (b) white-label app per retailer, only under the **retailer's own** developer account (4.2.6, 4.3(a)); (c) Apple/Google Wallet passes, no app at all | (a) one listing, needs real features beyond a card (4.2); (b) each retailer submits; (c) Wallet passes are allowed for offers and identification (3.2.1(iv)), but 1.5 asks for a certificate assigned to the brand owner (to verify per retailer); self-sign-up ⇒ in-app account deletion (5.1.1(v)) | Independent of the ERP | **Consumer identity, separate from staff**: own client or realm, own audience, ERP services refuse consumer tokens (as in `WS/docs/backlog.md:374-382`) | A third track; consumer privacy forms; Google Wallet not researched |
| **Supplier / customer portals** | ADR-011 has no web client; portals are a named trigger to reconsider (`ADR-011:37-39`) | Portals are usually web; an app for a supplier who signs in once a month is a hard sell | — | External party identity (ADR-016 D3 reserved scopes, `:34-36`) | Bring the web decision forward (below) |

Lead-level recommendations to put to Jabran: plan Till as its own `:app:till` entry point from the first POS slice
(offline footprint, kiosk lockdown, release cadence are three of ADR-011's own triggers); ESS stays in the business app;
shopper option (c) Wallet passes first, then (a) one Neovatus rewards app; (b) white-label only for a very large
retailer with its own Apple and Google accounts; portals wait for the web decision.

### Conflicts

- **Web.** ADR-011 `:26-35` drops the browser client; `WS/docs/large-customer-roadmap.md:72-74` calls web access an
  open decision (Next.js/React); App `ARCHITECTURE.md:15` and App `docs/enterprise-architecture.md:3`, `:134` still list
  Web; App `docs/delivery-pipeline.md:225` asks how a feature behaves "on web". ADR-025 `:28` already flagged the
  ARCHITECTURE line (RT-0).
- ADR-011 is Proposed but implemented (App `ARCHITECTURE.md:56`, `docs/enterprise-architecture.md:54`).

### Recommendation

**New ADR-030 "Client release, updates and apps"**: tracks per app, cadence, staged rollout, minimum version and the
"update required" response, API compatibility window, what may change server-side (entitlements, packs, rates,
templates; decide on server-delivered string bundles), desktop packaging/signing/auto-update (tool choice), till update
at shift close, consumer identity for a shopper app. **Accept ADR-011** with an amendment: Till as `:app:till` from the
start of POS, and the web question answered (stay native-only, or a separate web stack for portals and install-restricted
users). Decisions for Jabran: web yes/no and when; shopper-app model; desktop update tool (cost); supported-version window.

## 5. Offline tills and POS

### What is decided (all Proposed)

| Part | Decision | Source |
|---|---|---|
| Topology | Cloud → store server (one authority per store) → tills; same service code deployed as a "store edition" | ADR-007 `:41-74` |
| Ownership | Master data down (read-only at the store); sales, returns, tenders, stock moves, Z-reports up (append-only); same entity never editable on both sides | ADR-007 `:76-88`; ADR-009 `:23-39` |
| Failure modes | Cloud down → full store operation; store server down → restricted till mode (cash only, limits); deployment tiers small/standard/high-volume | ADR-007 `:90-103` |
| Offline authority | Cached permission snapshot, default max 72 h per tenant; capability tiers (must-work, degraded, blocked); offline PIN; revocation pulled before posting; audit replay; device enrolment | ADR-008 `:27-103` |
| Sync | Up posts documents with device UUIDs and idempotency keys; monotonic device sequence; number blocks per till; endpoint routing; freshness labels; conflicts prevented structurally | ADR-009 `:23-94` |
| Tax and fiscal | `TaxProvider` / `FiscalProvider`; offline derived from `requiresOnline`; PK Tier-1 cannot sell offline; tax computed at the store; results stored on the line | ADR-010 `:39-103` |
| Books | POS posts daily summaries per location, account and dimension set; late moves post a further summary | `drafts/items-inventory-scope.md:989-994` (decision 12) |
| Stock | Negative stock per store location switch; transfers as documents with states | `drafts/items-inventory-scope.md:986-988` (decision 11); ADR-007 `:86-88` |

### What is missing

1. **Hardware.** No list of supported tills, receipt printers, cash drawers, scanners, scales, customer displays, card
   terminals, or the store-server appliance (ADR-007 `:99-103` names tiers only).
2. **Fiscal devices per country.** ADR-010 covers PK, SE, NO (`:18-22`) and says to re-check before build (`:131`).
   Missing: DK, FI, IS cash-register rules; the Swedish certified control unit choice (hardware or cloud); the
   Norwegian product declaration; certification lead time (a vendor obligation that gates launch, `:129`).
3. **Pakistan POS route.** The vendor research covers FBR **Digital Invoicing** through PRAL
   (`WS/docs/agents/vendor-choices/pk-fbr-route.md:46-51`). Tier-1 retail POS integration is a separate FBR regime
   (Sales Tax Rules 2006 Chapter XIV-AA: real-time reporting per outlet, FBR invoice number and QR on the receipt;
   licensed integrators) — [KPMG brief](https://assets.kpmg.com/content/dam/kpmg/pk/pdf/2024/01/A-brief-on-invoice-integration-of-registered-persons-with-FBR.pdf),
   [FBR POS booklet](https://download1.fbr.gov.pk/Docs/202551615541769POSBooklet.pdf) (read 2026-11-21, not checked by a
   PK adviser). No ADR or vendor choice names this route.
4. **Downward replication mechanism.** ADR-009 says "row-level replication of HQ-owned tables" (`:25`) but not how
   (logical replication, snapshot + events, or a sync API) across eight service databases (ADR-001) with RLS (ADR-026).
5. **Store-server operations.** Install, patching, encrypted backup, physical security, replacement runbook, monitoring
   (ADR-007 `:132` says budget it; nothing designs it).
6. **Offline limits as numbers.** Restricted-mode value limits, number-block sizes, local storage limit, replay
   batching and rate (ADR-009 `:113`).
7. **Card payments offline** (terminal store-and-forward rules, floor limits) and **cash management** (float, safe drops,
   till counts).

### Local server, local first, or online?

ADR-007 answers "local first for every store": one store server per store is the authority for stock, sales and
fiscal numbering, tills are LAN clients, and the server runs the same service code as a "store edition"
(`ADR-007:56-74`). What it leaves open:

| Question | What ADR-007/008/009 say | What is open |
|---|---|---|
| **Small shop, one till** | "Small store: one till elected as local hub. No additional hardware; store uptime couples to that till" (`ADR-007:101`) | Whether a phone/tablet till can carry the store edition at all: the store edition is JVM Spring Boot services plus a database, which runs on a Windows/Linux/macOS till PC but not inside an iOS or Android app. So "one device is till and server" means a desktop till only. A third option is not in the ADR: **cloud-direct with an offline queue** (the till talks to the cloud, queues sales while offline, one till so no stock or number conflict inside the store). It fits one-till shops on tablets and is the only option on iOS/Android, but it needs its own offline rules (local tax calculation, ADR-010 `:93-96`; number block per till, ADR-009 `:58-62`; snapshot age, ADR-008 `:37-47`) |
| **Store-server hardware** | Standard store = dedicated appliance (`ADR-007:102`); disk protection needed (`ADR-008:118`) | Spec (CPU, RAM, disk, encryption, UPS), OS, who supplies it, cost per store |
| **Install and enrolment** | Devices are enrolled with revocable identities; endpoints provisioned at enrolment (`ADR-008:99-103`; `ADR-009:78-80`) | Installer, first-time setup, replacing a broken server (runbook named only, `ADR-007:132`) |
| **Remote updates** | Not covered | Update channel, update only after the day's close, version window between store edition and cloud (topic 4), rollback, schema migrations on hundreds of store databases (the topic 1 "many databases" problem again) |
| **Backups** | "Encrypted backup" named (`ADR-007:132`) | What is backed up when the cloud already holds everything posted; the gap is unposted sales in the outbox and the fiscal journal, which must survive a disk failure (e.g. till and server both keep a copy until the cloud acknowledges) |
| **Monitoring** | Outbox state, sequences and number blocks to monitor (`ADR-009:108`) | Fleet view: last contact, backlog age, disk, version, fiscal device status; alerts to whom |
| **Cost per store** | "Grows linearly with store count and must be budgeted from the start" (`ADR-007:132`) | No figure; researcher B's capacity model should add hardware + support per store |
| **High-volume standby** | "Store server plus warm standby" (`ADR-007:103`) | Failover method (database replication on the LAN, who promotes, how tills switch, how number blocks and the fiscal journal stay single-writer); without it two servers can both act as the authority |

**Fiscal rules when the store is offline** (to verify with each country's adviser; ADR-010 `:131` already says so):

| Country | Rule found | Effect offline |
|---|---|---|
| **Pakistan (Tier-1 retail)** | Real-time reporting of every sale to FBR; FBR invoice number and QR printed on the receipt (Chapter XIV-AA; [KPMG brief](https://assets.kpmg.com/content/dam/kpmg/pk/pdf/2024/01/A-brief-on-invoice-integration-of-registered-persons-with-FBR.pdf), read 2026-11-21) | No compliant receipt without FBR's answer: ADR-010 already makes the till refuse the sale (`ADR-010:74`). Local first gives a PK Tier-1 store nothing for selling; it still helps stock and speed. Open: whether FBR allows any offline grace (not found) |
| **Sweden** | Every receipt needs control codes from the control unit; if the register cannot be used, sales are documented by hand and **not** registered afterwards ([Skatteverket, using a cash register](https://www.skatteverket.se/foretag/drivaforetag/kassaregister/saharanvanderdukassaregister), read 2026-11-21) | A **cloud** control unit (ADR-010 `:21` allows "hardware or cloud") stops receipts when the internet is down; offline selling in SE needs a control unit reachable on the LAN (hardware at the store, or one the store server can reach). Exact rule to check in SKVFS 2021:18 |
| **Norway** | Product-declared system, electronic journal; low-cash exemption (cash sales under NOK 50,000 a year from fixed premises) ([Skatteetaten, cash register systems](https://www.skatteetaten.no/en/business-and-organisation/start-and-run/best-practices-accounting-and-cash-register-systems/cash-register-systems/); [low-cash exemption](https://www.skatteetaten.no/en/rettskilder/type/uttalelser/prinsipputtalelser/unntak-for-krav-til-kassasystem-ved-lavt-kontantsalg/), read 2026-11-21) | Offline selling is possible if the journal is kept locally and complete (ADR-010 `:22`, `:75`); the offline rules of kassasystemforskriften itself were not found in this round |
| **DK, FI, IS** | Not researched | — |

Loyalty and cashback balances offline: see the case below.

Lead's lean for the decision (not decided): keep **local first** for stores with more than one till and for every
store where offline selling is legal; offer **cloud-direct with an offline queue** for one-till shops and tablet tills;
both use the same idempotent posting contract (ADR-009 `:41-56`), so a shop can move from one to the other.

### Case: shopper loyalty and cashback (retailers' own programme, in Sales)

Not designed anywhere. The only related text is the cross-shop "NeoERP ID" idea (`WS/docs/backlog.md:374-382`); the
Sales scope list mentions wallet and store credit as refund targets (`WS/docs/agents/design-brief-common.md:55`;
`drafts/items-inventory-scope.md:633`). Why it is a hard case:

| Concern | What it needs | Clash with what is decided |
|---|---|---|
| **Cross-store mutable state** | A shopper's points or cashback balance is spent in any store | ADR-007 failure mode 4 assumes "stores share no mutable state" (`ADR-007:97`). Gift cards and store credit have the same problem |
| **Offline redemption** | Earning offline is safe (append, post later). Redeeming offline can double-spend in two stores | ADR-008 tiers have no slot for it. Options: redeem online only; a per-shopper offline cap; pre-allocated redemption blocks per store (like number blocks, ADR-009 `:58-62`) |
| **Ledger** | An append-only points ledger (earn, redeem, expire, adjust) with idempotent entries per receipt line | Fits ADR-009 `:41-50` and ADR-019; owner module undecided (Sales or its own) |
| **Accounting** | Points are a liability (deferred revenue for the points' share of the sale, released on redemption or expiry/breakage); cashback may reduce the sale price | Needs Accounts posting through AccountsPostingV2 (`drafts/accounts-roadmap.md:151`); in daily summaries (decision 12) the liability line must still tie out |
| **Tax** | VAT treatment of points and vouchers per country; PK sales-tax value and the FBR invoice for a discounted sale | Accountant check (ERP-Q1, hosting `:127`) |
| **Consumer identity and privacy** | Consumer account separate from staff; consent; deletion; possibly millions of consumers | backlog `:376-382`; Apple 5.1.1(v) |
| **Scale** | Balance per shopper read at every sale | ADR-024 stored-totals pattern (`drafts/ADR-024…:17`) |

### Conflicts

- `drafts/items-inventory-scope.md:643` says "ADR-007 accepted"; ADR-007 `:5` says Proposed.
- ADR-010 `:136-138` lists ADR-008/009 as "to be written" and asks for an ADR-007 amendment; both exist and ADR-007
  already carries the jurisdiction note (`:141-147`). Stale cross-links.
- Loyalty, gift cards and store credit against ADR-007 `:97` (above).
- ADR-007's cloud tier lists a "back-office web client" (`ADR-007:45`, `:58-59`); ADR-011 drops the web client
  (`ADR-011:26-35`). Same root as conflict C1.

### Recommendation

Accept ADR-007–010 when the POS scope starts, with amendments: (a) cross-store balances (loyalty, gift card, store
credit) as an explicit exception with a chosen offline-redemption rule; (b) the downward replication mechanism;
(c) store-server operations (hardware, install, remote updates after close, backups of unposted sales, fleet
monitoring, cost per store); (d) a third store mode, cloud-direct with an offline queue, for one-till and tablet
shops; (e) the standby failover method; (f) per-country offline fiscal rules, including the Swedish control unit
placement; (g) "back-office web client" replaced by the native app (or by the web decision). **New ADR-031 "Shopper loyalty and stored value"**: owner module, points ledger,
liability posting, offline redemption rule, consumer identity (shared with the shopper app in topic 4). Add DK/FI/IS
fiscal rules and the PK Tier-1 POS route to ADR-010 and to the vendor choices. Decisions for Jabran: offline
redemption policy; per-retailer vs cross-shop points (cross-shop makes Neovatus a controller and may touch e-money
rules, backlog `:379-380`).

## 6. Realtime and cross-service consistency

### What is decided

| Part | Decision | Source |
|---|---|---|
| No distributed transactions (implied) | Database per service, no cross-database FKs or joins; cross-service work by HTTP or messaging | ADR-001 `:37-41`; BE `AGENTS.md:119-120`, `:200` |
| Events vs commands vs reads | Events through the relay; commands through a producer command outbox with retries; reads by scoped machine calls | ADR-019 `:22-30` (D1) |
| Atomic publish | Event and delivery rows written in the business transaction | ADR-019 `:34` |
| Delivery | At least once; consumer inbox keyed by `eventId` gives effectively-once processing | ADR-019 `:36-37` |
| Ordering | No order guaranteed; `subjectVersion` per subject | ADR-019 `:71-74` (D4) |
| Failures | Back-off, PARKED rows, audited replay, metrics and alerts | ADR-019 `:76-83` (D5) |
| Broker | Only on measured triggers (RabbitMQ first) | ADR-019 `:135-142` (D14) |
| Posting exactly once | Source outbox in the same transaction; one idempotency key per source line, unique in Accounts; retries until answered; status per document; daily tie-out; alert on waiting/refused | `drafts/accounts-roadmap.md:151` (5.13a, decision 6); ADR-018 `:63-68` |
| Compensation (in practice) | Accounts can reject a service-created document; the producer learns it from `*.rejected` events | ADR-018 `:68`, `:72-82` |
| Reservation pattern | Budget RESERVE/RELEASE/CONSUME, idempotent, one locked bucket row, fail-open/closed per level when Accounts is down | ADR-022 `:119-140`, `:158-163`, `:215-222` (Proposed) |
| Read models | reporting-service fed only by events; freshness watermark | ADR-023 `:37-45`, `:108-111` (Proposed) |
| Realtime | Action ids, one SSE stream per session, notification-service; ids not records (snapshots allowed per contract, A1) | ADR-025 `:30-79`, `:101-104` |
| Store sync | Idempotent upward posting, replay returns the original result | ADR-009 `:41-56` |

### What is missing

1. **One written rule for multi-step business processes (sagas).** The pieces exist (outbox, idempotency, rejection
   events, reservations), but no ADR says: "a process across services is a saga; each step is local, idempotent and has
   a named compensation or a named 'stuck' state shown to a person; distributed transactions (2PC/XA) are not used".
   Examples that need it: purchase order → budget reserve → goods receipt → bill → payment; sale → stock issue →
   invoice → FBR; payroll run → posting → bank file.
2. **Partial failure after a refusal.** 5.13a says "retries until Accounts answers" and shows "refused with reason";
   who fixes a refused posting, whether the source document is reopened, and how the daily tie-out lists it are not
   designed per module.
3. **Current gaps in the relay.** Accounts' producer still uses the legacy unbounded retry (ADR-019 `:80`); `user` and
   `auth` are not relay producers yet (ADR-025 `:127`, Q13).
4. **Infrastructure dependency.** The stream hub needs a dedicated non-pooled LISTEN connection (ADR-025 `:99`, P-28)
   while ADR-024 plans PgBouncer in transaction mode (`drafts/ADR-024…:62`). Handled by P-28, but it must reach the
   hosting ADR.
5. **Cross-region:** none of this crosses regions (topic 2).

### Conflicts

- ADR-004 `:22-25` still describes synchronous HTTP to audit with "future Kafka/RabbitMQ"; its own update (`:27`) and
  ADR-019 `:177` replace it. BE `docs/architecture/architecture-and-standards.md:49` and BE `AGENTS.md:41` still say
  audit-service owns notifications, against ADR-025 D5 (`:67-68`).
- BE `docs/architecture/platform-client-plan.md:1-77` plans a `neoerp-platform-client` that ADR-016 D4 and ADR-019 D10
  and ADR-025 `:70` have overtaken. Stale.

### Recommendation

**New ADR-032 "Business processes across services"** (short): sagas with local steps, compensation or a visible stuck
state per step, no 2PC, idempotency keys everywhere, owner of each refusal, tie-out per source. Amend ADR-004 and the
two BE guide files to point at ADR-019/025. Accept ADR-022/023 on their planned dates.

## 7. Engineering principles

### Status

**Partly.** Principles exist but are spread across ADRs, BE `AGENTS.md`, BE
`docs/architecture/architecture-and-standards.md`, App `docs/delivery-pipeline.md`, `WS/WORKFLOW.md` and
`WS/docs/lessons.md`. Two of the guide files are stale (dates June and April 2026: architecture-and-standards `:4`,
App `ARCHITECTURE.md:4`). There is no one page a new engineer or a customer's architect can read.

### Draft one-page list (each line is already decided somewhere)

| # | Principle | Source |
|---|---|---|
| P1 | The backend decides security, entitlements and business rules; apps render what the backend resolved | ADR-006 `:41` |
| P2 | One database per service; no cross-database joins or foreign keys; ids across services | ADR-001 `:13`, `:37`; BE `AGENTS.md:119-120` |
| P3 | The company is the tenant boundary; every tenant query takes a trusted company scope; RLS is the second wall | ADR-013 `:50`; ADR-012 `:107-109`; `drafts/ADR-026…:87` |
| P4 | Fail closed for writes, money and security; bounded stale reads only where classified | ADR-008 `:58-61`; ADR-012 `:139-145`; ADR-016 `:56` |
| P5 | Resolve, don't guess (e.g. branch lists through the resolver) | ADR-015 `:124-129` |
| P6 | Clean architecture inside each service and each app feature; features do not depend on each other | BE `AGENTS.md:46-61`; ADR-011 `:65` |
| P7 | Schema only through Flyway; owner role migrates, runtime role owns nothing | BE `AGENTS.md:116-118`; hosting `:27` (P-5) |
| P8 | Events for facts, commands for requests, reads for state; outbox in the same transaction; idempotent consumers | ADR-019 `:22-37` |
| P9 | Every retryable write carries an idempotency key; replay returns the original result | ADR-009 `:41-50`; ADR-018 `:65`; ADR-025 `:45` |
| P10 | History is never recomputed or edited: posted entries are reversed or adjusted, tax results stored on the line | ADR-010 `:87-91`; `drafts/items-inventory-scope.md:1069-1073` |
| P11 | Countries are data, not code; new behaviour only through a named provider port | ADR-010 `:98-103` |
| P12 | No new infrastructure without a measured trigger and an ADR | ADR-019 `:135-140`; `drafts/ADR-024…:58` |
| P13 | Data stays in its region; processors recorded with region and DPA before use | ADR-020 `:156-160`; hosting `:17` (H-7) |
| P14 | Events and streams carry ids and the few facts needed, never sensitive personal data | ADR-019 `:66-68`; ADR-025 `:32-38` |
| P15 | Backend gives codes, the app owns words | ADR-025 `:71` |
| P16 | Layout adapts to window size, never device type | ADR-011 `:50-57` |
| P17 | Outside systems: hosts from config, timeouts, circuit breaker, idempotent sends, no wire logging; third-party secrets write-only | ADR-016 `:134-152` |
| P18 | Large-customer features optional per company, off by default; the quality bar is the same for every customer | `WS/docs/large-customer-roadmap.md:11`; `drafts/accounts-roadmap.md:17-18` |
| P19 | Every money or security finding gets an automated test; money invariants run after every full run; two different reviewers for money/security; accountant sign-off for statutory output | `WS/docs/lessons.md:54-57` (L11–L14) |
| P20 | Docs are part of delivery; architectural decisions go into ADRs | BE `AGENTS.md:159`, `:178-179` |

### Recommendation

Put this list (after Jabran's edits) at the top of BE `docs/architecture/architecture-and-standards.md` as section 0,
with App `ARCHITECTURE.md` pointing to it, and refresh both stale files (service map, notification owner, web line). No
ADR needed.

## 8. What a large multi-company customer will also ask

| Question | Status | Source / gap |
|---|---|---|
| SLA (uptime, support hours, response times, credits) | **Missing** | Nothing written |
| Planned maintenance windows | **Missing** | P-24 numbers exist (hosting `:46`), no policy |
| Incident handling and breach notice (GDPR 72 h to the authority, customer notice terms) | **Missing** | — |
| Audit trail | **Partly** | ADR-004 append-only audit; audit catalogue draft (`drafts/audit-catalogue.md`); audit log export planned (`drafts/accounts-roadmap.md` 5b.4) |
| Assurance reports | **Partly** | ISAE 3402 Type II gate (hosting `:41`); pen test (`:128`); no ISO 27001 plan |
| Data export (full archive in standard formats) | **Partly** | Complete archive D-151 and exit D-152 (BE `docs/api/accounts-attachments.md:395`); SAF-T/SIE per country; HR/Payroll export not covered |
| Exit (return, delete, backup deletion schedule) | **Partly, open** | "DPA exit terms, verified handover, backup deletion schedule" are open (hosting `:117`) |
| DPA and sub-processor list for the customer | **Missing** (as a document) | H-7 records vendors (hosting `:17`); no customer-facing DPA |
| Single sign-on with the customer's own identity provider (Entra ID, Google, SAML), and user provisioning (SCIM) | **Missing** | Keycloak hosts sign-in (ADR-002 `:3`); federation not decided; 4.8 exception still holds for enterprise accounts |
| Public API and webhooks for their systems | **Partly** | Reserved scopes (ADR-016 `:34-36`); public API platform ADR required first (`drafts/accounts-roadmap.md:28`); inbound callbacks rule (ADR-016 `:152`) |
| Customer-owned BI / warehouse feed | **Partly** | OData pull feed first (`drafts/ADR-024…:69`, D12) |
| Customer-managed keys / dedicated hosting | **Missing** | Topic 1 cells; KMS open (P-2) |
| Capacity guarantees (users, rows, report times) | **Partly** | ADR-023 D14 targets (`:133-143`); load test before first large customer (`drafts/accounts-roadmap.md:230`) |
| Retention and legal hold per country | **Decided as policy** | ACC-R6 (hosting `:75`, `:98-121`); build open |

### Recommendation

**New ADR-033 "Service commitments and customer data rights"** (or a non-ADR "trust pack" document): SLA tiers,
maintenance, incident and breach process, DPA and sub-processor list, export and exit, SSO/SCIM, assurance roadmap.
Decisions for Jabran: SLA levels per price tier; whether SSO federation is in the first release; ISO 27001 or ISAE only.

## 9. Large-scale data processing, querying and fetching

### 9a. Heavy jobs

| Job | Decided | Missing |
|---|---|---|
| Exports (GL, listings, SIE) | Background job above 10,000 lines; 2 per instance, 3 queued per company; `SKIP LOCKED`; one snapshot; 5,000-row chunks; file store 7 days; cap 1M lines (`drafts/ADR-024…:39`; BE `docs/api/accounts-h-se.md:329`) | Same pattern not yet named for other modules |
| Imports (SIE, OB, journal CSV, SAF-T) | Per-company upload quota, 429 with a module code (ADR-020 `:132`; deployment-settings `:104-105`); SAF-T OB reader not started (`drafts/accounts-roadmap.md` §3 row 7) | In-flight quota is per instance (hosting `:35` P-14) |
| Payroll runs | "Runs at volume (5,000+, parallel chunks, retro recalculation with diff)" listed (`WS/docs/large-customer-roadmap.md:65`); posting outbox with `SKIP LOCKED` (BE `docs/api/payroll-v2-p2.md:461`) | Chunking, time budget, progress per run in the v2 design |
| Period and year close | Close checklist and multi-company close board planned (`drafts/accounts-roadmap.md:19`, 5b.2) | How long a close may lock posting for a large company |
| FIFO/average re-costing after back-dated moves | Re-cost later issues from the move date; one adjustment journal; closed periods refused (`drafts/items-inventory-scope.md:1069-1073`, decision 24) | How it runs at 20M moves a year (`:680-681`): job, batching, lock scope per item, progress |
| Bulk actions, scheduled reports, recurring journals | Action ids and 202 + status for async work (ADR-025 `:40-49`); scheduled reports in ADR-023 D9 (`:102-106`); recurring job with advisory lock (BE `docs/agents/a4/report-s3b.md:5`) | — |
| Notification fan-out | Permissions resolved to people at send time; retries; dedupe (ADR-025 `:67-75`) | Fan-out limits for a company with thousands of recipients |

**Missing across all jobs:**

1. **One job framework.** Each module builds its own worker, claim, limits and progress (exports, SIE, recurring,
   reversals, payroll dispatch). ADR-025's `:shared:actions` gives a common **status** (`:48`), not a common **runner**
   (claiming, leases, chunking, retries, per-company concurrency, time windows, cancellation).
2. **Noisy neighbour.** Per-company limits exist only for some imports and exports. Nothing caps a company's share of
   worker threads, database connections or CPU across all job kinds, or keeps one large company's year-end close from
   slowing others. Gateway rate limits are per user and IP and in memory (ADR-016 `:108`; ADR-025 `:20`), not per
   company.
3. **Time windows.** No rule for when heavy jobs may run (e.g. re-costing and rebuilds off-peak per region and time
   zone), or for jobs that must finish by a statutory time (payroll bank file, VAT deadline).
4. **Where jobs run.** All in the service instances today. No decision on separate worker instances so user requests
   keep their capacity (P-26 scales by instances, hosting `:48`).

### 9b. Querying and fetching

| Part | Decided | Missing |
|---|---|---|
| Paging | Keyset for lists that can pass ~100,000 rows per company; capped counts ("10,000+"); no in-memory paging; page size capped (`drafts/ADR-024…:60`, D3; Stage 1 B1 `:85`); GL already keyset with signed cursor (`:27`) | App "load more" pattern per list (Stage 1) |
| Filtering and search | `pg_trgm` and Postgres full-text first; global search fans out to module endpoints filtered by permissions; OpenSearch only on a measured trigger (`drafts/ADR-024…:67`, D10) | — |
| Hot spots | F1–F10 listed with fixes (`drafts/ADR-024…:41-53`, D4 `:61`) | Built in Stage 0/1 |
| N+1 and batched lookups | Batch lookups (D3); F6 ~300 queries on a big document (`:49`, N8 `:83`) | An architecture test or query-count test per detail endpoint |
| Reporting store and read models | ADR-023 D2–D14; Postgres first, ClickHouse on trigger (`drafts/ADR-024…:68`) | ADR-023 still Proposed |
| Read replica | For exports and reports, same server per report (`drafts/ADR-024…:63`, D6) | — |
| Exports of large data | Jobs, file store, short retention (ADR-023 `:104`; ADR-024 `:39`) | — |
| Caching | Entitlements ≤ 30 s per (company, branch) (ADR-016 `:164`); permission fallback 30 s for classified reads (ADR-008 `:53-61`); dimension-set cache (hosting `:43`) | **No general caching rule** (what may be cached, where, invalidation by events, never across companies) |
| Query time budgets | Report targets: KPI ≤ 1 s, standard report ≤ 3 s, pivot ≤ 5 s else a job (ADR-023 `:133-143`); A1 post p95 target ≤ 150 ms (`WS/docs/backlog.md:59`) | **No budget per screen or API class** (list, picker, detail, write), no slow-query alert tied to it (`auto_explain` > 500 ms is a log, not a budget, ADR-024 `:59`) |
| How the App fetches | Refetch through the module API on stream events, at most once per 2 s per visible list (ADR-025 `:65`); Accounts polls today (`:25`); a fixed 30 s request timeout per platform (`:27`) | **No offline cache or local store in the App** (no database library in App `gradle/libs.versions.toml`); no rule for incremental loads, cache lifetime, or what an office user sees offline (the UX has an "offline" state only, App `docs/design/ux-principles.md:226`) |

### Recommendation

**New ADR-034 "Background jobs and fair use"**: one shared job runner (claim, lease, chunk, retry, cancel, progress
through `:shared:actions`), per-company concurrency and quotas across all job kinds, separate worker instances for heavy
kinds, time windows per region, a statutory-deadline class. **Amend ADR-024** with time budgets per API class and a
caching rule. **Add to ADR-030** (client) the App fetch rules: keyset "load more", refetch on events, and whether the
business app keeps a read-only offline cache (the till's offline store is ADR-007's, not this). Decisions for Jabran:
per-company limits (numbers), whether heavy jobs run on separate worker instances (cost), offline cache in the business
app yes/no.

## 10. Conflicts found (all topics)

| # | Conflict | Where | Suggested fix |
|---|---|---|---|
| C1 | Web client dropped vs web an open decision vs Web still listed | ADR-011 `:26-35`; `WS/docs/large-customer-roadmap.md:72-74`; App `ARCHITECTURE.md:15`; App `docs/enterprise-architecture.md:3`, `:134`; App `docs/delivery-pipeline.md:225` | Jabran decides; then ADR-011 amendment and App doc fixes (RT-0 covers one line) |
| C2 | Groups never cross regions vs PK + Nordic groups as the first market | ADR-023 `:127`; `drafts/accounts-roadmap.md:24-27` | ADR-028 + ADR-023 amendment |
| C3 | "No cross-region replication until C4" although C4 is decided | hosting `:15`; ADR-020 `:160`; `WS/docs/handover/target-countries.md:45` | Restate the rule after C4 |
| C4 | EU/EEA region for "the Nordics" vs Iceland records stored in Iceland | hosting `:11` vs `:12`, `:91`, `:110` | Topic 1 item 2 |
| C5 | Partition by company vs not by company | `WS/docs/large-customer-roadmap.md:39` vs `drafts/ADR-024…:64` | Fix the roadmap line (ROADMAP-P supersedes it) |
| C6 | ADR-024 file says not accepted; accepted 2026-11-21 | `drafts/ADR-024…:4`; `WS/PROJECT-STATE.md:33` | Update the status line in the BE-DOCS-1 move |
| C7 | ADR-007 "accepted" vs Proposed | `drafts/items-inventory-scope.md:643`; ADR-007 `:5` | Fix the scope line, or accept ADR-007 |
| C8 | ADR-011 Proposed but implemented | ADR-011 `:5`; App `ARCHITECTURE.md:56` | Accept ADR-011 (with the topic 4 amendment) |
| C9 | ADR-017 referenced but missing | ADR-018 `:95`, `:128`; BE `docs/api/accounts-decisions-for-jabran.md:127`; BE `docs/api/accounts-roadmap.md:155` | Write ADR-017 (cross-company write capability) before Accounts F, or renumber |
| C10 | Audit-service owns notifications vs notification-service | BE `docs/architecture/architecture-and-standards.md:49`; BE `AGENTS.md:41`; ADR-004 `:17-25` vs ADR-025 `:67-68` | Amend the guides and ADR-004 when RT-2 lands |
| C11 | "Migrations additive, ordered rollout" vs recreate deploys and lock windows | architecture-and-standards `:237` vs hosting `:79`, `:81`, `:34` | Expand/contract rule in ADR-029 |
| C12 | "Stores share no mutable state" vs loyalty, gift card, store credit | ADR-007 `:97` | ADR-007 amendment + ADR-031 |
| C13 | ADR-021 shown as Proposed in the roadmap | `WS/docs/large-customer-roadmap.md:19` vs BE `docs/adr/ADR-021…:5` | ROADMAP-P supersedes |
| C14 | ADR-010 related-decision lines stale | ADR-010 `:136-138` | Fix when ADR-010 is accepted |
| C15 | platform-client plan overtaken | BE `docs/architecture/platform-client-plan.md` vs ADR-016 D4, ADR-019 D10, ADR-025 `:70` | Mark superseded |
| C16 | ADR-007's "back-office web client" vs no web client | ADR-007 `:45`, `:58-59` vs ADR-011 `:26-35` | ADR-007 amendment (g), with C1 |

## 11. New ADRs and ADR changes recommended

Numbers are suggestions (017 is taken by its references); the lead assigns them.

| # | ADR | Covers | Decision Jabran must make |
|---|---|---|---|
| 1 | **ADR-017** Cross-company writes (exists only as references) | How one company's service writes into another company's books (franchise charges, inter-company) | In-process capability audited in both companies (D-49 recommendation) or another path |
| 2 | **ADR-027** Tenancy cells and dedicated databases | Topic 1 | When a customer may get its own database (contract, regulation, measured load), and the price tier for it; whether Iceland gets an in-country copy or a cell |
| 3 | **ADR-028** Cross-region groups | Topic 2 | Option A, B or C; what may cross regions (aggregates only?); depends on the PK legal opinion |
| 4 | **ADR-029** Hosting, environments and operations | Topic 3 | Provider shortlist; RPO/RTO numbers; DR copy rule; who may access prod |
| 5 | **ADR-030** Client release, updates and apps | Topic 4 + App fetch rules (9b) | Web yes/no and when; supported app-version window; desktop update tool; server-delivered texts yes/no; shopper-app model; offline cache in the business app |
| 6 | **ADR-031** Shopper loyalty and stored value | Topic 5 case | Offline redemption policy; per-retailer vs cross-shop points; owning module |
| 7 | **ADR-032** Business processes across services | Topic 6 | Confirm "no 2PC, sagas with visible stuck states"; who resolves refused postings |
| 8 | **ADR-033** Service commitments and customer data rights (or a trust-pack document) | Topic 8 | SLA levels; SSO/SCIM in the first release; ISO 27001 or ISAE only |
| 9 | **ADR-034** Background jobs and fair use | Topic 9a | Per-company limits; separate worker instances; time windows |
| 10 | **ADR-007–010 accept with amendments** | Topic 5 | When to accept (at POS scope start); local first vs cloud-direct with offline queue for one-till/tablet shops; who supplies store-server hardware and what it costs per store; standby failover method; cross-store balances exception; replication mechanism; DK/FI/IS fiscal rules; PK Tier-1 POS route; SE control unit at the store |
| 11 | **ADR-011 accept with amendment** | Topic 4 | Till as `:app:till` from the start of POS; the web answer |
| 12 | **ADR-023 amendment** (D12) | Topic 2 | Follows ADR-028 |
| 13 | **ADR-024 amendment** | Topic 9b | Time budgets per API class; caching rule; status line to Accepted |
| 14 | **ADR-004 amendment** + BE guide refresh | Topic 6, 7 | None (housekeeping); add the principles page (topic 7) |

## 12. Not verified

- Apple 1.5's "certificate assigned to the brand owner" for Wallet passes, read literally, may need one pass-type
  certificate per retailer; check Apple's Wallet developer terms before choosing option (c).
- Google Wallet loyalty passes and Google Play rules for white-label apps were not researched.
- Desktop auto-update tools (Conveyor and community plugins) come from community sources; prices and current features
  not checked with the vendors.
- PK Tier-1 POS rules come from a KPMG brief and an FBR booklet; not checked by a PK adviser; the per-invoice fee seen
  in a vendor blog is not used.
- DK, FI and IS cash-register rules were not researched (ADR-010 covers PK, SE, NO only).
- Norway: the offline rules of kassasystemforskriften and Sweden's SKVFS 2021:18 text were not read directly; the
  Swedish point (cloud control unit stops receipts offline) is the lead's reading of Skatteverket's guidance.
- The store edition not running inside an iOS/Android app is an inference from ADR-007's "same service code"
  (Spring Boot services and a database), not a tested fact.
