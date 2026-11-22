Reviewer: Opus 5.5
Reviewed: d383281c889c2e1577900b951530047b38f17b50
Range: 8472c728b6efa0452b78f34d2a3cc15dbe64c4e4..d383281c889c2e1577900b951530047b38f17b50
Verdict: ACCEPT

- Scope: 4 files only (docs/local-demo-data.md, scripts/make-demo-tokens.sh, scripts/seed-demo-iam.sh, scripts/seed-demo-iam.sql). No production code, migration or non-demo config touched.
- Idempotency: Kari reuses her existing person 1a…012 and membership 1b…014 (no new person). Ola's new membership 1b…044 uses a stable id with `ON CONFLICT (id) DO UPDATE`; Ola had no prior root membership at LHRTEX, so `uq_membership_user_org_root` (V3) cannot clash, and is_primary=false keeps his KYSTNO primary. Role rows are deleted and re-inserted wholesale per run, so no duplicates. Keycloak persona: the .sh looks up by username, creates only if missing, then PUTs; username/email (kari.hansen@kystgruppe.local) are already the IAM row's, unique among personas.
- Isolation / two-person: `IAM.ACCOUNTS_VIEWER` grants only READ / REPORT codes across V10, V27, V36, V43 (reader flag), V44, V46, V47; every write/approve code there is limited to ORG_ADMIN / ACCOUNTS_ADMIN / ACCOUNTANT. Ola at Lahore is read-only. No acceptance script uses Ola as an outsider probe against Lahore (b-acceptance and seed-demo-phase3 use LHROWNER), so no isolation check is weakened.
- Kari HR Manager + ACCOUNTS_ADMIN gives the same mix as Sadia at Lahore (existing precedent). The two-person rule is enforced per record by person (accounts-service JournalApprovals / JournalPostingService TWO_PERSON_RULE), not by role, so her extra role does not let her approve her own submission. Kystgruppe has no Payroll, so no HR+Payroll+Finance concentration.
- Token script: entry `kari.hansen NEOERP_KYST_FINANCE2_TOKEN_FILE` follows the existing format; files are /private/tmp/neoerp-<user>.jwt with umask 077 + chmod 600; no password printed. Docs give the same path and say no seeder reads the variable yet (accurate).
- Docs rows match the seed (roles, companies, membership not primary, published Name123! pattern).
- Nit (no action needed): the seed-demo-iam.sql header (lines 29-30) still says Ola's extra memberships are KYSTDK/FI/IS only; could mention LHRTEX next time the file is touched.
