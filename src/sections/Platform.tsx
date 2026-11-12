import { ConsolePreview } from '../components/console/ConsolePreview'
import { Reveal } from '../components/ui/Reveal'
import { product } from '../content/prism'

/**
 * Introducing PRISM. The source's closing statement is split into subject
 * (heading) and predicate (body), then the product console carries the section.
 *
 * "PRISM AI is Seasia's proprietary AI Governance Engine, purpose-built for …"
 */
const comma = product.statement.indexOf(',')
const heading = product.statement.slice(0, comma).replace(/^PRISM AI is /, '')
const body = product.statement.slice(comma + 2)
const bodyText = body.charAt(0).toUpperCase() + body.slice(1)

export function Platform() {
  return (
    <section id="platform" data-theme="light" aria-labelledby="platform-title" className="relative section-pad">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="text-meta text-fg-3">The platform</p>
            </Reveal>
            <Reveal delay={0.05} blur>
              <h2 id="platform-title" className="mt-4 max-w-[18ch] text-display-l text-fg">
                <span className="sr-only">{product.name} is </span>
                {heading}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="lg:col-span-5 lg:pb-1">
            <p className="text-lead text-fg-2">{bodyText}</p>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-14 md:mt-16">
          <ConsolePreview />
        </Reveal>
      </div>
    </section>
  )
}
