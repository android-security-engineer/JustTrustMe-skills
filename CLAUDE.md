# JustTrustMe Project — AI-Assisted Android SSL-Bypass Module

## What this is

JustTrustMe is an **Xposed module** that disables SSL certificate validation and certificate
pinning inside Android apps, for authorized security testing. The runtime logic lives in a
single file: `app/src/main/java/just/trust/me/Main.java` (`just.trust.me.Main`, declared in
`app/src/main/assets/xposed_init`). There is no CLI and no server: the module runs *inside
every app the framework loads it into*, via `IXposedHookLoadPackage.handleLoadPackage()`.

## Distribution & integration modes

This repo **is itself an Agent Skill** — `SKILL.md` lives at the repository root (the
canonical single-skill layout). Drop the repo into an agent's skills directory
(`.claude/skills/justtrustme/`, `~/.claude/skills/`, or a zipped upload) and the root
`SKILL.md` is discovered directly. It is **also** packaged as a Claude Code plugin
(`plugin.json` + `.claude-plugin/marketplace.json`) so it can be installed with
`/plugin marketplace add android-security-engineer/JustTrustMe-skills` → `/plugin install`.
AI interacts with the tool one way:

| Mode | Entry Point | What the Agent runs |
|------|------------|---------------------|
| **Skill** (root `SKILL.md`) | Discovered when this repo is in a skills dir | `scripts/build-apk.sh`, `scripts/check-framework.sh`, `scripts/verify-hooks.sh`, then adb + the on-device modules manager |
| **Plugin** | `/plugin marketplace add ...` → `/plugin install` | Same scripts, plus the root `SKILL.md` as instructions |

## Key files

- `app/src/main/java/just/trust/me/Main.java` — **the entire module** (all hooks + trust-all
  helpers). Read this before modifying behavior.
- `app/src/main/assets/xposed_init` — one line: `just.trust.me.Main` (Xposed entrypoint).
- `app/src/main/AndroidManifest.xml` — `xposedmodule=true`, `xposedminversion=30` meta-data.
- `app/build.gradle` — `compileSdk 33` / `minSdk 16` / `targetSdk 33`, AGP 7.4.x.
- `scripts/` — build / framework-check / verify scripts (the Agent-facing surface).
- `references/` — hook-coverage and environment reference docs.
- `plugin.json`, `.claude-plugin/` — plugin/skills-package manifests.

## Build

Requires Android SDK (compileSdk 33 platform + build-tools), **JDK 17** (Gradle 7.5.x does
not support JDK 21 class files), and network to Google Maven on first build (or a populated
`~/.gradle` cache + `--offline`):

```bash
ANDROID_HOME=$HOME/Android/Sdk ./scripts/build-apk.sh          # offline-friendly
# or directly:
ANDROID_HOME=$HOME/Android/Sdk ./gradlew -p . assembleRelease  # -> app/build/outputs/apk/release/JustTrustMe.apk
```

- Build toolchain: AGP 7.4.2 + Gradle 7.5.1 (see `gradle/wrapper/gradle-wrapper.properties`).
  If the wrapper download is blocked, `scripts/build-apk.sh` falls back to a locally-cached
  Gradle 7.5.x binary (or `$GRADLE_BIN`).

- `compileSdkVersion 33`, `targetSdkVersion 33`, `minSdkVersion 16`.
- The Xposed API is `compileOnly` from `app/libs/XposedBridgeApi.jar` — provided by the
  framework at runtime, never bundled.
- Release is `minifyEnabled false` and **unsigned** by default — fine for Xposed module
  sideloading; do not promise Play-Store-grade signing here.
- Module must be **enabled in the framework's modules manager and the device rebooted** to
  take effect. Hooks only load into a target app after that. This repo has no test suite
  beyond the empty `ApplicationTest` stub; verification is on-device via `logcat`.

## The mental model (two processes)

1. **The framework process** — LSPosed/EdXposed/Xposed injects `Main.handleLoadPackage`
   into every newly started app (and system processes if scoped there). Hook installation
   runs *in the target app's own process/classloader*, which is why every
   `findAndHookMethod` passes `lpparam.classLoader`.
2. **The target app process** — this module has no UI and no state of its own. Its only
   observable output is `Log.d(TAG, ...)` lines (`TAG = "JustTrustMe"`) written into the
   target's logcat stream. Hooks are global by design: whatever app the module is scoped to,
   validation is disabled inside it.

## Changing the hooks

To add a new hook target (e.g. another TLS library):
1. Read `Main.java` and follow its exact pattern — `findAndHookMethod("cls", classLoader,
   "method", args..., XC_MethodReplacement/XC_MethodHook)`, wrapped in a `try/catch` for
   `ClassNotFoundException` / `NoSuchMethodError` (missing classes are the norm, not the
   error path).
2. Keep `Log.d(TAG, "Hooking ... for: " + currentPackageName)` per target — the log lines
   are the module's only diagnostics and the skill's verification relies on them.
3. For libraries loaded late, extend `Application.attach` → `processXxx(classLoader)` and
   gate on `classLoader.loadClass(...)`.
4. Update `references/hook-coverage.md` so the Agent-facing docs match reality.
