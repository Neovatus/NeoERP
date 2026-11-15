# Cross-cutting findings (design system; fix after the current builder)

1. **Dialog buttons: spacing differs between dialogs** (Jabran 2026-11-15). Seen: Post refund confirm (Cancel and Post refund touching), write-off sheet and Approve dialog (very close), Delete draft (a gap). Cause in `designsystem/components/NeoDialog.kt`: three variants space their buttons differently —
   - `NeoDialogCard` uses the platform dialog's confirm/dismiss slots (platform default gap);
   - `NeoDialogSheet` puts `actions` in a Row with `Arrangement.End` and **no spacing** (each caller decides, or not);
   - `NeoConfirmDialog` uses `spacedBy(spacing.xs)`.
   Fix: one rule for every dialog — the actions Row is `Arrangement.spacedBy(<one dialog-actions token>, Alignment.End)`, the same token in Card/Sheet/Confirm and the panel footers; remove caller-side spacers. Check every dialog/sheet in Accounts after the change.
