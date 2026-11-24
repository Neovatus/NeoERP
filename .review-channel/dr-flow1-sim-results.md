# Simulator results: accounts/dimension-rules flow 1 (set-rules)

- Devices: iPad Pro 13-inch (M5) 5AB86CDD-21F1-45AB-A677-66079974BE1F; iPhone 18 Pro 45AD3FD4-4FF6-4EF3-A68B-F044AC85C269 (both iOS 27.2)
- Commits (from brief, not re-checked): BE accounts/dimension-rules bd1f0cc; App accounts/dimension-rules 07bd00a4 (debug)
- Time: 2026-11-24 23:53 to 2026-11-25 00:03 local
- Driver: AXe 2.1.1 (describe-ui, tap by label or by point, type, key, key-combo, swipe, screenshot)
- Signed in as Ola Nordmann (Owner, Kystgruppe Nordic) the whole run. The stack was not touched.
- Left behind: the new range rule **Cost centre · Required · 7000–7999** ("Cost centre on vehicle costs") is saved in Kystgruppe. The iPad is back on Kystgruppe. The iPhone language is back on "Device language".
- Shots: `.review-channel/dr-flow1-shots/`

| Step | Device | Result | What I saw | Shot |
|---|---|---|---|---|
| 1 Dimensions list | iPad | PASS | The "On accounts" column is there. Cost centres: "Required on 23 · optional on 65". Projects: "Required on 0 · optional on 88". Sales channel: "Required on 0 · optional on 1". Not-set-up rows show "—". The Account rules line reads "Rules decide … 1 range rule · 1 single-account rule" and has an "Open account rules" button. | ipad-02-dimensions.png |
| 2 Account rules | iPad | PASS | The range card reads "Cost centre · Required · from 6000–6999", with "24 accounts · set by Ola Nordmann, 24 Nov 2026 · Cost centre on every running cost" and Edit. Searching "67" in the matrix: 6705 Cost centre "Optional A", 6750 "Required R", 6700/6720/6790 "Required R". The Branch column reads "Required (2 or more branches)" and is not a button (read-only), with the note "Branch · Follows the number of branches". Legend: A / R / no mark. | ipad-05-matrix67.png |
| 3 Add range 7000–7999 | iPad | PASS | Dialog: Dimension Cost centre, Rule Required/Optional/Not used, From 7000 (hint "7000 Drivstoff"), To 7999 (hint "No account 7999. The range still counts it."). What follows: "Applies to 24 accounts." and "Posted lines never change." The save button stays disabled until the reason has 6 or more characters. | ipad-07-range-filled.png |
| 4 Reason + save | iPad | PASS | The dialog closed. A second card shows "Cost centre · Required · from 7000–7999 / 24 accounts · set by Ola Nordmann, 24 Nov 2026 · Cost centre on vehicle costs". A toast reads "Rules saved. They apply to lines saved from now on. Recorded: "Cost centre on vehicle costs"". Matrix 7000/7020/7040: "Cost centre: Required, From the range rule 7000–7999". | ipad-10-saved.png, ipad-11-matrix70.png |
| 6 Overlap 6500–7500 | iPad | PASS | Before saving, What follows reads "Applies to 26 accounts. 1 of them has its own rule, which still wins: 6705 Regnskapshonorar." On save the dialog stays open with "This range overlaps the range rule 6000–6999 (Cost centre)." After Cancel there are still exactly 2 range cards. | ipad-13-overlap-refused.png |
| 8 Chart › 6705 | iPad | PASS (see F1) | The side sheet's "Dimensions on lines" reads "Branch · Optional / Required on lines when the company has 2 or more branches / Cost centre · Optional · Set on this account / Project · Optional", followed by an "Account rules" button. The button opens Account rules narrowed to 6705 ("Rules per account · 1", with a "6705" filter chip). | ipad-15-6705.png, ipad-16-rules-6705.png |
| 9 iPhone narrow, nb (+sv) | iPhone | PASS | Each account is one card with one line per dimension ("Cost centre · Required · from 6000–6999", "Cost centre · Optional · Set on this account"). In nb ("Kostnadssted · Valgfritt · Satt på denne kontoen", "Filial · Påkrevd (2 eller flere filialer)") no text is cut. In sv the cards are fine, but the range card title wraps inside the range (see F5). da was not checked. The language change took effect at once, without reopening the app. | iphone-06-cards.png, iphone-12-nb-cards.png, iphone-14-sv-cards.png, iphone-13-sv-rules.png |
| 10a Lahore (PK) | iPad | PASS | Ola is "Accounts Viewer" in Lahore. The Dimensions line reads "0 range rules · 0 single-account rules". Account rules shows "No range rules" plus an empty-state hint, and there is no Add range rule, no Edit and no row checkboxes. The full 220-row tree has 0 cells "From the range rule" or "Set on this account", so no Kyst rules leak. | ipad-19-lahore-rules.png, ipad-20-lahore-matrix.png |
| 10b Sialkot | iPad | BLOCKED-DATA | Ola's company list has Kystgruppe Nordic, Kyst Danmark, Kyst Suomi, Kyst Ísland and Lahore Textiles. There is no Sialkot. | ipad-17-switcher.png |

## Findings

- **F1 MEDIUM, Chart of accounts › 6705 side sheet.** The sheet says "Branch · Optional", with the grey sub-line "Required on lines when the company has 2 or more branches". Kystgruppe has 2 or more branches, and the matrix for the same account says "Branch: Required (2 or more branches)". The sheet should state the effective rule (Required), as the matrix does. Steps: Accounts › Chart of accounts › search 6705 › open row. Shot ipad-15-6705.png.
- **F2 LOW, 6705 side sheet.** The "Used for" row has an empty value. The "Account rules" button has no visible border and sits indented from the text above it. "Close" sits alone in its own bordered card. Shot ipad-15-6705.png.
- **F3 LOW, Account rules (iPhone mainly).** There are about 60 group-filter chips (one per 2-digit group) above the list. On the iPhone the first account card sits at about y 2700 pt, roughly 3 screens of chips. On the iPad the chips take about 500 pt. A collapsed group picker would help. Shots iphone-04-rules.png, ipad-05-matrix67.png.
- **F4 LOW, Account rules matrix on iPad 13".** The last column (Sales channel) is cut at the right edge ("Sa…"), and you have to scroll the table sideways. Shot ipad-05-matrix67.png.
- **F5 LOW, sv iPhone range card.** "Kostnadsställe · Obligatoriskt · från 6000–" breaks the line inside the range, with "6999" on the next line. The range should not break. Shot iphone-13-sv-rules.png.
- **F6 LOW, Account rules range cards (iPad).** The padding is uneven: the first card has a large empty band under its text, and the second card has extra space above it. Shot ipad-10-saved.png.
- **F7 LOW, nb wording.** "1 aktive · 0 inaktive" should be "1 aktiv". Also "Approval limits" is untranslated in the nb and sv menus (outside this flow). Seen on the nb Dimensjoner page and menu.
- **F8 LOW, Settings › Language.** The help text says "A change applies when you open the app again", but the change applied at once.

## Questions

- **Q1.** After adding 7000–7999 ("Applies to 24 accounts."), the Cost centres line went from "Required on 23 · optional on 65" to "Required on 44 · optional on 44". That is +21 required, not +24, and the total stayed 88. Are 3 of the 24 accounts in 7000–7999 non-posting or header accounts that the preview counts but the column does not? If so, should "Applies to N accounts" count only posting accounts?
- **Q2.** The 6500–7500 overlap message names only 6000–6999, though the range also overlaps the new 7000–7999. Is naming only the first overlap by design?
- **Q3.** The range cards show "set by Ola Nordmann, 24 Nov 2026". The seeded 6000–6999 rule also shows today. Is that the seed date or the last change?

## Seen around the steps

- iPad: menu leaves (Overview, Invoices, Chart of accounts, Dimensions …) are 30 pt tall, under 44 pt. On the iPhone menu, leaves are 30–31 pt.
- iPad: some group chips on Account rules are 38 pt tall, under 44 pt.
- iPhone menu: with Accounts expanded, Profile and Settings slide under the pinned "Sign out" footer and cannot be tapped (Settings at y 787, behind Sign out at 755). You have to collapse Accounts first. Shot iphone-07-menu-expanded.png.
- The account number is set in a monospaced face in both the matrix and the side sheet ("6705"). This looks intended, but please confirm it matches the tokens.
- iPhone cards: the checkbox sits higher than the account title's baseline. Shot iphone-06-cards.png.
- Lahore as Accounts Viewer: read-only is done well. There are no checkboxes, no Edit and no Add.
- The success toast was gone (or not exposed) when I dumped the tree about 3 s later, so I could only read it from the screenshot.

## Accessibility notes (from the AXe tree)

- **Unlabelled controls:** the row checkboxes on the iPad matrix and iPhone cards are `AXButton` with an empty label. Only the header checkbox has a label ("Choose all shown accounts"). The group header rows (for example "67 Fremmed tjeneste", collapse) are empty-label buttons. The iPhone Dimensions cards for Company dimension 2–4 and their "Set up" buttons were empty-label `AXButton`s while off screen. Once scrolled into view they read correctly, so this may be an off-screen effect only. There is also an empty 48x2 button at the bottom of the iPad rules page.
- **Reason field** (Add range rule dialog): it is not in the tree at all while empty. Once it has text it is an `AXTextArea` with an empty label. The From and To fields are labelled ("From account, Up to 8 digits").
- **Rule segmented control** (Required / Optional / Not used): the buttons expose no selected state.
- **Dimensions list row buttons on the iPhone:** the label is cut off after "Values" ("Cost centres, Who pays for it…, Kept in, Accounts, Values"), so VoiceOver misses the value count and "On accounts". On the iPad the row label is complete.
- **Settings › Dark mode:** no switch element appears in the tree.

## AXe spike notes

- **Worked:** `describe-ui` gives a full tree with Compose semantics labels and frames, including the off-screen rows of long lists (the whole 220-row Lahore matrix). `tap --label` works for unique labels ("Open account rules", "Add range rule", "Cancel", "Norsk", "Lahore Textiles · All branches"). `tap -x -y` from frames works. `swipe` scrolls. `screenshot` works.
- **Label clashes:** `tap --label "Accounts"` failed on the dashboard because there were 2 matches and Compose exposes no AXUniqueId. I used coordinates. The same goes for repeated "Edit", "Open" and "Set up". A `testTag` mapped to an accessibility id would make these tappable by id.
- **Could not find:** the empty Reason text area, which has no element until it has text, so I tapped it by coordinates from the screenshot. The row checkboxes (no label) can only be reached by coordinates.
- **Typing:** `axe type` works in Compose fields (search, From/To, Reason). iOS autocorrect is applied, though: "Cost centre on vehicle costs" became "Cost **center** on vehicle costs". Workaround: type "Cost centre", press Left then Right (`axe key 80`, `axe key 79`) to drop the suggestion, then type the rest. Pasting through `simctl pbcopy` plus Cmd+V did not paste. Cmd+A followed by Backspace clears a field. Return (`key 40`) did not dismiss the keyboard. Tapping outside the field did.
- **Tip for later testers:** to stop autocorrect from changing test input, turn off Auto-Correction in each simulator's keyboard settings once.

Brief: unclear or missing — nothing blocking. Two notes: (1) Sialkot is not in Ola's company list, so 10b needs another user or a membership; (2) the brief did not say whether to leave the 7000–7999 rule in place or delete it after the run (I left it; there is no delete on the card, only Edit).

## Lead's checks on the stack (old Mac, 2026-11-25 ~01:40; BE 0cca7708)
- **Seed:** the full `seed-demo-accounts.sh` refuses on this local database ("Lahore must remain READY"; Lahore went live in earlier sessions), so only `seed_demo_dimension_rules` ran (library mode). Checked through the API: Kyst range cost centre REQUIRED 6000–6999; 6705 own OPTIONAL (source ACCOUNT); 6750 REQUIRED from the RANGE; Sialkot project REQUIRED 7000–7999.
- **Migrations on start:** accounts V80, iam V51 + V52 applied.
- **Backfill check (seeded data, read-only SQL):** 2384 accounts in 9 companies; PACK rules (not NOT_ALLOWED) equal `allowed_dimensions` for every account; 0 accounts with a non-empty column and no PACK rows; 0 differences.
- **`scripts/money-invariants.sh`:** OK (9 companies with books, 40 posted journals, 107 journal lines checked).
- **Simulator steps:** BLOCKED: no simulator control tool in this session (see above); waiting for Jabran's choice (reconnect the tool / install AXe / Jabran clicks through).
