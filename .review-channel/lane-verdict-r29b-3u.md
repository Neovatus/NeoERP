# Lane verdict: R29b-3U (user-service and org-service company isolation; last R29b lane, cap 0) — 2026-11-22

**Verdict: MERGE**, **merged** (standing merge): BE `phase/4` `6d948693` → `1c0fc25c` (fast-forward, RISK marker). New-Mac lane; tier 2.
- `MAX_UNCLASSIFIED` = **0**: every repository entry in every service is classified (R29b complete).
- Rebase onto `6d948693` found a **semantic merge break** (AL-REST-BE's `companyRoles` called the replaced unscoped `findUsersByIds`; no text conflict; compile failed). Caught by both Opus seats; fixed in `81b9f591` (scoped `findByIds`). Escaped-defects row added; rule: counts only from the run's own output.
- Reviews: round 1 + fix checks; re-stamps `review-3u-7-opus.md`, `review-3u-8-opus-sec.md` (two Opus seats, D-43).
- **Gate:** `verify: OK`, 12 min, money invariants OK, marker `1c0fc25c`. Builder run (own output): user 737/0/4, arch 92/0.
- Stack note: start org-service before user-service (N2).
- **Rows to add** (release gates / backlog): ride on EMAIL-UNIQ-BE's rebase commit (BE docs), together with deleting `docs/agents/r29b/evidence/` (D-37 item 3).
