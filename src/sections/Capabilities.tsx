import { useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { BandMarker } from '../components/ui/BandMarker'
import { Reveal } from '../components/ui/Reveal'
import { SpectrumRing } from '../components/visuals/SpectrumRing'
import { capabilities, capabilitiesIntro } from '../content/prism'
import { useActiveId } from '../lib/hooks'

const IDS = capabilities.map((c) => `cap-${c.id}`)

/**
 * Core capabilities — a sticky instrument dial on the left follows the
 * capability being read on the right. On small screens the dial is dropped
 * and the list reads straight down.
 */
export function Capabilities() {
  const reduced = useReducedMotion()
  const activeId = useActiveId(IDS, 0.45)
  // Hold the last capability read, so the dial doesn't snap back to 01 when
  // the reader scrolls past the end of the list.
  const [activeIndex, setActiveIndex] = useState(0)
  useEffect(() => {
    if (activeId) setActiveIndex(IDS.indexOf(activeId))
  }, [activeId])

  const jumpTo = (index: number) => {
    const el = document.getElementById(IDS[index])
    if (!el) return
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    el.focus({ preventScroll: true })
  }

  return (
    <section id="capabilities" data-theme="dark" aria-labelledby="capabilities-title" className="relative">
      <div className="shell section-pad">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="text-meta text-fg-3">{capabilitiesIntro.eyebrow}</p>
            </Reveal>
            <Reveal delay={0.05} blur>
              <h2 id="capabilities-title" className="mt-4 max-w-[20ch] text-display-l text-fg">
                {capabilitiesIntro.title}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="space-y-3 lg:col-span-5 lg:self-end lg:pb-1">
            <p className="text-lead text-fg">{capabilitiesIntro.lead}</p>
            <p className="text-fg-2">{capabilitiesIntro.body}</p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-x-8 md:mt-20 lg:grid-cols-12">
          {/* Sticky dial */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-28 pb-12">
              <div className="mx-auto max-w-[24rem] xl:max-w-[26rem]">
                <SpectrumRing activeIndex={activeIndex} onSelect={jumpTo} />
              </div>
              <nav aria-label="Capability index" className="mt-8 [@media(max-height:840px)]:hidden">
                <ol className="grid grid-cols-2 gap-x-6 gap-y-0.5">
                  {capabilities.map((c, i) => {
                    const on = i === activeIndex
                    return (
                      <li key={c.id}>
                        <a
                          href={`#cap-${c.id}`}
                          aria-current={on ? 'true' : undefined}
                          className={`flex h-8 items-center gap-2.5 text-[0.8125rem] transition-colors duration-150 ${
                            on ? 'text-fg' : 'text-fg-3 hover:text-fg-2'
                          }`}
                        >
                          <BandMarker band={i + 1} className={`h-3 transition-opacity ${on ? '' : 'opacity-40'}`} />
                          <span className="font-mono text-[0.75rem] tabular-nums">{c.number}</span>
                          <span className="truncate">{c.short}</span>
                        </a>
                      </li>
                    )
                  })}
                </ol>
              </nav>
            </div>
          </div>

          {/* Capability list */}
          <div className="lg:col-span-7">
            {capabilities.map((c, i) => {
              const on = i === activeIndex
              return (
                <article
                  key={c.id}
                  id={`cap-${c.id}`}
                  tabIndex={-1}
                  aria-labelledby={`cap-${c.id}-title`}
                  className="scroll-mt-28 border-t border-line py-10 outline-none md:py-14 lg:min-h-[26rem]"
                >
                  <Reveal>
                    <h3
                      id={`cap-${c.id}-title`}
                      className="flex items-center gap-3 text-meta tracking-[0.06em] text-fg-2 uppercase"
                    >
                      <BandMarker band={i + 1} />
                      <span className="text-fg-3 tabular-nums">{c.number}</span>
                      <span aria-hidden="true" className="text-fg-3">
                        —
                      </span>
                      {c.title}
                    </h3>
                    <p
                      className={`mt-5 max-w-[24ch] text-display-m transition-colors duration-300 ${
                        on ? 'text-fg' : 'text-fg lg:text-fg-2'
                      }`}
                    >
                      {c.headline}
                    </p>
                    <p className="mt-4 max-w-[36rem] text-fg-2">{c.intro}</p>
                  </Reveal>
                  <ul className="mt-8 grid gap-x-8 sm:grid-cols-2">
                    {c.items.map((item, j) => (
                      <Reveal as="li" key={item} delay={0.04 * j} className="flex gap-4 border-t border-line py-3.5">
                        <span className="pt-1 text-meta text-fg-3 tabular-nums" aria-hidden="true">
                          {c.number}.{j + 1}
                        </span>
                        <span className="text-[0.9375rem] text-fg-2 md:text-base">{item}</span>
                      </Reveal>
                    ))}
                  </ul>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
