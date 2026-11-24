# Lane ready: DOCS-2c (Phase 4 Accounts user-guide screenshots) — 2026-11-24

**Repo / branch:** `NeoERP-App`, `phase/4-b2-docs2c-r`, head `5b65071e`, rebased onto App `phase/4` `dae20eb1`. The rebase was clean.
**Brief:** `docs/agents/docs2c/brief.md`. Builder: Sonnet 5.5 (the brief check was its step 0). Report: `builder-report.md`, with a "Fix round 1" section.
**Tier 1 (docs).** `risk-check`: **NORMAL**. One Opus review: `review-1-opus.md` (FIX, 2 MEDIUM and 6 LOW), then `review-2-opus.md` (ACCEPT).

## What it does
- **All 11 placeholder shots in `phase4-shots.json` are real.** Every screen is built, so none was faked. They are rendered by the new jvmTest `Phase4GuideScreenshotTest` on demo data, light theme, with the entry's device width and demo person in the shell.
  - Images: `docs/user-guide/images/accounts/`.
  - The json entries have their testClass and source filled in, status done.
- **Test-only code:** `ScreenSizes.shoot()` (one scene in the shell; the existing size tests are unchanged) and fixtures inside the new test. No product code.
- **Page text fixed to match the app:**
  - `recurring-journals.md`: `{period}`.
  - `automatic-reversals.md`: "1 Nov 2026".
  - `refunds-and-write-offs.md`: role, bank account name, the "Date" field, 5,000 example.

## Tests
- `*Phase4GuideScreenshotTest`: 11 tests, 0 failed, exit 0 (after the fix round).
- Each image was read by the builder and the reviewer.

## For the old Mac
1. Gate it: `scripts/verify.sh --range origin/phase/4..HEAD`. NORMAL, so no review files are needed.
2. Merge it.

## Follow-up rows
- **App:** the recurring detail head draws an empty body strip for non-writers.
- **Clipping from scrolling (LOW 7):** the refund detail, the import result and the accrual panel are cut at the bottom edge.
- **Wording:** the refunds Example reads "from the bank account 1920 Bank - main operating account"; it could be lighter.

## Docs pages
- **User guide:**
  - `accounts/recurring-journals.md`
  - `automatic-reversals.md`
  - `refunds-and-write-offs.md`
  - the status lines of all five Phase 4 pages
  - `tools/phase4-shots.json`
  - 11 images

## Timeline (new Mac; Europe/Oslo)
- **Assigned:** 24 Nov at about 15:05.
- **Build:** about 14 m.
- **Review:** about 3 m.
- **Rework:** about 2 m.
- **Re-check:** under 1 m.
- **Rebase:** clean.
- **Lane-ready:** about 15:50.
- **First-pass gate:** pending.
- **Tokens:** builder about 296 k; reviewer about 157 k.
- **Brief gaps:** which Creates mode the editor shot should show, and whether a dialog shot needs its page behind it.
