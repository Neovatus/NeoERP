# One person id (ID-1) — plan

## Checkpoint
| Field | Content |
|---|---|
| Identity | Token `sub` = stable identity id (not the old username); IAM user id stored everywhere; reseed dev data; delete the username fallback in user-service and the subject fallback in approval limits (D-202). Repos: NeoERP-BackEnd (auth/Keycloak mapping, user-service, accounts, others that store actors), NeoERP-App (if it reads `sub`/username). |
| Approval | **Jabran 2026-11-16: yes** ("we're in dev with no customers"). Sign-in change approved in principle; the plan's concrete auth changes still come to Jabran before code. |
| Stage | Planning (Opus, read-only). |
| Source | `docs/agents/legacy-sweep/report.md` item 1; App `docs/agents/auth-architecture-decision/plan.md:77-78`; backlog D-202. |
| Resume point | Read the planner's output, put the auth specifics to Jabran, then slices. Approval limits S2/S3 continue meanwhile; the plan says how they adapt. |
