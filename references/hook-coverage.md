# JustTrustMe hook coverage

Source of truth: `app/src/main/java/just/trust/me/Main.java`. Everything the module hooks,
per library and per Android behavior, plus known limits.

## Hook table

| # | Target | Hook | Result |
|---|--------|------|--------|
| 1 | `org.apache.http.impl.client.DefaultHttpClient` ctors | replace `connManager` with trust-all `SingleClientConnManager` / `ThreadSafeClientConnManager` | Apache `DefaultHttpClient` accepts any server cert |
| 2 | `org.apache.http.conn.ssl.SSLSocketFactory(String, KeyStore, String, KeyStore, SecureRandom, HostNameResolver)` | re-init `SSLContext` with trust-all `TrustManager` | Apache SSL sockets trust anything |
| 3 | `org.apache.http.conn.ssl.SSLSocketFactory.getSocketFactory` (static) | replace with `new SSLSocketFactory()` | default Apache factory trusts anything |
| 4 | `org.apache.http.conn.ssl.SSLSocketFactory.isSecure(Socket)` | `DO_NOTHING` | no secure-check |
| 5 | `javax.net.ssl.TrustManagerFactory.getTrustManagers()` | return `[ImSureItsLegitTrustManager]` (unless conscrypt `TrustManagerImpl` is first) | default trust manager is trust-all |
| 6 | `javax.net.ssl.HttpsURLConnection.setDefaultHostnameVerifier` | `DO_NOTHING` | apps can't restrict verifier |
| 7 | `javax.net.ssl.HttpsURLConnection.setSSLSocketFactory` | `DO_NOTHING` | apps can't restrict socket factory |
| 8 | `javax.net.ssl.HttpsURLConnection.setHostnameVerifier` | `DO_NOTHING` | apps can't restrict verifier |
| 9 | `android.webkit.WebViewClient.onReceivedSslError(WebView, SslErrorHandler, SslError)` | replace → `handler.proceed()` | WebView SSL errors auto-accepted |
| 10 | `android.webkit.WebViewClient.onReceivedError(WebView, int, String, String)` | `DO_NOTHING` | WebView load errors suppressed |
| 11 | `javax.net.ssl.SSLContext.init(KeyManager[], TrustManager[], SecureRandom)` | force args → `(null, [trust-all], null)` | any `SSLContext` gets a trust-all manager |
| 12 | `android.security.net.config.NetworkSecurityTrustManager.checkPins(List)` | `DO_NOTHING` | network_security_config pinning bypassed |
| 13 | `com.android.org.conscrypt.TrustManagerImpl.checkServerTrusted(X509Certificate[], String)` | replace → `0` | conscrypt chain check bypassed (Android N+) |
| 14 | `com.android.org.conscrypt.TrustManagerImpl.checkServerTrusted(X509Certificate[], String, String)` | replace → empty list | conscrypt + host check bypassed (Android N+) |
| 15 | `com.android.org.conscrypt.TrustManagerImpl.checkServerTrusted(X509Certificate[], String, SSLSession)` | replace → empty list | conscrypt + session check bypassed (Android N+) |
| 16 | `com.android.org.conscrypt.TrustManagerImpl.checkTrusted(X509Certificate[], String, SSLSession, SSLParameters, boolean)` | replace → empty list | newer conscrypt path bypassed |
| 17 | `com.android.org.conscrypt.TrustManagerImpl.checkTrusted(X509Certificate[], byte[], byte[], String, String, boolean)` | replace → empty list | newest conscrypt path bypassed |
| 18 | `com.squareup.okhttp.CertificatePinner.check(String, List)` | replace → `true` | OkHttp 2.x pinning bypassed |
| 19 | `okhttp3.CertificatePinner.check(String, List)` | `DO_NOTHING` | OkHttp 3.x pinning bypassed |
| 20 | `okhttp3.CertificatePinner.check$okhttp(String, Function0)` | `DO_NOTHING` | OkHttp 4.2.0+ pinning bypassed |
| 21 | `okhttp3.internal.tls.OkHostnameVerifier.verify(String, SSLSession)` | replace → `true` | OkHttp 3.x hostname bypassed |
| 22 | `okhttp3.internal.tls.OkHostnameVerifier.verify(String, X509Certificate)` | replace → `true` | OkHttp 3.x hostname bypassed (alt) |
| 23 | `org.xutils.http.RequestParams.setSslSocketFactory` | force `getEmptySSLFactory()` | xUtils3 trust-all |
| 24 | `org.xutils.http.RequestParams.setHostnameVerifier` | force `ImSureItsLegitHostnameVerifier` | xUtils3 verifier trusts all |
| 25 | `ch.boye.httpclientandroidlib.conn.ssl.AbstractVerifier.verify(...)` | `DO_NOTHING` | httpclientandroidlib bypassed |

Hooks 13–17 run only when `hasTrustManagerImpl()` — i.e. `com.android.org.conscrypt.
TrustManagerImpl` exists on the device (Android N and up). Hooks 18–25 install lazily from
`Application.attach` and require the target's classloader to have the library.

## Behavior notes

- **Global by design.** No package filter: every app the framework loads the module into is
  affected. Scope the module in LSPosed to just the target app(s) to avoid side effects.
- **Per-SDK trust manager selection** (`getTrustManager()`): on Android N+ it returns
  `X509ExtendedTrustManager` (`ImSureItsLegitExtendedTrustManager`), otherwise plain
  `X509TrustManager` (`ImSureItsLegitTrustManager`).
- **Hostname verifier** (`ImSureItsLegitHostnameVerifier`) always returns `true`.
- **`NetworkSecurityTrustManager.checkPins`** is hooked via the string class name and
  `DO_NOTHING`; it bypasses certificate pinning from `android:networkSecurityConfig`, not
  the cleartext/user-CA policy.

## Known limits

1. **Statically-linked TLS stacks** (Flutter/Dart `dart:io`, Unity/IL2CPP with bundled
   openssl, some games) run their own TLS and never touch the hooked Java/`TrustManager`
   entry points — the module cannot see or bypass them.
2. **Non-Java HTTP clients** (curl builds, gRPC with custom roots, Rust/Go TLS) are outside
   the hook surface.
3. **The proxy handshake itself** still follows Android's cleartext/user-CA policy. If the
   device won't trust your Burp/mitmproxy CA for the *initial* proxy connection, install the
   proxy's CA into the device user store (or accept it in the app's
   `network_security_config`) — `checkPins` does not help there.
4. **Pinning in a separate native module** (e.g. OpenSSL pinning callbacks compiled into
   the app) is not covered by these Java hooks.
5. Hooks are keyed to classloader availability: a "not found — not hooking" log line means
   the target genuinely lacks that library, not that the hook failed.

## What to try when a target still resists

- Confirm the module is enabled for the app + device rebooted (hooks don't load mid-process).
- Confirm the app's `logcat` actually shows `Hooking ... for: <pkg>` for the library you
  expect. If the app uses a library not in the table above, this module can't help — switch
  to a Frida-based approach (see the `frida-skills` repo in the same organization).
- For a Flutter app, a Frida `SSL_read`/`SSL_write` hook (like `r0capture`'s `script.js`) is
  the reliable path; this module is a blunt Java-layer tool.
