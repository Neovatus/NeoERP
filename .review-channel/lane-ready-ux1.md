# Lane ready: UX-1 (QA round 1 lessons into the design rules) — 2026-11-21

**Repo / branch:** `NeoERP-App`, `phase/4-b2-ux1` (pushed). Merge target: `phase/4`.
**Range:** `f19a101b..be956110`.
**Brief:** `docs/agents/ux1/brief.md` on the branch (rounds 1–3). Asked: Jabran 2026-11-21 (docs lane a).
**Builder:** Sonnet 5.5, high effort. **Reviewer:** Opus 5.5, fresh, read-only, high effort. Docs only, one reviewer. **Decisions:** Fable 5.2, high effort (new-Mac lead rule).

## Reviews and decisions (`docs/agents/ux1/` on the branch)
- `review-1-opus.md`: Reviewed 77982304, **FIX**: 4 MAJOR (no height trigger for the short-height rules while the app picks layouts by width; an iOS-impossible decimal-separator line; missed conflict with screen-standard §4 "Button labels never wrap"; account names allowed to end in "…" although the Trial balance cut lost "sats"), 11 MINOR.
- Design calls from the review → `.review-channel/lead-decisions.md` D-1..D-9: Fable **8 APPROVE** with conditions, **D-7 REJECT** ("pinned parts at most a third" cannot be met: top bar + one-row footer are 37 % of 375 pt) → Jabran agreed to Fable's version (a third is the trigger). D-2 and D-5 amend Jabran-dated rules → **confirmed by Jabran**.
- `review-2-opus.md`: Reviewed 7e263196, fixes only: **ACCEPT**, 8 MINOR. Finding 3 became **D-10** (a footer primary that does not fit at the default size had no allowed way out): Fable APPROVE with conditions.
- Round 3 (`bff92ed5`, `a772ccbd`): the 8 minors and D-10, markers removed. **Checked by the lead** (two-round rule): D-7, D-2, D-5 markers gone and dates kept; D-10 written in §4, §25 and the wizard footer, marked for Jabran's confirmation; SE 8 wording corrected; placeholders shown with ‹ ›.
- `decisions.md` is a copy of the decision log D-1..D-10 at round 3.

## Rendering
GitHub renderer + script on every changed page (9 of 9): one H1, no skipped headings, equal table columns, links resolve. Clean, except a checker false alarm on the existing link `design-system/NeoERP%20States.html` (the file exists; the checker does not decode `%20`). Three `<where>`/`<place>` placeholders that GitHub hid (from before this lane) are fixed. Browser-pane look: not done.

## What changed
- `docs/design/ux-principles.md`: new **§25 Short heights, Larger Text and touch entry** (trigger: pinned parts over a third of the visible height, keyboard counted; page head scrolls away; one-row footer with one fold order; Larger Text to the app's 2× cap with one list of what may and may not end in "…"; number keyboard with both separators and Done/Return; focused field in view). Dated amendments to §16 (D-5, confirmed) and pointer from §20.
- `docs/design/screen-standard.md`: §4 (D-6, D-10), §8 keyboard, footer needed-line (D-2, confirmed), back link (D-4); §9 rig review sizes **375×667, 667×375, 874×402, 744, 1032, 1376, 1440** with devices; screenshot-test frames unchanged with a line for a code lane.
- `docs/design/specs/building-blocks.md`: headings, cell text, search placeholder, wizard footer (D-3, D-10), dialog actions (D-6).
- `docs/review-checklist.md`: four §25 lines.

## Write-scope check (`git diff --name-only f19a101b..be956110`)
`docs/design/{ux-principles,screen-standard}.md`, `docs/design/specs/building-blocks.md`, `docs/review-checklist.md`, `docs/agents/ux1/**`. Scope widened in round 2 to building-blocks.md and screen-standard §4/§8/back link (brief "Round 2"). No code. No AI attribution (checked, 0).

## Docs pages
- **Developer / design pages:** the four above.
- **User guide:** none: design rules, no user-facing change yet.

## For Jabran
- **D-10 confirmed by Jabran as a trial (2026-11-21)**, to be checked in the QA size tests; the "for Jabran's confirmation" marker in §4, §25 and the wizard footer comes out when the lane merges. Was: (it changes §4 "Button labels never wrap"): the footer primary may wrap its label to two lines at any size, only as the last step after every fold; labels are still written to fit at 375 pt. Real case: sv "Skapa och skicka in verifikationer".
- Code follow-ups: **R32** (focused field above the keyboard in every editor, D-1) in App B; **R33** screenshot-test frames at the short-height sizes, in App B.
- Nit not reopened: §25 says two wrapped lines "fit the 44 pt touch height"; at the accessibility sizes the footer grows anyway.
