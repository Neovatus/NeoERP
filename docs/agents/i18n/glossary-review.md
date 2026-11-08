# Glossary review (Opus, 2026-11-08)

Scope: `NeoERP-App/docs/i18n/glossary.csv` (476 rows before the review, 480 after)
and `style-guide.md` in the same folder. Every changed or disputed row now carries
its source in `source` (with `review` added) and its reasoning in `note`.

How the sources were checked: web searches against tax authorities, law texts,
standards and the help pages of Nordic accounting software. Some vendor help
pages could not be reached by search (Tripletex, Fortnox and e-conomic help
centres return little to a crawler). Where that happened, the decision rests on
the law or standard named below and on known product wording, and it says so.

## 1. Disputed terms: decisions

| Term | Chosen nb / sv / da | Alternatives considered | Source | Why |
|---|---|---|---|---|
| Journal / voucher | Bilag / Verifikation / Bilag | da Postering; sv Bilaga | [e-conomic regnskabsguide](https://www.e-conomic.dk/sites/default/files/e-conomic/DK/docs/e-conomic_regnskabsguide_0.pdf); [Fortnox: Verifikation](https://www.fortnox.se/fortnox-foretagsguide/ekonomisk-ordlista/verifikation); [Tripletex: bilag](https://hjelp.tripletex.no/hc/no/articles/15989034598289) | e-conomic's guide says one bilag gives several posteringer, so in da a *postering* is one line. **Manual journal da changed** from Manuel postering to Manuelt bilag. sv Bilaga is an attachment. |
| Posting (one line) | Postering / **Transaktion** / Postering | sv Kontering | SIE 4 `#TRANS`; Fortnox huvudbok | sv kontering is the act of choosing accounts, not the booked line. |
| Draft (da) | Kladde | Udkast | [Dinero: kopier en faktura](https://dinero.dk/support/hvordan-kopier-jeg-en-faktura.md) ("Kopien vil ligge som en kladde", "Gem kladde") | Confirmed. |
| Year end | Årsavslutning / Bokslut / Årsafslutning | sv Årsavslut | BFL-SE 6 kap.; e-conomic | Confirmed. **Close the year da changed** Luk året → Afslut året (matches Closed (year) Afsluttet). |
| Bill | Leverandørfaktura / Leverantörsfaktura / **Leverandørfaktura** | da Købsfaktura | [e-conomic: import/eksport](https://www.e-conomic.dk/support/artikler/importeksport) ("oprette dem som leverandørfakturaer"); [Bokio: leverantörsfaktura](https://www.bokio.se/hjalp/leverantorsfakturor/rakningar/hur-fungerar-leverantorsfakturor/) | **da changed.** e-conomic, the largest Danish system, says leverandørfaktura; Dinero says *køb / købsbilag*, not købsfaktura. Bills / New bill follow. Style guide §1 and §7 updated. |
| Credit note (sv) | Kreditfaktura | Kreditnota | [Bokio: kreditfaktura från leverantör](https://www.bokio.se/hjalp/leverantorsfakturor/rakningar/bokfor-kreditfaktura-fran-leverantor/); Fortnox | Confirmed. |
| Accounts (module) | Regnskap / Bokföring / Regnskab | sv Redovisning | Tripletex, Fiken; Fortnox, Visma; e-conomic | Confirmed. |
| Company | Selskap / Företag / Virksomhed | nb Firma, Virksomhet | Skatteverket, Skattestyrelsen; Tripletex | Confirmed. nb Firma is Fiken's small-firm word; NeoERP customers are mostly AS and groups (Konsernselskap). |
| Subledger | Reskontro / Reskontra / Underbog | da Sidebog, Hjælpebog | [Fortnox: reskontra](https://www.fortnox.se/fortnox-foretagsguide/ekonomisk-ordlista/reskontra) | nb, sv confirmed. da has no settled generic word: UI should use Debitorer / Kreditorer. On the L-7 list. |
| Control account | Samlekonto / Samlingskonto / Samlekonto | sv Kontrollkonto | [Bokio: 1510 / 2440](https://www.bokio.se/hjalp/komma-igang/importera-bokforing/importera-kund-och-leverantorsreskontra-med-ingaende-balanser/); Visma, e-conomic debitorgrupper | Confirmed. Kontrollkonto is the textbook word, not the software word. |
| Reverse / Reversed (sv) | Återför / Återförd | Vänd | BFNAR 2013:2 (rättelsepost); BAS (återföring) | Confirmed. Vänd is colloquial Fortnox UI. |
| Void | Annuller / Makulera / **Makuler** | da Annuller | Fortnox (makulera faktura); Danish *makulere* (cheques, documents) | **da changed**: Annuller is the Cancel button. nb keeps Annuller (nb Cancel is Avbryt). Voided da → Makuleret. |
| Allocate (match payments) | Utlign / Pricka av / Udlign | sv Koppla; Stäm av | [Bokio: automatisk avprickning](https://www.bokio.se/hjalp/bokio-foretagskonto/bokio-foretagskonto/automatisk-avprickning-av-fakturor/); Visma (utligning); Uniconta, e-conomic (udligning) | Confirmed. Stäm av is Reconcile. |
| Deduction of an advance | **Avregning** / Avräkning / Modregning | nb Fradrag | Business phrase *avregning av forskudd* | **nb changed**: Fradrag clashes with VAT *fradrag* (Fradragsberettiget). Deducted nb → Avregnet. |
| Audit trail | **Kontrollspor / Verifikationskedja / Transaktionsspor** | Revisjonsspor, Behandlingshistorik, Revisionsspor | NO: bokføringsloven §4 nr. 7 and [NBS 2 Kontrollsporet](https://www.regnskapsstiftelsen.no/wp-content/uploads/2025/05/NBS-2-Kontrollsporet-april-2025.pdf); SE: BFNAR 2013:2; DK: [bogføringsloven 2022 §8 Transaktionsspor](https://www.lovguiden.dk/loven/bogføringsloven/9) | **All three changed** to the words in the law. da *kontrolspor* is the documentation behind each entry (§3), not the trace. |
| Audit log | Revisjonslogg / **Granskningslogg / Revisionslog** | Ändringslogg, Ændringslog, Behandlingshistorik | Microsoft terminology (granskningslogg) | The log holds exports and approvals too, not only changes. sv Behandlingshistorik is the BFL documentation duty, not a screen name. |
| Zero-rated vs exempt (sv) | **Momsfri med avdragsrätt** vs Undantagen från moms | Momsfri (0 %) | ML (2023:200) 10 kap. 64 § and [Skatteverket: export](https://www.faronline.se/dokument/rattserien/ratt-moms/e/rm_export/) ("Undantagen från skatteplikt") | Swedish law calls both *undantag*; the real difference is the right to deduct, so the label says it. da also changed: zero-rated **Momsfri med fradragsret**, exempt **Momsfritaget** (was Nulmoms / Momsfritaget). Tax-code names still come from the pack. |
| Credit note on account | **Frittstående kreditnota / Fristående kreditfaktura / Selvstændig kreditnota** | … uten fakturakobling | — | Shorter; fits pills and buttons. |
| Debit note | Debetnota (all) | nb Tilleggsfaktura | — | Confirmed. Tilleggsfaktura is an extra invoice from the seller, not our claim on a supplier. |
| Branch | Filial (all) | Avdeling, Lokasjon, Underenhet | RULES.md §6–7 | Confirmed. Avdeling/Avdelning/Afdeling is Department. Registry words (underenhet, arbetsställe, produktionsenhet / P-nummer) only for a registration field. |
| Tag | Etikett / Etikett / Mærke | da Etiket, Tag | Microsoft Danish (Mærker) | Confirmed. In the app a tag is a dimension value on a line. |
| Entitlement | **Avtaleomfang / Avtalsomfattning / Aftaleomfang** | Tilgang / Behörighet / Adgang | RULES.md §3 | **Changed**: the old words were the same as Access (nb, da) and Permission (sv). New row **Entitled** = Inkludert i avtalen / Ingår i avtalet / Indgår i aftalen. |
| Inherit (override value) | **Som selskapet / Som företaget / Som virksomheden** | Arv / Ärv / Arv | RULES.md §3 | **Changed**: Arv is a noun and Ärv an order; the value means "same as the company". |
| Act as user | **Opptre som bruker / Agera som användare / Agér som bruger** | Logg inn som … | RULES.md §13 | **Changed**: impersonation is not a sign-in and clashed with Sign in. Banner: Du opptrer som %1$s / Du agerar som %1$s / Du agerer som %1$s. |
| VAT reversed / VAT given back | Mva tilbakeført / Moms återförd / Moms tilbageført | — | Bookkeeping verbs as in Reverse | Confirmed. One key for both English wordings. |
| Go live | **Oppstart / Driftstart / Opstart** | Ta i bruk / Driftsätt / Gå live | App strings use it as a noun ("at go-live", "before go-live") | **Changed**: nouns needed; Gå live is English slang. New row **Go-live date** = Oppstartsdato / Driftstartsdatum / Opstartsdato. |
| At a glance | **Kort oversikt / Snabböversikt / Hurtigt overblik** | Kort oppsummert / I korthet / Kort fortalt | — | **Changed**: a panel title, not a sentence adverb; differs from Overview. |
| Transfer employee | Overfør / **Omplacera / Forflyt** | Flytta / Overflyt | HR usage | **Changed**; row renamed Transfer (employee). New row **Bank transfer** = Bankoverføring / Banköverföring / Bankoverførsel (used in the refund screens). |
| Pay components | Lønnsarter / **Lönearter** / Lønarter | — | Tripletex (lønnsart), Fortnox (löneart), Dataløn (lønart) | Row was labelled "Earnings" and had the sv singular. **Renamed** to Pay components, sv plural fixed, singular row added. |
| Withholding tax | Forskuddstrekk / Skatteavdrag / A-skat (payroll); Kildeskatt / Källskatt / Kildeskat (on payments) | — | Skatteetaten, Skatteverket, Skattestyrelsen | Confirmed. |
| EU sales list | **EU-salgsliste** / Periodisk sammanställning / EU-salg uden moms | nb "—" | [Dinero: indberetning af EU-salgslister](https://dinero.dk/support/indberetning-af-eu-salgslister/) (TastSelv "EU-salg uden moms"); Skatteverket | Norway has no such report. **The app hides the report for NO companies.** nb still needs a word because a nb reader can open a SE or DK company, so EU-salgsliste (descriptive). |

### Danish imperative accent

Checked: Retskrivningsreglerne allow the accent in the imperative to make the
meaning clear (levér, notér, markér) ([rules copy](https://www.sundogbaelt.dk/media/3nclplg5/gaeldende-sprogregler-2016.docx));
the [Microsoft Danish style guide](https://learn.microsoft.com/en-us/archive/blogs/terminology/danish-and-ukrainian-style-guides-recently-updated)
uses it **only** where the imperative can be read as a noun (markér, aktivér),
"not … as a standard". Decision: **Annuller** (no accent; no noun reading) and
**Importér** (importer is also the plural of import). Applied in the CSV to
Importér, Eksportér, Kopiér, Arkivér, Registrér (also Registrér betaling /
indbetaling), Markér som gennemgået, Kassér, Agér. Style guide §2 rewritten.

## 2. Other corrections (spot check of about 60 rows)

| Row | Change | Reason |
|---|---|---|
| Exchange difference (da) | Valutakursdifference → Kursdifference | Shorter, same meaning |
| Financial statements (nb, da) | Regnskapsoppstillinger / Regnskabsopgørelser → Regnskapsrapporter / Regnskabsrapporter | Software word; *opgørelse* is one statement (Resultatopgørelse) |
| VAT number (da) | SE-nummer → Momsnummer | The DK VAT number is normally DK + CVR; SE-nummer only for separately registered units |
| Registered for VAT (nb) | Long register name → Mva-registrert | Length; long form only in legal text |
| Cancelled (nb) | Kansellert → Avbrutt | Matches the Cancel button Avbryt and sv Avbruten |
| Discard / Discard changes (sv) | Släng → Förkasta | Professional register |
| Reset (sv) | Återställ → Nollställ | Återställ is Restore |
| Reason (sv) | Anledning → Orsak | The form word (Ange orsak) |
| Change (da) | Rediger → Ændr | Was the same text as Edit |
| Staff (nb) | Ansatte → Personale | Was the same text as Employees |
| View, Dismiss, Retry | Note: merge with Show, Close, Try again | Same text in all three languages; the naming standard forbids repeats |
| Notes added (confirmed) | Credit note, Debit note, Company, Branch, Tag, Allocate, Reverse, Year end, Tax withheld, Accounts module | Source recorded |

Rows checked and left as they were (sample): chart and report terms (Kontoplan,
Saldobalanse/Saldobalans/Saldobalance, Resultatregnskap/Resultaträkning/
Resultatopgørelse, Balanse/Balansräkning/Balance, Kontantstrømoppstilling/
Kassaflödesanalys/Pengestrømsopgørelse, Primosaldo/Ultimosaldo), VAT terms
(Mva-melding, Momsdeklaration, Momsangivelse, Salgsmoms/Købsmoms, Omvendt
avgiftsplikt/Omvänd betalningsskyldighet/Omvendt betalingspligt, Redovisningsperiod),
documents (Kundfaktura, Salgsfaktura, Acontofaktura/Förskottsfaktura/Forskuddsfaktura,
Purring/Betalningspåminnelse/Rykker, Forsinkelsesrente/Dröjsmålsränta/Morarente),
statuses (Bokført/Bokförd/Bogført, Forfalt/Förfallen/Forfalden, Delvis betalt/
Delbetald/Delvist betalt), UI words (Lagre/Spara/Gem, Slett/Radera/Slet, Fjern/Ta
bort/Fjern, Avbryt/Avbryt/Annuller, Rediger/Redigera/Rediger), and HR/admin
(Rolle, Rettighet/Behörighet/Rettighed, Tilgang/Åtkomst/Adgang, Sperr/Spärra/Spær
vs Deaktiver/Inaktivera/Deaktiver). No Danish/Norwegian mix-ups were found; the
sv bilaga/bilag false friend is handled correctly.

Remaining same-text pairs are intentional (one meaning, singular = plural, or a
different meaning in a different place: sv Klar for Ready and Done; da Til/Fra for
To/From and On/Off). Builders should still give them separate keys only when the
meanings differ (naming standard rule 2).

## 3. Style guide changes

- §1: Bill example now Leverandørfaktura in da; new short source names (ML /
  Momsloven, NBS 2, BFNAR 2013:2, review).
- §2: Danish imperative rule rewritten (accent only on noun-like forms).
- §6: plural example key `accounts_journal_msg_journals_submitted` (named after
  the counted thing, naming standard rule 6) and `%1$d` for the count.
- §7: compound example da leverandørfaktura.
- §8: Void da Makuler, Financial statements nb/da, Deduction nb Avregning; new
  rows for Journal, Posting, Audit trail, Audit log, both Allocate meanings,
  Reconcile, Department vs Branch, Access/Permission vs Entitlement, Restore vs Reset.
- §10: Danish examples 16 (Void) and 17 (Importér).

## 4. For the native accountant (go-live gate L-7)

Short list. Everything else is decided above.

1. **da Subledger** (Underbog): no settled generic Danish word; confirm or give
   the word Danish accountants use. The UI mostly avoids it.
2. **sv / da zero-rated vs exempt labels** (Momsfri med avdragsrätt / Momsfri
   med fradragsret): legally right, but confirm that accountants accept them
   where a pack tax-code name is not shown.
3. **da Deduction of an advance** (Modregning / Modregnet): confirm against
   Danish invoice practice (fradrag for aconto is also seen).
4. **Payroll words** (da Fradrag for payroll deductions, Arbejdsgiverbidrag,
   Lønarter): review when Payroll is translated; da *fradrag* is also the tax
   allowance word.
