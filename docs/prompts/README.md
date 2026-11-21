# Prompts for Claude

Ready-to-use prompts. In Claude Code, open the `NeoERP` workspace folder and say:

> Read `docs/prompts/<name>.md` and do what it says.

| Prompt | Use it when |
|---|---|
| [setup-new-mac.md](setup-new-mac.md) | A Mac that has never run NeoERP: install tools, clone repos, seed the local stack, restore the lead memory. |
| [resume-overseer.md](resume-overseer.md) | The old-Mac lead that checks the new Mac's lanes and builds HR/Payroll from Monday: reopen the same session, or start fresh as overseer. |
| [resume-lead.md](resume-lead.md) | Any session (new Mac, new session, after a compact) that should continue the project as the lead from where the last one stopped, after checking it works the way we agreed. |

Two Macs, two leads (WORKFLOW.md "Two Macs, two leads"): the new Mac leads (`resume-lead.md`), the old Mac oversees and builds HR/Payroll (`resume-overseer.md`). Claim work in `.review-channel/claims.md` first; pull before work, push right after.
