import { PrismWordmark } from '../components/ui/PrismMark'
import { brand, footerNav } from '../content/prism'

/**
 * 12 · Footer — two quiet rows: lock-up and navigation, then copyright and
 * attribution. The signature line and full attribution sit directly above in
 * the closing CTA, so they are not repeated here.
 */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer data-theme="dark" className="border-t border-line bg-ink-950">
      <div className="shell py-10 md:py-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <a
            href="#top"
            className="inline-flex self-start text-fg lg:self-auto"
            aria-label={`${brand.name}, back to top`}
          >
            <PrismWordmark className="h-8" />
          </a>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 lg:gap-x-8">
              {footerNav.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="inline-flex h-10 items-center text-[0.875rem] text-fg-2 transition-colors duration-150 hover:text-fg"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-line pt-6 text-[0.8125rem] text-fg-3 md:mt-8 lg:flex-row lg:justify-between lg:gap-8">
          <p>
            © {year} {brand.copyrightHolder}. All rights reserved.
          </p>
          <p>
            {brand.descriptor} <span aria-hidden="true">·</span> {brand.parent}
          </p>
        </div>
      </div>
    </footer>
  )
}
