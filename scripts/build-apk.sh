#!/usr/bin/env bash
# Build the JustTrustMe Xposed module APK.
# Produces: app/build/outputs/apk/release/JustTrustMe.apk
#
# Usage:
#   ./scripts/build-apk.sh [--offline]
#
# Requires: Android SDK (compileSdk 33 platform + build-tools), network to Google Maven
# on first build. `--offline` uses the local ~/.gradle cache only.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"

if [ ! -d "$ANDROID_HOME/platforms" ]; then
  echo "ERROR: Android SDK not found at \$ANDROID_HOME=$ANDROID_HOME" >&2
  echo "Install it or set ANDROID_HOME to your SDK path." >&2
  exit 1
fi

cd "$ROOT"
export ANDROID_HOME

EXTRA=()
if [ "${1:-}" = "--offline" ]; then
  echo "[build] offline mode: using local ~/.gradle cache only"
  EXTRA+=(--offline)
fi

# Prefer the wrapper, but fall back to a locally-unpacked Gradle 7.5.x binary when the
# wrapper download is blocked (no network to services.gradle.org). Keeps builds working
# in network-restricted environments that already have ~/.gradle cached.
GRADLE_CMD=(./gradlew)
if [ ! -x ./gradlew ] || [ -n "${GRADLE_BIN:-}" ]; then
  # If the user pinned a binary via $GRADLE_BIN use it; else glob any cached gradle-7.5.x.
  if [ -n "${GRADLE_BIN:-}" ]; then
    GRADLE_CMD=("$GRADLE_BIN")
  else
    # shellcheck disable=SC2012
    CAND="$(ls -d "$HOME"/.gradle/wrapper/dists/gradle-7.5.*/*/gradle-7.5.*/bin/gradle 2>/dev/null | head -1 || true)"
    [ -n "$CAND" ] && GRADLE_CMD=("$CAND")
  fi
fi
if [ ! -x "${GRADLE_CMD[0]}" ]; then
  echo "ERROR: no usable gradle (wrapper missing and no cached gradle-7.5.x found; set \$GRADLE_BIN)" >&2
  exit 1
fi

"${GRADLE_CMD[@]}" -p . assembleRelease "${EXTRA[@]}"

OUT="app/build/outputs/apk/release/JustTrustMe.apk"
if [ -f "$OUT" ]; then
  echo "[build] OK: $OUT"
  ls -lh "$OUT"
else
  echo "[build] FAILED: expected $OUT not found" >&2
  exit 1
fi
