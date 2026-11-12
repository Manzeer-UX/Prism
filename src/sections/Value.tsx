import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { Reveal } from '../components/ui/Reveal'
import { businessValue } from '../content/prism'

/**
 * "Delivering business value" — five outcomes set large. Each line brightens as
 * it crosses the middle of the viewport, like a teleprompter, then settles.
 */
function ValueLine({ text, index }: { text: string; index: number }) {
  const ref = useRef<HTMLLIElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'start 0.45'] })
  const opacity = useTransform(scrollYProgress, [0, 1], [0.18, 1])
  const x = useTransform(scrollYProgress, [0, 1], [-12, 0])

  return (
    <li ref={ref} className="border-t border-line">
      <motion.div
        style={reduced ? undefined : { opacity, x }}
        className="grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 py-7 md:grid-cols-[4rem_1fr] md:py-9"
      >
        <span className="text-meta text-fg-3 tabular-nums" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <p className="text-display-l text-fg">{text}</p>
      </motion.div>
    </li>
  )
}

export function Value() {
  return (
    <section id="value" data-theme="light" aria-labelledby="value-title" className="relative">
      <div className="shell section-pad">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <Reveal>
              <p className="text-meta text-fg-3">Outcomes</p>
            </Reveal>
            <Reveal delay={0.05} blur>
              <h2 id="value-title" className="mt-4 text-display-m text-fg">
                Delivering business value
              </h2>
            </Reveal>
          </div>
        </div>
        <ol className="mt-12 border-b border-line md:mt-16">
          {businessValue.map((v, i) => (
            <ValueLine key={v} text={v} index={i} />
          ))}
        </ol>
      </div>
    </section>
  )
}
