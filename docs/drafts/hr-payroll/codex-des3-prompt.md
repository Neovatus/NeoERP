→ Codex · HRP design fixes (round 2: complete drop 3). Working folder: /Users/jabransiddiqui/Offices/Neovatus/NeoERP (paths below are relative to it). Git repo for your commits: NeoERP-App, branch dev-app. Design drafts only (rig jsx, their app.html blocks, and the two drop-3 specs). No production code, no push, no PRs, never open PROJECT-STATE*.md.

GOAL
Every screen and state that specs hr-h2-h3.md and hr-h4.md describe is in the rig, so Jabran can review drop 3 in one go. Same rules as your round 1 (HRP-C-1).

READ FIRST
- NeoERP-App/docs/design/specs/hr-h2-h3.md and hr-h4.md (what to build; including their 2026-10-13 notes and string-key appendix)
- NeoERP-App/docs/agents/hrp-des-2/plan.md, Status log (what was built, what wasn't)
- NeoERP-BackEnd/docs/api/hrms-v2-h2.md, -h3.md, -h4.md (the rules each screen must follow)
- NeoERP-App/docs/design/specs/building-blocks.md (page states, numbers and money, choosing from a list, bank details changes, screen text and languages) and list-controls.md
- docs/inbox/hr-payroll-lead-design.md entries HRP-41 and HRP-43 (ended employee: Leave and Time show the ended card only)

FILES YOU OWN (edit nothing else)
NeoERP-App/docs/design/screen-rig/hr-*.jsx, hr3-*.jsx, ess-shell.jsx, their data-file blocks in app.html, and NeoERP-App/docs/design/specs/hr-h2-h3.md and hr-h4.md (only to record what the rig now shows and any spec gap you hit). Never touch payroll-*, accounts-*, shell, routes, Tweaks, Org/People/Roles/Activity, building-blocks or any contract.

BUILD (everything the specs describe that isn't in the rig yet)
- Leave: hours unit, half days, graded leave, sick during leave, attachments (use the rig's thin NeoFilePicker/NeoDocumentViewer stand-ins), department and branch filters, expiring column, carry-over that changes balances, recount on approval; refusals from hr3Preview (all of them, not one).
- Time: roster month toggle, copy week and clear week (one reason for the batch, J-9 warnings with "Save anyway"), shift reactivate, DST in the time field everywhere, payroll period state from rig data.
- Approvals: LEAVE_CANCELLATION, LEAVE_ENCASHMENT and ACCESS_REVIEW items with rig data; kind, branch and department filters with NeoMultiSelect.
- Lifecycle: H4-19 recognised service start; Owner's own confirmation; "Open in Payroll", "Open in People", "View" on upcoming rows.
- ESS: an ESS persona that has a waiting bank change (so the waiting card shows), half days, planned overtime, carried balances, doctor certificate upload, cancel after start, tab badges, clock-in idempotency, and a Tweaks-free rig control for WEB_CLOCK_DISABLED inside your own rig block.
- Demo data: London, Helsinki and Reykjavík companies get HR data (a few employees each) so their routes show real screens, not "module off"; keep each company's country rules.
- Every page in every state: empty, loading, error, read-only, no access, offline (building-blocks "Page states"), at phone, iPad and desktop.
If a spec item conflicts with a contract, follow the contract and list the conflict in your report. Don't invent rules.

RIG RULES
Babel: no object-rest destructuring. CSS only in your own jsx with hr- / ess- prefixes. New screen text as string keys <module>_<area>_<name> with English text. Pickers NeoSearchSelect / NeoMultiSelect. app.html: re-read right before writing; replace only your blocks; each block equals its standalone jsx byte for byte; all other block hashes unchanged.

CHECK
Reuse /tmp/hrp-check (npm-pack React 18.3.1, ReactDOM 18.3.1, @babel/standalone 7.29.0). Every #hr and #ess route × 390, 768, 1024, 1280: page errors, console errors, horizontal overflow; plus behaviour checks for each new item above. Fix what fails in your files.

COMMIT
Commit per area as you go (leave, time, approvals, lifecycle, ESS, data), docs only, explicit paths:
git -c user.name=jabransiddiqui -c user.email=jabransiddiqui@outlook.com commit -m "docs(hr): drop 3 <area> (Draft)"
No trailers; check git diff --cached --stat first; no push.

REPORT
Append once, at the end, to docs/inbox/hr-payroll-lead.md (append only):
## <YYYY-MM-DD HH:MM> · HRP-C-2 · From: Codex · HRP design fixes · ANSWER · Re: drop 3 completion
Needs answer by: — · Blocking: no
1. Done: per area, what was added (one line each); anything not done and why
2. Commits: <hash subject> …
3. Check: routes × widths, behaviour checks, failures left
4. Spec/contract conflicts found, each with your recommendation
Then stop.
