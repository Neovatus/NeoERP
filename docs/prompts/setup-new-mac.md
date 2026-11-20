# Set up a new Mac for NeoERP

Jabran clones the workspace first:

```bash
git clone https://github.com/Neovatus/NeoERP.git ~/Offices/Neovatus/NeoERP
```

Then, in Claude Code opened on `~/Offices/Neovatus/NeoERP`:

> Read `docs/prompts/setup-new-mac.md` and do what it says.

## For Claude

1. Read `SETUP-NEW-MACHINE.md`.
2. Run `scripts/check-new-machine.sh`. It only checks; it installs nothing.
3. For each MISSING item, use its hint:
   - Clone repos and create `NeoERP-App/local.properties` yourself.
   - Homebrew formulas (`gh`, `node`, `python`, `rsync`) you may install.
   - Ask Jabran before any `brew install --cask` (JDKs, Docker) because it may need his password.
   - Xcode, iOS simulators and Android Studio: tell Jabran; he installs them himself (Apple ID / large installs).
   - `gh auth login`: Jabran runs it himself (it signs in).
4. Re-run the check until everything is OK.
5. Start Docker (`open -a Docker`, wait until `docker info` works), then:
   ```bash
   cd NeoERP-BackEnd && NEOERP_CONFIRM_RESET=yes scripts/reset-local-dev.sh
   ```
6. Restore the lead memory: `scripts/sync-lead-memory.sh restore`.
7. Report to Jabran: what you installed, what he still has to do, and the final check output.

Do not start any batch, builder, tester or push. That is `resume-lead.md`, and only on the Mac that runs the work.

## Rules that already apply here
- Never type, print or copy passwords or tokens; dev secrets come with the clone and are only used by scripts.
- No AI attribution in commits.
