# Prompts for Claude

Ready-to-use prompts. In Claude Code, open the `NeoERP` workspace folder and say:

> Read `docs/prompts/<name>.md` and do what it says.

| Prompt | Use it when |
|---|---|
| [setup-new-mac.md](setup-new-mac.md) | A Mac that has never run NeoERP: install tools, clone repos, seed the local stack, restore the lead memory. |
| [resume-lead.md](resume-lead.md) | Any session (new Mac, new session, after a compact) that should continue the project as the lead from where the last one stopped, after checking it works the way we agreed. |

Only one Mac runs agents and pushes at a time. Before switching, the old session writes its handoff and pushes (`resume-lead.md`, step 0).
