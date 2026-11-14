import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowDown } from 'lucide-react'
import { BlurText } from '../components/reactbits/BlurText'
import { ButtonLink } from '../components/ui/ButtonLink'
import { PrismRefraction } from '../components/visuals/PrismRefraction'
import { brand, cta, hero } from '../content/prism'
import { DURATION, EASE } from '../lib/motion'

export function Hero() {
  const reduced = useReducedMotion()
  const { scrollY } = useScroll()
  // The scroll cue steps aside once the reader has started scrolling.
  const cueOpacity = useTransform(scrollY, [0, 160], [1, 0])

  const enter = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: DURATION.enter, ease: EASE, delay },
        }

  return (
    <section id="top" data-theme="dark" aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 grid-lines [mask-image:radial-gradient(ellipse_70%_60%_at_65%_45%,#000_30%,transparent_80%)] opacity-70"
      />

      <div className="shell grid min-h-[100svh] grid-cols-1 content-center gap-y-12 pt-28 pb-28 md:pt-32 lg:grid-cols-12 lg:gap-x-8 lg:pt-28 lg:pb-32">
        <div className="relative z-10 lg:col-span-6 lg:self-center xl:col-span-5">
          <motion.p className="flex flex-wrap items-center gap-x-2 text-meta text-fg-3" {...enter(0)}>
            <span className="text-fg-2">{brand.name}</span>
            <span aria-hidden="true">—</span>
            <span>{brand.positioning}</span>
          </motion.p>

          <BlurText
            as="h1"
            id="hero-title"
            text={hero.title}
            startDelay={0.1}
            className="mt-6 max-w-[15ch] text-display-xl text-fg"
          />

          <motion.div className="mt-6 max-w-[33rem] space-y-2 text-lead" {...enter(0.45)}>
            <p className="text-fg">{hero.lines[0]}</p>
            <p className="text-fg-2">{hero.lines[1]}</p>
          </motion.div>

          <motion.p
            className="mt-8 flex items-center gap-3 font-mono text-[0.8125rem] font-medium tracking-[0.08em] text-fg uppercase"
            {...enter(0.5)}
          >
            <span className="h-px w-8 bg-accent" aria-hidden="true" />
            {brand.signature}
          </motion.p>

          <motion.div className="mt-8 flex flex-wrap items-center gap-3" {...enter(0.55)}>
            <ButtonLink href="#platform" arrow="forward">
              {cta.explorePlatform}
            </ButtonLink>
            <ButtonLink variant="secondary" arrow="forward">
              {cta.watchDemo}
            </ButtonLink>
          </motion.div>
        </div>

        <div className="relative mx-auto w-full max-w-[56rem] lg:col-span-6 lg:max-w-none lg:self-center xl:col-span-7 xl:-mr-6">
          <PrismRefraction />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 shell pb-6">
        <div className="flex items-end justify-between gap-6 border-t border-line pt-5">
          <p className="text-meta tracking-[0.06em] text-fg-3 uppercase">{brand.pillarsLine}</p>
          <motion.a
            href="#challenge"
            style={{ opacity: cueOpacity }}
            className="pointer-events-auto hidden items-center gap-2 text-meta text-fg-3 transition-colors duration-150 hover:text-fg sm:inline-flex"
          >
            Scroll to explore
            <ArrowDown size={14} strokeWidth={1.5} aria-hidden="true" />
          </motion.a>
        </div>
      </div>
    </section>
  )
}
