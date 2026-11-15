# One person id (ID-1) — plan

## Checkpoint
| Field | Content |
|---|---|
| Identity | Token `sub` = stable identity id (not the old username); IAM user id stored everywhere; reseed dev data; delete the username fallback in user-service and the subject fallback in approval limits (D-202). Repos: NeoERP-BackEnd (auth/Keycloak mapping, user-service, accounts, others that store actors), NeoERP-App (if it reads `sub`/username). |
| Approval | **Jabran 2026-11-16: yes** ("we're in dev with no customers"). Sign-in change approved in principle; the plan's concrete auth changes still come to Jabran before code. |
| Stage | Planning (Opus, read-only). |
| Source | `docs/agents/legacy-sweep/report.md` item 1; App `docs/agents/auth-architecture-decision/plan.md:77-78`; backlog D-202. |
| Resume point | Read the planner's output, put the auth specifics to Jabran, then slices. Approval limits S2/S3 continue meanwhile; the plan says how they adapt. |

## Planner output (Opus, read-only, 2026-11-16) — summary
- Today: three ids (Keycloak user id; auth `neoerp_identity_id`; random `iam.users.id`). Token `sub` = preferred_username (auth-service `JwtCustomizerConfig.kt:75-83`). user-service resolver: identity id, then (idp, subject=username) fallback (`UserIdentityResolver.kt:7-22`).
- Target: `neoerp_identity_id` = `iam.users.id` = token `sub`. Keycloak id stays an external link only (`iam.users.subject`, `auth.external_identity_links`). Keycloak config unchanged. auth-service one line (`JwtCustomizerConfig.kt:83`). user-service id-only resolver. shared-security: human call refused (503) when user-service userId ≠ sub → one column per person everywhere.
- Columns stay VARCHAR; reseed is the fix (no column migrations). user V49: CHECK id = neoerp_identity_id; delete V9 local dev users (C).
- Reseed: seed-demo-iam.sql/.sh, reconcile-local-seed-identities.sh, seed-demo-tenants.sql:341-356, seed-demo-audit.sql; `docker compose -f infra/compose.yml down -v`, re-seed, everyone signs in again. **Wipes Jabran's Phase 3 test data** (T14–T16, T18, T24 to redo).
- In-flight: S2 unchanged (V47/V48 before V49). S3 trimmed (no `_user_id` columns on existing tables; told 2026-11-16). ID-1 before S4.
- Slices: ID-1a backend auth/user/shared-security (Opus, security review) → ID-1b seeds + docs + AL §13 rewrite (Sonnet) → ID-1c app NeoSession one id (Sonnet) → lead full run → Jabran resets.
- Needs Jabran: the 9 auth points incl. A (first sign-in without IAM row: refuse vs auto-create), B (keep `neoerp_identity_id` claim), C (delete V9 dev users).
