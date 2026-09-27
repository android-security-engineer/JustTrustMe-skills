import { motion } from 'framer-motion'
import { problems } from '../content'

const cardAnim = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export default function Problems() {
  return (
    <section className="section" id="problems">
      <motion.span
        className="eyebrow"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
      >
        PROBLEM · 场景还原
      </motion.span>
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7 }}
      >
        想审计 HTTPS，先被<em className="grad">四个拦路虎</em>卡住
      </motion.h2>
      <motion.p
        className="section-lede"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15, duration: 0.7 }}
      >
        测试人员架好代理、装好 CA，点开 App 的瞬间，安全机制就把它踹了出去。以下每一种，
        都是 JustTrustMe 日常处理的对象。
      </motion.p>

      <div className="problems-grid">
        {problems.map((p, i) => (
          <motion.article
            key={p.title}
            className="problem-card"
            variants={cardAnim}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            custom={i}
            whileHover={{ y: -4 }}
          >
            <span className="corner" />
            <span className="p-icon">{p.icon}</span>
            <h3>{p.title}</h3>
            <span className="tag">{p.tag}</span>
            <p>{p.desc}</p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
