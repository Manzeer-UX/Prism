import { ScrollReveal } from '../components/reactbits/ScrollReveal'
import { Reveal } from '../components/ui/Reveal'
import { product } from '../content/prism'

/**
 * A cinematic pause between the hero and the product: the second sentence of
 * the source description, revealed word by word as it scrolls through view.
 */
export function Statement() {
  return (
    <section id="statement" data-theme="dark" aria-label="What PRISM AI governs" className="relative">
      <div className="shell pt-20 pb-28 md:pt-28 md:pb-40 lg:pt-32 lg:pb-48">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <p className="text-meta text-fg-3">What PRISM AI governs</p>
            <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 lg:flex-col" aria-label="Governed">
              {product.governed.map((g) => (
                <li key={g} className="flex items-center gap-2 text-meta text-fg-2">
                  <span className="size-1 rounded-full bg-fg-3" aria-hidden="true" />
                  {g}
                </li>
              ))}
            </ul>
          </Reveal>
          <ScrollReveal
            text={product.mission}
            emphasize={['LLMs', 'agents', 'prompts', 'data', 'confidence']}
            className="max-w-[26ch] text-display-l lg:col-span-9"
          />
        </div>
      </div>
    </section>
  )
}
