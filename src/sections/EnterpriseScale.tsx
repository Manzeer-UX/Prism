import { Blocks, FileCheck, Globe, Layers, ShieldCheck, type LucideIcon } from 'lucide-react'
import { SpotlightCard } from '../components/reactbits/SpotlightCard'
import { BandMarker } from '../components/ui/BandMarker'
import { Reveal } from '../components/ui/Reveal'
import { capabilities, enterpriseScale, pillars } from '../content/prism'

const ICONS: Record<(typeof enterpriseScale)[number]['id'], LucideIcon> = {
  scalability: Layers,
  deployment: Globe,
  security: ShieldCheck,
  audit: FileCheck,
  apis: Blocks,
}

/** Hairlines between strip cells for the 1-, 2- and 5-column layouts */
function stripBorders(i: number) {
  const mobile = i > 0 ? 'border-t' : ''
  const sm = [i > 1 ? 'sm:border-t' : 'sm:border-t-0', i % 2 === 1 ? 'sm:border-l' : '', i === 4 ? 'sm:col-span-2' : '']
  const lg = ['lg:border-t-0', i > 0 ? 'lg:border-l' : 'lg:border-l-0', i === 4 ? 'lg:col-span-1' : '']
  // An odd item already has sm:border-l, which lg keeps; only even items need it added at lg.
  return [mobile, ...sm, ...lg.filter((c) => !(i % 2 === 1 && c === 'lg:border-l'))].join(' ')
}

const security = capabilities.find((c) => c.id === 'security')!
const securityBand = capabilities.indexOf(security) + 1
const secure = pillars.find((p) => p.id === 'secure')!
const governance = pillars.find((p) => p.id === 'governance')!

/**
 * Trust, security and governance. Only what the source states: the five
 * "Built for enterprise scale" attributes, capability 09 and the two related
 * pillars. No certifications or compliance guarantees are implied.
 */
export function EnterpriseScale() {
  return (
    <section id="enterprise" data-theme="light" aria-labelledby="enterprise-title" className="relative bg-raised">
      <div className="shell section-pad">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="text-meta text-fg-3">Trust & security</p>
            </Reveal>
            <Reveal delay={0.05} blur>
              <h2 id="enterprise-title" className="mt-4 text-display-l text-fg">
                Built for enterprise scale
              </h2>
            </Reveal>
          </div>
        </div>

        {/* Five attributes — one ruled strip, not five cards */}
        <Reveal delay={0.1} className="mt-12 md:mt-16">
          <SpotlightCard
            spotlightColor="rgb(17 24 39 / 0.04)"
            className="rounded-2xl border border-line-strong bg-surface"
          >
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
              {enterpriseScale.map((item, i) => {
                const Icon = ICONS[item.id]
                return (
                  <li
                    key={item.id}
                    className={`flex items-center gap-4 border-line p-5 sm:flex-col sm:items-start sm:gap-10 sm:p-6 lg:p-7 ${stripBorders(i)}`}
                  >
                    <Icon size={20} strokeWidth={1.5} className="text-fg-2" aria-hidden="true" />
                    <span className="font-display text-[1.125rem] leading-tight font-medium tracking-[-0.01em] text-fg md:text-[1.25rem]">
                      {item.title}
                    </span>
                  </li>
                )
              })}
            </ul>
          </SpotlightCard>
        </Reveal>

        {/* Security & governance controls — capability 09 as a control ledger */}
        <div className="mt-16 grid gap-10 md:mt-24 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Reveal>
              <div className="flex items-center gap-3">
                <BandMarker band={securityBand} />
                <span className="text-meta text-fg-3">{security.number}</span>
              </div>
              <h3 className="mt-4 text-display-m text-fg">{security.title}</h3>
            </Reveal>
            <Reveal delay={0.08}>
              <dl className="mt-8 space-y-6">
                {[secure, governance].map((p) => (
                  <div key={p.id}>
                    <dt className="text-[0.9375rem] font-medium text-fg">{p.title}</dt>
                    <dd className="mt-1 text-fg-2">{p.body}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface">
              <div className="flex items-center justify-between border-b border-line px-5 py-3 md:px-6">
                <span className="text-meta text-fg-3">Control</span>
                <span className="text-meta text-fg-3">Capability</span>
              </div>
              <ul className="divide-y divide-line">
                {security.items.map((item, j) => (
                  <li key={item} className="flex items-center justify-between gap-6 px-5 py-4 md:px-6 md:py-5">
                    <span className="flex items-center gap-4">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-line text-fg-2">
                        <ShieldCheck size={16} strokeWidth={1.5} aria-hidden="true" />
                      </span>
                      <span className="text-[0.9375rem] text-fg md:text-base">{item}</span>
                    </span>
                    <span className="shrink-0 text-meta text-fg-3 tabular-nums">
                      {security.number}.{j + 1}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
