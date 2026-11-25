# Brief: `core/realtime` flow 2 `hub` · BackEnd · review: one Opus 5.5 high

Feature `core/realtime` (split): `actions` (merged into `core/realtime/feature` 702ce2c) → **`hub`** → `app` → `first-users`. This flow's branch: `core/realtime/hub` (BE) from `origin/core/realtime/feature` (now 833cba2: includes the `.env` lines `REALTIME_DB_PASSWORD`, `REALTIME_FLYWAY_PASSWORD`, never opened or printed by anyone). Use `docs/templates/brief.md` for everything not said here.

## Goal
A new service, **`realtime-service`**, holds one SSE stream per signed-in session and delivers the person's own events to the open App within seconds: `{module}.action.finished` (from flow 1), later notification counts, `access.changed`, `session.ending`.

## Decided rules (sources)
- ADR-025 **D3** (`docs/drafts/ADR-025-realtime-notifications.md`) as **amended 2026-11-24**: served by `realtime-service` (not notification-service); topic **`user:{me}` only** for now (no `company:{id}:{module}` topics, no stream contracts, no snapshots); optional coarse `{module}.changed` ping later, not in this flow.
- `GET /api/stream?companyId=…`, bearer header (never a token in the URL); one gateway route with no timeout and no buffering.
- Envelope `{type, companyId, branchId, subject{type,id}, subjectVersion, actionId, actorIsYou, occurredAt}`: no amounts, names or numbers.
- Token expiry: the server closes at `exp` with `event: reauth`; the App reconnects with `Last-Event-ID`; lifecycle (active person, company membership) re-checked on every connect.
- Replay: sequence ids; 10-minute window; older → `event: reset`. Limits: 5 streams per person, heartbeat 25 s, 500-event queue per connection, same-subject merge within 1 s, overflow → reset.
- Fan-out: `realtime-service` is one ADR-019 consumer (inbox, duplicates dropped by event id); writes `stream_events` (kept 24 h) and `NOTIFY` in its own database; every instance `LISTEN`s on one dedicated non-pooled connection. No Redis or broker. Virtual threads + async `SseEmitter`.
- Own database `neoerp_realtime` (roles like the other services; passwords from the `.env` keys above via the existing role script pattern); its own Flyway history from V1.
- Company isolation: a person only ever receives events for themselves and a company they belong to; tenant architecture test covers the new service.

## Scope edges
- **In:** the new service module (`services/realtime-service`), its DB, role script and compose/infra wiring, the gateway route, `run-all-services.sh` entry, the consumer of `accounts.action.finished`, docs (`docs/api/`, developer page, hosting rows P-27/P-28), contract examples of the stream events for flow 3.
- **Out:** the App client (flow 3), notifications (`core/notifications`), push, per-record topics, snapshots.

## Definition of Done (plus v2 §5)
- Failing-first tests: auth refused without a token, wrong company refused, events only to their own person, replay after reconnect inside the window, `reset` outside it, reauth at expiry, the 5-stream limit, heartbeat, duplicate event dropped once, two instances both deliver (LISTEN/NOTIFY).
- Contract examples (each event type, `reauth`, `reset`) in the ADR-027 fixtures path.
- Builders run only their own tests + compile; never edit gate scripts; no gate or whole suite (Jabran decides at the feature's end).
