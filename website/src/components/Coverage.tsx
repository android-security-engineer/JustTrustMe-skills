import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { coverageRows } from '../content'

export default function Coverage() {
  const [active, setActive] = useState(0)
  const row = coverageRows[active]

  return (
    <section className="section" id="coverage">
      <motion.span
        className="eyebrow"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
      >
        COVERAGE · 覆盖面
      </motion.span>
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7 }}
      >
        <span className="grad">8 大网络栈</span>，一点接入
      </motion.h2>
      <motion.p
        className="section-lede"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15, duration: 0.7 }}
      >
        点击左侧任一行，右侧会展开它替换掉的校验点 —— 全部来自仓库内真实的 hook 声明
        （app/src/main/java/just/trust/me/Main.java）。第三方库在 Application.attach 后按需懒加载。
      </motion.p>

      <div className="coverage">
        <div>
          {coverageRows.map((c, i) => (
            <motion.button
              key={c.lib}
              type="button"
              className={`coverage-row${i === active ? ' active' : ''}`}
              onClick={() => setActive(i)}
              initial={{ opacity: 0, x: -26 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
            >
              <span className="crow-top">
                <span className="cicon">{c.icon}</span>
                <span className="cname">{c.lib}</span>
                <span className="caret">▼</span>
              </span>
              <span className="cnote">{c.note}</span>
              <AnimatePresence initial={false}>
                {i === active && (
                  <motion.span
                    className="cdetail"
                    key="d"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: 'block' }}
                  >
                    <ul>
                      {c.targets.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        <div className="coverage-panel">
          <AnimatePresence mode="wait">
            <motion.div
              key={row.lib}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25 }}
            >
              <div className="cp-lib">
                <span>{row.icon}</span>
                {row.lib}
              </div>
              <p className="cp-note">{row.note}</p>
              <div className="cp-targets">
                {row.targets.map((t) => (
                  <motion.div
                    key={t}
                    className="cp-target"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.08 }}
                  >
                    {t}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
          <p className="cp-foot">
            25+ hook 点 · 目标库缺失时静默跳过（ClassNotFoundException 是常态，不是错误路径）
          </p>
        </div>
      </div>
    </section>
  )
}
