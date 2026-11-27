# Jabran's to-do list

What only Jabran can do or decide, with when it is needed. The lead keeps this list current (adds new items, ticks
done ones with the date) every batch. Details and drafts are linked; nothing here holds a password or token.

**Last updated:** 2026-11-22 (new-Mac lead).

## Now (waiting on you)
| # | What | Why it waits on you | Details |
|---|---|---|---|
| N1 | S4 last step (simulator shut down 2026-11-21; boot it again when you want to run it): turn on the iPad simulator's hardware keyboard (the keyboard switch in the simulator panel of the Claude app; this Mac has no separate Simulator app), then the lead finishes S4 (S1–S3 passed) | The lead's tool cannot switch it | `NeoERP-App/docs/agents/fix-app-a/builder-report.md` "Needs a simulator" |
| N4 | **Read the ARCH-1 gap map** (and the capacity model), then tell the lead to resume step 2 (the missing ADRs) | Step 2 is paused until you have read step 1 (your request 2026-11-21) | workspace branch `phase/4-b2-arch1`: `docs/agents/arch1/gap-map.md` (`9323add`), `capacity-model.md` (`1de5b7e`) |
| N5 | App B1 questions: (a) "Saving…" while a menu pick waits — info toast (built) or a line in the editor footer? (b) mono tabular figures on **every** Amount field app-wide (built; Inter Tight's thin no-break space was invisible) or only the accrual panel? | Design choices only you make | `NeoERP-App` `docs/agents/fix-app-b1/builder-report.md` "Questions" |
| N6 | Answer the old Mac's merge-rule question (`WORKFLOW.md:328`), and decide the two-Mac split (coding on the new Mac; full runs and merges on the old Mac, 34 GB) | Process rules are yours | handoff 2026-11-22 |
| N8 | App B2a and B2b "As built" spec notes (design owner, no rush; B2b adds the general ledger on a phone: cost centre and project as labelled lines on each card): the Automatic reversals tab's status filter mapping (Posted includes "reversed by a person"), "Cancelled" shown with no name (the API has none), journal and RV numbers as plain text on reversal rows, and an extra Journals-notice sentence for reversals that could not post. Say OK or ask for a change | Design choices are yours; the lead accepted them for now (D-28) | `NeoERP-App` `docs/design/specs/accounts-a4.md` §3/§4.1 "As built" (after B2a fix round 1) |
| N9 | ~~GATE-3 lane~~ **Approved by Jabran 2026-11-22** ("after what you're doing"): starts after RISK-NARROW-1 merges and the running lanes are handed back | done | `.review-channel/lead-decisions.md` D-45 |
| N3 | Switch the **lead session to High effort** in the app (it still shows medium) | Only you can change the session setting | claims.md "New-Mac lead rules" 1 |
| N12 | Native check of the Danish labels "Stornér" and "Fjern" (spreading change screens) | Needs a Danish speaker or translator | docs/backlog.md "Spreading flow 2 `change` leftovers" |

## Before Phase 5 starts (after the Phase 4 PR merges)
| # | What | When exactly | Details |
|---|---|---|---|
| P1 | **Send the vendor requests**: Inexchange/Maventa (Peppol, partner test account and written offer), Storecove in parallel | Now if you can: onboarding takes weeks and Norway e-invoicing is the first Phase 5 item | `docs/agents/vendor-choices/requests.md` §1–2 |
| P2 | Sign the **Visma (Maventa) agreement and DPA**; get the written confirmations (Iceland 0196, OIOUBL 2.1, MLS date, exit terms) | Before 5.2 (NO e-invoicing) starts | `peppol-access-point.md` |
| P3 | Create the **Neovatus AWS account**, choose and register the **sending domain**, request **SES production access** | Before 5.1 (document output) is tested; SES access can take days to weeks, so early | `requests.md` §3, `email-provider.md` |
| P4 | Decide **D-130**: does NeoERP register as a Danish bookkeeping system (MitID, opt-out notices)? | Before the DK e-invoicing work | `peppol-access-point.md` |

## Pakistan (start early: the longest lead time)
| # | What | When | Details |
|---|---|---|---|
| K1 | Name a **sales-tax-registered Pakistani company with IRIS** for the FBR sandbox (a Neovatus Pakistan entity or a willing company) | Before 5.4 (PK FBR) starts; paperwork early | `requests.md` §4, `pk-fbr-route.md` |
| K2 | Choose the **Pakistan hosting region** and fix 1–3 static outgoing IPs (go-live H-6) | Before the sandbox application (K1) | go-live H-1, H-6 |
| K3 | Get a **Pakistani tax lawyer's opinion**: SaaS vendor licence (r.150XE(1)), servers outside Pakistan, the 3 e-mail/data questions (ACC-R24) | Before the first Pakistani customer; ideally before 5.4 | `pk-fbr-route.md`, `email-provider.md` |
| K4 | Name a NeoERP technical contact and a PRAL support-portal (DICRM) login | With K1 | `requests.md` §4 |

## Before each country's first customer
| # | What | When | Details |
|---|---|---|---|
| C1 | **Accountant sign-off (ERP-Q1)** per country, after the AI double review: arrange the reviewer (a hired country accountant or the first customer's accountant); a few hours per country | 6 weeks before that country's first customer; order PK → NO → SE → DK → FI → IS | Accounts roadmap decision 13 |
| C2 | Native-speaker read-through of the app per language (go-live L-7) | Before that country's first customer | go-live L-7 |
| C3 | Iceland and Finland record-keeping arrangements (H-2: a copy in Iceland or a provider arrangement; H-4: inspectable from Finland) | Before the IS / FI launch | go-live H-2, H-4 |
| C4 | **Norwegian standard account names licence:** the Regnskap Norge 4-digit list (via Skatteetaten SAF-T) may only be used for SAF-T mapping; shipping its names in our NO chart (e.g. 1749, 2965) needs an agreement with Regnskap Norge | Before the first NO customer | D-90 (spreading Q3) |

## Before the first production customer (hosted)
| # | What | When | Details |
|---|---|---|---|
| G1 | Choose the **penetration-test vendor** (ERP-Q2) | Test runs 4 weeks before the first production customer, on the hosted stage | go-live ERP-Q2 |
| G2 | Decide the **agreement expiry grace period** (P-20) | Before the first paying customer | go-live P-20 |
| G3 | Turn on **GitHub branch protection or CI** at go-live (today Actions are off in dev, your rule) | Before the first production customer | `docs/operations/verify.md` threat model |
| G4 | App Store / Google Play accounts and readiness (P-18), Apple Developer account and Firebase project for push (ADR-025 Q3) | Before the first phone release / push | go-live P-18 |

## Done
| Date | What |
|---|---|
| 2026-11-22 | R29b security decisions D-25 (four owner points): approved as recommended |
| 2026-11-21 | QA guide: "scroll, then open search" every round, and an iOS look before a layout lane merges (L31) |
| 2026-11-21 | QA guide: the five choices approved (desktop sizes, severity scale, Larger Text, DK/FI/IS by automated tests, test-steps location) |
| 2026-11-21 | FIX-APP-A merged (App `phase/4` `324d3039`) and its short-heights design paragraph approved |
| 2026-11-21 | All 21 Items/Inventory decisions; all 16 Accounts roadmap decisions; ADR-024/025 accepted with the ADR-025 additions; vendor picks D-121/D-123/D-125; MERGE verdicts for FIX-BE, HRP-SPECS, INV-SCOPE, VENDORS, the Accounts roadmap; payroll approval-limit holders; OK to delete the stale FIX-BE branch and to fast-forward the checkouts |


## Answered 2026-11-22
- N10: **refuse** duplicate receivables opening items (same customer + original number), as payables already does; changes OI C-20 (Jabran: "go with industry standards & recommendations"). Built in AC418-BE.
- N11: an import never creates a bank account; the App explains and offers only the picker (built in B2b, R26 G19).
- HR H0 OD-1: foundation tables only in H0; each lane creates its own tables with RLS from its first migration.
