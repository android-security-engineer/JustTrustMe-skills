# JustTrustMe

> [English](README.md) · **简体中文**

> **技能仓库**：本仓库在原始 JustTrustMe 工程之上叠加了 AI Agent 可接入的 Skill 层（`SKILL.md`、`CLAUDE.md`、`plugin.json`、`.claude-plugin/`）。Agent（Claude Code、Codex 等）安装本技能后即可一键跑通完整闭环：构建 APK、检测设备框架、安装启用模块、验证 Hook 是否生效。
>
> - 人类使用者 / 原始工程文档：见下文。
> - **AI Agent 接入**：先读仓库根目录的 `SKILL.md`（四步快速路径）。`references/` 是 Hook 覆盖矩阵与环境说明，`scripts/` 是可执行脚本（`build-apk.sh` / `check-framework.sh` / `verify-hooks.sh`）。
> - **安装本技能**：将本仓库作为 Claude Code 插件市场的来源（`.claude-plugin/marketplace.json`），或直接把仓库目录挂载为技能目录。
> - **产品官网**：`website/` 下是 React + TypeScript + Three.js 构建的产品官网（含可交互的 3D 首页演示，以及"问题 / 原理 / 覆盖 / 效果"四段式叙事）。本地预览：`cd website && npm install && npm run dev`；构建产物：`cd website && npm run build`。

## 它是什么

一个禁用 SSL 证书校验的 Xposed 模块。在做授权安全测试、审计做过证书固定（certificate pinning）的应用时非常有用。@moxie 也提供了一个很好的框架来帮你的应用做证书固定：[certificate pinning](https://github.com/moxie0/AndroidPinning)。

一个做了证书固定的典型例子是 [Twitter](https://play.google.com/store/apps/details?id=com.twitter.android)。如果你想查看这个应用的网络流量，就必须先禁用它的证书固定。

我选择 Xposed 而不是 Cydia Substrate，是因为 Xposed 对较新设备的支持更好。Marc Blanchou 用 Cydia Substrate 写了[原始工具](https://github.com/iSECPartners/Android-SSL-TrustKiller)。如果你发现自己无法对某个应用进行中间人（MITM）抓包，请提交 issue。

## 硬性前提

JustTrustMe **不是命令行工具，也不是普通应用**。它是一个 Xposed 模块：必须安装到设备上、在兼容的框架里启用，然后被*注入目标应用自身的进程*才能禁用其 SSL 校验。在承诺任何结果之前，请先逐一核实下面四个前提：

| 前提 | 为什么 | 怎么检查 |
|---|---|---|
| 已 root 的设备 | Xposed 框架在 zygote 层注入 → 需要系统级权限 | `adb shell id` → `uid=0` |
| 已安装兼容的 Xposed 框架 | 必须有人负责加载模块：LSPosed（现代）、EdXposed（较老）、经典 Xposed Installer（Android < 7） | `scripts/check-framework.sh` |
| 在管理器里启用模块 + 重启 | Hook 在应用进程启动时加载，框架会缓存模块状态 | 在管理器里启用，然后 `adb reboot` |
| 在管理器里勾选目标应用 | 模块只影响框架注入的应用 | LSPosed → 模块 → 勾选 JustTrustMe → 勾选目标应用 |

## 安装

前提：设备必须已 root，且已安装 Xposed 框架。你可以从[这里](http://repo.xposed.info/module/de.robv.android.xposed.installer)下载 Xposed 框架。

### 从二进制安装

可以从 [https://github.com/Fuzion24/JustTrustMe/releases/latest](https://github.com/Fuzion24/JustTrustMe/releases/latest) 下载 JustTrustMe 二进制包

```
adb install ./JustTrustMe.apk
```

或者直接打开下面的链接，在手机上把 APK 下载下来：
[https://github.com/Fuzion24/JustTrustMe/releases/latest](https://github.com/Fuzion24/JustTrustMe/releases/latest)

### 从源码构建

所有常规 Gradle 构建命令都适用。构建 release APK：

```
./gradlew assembleRelease
```

直接安装到通过 ADB 连接的手机：

```
./gradlew installRelease
```

## 模块挂钩（Hook）了什么

`just.trust.me.Main` 在以下面面上安装了信任一切的 Hook（完整矩阵见 `references/hook-coverage.md`）：

| 覆盖面 | 结果 |
|---|---|
| Apache HttpClient（`DefaultHttpClient` 构造器、`SSLSocketFactory`、`isSecure`） | 基于 Apache 的应用接受任意证书 |
| JSSE（`TrustManagerFactory`、`HttpsURLConnection`、`SSLContext.init`） | `HttpsURLConnection` / 原生 JSSE 接受一切 |
| WebView（`onReceivedSslError` → `proceed()`） | WebView 页面在 SSL 错误时继续加载 |
| Conscrypt `TrustManagerImpl`（Android N+） | 原生 conscrypt 链校验被绕过 |
| OkHttp 2.x / 3.x / 4.2.0+（`CertificatePinner`、`OkHostnameVerifier`） | 证书固定 + 主机名校验被绕过 |
| xUtils3 / httpclientandroidlib | 信任一切的 Socket 工厂 + 主机名校验器 |
| Android Network Security Config（`checkPins`） | `network_security_config` 的固定被绕过 |

## 许可证

Apache-2.0（见 `License.md`）。上游：
[Fuzion24/JustTrustMe](https://github.com/Fuzion24/JustTrustMe)。
