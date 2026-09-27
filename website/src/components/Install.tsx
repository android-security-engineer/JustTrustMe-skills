import { useState } from 'react'
import { motion } from 'framer-motion'
import { steps, limits, prereqs } from '../content'

export default function Install() {
  const [copied, setCopied] = useState<number | null>(null)

  const copy = (i: number, cmd: string) => {
    navigator.clipboard?.writeText(cmd).catch(() => {})
    setCopied(i)
    window.setTimeout(() => setCopied(null), 1600)
  }

  return (
    <section className="section" id="install">
      <motion.span
        className="eyebrow"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
      >
        INSTALL · 30 秒上手
      </motion.span>
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7 }}
      >
        五步，<span className="grad">让校验闭嘴</span>
      </motion.h2>
      <motion.p
        className="section-lede"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15, duration: 0.7 }}
      >
        以下是硬性前提 —— 缺任何一项，模块都无法加载。核对了再动手。
      </motion.p>

      {/* 前置条件 */}
      <div className="prereq-grid">
        {prereqs.map((p, i) => (
          <motion.div
            key={p.title}
            className="prereq-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, delay: i * 0.12 }}
          >
            <span className="p-icon">{p.icon}</span>
            <h3>{p.title}</h3>
            <p>{p.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* 安装步骤 */}
      <div className="install-steps">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            className="istep"
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <span className="ino">{i + 1}</span>
            <div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <div className="codeblock">
                <code>{s.cmd}</code>
                <button
                  type="button"
                  className={`copylink${copied === i ? ' copied' : ''}`}
                  onClick={() => copy(i, s.cmd)}
                >
                  {copied === i ? '已复制 ✓' : '复制'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 局限 */}
      <motion.div
        className="limits"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7 }}
      >
        <h4>⚠ 边界与注意事项</h4>
        <ul>
          {limits.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </motion.div>
    </section>
  )
}
