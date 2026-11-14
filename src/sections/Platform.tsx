import { useState } from 'react'
import { ConsolePreview, type ViewId } from '../components/console/ConsolePreview'
import { ButtonLink } from '../components/ui/ButtonLink'
import { Reveal } from '../components/ui/Reveal'
import { PlatformPrism } from '../components/visuals/PlatformPrism'
import { cta, links, platform } from '../content/prism'

/**
 * 04 · The platform — the product experience, carried by the tabbed console.
 * The platform explanation sits once, in the introduction above, so this
 * section opens straight on the pull line and the console. On wide screens a
 * prism beside the heading splits one beam (the output) into the five console
 * views; the selected view's ray is lit, and clicking a ray selects that view.
 */
export function Platform() {
  const [view, setView] = useState<ViewId>('overview')

  return (
    <section
      id="platform"
      data-theme="light"
      aria-labelledby="platform-title"
      className="relative border-t border-line section-pad"
    >
      <div className="shell">
        <div className="relative">
          <Reveal>
            <p className="text-meta text-fg-3">{platform.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.05} blur>
            <h2 id="platform-title" className="mt-4 max-w-[24ch] text-display-l text-fg">
              {platform.pullLine}
            </h2>
          </Reveal>
          <Reveal delay={0.15} className="absolute top-0 right-0 hidden xl:block">
            <PlatformPrism active={view} onSelect={setView} />
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-10 md:mt-12">
          <ConsolePreview active={view} onActiveChange={setView} />
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
