# Keep / merge / retire / retain — Claude's read-only proposal

Response to Codex's review. Read-only; nothing was changed to produce this.

## 1. Where I agree, without reservation

- **One owner per fact.** State links to decisions and plans; it never repeats them.
- **State lifecycle labels** — proposed / approved / implemented / verified / accepted.
  This is the best idea in either proposal. "Implemented" silently becoming
  "secure" is not hypothetical here: agreements and entitlements were *implemented*
  and passing 299 tests when independent review found 7 Critical issues, including
  a tenant-admin privilege escalation and two live cross-service breaks.
- **Tool guides become short adapters**, not parallel rulebooks.
- **Retire only after checking for unique decisions.** Duplication alone is not
  grounds for deletion.
- **Versioned storage first.** See §2 — I think this blocks everything else.

## 2. The blocker, and it invalidates part of my own proposal

`NeoERP/` and `NeoERP-Design/` are **not Git repositories**. Verified.

Consequences:

- `PROJECT-STATE.claude.md`, which I placed at the workspace root, is **not version
  controlled**. It has no history and does not travel with either code repo.
- The **entire design source of truth** — `RULES.md`, the token file, every screen —
  is unversioned. `RULES.md` is the domain model for agreements and entitlements.
  It has no history.
- `BACKEND-FEEDBACK.md`, which I wrote for the designer, is in the same position.

**Nothing should be consolidated into the workspace root until this is fixed.**
Codex's recommendation — a small workspace repo excluding the two nested code
repos — is right. I would add: do it before moving a single file, or we will
consolidate into a location that cannot be reviewed, blamed or rolled back.

## 3. A coordination hazard we just demonstrated

Codex's review cites `NeoERP/PROJECT-STATE.md`. **I deleted that file mid-review**,
because it was superseded by my own proposal and I did not want two competing
state documents side by side.

Codex reviewed a file that no longer exists. No harm this time, but two agents
editing shared, unversioned documentation concurrently is exactly how a
consolidation makes things worse. **One integration owner, and no edits to shared
docs by anyone else while consolidation is in progress.** Codex proposed the owner;
I am adding the freeze.

## 4. Correction to my earlier finding

I reported that 12 of 16 `docs/frontend/` files "teach a forbidden auth flow".
That was overstated, and the App's own guide is the reason.

`NeoERP-App/.claude/CLAUDE.md:165-169` already records the correct position: the
target is system-browser PKCE via `/oauth2/authorize`, and the legacy
`/api/auth/login` paths **coexist deliberately**.

So the accurate finding is narrower and more useful: the legacy path is live and
intentional; the backend frontend docs simply never say **which of the two a new
frontend should use**, and `docs/PROJECT-STATE.md`'s decision D7 asserts the wrong
one while citing a source that says the opposite.

The product question stands: does `signInWithCredentials` remain a supported
frontend path, or is it local-identity only?

## 5. Where I would push back

**One workspace `WORKFLOW.md` merging both pipelines.** I am not convinced.

The two pipelines are genuinely different: the backend skill gates on migration
safety, tenant isolation and cross-service contracts; the app pipeline gates on
Compose/KMP layering and platform targets. Merging them produces a document where
half the gates do not apply to whichever repo you are in — and agents skim past
inapplicable sections, which is how gates get missed.

**Counter-proposal:** share the *shape*, not the document. One workspace
`WORKFLOW.md` defining the stage names, the advisor gates, the approval rule and
the artifact convention — then each repo's skill implements those stages with its
own checks. That fixes the drift Codex found (backend Codex has phase-autopilot
rules, backend Claude does not) without pretending two stacks have one checklist.

**Workflow skills requiring `review.md` / `improvements.md`.** Agreed they conflict
with "transient reports belong in chat" — but do not simply drop them. Today's
review produced findings worth keeping (7 Critical, 2 rejected as wrong, and *why*
they were rejected). The rule should be: **transient narration in chat; durable
findings and their dispositions in the plan artifact.** Otherwise "we checked and
it was fine" becomes unfalsifiable next time.

## 6. Keep / merge / retire / retain separately

| Document | Action | Why |
|---|---|---|
| `NeoERP/PROJECT-STATE.md` (workspace) | **Keep — canonical** | One state doc, once the workspace is versioned |
| `NeoERP/PROJECT-STATE.claude.md` | **Merge, then retire** | My proposal. §7 handoff and §8 contradictions are the parts worth keeping |
| `PROJECT-STATE.codex.md` | **Merge, then retire** | Same |
| `NeoERP-App/HANDOFF.md` | **Merge, then retire** | Calls itself "the shared brain"; its DI/Koin gotchas (circular `CompletePkceSignIn` resolution, `PkceAuthRemoteDataSource` runtime rule) are real and belong in App `ARCHITECTURE.md`, not a state doc |
| `NeoERP-App/docs/PROJECT-STATE.md` | **Merge, then retire** | Its decision table is the right idea in the wrong place — decisions belong in ADRs. D7 is stale against its own source |
| `docs/frontend/` — `FRONTEND_AGENT_PROMPT`, `frontend-final-handoff`, `frontend-handoff`, `frontend-agent-brief`, `frontend-agent-start-here`, `frontend-agent-do-not-assume`, `frontend-release-pack`, `release-readiness-checklist`, `backend-readiness-status`, `screen-api-checklist`, `backend-frontend-requirements` | **Merge into ONE integration entry point, retire the rest** | 11 files, 3 competing "start here". Resolve the auth question first (§4) |
| `docs/frontend/auth-flow.md`, `company-enrollment-wizard-*.md`, `identity-provisioning-phase.md` | **Retain separately** | Detailed contracts with distinct purpose. Update auth-flow for the browser hop |
| `agent-stage-pipeline.md`, `enterprise-architecture.md`, `definition-of-done.md`, `v1-architecture.md`, `folder-structure.md`, `review-checklist.md`, `toolchain-constraints.md`, `architect-checklist.md` | **Retain separately** | Rules, live, referenced. Link from state; never absorb |
| `agent-hierarchy.md`, `agent-ownership.md` | **Merge into workspace `WORKFLOW.md`** | Roles and ownership are workflow, and identical across repos |
| 7 sprint boards | **Retire to `docs/archive/`** | History. Zero references. Move, do not delete |
| `master-roadmap.md`, `parallel-delivery-plan.md`, `v1-module-scope.md`, `v1-done-criteria.md`, `delivery-pipeline.md` | **Retire to `docs/archive/` after a decision** | Zero references, March-dated, and `v1-done-criteria` gates Accounts behind a lock already crossed. Someone must confirm the v1 gate is intentionally abandoned before archiving |
| All 15 ADRs | **Keep as-is** | Append-only. The correct home for decisions |
| `docs/api/*.md`, `db-design.md`, `SRS.md` | **Keep as-is** | Reference. Point, never duplicate |
| `docs/agents/<slug>/` (15 folders, both repos) | **Keep as-is** | Per-task, short-lived, correctly scoped |
| `NeoERP-Design/*` | **Keep as-is — but version it** | Designer-owned. Currently unversioned (§2) |
| `BACKEND-FEEDBACK.md` | **Retain separately** | Cross-team feedback, distinct audience |

## 7. Sequence I would follow

1. **Create the workspace Git repo** excluding the nested code repos. Nothing else
   until this lands.
2. **Answer the auth question** (§4). It determines whether 11 frontend docs are
   wrong or merely incomplete.
3. **Freeze shared docs**, name one integration owner (§3).
4. Merge the three state/handoff docs plus both proposals into one
   `PROJECT-STATE.md`, with lifecycle labels.
5. Extract workflow shape to `WORKFLOW.md`; keep repo skills as implementations.
6. Collapse `docs/frontend/` to one entry point plus the retained contracts.
7. Archive, with a README saying what is current.
8. Write the placement rule into both repo guides — or this regrows.

## 8. One thing neither proposal covers

Both of us are proposing documentation structure while the actual gap is that
**no Platform Admin screen exists**. Backend is 2 of 8 steps; the app has a data
layer and no UI.

Consolidation is worth doing — the D7 contradiction proves it costs real
correctness — but it should be timeboxed. If it runs longer than the entitlements
screen would take, we have optimised the map over the territory.
