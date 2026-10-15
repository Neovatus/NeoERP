# Accounts lead — progress

Owner: **Code · Accounts lead (trial)**, from 2026-10-10 09:40 UTC. One screen: done / waiting / next. Detail lives in
`docs/handover/accounts-lead-handover-code.md` §5 and the decisions log.

## Done (2026-10-10)
- Took over from Cowork · Accounts lead (handover read; §0 read).
- ACC-14 (registry REQUEST → ERP), ACC-15 (FYI → HRP), ACC-16 (answer ERP-26/28/30 → ERP).
- Rig shared helpers (accounts-a0.jsx): `acPct` = NeoPercent (`12,5 %` / `12.5%`); `acParseTypedDate` = the one typed-date parser.
- Builders: no new commits since the handover (backend `dev` 3 unpushed: 73cb889, c98d4fd, dbbe068; app `dev-app` 17 unpushed up to 10199ab).

## Done in the design push (2026-10-10)
- B/C/D/E/A3 fixes (ERP-26, ERP-28 incl. TAX-9/14), TAX-15 demo data; answered ACC-33.
- New contracts + specs + rigs: A4, A5 (contract only), H-SE, document output + e-invoicing, attachments.
- app.html: Accounts blocks refreshed, 4 new blocks; 192/192 design-index routes pass, zero console errors.
- Jabran decided G-1…G-7, D-107, D-40, N-1 (2026-10-10). A5 updated per HRP-27 (waiting HRP confirm, ACC-37). NO e-invoicing dates CHECKED. Docout + component contracts with ERP lead (ACC-36).

- Packs 2026.2: NO/DK/FI/IS verified, Opus-reviewed, folded, fold reviewed and fixed (REVIEW-*-2026-10-10.md). Ready for CP-P26.2 (Phase 2).
- Build phases in accounts-roadmap.md; Phase 1 resumed (ACC-42/43); mains started by Jabran.

## Waiting
- Jabran: bundle answer. HRP: A5 agreement (ACC-24). ERP: ACC-25, ACC-28. Design main: VER-NDFI-1.
- Builds on HOLD (ACC-21/22).
- CP-A2.1b report (backend); CP-A1.2a fix-round report (app).
- ERP-33.5 (missing cited files) after the B–E pass.

## Next
1. Integrate sub-agent output → sync app.html blocks → Playwright check → answer ERP-28 with ids.
2. Bundle to Jabran: B, C, D, A3 (+E after TAX-9/14) rig approval, D-107, D-40.
3. Review CP-A1.2a fix report and CP-A2.1b report → accept / fix → push order.
