# Phase 3 UI run summary

- T14: passed — 0 findings (branch picker fixed)
- T15: blocked — 0 findings
- T16: blocked — 0 findings
- T17: passed — 0 findings (optional .xls step skipped)
- T18: blocked — 0 findings
- T19: passed — 0 findings
- T20: passed — 0 findings (two-window step skipped)
- T21: passed — 0 findings (Vessel unavailable on selected account, as already known)
- T22: passed — 0 findings
- T23: passed — 0 findings
- T24: blocked — 0 findings (setup and pickers passed; narrow layout and screenshots incomplete)

T14 branch selection fails, blocking T15–T16. T18 was not submitted because Stockholm already had a posted opening-balance journal. T24 lacked the prerequisite Stockholm dimension values. A screenshot command initially failed; display access subsequently enabled captures, and T14 evidence was reproduced and captured. Two app-only crops show the selector and error at approximately 626 × 600 pixels. Phone widths and multiple tablet/desktop widths were not captured; the requested multi-size entry-screen coverage remains incomplete. The earlier T18 balance discrepancy was withdrawn after the refreshed preview was checked. Backend was not restarted.

Supplementary evidence: T21 now links three app-content renderings from the existing journal editor screenshot test at simulated 390, 820 and 1440 px window widths. They use fixture data and tall virtual canvases, not the running app or real devices; they do not complete the requested multi-size coverage of each entry screen. No new finding was verified from them.

Re-run, 16 Nov 2026: T14 step 7 still failed with the known branch-picker behavior; T15 and T16 remain blocked and no journal was submitted. T24 setup and picker checks passed, but the narrow layout and requested window-only screenshots were not completed. The provided window-bounds command timed out with “System Events got an error: AppleEvent timed out. (-1712)”; no new screenshot was saved. T18 was skipped as requested. Backend was not restarted.

Re-run 2, 16 Nov 2026: T14 failed (0 new findings; known branch-picker issue reproduced); T15 and T16 blocked (0 findings each). A fresh NeoERP Dev process was opened. Full-screen screenshots were attempted but Safari and a macOS permission dialog covered the app, so no screenshot was saved. No journal was submitted; the backend was not restarted.

After a verified quit and restart, T14 again failed with the known branch-picker issue; T15–T16 remain blocked. A maximized screenshot of the error was saved as T14-retry-error.png. No journal was submitted and the backend was not restarted.

Latest re-run: T14 passed; T15 submitted OB-DRAFT-000001 and is awaiting user action on the Post confirmation after automatic approval review rejected the agent click; T16 remains blocked by posting. No backend restart.

Follow-up: the refreshed journal and import still showed “Waiting to post” after the user reported posting. T16 customer hand-off returned “Something went wrong. Refresh and try again.” while that prerequisite remained unverified; retry after posting. Screenshot attempt showed Safari and was discarded.
