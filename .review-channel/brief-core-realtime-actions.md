# Brief: `core/realtime` flow 1 `actions` · BackEnd (App side read only) · review: one Opus 5.5 high

Feature `core/realtime` (split): flows `actions` → `hub` → `app` → `first-users`. Branches: feature `core/realtime/feature` (BE and App, from `main`), this flow `core/realtime/actions` (BE). Module/integration lead: old-Mac lead. Use `docs/templates/brief.md` for everything not said here (who you are, discovery is yours, progress notes, not a limit, Definition of Done).

## Goal
Every long-running write in the system gets an **action id**: the App can wait on it or carry on, can ask its status, and the system emits an "action finished" event that the SSE hub (flow 2) will deliver. First users: accounts exports, SIE import, opening-balance/opening-items import runs.

## Decided rules (sources)
- ADR-025 **D2 Action ids** (`docs/drafts/ADR-025-realtime-notifications.md`) unchanged: quick writes (< ~2 s) answer as today plus header `NeoERP-Action-Id` (= correlation id into ADR-019 `correlationId` and audit; nothing stored); asynchronous writes answer `202`, `Location: /api/{module}/actions/{actionId}`, body `{actionId, kind, status: QUEUED, subject, statusUrl}`; status `GET /api/{module}/actions/{id}` with `QUEUED|RUNNING|SUCCEEDED|SUCCEEDED_WITH_PROBLEMS|FAILED|CANCELLED`, progress, result links, error `{code, details}` (codes, never server text), timestamps; readable by the starter (+ platform staff read-only), company-bound, others 404; same Idempotency-Key + same body → same actionId (200 `Idempotent-Replay`), other body → 409; the action id is never the idempotency key; finish writes `{service}.action.finished` to the outbox in the same transaction as the final status; kept 7 days; shared module `:shared:actions` (table `action_runs`, status helper, header filter, completion event, retention). Existing jobs keep working; they add `actionId` and the shared status names.
- ADR-025 **Amendment 2026-11-24**: three services; the stream (flow 2, `realtime-service`) carries only the person's own events; this flow only produces the events.
- ADR-019 outbox/inbox for the completion event; ADR-027 contract rules (explicit `null` marked, enums may grow, stable error codes, contract examples published for the App).
- Company isolation: every action row company-scoped; tenant architecture test green.

## Scope edges
- **In:** `shared/actions` (new), accounts-service exports / SIE / OB import and runs adopt it, docs (`docs/api/`, developer page), contract examples for flow 3.
- **Out:** the SSE hub and `realtime-service` (flow 2), the App waiter (flow 3), notifications, push. HR/Payroll adopt later.

## Definition of Done (plus v2 §5)
- Failing-first tests for every rule above (idempotent replay, 409 on other body, 404 for others, company scope, final status + outbox event in one transaction, retention); migrations listed against `origin/main`.
- Contract examples for 202 body, status answers (each status, with `null` where a field can be empty) and the completion event in `docs/agents/realtime/contract/`.
- Builders run only their own tests + compile; no whole suite (ask the module lead).
