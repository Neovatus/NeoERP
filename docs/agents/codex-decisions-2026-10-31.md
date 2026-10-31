# Codex rounds 1–2: decisions for Jabran (2026-10-31)

Every Codex finding was re-checked by an independent agent (triage files next to each report).
Codex was wrong outright in 0 findings; several severities were adjusted; the checks found 9 issues Codex missed.
Recommendation is listed first. Answer "all as recommended" or list the IDs to change.

**Jabran 2026-10-31: approved as recommended (incl. D0 delete NeoTableEmptyState.kt), except:** code that will be
rewritten in coming phases is not fixed now. Legacy HR, Payroll, ESS and Inbox: UX batches B and C dropped; I2/I3
(HR company checks) become requirements for the HR rebuild, not fixes now. Items that need a professional/official
check (T1, L4, L6, R4, R8, S1, U5) are checked by the lead against official sources, decided, and reported to Jabran.

## Fix first (security and money)
| ID | Decision | Recommendation | Triage |
|---|---|---|---|
| I1 | NEW-01 (High, live): a company admin can read/overwrite anyone's personal profile (national ID, tax ID, DOB, address) after inviting their email | Pending invite no longer counts as membership; sensitive profile fields need authority in every company of the person (like email). Profile is person-owned, self-service. Auth change → needs your OK | codex-tenant-isolation/triage.md |
| I2 | HR: TI-01 reviews on another company's goal, TI-02 foreign manager/department ids, NEW-02 approver id from request body | One HR batch: owners from stored rows, acting employee from the token (drops body fields the app sends) | same |
| I3 | `employee_id` token fallback (TI-03/05, dormant) | Delete the fallback; shifts are company-owned | same |
| I4 | Payroll has no company column; safe only via a local/test-profile gate | Keep the gate; you confirm no shared environment runs payroll with only local/test | same |
| I5 | Architecture tests for each confirmed class | Yes, with the fixes | same |
| E1 | Posting: V40 guards (lines into posted journals only from the posting itself; lock parent before status check; real reversal links only; counters only +1) + tests + 2 doc corrections | Yes, one backend item, independent review before push | codex-posting-invariants/triage.md |
| E2 | Bulk-approval double count (F-04), AR credit-note deadlock (F-02) | Small code fixes after E1 | same |
| E3 | Stolen service DB login can still write a new balanced fake journal | Accept and document now; consider a tamper-evident hash chain with the retention work | same |
| E4 | Machine client approval evidence trusted | Keep (contract) | same |
| E5 | F-06 not a defect | No change; optional sentence in BA-1 | same |
| B1 | Approver never sees fraud warnings or proof file (High) | App fix now: show all warnings above Approve, add "holder name missing" warning, record shown warnings in audit | codex-bank-safety-review/triage.md |
| B2 | Same account as IBAN vs domestic number not flagged | Light fix, no DB change (NO, DK, FI, PK; SE later), include pending requests | same |
| B3 | Notices saved but never sent | Notification service sends them; accounts machine client gets `notification.command.write`; until then screen says "supplier not yet told" | same |
| B4 | No malware scan for proof files | Go-live blocker; meanwhile "file not yet checked", proof optional | same |
| B5 | Key safety (startup key check, re-encryption job) | Before first real deployment, one batch + forward migration | same |
| B6 | Drop plaintext bank columns | Only when no unsealed row remains AND a decrypt/restore test passes (R2) | same |
| B7 | Small hardening (debug log, reveal limit per instance, app toString, machine default secret) | Ride along with any batch | same |

## Tax data (round 1)
| ID | Decision | Recommendation | Triage |
|---|---|---|---|
| T1 | PK s.153 withholding base | Gross including sales tax (Ordinance s.153(1)), overriding MJ-4; ideally the MJ-4 accountant confirms | codex-tax-triage.md |
| T2 | All confirmed tax data fixes | One forward migration + same corrections in the next pack | same |
| T3 | FI reduced-rate import / EU acquisition codes | Next pack | same |
| T4 | PK toll-manufacturing, rice/oil s.153 codes | Add, low priority | same |
| T5 | PK provincial codes | Keep inactive until registration per province is modelled | same |
| T6 | 2027 rate rows | None yet (NO EV change is a proposal) | same |

## Statements and payment references (round 1)
| ID | Decision | Recommendation | Triage |
|---|---|---|---|
| L1 | "Statutory layout" claim | Report MANAGEMENT until L2 lands | codex-layouts-refs-triage.md |
| L2 | FI missing subtotal; BS maturity misroutes | FI fix first; misroutes as one new chart version with an adoption step for existing companies | same |
| L3 | Long/short-term marking | Two new account subtypes (not a general maturity attribute) | same |
| L4 | DK creditor number MOD11 | Confirm weights with Nets/bank before enforcing | same |
| L5 | NO KID minimum length | Raise 2 → 4 | same |
| L6 | PK statement lines | A Pakistani accountant checks | same |
| L7 | FI/DK line wording | Local-language wording from the law | same |
| — | FIK +73, OCR app/server mismatch, IBAN per-country rules | Fix (no decision needed) | same |

## Payee verification
| P1 | Build the check port + approver display now, no provider ("not verified") | Yes | codex-payee-verification/decision-brief.md |
| P2 | First provider | NO KAR or FI via the customer's bank, by first customer | same |
| P3 | "No match" | Holds approval; exception needs reason + second person; per-company setting off until a provider is live | same |
| P4 | DK, IS | Manual confirmation; revisit on request | same |

## SIE / SAF-T
| S1 | Norway SAF-T version | 1.40 for FY2027+, 1.30 legacy only; re-check design against 1.40 | codex-sie-saft/triage.md |
| S2 | SIE without zero balances | Accept with info note | same |
| S3 | SRU scope | Doc: INK2R account codes only | same |
| S4 | SIE hardening | One low-priority ticket | same |
| S5 | Year-end convention | Keep; one line in export doc | same |

## Retention and e-invoicing
| R1 | Keep by record class from the FY it concerns; purge on expiry; amend attachments C-14 and D-152 first | Yes | codex-research-triage.md |
| R2 | Plaintext bank-column drop | Gate on full decrypt/restore proof | same |
| R3 | Import and proof files | No plain-timer purge; PK purges off until PK law checked | same |
| R4 | Re-read NO §13 (amended 2027), DK §12(2), FI 2:10, IS before any purge | Yes | same |
| R5 | Peppol | Provider access point; start comparison now | same |
| R6 | NO e-invoice sender (needed by 2027-01-01) and PK FBR link | Pull forward | same |
| R7 | Split buyer reference / order reference; fix docout text errors | One contract amendment | same |
| R8 | PK SRO 1666(I)/2026 and FBR DI API | Read before PK build | same |

## App UX
| U1 | Legacy HR/Payroll/ESS/Inbox | Fix only serious bugs (errors, dates, money) now; full cleanup when rebuilt | codex-ux-sweep/triage.md |
| U2 | "No companies match" picture | §23 wins; update rig | same |
| U3 | "Done" messages | Drop when the change is visible; toast otherwise | same |
| U4 | Dashboard clock-in tile | Blank under its label (batch A doing this) | same |
| U5 | Payroll/ESS currency | Company currency unless the run has its own (I check backend) | same |
| U6 | First-use create button on Company list / Platform staff | Hide for request-only users | same |

## Proposed order once approved
1. I1 (live data exposure) — backend user-service, independent review.
2. B1 app (after the running UX batch A) ∥ E1 V40 backend.
3. T2/L2 data fixes (V41+, one chart version), I2–I3 HR batch, B2/B3.
4. UX batches C, B, D; S2; E2.
5. Docs/research items (R1, R4, R7, S1, S3, L6, R8) and later items (B4, B5, P1, R5/R6 planning).
