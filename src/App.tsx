import { MotionConfig } from 'motion/react'
import { BookingProvider } from './components/booking/BookingDialog'
import { Capabilities } from './sections/Capabilities'
import { Challenge } from './sections/Challenge'
import { ClosingCta } from './sections/ClosingCta'
import { EnterpriseScale } from './sections/EnterpriseScale'
import { Footer } from './sections/Footer'
import { GateWay } from './sections/GateWay'
import { Governance } from './sections/Governance'
import { Header } from './sections/Header'
import { Hero } from './sections/Hero'
import { Introducing } from './sections/Introducing'
import { Platform } from './sections/Platform'
import { Value } from './sections/Value'
import { WhyPrism } from './sections/WhyPrism'

/*
  Narrative order from the brief: attention → problem → positioning →
  product experience → differentiation → capabilities → governance →
  agentic control → business value → enterprise trust → conversion.
*/
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BookingProvider>
        <a
          href="#main"
          className="sr-only z-[60] rounded-lg bg-fog-50 px-4 py-3 text-sm font-medium text-ink-900 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="outline-none">
          <Hero />
          <Challenge />
          <Introducing />
          <Platform />
          <WhyPrism />
          <Capabilities />
          <Governance />
          <GateWay />
          <Value />
          <EnterpriseScale />
          <ClosingCta />
        </main>
        <Footer />
      </BookingProvider>
    </MotionConfig>
  )
}
