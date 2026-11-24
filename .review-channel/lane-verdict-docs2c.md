# Lane verdict: DOCS-2c (Phase 4 Accounts user-guide screenshots) — 2026-11-24

**Verdict: MERGE**, **merged** (standing merge): App `phase/4` `dae20eb1` → `5b65071e` (rebase clean). New-Mac build (Sonnet 5.5; brief check was its step 0); old Mac gate + merge.
- Scope: all 11 placeholder shots in `phase4-shots.json` are real, rendered by the new jvmTest `Phase4GuideScreenshotTest` on demo data (light theme, entry's device width and demo person). Test-only code (`ScreenSizes.shoot()`, fixtures); no product code. Page text fixed to match the app in `recurring-journals.md`, `automatic-reversals.md`, `refunds-and-write-offs.md`. Images in `docs/user-guide/images/accounts/`.
- Tier 1 (docs), `risk-check` NORMAL. Review: `review-1-opus.md` FIX (2 MEDIUM, 6 LOW), fix round 1, then `review-2-opus.md` ACCEPT. Each image read by builder and reviewer.
- Tests: `Phase4GuideScreenshotTest` 11 tests, 0 failed, exit 0 after the fix round.
- **Gate:** `verify: OK`, 4147/0/1, about 14 min, no review files needed (NORMAL).
- **First-pass gate:** yes (1 run, OK).
- Follow-ups: recurring detail head draws an empty body strip for non-writers; clipping from scrolling (refund detail, import result, accrual panel cut at the bottom edge); refunds Example wording.
- Docs pages: user guide `recurring-journals.md`, `automatic-reversals.md`, `refunds-and-write-offs.md`, the status lines of all five Phase 4 pages, `tools/phase4-shots.json`, 11 images.
- Brief: gaps were which Creates mode the editor shot should show, and whether a dialog shot needs its page behind it.

## Timeline (MEASURE-1)
- Assigned 24 Nov about 15:05, lane-ready about 15:50. Build about 14 min; review about 3 min; rework about 2 min; re-check under 1 min; gate about 14 min; waiting not recorded.
- Tokens: builder about 296 k; reviewer about 157 k.
