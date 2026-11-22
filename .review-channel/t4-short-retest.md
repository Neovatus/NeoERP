# T4 short retest (only blocked and failed steps) — owner: old-Mac lead

Runs after these merge: FIX-AL-RELEASE-BE, FIX-OB-IMPORT-BE, FIX-OB-IMPORT-APP, DEMO-FM2-BE (with Ola on Lahore). Step text: `sim-session-phase4-retest-trimmed.md`. Results go to `test-ledger.md`. No gate runs meanwhile.

## 0. Data first (lead, before any tester starts; each item checked, not assumed)
| ID | What | How | Check |
|---|---|---|---|
| P1 | Stack on the merged heads, jars and iOS app rebuilt | gradle-job jars; xcodebuild; `run-all-services.sh` (org before user) | 8 healthy |
| P2 | Demo IAM with kari.hansen (FM2) and Ola reading Lahore | `scripts/seed-demo-iam.sh` from the merged BE checkout | seed output lists both rows |
| P3 | Sessions: ola, anna, bjorn, kari (password file from the docs via a temp file, never printed), jonas.moe, erik.sand, ayesha, omar | `make-demo-tokens.sh` | `/private/tmp/neoerp-<user>.jwt` exists for each |
| P4 | **Approval limits switchable** for Kystgruppe and Lahore | after FIX-AL-RELEASE-BE + demo seed; Ola: Company → Modules → Finance → Approval limits **On** | Approval limits page opens (not "switched off") |
| P5 | Fresh opening-items import for Lahore (B2b-5/6/16a, B2b-17) | new CSV with new customer numbers (no clash with OB-AR-DRAFT-000006/7) | Check step accepts it |
| P6 | D1 journal-import file (B2a-S3.3) and AC418-10a submissions (refund, write-off, receipt, payment) | tester does them as setup steps in the app, named users | items show "Waiting" |

## 1. Steps to run
| Group | Tester / devices | Steps |
|---|---|---|
| R-AL | tester 1 · iPad Pro 13 (ola) + iPad mini (bjorn / kari) + iPhone (anna) | AL-L2…L4 and AL-P1/P2 via UI as setup, then AL-J1, AL-J3, AL-J7, AL-P6, AL-P7, AL-P9, AL-O1 (+O3 via UI), AL-Lang (nb/sv/da), AL-R3 |
| R-SW | tester 1 · iPad Pro 13 (ola: Kystgruppe ↔ Lahore) | SW-A1, SW-B6 |
| R-OB | tester 2 · iPad Air 13 (ayesha, omar) | OBS-2 (Excel → .xlsx), held-out offer when drafts exist, B2b-5, B2b-6, B2b-16a, B2b-17 |
| R-misc | tester 2 · iPad Air 13 (ayesha) then tester 1 | B2a-S3.3, B2a-S6 ("Untick it to go on."), AC418-10b, B2b-3 |

**Not in the simulator:** B2a-S2 step 3 (soft keyboard visible) — the simulator cannot hold the soft keyboard reliably; Jabran checks it once on a real device when convenient, or it becomes a Compose UI test with an IME inset (D-69).

## 2. After the run
Every FAIL → its feature's fix lane with an automated test first (D-69). A step failing twice comes to Jabran with a one-line reason (phase plan budget).
