# JustTrustMe

> **English** · [简体中文](README.zh-CN.md)

> **Skills repository**: this repo layers an AI-agent skill on top of the original
> JustTrustMe project — `SKILL.md`, `CLAUDE.md`, `plugin.json`, and `.claude-plugin/`.
> An agent (Claude Code, Codex, etc.) can install this skill and run the full loop:
> build the APK, check the device framework, install and enable the module, then verify
> the hooks actually fire.
>
> - Humans / original project docs: below.
> - **AI agents**: start with `SKILL.md` at the repo root (quick path, four steps).
>   `references/` holds the hook-coverage and environment reference; `scripts/` are the
>   runnable scripts (`build-apk.sh` / `check-framework.sh` / `verify-hooks.sh`).
> - **Install this skill**: add this repo as a Claude Code plugin marketplace source
>   (`.claude-plugin/marketplace.json`), or mount the repo directory as a skills directory.
> - **Product website**: `website/` is a React + TypeScript + Three.js product site with an
>   interactive hero and a four-part story (problem / how it works / coverage / effect).
>   Local preview: `cd website && npm install && npm run dev`. Build: `cd website && npm run build`.

## What it is

An Xposed module that disables SSL certificate checking. This is useful for auditing an
application which does certificate pinning. There also exists a nice framework built by
@moxie to aid in pinning certs in your app:
[certificate pinning](https://github.com/moxie0/AndroidPinning).

An example of an application that does cert pinning is
[Twitter](https://play.google.com/store/apps/details?id=com.twitter.android). If you would
like to view the network traffic for this application, you must disable the certificate
pinning.

I built this for Xposed rather than Cydia Substrate because Xposed seems to support newer
devices better. Marc Blanchou wrote the
[original tool](https://github.com/iSECPartners/Android-SSL-TrustKiller) for Cydia
Substrate. If you find that you are not able to MITM an application, please file an issue.

## Hard requirements

JustTrustMe is **not a CLI tool and not a normal app**. It is an Xposed module: it must be
installed on a device, enabled inside an Xposed-compatible framework, and then *injected
into the target app's own process* to disable its SSL checks. Verify all four gates before
promising anything:

| Requirement | Why | How to check |
|---|---|---|
| A rooted device | Xposed frameworks inject at zygote level → system privilege needed | `adb shell id` → `uid=0` |
| An Xposed-compatible framework | Something must load the module: LSPosed (modern), EdXposed (older), classic Xposed Installer (Android < 7) | `scripts/check-framework.sh` |
| Module enabled in the manager + reboot | Hooks load at app-process start; the framework caches module state | enable in manager, then `adb reboot` |
| Target app scoped in the manager | The module only affects apps the framework loads it into | LSPosed → Modules → tick JustTrustMe → scope target app(s) |

## Installation

As a prerequisite, your device must be rooted and the Xposed framework must be installed.
You can download the Xposed framework
[here](http://repo.xposed.info/module/de.robv.android.xposed.installer).

### Install from binary

The JustTrustMe binary can be downloaded from
[https://github.com/Fuzion24/JustTrustMe/releases/latest](https://github.com/Fuzion24/JustTrustMe/releases/latest)

```
adb install ./JustTrustMe.apk
```

or navigate here and download the APK on your phone:
[https://github.com/Fuzion24/JustTrustMe/releases/latest](https://github.com/Fuzion24/JustTrustMe/releases/latest)

### Build from source

All the normal Gradle build commands apply. To build a release APK:

```
./gradlew assembleRelease
```

To install directly to the phone connected via ADB:

```
./gradlew installRelease
```

## What the module hooks

`just.trust.me.Main` installs trust-all hooks across these surfaces (full matrix in
`references/hook-coverage.md`):

| Surface | Result |
|---|---|
| Apache HttpClient (`DefaultHttpClient` ctors, `SSLSocketFactory`, `isSecure`) | Apache-based apps accept any cert |
| JSSE (`TrustManagerFactory`, `HttpsURLConnection`, `SSLContext.init`) | `HttpsURLConnection` / raw JSSE accepts anything |
| WebView (`onReceivedSslError` → `proceed()`) | WebView pages continue on SSL errors |
| Conscrypt `TrustManagerImpl` (Android N+) | Native conscrypt chain validation bypassed |
| OkHttp 2.x / 3.x / 4.2.0+ (`CertificatePinner`, `OkHostnameVerifier`) | Pinning + hostname checks bypassed |
| xUtils3 / httpclientandroidlib | Trust-all socket factory + hostname verifier |
| Android Network Security Config (`checkPins`) | `network_security_config` pins bypassed |

## License

Apache-2.0 (see `License.md`). Upstream:
[Fuzion24/JustTrustMe](https://github.com/Fuzion24/JustTrustMe).
