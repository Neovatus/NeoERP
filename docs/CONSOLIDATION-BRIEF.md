# Doc consolidation — brief for the second pass

Two agents independently produce a consolidated project-state + handoff document,
then the two are merged into `PROJECT-STATE.md`.

- Claude's pass: `PROJECT-STATE.claude.md` (done)
- Codex's pass: `PROJECT-STATE.codex.md`

## Why two passes

Independent review found real things in this project that a single pass missed —
including one Blocking claim that turned out to be wrong on verification. Agreeing
is the least useful outcome; the value is in disagreement.

**Order matters.** The second agent must write its own version BEFORE reading the
first, or it anchors and simply agrees.

## The agreed outline

1. What this is
2. Where things live
3. Settled decisions — decision | source | one line
4. Current state — honest about gaps
5. What's next — sequence, position marked
6. How to work here — pointers, not copies
7. Handoff — auth flow, authorization rules, contracts
8. Contradictions found
9. Traps already hit
+ **Exclusion list** — what was read and deliberately left out, with reasons

## Constraints

- **State only.** The rules docs (`agent-stage-pipeline`, `enterprise-architecture`,
  `definition-of-done`, `v1-architecture`, `folder-structure`, `review-checklist`,
  `toolchain-constraints`) are live and referenced — link them, do not absorb them.
  Folding them in produces a document nobody reads.
- ADRs stay ADRs. Summarise the decision, point at the file.
- ~250 lines. A state doc longer than that stops being read, and we are back here.
- **Verify against code, migrations and running services** — not against what other
  docs assert. Several are six months stale and contradict shipped reality.

## The placement rule this exists to establish

Write it into both repo guides once merged, or the pile regrows:

| Kind | Home |
|---|---|
| State — where are we now | `PROJECT-STATE.md`, and only there |
| Rules — how to work here | the repo guide, or a doc it links |
| Decisions — why | an ADR |
| Working notes — one task | `docs/agents/<slug>/` |
| History | `docs/archive/`, never beside current docs |

## After the merge

1. Fix or delete `docs/frontend/` (16 files, 5,225 lines, 3 competing entry points).
   Decide first whether `signInWithCredentials` stays in the app — that determines
   whether those docs are wrong or merely out of date.
2. Archive the 7 sprint boards and 5 unreferenced planning docs. Move, do not
   delete: they are the record of how the project got here.
3. Write the placement rule into both repo guides.
4. Classify org-service, user-service, audit and auth repositories in
   `architecture-tests`.
