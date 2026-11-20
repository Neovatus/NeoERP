#!/bin/sh
# Checks a Mac for everything NeoERP needs (read-only: installs nothing).
# Usage: scripts/check-new-machine.sh   — prints OK / MISSING per item and a hint for each missing one.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NEO="$(dirname "$ROOT")"
miss=0
ok()   { printf '  OK       %s\n' "$1"; }
bad()  { printf '  MISSING  %s  ->  %s\n' "$1" "$2"; miss=$((miss+1)); }
has()  { command -v "$1" >/dev/null 2>&1; }

echo "Tools"
has brew    && ok "Homebrew"            || bad "Homebrew" "see https://brew.sh"
has git     && ok "git"                 || bad "git" "xcode-select --install"
has gh      && ok "GitHub CLI"          || bad "GitHub CLI" "brew install gh && gh auth login"
has gh && { gh auth status >/dev/null 2>&1 && ok "gh signed in" || bad "gh signed in" "gh auth login"; }
has python3 && ok "python3"             || bad "python3" "brew install python"
has node    && ok "node"                || bad "node" "brew install node"
has rsync   && ok "rsync"               || bad "rsync" "brew install rsync"
[ -x /usr/bin/lockf ] && ok "lockf"     || bad "lockf" "comes with macOS"
/usr/libexec/java_home -v 21 >/dev/null 2>&1 || ls -d "$HOME"/Library/Java/JavaVirtualMachines/jbr-21* >/dev/null 2>&1 \
  && ok "JDK 21 (runs Gradle)" || bad "JDK 21 (runs Gradle)" "brew install --cask temurin@21 (or JetBrains Runtime 21)"
/usr/libexec/java_home -v 17 >/dev/null 2>&1 && ok "JDK 17 (backend toolchain)" || bad "JDK 17 (backend toolchain)" "brew install --cask temurin@17"
has docker  && ok "Docker"              || bad "Docker Desktop" "brew install --cask docker, then open it once"
has docker && { docker info >/dev/null 2>&1 && ok "Docker running" || bad "Docker running" "open -a Docker"; }
has xcodebuild && ok "Xcode ($(xcodebuild -version 2>/dev/null | head -1))" || bad "Xcode" "install Xcode 27 from the App Store, then xcode-select -s /Applications/Xcode.app"
xcrun simctl list devices 2>/dev/null | grep -q "iPhone SE" && ok "iPhone SE simulator" || bad "iPhone SE simulator" "Xcode > Settings > Components, add an iOS runtime; create iPhone SE, iPhone 18 Pro, iPad mini, iPad Pro 13"
[ -d "$HOME/Library/Android/sdk" ] && ok "Android SDK" || bad "Android SDK" "install Android Studio, SDK platform 36"
has claude  && ok "Claude Code CLI"     || bad "Claude Code CLI" "optional; the desktop app is enough"

echo "Code"
[ -d "$ROOT/NeoERP-App/.git" ]     && ok "NeoERP-App"     || bad "NeoERP-App" "cd $ROOT && git clone https://github.com/Neovatus/NeoERP-FrontEnd.git NeoERP-App"
[ -d "$ROOT/NeoERP-BackEnd/.git" ] && ok "NeoERP-BackEnd" || bad "NeoERP-BackEnd" "cd $ROOT && git clone https://github.com/Neovatus/NeoERP-BackEnd.git NeoERP-BackEnd"
[ -d "$NEO/KMM-Module/KMM-Network" ] && ok "KMM-Module/KMM-Network" || bad "KMM-Module" "cd $NEO && git clone https://github.com/Neovatus/KMM-Module.git"
[ -f "$ROOT/NeoERP-App/local.properties" ] && grep -q '^sdk.dir=' "$ROOT/NeoERP-App/local.properties" && [ -d "$(sed -n 's/^sdk.dir=//p' "$ROOT/NeoERP-App/local.properties")" ] \
  && ok "App local.properties sdk.dir" || bad "App local.properties sdk.dir" "echo \"sdk.dir=\$HOME/Library/Android/sdk\" > $ROOT/NeoERP-App/local.properties"
[ -f "$ROOT/NeoERP-BackEnd/.local-secrets/demo-passwords" ] && ok "dev secrets (from the clone)" || bad "dev secrets" "git -C $ROOT/NeoERP-BackEnd pull"
case "$ROOT" in "$HOME/Offices/Neovatus/NeoERP") ok "workspace path matches the old Mac";; *) bad "workspace path" "clone to ~/Offices/Neovatus/NeoERP so scripts and memory restore work";; esac

echo
[ "$miss" -eq 0 ] && echo "All present. Next: Docker on, then NeoERP-BackEnd/scripts/reset-local-dev.sh (NEOERP_CONFIRM_RESET=yes) and scripts/sync-lead-memory.sh restore." \
  || echo "$miss item(s) missing."
exit 0
