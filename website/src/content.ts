// 官网文案与数据 —— 全部基于本仓库真实实现（app/src/main/java/just/trust/me/Main.java）

export interface CoverageRow {
  lib: string
  icon: string
  targets: string[]
  note: string
}

export const coverageRows: CoverageRow[] = [
  {
    lib: 'Apache HttpClient',
    icon: '🐍',
    targets: ['DefaultHttpClient 构造', 'SSLSocketFactory', 'isSecure 校验'],
    note: '构造时替换为 trust-all ClientConnectionManager',
  },
  {
    lib: 'JSSE · HttpsURLConnection / SSLContext',
    icon: '🔗',
    targets: ['TrustManagerFactory', 'SSLContext.init', 'HostnameVerifier'],
    note: 'TrustManager 全部放行任意证书',
  },
  {
    lib: 'Android WebView',
    icon: '🌐',
    targets: ['onReceivedSslError', 'onReceivedError'],
    note: '证书错误自动 proceed()，页面不中断',
  },
  {
    lib: 'Conscrypt · TrustManagerImpl（Android N+）',
    icon: '🛡️',
    targets: ['checkServerTrusted ×3', 'checkTrusted ×2'],
    note: '原生证书链校验直接绕过',
  },
  {
    lib: 'OkHttp 2.x / 3.x / 4.2.0+',
    icon: '📦',
    targets: ['CertificatePinner.check', 'OkHostnameVerifier.verify'],
    note: '证书固定与主机名校验同时失效',
  },
  {
    lib: 'xUtils3',
    icon: '🧩',
    targets: ['setSslSocketFactory', 'setHostnameVerifier'],
    note: 'trust-all 一把梭',
  },
  {
    lib: 'httpclientandroidlib',
    icon: '📚',
    targets: ['AbstractVerifier.verify'],
    note: 'ch.boye.* 旧库照单全收',
  },
  {
    lib: 'Android network security config',
    icon: '⚙️',
    targets: ['NetworkSecurityTrustManager.checkPins'],
    note: '绕过 network_security_config 的 pin 配置',
  },
]

export const stats = [
  { value: '25+', label: 'Hook 点' },
  { value: '8', label: '大网络栈覆盖' },
  { value: '16', label: 'minSdk（Android 4.1+）' },
  { value: '0', label: '目标 App 需改代码' },
]

export const problems = [
  {
    icon: '🔒',
    title: '握手即被拒',
    desc: 'MITM 代理一替换证书，App 立刻抛 SSLHandshakeException，流量连建联都过不去。',
    tag: '证书校验',
  },
  {
    icon: '📌',
    title: '证书固定（Pinning）',
    desc: 'OkHttp / 自定义 TrustManager 把公钥钉死在代码里，抓包工具一上就崩。',
    tag: 'Certificate Pinning',
  },
  {
    icon: '🌐',
    title: 'WebView 拦路',
    desc: 'onReceivedSslError 弹窗 / 中断，H5 混合内容页面直接卡死在安全错误上。',
    tag: 'SSL 错误处理',
  },
  {
    icon: '🧩',
    title: '网络栈五花八门',
    desc: 'Apache / JSSE / Conscrypt / xUtils3 / httpclientandroidlib… 每换一个库就要换一套绕过姿势。',
    tag: '碎片化生态',
  },
]

export const pipeline = [
  { step: '01', title: '注入', desc: 'LSPosed / EdXposed 在目标 App 进程启动时，把模块注入它的 classloader' },
  { step: '02', title: '拦截', desc: 'handleLoadPackage 按库逐个挂上 25+ 个 hook，覆盖 8 大校验入口' },
  { step: '03', title: '替换', desc: '证书校验 / 主机名校验 / pinning 逻辑全部替换为 trust-all 实现' },
  { step: '04', title: '放行', desc: '任意证书、任意域名、任意错误 —— 全部放行，如同没有 TLS 校验' },
  { step: '05', title: '审计', desc: 'Burp / mitmproxy / Charles 成功解密并篡改全部 HTTPS 流量' },
]

export const prereqs = [
  { icon: '🤖', title: 'Root 设备', desc: 'Xposed 框架在 zygote 层注入，需要系统级权限。adb shell id 需返回 uid=0。' },
  { icon: '🧰', title: 'Xposed 兼容框架', desc: '首选 LSPosed（Zygisk / Riru），或 EdXposed、经典 Xposed Installer（Android < 7）。' },
  { icon: '🔄', title: '启用 + 重启', desc: '在框架管理器勾选 JustTrustMe、把目标 App 纳入作用域，然后重启设备。' },
]

export const steps = [
  {
    title: '构建 APK',
    cmd: 'ANDROID_HOME=$HOME/Android/Sdk ./scripts/build-apk.sh',
    desc: '需要 Android SDK（compileSdk 33）+ JDK 17。产物：app/build/outputs/apk/release/JustTrustMe.apk',
  },
  {
    title: '安装到设备',
    cmd: 'adb install -r app/build/outputs/apk/release/JustTrustMe.apk',
    desc: 'release 未签名即可，Xposed 模块侧载无需商店签名。',
  },
  {
    title: '启用并作用域',
    cmd: 'LSPosed → 模块 → 勾选 JustTrustMe → 勾选目标 App',
    desc: '只为你要审计的 App 开启，避免全局影响。',
  },
  {
    title: '重启设备',
    cmd: 'adb reboot',
    desc: '模块在应用进程启动时注入，必须重启（或强杀目标 App）才生效。',
  },
  {
    title: '验证 Hook 已生效',
    cmd: 'adb logcat -s JustTrustMe:D',
    desc: '目标 App 启动后应看到 Hooking ... for: <pkg> 日志；再用代理解密流量做端到端确认。',
  },
]

export const limits = [
  '自研 / 静态链接 TLS 栈（Flutter、部分游戏）不在 hook 覆盖内，模块对它们保持休眠。',
  '全局 hook：只管你勾选作用域的 App，不要把模块开给无关应用。',
  '本模块只解 SSL 校验，不绕过代理握手所需的 cleartext / user-CA 策略。',
  '仅用于授权测试。对未授权目标使用属违法行为，与项目无关。',
]

export const githubUrl = 'https://github.com/Fuzion24/JustTrustMe'
