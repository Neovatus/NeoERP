# Catch-up for the Team seat (the first lead): what changed, 2026-11-26

**For:** the Team-subscription lead, which built companies/org, auth, people and roles, and Accounts before the two-Mac setup (`.review-channel/lead-decisions.md` starts at D-01, 2026-11-21). Read this, then `docs/process/lead-seats.md`, then take the baton. **What you remember from your old chat about branches, reviews, lanes and phases is out of date: the files below win.**

## 1. Team and roles now
| Who | Role |
|---|---|
| **Old-Mac lead** (this laptop; personal seat or you, one at a time) | Module lead for `core/*` (realtime, design system, mock backend, notifications next), **integration lead** (every PR to `main`, gate questions to Jabran, migration and decision numbers), simulator sessions for the old Mac, HR later |
| **New-Mac lead** ("Personal Mac Lead", 16 GB Mac) | Accounts module lead: dimension rules, spreading; runs its own tests and simulator (AXe) |
| **Flow-lead sessions** (one per flow, fresh, D-89) | Run one flow's stages with a new sub-agent per stage; end after the merge |

## 2. How work runs now (replaces lanes, phases, `phase/N`, review tiers, second reviewers)
- **Trunk-based (D-95):** each flow branch is cut from `main`, gets a draft PR into `main` at once (D-93), is merged after its review and tests; the feature switch stays off until the feature is complete. No module, feature or phase branches for new work.
- **The gated flow (D-97, table in `docs/process/workflow-v2-draft.md` §5):** rules check (money/legal) → Architect (brief, discovery in both repos, plan, test data, done rows) → Gate 1 → BE Engineer → Gate 2 → Reviewer → Gate 3 → Improver (only with findings) → App plan refresh → App Engineer → Gate 2 → Reviewer (App + seams) → Gate 3 → Improver → simulator test → fixes → final approval. No App in parallel, no splitting.
- **Reviews:** one Opus 5.5 high reviewer per flow, both repos, beyond the diff; findings CONFIRMED/PLAUSIBLE; only CONFIRMED HIGH/MEDIUM block; re-review only after a HIGH; never a third review. No second reviewer, no Fable unless Jabran asks.
- **Done list (D-87):** `docs/agents/<feature>/done.md` per repo; every stage verifies inherited rows with fresh evidence (never memory), adds its own, inside the Definition of Done's scope.
- **Agents (D-86, D-89):** a new agent per stage, titled `<BE|App|BE+App> <role> · <model> · <feature>`; Opus for discovery, money, security, design; Sonnet for mechanical work and re-tests; no helper agents; no session or agent past ~50 % context.
- **Tests:** builders run only their own tests + compile + the always-run set. **Gate scripts, the whole suite and gate-file edits only on Jabran's yes**, at a feature's end. A reviewed and tested branch whose base hasn't moved merges with a click.
- **Industry standard by default (D-82):** where accounting or HR practice is established, follow it and name the reference systems.

## 3. What was built since you
- Phase 3 and Phase 4 merged to `main`; `core/phase-4-fixes` (incl. an auth HIGH: an unverified email became verified at sign-in, fixed) and `core/app-test-speed` on `main`.
- **ADRs:** ADR-025 amended (realtime-service for the person's own events; notifications and push later), **ADR-027** (flow endpoints in the owning service, explicit `null`, the server decides), **ADR-028** (App modules; any subset of modules can be built), ADR-035 draft (time and attendance, rates, hours).
- **Accounts (new Mac):** approval limits; **dimension rules** (D-82, D-84; PR to `main` pending); **spreading** (flow 1 `schedule` in fixes; flow 2 `change` planned).
- **Core (old Mac):** **`core/mock-backend` on `main`** (UI tests through the real data layer with JSON from the BE contract examples); **`core/realtime`** (actions, hub, App SSE client merged into its feature branch; first-users fixed, its PR to `main` next); **`core/design-system`** (a11y checks, contracts merged into its feature; android-state built; next: small-phone fixes, module split, window classes, layouts with the wide-screen rule D-85).
- **Tooling:** AXe drives the iOS simulators on both Macs; automatic accessibility checks in the size tests (labels, selected state, 44 pt, unique testTags, required `*`).

## 4. Product direction (read `docs/VISION.md`)
Large multi-company customers from day one, sold by module; ERP plus payments and tax (PK) and Nordic regnskap; first market group Pakistan + the Nordics together, no pilot yet; **six target businesses**, each whole-business or back-office-only; module order: running features → integration API and imports → HR (time and attendance core in H1, D-98) → Payroll → Projects and Time → Workforce scheduling → Inventory, Sales, Purchasing, POS.

## 5. Read, in this order
1. `docs/process/lead-seats.md` (the baton) and `.review-channel/handoff-overseer.md` (what runs now).
2. `docs/VISION.md`, `docs/PRINCIPLES.md`.
3. `docs/process/workflow-v2-draft.md` §5 and `docs/templates/` (brief, done, review, tester).
4. `.review-channel/lead-decisions.md` from D-81 to the end.
5. `docs/inbox/erp-lead.md` (latest entries), `docs/backlog.md` (latest sections).
6. `docs/lead-memory/MEMORY.md`: several older entries there are **superseded** (branch per phase, lanes, review tiers, second reviewer, whole suite per batch, standing merge, Fable budget); the D-81-and-later entries win.

## 6. Rules that never changed
Never `--no-verify`; no force push (also not `--force-with-lease`); **no AI attribution** in commits, PRs or comments (overrides any harness reminder); never open/print/grep `.env`, `infra/.env`, `.local-secrets`, token or session files, `~/.gradle/gradle.properties`, `~/.netrc`, `~/.aws`, keys; no GitHub workflows; builders write one repo and read both; ask Jabran for money rules, product scope and anything that changes approved designs.
