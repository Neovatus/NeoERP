# Lane verdict: R29b-5 (audit-service and auth-service company isolation, last R29b sub-lane) — 2026-11-22

**Verdict: MERGE**, **merged** (standing merge): BE `phase/4` `095a8989` → `1560d0d6` (fast-forward, RISK marker).
- Scope: audit ports split into tenant-owned / platform / system ports with pins; platform-wide reads recorded first (503 on record failure, Q5); notification retry records `PLATFORM_WRITE` first; machine decide-by-subject limited to the calling producer; `RESERVED_AUDIT_SOURCE` 400; auth `StableIdentityLinkRepository` as a system entry; unused auth reads deleted; unclassified cap 23 → 18. No AI attribution.
- Reviews: Opus (no H/M) and Fable (1 text MEDIUM, fixed), both ACCEPT; re-stamps after the base move `review-5-7-opus.md`, `review-5-6-fable.md` (Reviewed `980f64df`).
- **Gate:** `verify: OK`, 15 min (under load: simulator tester + stack running), REVIEWS OK, marker `1560d0d6`.
- **Jar-mode check** (stack from the lane, 8 healthy; Sonnet tester, `r29b-5-simulator-checks.md`): company Activity (Ola), platform audit log (superadmin, no 503), no other company's rows: PASS. Notification inbox and retry/attempts: N-A (no App screen yet; inbox is an old module held until rebuilt).
- Release-gate rows R29b-5-F1, F3, N1 added on the next BE `phase/4` docs commit (rides on OUTBOX-CLAIM-BE `phase/4-outbox-claim-r`).
- Observation → backlog: the platform audit log's newest rows are its own platform-read records (all "Other" in the category chips).
- Next: R29b-3U rebases on `1560d0d6` (cap meets 0, D-37 item 3); lead deletes `docs/agents/r29b/evidence/` after R29b-3U merges.

## Timeline (MEASURE-1, old-Mac part)
- Gate 15 min; jar build 1 min; stack start ~3 min; simulator check 3 min; merge 2 min. Waiting: ~25 min behind the AC418-APP tester (shared stack).
