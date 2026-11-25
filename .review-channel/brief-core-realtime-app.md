# Brief: `core/realtime` flow 3 `app` · App (BackEnd read only) · review: one Opus 5.5 high

Feature `core/realtime` (split): `actions` + `hub` merged into BE `core/realtime/feature` (9f372ce) → **`app`** → `first-users`. This flow's branch: `core/realtime/app` (App) from `origin/core/realtime/feature` (App; still at `main`). Use `docs/templates/brief.md` for everything not said here.

## Goal
The signed-in App holds **one** SSE connection to `realtime-service` and gives features one small interface: wait on an action id (with polling fallback) and receive the person's own events. Nothing visible changes for users yet except a quiet connection status; flow 4 makes the first screens use it.

## Decided rules (sources)
- ADR-025 App part (`docs/drafts/ADR-025-realtime-notifications.md`, "App" and D2/D3, as amended 2026-11-24): `NeoEventStreamClient` (Ktor `openEventStream()` on the authenticated `stream()`, a common SSE line parser), `NeoRealtimeHub` (one connection; status Live / Connecting / Reconnecting / Offline / Polling), `NeoRealtimeEvents` (the only interface features see), `NeoActionWaiter` (listens on the stream for its `actionId`; falls back to polling `statusUrl`: every 2 s for 20 s, then every 10 s), `NeoRealtimeSessionBridge` (`access.changed` → entitlement refetch; `session.ending` → sign-out flow).
- **No request timeout on the stream** (the App's 30 s request timeout cuts it today; ~60 s socket timeout instead); bearer header, never a token in the URL; `Last-Event-ID` on reconnect; `event: reauth` → refresh the token and reconnect; `event: reset` (incl. reason `CURSOR_INVALID`) → features refetch what is on screen; back-off 1…30 s with jitter.
- New codes to word in en/nb/sv/da where a person can see them: `STREAM_LIMIT_REACHED`, `STREAM_UNAVAILABLE` (the App falls back to polling silently; words only where the status is shown).
- Platforms: desktop keeps the stream while signed in (paused after 10 min hidden); Android and iOS foreground only.
- The contract is the hub's published examples (BE `core/realtime/feature`, the realtime contract page and fixtures): read them; tests use them (workflow v2 rule: JSON from the BE's examples; simulated cases marked `simulated`).
- ADR-027 contract rules; ADR-028: new code goes in `core/realtime` packages shaped for the later `:core` module (no feature imports).

## Scope edges
- **In:** `core/realtime` (client, hub, events, waiter, session bridge), the network runtime's streaming timeout, DI wiring, the connection status in the shell (a quiet indicator only when not Live for > a few seconds, per ADR-025), docs (developer page), tests.
- **Out:** making screens use it (flow 4 `first-users`: export/SIE/OB waiters, badges, `access.changed` sign-out), notifications, push.

## Definition of Done (plus v2 §5)
- Failing-first tests: parser (multi-line data, ids, comments/heartbeats), reconnect with `Last-Event-ID`, reauth, reset → refetch signal, back-off, waiter completes on the stream event and on polling fallback, stream down → Polling status, no 30 s cut-off, one connection per session, company switch reconnects for the new company.
- Labels and `testTag`s on any new UI element (the status indicator); size tests in four languages for it.
- Builders run only their own tests + compile; never edit gate scripts; no gate or whole suite.
