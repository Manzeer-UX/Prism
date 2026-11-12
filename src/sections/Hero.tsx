import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowDown, ChevronRight } from 'lucide-react'
import { BlurText } from '../components/reactbits/BlurText'
import { ButtonLink } from '../components/ui/ButtonLink'
import { PrismRefraction } from '../components/visuals/PrismRefraction'
import { editorial, links, product } from '../content/prism'
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

      <div className="shell grid min-h-[100svh] grid-cols-1 content-center gap-y-12 pt-28 pb-24 md:pt-32 lg:grid-cols-12 lg:gap-x-8 lg:pt-28 lg:pb-28">
        <div className="relative z-10 lg:col-span-6 lg:self-center xl:col-span-5">
          <motion.p className="flex flex-wrap items-center gap-x-2 text-meta text-fg-3" {...enter(0)}>
            <span className="text-fg-2">{product.name}</span>
            <span aria-hidden="true">—</span>
            <span>{product.descriptor}</span>
          </motion.p>

          <BlurText
            as="h1"
            id="hero-title"
            text={product.tagline}
            startDelay={0.1}
            className="mt-6 max-w-[14ch] text-display-xl text-fg"
          />

          <motion.p className="mt-6 max-w-[33rem] text-lead text-fg-2" {...enter(0.45)}>
            {product.summary}
          </motion.p>

          <motion.div className="mt-10 flex flex-wrap items-center gap-3" {...enter(0.55)}>
            <ButtonLink href={links.scheduleMeeting} arrow="external">
              Schedule a meeting
            </ButtonLink>
            <ButtonLink href="#capabilities" variant="secondary" arrow="forward">
              {editorial.exploreCapabilities}
            </ButtonLink>
          </motion.div>
        </div>

        <div className="relative mx-auto w-full max-w-[56rem] lg:col-span-6 lg:max-w-none lg:self-center xl:col-span-7 xl:-mr-6">
          <PrismRefraction />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 shell pb-6">
        <div className="flex items-end justify-between gap-6 border-t border-line pt-5">
          <nav aria-label="Breadcrumb" className="pointer-events-auto">
            <ol className="flex flex-wrap items-center gap-1.5 text-meta text-fg-3">
              <li>Enterprise AI</li>
              <li aria-hidden="true">
                <ChevronRight size={12} strokeWidth={1.5} />
              </li>
              <li>
                <a href={links.sdlcTooling} className="transition-colors duration-150 hover:text-fg">
                  SDLC Tooling
                </a>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={12} strokeWidth={1.5} />
              </li>
              <li aria-current="page" className="text-fg-2">
                {product.name}
              </li>
            </ol>
          </nav>
          <motion.a
            href="#statement"
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
