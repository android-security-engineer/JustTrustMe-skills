import { motion } from 'framer-motion'
import HeroScene from './HeroScene'
import { stats } from '../content'

const fadeUp = {
  hidden: { opacity: 0, y: 34 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.14, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export default function Hero() {
  return (
    <header className="hero">
      <div className="hero-scene">
        <HeroScene />
      </div>

      <div className="hero-text">
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <span className="live" />
          Xposed 模块 · LSPosed / EdXposed 兼容 · 无需目标 App 改动
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
        >
          让 Android 的
          <br />
          <span className="grad">SSL 校验失效</span>
        </motion.h1>

        <motion.p className="hero-sub" variants={fadeUp} initial="hidden" animate="visible" custom={1}>
          JustTrustMe 是一个面向<b>授权安全测试</b>的 Xposed 模块。装上它，目标 App 的
          证书校验、主机名校验、证书固定（Pinning）全部放行 —— Burp / mitmproxy 即刻解出明文 HTTPS 流量。
        </motion.p>

        <motion.div className="hero-ctas" variants={fadeUp} initial="hidden" animate="visible" custom={2}>
          <a className="btn btn-primary" href="#install">
            立即上手
            <span aria-hidden>→</span>
          </a>
          <a className="btn btn-ghost" href="#problems">
            它解决了什么
          </a>
        </motion.div>

        <motion.p className="hero-note" variants={fadeUp} initial="hidden" animate="visible" custom={3}>
          25+ 个 Hook 点 · 8 大网络栈 · 全局只影响你勾选作用域的 App
        </motion.p>
      </div>

      <div className="scroll-hint">
        <span className="mouse" />
        滚动查看
      </div>

      <motion.div
        className="hero-stats"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9 }}
      >
        {stats.map((s) => (
          <div key={s.label}>
            <div className="num grad">{s.value}</div>
            <div className="lbl">{s.label}</div>
          </div>
        ))}
      </motion.div>
    </header>
  )
}
