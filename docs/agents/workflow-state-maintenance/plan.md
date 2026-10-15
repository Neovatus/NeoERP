# Workflow state maintenance

## Checkpoint

| Field | Value |
| --- | --- |
| Task ID / objective | workflow-state-maintenance: require all tools to read and maintain shared state and task progress. |
| Owner / integrator | Codex in this task; no parallel writers assigned. |
| Repositories | Workspace governance, frontend and backend agent/workflow instructions only. |
| Stage / status | Awaiting independent review after Engineer and Advisor 2 self-check. Final Approval remains required. |
| Approval | User requested adding mandatory read/update/maintenance responsibilities to workflows and skills. No approval to promote project-state drafts, retire documents, alter production code, commit or push. |
| Completed | Shared contract, neutral entry point, both repos' guides and all four skills wired; conflicting pickup/report/priority instructions narrowed; static checks passed as qualified below. |
| Remaining | Independent review of the documentation-only diff, any scoped corrections, final approval. Canonical project-state consolidation remains separate. |
| Evidence | App HEAD 73136f3, backend HEAD 7584040 plus existing dirty trees. 25 shared-contract/entry links resolve; four skill hooks match; both repo diff whitespace checks pass. Ruby YAML/name/description validation passes for four skills. The stock Python validator could not run because PyYAML is absent in both available runtimes. No application builds needed or run. |
| Resume point | Independent reviewer checks shared ownership/approval boundaries and pickup paths; task lead records disposition here, then requests Final Approval. No commit or push authorized. |
| Blockers | Canonical workspace state absent; ownership/versioning/canonicalization are a separate approval. No independent review yet for this change. |

## Discovery and plan

Agents currently encounter multiple "read first" state documents and workflow
copies with different maintenance/continuation rules. A shared document without
an explicit update owner or stage checkpoint can become stale immediately.

Use one workspace WORKFLOW.md for shared process and record maintenance. Keep
repository-specific technical gates in existing skills. Route all entry points to
the shared contract; preserve explicit read-only tasks and approval boundaries.
During the approved transition, missing project state is disclosed and task work
is checkpointed in the owning plan; no draft is silently promoted.

## Write scope and acceptance

- Workspace WORKFLOW.md, AGENTS.md, CLAUDE.md, .codex/CODEX.md and this owning plan.
- Both repo AGENTS.md/tool guides/workflow SKILL.md and context references, plus
  frontend stage-pipeline and agent-index instructions where pickup conflicts.
- No application, backend, design, schema, ADR, state-draft, remote or Git-policy changes.
- Startup links reach the same process; four skills require the same checkpoints.
- Plan owns detail; workspace index owns workstream navigation; workers do not race
  to overwrite either. Read-only reviews remain read-only.
- No-op questions do not generate plans; significant decisions/findings survive;
  routine logs/replies do not become permanent reports. Final Approval remains gated.
- Validate changed links and skill frontmatter, compare maintenance hooks and review
  start/resume, blocked, parallel, read-only and completion scenarios statically.

## Advisor self-challenge

This is a structured self-check, not independent approval. Main risks are another
competing policy, new mandatory artifacts for trivial work, invalid links outside
standalone clones, or bookkeeping bypassing approval. The shared contract has one
owner, explicit missing-context behavior and scope/read-only exceptions. Ask an
independent reviewer to challenge these before final closeout.

## Engineer / Advisor 2 self-check

Start/resume reaches the same contract from tool-neutral or tool-specific guides.
Parallel workers hand results to the lead, rather than concurrently editing the
shared plan/index. A read-only review reports proposed updates without writing.
A blocker records owner, reason and next approval; it is not relabeled complete.
Completion requires current evidence/remaining gates; Delivery permits only actual
approved hashes/status bookkeeping, not unreviewed product changes. Missing shared
state is explicitly disclosed and does not make either proposal canonical.

These are static scenario checks, not independent agent execution or proof that
every future agent complies. Shared files remain uncommitted and the workspace
itself remains unversioned; distribution/canonicalization is outside this change.
