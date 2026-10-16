→ Codex · HRP design fixes (round 4: contract-audit alignment). Working folder: /Users/jabransiddiqui/Offices/Neovatus/NeoERP. Git repo for commits: NeoERP-App, branch dev-app. Design drafts only (rig jsx, their app.html blocks, four specs). No production code, no push, no PRs, never open PROJECT-STATE*.md. Everything stays Draft.

PRE-CHECK (stop and report if it fails)
Each of these contracts must carry a note "Amended 2026-10-16 (HRP lead): contract audit": NeoERP-BackEnd/docs/api/hrms-v2-h0.md, h1, h2, h3, h4, payroll-v2-p1.md, p2, p3, p4. They are READ-ONLY for you.

READ FIRST
- docs/reviews/hrp-contract-audit-2026-10-16-dispositions.md (what was decided; the "Rig/spec" column is your list)
- docs/reviews/hrp-contract-audit-2026-10-16.md (your own audit, line refs)
- The amended contracts above; NeoERP-App/docs/design/specs/building-blocks.md ("Bank details changes", "Page states", "Screen text and languages")

FILE OWNERSHIP (edit nothing else)
- Rig: NeoERP-App/docs/design/screen-rig/hr-*.jsx, hr3-*.jsx, ess-shell.jsx, payroll-*.jsx, and only their data-file blocks in app.html.
- Specs: NeoERP-App/docs/design/specs/hr-h1.md, hr-h2-h3.md, hr-h4.md, payroll-p.md.
- Never: contracts, building-blocks, other modules' blocks, shell, routes, Tweaks, Org/People/Roles/Activity.

CHANGES (rig behaviour and spec text both follow the amended contract; one acceptance check each)
HR
1. CA-1: a job change dated between two rows builds from the covering row and ends at the next row's start. Check: rows 1 Jan + 1 Nov, insert 1 Oct → 1 Jan row ends 30 Sep, 1 Oct row ends 31 Oct, 1 Nov unchanged.
2. CA-4: the approvals queue shows BANK_ACCOUNT items only to HR.PAY_DETAILS.APPROVE holders, other kinds to CHANGE_REQUEST.DECIDE holders; counts match. Check with two personas.
3. CA-5: ESS bank copy: "Applies to bank files made after it's approved." Check text key and render.
4. CA-14: replace the HrNidRequest workflow with the direct sensitive edit (SENSITIVE.UPDATE, reason required, audited, no request/decide). Check: non-holder sees no action; holder edits with reason; audit row has field name only.
5. CA-20/CA-21: approving an end request isn't refused by itself; changing a PLANNED end works and keeps one ending. Checks for both.
6. CA-22/CA-19: PK sick-pay and carry/young-worker fixtures use the `region_code`/`establishment`/`condition` selectors (most specific wins); Sindh factory sick full pay. Check per selector.
7. CA-23: leave/absence attachments belong to the request/report, HEALTH or OTHER; ESS uploads own certificate and sees own uploads; HR sees HEALTH only with HR.LEAVE.HEALTH.READ, audited download. Check both personas.
8. CA-24: FI absence report has an HR-only "Same illness as previous" field (HEALTH.READ), recalculates the spell, audit SAME_ILLNESS_RECORDED. Check.
9. CA-25: hourly leave sends the chosen offset; gap time refused, ambiguous time needs a choice. Check DST dates.
10. CA-30: sole-holder Owner reveal asks for a reason, sends {ownerSelfApproval, reason}; unknown holder count refuses. Check.
11. CA-35: end preview hidden from read-only users (needs END or REQUEST). Check.
12. CA-31: the past-date coverage message reads from a rig stand-in of the new run-coverage read; on failure shows the degraded message. Check.
Payroll
13. CA-2: payee bank account = request → second person approves (PAYROLL.PAYEE.ACCOUNT.APPROVE), masked, reveal for approver only, maker ≠ approver by user id, "confirmed by a channel I already had" tick, Owner's own only when sole holder; first account is a request; editing a payee can't change its account. Bank file uses only approved payee accounts; the payee-account requester can't make/download that file. Checks for each.
14. CA-10: an APPROVED run with published payslips and nothing posted can be reversed with the acknowledgement; payslips show Replaced. Check.
15. CA-11: "Cancel bank file" on a READY file (reason, warning "withdraw it at the bank if already uploaded"); then withdraw/reverse proceeds. Check.
16. CA-12: voiding a statutory payment cited by a filing is refused with the filing named. Check.
17. CA-13: no undo-paid anywhere in actions, fixtures or copy. Check by search.
Specs and cleanup
18. Record each change in the matching spec with a dated note "Amended 2026-10-16 (Codex for HRP lead): contract audit alignment"; new screen text as string keys <module>_<area>_<name>.
19. Audit notes cleanup: stale hr-h1.md draft notes, `.VIEW` labels shown as "View", Officer CHANGE_JOB wording aligned to H0/H1/H4.

RIG RULES
No object-rest destructuring. CSS only in your jsx with hr-/ess-/pay- prefixes. Pickers NeoSearchSelect/NeoMultiSelect. app.html: re-read right before writing; replace only your blocks; each block equals its standalone jsx byte for byte; every other block hash unchanged.

ACCEPTANCE (all must pass before the final commit)
- Babel parse of every changed jsx (use /tmp/hrp-check/babel).
- Your /tmp/hrp-check harness: every #hr, #ess and #pay route × 390, 768, 1024, 1280 with zero page errors, console errors and horizontal overflow; all earlier regression checks; one behaviour check per item 1–17.
- Block equality and other-block hashes as above; git diff --check clean.

COMMITS
Per area (hr, payroll, specs), docs only, explicit paths with --only; check git diff --cached --name-only right before each commit (other sessions share the index):
git -c user.name=jabransiddiqui -c user.email=jabransiddiqui@outlook.com commit -m "docs(hr-payroll): contract audit alignment, <area> (Draft)" --only <paths>
No trailers. No push.

REPORT
Append once to docs/inbox/hr-payroll-lead.md:
## <YYYY-MM-DD HH:MM> · HRP-C-5 · From: Codex · HRP design fixes · ANSWER · Re: contract audit alignment
Needs answer by: — · Blocking: no
1. Done: items 1–19, one line each (done / not done, why)
2. Commits
3. Acceptance: parse, visits, regression and behaviour checks, failures left
4. Any contract gap you hit (don't edit contracts), each with your recommendation
Then stop.
