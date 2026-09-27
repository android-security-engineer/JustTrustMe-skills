#!/usr/bin/env bash
# Inspect a connected Android device for an Xposed-compatible framework and root.
# Reports which modules-manager app is present (LSPosed / EdXposed / classic Xposed)
# and concludes whether JustTrustMe can be deployed.
#
# Exit code: 0 = deployable (root + a framework manager found); 1 = not deployable.
#
# Usage:
#   ./scripts/check-framework.sh [adb-device-serial]
set -euo pipefail

ADB="${ADB:-adb}"
SERIAL="${1:-}"
# shellcheck disable=SC2206
ADB_CMD=($ADB)          # allow ADB to carry flags, e.g. ADB="adb -e"
if [ -n "$SERIAL" ]; then
  ADB_CMD+=( -s "$SERIAL" )
fi

ROOT=0
FRAMEWORK=0

echo "== devices =="
"${ADB_CMD[@]}" devices

echo "== framework manager apps =="
for pkg in org.lsposed.manager de.robv.android.xposed.installer org.cheyi.lsposed com.elderdrivers.riru.edxp com.elyeproj.lsposed; do
  if "${ADB_CMD[@]}" shell pm list packages "$pkg" 2>/dev/null | grep -q "package:$pkg"; then
    case "$pkg" in
      org.lsposed.manager) echo "FOUND: LSPosed manager (org.lsposed.manager)" ;;
      org.cheyi.lsposed|com.elyeproj.lsposed) echo "FOUND: LSPosed (alternative) ($pkg)" ;;
      de.robv.android.xposed.installer) echo "FOUND: classic Xposed Installer (de.robv.android.xposed.installer)" ;;
      com.elderdrivers.riru.edxp) echo "FOUND: EdXposed ($pkg)" ;;
    esac
    FRAMEWORK=1
  fi
done

echo "== root check =="
if "${ADB_CMD[@]}" shell 'id' 2>/dev/null | grep -q "uid=0"; then
  echo "root: yes"
  ROOT=1
else
  echo "root: NO — device must be rooted to load Xposed modules"
fi

echo "== magisk? =="
"${ADB_CMD[@]}" shell 'pm list packages magisk 2>/dev/null' | head -3 || true

echo
if [ "$ROOT" -eq 1 ] && [ "$FRAMEWORK" -eq 1 ]; then
  echo "VERDICT: deployable — device is rooted and a modules manager is installed."
  echo "Next: enable JustTrustMe in the manager, scope it to the target app, reboot."
  exit 0
fi

echo "VERDICT: NOT deployable — JustTrustMe cannot load without both root AND a framework."
if [ "$ROOT" -eq 0 ]; then
  echo "  missing: root (adb shell id must show uid=0)"
fi
if [ "$FRAMEWORK" -eq 0 ]; then
  echo "  missing: Xposed-compatible framework. Install LSPosed (Zygisk or Riru mode) from"
  echo "  https://github.com/LSPosed/LSPosed/releases and reboot before proceeding."
fi
exit 1
