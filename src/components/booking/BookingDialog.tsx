import { ArrowUpRight, LoaderCircle, X } from 'lucide-react'
import { useCallback, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { booking, links } from '../../content/prism'
import { BookingContext } from './booking-context'

/*
  Booking overlay: the Calendly scheduler in a native modal <dialog>, which
  gives focus containment, Escape to close and an inert page behind it. The
  Calendly frame is only requested once someone shows intent (hovers, focuses
  or clicks a booking button), so the page makes no third-party requests
  before that; it then stays mounted so reopening is instant.
*/

export function BookingProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnRef = useRef<HTMLElement | null>(null)
  const [requested, setRequested] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const src = useMemo(() => {
    const url = new URL(links.scheduleMeeting)
    url.searchParams.set('embed_domain', window.location.host)
    url.searchParams.set('embed_type', 'Inline')
    return url.toString()
  }, [])

  const open = useCallback((returnFocus?: HTMLElement | null) => {
    returnRef.current = returnFocus ?? (document.activeElement as HTMLElement | null)
    setRequested(true)
    const dialog = dialogRef.current
    if (dialog && !dialog.open) {
      dialog.showModal()
      closeRef.current?.focus()
    }
  }, [])

  const prefetch = useCallback(() => setRequested(true), [])

  const close = () => dialogRef.current?.close()

  const onClose = () => {
    const target = returnRef.current
    returnRef.current = null
    if (target?.isConnected) target.focus()
  }

  // A click that lands on the <dialog> itself (not its content) is the backdrop.
  const onBackdrop = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) close()
  }

  const api = useMemo(() => ({ open, prefetch }), [open, prefetch])

  return (
    <BookingContext.Provider value={api}>
      {children}

      <dialog
        ref={dialogRef}
        aria-labelledby="booking-title"
        data-theme="light"
        onClose={onClose}
        onClick={onBackdrop}
        className="booking-dialog m-auto h-dvh max-h-none w-full max-w-none overflow-hidden bg-surface p-0 text-fg sm:h-[min(48rem,calc(100dvh-3rem))] sm:w-[min(66rem,calc(100vw-3rem))] sm:rounded-2xl sm:border sm:border-line"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center gap-2 border-b border-line pr-2 pl-5 sm:pr-3 sm:pl-6">
            <div className="min-w-0 flex-1">
              <h2 id="booking-title" className="truncate text-[0.9375rem] leading-5 font-medium text-fg">
                {booking.title}
              </h2>
              <p className="truncate text-meta text-fg-3">{booking.subtitle}</p>
            </div>
            <a
              href={links.scheduleMeeting}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 items-center gap-1.5 rounded-[10px] px-3 text-sm text-fg-2 transition-colors duration-150 hover:bg-raised hover:text-fg sm:inline-flex"
            >
              {booking.openInNewTab}
              <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.75} />
            </a>
            <button
              type="button"
              ref={closeRef}
              onClick={close}
              aria-label={booking.close}
              className="inline-flex size-11 items-center justify-center rounded-[10px] text-fg-2 transition-colors duration-150 hover:bg-raised hover:text-fg"
            >
              <X aria-hidden="true" size={20} strokeWidth={1.5} />
            </button>
          </div>

          <div className="relative min-h-0 flex-1 bg-white">
            {!loaded && (
              <div
                role="status"
                className="absolute inset-0 flex items-center justify-center gap-2.5 text-sm text-fg-3"
              >
                <LoaderCircle aria-hidden="true" size={18} strokeWidth={1.75} className="animate-spin" />
                {booking.loading}
              </div>
            )}
            {requested && (
              <iframe
                src={src}
                title={booking.frameTitle}
                onLoad={() => setLoaded(true)}
                className={`relative h-full w-full border-0 transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
              />
            )}
          </div>
        </div>
      </dialog>
    </BookingContext.Provider>
  )
}
