import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Reveal } from '../components/ui/Reveal'
import { value, type Outcome } from '../content/prism'

/**
 * 09 · Business value — five outcomes set large between hairlines. Each one
 * brightens as it crosses the middle of the viewport, like a teleprompter,
 * then settles.
 */
function OutcomeLine({ outcome, index }: { outcome: Outcome; index: number }) {
  const ref = useRef<HTMLLIElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'start 0.45'] })
  const opacity = useTransform(scrollYProgress, [0, 1], [0.18, 1])
  const x = useTransform(scrollYProgress, [0, 1], [-12, 0])

  return (
    <li ref={ref} className="border-t border-line">
      <motion.div
        style={reduced ? undefined : { opacity, x }}
        className="grid grid-cols-[2.5rem_1fr] gap-x-4 py-8 md:grid-cols-[4rem_1fr] md:py-10 lg:grid-cols-[4rem_1fr_22rem] lg:gap-x-10"
      >
        <span className="pt-1 text-meta text-fg-3 tabular-nums" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div>
          <h3 className="text-meta tracking-[0.06em] text-fg-2 uppercase">{outcome.label}</h3>
          <p className="mt-3 text-display-l text-fg">{outcome.headline}</p>
        </div>
        <p className="col-start-2 mt-4 max-w-[36rem] text-fg-2 lg:col-start-3 lg:mt-0 lg:self-end lg:pb-1">
          {outcome.body}
        </p>
      </motion.div>
    </li>
  )
}

export function Value() {
  return (
    <section id="value" data-theme="light" aria-labelledby="value-title" className="relative">
      <div className="shell section-pad">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="text-meta text-fg-3">{value.eyebrow}</p>
            </Reveal>
            <Reveal delay={0.05} blur>
              <h2 id="value-title" className="mt-4 max-w-[22ch] text-display-l text-fg">
                {value.title}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="lg:col-span-5 lg:self-end lg:pb-1">
            <p className="text-lead text-fg-2">{value.body}</p>
          </Reveal>
        </div>
        <ol className="mt-12 border-b border-line md:mt-16">
          {value.outcomes.map((o, i) => (
            <OutcomeLine key={o.id} outcome={o} index={i} />
          ))}
        </ol>
      </div>
    </section>
  )
}
