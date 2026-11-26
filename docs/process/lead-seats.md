# Lead seats: one old-Mac lead role, two subscriptions

**Jabran 2026-11-26:** the old-Mac lead role (module lead for `core/*`, integration lead for every PR to `main`, simulator sessions for the old Mac, HR later) can run from **two seats on this same laptop**: the **personal** subscription and the **company Team** subscription. Same role, same rules, same files. Only **one seat is active at a time**.

## The baton
- The first lines of `.review-channel/handoff-overseer.md` say `Active seat: <personal | team> since <date time>`.
- **Taking over:** `git pull` the workspace and both repos; read `handoff-overseer.md` (it lists what runs), `docs/VISION.md`, `docs/PRINCIPLES.md`, `docs/process/workflow-v2-draft.md`, `.review-channel/lead-decisions.md` (latest entries), `docs/inbox/erp-lead.md` (latest), then set the baton line to your seat and push it before any other work.
- **Before handing over** (or at ~50 % context, or when the usage limit nears): finish or pause the step in hand; stop the stack and simulators you started (stop services by port; `xcrun simctl shutdown all`); write what runs, what waits for Jabran and the next step into `handoff-overseer.md`; push; set the baton line to `free`.
- Never two seats at once: they share this Mac's Gradle locks (one job per repo), the local stack ports and the simulators.

## What each seat can and can't reach
- **Shared through git (both seats):** the workspace and both repos: handoff, decisions, inbox, backlog, briefs, done lists, reviews, measures, `docs/lead-memory/` (the lead's memory, copied from the personal seat's memory folder at each handover).
- **Memory:** both seats use this Mac's `~/.claude` folder if they run under the same macOS user, so the auto-memory is shared; `docs/lead-memory/` is the git copy, refreshed by the seat handing over (`rsync` the `.md` files, no secrets in them).
- **Not shared:** desktop-app sessions and sub-agents belong to the seat that started them. A flow-lead session started by one seat can't be messaged by the other: the taking-over seat reads its handoff file (`.review-channel/handoff-<name>.md`) and, if needed, starts a fresh flow-lead session from it (D-89 wants a fresh one per flow anyway).
- **New-Mac lead:** messages go through `docs/inbox/erp-lead.md` plus the doorbell; a doorbell from the other subscription may not arrive, so the inbox file is the channel that always works.

## Same rules in both seats
Never `--no-verify`, no force push, no AI attribution in commits/PRs/comments, never open secret files, no GitHub workflows; pull and grep before taking a decision number; draft PR per branch (D-93); flows cut from `main` (D-95); the gated flow (D-97); a new agent per stage with titles (D-89); done lists verified with fresh evidence (D-87); whole suite, gate runs and gate-file edits only on Jabran's yes.
