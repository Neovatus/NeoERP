# Brief: <flow name> · branch `<module>/<feature>` (or `/<flow>`) · <repo: BackEnd | App> · review: <Fable high | Opus>

Read first: `docs/PRINCIPLES.md` (workspace) · the standards below · this brief. **This brief is a frame, not a fence.**

## Not a limit
Follow the project standards; reuse what already exists (pattern, building block, service, endpoint, helper, test harness);
do not duplicate it and do not depart from the architecture. Where this brief and a standard disagree, the standard wins:
tell the lead. Where the flow needs something this brief does not mention, do it within the standards and record it as a decision.
You own the whole flow, not only the item named here.

## Goal
<what the user can do afterwards, in one or two sentences; why it matters>

## Rules for this feature
<the domain and money rules, with their source: RULES.md §…, an approved decision, a spec section>

## Standards that apply
- Domain: `docs/domain/RULES.md` §…
- Design (App): `docs/design/screen-standard.md`, `ux-principles.md`, `specs/building-blocks.md`, tokens
- Code: this repo's `ARCHITECTURE.md`, `AGENTS.md`
- Contract: <the endpoints, with example requests/responses, or "publish them" for the BE>

## Scope
- **Write:** this repo only, <folders>. Shared modules only when named here.
- **Read:** both repos (read the other side of every endpoint you touch). Never write outside this repo.
- **Out of scope:** <what not to do, and why>

## Step 1: discovery and plan (before any code)
Write `docs/agents/<feature>/plan.md`: how the flow works today end to end; **every path** the change touches (other
screens, posting paths, services, events), **every writer of the data you change**, and "where else?" (the same pattern in sibling screens, documents, services); what you will reuse; the decisions you will take; open questions. Stop and send
it to the lead; build after the lead's OK.

## Feature checklist
- [ ] release flag / feature switch: on where it must be, off where it must be
- [ ] permissions and company scope on every path
- [ ] demo data incl. the awkward cases (several branches, several open items, a stand-in, an Owner approving own)
- [ ] four languages (en, nb, sv, da)
- [ ] user-guide page and developer page (or "none: <reason>")
- [ ] the endpoints used, with the other repo's side read

## Definition of Done
WORKFLOW §5 (end to end on every discovered path; tests for all cases from a test table written first; a failing-first
test per fix; standards kept; checklist done; hand-back complete) plus:
- <this batch's own lines>

## Test table (fill before coding; the reviewer checks it)
| Case | Kind (success / refusal / edge / rights / repeat / contract incl. explicit `null` and unknown enum / screen) | Expected | Test name |
|---|---|---|---|

## Hand-back (≤ 15 lines + files)
Commits/range · what ran (command, sha, counts from that run) · **decisions I took** · **found outside the brief** (fixed / reported) · reused vs new (with reason) · the filled review checklist (`docs/templates/review.md` §Checklist) · `Brief: unclear or missing — …` (or none).

## Never
`--no-verify`, force push, AI attribution, opening/printing secret files (`.env`, `infra/.env`, `.local-secrets/**`, tokens, `~/.gradle/gradle.properties`, `~/.netrc`, `~/.aws`, keys), GitHub workflows, writes in the other repo.
