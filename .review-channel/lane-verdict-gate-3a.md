# Lane verdict: GATE-3a (a review survives a clean rebase) — BE + App — 2026-11-22

**Verdict: MERGE**, **merged** (standing merge): BE `phase/4` `66148f9d` → `8472c728`; App `phase/4` `6c680b49` → `a8e004a6`. New-Mac build; old Mac gate + merge (D-61). Tier 2 (gate scripts): two Opus seats per repo (D-43).
- Scope: `risk-check.sh --reviews` accepts a review file whose `Reviewed:` SHA is not an ancestor of HEAD only when five conditions hold (patch-identical commits in order, lane files byte-identical, base only moved forward, base move touches no lane file, only plain `100644` review files follow). Full 40-hex SHAs only; fails closed. Prints `REVIEW CARRIED OVER: ...` before `REVIEWS OK`. Same code, messages and 15 test names in both repos. Docs: `docs/operations/verify.md` "Reviews after a rebase".
- Reviews: round 1, BE seat 1 FIX (parity), seat 2 ACCEPT; App FIX from both seats. App seat 2 found a **real bypass**: a fetched tag named like the short SHA could point at a forged, patch-identical chain. Fix round 1 (D-52) closed it and added fail-closed behaviour. Final: both seats ACCEPT in both repos; seat 2 retried the bypass variants (tag, branch, 40-hex ref, abbreviated SHA, replace ref, SHA missing locally) in a throwaway repo, all refuse or resolve to the real commit. Two re-stamps after the rebase ("the last").
- Tests (builder): BE `risk-check-test.sh` 125/125 on `7e7a3ff8`; App 117/117 on `e4d1aba7`. Each new case fails on the round-1 head. No Gradle.
- **Gate:** "gate OK" in both repos; gate time and run count not recorded.
- **First-pass gate:** not recorded (run count not recorded; merged).
- Effect: re-stamp files 22 before, 0 after; 2 later carry-overs (TEST-SCOPE-1 BE 13 commits, App 17 commits).
- Follow-ups (GATE-3 remainder): port BE `same_at` hit check to the App; 7-hex SHAs still accepted on the ancestor path; BE gets the App's newline-path and case-variant tests; App hook re-runs `--reviews` on the remote copy; `$range` resolved twice (fails closed); rule 3 is path-only by design.
- Docs pages: developer `docs/operations/verify.md` (both repos); user guide none.
- Brief: none unclear or missing from the builders (D-67); seat 1 noted the App `same_at` gap (now a row).

## Timeline (MEASURE-1)
- Build: BE 20 min, App 25 min, in parallel.
- Rework: fix round 1, BE about 30 min, App about 60 min.
- Review: round 1 seat 1 7 min, seat 2 9 min; fix checks 3 + 3 min.
- Test: inside the build (scripts only).
- Waiting: about 10 min. Gate time: not recorded.
- Size: BE 13 commits, App 15 commits; 1 fix round. Tokens: builders about 185 k (BE) and 215 k (App); seat 1 about 180 k; seat 2 about 200 k.
