import { useEffect, useState, useSyncExternalStore, type RefObject } from 'react'

/** Subscribe to a CSS media query. Returns false during the first paint on the server. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')

/** Desktop pointer (mouse / trackpad) with hover support */
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)')

/**
 * Scroll-spy: returns the id of the element currently crossing a horizontal
 * line placed `line` (0–1) down the viewport.
 */
export function useActiveId(ids: string[], line = 0.4): string | null {
  const [active, setActive] = useState<string | null>(null)
  const key = ids.join('|')

  useEffect(() => {
    const list = key.split('|')
    let frame = 0

    // Measured on scroll (rAF-throttled) rather than with IntersectionObserver,
    // so jumping straight past a section never leaves a stale id behind.
    const measure = () => {
      frame = 0
      const y = window.innerHeight * line
      let found: string | null = null
      for (const id of list) {
        const el = document.getElementById(id)
        if (!el) continue
        const r = el.getBoundingClientRect()
        if (r.top <= y && r.bottom > y) {
          found = id
          break
        }
      }
      setActive(found)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [key, line])

  return active
}

/** True while an element is anywhere in the viewport — used to pause loops off-screen. */
export function useOnScreen<T extends Element>(ref: RefObject<T | null>, margin = '0px'): boolean {
  const [onScreen, setOnScreen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      rootMargin: margin,
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, margin])
  return onScreen
}
