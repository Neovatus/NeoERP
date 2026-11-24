# Lane verdict: DEMO-FM2-BE (demo data: second Kystgruppe Finance Manager, Ola reads Lahore) — 2026-11-22

**Verdict: MERGE**, **merged** (standing merge): BE `phase/4` `7246cee5` → `0a8bbffe` (fast-forward, old-Mac lane; rebased as `-r` after FIX-AL-RELEASE-BE).
- Scope: demo/dev data only (4 files: `docs/local-demo-data.md`, `scripts/make-demo-tokens.sh`, `scripts/seed-demo-iam.sh`, `scripts/seed-demo-iam.sql`). `kari.hansen` becomes a second Kystgruppe Finance Manager (approval-step checks); `ola.nordmann` gets a read-only membership at Lahore Textiles (cross-country company-switch checks), not primary. No production code, migration or non-demo config.
- Tier 1, NORMAL. Review: one Opus, ACCEPT on `d383281c` (`.review-channel/demo-fm2/review-1-opus.md`): idempotent seed, Ola read-only at Lahore, two-person rule is per person so Kari's extra role does not let her approve her own submission, token script follows the existing format. One nit: seed header still lists Ola's extra memberships without LHRTEX.
- **Gate:** 3 runs. Run 1 failed on the `S3ContractTest` gigabyte timeout flake (environment). A later run ended "tree is not clean" because a reviewer wrote into the worktree while the gate ran (process; 13 min lost). Then `verify: OK`, marker `0a8bbffe`. Gate time of the final run not recorded.
- **First-pass gate:** no. Cause: environment (S3 flake); second failure was process (dirty tree).
- Lesson recorded in the overseer handoff: never let a reviewer write into a worktree while its gate runs; reviewers write to `.review-channel/<lane>/`.
- Docs pages: developer `docs/local-demo-data.md`; user guide none.

## Timeline (MEASURE-1)
- Build, review, rework, test, waiting: not recorded (all buckets).
