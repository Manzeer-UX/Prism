import { Reveal } from '../components/ui/Reveal'
import { PillarGlyph, type PillarGlyphId } from '../components/visuals/PillarGlyph'
import { pillars, why } from '../content/prism'

/** 05 · Why PRISM AI? — five pillars set as an editorial index rather than a card grid. */
export function WhyPrism() {
  return (
    <section id="why" data-theme="light" aria-labelledby="why-title" className="relative bg-surface">
      <div className="shell section-pad">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="text-meta text-fg-3">{why.eyebrow}</p>
            </Reveal>
            <Reveal delay={0.05} blur>
              <h2 id="why-title" className="mt-4 max-w-[20ch] text-display-l text-fg">
                {why.title}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="lg:col-span-5 lg:self-end lg:pb-1">
            <p className="text-lead text-fg-2">{why.body}</p>
          </Reveal>
        </div>

        <ol className="mt-14 border-b border-line md:mt-20">
          {pillars.map((p, i) => (
            <li key={p.id} className="border-t border-line">
              <Reveal
                delay={0.04}
                className="grid grid-cols-1 gap-x-8 gap-y-4 py-8 md:grid-cols-12 md:items-center md:py-10 lg:py-12"
              >
                <div className="flex items-baseline gap-4 md:col-span-6 lg:col-span-5">
                  <span className="w-6 shrink-0 text-meta text-fg-3 tabular-nums" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-meta tracking-[0.06em] text-fg-2 uppercase">{p.title}</h3>
                    <p className="mt-3 text-display-m text-fg">{p.headline}</p>
                  </div>
                </div>
                <p className="pl-10 text-lead text-fg-2 md:col-span-6 md:pl-0 lg:col-span-4">{p.body}</p>
                <div className="hidden lg:col-span-3 lg:flex lg:justify-end">
                  <PillarGlyph id={p.id as PillarGlyphId} className="h-auto w-full max-w-[13.5rem]" />
                </div>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal className="mt-14 md:mt-20">
          <p className="text-display-m">
            <span className="text-fg-2">{why.closing[0]}</span> <span className="text-fg">{why.closing[1]}</span>
          </p>
        </Reveal>
      </div>
    </section>
  )
}
