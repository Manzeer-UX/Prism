import moogleLabsLogo from '../assets/mooglelabs-logo.svg'
import { PrismWordmark } from '../components/ui/PrismMark'
import { brand, footerNav } from '../content/prism'

/**
 * 12 · Footer — two quiet rows. First: the PrismAI lock-up (with the
 * "Powered by" line) on the left, navigation centred, MoogleLabs logo on the
 * right. Second: copyright and attribution. Below 1024 px the two logos share
 * the top row and the navigation sits beneath them.
 */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer data-theme="dark" className="border-t border-line bg-ink-950">
      <div className="shell py-10 md:py-12">
        <div className="grid grid-cols-[1fr_auto] gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-end lg:gap-x-8">
          <div className="col-start-1 row-start-1 flex flex-col items-start gap-2.5">
            <p className="text-meta text-fg-3">{brand.poweredBy}</p>
            <a href="#top" className="inline-flex text-fg" aria-label={`${brand.name}, back to top`}>
              <PrismWordmark className="h-8" />
            </a>
          </div>

          <a
            href={brand.byUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="col-start-2 row-start-1 flex h-10 items-center self-end justify-self-end opacity-90 transition-opacity duration-150 hover:opacity-100 lg:col-start-3"
          >
            <img
              src={moogleLabsLogo}
              alt={`${brand.by} (opens in a new tab)`}
              width={125}
              height={24}
              className="h-6 w-auto"
            />
          </a>

          <nav aria-label="Footer" className="col-span-2 row-start-2 lg:col-span-1 lg:col-start-2 lg:row-start-1">
            <ul className="flex flex-wrap gap-x-6 lg:justify-center xl:gap-x-8">
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
          <p>{brand.descriptor}</p>
        </div>
      </div>
    </footer>
  )
}
