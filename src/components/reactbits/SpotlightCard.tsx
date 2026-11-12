/**
 * SpotlightCard — adapted from React Bits (https://reactbits.dev/components/spotlight-card,
 * MIT + Commons Clause). Pointer position is written to CSS variables (no React
 * re-render per move) and the light is a neutral wash, not a coloured glow.
 */
import { useRef, type HTMLAttributes, type PointerEvent, type ReactNode } from 'react'

type SpotlightCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  /** Any CSS colour; keep it neutral and low-alpha */
  spotlightColor?: string
  radius?: number
}

export function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgb(255 255 255 / 0.06)',
  radius = 360,
  ...rest
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || event.pointerType !== 'mouse') return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
    el.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      className={`group/spot relative isolate overflow-hidden ${className}`}
      {...rest}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 ease-(--ease-prism) group-hover/spot:opacity-100"
        style={{
          background: `radial-gradient(${radius}px circle at var(--spot-x, 50%) var(--spot-y, 50%), ${spotlightColor}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  )
}
