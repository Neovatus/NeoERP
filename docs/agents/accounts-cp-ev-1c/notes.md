# CP-EV-1c — Accounts cutover to OrgEventsV2 (notes for the brief, HOLD)

Source: `NeoERP-BackEnd/docs/api/org-events-v2.md` §7, ERP-172, ERP-176, ERP-210.

- One path at a time (ERP-210): V1 and V2 lease the same deliveries and neither inbox de-duplicates across the other. Accounts-side guard: a startup check that refuses to run with both `accounts.org-sync.enabled=true` and `neoerp.events.consumers.org.enabled=true` (fail fast, clear log). Cutover in one deploy: stop V1 poller → worker drains `org_event_inbox` → V2 consumer starts. Lead preference: the Accounts startup check; no Org-side path flag needed.
- Handlers per type at typeVersion 1 delegating to `OrgEventWorker` logic: SKIPPED (finance off), STALE (`subjectVersion` ≤ stored `factsVersion`), else recompute from `/facts/accounts`.
- Backoff change accepted (30 s doubling to 1 h, PARKED after 10).
- V2 client tolerates unknown fields (shared rule, playbook §3; ACC-246 pattern).
- `org_event_inbox`, `OrgEventPoller`, `OrgEventWorker` removed in a later migration after drain + 90 days; then org drops V1.
- Builder rule: isolated checkout; migration frozen once applied anywhere.
