# Brief: branch-default (flow 3 of 3) · branch `accounts/dimension-rules` · BackEnd + App · review: Opus 5.5 high

Read first: `docs/PRINCIPLES.md`, this brief, and flows 1 and 2 on the same branch (plans, hand-backs, reviews in `docs/agents/dimension-rules/`). **This brief is a frame, not a fence** (template "How this brief works", trial 2026-11-25).
**First flow run by a flow-lead session** (trial, Jabran 2026-11-25).

## Who you are
- **BackEnd:** a senior Kotlin/Spring engineer for accounting systems (double entry, posting, audit, multi-company).
- **App:** a senior Compose Multiplatform engineer for business apps.

## Goal
Each Org branch can carry a default cost centre. New manual lines from that branch take it, unless the line or the header already has one. The cost-centre page shows and changes which branches use a cost centre as their default, and warns before deactivating one that is in use. The Org branch page shows its default.

## Decided rules (sources; don't reopen)
1. **ADR-021 Q5:** the default lives on the **Org branch** as a nullable Accounts cost-centre id, validated by the Accounts machine read (the H1-10 pattern). It is carried in the branch read and the branch's `changed` event.
2. **ADR-021 D4:**
   - Manual lines: line → header default → **branch default** → null, resolved once when the line is created, then frozen. A later change of the branch default never rewrites saved lines.
   - Machine lines are never defaulted.
3. **Who may write:** holders of `ACCOUNTS.COST_CENTER.UPDATE`, through the reason gate (6–500). The cost centre must be active, valid on the date, of the **same company**, and allowed by the account rules where it applies.
4. **Spec AC-DIM §4.2 / §4.2.1:**
   - the "Branch defaults" card under the tree, with one row per active branch;
   - the "Default for" column;
   - the reason-gate wording;
   - the deactivate warnings: "default for Oslo. New Oslo lines will have no default cost centre until you choose another", plus the draft count.
5. **Audit:** `org-branch` UPDATE of the default, with reason, before and after.
6. ADR-027 contract rules (published nulls, fixtures, tolerant enums, `actions.<x>.{allowed, blockedBy}`); the footer order; no window-width reads; four languages.
7. **Two companies:** another company's cost centre on a branch → refused. Another company's branch → 404.

## Scope edges
- **In:**
  - org-service (the field, its migration at the next free number, the write, the read, the event);
  - accounts-service (the line-default chain, "default for branches" on the cost-centre read, the deactivate warning list, the machine read);
  - the App cost-centre page, the Org branch detail, and the manual line defaults in the editors.
- **Out:**
  - departments and HR defaults (later);
  - item defaults (Inventory, later);
  - anything flow 2 owns (REQUIRED checks; this flow only supplies the default).

## Definition of Done
WORKFLOW v2 §5, plus:
- **Old FAIL / new PASS:** a new manual line from Oslo has no cost centre on the base, and takes Oslo's default now.
- An explicit line or header value wins. Changing the default doesn't change saved lines.
- A cross-company id is refused on the branch write; a caller without the code gets 403.
- **App:**
  - a Compose UI test: set Oslo's default through the reason gate, then a new journal line from Oslo shows it;
  - size tests en/nb/sv/da for the Branch defaults card and the deactivate warning.
- Own tests plus a compile only; ~3 h per repo; report at the box.

## Never
- `--no-verify`, force push, AI attribution, GitHub workflows, writes in the other repo; builders don't push, merge or rebase.
- Migrations: the next free number at build time; never edit an applied migration.
- Never open, print, grep the content of or copy `.env` files (incl. tracked `infra/.env`), `.local-secrets/**`, token/session files, `~/.gradle/gradle.properties` and other user-level `gradle.properties`, `~/.netrc`, `~/.npmrc`, `~/.aws/**`, or keys. Read one key only when needed (`grep -c '^key=' file`).
