> **Screens moved (2026-10-15):** the live screens are in `NeoERP-App/docs/design/screen-rig/` (frontend repo). The old copies were removed from here; git history keeps them. This README stays for its notes.

# 01 — Authentication (Keycloak-backed)

## Overview

The complete authentication surface for **NeoERP**, a multi-tenant ERP platform (Super Admin, HRMS, Payroll, Finance, Inventory, Sales). Thirteen screens covering workspace discovery, password sign-in, SSO, two-factor, password recovery, and the Keycloak *required actions* that fire whether or not you design for them (invite acceptance, forced password rotation, email verification, brute-force lockout, page expiry).

Authentication is provided by **Keycloak**. This is the single most important fact about this handoff: with Keycloak, most of these screens are **login-theme FreeMarker templates served by Keycloak**, not pages in your application. Each screen in the design names the `.ftl` template it becomes, in a badge at the bottom of its form. That badge is documentation for you — strip it before shipping.

The customer-facing storefront auth (self-signup, guest checkout) is explicitly **out of scope**. ERP staff accounts are invite-only; there is no self-registration anywhere in this design, and adding one would be a security regression.

## Screens & states

Screenshots were removed — see the root `README.md` for why. Use `../FLOWS.md`
for the flows and `../flows.json` for the same content machine-readable, and run
the prototype to see any screen in any state.

## About the Design Files

The files in this bundle are **design references created in HTML** — prototypes that show intended look and behaviour. They are **not production code to copy directly**.

The prototype is React 18 + Babel-in-the-browser with global-scope component files, which is a fast way to build a design artifact and a bad way to ship software. Your task is to **recreate these designs in the target environment**:

- **The Keycloak-served screens** (11 of the 13 — everything with an `.ftl` badge) must be rebuilt as a **Keycloak login theme**: FreeMarker templates plus a compiled stylesheet, packaged as a theme JAR or mounted directory. You cannot render these with React inside your app; Keycloak owns the URL, the form action, the CSRF token and the error state. Attempting to proxy them into your SPA is a well-known dead end.
- **The two application screens** (Workspace Entry, and the post-auth redirect target) belong in your app framework using its established patterns.
- If no environment exists yet, pick the framework that fits the rest of the product and implement there — but the Keycloak theme requirement is independent of that choice.

`styles.css` is written against CSS custom properties that map 1:1 to `neoerp-tokens.json`. That stylesheet is directly reusable inside a Keycloak theme, which is the main reason it exists in this form.

## Fidelity

**High-fidelity.** Final colours, typography, spacing, geometry, motion and interaction states. Every value below is exact and has been reconciled against a parallel Kotlin/Compose implementation of the same token file, including a WCAG AA contrast pass (tokens v1.1.0 — five colour values were corrected as a result; see *Design Tokens*).

Recreate pixel-perfectly, using the token values rather than eyeballing the screenshots.

---

## Architecture: which screen is whose

| Screen | Owner | Template / route |
|---|---|---|
| Workspace Entry | **Your app** | Custom route, e.g. `/workspace` |
| Sign In | Keycloak | `login.ftl` |
| SSO / Providers | Keycloak | `login.ftl` — `social.providers` block |
| 2FA Challenge | Keycloak | `login-otp.ftl` |
| Recovery Code | Keycloak | `login-recovery-authn-code-config.ftl` |
| Forgot Password | Keycloak | `login-reset-password.ftl` |
| Email Sent | Keycloak | `login-reset-password.ftl` success info page |
| Reset Password | Keycloak | `login-update-password.ftl` |
| Reset Success | Keycloak | `info.ftl` |
| Invite → Set Password | Keycloak | `login-update-password.ftl` (via Execute-Actions email) |
| Password Expired | Keycloak | `login-update-password.ftl` |
| Verify Email | Keycloak | `login-verify-email.ftl` |
| Account Locked | Keycloak | `login.ftl` — brute-force error state |
| Page Expired | Keycloak | `login-page-expired.ftl` |

Note that **Invite, Password Expired and Reset Password are all `login-update-password.ftl`** — one template, three framings. That is what makes invite-only onboarding cheap: you do not build a signup page, you send an Execute-Actions email with `UPDATE_PASSWORD` and Keycloak drives the rest.

### Keycloak configuration this design assumes

These are prerequisites, not suggestions. The design is wrong on screen if they are not set.

1. **Realm strategy — realm per tenant.** Workspace Entry resolves a subdomain to a realm before Keycloak is involved. If you instead use one realm with groups/organizations, Workspace Entry becomes home-IdP discovery and the copy needs revisiting.
2. **Brute-force detection enabled.** Without it, *Account Locked* never renders and users get a generic error instead.
3. **`rememberMe` enabled at realm level.** The "Remember me" checkbox on Sign In is Keycloak's, and it is silently absent if the realm flag is off.
4. **Reset-password flow enabled** for the Forgot / Email Sent / Reset chain.
5. **OTP policy configured** (6 digits, 30-second TOTP window) — the design states both numbers to the user.
6. **Recovery codes configured** at 12 codes, single-use. Keycloak asks for a *specific numbered* code, not any code; the label is dynamic and the design reflects this ("Recovery code 7 of 12").
7. **Email verification as a required action** for invited users.
8. **Message bundles, not hardcoded copy.** All strings below must land in `messages_en.properties` (and any other locale). Copy written into the FreeMarker markup is copy you cannot localise.

### Security rules that override visual preference

- **Server-side sign-in errors must stay generic.** Keycloak deliberately returns one "Invalid username or password" for both an unknown account and a wrong password. Do not split it. Doing so leaks which staff email addresses exist in a tenant. Client-side format validation (below) is fine and is a different thing.
- **Never reveal realm membership across surfaces.** A customer address entered into staff sign-in, and vice versa, must produce an identical response to any other address.
- **Forgot Password always reports success**, whether or not the address exists. The *Email Sent* screen is unconditional.

---

## Global auth layout

Shared by all 13 screens. In the prototype this is `.auth` in `styles.css` plus the `AuthPage` wrapper in `auth-keycloak.jsx`.

```
┌───────────────────────────┬──────────────────────┐
│  Left panel (art)         │  Right panel (form)  │
│  1.05fr                   │  1fr                 │
│  bg/sunken                │  bg/canvas           │
│  1px right border         │  form max-width 400  │
└───────────────────────────┴──────────────────────┘
```

- **Container**: `display: grid; grid-template-columns: 1.05fr 1fr; height: 100vh;` background `bg/canvas`, colour `text/primary`.
- **Left panel** (`.auth-art`): `background: bg/sunken`, `border-right: 1px solid border/default`, `padding: 32px 40px`, `display: flex; flex-direction: column`, `overflow: hidden`, `position: relative`.
- **Right panel** (`.auth-form-wrap`): `display: grid; place-items: center; padding: 48px; overflow-y: auto`.
- **Form column** (`.auth-form`): `width: 100%; max-width: 400px`.

**Responsive.** At **≤1024px** the grid becomes a single column and the left panel is `display: none` — the art is never shown on tablet or phone. At **≤720px** form padding drops to `28px 22px`, `.auth-h1` to 24px, brand margin to 28px. At **≤480px** padding is `20px 18px`.

### Form column vertical rhythm, top to bottom

| Element | Spec |
|---|---|
| Brand lockup | 32×32 mark, radius 8, `accent/base` fill, `accent/on` text, 700 · 14px, letter-spacing −0.02em. Gap 10px to wordmark. Wordmark 600 · 15px, −0.02em. Block margin-bottom **40px** (28px at ≤720px) |
| Back link (optional) | Transparent button, 13px `text/tertiary`, arrow-left icon 14px, gap 6px, margin-bottom 16px. Hover → `text/primary` |
| H1 | 28 / 700 / −0.025em / line-height 1.15, margin `0 0 8px` |
| Sub-paragraph | 14px `text/tertiary`, margin `0 0 28px` |
| Notice (conditional) | See *Notices* below, margin-bottom 18px |
| Field stack | `display: flex; flex-direction: column; gap: 16px` |
| Primary submit | `.btn-lg` full width — height 48, radius 10, 14.5px / 500, `accent/base` fill |
| Footer note | margin-top 20–28px, 12–12.5px, `text/tertiary` or `text/quaternary` |
| Template badge | **Remove before shipping.** Documentation only |

### Field anatomy

- **Label**: 13px / 500, `text/primary`, 6px above control.
- **Input**: height `44` (density-dependent: compact 36, cozy 48), radius 10, `1px solid border/default`, background `bg/canvas`, 13.5px, padding `0 14px`, `width: 100%`.
- **With leading icon**: `padding-left: 42px`; icon 16px at `left: 14px`, vertically centred, `text/tertiary`.
- **With trailing action**: `padding-right: 42px`; button at `right: 10px`, padding 4px, radius 6px; hover background `bg/hover`.
- **Focus**: `border-color: accent/base` plus `box-shadow: 0 0 0 3px focus/ringSoft`. Keyboard focus additionally gets a 2px `accent/base` outline at 1px offset.
- **Error**: `border-color: status/danger-text`; message below at 12px `status/danger-text`.
- **Placeholder**: `text/quaternary`.
- **Transition**: `border-color 80ms ease, box-shadow 80ms ease`.

### Notices

Two variants, both `display: flex; gap: 12px; padding: 14px 16px; border-radius: 10px`, with an 8px dot at `margin-top: 6px`, a 13.5px/600 title and a 12.5px `text/tertiary` body.

- **Neutral** — background `bg/soft`, `1px solid border/default`, dot `status/success-dot`.
- **Error** — background `status/danger-bg`, `border-color: transparent`, dot `status/danger-dot`, title `status/danger-text`.

### Buttons

| Variant | Fill | Text | Border |
|---|---|---|---|
| Primary | `accent/base` | `accent/on` | transparent — hover fill `text/secondary` |
| Secondary | `bg/canvas` | `text/primary` | `border/default` — hover bg `bg/hover`, border `border/strong` |
| Ghost | transparent | `text/secondary` | none — hover bg `bg/hover`, text `text/primary` |
| Danger | transparent | `status/danger-text` | `border/default` — hover bg `status/danger-bg` |

Heights: `sm` 30 (radius 6, 12.5px), `md` 40 (density-dependent), `lg` 48 (padding `0 22px`, 14.5px). All radius 10 except `sm`. Gap to icon 8px. `disabled` → `opacity: 0.5`. Transition `background 80ms ease, border-color 80ms ease`.

**Touch floor:** below 720px every interactive control is clamped to **44px** minimum regardless of density — icon buttons, menu button, search, `.btn-sm`, and the compact-density `--btn-h` / `--field-h` overrides. Switch grows to 44×26 with a 22px knob; checkbox to 22px with a 44px hit area.

---

## Left panel: the module graph

`AuthArt` in `auth.jsx`. Shared by all 13 screens. Hidden below 1024px.

**Concept.** Six ERP modules wired into a mesh, with focus rotating along the dependency path. This deliberately does **not** preview the dashboard — that is what the user gets after signing in, and showing a fake one first is a worse version of the real thing. The argument being made is that the modules are one connected system.

**Structure**, top to bottom: brand lockup (36×36 mark) → `margin-top: auto` → graph → caption → copyright at 11.5px `text/quaternary`.

### Graph

- Container: `position: relative; width: 100%; max-width: 340px; aspect-ratio: 1 / 0.92; margin: 0 auto`. At `max-height: 720px`, max-width drops to 270px.
- **Edges**: one `<svg>` at `inset: 0`, `viewBox="0 0 100 100"`, `preserveAspectRatio="none"`, `overflow: visible`. Each edge is a `<line>` with `vector-effect="non-scaling-stroke"` so the non-uniform scale does not distort stroke width.
  - Resting: `stroke: border/strong; stroke-width: 1; opacity: .5`.
  - Live (touching the active node): `stroke: text/primary; opacity: 1; stroke-dasharray: 3 5`, animated `stroke-dashoffset: 0 → -16` over **900ms linear infinite**.
  - Transition between states: `stroke 220ms ease, opacity 220ms ease`.
- **Nodes**: absolutely positioned `<button>`, `transform: translate(-50%, -50%)`, **50×50**, radius 10, `1px solid border/default`, background `bg/elevated`, icon 18px, colour `text/tertiary`.
  - Hover: border `border/strong`, colour `text/secondary`.
  - **Active**: background `accent/base`, colour `accent/on`, border `accent/base`, `box-shadow: shadow-2`.
  - Active status dot: 9px circle at `top: -3px; right: -3px`, `status/success-dot`, `2px solid bg/sunken` ring. This is the only green in the panel.
  - Label: absolute at `top: calc(100% + 7px)`, centred, 10.5px / 500, `text/quaternary`; when active → `text/primary` / 600.
  - Transition: `color, background, border-color, box-shadow` at 220ms ease.

**Node positions** (percentage of container, centre-anchored):

| Node | Icon | x | y |
|---|---|---|---|
| Companies | building | 50% | 9% |
| HRMS | users | 14% | 35% |
| Payroll | key | 29% | 76% |
| Finance | layers | 71% | 76% |
| Sales | activity | 50% | 52% |
| Inventory | box | 86% | 35% |

**Edges** (9): Companies–HRMS, Companies–Inventory, Companies–Sales, HRMS–Payroll, Payroll–Finance, Sales–Finance, Sales–HRMS, Inventory–Sales, Inventory–Finance.

### Caption

`min-height: 186px` to prevent layout shift between entries (168px at `max-height: 720px`, where the scope list is hidden).

- **Tag pill**: inline-flex, 10.5px / 600 / letter-spacing 0.08em / uppercase, `text/secondary` on `bg/elevated`, `1px solid border/default`, radius 999, padding `4px 10px 4px 8px`, with a 5px `status/success-dot` dot at gap 7px.
- **Headline**: 21px / 700 / −0.025em / line-height 1.2, margin `14px 0 8px`, `text-wrap: pretty`. 18px at `max-height: 720px`.
- **Body**: 13px `text/tertiary`, line-height 1.55, `max-width: 40ch`, `text-wrap: pretty`.
- **Scope list**: `ul` reset to `display: flex; flex-wrap: wrap`, margin-top 12px, items 11.5px `text/quaternary`, separated by a `·` pseudo-element with `margin: 0 7px` in `border/strong`.
- **Entry animation**: each caption child gets `opacity 0 → 1, translateY(4px) → 0` over 220ms `ease-out`, keyed on the active index so it replays.
- **Ticks**: 6 pills at gap 5px, each 22×3 radius 999 in `border/strong`; active one widens to 34px with background `bg/soft` and contains a fill bar that animates `scaleX(0 → 1)` over the full dwell, `transform-origin: left`, `background: text/primary`.

**Rotation**: `AUTH_DWELL = 3600ms`, advancing on `setInterval`, wrapping at 6. Nodes are clickable to jump; clicking sets the index directly (it does not pause the interval — a deliberate simplification, revisit if it annoys in testing).

**Content** — all six entries, exact copy:

| Node | Tag | Headline | Body | Scope |
|---|---|---|---|---|
| Companies | Multi-tenant | One platform, many companies. | Each tenant keeps its own data, branches and warehouses — on shared modules. | Branches · Warehouses · Module access · Tenant setup |
| HRMS | Source of record | One employee register. | Records, contracts, leave and documents live in one place instead of four. | Employees · Contracts · Leave · Attendance · Documents |
| Payroll | Zero re-entry | Payroll runs on HR's own data. | No re-entry and no spreadsheet round-trip between HR and Finance. | Salary structures · Runs · Payslips · Statutory tax |
| Finance | Single ledger | Every module posts to one ledger. | Payroll runs, stock movements and invoices all land in the same books. | Ledger · Receivables · Payables · Tax · Reporting |
| Sales | Live stock | Orders check live stock. | Quote, order and invoice against what is actually on the shelf right now. | Quotes · Orders · Invoices · POS · Customers |
| Inventory | Per-branch | Stock by warehouse and branch. | Batch and serial tracking, down to the bin, across every location. | Stock · Batches & serials · Transfers · Purchasing |

> **Verify this copy before shipping.** The scope lists describe modules the design assumes exist. Any item naming something unbuilt must be cut — an aspirational feature list on a login screen is a liability.

Tax appears under **both** Payroll (as statutory deduction) and Finance (as filing). That duplication is intentional and correct.

---

## Screens

### 1. Workspace Entry — `WorkspaceEntry`

**Owner: your app.** Resolves which realm or home IdP to send the user to, before Keycloak sees the request.

- **Purpose**: the user names their company's sign-in address.
- **H1** "Find your workspace" / sub "Your company has its own sign-in address. Enter it to continue."
- **Subdomain control**: a split input. Text field is `text-align: right` with square right corners; suffix block is `padding: 0 14px`, `background: bg/soft`, `border: 1px solid border/default` with `border-left: 0`, right corners radius 10, mono 12.5px `text/tertiary`, content `.neoerp.com`, `white-space: nowrap`. Input sanitises to `[a-z0-9-]` lowercase on every keystroke.
- **Submit** "Continue", primary lg full-width. Empty → error notice "Workspace required / Enter your workspace address to continue."
- **Divider**: `display: flex; align-items: center; gap: 12px; margin: 20px 0`, 11.5px `text/quaternary`, with `::before`/`::after` 1px `border/default` flex-1 rules. Label "recent on this device".
- **Recent list**: rows at `padding: 11px 14px`, radius 10, `1px solid border/default`; 32px square avatar (radius 10) with two-letter initials, name 13.5px/500, host mono 11.5px `text/tertiary`, chevron-right 16px `text/quaternary` pushed right. Hover → `bg/hover` + `border/strong`. Seeded with "Kystgruppe Nordic / kystgruppe" and "DevCo Industries / devco" — **persist real values in `localStorage`**, never a cookie readable cross-subdomain.
- **Footer**: "Don't know your address? Ask your company administrator — or check the invitation email you were sent."

### 2. Sign In — `SignIn` → `login.ftl`

- **H1** "Sign In" / sub "Please enter your details to sign in".
- Fields: **Email Address** (mail icon, placeholder "Enter your email") and **Password** (lock icon, eye/eye-off toggle, placeholder "Enter your password").
- Row below: "Remember me" checkbox (left) and "Forgot Password?" ghost text button, 13px/500 `text/primary` (right), `justify-content: space-between`.
- **Submit** "Sign In" → loading label "Signing in…", button `disabled` while pending.
- **Signed-out notice** (neutral variant): title "Notice", body "Signed out." Rendered when arriving from an explicit sign-out.
- **Error notice**: title "Couldn't sign in". Client-side messages: "Please enter a valid email" (no `@`), "Password is too short" (< 4 chars). **Server-side must be the single generic Keycloak message.**
- Footer: "© 2026 NeoERP — Neovatus", 12px `text/quaternary`, centred, margin-top 28px.

### 3. SSO / Providers — `SsoSignIn` → `login.ftl` social block

- **H1** "Sign in to {workspace}" / sub "This workspace uses single sign-on. Choose your provider to continue."
- **Back link** "Change workspace" → Workspace Entry.
- **Provider buttons**: height 48, radius 10, `1px solid border/default`, 13.5px/500, `text-align: left`, gap 12px. Leading 22×22 mark at radius 5, `accent/base` fill, `accent/on` text, 10px/700. Trailing hint at `margin-left: auto`, 11.5px/400 `text/quaternary`. Hover → `bg/hover` + `border/strong`.
- Prototype providers: "Microsoft Entra ID" (hint `default`), "Google Workspace", "Kystgruppe SAML" (hint `SAML 2.0`). **These come from realm config at runtime** — order, labels and count are not design decisions.
- Divider "or", then secondary lg "Sign in with email and password".
- Footer: "Password sign-in can be disabled per workspace. When it is, only the providers above appear."

### 4. 2FA Challenge — `OtpChallenge` → `login-otp.ftl`

- **H1** "Two-factor authentication" / sub "Open your authenticator app and enter the six-digit code for NeoERP."
- **Back link** "Back to sign in".
- **Code entry**: `display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px`. Each box height 56, `min-width: 0; width: 100%`, `size={1}`, centred mono 20px/500, radius 10, `1px solid border/default`. Focus → `accent/base` border + 3px soft ring. Error → `border-color: status/danger-text` on all six.
  - `minmax(0, 1fr)` and `min-width: 0` are **load-bearing**: grid items default to `min-width: auto`, so the inputs' intrinsic min-content width (~254px at this font size) otherwise floors each track and the row overflows to ~1560px. This was a real bug found in review.
  - Inputs are `inputMode="numeric"`, `autoComplete="one-time-code"`, `maxLength={6}`.
- **Behaviour**: typing a digit auto-advances; Backspace on an empty box steps back; pasting a 6-digit code distributes across boxes from the focused position and focuses the last filled one.
- **Submit** "Verify and sign in" → "Verifying…". Under-six digits → "Enter all six digits." Prototype treats `000000` as the failure case: "That code is invalid or has expired. Codes are valid for 30 seconds." — then clears and refocuses box 1.
- **Secondary action**: ghost button with key icon, "Lost your device? Use a recovery code".

### 5. Recovery Code — sub-view of `OtpChallenge` → `login-recovery-authn-code-config.ftl`

- **H1** "Use a recovery code" / sub "Enter one of the twelve codes you saved when you set up two-factor authentication. Each code works once."
- Field label is **dynamic**: "Recovery code 7 of 12" — Keycloak names a specific index. Mono input, placeholder `xxxx-xxxx-xxxx`.
- Footer: "Out of codes? Your company administrator can reset two-factor authentication on your account."

### 6. Forgot Password — `ForgotPassword` → `login-reset-password.ftl`

- **Back link** "Back to sign in". **H1** "Forgot Password?" / sub "No worries. Enter your email and we'll send you a reset link."
- Single email field. Validation: "Enter the email address on your account." Submit → Email Sent, **unconditionally**.

### 7. Email Sent — `EmailSent` → success info page

- Confirms delivery to the submitted address. Actions: primary (prototype-only "Open Reset (demo)" — delete in production; the real path is the emailed link), secondary "Back to Sign In", and inline "Didn't get it? Check spam, or **resend**."

### 8. Reset Password — `ResetPassword` → `login-update-password.ftl`

New password + confirm, with live strength checks. Rules: minimum score 3 of 4 → "Please choose a stronger password."; mismatch → "Passwords don't match."

### 9. Reset Success — `ResetSuccess` → `info.ftl`

"Your password has been updated. You can now sign in with your new credentials." Single primary action "Continue to Sign In".

### 10. Invite → Set Password — `SetPassword mode="invite"` → `login-update-password.ftl`

**The staff onboarding path.** Reached from a Keycloak Execute-Actions email carrying `UPDATE_PASSWORD`. There is no signup page.

- **H1** "Welcome to NeoERP" / sub names the inviter, tenant and role: "Priya Raman invited you to Kystgruppe Nordic as HR Manager. Set a password to activate your account."
- **Context card**: `.card` at `padding: var(--pad-4)`, flex row gap 12px — 36px square avatar (radius 10, 12px text), tenant name 13.5px/600, `email · role` at 12px `text/tertiary`, and a success pill "Invited" pushed right.
- **Password checks** — all four required here (unlike Reset, which needs 3): `display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 16px`. Each row 12px `text/tertiary` with a 14px icon at gap 7px; satisfied → `status/success-text` + check-circle icon, unsatisfied → dot icon.
  - "At least 12 characters" · "One uppercase letter" · "One number" · "One symbol"
  - Failure copy: "Your password must meet all four requirements." / "Passwords don't match."
- **Submit** "Activate account" → **2FA setup** (required for all staff accounts).
- Footer: "Next you'll set up two-factor authentication, which is required for all staff accounts."

### 11. Password Expired — `SetPassword mode="expired"` → `login-update-password.ftl`

Same template and validation, different framing. **H1** "Update your password" / sub "Your administrator requires a password change before you continue." Submit "Update password and continue" → destination. Footer: "You will stay signed in on this device. Other sessions are ended."

### 12. Verify Email — `VerifyEmail` → `login-verify-email.ftl`

A **required action**, not a navigable page — it interrupts the flow until the address is confirmed.

- **H1** "Verify your email" / sub "We sent a verification link to {email}. Open it to finish signing in."
- Neutral notice: "Waiting on you / This page will continue on its own once you've clicked the link. You can close this tab and use the link instead."
- Secondary "Resend verification email" (refresh icon); ghost "Sign in with a different account".
- Footer: "Wrong address? Your administrator can correct it on your user record — you can't change it yourself before verifying."

### 13. Account Locked — `AccountLocked` → `login.ftl` brute-force state

- **H1** "Account temporarily locked" / sub "Too many failed sign-in attempts. For your protection this account is locked for a short period."
- **Error notice**: "5 failed attempts / Last attempt 2 minutes ago from 89.12.44.7 · Oslo, Norway". Show real values from Keycloak's brute-force detector; if IP and geo are unavailable, drop that clause rather than faking it.
- **Countdown card**: centred `.card card-pad` — 12px/500 `text/tertiary` "Unlocks automatically in", then the clock at **mono 34px/500, −0.02em, `text/primary`**, then 12px `text/quaternary` "No action needed — just wait, then sign in again." Ticks once per second from the real remaining lockout, `mm:ss` zero-padded, floored at `00:00`.
- Actions: primary "Reset my password instead" → Forgot Password; secondary "Back to sign in".
- Footer: "Wasn't you? Someone may be trying to access your account. Reset your password, and tell your company administrator."

### 14. Page Expired — `PageExpired` → `login-page-expired.ftl`

Keycloak-specific and unavoidable — fires on back-button and stale-tab submits.

- **H1** "This page has expired" / sub "You were away too long and the sign-in attempt timed out. Nothing was submitted."
- **Both actions are required by the template**: primary "Restart sign-in" (`url.loginRestartFlowUrl`), secondary "Continue where I left off" (`url.loginAction`).
- Footer explains the difference, with the two verbs emphasised at 600 `text/secondary`: "**Restart** begins a fresh attempt. **Continue** resumes the original one, which only works if it hasn't fully expired."

---

## Interactions & Behaviour

### Navigation graph

```
Workspace Entry ──→ Sign In ──→ 2FA ──→ (app)
       │               │  │
       │               │  └──→ Forgot ──→ Email Sent ──→ Reset ──→ Reset Success ──→ Sign In
       └──→ SSO ───────┘                    (via emailed link)
              └──→ 2FA ──→ (app)

Invite email ──→ Set Password ──→ 2FA setup ──→ (app)
Expiry       ──→ Password Expired ──→ (app)
Lockout      ──→ Account Locked ──→ Forgot | Sign In
Stale tab    ──→ Page Expired ──→ Restart | Continue
Unverified   ──→ Verify Email (blocks until confirmed)
```

In production Keycloak owns every transition except the first. Do not reimplement this as client-side routing.

### Motion

| What | Duration | Easing |
|---|---|---|
| Hover backgrounds, borders, button fills | 80ms | ease |
| Switch knob, checkbox fill, tab swap, role card | 120ms | ease |
| Scrim fade, chevron rotation | 150ms | ease |
| Modal rise (12px + 0.98→1 scale), toast entry (8px rise) | 180ms | `cubic-bezier(.2,.8,.2,1)` |
| Drawer slide | 220ms | `cubic-bezier(.2,.8,.2,1)` |
| Bar growth, progress fill, layout reflow | 400ms | ease-out |
| Graph edge flow | 900ms | linear infinite |
| Caption dwell / tick fill | 3600ms | linear |

**`prefers-reduced-motion: reduce` is mandatory.** The global guard drops all animations and transitions to 1ms and cancels the drawer slide, modal rise and toast entry outright — those three have actual travel. The graph's flowing dashes freeze, which reads as intentional.

### Focus

There was no focus treatment at all in an earlier revision, and the one style that existed rendered a **1.04:1 ring** (a `bg/soft` halo on a white page) — it looked like a focus style in code review and was invisible on screen. The current rule:

- `:focus-visible` → `outline: 2px solid focus/ring; outline-offset: 2px`, applied to buttons, icon buttons, nav items, tabs, role cards, chips, links, `[tabindex]` and inputs.
- Inside `overflow: hidden` parents (cards, modals, table rows) the offset inverts to `-2px` so the ring is not clipped.
- Checkbox and switch hide their real `<input>`, so the ring is drawn on the visual proxy via `input:focus-visible + .box` / `+ .track`.
- Inputs additionally keep the 3px `focus/ringSoft` inner halo on plain `:focus`.

### Validation summary

| Field | Rule | Message |
|---|---|---|
| Email (sign in) | contains `@` | "Please enter a valid email" |
| Password (sign in) | ≥ 4 chars | "Password is too short" |
| Email (forgot) | contains `@` | "Enter the email address on your account." |
| Workspace | non-empty after sanitising | "Enter your workspace address to continue." |
| OTP | 6 digits | "Enter all six digits." |
| OTP (server) | valid & unexpired | "That code is invalid or has expired. Codes are valid for 30 seconds." |
| New password (invite/expired) | all 4 checks | "Your password must meet all four requirements." |
| New password (reset) | ≥ 3 of 4 checks | "Please choose a stronger password." |
| Confirm password | exact match | "Passwords don't match." |

Client-side validation is for format only. Every rule must also hold server-side, and the password policy must be configured **in Keycloak** — the checklist is a mirror of realm policy, not its source.

---

## State Management

Per-screen local state only; no shared store is needed for auth. In production most of this collapses into form POSTs that Keycloak handles.

| Screen | State |
|---|---|
| Sign In | `email`, `pw`, `show`, `remember`, `err`, `loading` |
| Workspace Entry | `sub`, `err`; recent workspaces from `localStorage` |
| 2FA | `code[6]`, `err`, `loading`, `recovery` (sub-view), `refs[6]` for focus control |
| Forgot | `email`, `err` |
| Reset / Set Password | `pw`, `pw2`, `show`, `err`; derived `checks` + `score` |
| Account Locked | `left` (seconds), 1s interval, cleared on unmount |
| Left panel | `step`, 3600ms interval, cleared on unmount |

**Data fetching.** None of these screens fetch. Workspace Entry resolves a subdomain (a redirect, or one lookup call if you keep a registry); everything else is a Keycloak form POST. Lockout remaining time, failed-attempt count, provider list, recovery-code index and OTP digit count all come **from Keycloak** — do not hardcode the prototype's placeholder values.

Clear both intervals on unmount. The prototype does; a naive port often does not, and the countdown keeps running after navigation.

---

## Design Tokens

Authoritative source: **`neoerp-tokens.json`** (Tokens Studio format, v1.1.0). The spec page and `styles.css` derive from it, not the reverse. `styles.css` custom properties map 1:1.

### Colour — light

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
| status/success-text · bg · dot | `--success-fg` · `-bg` · `-dot` | `#0E783C` · `#D6F0E0` · `#16A34A` |
| status/warning-text · bg · dot | `--warn-*` | `#92400E` · `#FEF3C7` · `#F59E0B` |
| status/danger-text · bg · dot | `--danger-*` | `#CA2222` · `#FEE2E2` · `#EF4444` |
| status/info-text · bg | `--info-*` | `#1D4ED8` · `#DBEAFE` |

### Colour — dark (`[data-theme="dark"]`)

| Token | Value |
|---|---|
| bg/canvas · elevated · soft · sunken · hover | `#0A0A0A` · `#141414` · `#1A1A1A` · `#0F0F0F` · `#1F1F1F` |
| border/default · strong | `#262626` · `#404040` |
| text/primary · secondary · tertiary · quaternary · disabled | `#FAFAFA` · `#D4D4D4` · `#A3A3A3` · `#8A8A8A` · `#404040` |
| accent/base · on | `#FAFAFA` · `#0A0A0A` |
| status/success | `#4ADE80` · `#052E16` · `#22C55E` |
| status/warning | `#FBBF24` · `#2C1D04` · `#F59E0B` |
| status/danger | `#F87171` · `#2C0A0A` · `#EF4444` |
| status/info | `#93C5FD` · `#0F1E3D` |

> **Five of these values are AA corrections — do not revert them to the earlier palette.** `text/tertiary` light `#737373 → #5F5F5F` (5.85:1 on bg/soft), `text/quaternary` light `#A3A3A3 → #707070` (4.54:1), `text/quaternary` dark `#737373 → #8A8A8A` (5.04:1), `success-text` `#0F7A3D → #0E783C` (4.61:1), `danger-text` `#DC2626 → #CA2222` (4.57:1). The four-level grey ramp cannot be AA-compliant on `bg/soft` **and** keep four widely-spaced steps; tertiary moved with quaternary to preserve a visible step. Warning and info pills and dark `text/tertiary` already passed and are untouched.

### Focus, elevation, layers

- `focus/ring`: `#0A0A0A` light, `#FAFAFA` dark · width 2 · offset 2
- `focus/ringSoft`: `rgba(10,10,10,0.14)` light, `rgba(250,250,250,0.18)` dark
- `elevation` (portable — y / blur / opacity, for Compose and SwiftUI): `1` = 1/3/0.06 · `2` = 4/16/0.10 · `3` = 16/40/0.20
- CSS `boxShadow` equivalents: `--shadow-1` `0 1px 2px rgba(0,0,0,.04), 0 1px 1px rgba(0,0,0,.02)` · `--shadow-2` `0 4px 16px -4px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.04)` · `--shadow-3` `0 16px 40px -8px rgba(0,0,0,.18), 0 4px 12px rgba(0,0,0,.06)`. Dark theme raises opacity; shadow colour is pure black in both.
- `zIndex`: scrim 80 · drawer 90 · modal 900 · toast 1000

### Typography

**Inter Tight** for all UI, **JetBrains Mono** for identifiers, codes, OTP and tabular data. Both are SIL OFL 1.1 — fetch WOFF2 from Google Fonts or upstream. Subset needed: Inter Tight 400/500/600/700, JetBrains Mono 400/500.

Body sets `font-feature-settings: "ss01", "cv11"` and `letter-spacing: -0.005em`. **Carry both over** — without them digits and lowercase `a` differ visibly from every screenshot here, which reads as a bug in review. Enable tabular figures wherever numbers align.

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
| mono | 12.5 / 400 / 18 | UUIDs, codes |

### Spacing, density, radius

Base scale `8 · 12 · 16 · 20 · 24`. Three density sets, mapped to `[data-density]`:

| | 1 | 2 | 3 | 4 | 5 | tableRow | field | button/md | sidebar |
|---|---|---|---|---|---|---|---|---|---|
| compact | 6 | 8 | 12 | 16 | 20 | 44 | 36 | 32 | 232 |
| regular | 8 | 12 | 16 | 20 | 24 | 56 | 44 | 40 | 260 |
| cozy | 10 | 14 | 18 | 22 | 28 | 64 | 48 | 44 | 260 |

`$touchFloor: 44` — below 720px every density clamps field, button and icon-button to 44.

Radius: `sm` 6 · `md` 10 · `lg` 14 · `xl` 18 · `pill` 999.

Other sizing: button sm/md/lg 30/40/48 · topbar 64 · sidebarDrawer 280 · icon sm/md/lg 14/16/20 · avatar sm/md/lg 32/36/56.

### Breakpoints

`phone` 480 · `mobile` 720 (tables → cards, single column) · `tablet` 1024 (sidebar → drawer, **auth art hidden**) · `desktop` 1280 and `wide` 1440 are declared but not queried.

---

## Assets

- **Icons** — 43 glyphs, hand-authored Lucide-style outline set on a 24×24 grid, 1.75 stroke, round caps and joins, `fill: none`, `stroke: currentColor`. Defined in `icons.jsx` as a name → JSX-paths map with an `<Icon name size />` wrapper. Auth uses: `mail`, `lock`, `eye`, `eyeOff`, `arrowL`, `chevR`, `key`, `refresh`, `checkCircle`, `dot`, `building`, `users`, `box`, `activity`, `layers`. Swap for your codebase's icon library if it has equivalents — match the 1.75 stroke weight, since a heavier stroke visibly changes the density of the design.
  - Note: `i-eyeoff` looks unreferenced to static analysis but is **not** an orphan — the password toggle rewrites the `use` href at runtime.
- **Images** — none. No photography, no illustration, no raster assets anywhere in the auth flow. The left panel is entirely CSS and inline SVG.
- **Fonts** — not bundled. Both are open-licence; see *Typography*.

## Files

Design references in this bundle:

| File | Contents |
|---|---|
| `NeoERP Super Admin.html` | Prototype entry point — routing, tweaks panel, screen jump list |
| `auth.jsx` | `AuthArt` left panel + Sign In, Forgot, Email Sent, Reset, Reset Success |
| `auth-keycloak.jsx` | `AuthPage` wrapper + Workspace, SSO, 2FA, Locked, Verify, Set Password, Page Expired |
| `shell.jsx` | `Field`, `Checkbox`, `Pill`, `Toast`, app shell primitives used by the auth forms |
| `icons.jsx` | The 43-glyph icon set |
| `styles.css` | All tokens as custom properties, component CSS, responsive rules, focus, reduced motion |
| `feedback.css` | Skeletons, empty states, offline, permission denied, partial failure |
| `neoerp-tokens.json` | **Authoritative** token file, Tokens Studio format |
| `data.jsx` | Mock tenant/user data — reference for shapes only, not fixtures to ship |
| `tweaks-panel.jsx` | Prototype-only control panel. Do not port |

**To run the prototype**: serve the folder over HTTP (`python3 -m http.server`) and open `NeoERP Super Admin.html`. `file://` will not work — the Babel-transformed `src` scripts are blocked by CORS. Use the Tweaks panel to jump to any of the 13 screens and to toggle theme and density.

**Do not port**: `tweaks-panel.jsx`, the `.ftl` badge component (`FtlBadge` in `auth-keycloak.jsx`), the "Open Reset (demo)" button on Email Sent, or the `000000` OTP failure shortcut. All four are scaffolding for reviewing the design.