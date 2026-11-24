# Design-system plan (DS-1): independent verdict

Reviewer: Fable 5.2 (high)
Verdict: ACCEPT WITH CHANGES

Date: 2026-11-24. Read only. App code: `NeoERP-App` `phase/4` at 4e0ec8c7. I read the code and the standards first, then the two Codex reviews, the synthesis, the lead's draft and `docs/drafts/ds-1-brief.md`.

**Not checked:** no Gradle, no simulator, no emulator, no stack. Everything below is from reading code and docs. Device point sizes and Split View widths are Apple's published sizes from memory, not measured. Items marked "check on device" are things I could not prove by reading.

Paths are relative to `NeoERP-App/`. `…/app/` means `composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/`.

## Summary

The direction is right: keep our widths, add a height class, keep components measuring their own room, do contracts before layouts. The plan is safe to start after nine changes (list at the end). The three that matter most:

1. **Android loses typed work on every resize, fold, rotation and dark-mode switch.** The plan's "state is kept on resize" test runs on the JVM and cannot see it.
2. **The height class will flip to compact whenever the keyboard opens**, unless the brief says which rectangle is measured.
3. **Two facts in the synthesis are not true in the code:** there is no 1200 content cap, and `neoPagePadding` cannot read the class.

Android has never been in QA (the QA guide does not mention it once), so every "all platforms" statement in the plan is proven for iOS and desktop only.

---

## 1. Window classes

**Judgement: agree with the widths and with the height numbers. Change how they are measured and what they are allowed to decide.**

### Widths: keep ours

Our 1024 and 1280 fit real devices better than M3's 840 and 1200.

| Device | Width | Our class | Shell | Note |
|---|---|---|---|---|
| iPhone portrait, Android phone | 360–440 | compact | drawer | |
| iPhone landscape | 667–956 | medium | drawer | compact height |
| Foldable inner screen | about 690–841 | medium | drawer | M3 would split these at 840 |
| iPad mini portrait | 744 | medium | drawer | |
| iPad 11" portrait | 820 / 834 | medium | drawer | tables keep the full width |
| iPad 11" Split View half, landscape | about 585–600 | **on the 600 edge** | | check on device |
| Desktop half screen on 1920 | 960 | medium | drawer, with a mouse | see question below |
| iPad Air 13 and Pro 12.9 portrait, iPad mini 5 landscape | **exactly 1024** | expanded | rail | a device on sale today, not only an old one |
| iPad Pro 13 portrait | 1032 | expanded | rail | |
| iPad 11" landscape | 1180 / 1194 / 1210 | expanded | rail | M3's 1200 would split one model family |
| Android tablet landscape, 1080p laptop at 150 % | **exactly 1280** | large | full sidebar | most common Android tablet width |
| iPad 13" landscape | 1366 / 1376 | large | full sidebar | |
| Desktop | 1440–2560 | large | full sidebar | content is not capped, see 1.4 |

So both edges (1024, 1280) and one more (720, half of a 1440 Mac screen) are hit exactly by real hardware. Half-open ranges with tests are needed, as the synthesis says.

**Names.** M3-style names with our numbers are acceptable, but they will mislead: a builder (person or model) "knows" expanded starts at 840 and large at 1200. Guards:
- our own type (`NeoWindowWidthClass`, `NeoWindowHeightClass`) with the lower bound written on each entry;
- no import of the library's `WindowSizeClass` anywhere in the app (one architecture check);
- the numbers in the "Deviations from M3" table.

### 1.1 Say which rectangle is measured (blocker)

- `NeoViewportProvider` measures inside `NeoSafeArea` (`…/app/App.kt:47–50`), and `NeoSafeArea` pads by `safeDrawing`, **keyboard included** (`…/app/designsystem/NeoSafeArea.kt:40`; confirmed by the comment at `…/designsystem/components/NeoShortHeight.kt:137–138`).
- If step b adds `maxHeight` there, an iPhone in portrait (667–932 tall) becomes compact height each time the keyboard opens, and goes back when it closes. Any layout hung on the class would then rebuild while the person types.
- The brief says "keep the keyboard separate from the window size" (`docs/drafts/ds-1-brief.md:117–118`) but not how.

**Change:** write into the brief:
- width = the app's room inside system bars and cutouts (what the shell measures today, `…/app/ui/shell/NeoEnterpriseShell.kt:115,129`);
- height = the same room **without the keyboard** (window container size minus system bars and cutout, never `maxHeight` under `NeoSafeArea`);
- a test: 390×844 with a 336 keyboard stays medium height.

### 1.2 Give the height class one job

- Agree with Codex and the synthesis: compact height adds to UX §25, it does not replace it. The measured one-third rule stays the trigger (`NeoShortHeight.kt:105–109`).
- **Change:** the only consumer in DS-1b is "compact height switches the §25 rules on for a page frame". It must never change the menu mode or the pane count. `expanded` height (≥ 900) gets no behaviour yet.
- Correction to the synthesis (`synthesis.md:62`, "no iPad is under 480 tall"): true full screen only. A Stage Manager window, or a window on iPadOS 26, can be short. This is one more reason to measure the window, not the device.

### 1.3 "Shell and page layout only" is too wide

The class can decide the menu mode. It cannot decide page layout alone, for two reasons.

**(a) The page's width depends on the menu, not only on the window.**
- Full sidebar 260, rail 64 (`…/designsystem/tokens/NeoDimensionTokens.kt:65,72`).
- At 1280 wide the page has 1019. At 1279 the menu becomes the rail and the page has **1214**.
- screen-standard §2 promises layouts change one way only as the window shrinks. That promise holds only for thresholds up to 900 (`shellMinContent`, `NeoDimensionTokens.kt:158`).
- A two-pane threshold will be above 900. Measured on the page width, a window shrinking from 1300 to 1150 would go one pane → two panes → one pane.

**Change:** DS-1c decides pane count on the **window width, assuming the full sidebar**, through one shared function, and proves it with the 320–1440 sweep. The brief's draft answer "side by side from 1280" (`ds-1-brief.md:155–156`) is too early: at 1280 the page has about 980 after padding, and the journal detail goes to its phone layout at 720 or less (`…/features/accounts/presentation/journals/detail/JournalDetailScreen.kt:163`).

**(b) Accounts screens read the window width, not their own.**
- `JournalsListTable.kt:169–172,187` ("the window's width when the host says it, else the card's"), `ReportTable.kt:119`, `ReportParts.kt:131`, `ReportRangeFilter.kt:166`, `GeneralLedgerScreen.kt:222`, `BalanceSheetScreen.kt:200`, `AccountsTabParts.kt:230`, `RefundDetailScreen.kt:158`, `PaymentDetailScreen.kt:226`, and `viewportIsBelow` in `home/AccountsUi.kt:208`.
- This is against screen-standard §2 and against point 3 of the synthesis. Inside a pane these screens will pick the desktop layout in a 500-wide space.
- Journals, the DS-1c pilot, is one of them.

**Change:** see point 2 (freeze rule now, pane width before the pilot).

### 1.4 Wide windows: the 1200 cap does not exist

- `synthesis.md:69` says "Page content stops at `maxContentWidth` 1200". The token is defined (`NeoDimensionTokens.kt:137`) and **used nowhere**. The page column fills the width (`…/app/ui/shell/routing/NeoSmartContentArea.kt:182–189`).
- At 1920 the page is about 1619 wide, at 2560 about 2259.
- The brief's "Done when: 1920 shows the 1200 content cap working" (`ds-1-brief.md:140`) has nothing to show.

**Change:** make it a question for Jabran at the step b stop: which page types cap (forms, detail, settings) and which fill (tables, reports). Test 1920 and 2560. No new "extra-large" class until a behaviour needs one.

### 1.5 Desktop opens in the medium class

- The main window is created with no size (`composeApp/src/jvmMain/kotlin/com/neovatus/neoerp/app/app/NeoDesktopHost.kt:55`). Compose Desktop's default is 800×600 (from the library default, not run here). Size and position are not remembered.
- So every desktop start shows the drawer layout with a hamburger.

**Change:** open at a sensible size (maximised, or at least 1280×800 clamped to the screen) and remember size and position per device. Small, and it belongs with step b because it decides which class desktop users see first.

### Question for Jabran (not a blocker)

A half-screen desktop window on a 1920 monitor is 960 wide. An accountant with the ERP beside a spreadsheet gets the drawer, not the rail. Keep 1024 for now (the rail at 960 would push some tables to the tight grid), and look again after the pilot.

---

## 2. The plan

**Judgement: scope and order are right in outline. Step b is smaller than planned, step a is slightly bigger, and four platform items are missing.**

### DS-1a (contracts)

Agree with deleting `statColumns`, sentence case, the deviations section. Changes:

- **Helpers.** `isTabletOrBelow` and `isPhone` have **no callers** (only `statColumns` used the first). Delete them with `statColumns` instead of "rename or document" (`ds-1-brief.md:71`). Only `isMobileOrBelow` is used (13 places).
- **Boundary tests cover 720, 600 and 480 too, not only 1024 and 1280.** The operators disagree today:
  - `isMobileOrBelow` is `<=` 720 (`…/designsystem/tokens/NeoBreakpointTokens.kt:45`);
  - toasts use `<` 720 (`…/designsystem/components/NeoToastHost.kt:97`);
  - login uses `>=` 720 (`…/app/ui/auth/NeoLoginScreen.kt:368`);
  - `NeoSpotState.kt:106` uses `<` 480, `ReviewAndGoLiveScreen.kt:774–775` uses `<=`.
  - At exactly 720 (half of a 1440 screen) tables are cards while toasts and login are in their desktop form.
  - Making 720 half-open changes behaviour at that one width; the brief should allow it and expect the 720 sweep frame to change.
- **Cancel left in `NeoStickyFooter`.** This is in the request to me but in neither the synthesis nor the brief. The code puts every action at the end (`…/designsystem/components/NeoFooterActions.kt:138`; `NeoStickyFooter.kt:128,135,148`), and the left side holds totals (`NeoFooterLayout.kt:151–152`). The wizard footer already has Cancel at the start (`NeoForm.kt:707–709`).
  - It needs a rule first: where Cancel goes when totals are on the left, and whether the one-row and keyboard-up rows follow.
  - It touches every money editor's footer and its screenshots. Do it as its own commit, or leave it out of DS-1a.
- **Reduced motion is documented but never switched on.** `reduceMotion` defaults to false (`…/designsystem/NeoTheme.kt:37,134`) and `App.kt:40–43` never sets it. No platform reads the system setting. screen-standard §8 and UX §24 both promise it, and both reviews say "keep reduced-motion support". Same kind of gap as C5. Add it here or to DS-2.

### DS-1b (window class)

- **Drop the library from this step.** The brief wants it "only for the measurement" with our names and numbers (`ds-1-brief.md:107–112`). The measurement is one read of the window size; the class is about twenty lines. A library used only for that adds a second `Expanded` with different numbers and ties us to one more version next to an alpha material3 (`gradle/libs.versions.toml:21`). Write `NeoWindowClass` ourselves. Then this is a small build, not an Opus spike.
- **`neoPagePadding` cannot read the class** (`ds-1-brief.md:115`). It is fluid and switches at 720 and 1440 (`…/designsystem/NeoViewport.kt:116–131`), which are not class edges. Scope the class to `menuMode` only.
- **Add one table of every window-level threshold and its owner:** 480 (padding), 600 (sheets, full-screen panels), 720 (top bar, toasts), 1024 and 1280 (menu), 1440 (fluid end). After step b there are still three vocabularies; the table stops a fourth.
- **Provide the class as its own local.** `LocalNeoViewportWidth` is a static local (`NeoViewport.kt:28`): every resize frame recomposes everything below it. The class should change only when an edge is crossed.
- **Android state loss (blocker for the acceptance as written).**
  - The manifest has no `android:configChanges` (`composeApp/src/androidMain/AndroidManifest.xml:14–17`), so Android destroys and rebuilds the Activity on rotation, fold and unfold, split-screen resize, keyboard attach and dark mode.
  - View models are made with `remember` in composition (for example `…/features/accounts/presentation/receivables/ReceiptsHost.kt:101`, `RefundEditorScreen.kt:44`), so they die with it. A half-typed invoice is gone.
  - This breaks screen-standard §2 and UX §8 on exactly the devices window classes are for. The step b test "resizing keeps typed text" runs on the JVM, where nothing is rebuilt, so it will pass.
  - **Change:** declare the size, keyboard, UI-mode, density and font-scale changes as handled by the app, and check once on an emulator (rotate, fold, split, dark mode) that an open editor keeps its text. Inferred from the manifest and standard Android behaviour; not run.

### DS-1c (layouts and focus)

Agree with contracts first, one pilot, and the stop for Jabran's answers. Add:

- **Pane width before the pilot.** Give panes their own width to read, separate from the window width used for fluid padding and type, and move the Journals reads listed in 1.3(b) to it.
- **"Back" is three different things.** Only Android has a system Back (`NeoBackHandler.android.kt`); iOS and desktop do nothing (`NeoBackHandler.ios.kt`, `NeoBackHandler.jvm.kt`, "No system Back here"). The contract must say, per platform: Android system and predictive Back; iPhone edge swipe yes or no; desktop Escape or a shortcut.
- **Focus return must be tested per platform.** Dialogs and side panels are separate windows (`…/designsystem/components/NeoSidePanel.kt:102–104`). Focus trap comes from the platform; return to the trigger does not. The brief's focus test runs on the JVM only.
- **Library question lives here, if anywhere.** Its pane scaffolds decide on the window width with M3's 840 and know nothing of our sidebar or Decompose. I would build ours; if the lead wants to try the library, time-box it here.

### Missing platform items

| Item | Evidence | Where |
|---|---|---|
| Android is not in QA at all | `docs/qa/qa-guide.md` has no "Android"; `NeoDrawerDialogProperties.android.kt:5` says insets are "checked in the Android QA round (no emulator here)" | one Android smoke round (phone, foldable, tablet, freeform) before DS-1c spreads to other screens |
| Touch is fixed per platform | `Platform.android.kt:7` true, `Platform.kt:10` false on desktop | deviations table: Chromebook with a mouse gets 44 targets (fine); a Windows touch screen gets 30 (accept, written down) |
| iPadOS 26 windowed mode | window controls sit at the top-left, where the hamburger is; not mentioned in `apple-platform-look.md` | check on device with P-18 |
| Toast announcements | UX §24 "announced politely" | check VoiceOver, TalkBack and desktop once; cannot be read from code |

Already in good shape, no change needed: safe areas (`NeoSafeArea.kt`), keyboard and focused field (`NeoKeyboardInView.kt`, UX §25), Larger Text to 2× (`NeoPlatformFontScale.kt`, read live on iOS), iPad multitasking allowed (all four orientations, `iosApp/iosApp.xcodeproj/project.pbxproj:309`), keyboard focus ring (`NeoAccessibility.kt:22–23`). RTL is not needed now.

### DS-2

Agree with the list. Add reduced motion if it is not taken in DS-1a.

---

## 3. Accepted Codex corrections

| Correction | Verdict | Note |
|---|---|---|
| Density compact by default, 44 touch floor, written as a deviation | **Agree** | Code follows it (`NeoViewport.kt:39,102–103`). WCAG 2.2 AA asks 24. Android's accessibility scanner will warn below 48: expected, write it down. Fix the stale comment "44 touch floor below 720" (`App.kt:48`). |
| Keep our toasts | **Agree** | Errors stay until closed and Undo has a second home, which covers the M3 concern. Placement uses `<` 720: include it in the half-open pass. |
| Durations stay, no springs | **Agree** | Add: reduced motion is not wired (point 2). |
| Segmented stays 2–4 | **Agree** | Add one rule: what it becomes when four do not fit one row at 2× text on a 320 phone (building-blocks.md:333 says "one row on a phone"). |
| 360 / 412 / 400 pane widths are candidates | **Agree** | The side panel is 560 for two 240 columns (`…/designsystem/tokens/NeoPatternTokens.kt:650`); a 400 cap would break the form grid. |
| Compact height adds to §25 | **Agree** | With 1.1 and 1.2. |
| Local `maxWidth` checks stay | **Agree, with one correction** | True for checks on a component's own width. The Accounts checks in 1.3(b) read the window and are the exception to fix. |

Codex's own width proposal (M3's 840 / 1200 / 1600) I reject, as the synthesis does.

---

## 4. Timing against the feature work

**If DS-1b and DS-1c come later:**
- New Accounts screens (dimension rules) will copy the Accounts habit of reading the window width (1.3(b)). Each new one is rework before panes.
- HR v2 is the largest batch of new list-and-detail screens. Built before the list-detail contract, they are built as page swaps and redone.
- Android state loss stays unknown until someone tests on Android.

**If they come sooner:**
- DS-1a changes shared pieces (`NeoText`, the footer). Open feature lanes get merge conflicts and re-recorded screenshots, twice if sentence case and Cancel-left land apart.
- One Gradle job per repo: the DS lane takes the App builder slot.
- The Journals pilot may touch files the dimension-rules lane is editing; check the claims file first.

**Recommended order:**
1. **Now, between feature slices:** DS-1a as one short batch, plus one check that stops new feature code reading `LocalNeoViewportWidth` or the breakpoints for layout (allow-list today's sites). This stops the debt growing at almost no cost.
2. **Soon:** DS-1b. It is small and additive once the library is dropped. Include the Android manifest change and the emulator check.
3. **Before HR list and detail screens start:** the DS-1c contracts and Jabran's answers (docs only).
4. **Later, when Journals is quiet:** the DS-1c pilot build.

---

## Change before building (ranked)

1. **Android:** handle configuration changes in the app and prove on an emulator that an open editor survives rotate, fold, split and dark mode. Until then, do not claim "state is kept on resize" for Android.
2. **Height class:** define the measured rectangle (no keyboard), one consumer only, and the keyboard-up test.
3. **Drop the adaptive library from DS-1b;** write `NeoWindowClass` ourselves. Any library trial moves to DS-1c.
4. **Remove the 1200-cap claim** from the synthesis and the brief; ask Jabran how wide pages behave; test 1920 and 2560.
5. **Brief step b2:** the class drives `menuMode` only, not `neoPagePadding`; add the table of all window-level thresholds.
6. **Half-open everywhere:** tests at 480, 600 and 720 as well; delete `isTabletOrBelow` and `isPhone`.
7. **Panes:** freeze new window-width reads in features now; before the pilot, give panes their own width and decide pane count on window width with the full sidebar.
8. **Cancel left:** write the rule (totals, one-row, keyboard-up) into the brief as its own commit, or take it out of DS-1a.
9. **Smaller:** desktop start size and remembered window; reduced motion; Android row in the QA guide; "Back" per platform in the DS-1c contract.

Brief: unclear or missing — (1) Cancel-left is in the request but not in the synthesis or the brief. (2) The synthesis gives DS-1a to Sonnet; the brief gives the whole lane to one Opus builder. (3) Neither says which rectangle the class measures. (4) The brief's "1200 content cap" and "`neoPagePadding` reads the class" do not match the code. (5) No Android acceptance anywhere.
