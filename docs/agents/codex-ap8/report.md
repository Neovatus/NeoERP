# AP-8 report — 2026-11-06

Commit: `981d28aca8f96ab043cf8bfd69f8effc00f5337c`, branch `codex/ap-8`, assigned app worktree. No push or merge.

Built: File (CSV/Excel and country-provided formats), Check (columns, numbers, date), Accounts (mapping, trial-balance preview, held-out amounts, difference), Confirm, imported-file list/result, reviewed party-balance prefill into opening items, neutral journal source links. Legacy OB entry redirects; SIE history remains separately accessible. Live repository explicitly returns unavailable, never mock success.

Mock assumptions: CSV uses supplied rows; Excel/SIE use synthetic scenarios after signature checks, not production parsers. OBI-12's unspecified wire shape is isolated as a typed mock handoff; unknown invoice references/dates require user input; OI control total remains independently typed. No server endpoint invented for this handoff.

Verification: accounts package run reported 1,673 tests with three new-class initialization failures (non-Unit test methods); those declarations were fixed. All focused OB tests then passed: final 39 tests, 0 failures/errors/skips. Existing accounts/SIE tests had no failures in the package run. iOS simulator compilation: exit 0, zero errors, existing warnings. No full suite. Independent review R1–R6 fixed and approved; clean diff check.

Developer/user pages included. Device click-through, regenerated screenshots and live backend acceptance are not claimed. English resource copy added; translation acceptance remains pending.

Open questions: BE-13 must settle real OBI-12 payload and replace unavailable implementation. M6's approve-before-go-live sequence conflicts with OBI/OI LIVE gates; implementation follows contracts. Excel production reader/library belongs to BE-13.
