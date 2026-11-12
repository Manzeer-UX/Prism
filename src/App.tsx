import { MotionConfig } from 'motion/react'
import { Capabilities } from './sections/Capabilities'
import { ClosingCta } from './sections/ClosingCta'
import { EnterpriseScale } from './sections/EnterpriseScale'
import { Footer } from './sections/Footer'
import { Header } from './sections/Header'
import { Hero } from './sections/Hero'
import { Platform } from './sections/Platform'
import { Statement } from './sections/Statement'
import { Value } from './sections/Value'
import { WhyPrism } from './sections/WhyPrism'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only z-[60] rounded-lg bg-fog-50 px-4 py-3 text-sm font-medium text-ink-900 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Statement />
        <Platform />
        <WhyPrism />
        <Capabilities />
        <Value />
        <EnterpriseScale />
        <ClosingCta />
      </main>
      <Footer />
    </MotionConfig>
  )
}
