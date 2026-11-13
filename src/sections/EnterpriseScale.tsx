import { Blocks, Cloud, FileCheck, Layers, ShieldCheck, type LucideIcon } from 'lucide-react'
import { SpotlightCard } from '../components/reactbits/SpotlightCard'
import { BandMarker } from '../components/ui/BandMarker'
import { Reveal } from '../components/ui/Reveal'
import { capabilities, enterprise, pillars } from '../content/prism'

const ICONS: Record<(typeof enterprise.attributes)[number]['id'], LucideIcon> = {
  scalability: Layers,
  deployment: Cloud,
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
const related = ['governance', 'security'].map((id) => pillars.find((p) => p.id === id)!)

/**
 * 10 · Enterprise readiness. The five enterprise attributes, then capability
 * 09 as a control ledger. Integration logos are deliberately absent until the
 * integrations are confirmed (see the brief), and no certifications are implied.
 */
export function EnterpriseScale() {
  return (
    <section id="enterprise" data-theme="light" aria-labelledby="enterprise-title" className="relative bg-raised">
      <div className="shell section-pad">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="text-meta text-fg-3">{enterprise.eyebrow}</p>
            </Reveal>
            <Reveal delay={0.05} blur>
              <h2 id="enterprise-title" className="mt-4 max-w-[20ch] text-display-l text-fg">
                {enterprise.title}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="space-y-4 lg:col-span-5 lg:self-end lg:pb-1">
            {enterprise.body.map((p, i) => (
              <p key={i} className={i === 0 ? 'text-lead text-fg' : 'text-fg-2'}>
                {p}
              </p>
            ))}
          </Reveal>
        </div>

        {/* Five attributes — one ruled strip, not five cards */}
        <Reveal delay={0.1} className="mt-12 md:mt-16">
          <SpotlightCard
            spotlightColor="rgb(17 24 39 / 0.04)"
            className="rounded-2xl border border-line-strong bg-surface"
          >
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
              {enterprise.attributes.map((item, i) => {
                const Icon = ICONS[item.id]
                return (
                  <li
                    key={item.id}
                    className={`flex gap-4 border-line p-5 sm:flex-col sm:gap-8 sm:p-6 lg:p-7 ${stripBorders(i)}`}
                  >
                    <Icon size={20} strokeWidth={1.5} className="mt-0.5 text-fg-2 sm:mt-0" aria-hidden="true" />
                    <div>
                      <h3 className="font-display text-[1.125rem] leading-tight font-medium tracking-[-0.01em] text-fg md:text-[1.25rem]">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-[0.875rem] text-fg-2">{item.body}</p>
                    </div>
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
              <p className="mt-3 text-lead text-fg">{security.headline}</p>
              <p className="mt-2 text-fg-2">{security.intro}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <dl className="mt-8 space-y-6 border-t border-line pt-6">
                {related.map((p) => (
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
