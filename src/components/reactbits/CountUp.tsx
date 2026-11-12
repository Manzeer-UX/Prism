/**
 * CountUp — adapted from React Bits (https://reactbits.dev/text-animations/count-up,
 * MIT + Commons Clause). Tweens a number once when it scrolls into view. The
 * final value is always exposed to assistive tech; the animated digits are hidden.
 */
import { animate, useInView, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef } from 'react'
import { EASE } from '../../lib/motion'

type CountUpProps = {
  to: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

export function CountUp({ to, decimals = 0, prefix = '', suffix = '', duration = 1.4, className = '' }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduced = useReducedMotion()
  const value = useMotionValue(0)

  const format = useMemo(() => {
    const nf = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    return (n: number) => `${prefix}${nf.format(n)}${suffix}`
  }, [decimals, prefix, suffix])

  useMotionValueEvent(value, 'change', (latest) => {
    if (ref.current) ref.current.textContent = format(latest)
  })

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      value.set(to)
      return
    }
    const controls = animate(value, to, { duration, ease: EASE })
    return () => controls.stop()
  }, [inView, reduced, to, duration, value])

  return (
    <span className={`tabular-nums ${className}`}>
      <span className="sr-only">{format(to)}</span>
      <span ref={ref} aria-hidden="true">
        {format(reduced ? to : 0)}
      </span>
    </span>
  )
}
