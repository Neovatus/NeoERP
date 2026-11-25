# Brief: `core/realtime` flow 4 `first-users` · BackEnd + App · review: one Opus 5.5 high

Feature `core/realtime`: `actions`, `hub` (BE) and `app` (App) merged into `core/realtime/feature` in each repo → **`first-users`** (last flow). Branches: `core/realtime/first-users` in BE (from BE feature 9f372ce) and App (from App feature). Use `docs/templates/brief.md` for everything not said here. One builder per repo, BE first.

## Goal
The first screens use realtime: long jobs finish live instead of by polling, and a person removed from a company or whose session ends is handled at once.

## Decided rules (sources: ADR-025 D2/D3 as amended 2026-11-24; ADR-027)
1. **Waiters on the long jobs from flow 1:** Accounts export, SIE import parse, opening-balance import parse, opening-items approve-all. The App starts the job, shows "Working…" with "Continue in background", and `NeoActionWaiter` completes on `accounts.action.finished` (polling fallback as built). Completion: toast; failure: the server's error code worded. Replace each screen's own polling loop (exports 7 s, SIE 7 s, OB 1.5 s): remove it, don't keep both.
2. **`access.changed`** (BE produces it when a person's membership or rights in a company change; the stream delivers it to that person): the App re-reads entitlements at once; a person removed from the current company is moved out of it with a clear message. **`session.ending`** → the existing sign-out flow. BE: produce both events from user-service/org-service via the outbox and deliver them through `realtime-service` (topic `user:{me}`); publish their contract examples (the App's simulated frames from flow 3 are replaced by the BE copies).
3. **Badge counts are not in this flow** (they come with `core/notifications`). Badges keep polling for now.
4. **Migration renumber** (merge order decided): accounts `V81__action_runs` → **V82**, accounts V82 (event feed) → **V83**, with every reference and test; never applied outside Testcontainers. `accounts/dimension-rules` keeps V80/V81 and reaches `main` first.
5. **Doc fix:** BE `docs/api/realtime-stream.md` §4: the stream is cut by the 30 s socket/read-idle timeout, not the request timeout.

## Scope edges
- **In:** BE: event producers for `access.changed` and `session.ending`, realtime consumers, examples, the renumber, the doc fix. App: the four job screens' waiters, the entitlement/session bridge on real events, removal of the old polling loops, words in en/nb/sv/da, size and a11y tests, UI tests on the JSON mock data source with the BE examples.
- **Out:** notifications and badges, push, per-record live screens.

## Definition of Done (plus v2 §5)
- Failing-first tests: each waiter completes on the event and on the polling fallback; no double completion; the removed person leaves the company screen; `session.ending` signs out; events reach only their person; renumbered migrations apply in order after V80/V81 from `main`.
- Simulator test on the old Mac (AXe): an export and an SIE import finishing live; a person removed in another session is moved out.
- Builders run only their own tests + compile; never edit gate scripts; no gate or whole suite.
