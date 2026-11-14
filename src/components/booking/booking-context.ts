import { createContext, useCallback, useContext, useMemo, type MouseEvent } from 'react'
import { links } from '../../content/prism'

export type BookingApi = {
  /** Opens the overlay; focus returns to `returnFocus` (or the trigger) on close */
  open: (returnFocus?: HTMLElement | null) => void
  /** Starts loading the scheduler ahead of a likely click */
  prefetch: () => void
}

/** Without a provider, fall back to opening Calendly in a new tab */
export const BookingContext = createContext<BookingApi>({
  open: () => {
    window.open(links.scheduleMeeting, '_blank', 'noopener,noreferrer')
  },
  prefetch: () => {},
})

export const useBooking = () => useContext(BookingContext)

/**
 * Props for a link whose href is the Calendly URL. A plain click opens the
 * overlay; modified clicks (new tab or window) are left to the browser. Hover
 * and focus start loading the scheduler, so it is usually ready on open.
 */
export function useBookingTrigger(returnFocus?: () => HTMLElement | null) {
  const { open, prefetch } = useBooking()

  const onClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      e.preventDefault()
      open(returnFocus?.() ?? e.currentTarget)
    },
    [open, returnFocus],
  )

  return useMemo(
    () => ({ 'aria-haspopup': 'dialog' as const, onClick, onPointerEnter: prefetch, onFocus: prefetch }),
    [onClick, prefetch],
  )
}
