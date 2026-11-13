import { ButtonLink } from '../components/ui/ButtonLink'
import { Reveal } from '../components/ui/Reveal'
import { BlurText } from '../components/reactbits/BlurText'
import { ConvergeBeam } from '../components/visuals/ConvergeBeam'
import { brand, closing, cta, links } from '../content/prism'

/** 11 · Final call to action, over the dark grid with the converging prism beam. */
export function ClosingCta() {
  return (
    <section
      id="contact"
      data-theme="dark"
      aria-labelledby="cta-title"
      className="relative isolate overflow-hidden border-t border-line"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 grid-lines [mask-image:linear-gradient(to_bottom,transparent,#000_30%,#000_70%,transparent)] opacity-60"
      />
      <div className="shell pt-24 md:pt-32">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <Reveal>
              <p className="text-meta text-fg-3">{closing.eyebrow}</p>
            </Reveal>
            <BlurText
              as="h2"
              id="cta-title"
              trigger="view"
              text={closing.title}
              className="mt-6 max-w-[20ch] text-display-xl text-fg"
              stagger={0.04}
            />
          </div>
          <Reveal delay={0.2} className="flex flex-col justify-end gap-6 lg:col-span-4">
            <p className="text-fg-2">{closing.body}</p>
            <div>
              <p className="flex items-center gap-3 font-mono text-[0.8125rem] font-medium tracking-[0.08em] text-fg uppercase">
                <span className="h-px w-8 bg-accent" aria-hidden="true" />
                {brand.signature}
              </p>
              <p className="mt-3 text-fg">{closing.focus}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={links.scheduleMeeting} arrow="forward">
                {cta.scheduleMeeting}
              </ButtonLink>
              <ButtonLink href={links.demo} variant="secondary" arrow="forward">
                {cta.watchProductDemo}
              </ButtonLink>
            </div>
            <p className="text-[0.8125rem] text-fg-3">{closing.attribution}</p>
          </Reveal>
        </div>
      </div>
      <div className="mt-16 md:mt-20">
        <ConvergeBeam />
      </div>
    </section>
  )
}
