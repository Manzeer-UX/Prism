import { AnimatePresence, motion } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useBookingTrigger } from '../components/booking/booking-context'
import { ButtonLink } from '../components/ui/ButtonLink'
import { PrismWordmark } from '../components/ui/PrismMark'
import { brand, cta, links, nav } from '../content/prism'
import { useActiveId } from '../lib/hooks'
import { DURATION, EASE } from '../lib/motion'

const NAV = nav

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const active = useActiveId(
    NAV.map((n) => n.id),
    0.35,
  )
  const toggleRef = useRef<HTMLButtonElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  // "Schedule a meeting" opens the Calendly overlay. From the mobile sheet the
  // sheet closes first and focus returns to the menu button afterwards.
  const book = useBookingTrigger()
  const sheetBook = useBookingTrigger(useCallback(() => toggleRef.current, []))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Mobile sheet: lock page scroll, close on Escape, keep focus inside.
  useEffect(() => {
    if (!open) return
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const first = sheetRef.current?.querySelector<HTMLElement>('a, button')
    first?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
      if (e.key === 'Tab' && sheetRef.current) {
        const items = Array.from(sheetRef.current.querySelectorAll<HTMLElement>('a, button'))
        const all = [toggleRef.current!, ...items]
        const i = all.indexOf(document.activeElement as HTMLElement)
        if (e.shiftKey && i <= 0) {
          e.preventDefault()
          all[all.length - 1].focus()
        } else if (!e.shiftKey && i === all.length - 1) {
          e.preventDefault()
          all[0].focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Close the sheet if the viewport grows past the mobile breakpoint.
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 64rem)')
    const onChange = () => mql.matches && setOpen(false)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const solid = scrolled || open

  return (
    <>
      <header
        data-theme="dark"
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-200 ease-(--ease-prism) ${
          solid
            ? 'border-line bg-ink-900/95 supports-[backdrop-filter]:bg-ink-900/85 supports-[backdrop-filter]:backdrop-blur-md'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="shell flex h-16 items-center justify-between gap-6 md:h-[4.5rem]">
          <a href="#top" className="flex items-center gap-3 text-fg" aria-label="PRISM AI, back to top">
            <PrismWordmark className="h-9 md:h-10" />
            <span className="hidden h-4 w-px bg-line-strong sm:block lg:hidden xl:block" aria-hidden="true" />
            <span className="hidden text-[0.8125rem] whitespace-nowrap text-fg-3 sm:block lg:hidden xl:block">
              {brand.byline}
            </span>
          </a>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => {
                const current = active === item.id
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      aria-current={current ? 'true' : undefined}
                      className={`relative inline-flex h-9 items-center rounded-lg px-2.5 text-[0.875rem] whitespace-nowrap transition-colors duration-150 xl:px-3 ${
                        current ? 'text-fg' : 'text-fg-2 hover:text-fg'
                      }`}
                    >
                      {item.label}
                      {current && (
                        <motion.span
                          layoutId="nav-current"
                          className="absolute inset-x-2.5 -bottom-px h-px bg-fg xl:inset-x-3"
                          transition={{ duration: DURATION.menu, ease: EASE }}
                        />
                      )}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <ButtonLink href={links.scheduleMeeting} size="md" {...book}>
                {cta.scheduleMeeting}
              </ButtonLink>
            </div>
            <button
              ref={toggleRef}
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-[10px] text-fg transition-colors duration-150 hover:bg-raised lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>

      {/* Sibling of <header>: the header's backdrop-filter would otherwise become
          the containing block for this fixed sheet and collapse it. */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            ref={sheetRef}
            data-theme="dark"
            className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-line md:top-[4.5rem] lg:hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: DURATION.menu, ease: EASE }}
          >
            <nav aria-label="Mobile" className="shell flex min-h-full flex-col pt-4 pb-10">
              <ul className="divide-y divide-line">
                {NAV.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={() => setOpen(false)}
                      className="flex h-16 items-center justify-between font-display text-2xl tracking-[-0.02em] text-fg"
                    >
                      {item.label}
                      <span className="text-meta text-fg-3" aria-hidden="true">
                        {active === item.id ? 'Current' : ''}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-3 pt-10">
                <ButtonLink
                  href={links.scheduleMeeting}
                  {...sheetBook}
                  onClick={(e) => {
                    sheetBook.onClick(e)
                    if (e.defaultPrevented) setOpen(false)
                  }}
                >
                  {cta.scheduleMeeting}
                </ButtonLink>
                <ButtonLink href={links.demo} variant="secondary" arrow="forward">
                  {cta.watchDemo}
                </ButtonLink>
                <p className="pt-3 text-center text-meta text-fg-3">
                  {brand.name} {brand.byline} · {brand.parent}
                </p>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
