import { ScrollReveal } from '../components/reactbits/ScrollReveal'
import { Reveal } from '../components/ui/Reveal'
import { challenge } from '../content/prism'

/**
 * 02 · The enterprise AI challenge. The large-type scroll reveal carries the
 * problem statement, then five challenges are set as a ruled index and the
 * section closes on the observe → evaluate argument.
 */
export function Challenge() {
  return (
    <section id="challenge" data-theme="dark" aria-labelledby="challenge-title" className="relative">
      <div className="shell pt-20 pb-24 md:pt-28 md:pb-32 lg:pt-32 lg:pb-40">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <p className="text-meta text-fg-3">{challenge.eyebrow}</p>
          </Reveal>
          <div className="lg:col-span-9">
            <Reveal blur>
              <h2 id="challenge-title" className="max-w-[22ch] text-display-l text-fg">
                {challenge.title}
              </h2>
            </Reveal>
            <ScrollReveal
              text={challenge.reveal}
              emphasize={challenge.revealEmphasis}
              className="mt-12 max-w-[28ch] text-display-l md:mt-16"
            />
            <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-2 md:gap-8">
              {challenge.body.map((p, i) => (
                <Reveal key={i} delay={0.05 * i}>
                  <p className={`text-lead ${i === 1 ? 'text-fg' : 'text-fg-2'}`}>{p}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        <ol className="mt-20 border-b border-line md:mt-28">
          {challenge.items.map((c, i) => (
            <li key={c.id} className="border-t border-line">
              <Reveal delay={0.04} className="grid grid-cols-1 gap-x-8 gap-y-3 py-8 md:grid-cols-12 md:py-10 lg:py-12">
                <p className="flex items-baseline gap-4 text-meta tracking-[0.06em] text-fg-3 uppercase md:col-span-4 lg:col-span-3">
                  <span className="w-6 shrink-0 tabular-nums" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {c.label}
                </p>
                <h3 className="pl-10 text-display-m text-fg md:col-span-8 md:pl-0 lg:col-span-5">{c.question}</h3>
                <p className="pl-10 text-fg-2 md:col-span-8 md:col-start-5 md:pl-0 lg:col-span-4 lg:col-start-auto lg:pt-1.5">
                  {c.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal className="mt-20 grid gap-8 md:mt-28 lg:grid-cols-12">
          <p className="text-display-l lg:col-span-9 lg:col-start-4">
            <span className="text-fg-2">{challenge.closing[0]}</span>{' '}
            <span className="text-fg">{challenge.closing[1]}</span>
          </p>
        </Reveal>
      </div>
    </section>
  )
}
