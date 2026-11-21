# Codex brief: desktop-only QA pass on macOS (report only)

The flows, the data checks and the tablet and phone layouts are tested by a separate tester in the iPad and iPhone
simulators. This pass checks only what exists on the Mac: mouse and keyboard, window sizes, real files, and the
browser sign-in. Expect about 30 to 45 minutes. You **report**; you do not change code, commit or push.

**Read first:** the [QA guide](../../qa/qa-guide.md): limits (§2), layout checks (§3), sizes (§4, desktop row), report format and severity (§6).
Where this brief says more (no money actions, window commands, screenshots), this brief wins.

## Before you start
- Jabran isn't using the app while you run. Close any other NeoERP window first.
- The backend runs from `NeoERP/NeoERP-BackEnd`. Don't start, stop or restart it, and don't reset data.
- Start the app from `NeoERP/NeoERP-App` with the session file the lead names (it starts already signed in):
  `NEOERP_DEV_SESSION_FILE=/private/tmp/neoerp-<user>.session.json ./gradlew :composeApp:run`
  Never open, print or copy that file. If the app shows the sign-in screen, the file is spent: tell the lead.
- Already known, so don't report it again: `NeoERP/docs/agents/qa-round1/summary.md` (the simulator round) and
  `NeoERP/docs/agents/phase3-test-findings/*.md`.
- **No money actions in this pass.** Don't Post, Approve, Pay or Refund. Open forms and dialogs, and cancel them.

## Window sizes (Codex can't drag the window, so use the shell)
Find the app's process name once (with `./gradlew run` it is usually `java`):
`osascript -e 'tell application "System Events" to get name of every process whose visible is true'`
Then set the size, replacing `<name>`:
`osascript -e 'tell application "System Events" to tell process "<name>" to set {position, size} of window 1 to {{0, 25}, {1024, 700}}'`
This needs Accessibility permission for your terminal. If you get a permission error, stop and tell Jabran (System
Settings, Privacy & Security, Accessibility).
Sizes, in this order (the desktop row of the QA guide §4): **1024×700** (short) and **1440×900**. 1280×800, 1920×1080
and full screen are covered by the automated size tests (QA guide §4, "Automated sizes").

## Checks
Screens: Overview, Journals (list and editor), Invoices, Bills, Payments, Reports (trial balance and one drill-down),
Period close, Chart of accounts, Approval limits, Settings. At **each size**, open each screen and check:
1. **Layout:** nothing cut off or overlapping, no sideways scroll, and the sticky action bar and side panels fit. On the
   1024×700 window, check that dialogs and sheets fit the height and their buttons can be reached.
2. **Mouse:** hover states on rows and buttons, tooltips on icon buttons (for example More actions), right-click
   (report what it does; nothing is fine, a broken menu isn't), and scrolling with the wheel inside tables and panels.
3. **Keyboard:** Tab and Shift+Tab move through a form in visual order with a visible focus ring; Enter submits only
   where it should; Esc closes dialogs and sheets; arrow keys work in pickers and the date field; typing in the
   journal line grid works without the mouse. Use the form (fill it, then Cancel). Never confirm a money action.
4. **Real files**, the Mac's own pickers and saving:
   - export one report to a file and open it;
   - download the journal-import template;
   - choose a file for an import, then discard the import before Create.
   Report where each file went, whether its name and format are right, and whether it opens.
5. **Sign-in and sign-out, once at the end:**
   1. Sign out. The app must land on the sign-in screen.
   2. Click **Continue with NeoERP ID**. Check the browser opens the local sign-in page, then close that browser tab
      **without signing in**. The app must recover (no hang; Try again works).
   3. Stop there. Don't type a password.

## Screenshots (the app window only)
`screencapture -x -l $(osascript -e 'tell application "System Events" to get id of window 1 of process "<name>"' 2>/dev/null) NeoERP/docs/agents/qa-desktop/{screen}-{WxH}.png`
If that doesn't work, use `screencapture -x` and check the image shows NeoERP. Take one for every finding.

## Report: `NeoERP/docs/agents/qa-desktop/report.md`
```
# Desktop QA pass
Result: passed | passed with findings | failed | blocked
## Findings
1. {screen} at {WxH}: what is wrong, the exact on-screen text, how to reproduce. Severity: flow | keyboard | mouse | file | layout | wording.
   Screenshot: {file}.png   Time: HH:MM
## Checked and fine
- one line per screen × size, and per check group
```
Quote screen text exactly. Never include a password, token or session-file contents. Don't commit; the lead reads
the files.
