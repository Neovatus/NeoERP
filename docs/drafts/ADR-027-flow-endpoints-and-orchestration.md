# ADR-027: Flow endpoints and cross-service orchestration for the App

## Status
**Draft** (ERP lead, 2026-11-24) for Jabran to approve. Not accepted; nothing is built from it yet. Kept in the workspace as a system-level decision, like ADR-025; moves to `NeoERP-BackEnd/docs/adr/` when accepted. When accepted, every builder brief that adds or changes an App screen links it.
Builds on ADR-006 (backend decides), ADR-011 (one App), ADR-012/ADR-026 (company isolation), ADR-016 (security), ADR-019 (event relay), ADR-025 (SSE, action ids). Changes none of them.
Evidence: BackEnd `7ee082b`, App `82b815b0`. `BE/` = `NeoERP-BackEnd/services/`, `App/` = `NeoERP-App/composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/`.

## Summary
Each service keeps its resource endpoints and adds thin **flow endpoints** for our App: one small function per screen or action. They hold no rules; they call the same application services and return everything the screen needs plus the **decisions already made**. The App displays them. Data from another service is fetched by the flow's owner in parallel with timeouts; a failed part degrades, never the screen. Writes never span services: others follow by events.

## Context: what we measured
**Too many calls, in chains** (`.review-channel/arch-data-calls-decisions.md` §1; awaited one by one in `App/features/accounts/presentation/payables/BillEditor.kt:285-305`).

| Screen | Calls on open | Longest chain | Of which cross-service |
|---|---|---|---|
| Bill editor | 12 + D | **11** | 2 (org companies → company) |
| Invoice editor | 9 + D | **9** | 2 |
| Payment editor | 11 + D | **9** (advance 11) | 2 |
| Refund editor | 6 | **6** | 2 |
| Journals list | ~12 + N + D | 4 | 2 |
| Accounts entry (every tab) | 6 | 2 | 0 |

N = chart pages, D = free-dimension definitions. The books set is re-read on every journal editor/detail open (`JournalsPageHolder.kt:154,315-320`). Most calls stay inside accounts-service: the chain is the App's doing, not the service split.

**The App decides itself** (§2): 16 places. 4 have no server answer (D6 acknowledge, D11 importer identity sent as `ownerSelfApproval`, D12 "my approval landed" by name, D13 receipts badge). ~7 mask server `actions` with local codes (D1, D3, D7, D8, D14–D16). 3 mirror validation (D4, D5, D9). The server mostly has the answers (`BE/accounts-service/.../service/journal/JournalPolicy.kt:85-200`, `ApDocumentReadService.kt:153`).

**The seam breaks on small gaps** (`.review-channel/phase4-seam-review-1-money.md`, `-2-isolation.md`): the server sends `null` for "not known", the App's strict reader fails the whole screen (money M1; isolation M4, M5, L5); no example showed `null`. Refusal words are guessed (money L1, isolation L1).

**Cross-service calls are uneven.** org-service runs a full bootstrap in user-service on every org request, no timeout (isolation M2; `BE/org-service/.../security/OrgIamAccessClient.kt:34`). `NeoErpHttpClients` (`shared/neoerp-security/.../web/client/NeoErpHttpClients.kt:14-20`, 2 s / 5 s) is used by accounts; ~15 of 27 `RestClient.builder()` sites elsewhere set no timeout. Bootstrap already degrades well: missing org names become `null` (`BE/user-service/.../app/bootstrap/AppBootstrapService.kt:58-66`).

**Gateway:** 16 routes in one file (`BE/api-gateway/src/main/resources/application.properties:5-87`), order-sensitive.

## Decision

### D1. Two layers per service
| Layer | Path | For | Shape |
|---|---|---|---|
| Resource endpoints (unchanged) | `/api/<module>/<resource>` | Other services (via `/api/internal/...`), integrations later, simple App screens (pickers, settings lists) | One per resource; stable; public contract |
| Flow endpoints (new) | `/api/<module>/app/<feature>/<flow>[/<step>]` | Our App only | One small function per screen or action |

Cross-module flows (D4) use `/api/app/<flow>` in user-service, which already owns `/api/app/**` (gateway route 5).

### D2. Flow endpoints hold no rules
- They call the same application services as resource endpoints; a rule lives once.
- **Read flow:** one answer with all the screen needs, including ready decisions for the signed-in person.
- **Action flow:** one command; answers the new state and the next decisions.
- A decision the server lacks (D6, D11, D12, D13) is added to the owning application service first.

### D3. Orchestration lives in the service that owns the flow
- **Reads:** parallel, each part with a timeout; a failed part is `null` + a reason, the screen still opens; the called service checks rights and company itself (Design 4).
- **Writes:** each service writes its own data in its own transaction; others follow by outbox events (ADR-019), idempotent consumers. No synchronous multi-service writes, no distributed transactions or sagas.

### D4. Cross-module screens belong to `core`
Home (Accounts approvals, HR leave requests, notification count) is a flow in **user-service** next to bootstrap: `/api/app/home`. A separate App/BFF service only with numbers (Q4).

### D5. Gateway = routing and security only
No aggregation. Routes split to one definition per service (Design 7).

### D6. Contract rules and D7. Rollout
Design 5 and Rollout below.

## Design

### 1. Names and folders (accounts example)
Kotlin packages cannot hold `-`: the URL says `bill-editor`, the package says `billeditor` (as `supplierrefund`, `openingimport` today).

```
services/accounts-service/src/main/kotlin/com/neovatus/accounts/
  delivery/http/app/payables/billeditor/
    BillEditorFlowController.kt   routes only, @AccountsEndpoint, maps to JSON
    BillEditorFlowJson.kt         response shape (explicit nulls)
  application/appflow/payables/billeditor/
    BillEditorOpenFlow.kt         fun open(caller, billId?): BillEditorView
    BillEditorSupplierFlow.kt     fun supplierPicked(caller, supplierId): SupplierPart
    BillEditorSubmitFlow.kt       fun submit(caller, command, key): BillEditorAfterAction
    BillEditorView.kt             result models
```
Rules a builder follows:
- One folder per feature/flow; one class per flow function; aim ≤ 150 lines per class. Never one big `AppController`.
- `appflow` classes may depend on: `application/service/**`, `application/port/inbound/**`, outbound ports for **other services' clients**, and `shared/app-flow`. Not on repositories, JPA, `infrastructure/**` or `domain/**/policy`.
- No `@Transactional` in `appflow`. A combined write (save + submit) is a command on the application service (`BillDraftService.saveAndSubmit`), one transaction; the flow calls it once.
- Endpoints for the bill editor: `GET /api/accounts/app/payables/bill-editor?companyId=&billId=` (open; no `billId` = new bill), `GET …/bill-editor/supplier?companyId=&supplierId=` (supplier picked), `POST …/bill-editor/submit` and `…/save` (with `Idempotency-Key`).

### 2. The read answer
```json
{
  "bill": { "id": "…", "status": "DRAFT", "supplierId": "…", "lines": [] },
  "supplier": { "id": "…", "name": "Acme AS", "kid": null, "ocr": null },
  "openAdvances": [],
  "picks": { "expenseAccounts": [], "assetAccounts": [], "taxCodes": [], "dimensions": [] },
  "companies": null,
  "actions": {
    "save":    { "allowed": true,  "blockedBy": null },
    "submit":  { "allowed": false, "blockedBy": "PERIOD_CLOSED" },
    "approve": { "allowed": false, "blockedBy": "NOT_IN_STEP" }
  },
  "waitingForYou": false,
  "partsMissing": [ { "part": "companies", "reason": "UNAVAILABLE" } ],
  "booksVersion": "2026-11-24T10:02:11Z#41"
}
```
- **Decisions keep today's shape** `actions.<x>.{allowed, blockedBy, requires?, ownerSelfApproval?}` (as `JournalActionsDto`), not new `canApprove` fields (Q1). `blockedBy` is a code; the App owns the words.
- `partsMissing[].reason`: `UNAVAILABLE` (error/timeout), `NO_RIGHT`, `FEATURE_OFF`; the App notes that part only.
- A decision needing a missing part is **never optimistic**: `allowed: false, blockedBy: "NOT_KNOWN_NOW"`. The action re-checks anyway.
- Large lists (chart, N pages) are not in every answer: see Design 6.

### 3. Permissions
- The flow's entry check is the screen's main right (bill editor: `BILL_READ` + feature `PAYABLES` + books created), the same `@AccountsEndpoint` as `GET /bills/{id}`.
- Each part is filled only when the person could read it through its resource endpoint; otherwise `null` + `NO_RIGHT`. A flow never shows more than the resources would.
- Decisions are computed for the signed-in person, with company from the trusted scope (ADR-012), never from the body.
- Action flows check exactly what the resource action checks (they call the same service method).

### 4. Calls to other services (reads)
- New small module `shared/app-flow`: `FlowParts.parallel { part("companies", 1500.ms) { org.companies(caller) } }` gives each part's value or `PartMissing`; virtual threads (Java 21), late parts cancelled, part/time/reason logged with the correlation id.
- Clients via `NeoErpHttpClients` (2 s / 5 s); the flow sets tighter budgets (start: 1.5 s per part, 2 s per flow). No client without a timeout.
- **On whose behalf (Q2):** the person's bearer token goes to the other service's normal endpoint, so its ADR-016 checks run unchanged (as `OrgIamAccessClient` does today). `/api/internal/...` with machine tokens stays for system work (events, postings).
- Writes to other services: never from a flow; outbox event (ADR-019) or command outbox.

### 5. Contract
| Rule | Means |
|---|---|
| Nullable is published | Every field that can be `null` is marked in `NeoERP-BackEnd/docs/api/app-flows/<module>-<feature>.md` and shown as `null` in at least one example. |
| Examples are files | `NeoERP-BackEnd/docs/api/fixtures/app/<module>/<feature>/<flow>/`: `open.json`, `open-nulls.json`, `open-degraded.json`, `submit-request.json`, `submit-refused.json`. The App keeps a copy under `composeApp/src/jvmTest/resources/fixtures/app/…`, as `DocumentMathVectorsTest` does today. |
| Enums grow | The App reads enums as text and maps unknown values to `Unknown`; it never fails a decode on one. |
| Errors are codes | `{code, details}`; the App owns the words (as ADR-025 D2). Every new code is listed in the contract doc and has App words in the same lane. |
| Both sides test | BE: each request example is accepted and each response example is produced (field names, nullability). App: sends exactly the request examples; reads every response example, plus explicit `null`, a missing field and an unknown enum. |
| App reader | Flow DTOs use one tolerant `Json` (`ignoreUnknownKeys`, `coerceInputValues`, `explicitNulls = false`); fields nullable where the contract says so. |

**Versioning.** Flow endpoints are for our App and change with it, but installed mobile Apps lag store releases. So: adding a field or an enum value is always allowed; removing, renaming or changing a field's meaning needs a new path step (`…/bill-editor/v2`) and the old one kept until the oldest supported App version no longer calls it (Q3). Contract tests run on every change either way.

### 6. Caching and performance
- **Books reference set** per company (chart, tax codes, dimensions, cost centres, fiscal calendar): `GET /api/accounts/app/books/reference-set`, `ETag` = `booksVersion`. The App caches it per company and person, sends `If-None-Match`, refetches when a `booksVersion` differs or an SSE books event arrives. Replaces N + 6 + D reads per editor open.
- Server caches (short TTL) only where measured.
- **Budgets:** open a screen in ≤ **2 sequential calls** (module entry folded into its home flow, cached); main action = **1 call**. Server p95 (Q5): ≤ 300 ms inside one service, ≤ 800 ms with cross-service parts, never past the 2 s flow timeout.
- Fewer calls also keeps busy users far from the 600/min per-person gateway limit (`application.properties:107`).

### 7. Gateway split
Spring Boot does not merge an indexed list (`routes[0..n]`) across several property files: the list from one file replaces the other. So "one file per service" becomes **one `RouteLocator` bean per service** in `api-gateway/.../routes/` (`AccountsRoutes.kt`, `UserRoutes.kt`, …) with explicit order for the specific-before-general cases (SIE upload, `/api/platform/**`). `GatewayPropertiesTest` moves to the beans. Values (URIs, upload limits) stay properties. Behaviour is unchanged; a route test per service proves it.

### 8. Cross-module home (user-service)
`GET /api/app/home?companyId=` (`delivery/http/app/home/`, `application/appflow/home/`). Parts: `GET /api/accounts/app/approvals/waiting-summary`, HR leave requests waiting for me, notification count (ADR-025); each a flow endpoint of its module, called with the person's token. Home runs on its own bounded executor so it never starves bootstrap, and never runs bootstrap itself.

### 9. Relation to ADR-025
An SSE event says "X changed"; the App refetches **the open screen's flow endpoint** once, badges from the home/entry flow. Action flows return `NeoERP-Action-Id`; long work answers 202 (ADR-025 D2). Snapshots (A1) may update a row without refetch.

## Architecture
```
App screen ──1 call──► Gateway (route + JWT) ──► owning service
                                                  delivery/http/app/<feature>/<flow>   (controller)
                                                  application/appflow/<feature>/<flow> (collect, no rules)
                                                     ├─► application services (rules, decisions, transactions)
                                                     └─► other service (parallel, timeout, person's token) ─► its own checks
writes ─► own DB + outbox ──(ADR-019 relay)──► other services' idempotent consumers
changes ─► notification-service SSE (ADR-025) ──► App refetches the flow endpoint
```

## Principles
1. The backend decides, the App displays (ADR-006); no local masks over server `actions`.
2. A rule lives once; flow code collects, never computes.
3. A screen opens when a neighbour is down; a decision is never optimistic on missing data.
4. Each service owns its writes; others follow by events.
5. Both sides test the seam with the same example files; measure calls before and after (PRINCIPLES 8).

## Testing
- **Unit per flow function:** parts assembled; missing part → `null` + `partsMissing`; decisions copied, not recomputed.
- **Timeouts:** a late stub and a failing stub; the flow answers within budget with the part missing.
- **Contract:** both sides over the shared examples (Design 5).
- **Permissions:** no part right → `NO_RIGHT`; no entry right → 403; another company → the normal refusal.
- **Architecture (ArchUnit, `NeoERP-BackEnd/architecture-tests/`):** `..appflow..` and `..delivery.http.app..` do not use repositories, JPA, `..infrastructure.persistence..` or `..domain..policy..`; no `@Transactional` in `..appflow..`; every `main` HTTP client is built by `NeoErpHttpClients`. Other "no rules" checks are a review checklist item.
- **App:** ViewModel tests show the server's decision; flow screens use no permission mask.

## Alternatives considered
| Option | For | Against | Verdict |
|---|---|---|---|
| Resource endpoints only, App calls in parallel | Nothing new | Still ~12 calls on phones; rules stay re-decided in the App | Rejected (fine for simple screens) |
| GraphQL | Flexible queries | New stack, per-field permissions, hard to cache and rate-limit | Rejected |
| Aggregation in the gateway | One place | Gateway gains business and auth knowledge; reactive vs servlet | Rejected |
| BFF service now | Clean split | One more service owning no data, calling every module | Later, with numbers (Q4) |
| Multi-service writes / sagas | Instant consistency | Partial failure and recovery across services, for money | Rejected; outbox |
| One generic screen endpoint per module | Few endpoints | Becomes the big file; no owner per flow | Rejected |

## Consequences
Screens open in 1–2 calls and App code shrinks (masks, chained loaders go). Costs: `appflow` code and a contract doc per flow; missing decisions need small BE lanes first; old flow paths live on for old Apps; a one-time gateway change.

## Rollout
| Step | Content | Repo | Measure |
|---|---|---|---|
| F0 | `shared/app-flow`; ArchUnit rules; contract doc + fixture template; timeouts on every client without one | BackEnd | — |
| F1 | Bill editor open/supplier/submit; books reference set with ETag | BackEnd, then App switches the screen | Bill editor 12 + D → ≤ 2 |
| F2 | Invoice, payment, refund editors | BE then App | 9 / 9–11 / 6 → ≤ 2 |
| F3 | Journals list, detail, editor (incl. date check for D4) | BE then App | ~12 + N + D → ≤ 2 |
| F4 | Approvals with ready decisions (D6, D11, D12 by-you on the step, D13 receipts waiting for you); approval limits in one read | BE then App | Limits ≤ 4 → 1 |
| F5 | Accounts home (entry + badges in one flow) | BE then App | Entry 6 → 1 |
| F6 | `/api/app/home` cross-module | user-service, App | — |
| F7 | Gateway split into `RouteLocator` beans | BackEnd | Route tests green |
| Rule | HR and Payroll rebuilds build flow endpoints from their first screen | Both | — |

Calls per screen are counted before and after from the App's network log and recorded in the lane report and the workflow v2 measures file.

## Open questions for Jabran
| # | Question | Recommendation |
|---|---|---|
| Q1 | Decision shape: keep `actions.<x>.{allowed, blockedBy}` or add `canApprove` style fields? | Keep `actions`; one shape, already read by the App |
| Q2 | Reads from other services on behalf of a person: relay the person's token to the normal endpoint, or `/api/internal` with machine token + person id? | Relay the person's token (called service's checks run unchanged, no new trust); internal endpoints stay for system work |
| Q3 | How long do old flow paths stay? | Until the oldest supported App version; needs a minimum-version rule (App sends `NeoERP-App-Version`; server answers 426 below the minimum) |
| Q4 | When would a separate App/BFF service pay off? | When ≥ 5 cross-module flows exist or user-service load from home flows is measurable; decide with numbers |
| Q5 | Performance targets (≤ 2 sequential calls; p95 300 / 800 ms) | Accept as targets; confirm after F1's measurement |
| Q6 | Fixture copies drift between repos | The lead's gate compares the BE and App copies (hash list) at each merge |
| Q7 | Do D4/D5 client checks stay? | Yes as hints (a warning next to the field); only the server's `actions` enables or blocks Submit |
