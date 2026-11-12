import { PrismWordmark } from '../components/ui/PrismMark'
import { seasia } from '../content/prism'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer data-theme="dark" className="border-t border-line bg-ink-950">
      <div className="shell flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between md:py-12">
        <a href="#top" className="inline-flex text-fg" aria-label="PRISM AI, back to top">
          <PrismWordmark />
        </a>
        <p className="text-[0.8125rem] text-fg-3">
          © {year} {seasia.fullName}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
