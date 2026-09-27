import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { stats } from '../content'

type Stage = 'blocked' | 'bypassed'

export default function Verify() {
  const [stage, setStage] = useState<Stage>('blocked')

  const links = useMemo(
    () =>
      ['a-b', 'b-c', 'c-d', 'd-e'].map((id, i) => ({
        id,
        left: 14 + i * 18.4, // %
        width: 17.6, // %
      })),
    [],
  )

  // 只在 bypassed 阶段出现一个"明文"浮动标签
  const [showPlain, setShowPlain] = useState(false)
  useEffect(() => {
    if (stage === 'bypassed') {
      const t = setTimeout(() => setShowPlain(true), 1400)
      return () => clearTimeout(t)
    }
    setShowPlain(false)
  }, [stage])

  return (
    <section className="section" id="effect">
      <motion.span
        className="eyebrow"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
      >
        EFFECT · 解决得怎么样
      </motion.span>
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7 }}
      >
        一个开关，<span className="grad">流量从拒绝到放行</span>
      </motion.h2>
      <motion.p
        className="section-lede"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15, duration: 0.7 }}
      >
        同一个 MITM 链路，装了 JustTrustMe 前后分别是两副面孔。点一下按钮，看看代理眼里发生了什么。
      </motion.p>

      <motion.div
        className="verify-stage"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
      >
        <div className="stage-head">
          <span className={`stage-status ${stage === 'blocked' ? 'bad' : 'good'}`}>
            {stage === 'blocked' ? '● 未装模块 —— 握手被拒' : '● 已装模块 —— 明文直出'}
          </span>
          <button
            type="button"
            className="verify-toggle"
            onClick={() => setStage(stage === 'blocked' ? 'bypassed' : 'blocked')}
          >
            {stage === 'blocked' ? '装上 JustTrustMe →' : '← 回到拦截'}
          </button>
        </div>

        <div className="verify-topo">
          {/* 节点 */}
          <div className="vnode" style={{ left: '0%' }}>
            <span className="vico">📱</span>
            <span className="vlabel">目标 App</span>
            <span className="vsub">Android</span>
          </div>
          <div className="vnode" style={{ left: '27%' }}>
            <span className="vico">📡</span>
            <span className="vlabel">MITM 代理</span>
            <span className="vsub">Burp / mitmproxy</span>
          </div>
          <div className="vnode" style={{ left: '54%' }}>
            <span className="vico">🔀</span>
            <span className="vlabel">证书校验</span>
            <span className="vsub">TrustManager</span>
          </div>
          <div className="vnode" style={{ left: '81%' }}>
            <span className="vico">🖥️</span>
            <span className="vlabel">服务器</span>
            <span className="vsub">HTTPS</span>
          </div>

          {/* 连接线 */}
          {links.map((l) => (
            <div
              key={l.id}
              className={`vlink ${stage === 'blocked' ? 'bad' : 'good'}`}
              style={{
                top: 118,
                left: `${l.left}%`,
                width: `${l.width}%`,
                transition: 'background 0.5s, box-shadow 0.5s',
              }}
            />
          ))}

          {/* 数据包动画：blocked 时红灯撞墙 */}
          {links.map((l, i) => (
            <motion.div
              key={`p-${l.id}`}
              className={`vpacket ${stage === 'blocked' ? 'bad' : 'good'}`}
              style={{ top: 109 }}
              animate={
                stage === 'blocked'
                  ? {
                      left: ['9%', '44%'],
                      scale: [1, 1, 1.25],
                    }
                  : {
                      left: ['9%', '88%'],
                      scale: [1, 1, 1],
                    }
              }
              transition={{
                left: {
                  duration: stage === 'blocked' ? 1.1 : 1.9,
                  repeat: Infinity,
                  repeatDelay: stage === 'blocked' ? 0.4 : 0.2,
                  ease: 'easeInOut',
                },
                scale: {
                  duration: 0.35,
                  repeat: Infinity,
                  repeatDelay: stage === 'blocked' ? 1.15 : 0,
                  times: [0, 0.8, 1],
                  delay: i * 0.12,
                },
              }}
            />
          ))}

          {/* 拦截提示 */}
          {stage === 'blocked' && (
            <motion.div
              className="vfail"
              style={{ left: '50.5%', top: 6 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              ⛔ SSLHandshakeException
              <br />
              Certificate pinning failure
            </motion.div>
          )}

          {/* 明文标签 */}
          {stage === 'bypassed' && showPlain && (
            <motion.div
              className="vplain"
              style={{ left: '45%', top: 6 }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              🔓 明文流量直接读出：
              <br />
              <b>POST /api/login 200 · user=cc11001100 · token=…</b>
            </motion.div>
          )}
        </div>

        {/* 伪日志 */}
        <motion.div
          className="verify-lines"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <AnimateLines stage={stage} />
        </motion.div>
      </motion.div>

      <motion.div
        className="prereq-grid"
        initial={{ opacity: 0, y: 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
      >
        {stats.map((s) => (
          <div key={s.label} style={{ textAlign: 'center', padding: '8px' }}>
            <div className="num grad" style={{ fontSize: 44, fontWeight: 800 }}>
              {s.value}
            </div>
            <div className="lbl" style={{ color: 'var(--text-dim)', fontSize: 14 }}>
              {s.label}
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  )
}

function AnimateLines({ stage }: { stage: Stage }) {
  const lines = [
    {
      stage: 'blocked',
      text: '[1]  client → server :  ClientHello',
      cls: 'vline-dim',
    },
    {
      stage: 'blocked',
      text: '[2]  server → client :  ServerHello + ✗ CA 不被信任',
      cls: 'vline-bad',
    },
    {
      stage: 'blocked',
      text: '[3]  client :  SSLHandshakeException · 连接被杀死',
      cls: 'vline-bad',
    },
    {
      stage: 'blocked',
      text: '[4]  proxy   :  无法解密 —— 没有流量可看',
      cls: 'vline-dim',
    },
    {
      stage: 'bypassed',
      text: '[1]  client → server :  ClientHello',
      cls: 'vline-dim',
    },
    {
      stage: 'bypassed',
      text: '[2]  server → client :  ServerHello + MITM 证书',
      cls: 'vline-dim',
    },
    {
      stage: 'bypassed',
      text: '[3]  JustTrustMe :  checkServerTrusted → 直接返回（放行）',
      cls: 'vline-good',
    },
    {
      stage: 'bypassed',
      text: '[4]  proxy   :  解密成功 → 明文出现在 Burp 里',
      cls: 'vline-good',
    },
  ].filter((l) => l.stage === stage)

  return (
    <div>
      {lines.map((l, i) => (
        <motion.div
          key={`${stage}-${i}`}
          className={l.cls}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.25, duration: 0.35 }}
        >
          {l.text}
        </motion.div>
      ))}
    </div>
  )
}
