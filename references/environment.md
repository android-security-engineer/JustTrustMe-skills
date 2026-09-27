# Environment: frameworks, devices, and per-Android notes

JustTrustMe is an Xposed-API module. It needs (a) a rooted device, (b) an Xposed-compatible
framework to inject it, and (c) a modules manager app to enable it. This page covers the
install matrix and per-version notes.

## Framework matrix

| Framework | Modern Android? | How it injects | Modules manager | Reboot needed |
|-----------|-----------------|----------------|-----------------|---------------|
| **LSPosed** (Zygisk mode) | Android 8–13+ | Magisk Zygisk | `org.lsposed.manager` (or companion `org.cheyi.lsposed` / `com.elyeproj.lsposed`) | Yes (after enable) |
| **LSPosed** (Riru mode) | Android 7–12 | Magisk Riru | same manager | Yes |
| **EdXposed** | Android 7–11 | Magisk Riru (YAHFA/SandHook) | `com.elderdrivers.riru.edxp` / classic installer | Yes |
| **Classic Xposed Installer** | Pre-Android 7 only | System framework drop-in | `de.robv.android.xposed.installer` | Yes |

`scripts/check-framework.sh` probes the connected device for these manager packages and
reports what it finds.

## Device prerequisites

1. **Root** — the framework injects at zygote level. `adb shell id` must show `uid=0`.
   LSPosed on a stock device usually implies Magisk (`pm list packages magisk`).
2. **Bootloader unlocked / custom kernel** on most vendors; otherwise the Magisk route is
   required. Emulators: Google Play images are unrootable; use the **AOSP** system images
   (which are `adb root`-able) with LSPosed if you need an emulator.
3. **`frida-server` not required** — this module is pure Java/Xposed; no Frida involved.

## Enable + reboot flow (LSPosed example)

1. `adb install -r app/build/outputs/apk/release/JustTrustMe.apk`
2. Open **LSPosed** → **Modules** → tick **JustTrustMe**.
3. Scope: choose the target app(s). Or "System framework" for system-wide (affects
   everything; usually not what you want).
4. Reboot the device (framework caches module state; a force-stop of the target is *not*
   enough for first enable).
5. Verify with `scripts/verify-hooks.sh <target-pkg>`.

## Per-Android-version notes

- **Android < 7 (N)**: no `X509ExtendedTrustManager`, no conscrypt `TrustManagerImpl`
  hooks. Module uses plain `X509TrustManager`; conscrypt hooks (13–17) are skipped. Still
  bypasses Apache/JSSE/WebView/OkHttp pinning.
- **Android 7–13**: full surface — conscrypt `TrustManagerImpl` hooks active, extended
  trust manager used. This is the well-tested zone.
- **Android 14+**: LSPosed Zygisk is the practical framework. Some system hardening around
  cleartext and default network security config can still block the *proxy* handshake (see
  hook-coverage "Known limits #3").

## Proxy / MITM setup

- Host proxy: **Burp Suite**, **mitmproxy**, or **Charles** listening on the host.
- Point the device at it:
  - Wi-Fi proxy settings (per-AP), or
  - `adb shell settings put global http_proxy <host>:<port>` (system-wide; affects all apps
    including non-targets).
- Install the proxy's CA cert into the device user store so the *first* TLS handshake (to
  your proxy) is trusted. Modern apps may still reject user-added CAs — if so, accept the
  cert in the app's `network_security_config` or patch the app. JustTrustMe's `checkPins`
  hook does not override Android's user-CA trust decision.
