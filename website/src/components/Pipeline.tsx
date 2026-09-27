import { motion } from 'framer-motion'
import { pipeline } from '../content'

export default function Pipeline() {
  return (
    <section className="section pipeline" id="how">
      <motion.span
        className="eyebrow"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
      >
        HOW · 解决思路
      </motion.span>
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7 }}
      >
        一次注入，<span className="grad">五个动作</span>让校验全部哑火
      </motion.h2>
      <motion.p
        className="section-lede"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15, duration: 0.7 }}
      >
        JustTrustMe 不是"改 App 代码"，而是由 Xposed 框架在目标 App 自己的进程里挂载 Hook：
        你不动一行业务代码，它替你改完所有校验逻辑。
      </motion.p>

      <div className="pipeline">
        <motion.div
          className="pipeline-track"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            className="pipeline-fill"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
          />
        </motion.div>

        <div className="pipeline-steps">
          {pipeline.map((s, i) => (
            <motion.div
              key={s.step}
              className="pipeline-step"
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.55, delay: i * 0.18 + 0.3 }}
            >
              <span className="pnum">{s.step}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
