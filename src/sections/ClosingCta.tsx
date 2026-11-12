import { ButtonLink } from '../components/ui/ButtonLink'
import { Reveal } from '../components/ui/Reveal'
import { BlurText } from '../components/reactbits/BlurText'
import { ConvergeBeam } from '../components/visuals/ConvergeBeam'
import { links, product, seasia } from '../content/prism'

/**
 * Final conversion. The heading is lifted from the source description
 * ("…govern LLMs, agents, prompts, and data with confidence…"), and the
 * actions are the source page's own: Schedule a Meeting and Partners.
 */
export function ClosingCta() {
  return (
    <section
      data-theme="dark"
      aria-labelledby="cta-title"
      className="relative isolate overflow-hidden border-t border-line"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 grid-lines [mask-image:linear-gradient(to_bottom,transparent,#000_30%,#000_70%,transparent)] opacity-60"
      />
      <div className="shell pt-24 md:pt-32">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Reveal>
              <p className="text-meta text-fg-3">{seasia.tagline}</p>
            </Reveal>
            <BlurText
              as="h2"
              id="cta-title"
              trigger="view"
              text="Govern LLMs, agents, prompts, and data with confidence"
              className="mt-6 max-w-[18ch] text-display-xl text-fg"
              stagger={0.05}
            />
          </div>
          <Reveal delay={0.2} className="flex flex-col justify-end gap-6 lg:col-span-4">
            <p className="text-fg-2">
              {product.name} — {product.descriptor}
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={links.scheduleMeeting} arrow="external">
                Schedule a meeting
              </ButtonLink>
              <ButtonLink href={links.partners} variant="secondary">
                Partners
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </div>
      <div className="mt-16 md:mt-20">
        <ConvergeBeam />
      </div>
    </section>
  )
}
