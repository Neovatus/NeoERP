# Lane ready: ROADMAP-A (Accounts roadmap draft) — 2026-11-21

**Repo / branch:** workspace `NeoERP`, `phase/4-b2-roadmap` (pushed). Merge target: workspace `master` (the draft stays in `docs/drafts/` until Jabran decides).
**Range:** `0f1218f..a09dc4d` (5222752 brief, 1bd98e6 draft, 31b996a review fixes, then the round-2 review file).
**Brief:** `docs/agents/accounts-roadmap/brief.md` on the branch. Asked: Jabran 2026-11-21.
**Drafter:** Opus 5.5. **Reviewer:** Opus 5.5, fresh, read-only. A plan, not a build: no code, no tests.

## Reviews (`docs/agents/accounts-roadmap/` on the branch)
- `review-1-opus.md`: Reviewed 1bd98e6, FIX: 2 MAJOR (critical path skipped 4.11–4.18 although the Phase 4 PR depends on them; bank D/D2 placed before A5, which it needs for payroll-payable clearing), 9 MINOR (citations, an unconfirmed Payroll v2 status, missing go-live and backlog rows, counts). 24 state rows checked: no wrong "done".
- `review-2-opus.md`: Reviewed 31b996a, fixes only: ACCEPT. Notes not reopening: the Mermaid graph omits 4.3/4.5/4.9 (they still feed the PR in the table); §5 step 2 reads as a chain where the graph (right) shows parallel steps.

## Rendering
Rendered through GitHub's renderer and checked by script (one H1, headings, tables, links): clean; the Mermaid block is recognised as `mermaid`. Whether the graph draws correctly shows only on github.com (no Mermaid tool on this Mac): unverified until viewed there.

## Write-scope check
`docs/drafts/accounts-roadmap.md`, `docs/agents/accounts-roadmap/{brief, review-1-opus, review-2-opus}.md`. No AI attribution (checked).

## Docs pages
User guide: none: a planning draft. Developer pages: none: no code or feature changed.

> **Correction (Jabran 2026-11-21):** no pilot customer and no first country have been decided. Every "pilot", "Swedish pilot" or "SE first" in this draft is the drafter's assumption, not a decision; the launch order in older docs (SE → NO → PK) also conflicts with the payroll decisions D1/J-8 (Pakistan first). Decisions 2, 13 and 15 are re-read as: **which country, and what kind of first customer, comes first?** — a decision for Jabran, not an input.

## Waiting on Jabran: 16 decisions in the draft's §7, among them
- 1: keep the approved Phase 4 order (owner switch → platform lane → dimension rules → spreading → allocations → budgets) before the Phase 4 PR.
- 2: plan for a large Swedish pilot (Phase 5b and ADR-024 Stage 1 before go-live).
- 3: ADR-024/025 already approved; the lead sends the one-page summary and the 3 ADR-025 additions now so 4.12 can start.
- 5 + 16: A5 payroll posting to Later with Payroll v2 (rebuild after Phase 4); bank D v1 without payroll-payable clearing.
- 7: drop the 2027-01-01 Norway e-invoice target.
- 13: first accountant sign-off for Sweden, not Norway.
- 11: one hardening lane, owned by the ERP lead, for go-live items with no owner.
