# 00 — Design System

Every design value in NeoERP, and the components built from them.

## The chain of truth

```
neoerp-tokens.json  →  styles.css custom properties  →  components
     authoritative          mechanical mapping           consumers
```

**One direction only.** A value that exists in the CSS but not the JSON is a
defect: promote it to a token or delete it. This is not pedantry — three sources
of truth (JSON, spec page, CSS) drifted apart once already on this project,
before anyone had built on it, and cost real rework. The reconciliation is in
`NeoERP Token Audit - Response.html`.

## Files

| File | What it is |
|---|---|
| `neoerp-tokens.json` | **Authoritative.** Tokens Studio format, v1.1.0 |
| `styles.css` | Tokens as CSS custom properties + all shared component CSS |
| `feedback.css` | Skeletons, empty states, offline, permission denied, partial failure |
| `icons.jsx` | 43-glyph icon set |
| `NeoERP Design System.html` | The spec page — foundations, generated from the tokens |
| `NeoERP Component Library.html` | Every component in every state. The reference to build against |
| `NeoERP Responsive Showcase.html` | Breakpoint behaviour side by side |
| `NeoERP Token Audit - Response.html` | The WCAG AA reconciliation and its five colour corrections |

---

## Colour — light

| Token | CSS var | Value |
|---|---|---|
| bg/canvas | `--bg` | `#FFFFFF` |
| bg/elevated | `--bg-elev` | `#FFFFFF` |
| bg/soft | `--bg-soft` | `#F5F5F4` |
| bg/sunken | `--bg-sunken` | `#FAFAF9` |
| bg/hover | `--surface-hover` | `#F5F5F4` |
| border/default | `--border` | `#ECECEC` |
| border/strong | `--border-strong` | `#D4D4D4` |
| text/primary | `--fg` | `#0A0A0A` |
| text/secondary | `--fg-2` | `#404040` |
| text/tertiary | `--fg-3` | `#5F5F5F` |
| text/quaternary | `--fg-4` | `#707070` |
| text/disabled | `--fg-5` | `#D4D4D4` |
| accent/base | `--accent` | `#0A0A0A` |
| accent/on | `--accent-fg` | `#FFFFFF` |
| success text · bg · dot | `--success-*` | `#0E783C` · `#D6F0E0` · `#16A34A` |
| warning text · bg · dot | `--warn-*` | `#92400E` · `#FEF3C7` · `#F59E0B` |
| danger text · bg · dot | `--danger-*` | `#CA2222` · `#FEE2E2` · `#EF4444` |
| info text · bg | `--info-*` | `#1D4ED8` · `#DBEAFE` |

## Colour — dark (`[data-theme="dark"]`)

| Group | Values |
|---|---|
| canvas · elevated · soft · sunken · hover | `#0A0A0A` · `#141414` · `#1A1A1A` · `#0F0F0F` · `#1F1F1F` |
| border default · strong | `#262626` · `#404040` |
| text primary → disabled | `#FAFAFA` · `#D4D4D4` · `#A3A3A3` · `#8A8A8A` · `#404040` |
| accent base · on | `#FAFAFA` · `#0A0A0A` |
| success | `#4ADE80` · `#052E16` · `#22C55E` |
| warning | `#FBBF24` · `#2C1D04` · `#F59E0B` |
| danger | `#F87171` · `#2C0A0A` · `#EF4444` |
| info | `#93C5FD` · `#0F1E3D` |

> **Five values are WCAG AA corrections. Do not revert them.**
> light `text/tertiary` `#737373 → #5F5F5F` (5.85:1 on bg/soft) ·
> light `text/quaternary` `#A3A3A3 → #707070` (4.54:1) ·
> dark `text/quaternary` `#737373 → #8A8A8A` (5.04:1) ·
> `success-text` `#0F7A3D → #0E783C` (4.61:1) ·
> `danger-text` `#DC2626 → #CA2222` (4.57:1).
>
> A four-level grey ramp cannot be AA-compliant on `bg/soft` **and** keep four
> widely-spaced steps. Tertiary moved along with quaternary to preserve a visible
> step between them. `text/quaternary` carries table column headers — the
> most-read label in a product built for scanning thousands of rows — and was the
> worst failure in the system at 2.31:1.

## Focus, elevation, layers

- `focus/ring` — `#0A0A0A` light, `#FAFAFA` dark · width 2 · offset 2
- `focus/ringSoft` — `rgba(10,10,10,.14)` light, `rgba(250,250,250,.18)` dark
- **Elevation, portable** (y / blur / opacity — ports to Compose and SwiftUI,
  which take a single elevation value): `1` = 1/3/0.06 · `2` = 4/16/0.10 ·
  `3` = 16/40/0.20
- CSS equivalents: `--shadow-1` `0 1px 2px rgba(0,0,0,.04), 0 1px 1px rgba(0,0,0,.02)`
  · `--shadow-2` `0 4px 16px -4px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04)`
  · `--shadow-3` `0 16px 40px -8px rgba(0,0,0,.18), 0 4px 12px rgba(0,0,0,.06)`
- `zIndex` — scrim 80 · drawer 90 · modal 900 · toast 1000

## Typography

**Inter Tight** for UI, **JetBrains Mono** for identifiers, codes, OTP and
tabular figures. Both SIL OFL 1.1, **not bundled** — fetch WOFF2 from Google
Fonts or upstream. Subset: Inter Tight 400/500/600/700, JetBrains Mono 400/500.

Body sets `font-feature-settings: "ss01","cv11"` and `letter-spacing: -0.005em`.
**Carry both.** Without them, digits and lowercase `a` differ visibly from every
screenshot, which reads as a bug in review.

| Style | Size / weight / tracking / line-height | Use |
|---|---|---|
| display | 28 / 700 / −0.025em / 32 | Page title, auth H1 |
| metric | 26 / 700 / −0.025em / 29 | KPI value |
| heading-lg | 22 / 700 / −0.02em / 26 | Entity name |
| heading-md | 18 / 700 / −0.02em / 24 | Section heading |
| heading-sm | 17 / 600 / −0.015em / 22 | Modal title |
| title | 16 / 600 / −0.015em / 22 | Card title |
| body | 13.5 / 400 / −0.005em / 20 | Default, table cells, inputs |
| body-medium | 13.5 / 500 / −0.005em / 20 | Buttons, nav, emphasis |
| label | 13 / 500 / 18 | Field label |
| caption | 12.5 / 400 / 17 | Subtitle, helper, timestamps |
| caption-sm | 12 / 400 / 16 | Pills, chips, meta |
| overline | 11 / 600 / +0.06em / 14 / UPPER | Table column header |
| overline-xs | 10.5 / 600 / +0.08em / 14 / UPPER | Sidebar section label |
| mono | 12.5 / 400 / 18 | UUIDs, references, codes |

## Spacing, density, radius, sizing

Base scale `8 · 12 · 16 · 20 · 24`. Three density sets on `[data-density]`:

| | 1 | 2 | 3 | 4 | 5 | tableRow | field | btn md | sidebar |
|---|---|---|---|---|---|---|---|---|---|
| compact | 6 | 8 | 12 | 16 | 20 | 44 | 36 | 32 | 232 |
| regular | 8 | 12 | 16 | 20 | 24 | 56 | 44 | 40 | 260 |
| cozy | 10 | 14 | 18 | 22 | 28 | 64 | 48 | 44 | 260 |

`$touchFloor: 44` — below 720px every density clamps field, button and icon
button to 44px. Not negotiable; compact density on a phone otherwise produces
32px targets.

Radius: `sm` 6 · `md` 10 · `lg` 14 · `xl` 18 · `pill` 999.
Sizing: button sm/md/lg 30/40/48 · topbar 64 · sidebarDrawer 280 ·
icon sm/md/lg 14/16/20 · avatar sm/md/lg 32/36/56.

## Breakpoints

`phone` 480 · `mobile` 720 (tables → cards, single column) ·
`tablet` 1024 (sidebar → drawer, auth art hidden) ·
`desktop` 1280 · `wide` 1440.

## Motion

| What | Duration | Easing |
|---|---|---|
| Hover background, border, button fill | 80ms | ease |
| Switch, checkbox, tab, role card | 120ms | ease |
| Scrim fade, chevron rotation | 150ms | ease |
| Modal rise (12px + 0.98→1), toast entry | 180ms | `cubic-bezier(.2,.8,.2,1)` |
| Drawer slide | 220ms | `cubic-bezier(.2,.8,.2,1)` |
| Bar growth, progress fill, reflow | 400ms | ease-out |

`prefers-reduced-motion: reduce` drops everything to 1ms and cancels the drawer
slide, modal rise and toast entry outright — the three with real travel.

## Focus treatment

`:focus-visible` → `outline: 2px solid focus/ring; outline-offset: 2px`, on
buttons, icon buttons, nav items, tabs, cards, chips, links, `[tabindex]` and
inputs. Inside `overflow: hidden` parents the offset inverts to `-2px` so the
ring is not clipped. Checkbox and switch hide their real `<input>`, so the ring
draws on the visual proxy. Inputs additionally keep a 3px `focus/ringSoft` inner
halo on plain `:focus`.

An earlier revision had **no focus treatment at all**, and the one style that
existed rendered a 1.04:1 ring — a `bg/soft` halo on a white page. It looked
like a focus style in code review and was invisible on screen.

## Shared component classes

Defined in `styles.css`. **Do not redefine locally.** A shared class declared
inside a component's own `<style>` block only exists while that component is
mounted — which produced real unstyled-heading bugs in this build.

| Class | Use |
|---|---|
| `.mgrid` / `.mcard` | Module selection cards — icon block that fills when on, name, description, feature count, switch |
| `.lrow` | Limit row — label, description, number input, explicit Unlimited checkbox |
| `.tri` / `.tri-opt` | Three-way inherit / on / off segmented control |
| `.ent-eff` | Resolved effect — check + "Active" or x + "Off" |
| `.ent-own` / `.ent-bill` | Ownership and billing badges |
| `.ent-sub-hd` / `.ent-sub-note` | Section heading with inline explanatory note |
| `.type-card` | Consequential choice card listing what it commits to |
| `.agr-chip` | Agreement status chip |
| `.req-reason` | Quoted request reason block |
| `.wdw` | "What this means" explainer rows |
| `.crumb-btn` | Clickable breadcrumb segment |
| `.wiz-foot` | Wizard footer action bar |

## Icons

43 hand-authored Lucide-style outline glyphs. 24×24 grid, **1.75 stroke**, round
caps and joins, `fill: none`, `stroke: currentColor`. `icons.jsx` is a
name → JSX-paths map with an `<Icon name size />` wrapper.

Swapping for your own icon library is fine — **match the 1.75 stroke weight.** A
heavier stroke visibly changes the density of the entire design.

## Screenshots

`screenshots/01–06` — the spec page. `07–12` — the component library.
Navigation aids only; measure from the token file.
