import { motion, useReducedMotion } from 'motion/react'
import { ButtonLink } from '../components/ui/ButtonLink'
import { Reveal } from '../components/ui/Reveal'
import { cta, introducing, links } from '../content/prism'
import { EASE } from '../lib/motion'

/** Spectrum hue for each stage: the start, middle and end of the capability bands */
const STAGE_BAND = [2, 5, 8]

/**
 * 03 · Introducing PRISM AI — the product reveal just before the console.
 * Observe, Evaluate and Govern are drawn as three connected stages: a rule
 * runs between them and each node lights in turn as the row enters view.
 */
export function Introducing() {
  const reduced = useReducedMotion()
  const viewport = { once: true, margin: '0px 0px -20% 0px' } as const

  return (
    <section id="introducing" data-theme="light" aria-labelledby="introducing-title" className="relative bg-surface">
      <div className="shell section-pad">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="text-meta text-fg-3">{introducing.eyebrow}</p>
            </Reveal>
            <Reveal delay={0.05} blur>
              <h2 id="introducing-title" className="mt-4 max-w-[20ch] text-display-l text-fg">
                {introducing.title}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="space-y-4 lg:col-span-5 lg:self-end">
            {introducing.body.map((p, i) => (
              <p key={i} className={i === 0 ? 'text-lead text-fg' : 'text-fg-2'}>
                {p}
              </p>
            ))}
          </Reveal>
        </div>

        {/* Three connected stages */}
        <div className="relative mt-16 md:mt-24">
          {/* Connector: vertical on phones, horizontal from md */}
          <div aria-hidden="true" className="absolute top-2 bottom-2 left-[5px] w-px bg-line-strong md:hidden" />
          <div aria-hidden="true" className="absolute top-[5px] right-0 left-0 hidden h-px bg-line-strong md:block" />
          <motion.div
            aria-hidden="true"
            className="absolute top-[5px] right-[calc(33.333%-1.3333rem)] left-0 hidden h-px origin-left md:block"
            style={{
              background: 'linear-gradient(to right, var(--band-2), var(--band-5), var(--band-8))',
            }}
            initial={reduced ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={viewport}
            transition={{ duration: 1.4, ease: EASE, delay: 0.15 }}
          />

          <ol className="relative grid gap-12 md:grid-cols-3 md:gap-8">
            {introducing.stages.map((stage, i) => (
              <motion.li
                key={stage}
                className="relative pl-8 md:pl-0"
                initial={reduced ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ duration: 0.6, ease: EASE, delay: 0.15 + i * 0.45 }}
              >
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-0 block size-[11px] rounded-full ring-4 ring-(--surface)"
                  style={{ backgroundColor: `var(--band-${STAGE_BAND[i]})` }}
                />
                <p className="text-meta text-fg-3 md:pt-10">
                  <span className="sr-only">Stage </span>
                  {String(i + 1).padStart(2, '0')}
                </p>
                <p className="mt-3 text-display-xl text-fg">{stage}.</p>
              </motion.li>
            ))}
          </ol>
        </div>

        <Reveal className="mt-16 flex flex-col gap-8 border-t border-line pt-10 md:mt-24 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-[34ch] text-title text-fg">{introducing.summary}</p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="#platform" arrow="forward">
              {cta.explorePlatform}
            </ButtonLink>
            <ButtonLink href={links.demo} variant="secondary" arrow="forward">
              {cta.watchDemo}
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
