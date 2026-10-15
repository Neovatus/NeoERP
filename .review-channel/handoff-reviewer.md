# Reviewer handoff (Cowork) — 2026-10-08

**Role.** Designer, reviewer and PM/architect. Implementers write `to-reviewer.md`; I write `to-implementer.md`. My last entry is **90**; the implementer's last is **95**. Read `WORKFLOW.md` first: Models, Checkpoints, Design gate, Test scope, Context limit.

**Fixed rules:**
- Commit only as `git -c user.name=jabransiddiqui -c user.email=jabransiddiqui@outlook.com commit`, with no trailers.
- The implementer pushes `dev` and `dev-app` after acceptance. No force-push.
- Never read or touch `PROJECT-STATE*.md`.
- Sign-in changes need Jabran's approval.
- Applied migrations are frozen. Current numbers: accounts V10 (A1), user V39; reserved: accounts V11 A2, V12 A3, V13 B, V14 C, V15 D, V16 E; user V40 B, V41 C, V42 D.
- Never enter credentials. Demo passwords live in `NeoERP-BackEnd/docs/local-demo-data.md`.
- My git commits leave `.git` lock and tmp files (I can't delete). Rename locks to `.git/stale-*` and ask the implementer to delete them.
- **Save usage:** one review per checkpoint (one agent, scoped to the diff and contract sections); small checks done myself; for low-risk work, accept on test names.

**Done:**
- A0
- SEC-1 / ADR-016 (SEC-a…e)
- RP-1
- PCT-1 (plus the tree reach)
- audit IDOR fixes and the side-effect-free identity lookup
- Android token no-retry
- **A1 waves 1–2 pushed.** Contract `NeoERP-BackEnd/docs/api/accounts-a1.md`, approved; amendments BA-1…BA-8 in its §20.

**Now:**
1. **CP-A1.1, backend complete** (range a357ea6..9d1dd94): accepted on two conditions in entry 89. The implementer runs the scripts live on a throwaway stack and explains why the accounts test count went from 362 to 348+3. Then it pushes and CP-A1.1 closes.
2. **A1 Screen Rig, awaiting Jabran:**
   - files: `NeoERP-App/docs/design/screen-rig/accounts-a1.jsx` and `app.html`, uncommitted;
   - open in a browser with `#accounts:kyst|journals`;
   - I fixed a Babel `_excluded` clash in it;
   - when Jabran says "rig OK": commit the rig, then post GO for S5 (Sonnet + Opus review) = CP-A1.2 (app + end-to-end + Jabran's click-through).
3. **Design gate:** no slice builds, backend included, before its contract AND rig are approved. A1 is stopped after CP-A1.1.

**Drafts, not approved, uncommitted, in `NeoERP-BackEnd/docs/api/`:**
- `accounts-a2.md`, `a3.md`, `b.md`, `c.md`, `d.md`, `e.md`;
- `accounts-f-design.md`, `g-design.md`, `h-design.md`;
- `accounts-roadmap.md`;
- `accounts-decisions-for-jabran.md` (D-1…D-7 and D-56 decided; the rest open);
- app specs in `NeoERP-App/docs/design/specs/accounts-a2-a3.md`, `b-c.md`, `d-e.md`.

All of these are reviewed and fixed (R2 rounds). The next slice is A2: finalise its contract with a checkpoint column, build its rig, then Jabran approves both.

**Backlog:** `NeoERP/docs/backlog.md`.
