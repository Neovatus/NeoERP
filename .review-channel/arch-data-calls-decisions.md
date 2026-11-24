# Architecture data: calls per screen, App-side decisions, cross-service writes

Heads read: App `82b815b0`, BackEnd `7ee082b`. Read-only. The `seam-review-*` worktrees were removed while this ran, so the rest was read with `git show <sha>:<path>` from `NeoERP-App` / `NeoERP-BackEnd`. Line numbers are at those commits.

Path prefixes used below:
- `App/` = `composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/`
- `AppAcc/` = `App/features/accounts/presentation/`
- `BE/` = `services/accounts-service/src/main/kotlin/com/neovatus/accounts/`

Which service serves each path (through the gateway):

| Path | Service |
|---|---|
| `/api/accounts/*` | accounts-service |
| `/api/org/*` | org-service |
| `/api/app/bootstrap`, `/api/users/me`, `/api/rbac/*` (stand-ins included), `/api/authz/effective` | user-service |
| `/oauth2/token` | auth-service |

## 1. Calls per screen

**Shared read 1: Accounts page entry.** Every Accounts screen pays this cost once per company page (`AppAcc/home/AccountsPageViewModel.kt:127-165`, `AppAcc/AccountsRoute.kt:369-439`).
- First `GET /setup/preflight`, then `GET /setup`. These run one after the other: a chain of 2.
- When live, 4 polls start in parallel. Each runs again every 60 s and after every accepted write (`AccountsBooksChanges`, `AppAcc/AccountsCounts.kt:17-37`):
  - `GET /journals/summary` (badge)
  - `GET /receivables/summary`
  - `GET /payables/summary`
  - `GET /receipts?status=SUBMITTED&size=1`
- The Overview tab adds `GET /journals?tab=WAITING&type=OB&size=1`, then the Drafts version of the same call if nothing is waiting (`AccountsRoute.kt:1247-1257`).

**Shared read 2: "books" for journals.** `AppAcc/journals/route/JournalsPageHolder.kt:277-308`.
- 5 reads go out in parallel:
  - chart: `GET /accounts?page=n`, one page after another, N pages (`:336-350`)
  - `GET /fiscal-years` (calendar)
  - `GET /cost-centres`
  - Org: `GET /api/org/companies`, then `GET /api/org/companies/{id}` (`App/ui/shell/routing/AccountsJournalDimensions.kt:17-31` → `features/organization/data/repository/OrganizationRepositoryImpl.kt:443-449,587-593`)
  - dimension catalog (`AppAcc/dimensions/DimensionCatalog.kt:127-148`):
    - `GET /cost-centres` again (a duplicate)
    - `GET /projects`
    - `GET /dimension-definitions`, then `GET …/values` for each of D definitions
- **This set is read again every time the editor or the detail opens.** `navigate()` calls `invalidateBooks()` without `quiet` (`JournalsPageHolder.kt:154, 315-320`). Calls: N + 6 + D (D only when FREE_DIMENSIONS is on). Longest chain: max(N, 2).

**Shared read 3: document lookups** (invoice, bill and payment editors; `AppAcc/payables/PayablesSupport.kt:56-90`, `ReceivablesSupport.kt:94-98`). Each lookup is **awaited in turn inside one coroutine**, not in parallel (`AppAcc/receivables/InvoiceEditor.kt:221-241`, `AppAcc/payables/BillEditor.kt:285-305`, `AppAcc/payables/PaymentEditor.kt:201-211`).

| Screen | Calls on open (beyond the Accounts entry) | Sequential chain (longest) | Calls on main action |
|---|---|---|---|
| Sign-in bootstrap (`features/auth/domain/PkceAuthUseCases.kt:84-93`, `BootstrapWithTokensUseCase.kt:28`, `data/repository/AuthRepositoryImpl.kt:75-102`, `app/session/AppSessionEventHandler.kt:254`) | `POST /oauth2/token` → `GET /api/app/bootstrap` → `loadDashboard`. `loadDashboard` makes no call for a company user (`features/dashboard/data/PlatformDashboardRepositoryImpl.kt:53-62`); a platform admin gets the platform overview fan-out. Old-gateway fallback: `/users/me` → `/rbac/memberships` → `/authz/effective`. | **2** (fallback 4) | n/a |
| Company switch (`AppSessionEventHandler.kt:183-197`, `features/context/data/repository/ContextRepositoryImpl.kt:14-45`) | `GET /api/app/bootstrap?orgId=&branchId=` → `loadDashboard` (0 calls for a company user). Falls back to `/authz/effective` when no bootstrap comes back. Re-read on focus with 1 retry (`app/session/AppSession.kt:150-170`). Then the destination page's own reads start, e.g. the Accounts entry (2 in a chain + 4 polls). | **2**, then the page's chain (**4** if it lands on the Journals list) | n/a |
| Dashboard/home, company user | none (`PlatformDashboardRepositoryImpl.kt:53-62`) | 0 | n/a |
| Dashboard, platform admin (`features/dashboard/presentation/PlatformDashboardViewModel.kt:69-74`, `data/PlatformOverviewRepositoryImpl.kt:74-77,126`) | overview + health + adoption in parallel. The overview pages companies, the agreements renewal queue and requests, plus people. Sign-in's `loadDashboard` already read the overview, so it is read twice. | ≥2 (agreement pages are fetched one after another) | n/a |
| Accounts entry (any tab) | 6 (preflight, setup, 4 polls); Overview +1–2 | **2** | n/a |
| **Journals list** (`journals/state/JournalsListViewModel.kt:90-131`, `JournalsHost.kt:149,184`, `JournalsPageHolder.kt:240-258`) | `GET /journals/summary` → `GET /journals?…`. Books in parallel (N+6+D). `GET /recurring-journals/summary` → `GET /recurring-journals?attention=true&size=1`. The summary is also read by the badge poll, so it goes out **twice** on open. | **2** here; **4** counting the entry (preflight → setup → summary → list); N for the chart pages | Selecting a tab: list + summary (`:136-145`) |
| **Journal detail** (`JournalDetailViewModel.kt:129-133`) | `GET /journals/{id}` + books re-read (N+6+D) | 1 (books: max(N, 2)) | Post / Approve step / Reject / Reverse: 1 POST (`:451-473`). Then badge summary + 4 polls woken + list refresh on Back = **~6 follow-up reads** |
| **Journal editor** (`JournalEditorViewModel.kt:148`) | existing draft: `GET /journals/{id}` + books re-read; a new journal: books only | 1 (books max(N, 2)) | Submit = save (`POST /journals`, or `PUT`; plus an extra `PUT` after a replayed create, `:606-616`) → `POST /{id}/submit` (`:379-390`): **chain 2**. "Post my own" = save → `POST /{id}/post` (`:447-454`): **chain 2** |
| **Invoice editor** (`InvoiceEditor.kt:221-335`) | `GET /accounts?type=INCOME` → `GET /tax-codes` → dimension catalog (2 deep, 3+D calls) → Org companies → company → `GET /sales-invoices/{id}` → `GET /customers/{id}` → `GET …/open-advances` | **9** | save (`POST`/`PUT /sales-invoices`) → `POST …/submit` (`:713-725`): chain 2 |
| **Bill editor** (`BillEditor.kt:285-425`) | `GET /accounts?type=EXPENSE` → `GET /accounts?type=ASSET` → `GET /tax-codes` → dimension catalog (2 deep) → Org (2) → `GET /bills/{id}` → [`GET /suppliers/{id}/open-advances`] in parallel with [`GET /suppliers/{id}` → reference agreement OCR → reference agreement KID] (`:371-372`, one after another) | **11** | `POST /bills/duplicate-check` while typing (`:652`); save → submit (`:896-908`): chain 2 |
| **Payment editor** (`PaymentEditor.kt:201-271`) | `GET /payment-accounts` → `GET /tax-codes` (withholding) → dimension catalog (2) → `GET /accounts?hasRole=true` → Org (2) → `GET /payments/{id}` → `GET …/open-items`. For an advance, add `GET advance-tax-policy` → `GET /tax-codes` again (a duplicate, `:214-217`). | **9** (advance **11**) | save → `POST …/submit` (`:537-543`): chain 2 (+1 re-read when the answer is uncertain) |
| **Refund editor** (`RefundEditor.kt:274-310`) | `GET /payment-accounts` → Org (2) → `GET /refunds/{id}` → period read → `GET …/refund-sources` | **6** | save → submit, or save → approve-own (`:452-482`): chain 2 |
| Payment / refund detail (`PaymentDetailState.kt:249-252`, `RefundDetail.kt:262-265`) | `GET /payments/{id}`, or `GET /refunds/{id}` | 1 | approve / step / reject / reverse: 1 POST; an uncertain answer adds a re-read (`:332-340`, `:351-359`); plus the polls woken |
| **Approval limits** (`approvallimits/LimitsViewModel.kt:76-92`) | `GET /approval-limits` → `GET /approval-limits/proposals/{id}` for **each kind with a pending proposal, one after another** (3 kinds: `domain/model/ApprovalLimitsModels.kt:18`) | **up to 4** | Confirm / Decline / Withdraw / Acknowledge: 1 POST (`:214-218`), then a re-read (limits + proposals). Check amount: `GET …/check` (`:138`) |
| Limits editor (`LimitsEditorViewModel.kt:74-79`) | `GET /api/rbac/approval-stand-ins/candidates` → `GET decide-roles` | 2 | `POST` propose (`:161`); on conflict, limits → proposal (2) |
| Stand-ins (`StandInsViewModel.kt:68-70`) | `GET …/mine` → `GET …/approval-stand-ins` (user-service). The two calls are independent but run one after the other. Opening the panel adds `candidates`, called once per kind for "away" options (`:149-170`). | 2 (panel up to 1+3) | `POST` create, `PUT` change, or `POST end`: 1 (`:188,250`) |
| Opening items import page (`openingimport/OpeningImportPageController.kt:167-223`) | `GET /opening-imports/{side}/{id}` → `GET …/items` | 2 | Approve all: `POST …/approve` (`:314`); Submit all (`:243`) |
| Opening items wizard (`OpeningWizardController.kt:187-500`) | resume: `GET …/{id}` → `GET …/rows` | 2 | upload (retried once on no answer, `:307-308`) → confirm → `GET …/{id}` (`:478-493`): chain 2–3 |
| Opening balances import (`obimport/ObImportController.kt:251-275`) | `GET formats` → list, or `GET import` (+ polling via `follow`) → accounts rows | **3** | send file → follow (polling) |

**Flagged** (≥4 calls on open, or a chain of ≥2):

| Screen | Calls on open | Chain |
|---|---|---|
| Journals list | ~12+N+D | 4 (incl. entry) |
| Journal detail | N+7+D | |
| Journal editor | N+7+D | |
| Invoice editor | 9+D | **9** |
| Bill editor | 12+D | **11** |
| Payment editor | 11+D | **9** |
| Refund editor | 6 | **6** |
| Accounts entry | 6 | 2 |
| Approval limits | ≤4 | ≤4 |
| Stand-ins | | 2 |
| Limits editor | | 2 |
| Opening imports | | 2–3 |
| Sign-in | | 2 |
| Company switch | | 2 + page |

**Not flagged:** payment and refund detail (1 call each), and the dashboard for a company user (0 calls).

Repeated reads:
- `GET /cost-centres` twice in the books set.
- `GET /journals/summary` twice on the list's open.
- `GET /tax-codes` twice in the payment editor when it is an advance.
- The platform overview twice for a platform admin.

## 2. Decisions the App makes itself

**Context.** Most action buttons are server-driven. Detail DTOs carry `actions.{x}.allowed / blockedBy / ownerSelfApproval`, for example `JournalActionsDto` (`App/features/accounts/data/remote/dto/AccountsA1Dtos.kt:216-243`). The bill detail uses them alone (`AppAcc/payables/BillDetail.kt:56-80`). "Waiting for you" is also server-decided: row `waitingForYou`, query `forMe`, and summary `waitingForYou` / `waitingForYouAsStandIn` (`ItemApprovalDtos.kt:100`). `TwoPersonReason` (`AppAcc/TwoPersonReason.kt:24-67`) only picks a sentence from the roles in a server 403 refusal. It decides nothing.

The App re-decides in the places below.

| # | App file:line | What the App decides | Ready answer in the BE response? | BE place that decides the same |
|---|---|---|---|---|
| D1 | `AppAcc/AccountsAccess.kt:298-335` (`JournalsAccess.offered`), used at `JournalDetailState.kt:337,519`, `JournalEditorState.kt:421`, `AutoReversalCard.kt:128`, `JournalImportWizardState.kt:135` | Masks the server's journal actions with locally held permission codes: PLATFORM, then PERMISSION, then CONTROL_POSTING (`protectedControlLine && !postControl`, `:315`), then "owner's own needs companyOwner" (`:317`) | **Yes.** `actions.post.allowed/blockedBy/ownerSelfApproval` already apply the same checks in the same order | `BE/application/service/journal/JournalPolicy.kt:85-200` (PERMISSION `:136`, contributor/owner `:139`, `POST_CONTROL` `:143`, approve step `:161-169`) |
| D2 | `AppAcc/AccountsAccess.kt:341-360` (`journalsAccess`) | Journal read needs `JOURNAL.READ` **and** `COA.READ`; every write code also needs read and a non-platform caller | Partly (the per-journal actions) | Not checked whether BE requires COA.READ for journal reads |
| D3 | `AppAcc/journals/state/JournalEditorRules.kt:683` (+ `:758-759` `isMine`, `AccountsAccess.kt:287` `canPostOwnDraft = companyOwner && post`) | Shows **"Post my own journal"** in the editor: owner + POST + own draft + (POST_CONTROL or no control line). Falls back to `creatorId == actorId` when `createdByYou` is missing | **Yes** for a saved draft (`actions.post.ownerSelfApproval`, `allowed`). The editor does not use it. A new, unsaved draft has no answer | `JournalPolicy.kt:131-151` |
| D4 | `AppAcc/journals/state/JournalPeriodRules.kt:69-72,87-186`, used at `JournalEditorRules.kt:531,616-621` | Whether the journal date falls in an OPEN, CLOSED or LOCKED period, and whether year-end adjustments qualify. Computed from the cached fiscal calendar; **disables Submit** | No (no per-date answer; the editor reads the calendar) | `BE/application/service/posting/PostingValidator.kt:380` (PERIOD_CLOSED/LOCKED), `journal/JournalDraftService.kt:566-570` (period `FOR SHARE` at submit) |
| D5 | `JournalEditorState.kt:225` (`SubmitReasonKind`), `JournalEditorRules.kt:531` (`submitBlocks`) | Client-side submit gates: balance, lines, accounts, memo, doc ref/date, control reason, auto-reverse | No (validation mirror) | Posting validator / draft service (same file as D4) |
| D6 | `AppAcc/approvallimits/LimitsState.kt:155-156` (`canAcknowledge`), used at `LimitsScreen.kt:210`, `LimitsViewModel.kt:180` | Who may **acknowledge a confirm-alone**: a CONFIRM holder other than the confirmer (`confirmerId != actorId`) | **No.** The kind's `actions` carries only `propose` (`BE/delivery/http/approvallimits/ApprovalLimitJson.kt:42`) | `BE/application/service/approvallimits/ApprovalLimitService.kt:420` (`confirmedByUserId == userId` → PROPOSER_CANNOT_CONFIRM) |
| D7 | `LimitsState.kt:112-113` (`isMine`), `LimitsEditorViewModel.kt:182` | The proposer never confirms: `proposedByUserId == actorId`, **or** the server's `blockedBy == PROPOSER` | Yes (`confirm.allowed/blockedBy/alone/others`) | `ApprovalLimitService.kt:342` (+ `:218` owner-alone) |
| D8 | `AppAcc/ApprovalLimitsAccess.kt:86-104` (`offeredPropose/Withdraw/Decline/Confirm`) | Masks the server's propose, confirm, decline and withdraw with the PLATFORM, FEATURE_OFF and PERMISSION codes | Yes (per-action `allowed/blockedBy`) | `ApprovalLimitService` + `ApprovalLimitController.kt:48` (feature gating per action) |
| D9 | `AppAcc/approvallimits/StandInsState.kt:96-104` | Stand-in form rules: not yourself; someone setting a stand-in for another person can't name themselves (SR-H1); covers required; dates | No (form validation) | `services/user-service/.../approval/ApprovalStandInService.kt:307-312` (`STANDIN_SETTER_IS_STANDIN`) |
| D10 | `StandInsState.kt:71-79` (`kindsFor`, `setByOther`), `StandInsScreen.kt:176` | Which kinds a stand-in may cover: your own decide-kinds when you are the one away; all kinds otherwise | Partly (`mine.decideKinds` from the server) | `ApprovalStandInService.kt` (create/change checks) |
| D11 | `AppAcc/openingimport/OpeningImportPageController.kt:185` (`isImporter = import.createdBy == actorId`), used at `:125` (card) and **`:304`** | **Sends `ownerSelfApproval = isImporter` on Continue** (identity compared on the App). The card picks WaitingImporter or WaitingOthers | **Yes.** `actions.approve.requires` lists `"ownerSelfApproval"` when it is the caller's own (`BE/application/service/subledger/openingimport/OpeningItemImportService.kt:417`) | `OpeningItemImportService.kt:663-684` (OWNER_CONFIRMATION_REQUIRED `:674`) |
| D12 | `AppAcc/payables/PaymentDetailState.kt:339-349`, `receivables/RefundDetail.kt:359-366` | After an **uncertain** step approve, re-reads and decides "my approval landed" when `decided.byUserId == actorId`. **If there is no actor id, it compares `byName == actorName`** | No (no idempotency key and no "byYou" on the step) | Server step approval (payment/refund approval services) |
| D13 | `AppAcc/AccountsRoute.kt:407-416` | The receipts menu badge counts **all SUBMITTED receipts**, not just the ones waiting for this person | No (the summary carries drafts only; comment `:407`) | Not decided on the BE (no receipts `waitingForYou` count) |
| D14 | `AppAcc/periods/PeriodCloseState.kt:358`, `PeriodCloseViewModel.kt:526-528` | Close/Reopen/Lock offered only when `status == Open/Closed` **and** `offered(actions…)` masks with local codes | Yes (`detail.actions`) | `BE/application/service/period/PeriodControlService.kt` |
| D15 | `AppAcc/RecurringAccess.kt:123-140`; `PaymentDetailState.kt:89-126`; `RefundDetail.kt:69-95` | Server `a.x.allowed` **AND** a local right (`access.writePayment`, `approveRefund`, `reversePayment` …) | Yes (`actions`) | Each read service's `actions()` (`ArDocumentReadService.kt:148`, `ReceiptReadService.kt:102`, `RefundReadService.kt:309`, `PaymentReadService.kt`, `JournalImportService.kt:300`) |
| D16 | `AppAcc/journals/state/JournalsListViewModel.kt:115-116` | The default tab, and "only mine to post" switched on when `waitingForYou > 0` | Yes (summary count) | UI default only |

Summary of Section 2:
- **4 decisions with no BE answer:** D6, D11 (BE has `requires`, the App uses identity instead), D12, D13.
- **About 7 duplicate masks** over BE `actions`: D1, D3, D7, D8, D14, D15, D16.
- **3 rule mirrors:** D4, D5, D9 (form/period validation that the BE enforces again).

## 3. Cross-service writes (future HR/Payroll → Accounts)

Read by a sub-agent at BE `7ee082b`; the paths are from the BackEnd repo root.

**Today no service posts journals into accounts-service.**

**Transport** (ADR-019, `docs/adr/ADR-019-domain-event-relay.md`):
- There is no Kafka or Rabbit.
- The producer writes `domain_event_outbox` and one `domain_event_deliveries` row per subscriber, in the same transaction (`shared/domain-events/.../producer/jdbc/JdbcOutboxStore.kt:25-41`).
- The consumer pulls over HTTP: lease (60 s), then ack (`producer/DomainEventFeed.kt:35,52`).
- org-service's feed: `GET /api/internal/org/events` + `POST /ack` (`services/org-service/.../delivery/http/events/controller/OrgEventsController.kt:36-55`). Its only allowed client is `neoerp-accounts-service`.

**Events accounts-service consumes** (all from org-service; there are no other consumers):

| Event type | Producer write | Consumer | Idempotency key |
|---|---|---|---|
| `org.company.finance_enabled` | SQL function `org_company_facts_bumped`, `services/org-service/src/main/resources/db/migration/V36__org_events_v2.sql:37-138` (outbox insert `:108-128`, deliveries `:130-133`, accounts subscription `:27-33`). Fired by deferred triggers via `org_apply_company_facts` (`V34__dated_organisation_facts.sql:668,795-803`). No Kotlin write path. | `BE/application/service/sync/OrgEventPoller.kt:32-53` (poll every 5 s) → `OrgEventWorker.kt:53-95` (work every 2 s) → `CompanyBooksSync.sync(…, "org-event:${eventId}")` (`:60`) | `accounts.org_event_inbox` PK `event_id` (`services/accounts-service/src/main/resources/db/migration/V6__a0_baseline.sql:360-373`); `ON CONFLICT (event_id) DO NOTHING` (`BE/infrastructure/persistence/jdbc/OrgSyncJdbcAdapters.kt:25-30`); acked after the insert commits (`OrgEventPoller.kt:42-45`) |
| `org.company.finance_disabled` | same | same (maps to ORG_FACTS_CHANGED, `OrgEventWorker.kt:93-94`) | same |
| `org.company.facts_changed` | same | same | same |

The shared `ConsumerPoller`, `InboxProcessor` and `JdbcInboxStore` (`shared/domain-events`) are **not used by any service**. accounts uses its own older poller.

**Internal endpoints on accounts-service.** `@InternalEndpoint` checks a machine JWT with audience `neoerp-accounts-internal`, the scope and `allowedClients`. The gateway has no route to these paths.

| Endpoint | Scope / clients | Caller today |
|---|---|---|
| `GET /api/internal/accounts/books-state` (`BE/delivery/http/internal/BooksStateController.kt:24-36`) | `accounts.books.read`; only `neoerp-org-service` | org-service `AccountsBooksStateClient.kt:120` (fiscal-facts lock) |
| `POST /api/internal/accounts/postings`, `POST /{journalId}/reverse`, `GET /{sourceModule}/{idempotencyKey}` (`BE/delivery/http/internal/postings/MachinePostingController.kt:33-71`) | `accounts.posting.write`; only `neoerp-accounts-posting-test` | **Nobody in production.** The client list is empty (`application.properties:86-89`); it is set only in `src/test/resources/application-test.properties:2-5` (PAYROLL,TEST; PR,PY; PAYROLL). Only `AccountsPostingV1` is accepted (`MachinePostingDtos.kt:83,212-215`). |

The machine posting API's idempotency is the unique index `uq_journal_entries_idempotency (company_id, source_module, idempotency_key)` plus a request-hash check (`V10__a1_journals.sql:138,143-144`). The replay lookup is at `BE/application/service/posting/MachinePostingService.kt:180`; a replay answers 200 with an `Idempotent-Replay` header.

**Events accounts-service produces:**
- About 40 `accounts.*` types (`BE/application/service/audit/AccountsDomainEventWriter.kt:13-67`), written via `DomainOutboxAdapter.kt`.
- **No consumers are subscribed** (`V18__domain_event_relay.sql:15-16`; `application.properties:190-196` "no consumer yet … no feed endpoint"). Nothing is stored until a consumer subscribes.
- Separately, an audit outbox is relayed over HTTP to audit-service (`AuditOutboxDispatcher.kt`).

**HR/Payroll today:**
- `PayRunService.post()` (`services/payroll-service/.../run/PayRunService.kt:139-163`) only marks the run posted and creates payslips locally. It makes no HTTP call and writes no outbox row.
- Neither hr-service nor payroll-service depends on `:shared:domain-events`.
- `neoerp-payroll-service` lacks `accounts.posting.write` (`services/auth-service/.../MachineClientCatalog.kt:104-108`).
- What is prepared on the Accounts side:
  - journal type `PR` (`V10:46`)
  - control kind `PAYROLL` (`V10:53,63`)
  - `PAYROLL_LIABILITY` report lines (`V13:241`, `V14:62`)
- The design is `docs/api/payroll-v2-p2.md`, approved 2026-10-21, "Nothing here is built yet":
  - a PR journal via `/api/internal/accounts/postings` with `AccountsPostingV2` (not defined yet, refused today)
  - a payroll outbox `payroll.pay_run_postings` with `UNIQUE (company_id, idempotency_key)` and keys `PAYROLL_RUN:{runId}:{seq}`
  - a payroll inbox keyed by `eventId` for `accounts.books.went_live`
- No HR → Accounts posting design was found. hr-service only has an IAM-link outbox to user-service.

## How measured / what is not covered

**How measured.**
- Static reading of the ViewModels, controllers, repositories and API classes, following `init`, `LaunchedEffect` and `scope.launch`.
- "Sequential" means awaited one after another in the same coroutine. "Parallel" means `async`, or separate `launch`/`LaunchedEffect`.
- Counts assume a live company, full rights and an existing draft.
- N = chart pages (server page size, not looked up). D = active free-dimension definitions.
- Nothing was run (no network trace), so retries, 401 refreshes and polling ticks after the first are not counted.

**Not covered:**
- The receivables and payables **list** screens, sales-document and bill detail open calls, reports, period close, year-end, SIE, recurring journals and customers/suppliers.
- The BE side of `/api/app/bootstrap`'s own fan-out. The App comment says it includes org-service entitlements (`app/session/AppSession.kt:153-155`).
- The platform dashboard pages in detail.
- Whether BE requires COA.READ for journal reads (D2).
- Section 3 was gathered by a sub-agent and not re-verified line by line.

Brief: unclear or missing. "Calls on main action" was read as the primary write plus the follow-up reads it triggers; the follow-ups are listed separately. The brief named both "opening balances" and "items import", so both opening flows (OB import and opening items import) are covered. The brief gave no rights profile, so full rights were assumed. The worktrees disappeared mid-run, so the remaining reads came from git objects at the same SHAs.
