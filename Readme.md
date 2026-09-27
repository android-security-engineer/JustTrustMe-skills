JustTrustMe
===========

> **Skills 仓库**:本仓库在原始 JustTrustMe 工程之上叠加了 Claude/Codex 等 AI Agent 可接入的 Skill 层（`SKILL.md` + `CLAUDE.md` + `plugin.json` + `.claude-plugin/`）。AI Agent 可通过 marketplace 安装本 skill 后，一键完成 APK 构建、框架检测、安装启用、hook 验证的完整闭环。
>
> - 人类使用者 / 原始工程文档:见下文。
> - **AI Agent 接入**:先读根目录 `SKILL.md`(quick path 四步)。`references/` 是工具覆盖矩阵与环境说明,`scripts/` 是可执行脚本(`build-apk.sh` / `check-framework.sh` / `verify-hooks.sh`)。
> - **安装本 skill**:将本仓库作为 Claude Code plugin marketplace 源(`.claude-plugin/marketplace.json`),或直接把仓库目录作为 skill 目录挂载。
> - **产品官网**:`website/` 下是 React + TypeScript + Three.js 构建的产品官网(hero 3D 演示、问题/原理/覆盖/效果四段叙事)。本地预览:`cd website && npm install && npm run dev`;构建产物 `cd website && npm run build`。

An xposed module that disables SSL certificate checking.  This is useful for auditing an application which does certificate pinning.  There also exists a nice framework built by @moxie to aid in pinning certs in your app: [certificate pinning](https://github.com/moxie0/AndroidPinning). 

An example of an application that does cert pinning is [Twitter](https://play.google.com/store/apps/details?id=com.twitter.android).  If you would like to view the network traffic for this application, you must disable the certificate pinning.

I built this for xposed rather than cydia substrate because xposed seems to support newer devices better. Marc Blanchou wrote the [original tool](https://github.com/iSECPartners/Android-SSL-TrustKiller) for cydia substrate.  If you find that you are not able to MITM an application please file an issue.

## Installation

As a prequsite, your device must be rooted and the xposed framework must be installed.
You can download the xposed framework [here](http://repo.xposed.info/module/de.robv.android.xposed.installer).

### Install from binary

The JustTrustMe binary can be downloaded from [https://github.com/Fuzion24/JustTrustMe/releases/latest](https://github.com/Fuzion24/JustTrustMe/releases/latest)

```
adb install ./JustTrustMe.apk
```

or navigate here and download the APK on your phone:
[https://github.com/Fuzion24/JustTrustMe/releases/latest](https://github.com/Fuzion24/JustTrustMe/releases/latest)


### Build from Source
All the normal gradle build commands apply:
To build a release APK:
```
./gradlew assembleRelease
```
To install directly to the phone connected via ADB:
```
./gradlew installRelease
```



