→ Codex · HRP design fixes (round 3: review fixes). Working folder: /Users/jabransiddiqui/Offices/Neovatus/NeoERP. Git repo NeoERP-App, branch dev-app. Design drafts only. No production code, no push, no PRs, never open PROJECT-STATE*.md.

READ FIRST
- docs/reviews/hrp-drop3-review-2026-10-16.md (all findings, file:line)
- NeoERP-BackEnd/docs/api/hrms-v2-h2.md (§4.3, §7.4, §7.5 carry-over and caps), hrms-v2-h3.md (§5, §5.1 young-worker rows, §6.7, §6.10), hrms-v2-h4.md (H4-4, H4-26), payroll-v2-p3.md (P3-33, J-5 leaver payslips)
- Your own round 1/2 reports (HRP-C-1, HRP-C-2 in docs/inbox/hr-payroll-lead.md)

FIX ALL FINDINGS (High, Med and Low)
1. High #5: "Start in another company" on the record page (hr-employee.jsx:71) opens the drop-3 wizard with `movedFrom`; nothing copies nid or dob on the client; remove the drop-1 move prefill path (hr-employee.jsx:329) and the unchecked write in hr-directory.jsx:270/312.
2. Med #13: ended employees lose payslip access after end date + 12 months (ESS shows "Your payslips are no longer available here; ask HR"). You may edit payroll-data.jsx for this item only.
3. Med #16: young-worker check reads the country pack rows (hrms-v2-h3 §5.1, `YOUNG_<from>_<to>` bands): minimum age, night window, daily and weekly limits, overtime cap; warnings with source, never blocks (J-9).
4. Med #17: PK women's night-work check from the PK pack row (Factories Act s.45 / provincial; warning with source); legal sex read only for this check, never shown.
5. Med #22: carry-over per country pack: caps (PK factories 14, shops 30 total, BA 60; NO/SE/DK/FI/IS per pack), expiry after the reminder, statutory vs policy portions, a real "expired" figure.
6. All 11 Low findings in the file, including: Owner's own bank reveal when the Owner is the sole PAY_DETAILS.APPROVE holder (allowed, logged, fails closed when the count is unknown); one "ended" check in ESS; drafts saved per user, not per company.

FILES YOU OWN
hr-*.jsx, hr3-*.jsx, ess-shell.jsx, their app.html blocks; payroll-data.jsx only for #13; specs hr-h1.md, hr-h2-h3.md, hr-h4.md only to record what changed. Nothing else.

RIG RULES, CHECK, COMMIT
As round 2: no object-rest destructuring; prefixed CSS; string keys; app.html blocks byte-equal, other hashes unchanged; re-run /tmp/hrp-check round-2 harness at 4 widths plus a behaviour check per finding. Commits docs-only, explicit paths, `git -c user.name=jabransiddiqui -c user.email=jabransiddiqui@outlook.com commit -m "docs(hr): drop 3 review fixes (Draft)"`. Stage only your files (another session may share the index: check git diff --cached --name-only right before committing). No push.

REPORT
Append once to docs/inbox/hr-payroll-lead.md:
## <YYYY-MM-DD HH:MM> · HRP-C-3 · From: Codex · HRP design fixes · ANSWER · Re: drop 3 review fixes
Needs answer by: — · Blocking: no
1. Done: per finding id (done / not done, why)
2. Commits
3. Check: visits, behaviour checks, failures left
4. Open questions with recommendations
Then stop.
