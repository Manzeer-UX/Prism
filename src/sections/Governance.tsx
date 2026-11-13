import { useState } from 'react'
import { BandMarker } from '../components/ui/BandMarker'
import { Reveal } from '../components/ui/Reveal'
import { DIMENSION_BAND, GovernanceHub } from '../components/visuals/GovernanceHub'
import { governance } from '../content/prism'

/**
 * 07 · Six dimensions of AI governance. Follows the nine capabilities: PRISM AI
 * is the centre face of a six-facet prism, one facet per dimension, with the
 * dimensions listed beside it. Pointing at a facet or a row lights the pair.
 */
export function Governance() {
  const [active, setActive] = useState<number | null>(null)

  return (
    <section id="governance" data-theme="light" aria-labelledby="governance-title" className="relative bg-surface">
      <div className="shell section-pad">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <Reveal>
              <p className="text-meta text-fg-3">{governance.eyebrow}</p>
            </Reveal>
            <Reveal delay={0.05} blur>
              <h2 id="governance-title" className="mt-4 max-w-[20ch] text-display-l text-fg">
                {governance.title}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="max-w-[36rem] space-y-4 lg:col-span-6 lg:col-start-7 lg:self-end lg:pb-1">
            <p className="text-lead text-fg">{governance.body[0]}</p>
            <p className="text-fg-2">{governance.body[1]}</p>
          </Reveal>
        </div>

        <div className="mt-14 grid items-center gap-12 md:mt-20 lg:grid-cols-12 lg:gap-8">
          <Reveal className="mx-auto w-full max-w-[24rem] sm:max-w-[32rem] lg:col-span-6 lg:max-w-[36rem] lg:pr-6">
            <GovernanceHub active={active} onActivate={setActive} />
          </Reveal>

          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal>
              <p className="text-meta text-fg-3">{governance.lead}</p>
            </Reveal>
            <ol className="mt-5 border-b border-line" onPointerLeave={() => setActive(null)}>
              {governance.dimensions.map((d, i) => {
                const dim = active !== null && active !== i
                return (
                  <Reveal
                    as="li"
                    key={d.id}
                    delay={0.04 * i}
                    className="border-t border-line"
                    onPointerEnter={() => setActive(i)}
                  >
                    <div
                      className={`grid grid-cols-[3rem_1fr] gap-x-3 py-5 transition-opacity duration-200 sm:grid-cols-[3rem_9.5rem_1fr] sm:gap-x-4 ${
                        dim ? 'opacity-40' : ''
                      }`}
                    >
                      <span className="flex h-6 items-center gap-2.5">
                        <BandMarker band={DIMENSION_BAND[i]} />
                        <span className="font-mono text-[0.75rem] text-fg-3 tabular-nums">{d.number}</span>
                      </span>
                      <h3 className="text-[1.0625rem] leading-6 font-medium text-fg">{d.title}</h3>
                      <p className="col-start-2 mt-1 text-[0.9375rem] text-fg-2 sm:col-start-3 sm:mt-0 sm:leading-6">
                        {d.body}
                      </p>
                    </div>
                  </Reveal>
                )
              })}
            </ol>
          </div>
        </div>

        <Reveal className="mt-16 border-t border-line pt-10 md:mt-24">
          <p className="max-w-[30ch] text-display-m text-fg">{governance.closing}</p>
        </Reveal>
      </div>
    </section>
  )
}
