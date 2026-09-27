import { useEffect, useState } from 'react'
import Hero from './components/Hero'
import Problems from './components/Problems'
import Pipeline from './components/Pipeline'
import Coverage from './components/Coverage'
import Verify from './components/Verify'
import Install from './components/Install'
import Footer from './components/Footer'

export default function App() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="#top" className="nav-logo">
            <span className="dot" />
            JustTrustMe
          </a>
          <div className="nav-links">
            <a href="#problems">问题</a>
            <a href="#how">原理</a>
            <a href="#coverage">覆盖</a>
            <a href="#effect">效果</a>
            <a href="#install" className="nav-cta">
              安装
            </a>
          </div>
        </div>
      </nav>

      <main id="top">
        <Hero />
        <Problems />
        <Pipeline />
        <Coverage />
        <Verify />
        <Install />
      </main>

      <Footer />
    </>
  )
}
