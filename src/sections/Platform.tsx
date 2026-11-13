import { ConsolePreview } from '../components/console/ConsolePreview'
import { ButtonLink } from '../components/ui/ButtonLink'
import { Reveal } from '../components/ui/Reveal'
import { cta, links, platform } from '../content/prism'

/** 04 · The platform — the product experience, carried by the tabbed console. */
export function Platform() {
  return (
    <section
      id="platform"
      data-theme="light"
      aria-labelledby="platform-title"
      className="relative border-t border-line section-pad"
    >
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="text-meta text-fg-3">{platform.eyebrow}</p>
            </Reveal>
            <Reveal delay={0.05} blur>
              <h2 id="platform-title" className="mt-4 max-w-[20ch] text-display-l text-fg">
                {platform.title}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="space-y-4 lg:col-span-5 lg:pb-1">
            {platform.body.map((p, i) => (
              <p key={i} className={i === 0 ? 'text-lead text-fg' : 'text-fg-2'}>
                {p}
              </p>
            ))}
          </Reveal>
        </div>

        <Reveal delay={0.05} className="mt-14 border-t border-line pt-8 md:mt-20 md:pt-10">
          <p className="max-w-[30ch] text-display-m text-fg">{platform.pullLine}</p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 md:mt-12">
          <ConsolePreview />
        </Reveal>

        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[46rem] text-[0.8125rem] text-fg-3">{platform.disclaimer}</p>
          <ButtonLink href={links.livePlatform} variant="secondary" arrow="forward" className="self-start md:self-auto">
            {cta.exploreLivePlatform}
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
