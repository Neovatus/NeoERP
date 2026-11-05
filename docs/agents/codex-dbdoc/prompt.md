# Codex docs — db-design.md sections for accounts V54–V59

Work ONLY in `/Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/codex-dbdoc-be` (branch `codex/db-design-m5`, from dev). Commit there; **never push or merge**. Docs only — no code.

`docs/database/db-design.md` has a section per accounts migration but none for V54–V59 (V60 exists). Add one section each, in the same style as its neighbours, from the migration files `services/accounts-service/src/main/resources/db/migration/V54__…` to `V59__…` and the matching contract notes in `docs/api/accounts-b.md` / `accounts-c.md`:
V54 customer bank requests · V55 refund draft settles · V56 supplier advance evidence · V57 AP advance guard + signed subtotals · V58 supplier refund requests · V59 fiscal state integrity.
For each: tables/columns added, constraints and triggers (what they enforce, in plain words), and why. Check facts against the SQL; do not invent.
Never read `PROJECT-STATE*.md`, `.local-secrets` or key material.
Commit: `git -c user.name=jabransiddiqui -c user.email=jabransiddiqui@outlook.com commit -m "docs(db): accounts V54–V59 sections" -m "Co-Authored-By: Codex <noreply@openai.com>"`. Report in `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/codex-dbdoc/report.md` (one paragraph + commit hash).
