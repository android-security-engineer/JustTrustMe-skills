---
name: justtrustme
description: Deploy JustTrustMe, an Xposed/LSPosed module that disables Android SSL certificate and pinning validation, onto an authorized Android test device, then verify the hooks are live. Use when the user wants to bypass certificate pinning, MITM an Android app's HTTPS traffic, or audit an app's TLS behavior on a rooted test device running Xposed-compatible frameworks (LSPosed, EdXposed, or the original Xposed Installer).
---

# JustTrustMe — Android SSL-Validation Killer (Xposed module)

> This skill drives an **Xposed module**, not a CLI. "Running" it means: build the APK →
> install on a rooted device → enable the module in an Xposed-compatible framework → reboot →
> verify hooks fire inside the target app. Plan for that lifecycle before you start.

## Hard requirements before you start

This is **not a CLI tool and not a normal app**. JustTrustMe is an **Xposed module** — a
`.apk` that must be installed on a device, enabled inside a framework, then *injected into
the target app's own process* to disable its SSL checks. There is no binary to run from a
shell, no server, and no UI to open. If any requirement below is missing, the module cannot
work — verify before promising anything:

| Requirement | Why | How to check |
|---|---|---|
| **A rooted device** (standard path) | Xposed frameworks inject at zygote level → needs system-level privilege | `adb shell id` → `uid=0` |
| **An Xposed-compatible framework** installed | Something must actually load the module: LSPosed (modern), EdXposed (older), classic Xposed Installer (Android < 7) | `scripts/check-framework.sh` |
| **Module enabled in the manager + reboot** | Hooks load at app-process start; the framework caches module state | enable in manager, then `adb reboot` |
| **Target app scoped in the manager** | Module only affects apps the framework loads it into | LSPosed → Modules → tick JustTrustMe → scope target app(s) |

If the device has **no root and no framework**, stop and report that — this module cannot be
deployed on it. A rootless container (VirtualXposed) is a separate, unreliable path and is
**out of scope** for this skill.

## Quick path

```bash
# 1. Build the module APK (needs Android SDK; see "Prerequisites" below)
ANDROID_HOME=$HOME/Android/Sdk ./scripts/build-apk.sh

# 2. Confirm the device + framework
./scripts/check-framework.sh

# 3. Install and enable (device must be rooted, USB-connected, framework already flashed)
adb install -r app/build/outputs/apk/release/JustTrustMe.apk
#  → LSPosed/EdXposed/Xposed Installer app: enable "JustTrustMe" for the target app, reboot

# 4. Verify hooks are live inside the target app
adb logcat -s JustTrustMe:D  # hook-install log lines should appear when target app starts
```

## What this module hooks

When the module is enabled for a target app, `just.trust.me.Main.handleLoadPackage()` installs
hooks that disable certificate validation across the following surfaces (all declared in
`app/src/main/java/just/trust/me/Main.java`):

| Surface | What is hooked | Result |
|---|---|---|
| Apache HttpClient | `DefaultHttpClient` ctors → trust-all `ClientConnectionManager`; `SSLSocketFactory` ctor / `getSocketFactory`; `isSecure` | Apache-based apps accept any cert |
| JSSE | `TrustManagerFactory.getTrustManagers`; `HttpsURLConnection.setDefaultHostnameVerifier/setSSLSocketFactory/setHostnameVerifier`; `SSLContext.init` → trust-all `TrustManager` | `HttpsURLConnection` / raw JSSE accepts anything |
| WebView | `WebViewClient.onReceivedSslError` → auto-`proceed()`; `onReceivedError` no-op | WebView pages continue on SSL errors |
| Conscrypt `TrustManagerImpl` (Android N+) | `checkServerTrusted` (3 overloads) + `checkTrusted` (2 overloads) → return empty/0 | Native conscrypt chain validation bypassed |
| OkHttp 2.x / 3.x / 4.2.0+ | `CertificatePinner.check` → no-op / `true`; `OkHostnameVerifier.verify` → `true` | Certificate pinning + hostname checks bypassed |
| xUtils3 | `RequestParams.setSslSocketFactory` / `setHostnameVerifier` → trust-all | xUtils3-based apps accept anything |
| httpclientandroidlib | `AbstractVerifier.verify` → no-op | `ch.boye.*` lib accepts anything |
| Android Network Security Config | `android.security.net.config.NetworkSecurityTrustManager.checkPins` → no-op | `network_security_config` pins bypassed |

Notes:
- Hooks are **global** — this module targets no specific package; every app the framework
  loads it into is affected. The user should enable it only for the apps they are testing.
- Third-party lib hooks (OkHttp/xUtils/httpclientandroidlib) are installed lazily after
  `Application.attach`, keyed on classloader availability — a missing library is silently
  skipped (log line "not found ... not hooking").
- The module is mostly dormant against modern apps using their **own statically-linked TLS**
  (Flutter, some games, custom network stacks). If a target resists, see
  `references/hook-coverage.md`.

## Prerequisites (verify, don't assume)

These are **hard gates, not nice-to-haves**. Verify each before promising the user
anything; if a gate fails, say so and stop the workflow — do not attempt the build/install.

1. **Rooted device with an Xposed-compatible framework** — the module is useless without
   both:
   - Root: `adb shell id` shows `uid=0`. No root → no injection point.
   - Framework: LSPosed (Zygisk or Riru mode) — preferred on modern Android; EdXposed
     (older Android); Original Xposed Installer (pre-Android 7-era devices).
   `./scripts/check-framework.sh` inspects the connected device for the framework's
   installer app and reports which modules manager is present.
2. **Android SDK** for the build: AGP 7.4.x + Gradle 7.5.x + **JDK 17** (Gradle 7.5.1 does
   not support JDK 21's class files — using it fails the build), `compileSdk 33`. Set
   `ANDROID_HOME` (default `$HOME/Android/Sdk`). Dependencies are fetched from Google Maven;
   if your build host has no network, `scripts/build-apk.sh --offline` will try the local
   Gradle cache first.
3. **ADB** on PATH, device authorized (`adb devices` shows `device`, not `unauthorized`).

## Build, install, enable, reboot — the full lifecycle

1. **Build** — `scripts/build-apk.sh` produces
   `app/build/outputs/apk/release/JustTrustMe.apk` (release, unsigned is fine for Xposed
   module sideloading).
2. **Install** — `adb install -r app/build/outputs/apk/release/JustTrustMe.apk`. Reinstalls
   are fine; the module keeps its framework registration via the `xposedmodule` meta-data.
3. **Enable** — inside the modules manager app on the device, tick **JustTrustMe**:
   - LSPosed: scope it to the target app(s) (or system framework if the user asks for
     system-wide). Global scope is possible but affects every app.
   - Classic Xposed Installer: check the module and reboot.
4. **Reboot** — the framework injects modules at process start. A reboot (or, on some
   frameworks, killing the target app) is required for hooks to load.
5. **Verify** — when the target app starts, `logcat -s JustTrustMe:D` shows the
   hook-install lines (`"Hooking DefaultHTTPClient for: <pkg>"`, `"Hooking okhttp3..."`, etc.).
   Absence of these lines for a class means the app does not use that library.

## Verifying the bypass actually works

Hook log lines prove hooks were installed, not that a real MITM succeeds. To prove the
bypass end-to-end:

1. Configure a local TLS-intercepting proxy (Burp / mitmproxy / Charles) on the host.
2. Point the device at it (Wi-Fi proxy settings or `adb shell settings put global
   http_proxy <host>:<port>` for system-wide; some frameworks need `network_security_config`
   permitting user CAs — this module's `checkPins` hook does not bypass Android's
   cleartext/user-CA policy for the proxy handshake itself).
3. In the app, trigger the HTTPS request you want to inspect. If it succeeds through the
   proxy and you see decrypted traffic, the relevant hook fired. If the app still fails
   with `handshake` / `SSLPeerUnverified` / `Certificate pinning failure`, the app likely
   uses a network stack this module does not hook — collect the failure and check
   `references/hook-coverage.md` for what to try next.

## Failure collection

When a target still enforces validation, gather: Android version, framework + version,
the app's `logcat` `JustTrustMe` lines, the exact TLS error text, and which network library
the app uses (usually visible in its dex; `jadx`/`apkleaks` skills can help identify it).
Post the recipe to the upstream issue tracker:
https://github.com/Fuzion24/JustTrustMe/issues

## Reference routing

- `references/hook-coverage.md` — full hook surface, per-SDK behavior, limits, and what
  modern apps typically resist
- `references/environment.md` — framework install matrix (LSPosed/EdXposed/Xposed) and
  per-Android-version notes
- `scripts/build-apk.sh` — build entry point (also used by CI)
- `scripts/check-framework.sh` — device/framework inspection
- `scripts/verify-hooks.sh` — logcat-driven post-reboot hook verification
