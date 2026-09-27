#!/usr/bin/env bash
# Verify JustTrustMe hooks fired inside a target app, after the module is enabled
# and the device rebooted. Greps logcat for the module's hook-install lines.
#
# Usage:
#   ./scripts/verify-hooks.sh <target-package> [adb-device-serial]
#
# What to look for:
#   - "Hooking DefaultHTTPClient for: <pkg>"  → Apache HttpClient used & hooked
#   - "Hooking okhttp3.CertificatePinner..."  → OkHttp used & hooked
#   - "Hooking com.android.org.conscrypt.TrustManagerImpl"  → conscrypt chain bypassed
#   - Absence of a line for a library means the target does NOT use that library.
#
# Missing everything (not even "Hooking ... for: <pkg>" of an app the target uses)?
#   - module not enabled for this app in the framework manager, or
#   - device not rebooted after enabling, or
#   - framework not actually installed/running.
set -euo pipefail

ADB="${ADB:-adb}"
PKG="${1:?usage: $0 <target-package> [serial]}"
SERIAL="${2:-}"
# shellcheck disable=SC2206
ADB_CMD=($ADB)          # allow ADB to carry flags, e.g. ADB="adb -e"
if [ -n "$SERIAL" ]; then
  ADB_CMD+=( -s "$SERIAL" )
fi

echo "== ensure target installed =="
"${ADB_CMD[@]}" shell pm path "$PKG" >/dev/null 2>&1 || {
  echo "ERROR: package $PKG not installed on device" >&2; exit 1
}

echo "== launch target (force-stop then start) =="
"${ADB_CMD[@]}" shell am force-stop "$PKG"
"${ADB_CMD[@]}" shell monkey -p "$PKG" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1 || true
sleep 2

echo "== collect JustTrustMe log lines =="
"${ADB_CMD[@]}" logcat -d -s JustTrustMe:D

echo
echo "== summary =="
COUNT="$("${ADB_CMD[@]}" logcat -d -s JustTrustMe:D 2>/dev/null | grep -c 'JustTrustMe')"
echo "JustTrustMe log lines: $COUNT"
if [ "$COUNT" -eq 0 ]; then
  echo "NO hook lines found — module likely not enabled/rebooted, or framework not active."
  exit 1
fi
