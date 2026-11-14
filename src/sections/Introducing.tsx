import { ChartNoAxesColumnIncreasing, Layers, ShieldCheck, type LucideIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { ButtonLink } from '../components/ui/ButtonLink'
import { Reveal } from '../components/ui/Reveal'
import { cta, introducing, links } from '../content/prism'
import { EASE } from '../lib/motion'

/** Spectrum hue for each stage: the start, middle and end of the capability bands */
const STAGE_BAND = [2, 5, 8]

/** Observe: layered signals · Evaluate: rising measures · Govern: a checked shield */
const STAGE_ICON: LucideIcon[] = [Layers, ChartNoAxesColumnIncreasing, ShieldCheck]

/**
 * 03 · Introducing PRISM AI — one introductory section: the headline and the
 * platform explanation side by side, then a single panel that carries the
 * three stages (Observe → Evaluate → Govern, joined by a spectrum rule) and
 * closes on a dark banner with the nine-capability-groups line and both calls
 * to action.
 */
export function Introducing() {
  const reduced = useReducedMotion()
  const viewport = { once: true, margin: '0px 0px -15% 0px' } as const

  return (
    <section id="introducing" data-theme="light" aria-labelledby="introducing-title" className="relative bg-surface">
      <div className="shell section-pad">
        {/* Headline and platform explanation */}
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <Reveal>
              <p className="text-meta text-fg-3">{introducing.eyebrow}</p>
            </Reveal>
            <Reveal delay={0.05} blur>
              <h2 id="introducing-title" className="mt-4 max-w-[18ch] text-display-l text-fg">
                {introducing.title}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="max-w-[36rem] space-y-4 lg:col-span-6 lg:col-start-7 lg:pt-8">
            <p className="text-lead text-fg">{introducing.body[0]}</p>
            <p className="text-fg-2">{introducing.body[1]}</p>
          </Reveal>
        </div>

        {/* One panel: the three stages, then the capability banner */}
        <Reveal className="mt-14 overflow-hidden rounded-2xl border border-line-strong md:mt-20">
          <div className="relative">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-line" />
            <motion.div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[3px] origin-left"
              style={{ background: 'linear-gradient(to right, var(--band-2), var(--band-5), var(--band-8))' }}
              initial={reduced ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={viewport}
              transition={{ duration: 1.4, ease: EASE, delay: 0.1 }}
            />

            <ol className="grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
              {introducing.stages.map((stage, i) => {
                const Icon = STAGE_ICON[i]
                const band = `var(--band-${STAGE_BAND[i]})`
                return (
                  <motion.li
                    key={stage.id}
                    className="px-6 pt-8 pb-8 md:px-8 md:pt-10 md:pb-10 xl:px-10"
                    initial={reduced ? false : { opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={viewport}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.15 + i * 0.35 }}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        aria-hidden="true"
                        className="flex size-12 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `color-mix(in oklch, ${band} 12%, transparent)`, color: band }}
                      >
                        <Icon size={22} strokeWidth={1.75} />
                      </span>
                      <div>
                        <p className="text-meta text-fg-3">
                          <span className="sr-only">Stage </span>
                          {String(i + 1).padStart(2, '0')}
                        </p>
                        <h3 className="text-display-m text-fg">{stage.title}.</h3>
                      </div>
                    </div>
                    <p className="mt-5 max-w-[32ch] text-fg-2">{stage.body}</p>
                  </motion.li>
                )
              })}
            </ol>
          </div>

          <div
            data-theme="dark"
            className="relative isolate flex flex-col gap-8 overflow-hidden px-6 py-8 md:px-8 md:py-10 lg:flex-row lg:items-center lg:justify-between xl:px-10"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 grid-lines [mask-image:linear-gradient(to_right,#000,transparent_75%)] opacity-50"
            />
            <p className="max-w-[32ch] text-title text-fg">{introducing.summary}</p>
            <div className="flex flex-wrap gap-3 lg:shrink-0 lg:flex-nowrap">
              <ButtonLink href="#platform" arrow="forward">
                {cta.explorePlatform}
              </ButtonLink>
              <ButtonLink href={links.demo} variant="secondary" arrow="forward">
                {cta.watchDemo}
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
