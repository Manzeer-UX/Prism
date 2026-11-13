import { motion, useReducedMotion } from 'motion/react'
import { brand, governance } from '../../content/prism'
import { EASE } from '../../lib/motion'
import { PrismMark } from '../ui/PrismMark'

/*
  Six dimensions of AI governance as one cut prism: PRISM AI is the centre
  face and the six dimensions are the facets around it, 01 at the top and
  running clockwise. Each facet's outer edge carries its spectrum band (the
  site's band marker, drawn at diagram scale); the active facet fills with it.
  Geometry is in viewBox units and the HTML label layer is positioned from the
  same numbers, so labels stay crisp and readable at any size.
*/

const W = 520
const H = 452
const CX = 260
const CY = 226
const R = 236 // outer vertex radius (flat-top hexagon, side = R)
const R0 = 84 // centre face vertex radius
const FRAME = R + 14
const COS30 = Math.cos(Math.PI / 6)

/** Spectrum hue per dimension, spread across the capability bands */
export const DIMENSION_BAND = [1, 3, 4, 6, 7, 9]

const pt = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) }
}
const n = (v: number) => v.toFixed(1)
const lerp = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
})

/** Facet i is centred on −90° + 60°·i */
const mid = (i: number) => -90 + i * 60

const hexagon = (r: number) =>
  Array.from({ length: 6 }, (_, k) => pt(k * 60, r))
    .map((p, k) => `${k ? 'L' : 'M'} ${n(p.x)} ${n(p.y)}`)
    .join(' ') + ' Z'

const facet = (i: number) => {
  const [a0, a1] = [mid(i) - 30, mid(i) + 30]
  return [pt(a0, R), pt(a1, R), pt(a1, R0), pt(a0, R0)]
    .map((p, k) => `${k ? 'L' : 'M'} ${n(p.x)} ${n(p.y)}`)
    .join(' ')
    .concat(' Z')
}

const outerEdge = (i: number) => {
  const a = pt(mid(i) - 30, R)
  const b = pt(mid(i) + 30, R)
  const inset = 12 / R
  const p = lerp(a, b, inset)
  const q = lerp(a, b, 1 - inset)
  return `M ${n(p.x)} ${n(p.y)} L ${n(q.x)} ${n(q.y)}`
}

/** Visual centre of a facet, where its label sits */
const labelAt = (i: number) => pt(mid(i), ((R0 + R) / 2) * COS30)
const px = (v: number) => `${(v / W) * 100}%`
const py = (v: number) => `${(v / H) * 100}%`

type Props = {
  active: number | null
  onActivate: (index: number | null) => void
  className?: string
}

export function GovernanceHub({ active, onActivate, className = '' }: Props) {
  const reduced = useReducedMotion() ?? false
  const viewport = { once: true, margin: '0px 0px -15% 0px' } as const
  const appear = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0 },
          whileInView: { opacity: 1 },
          viewport,
          transition: { duration: 0.5, ease: EASE, delay },
        }

  return (
    <div className={`relative w-full ${className}`} style={{ aspectRatio: `${W} / ${H}` }} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible">
        <motion.path d={hexagon(FRAME)} fill="none" stroke="var(--line)" {...appear(0)} />

        <g onPointerLeave={() => onActivate(null)}>
          {governance.dimensions.map((d, i) => {
            const band = `var(--band-${DIMENSION_BAND[i]})`
            const on = active === i
            return (
              <motion.g key={d.id} {...appear(0.12 + i * 0.07)}>
                <path
                  d={facet(i)}
                  fill={band}
                  fillOpacity={on ? 1 : 0.07}
                  stroke="var(--surface)"
                  strokeWidth={5}
                  strokeLinejoin="round"
                  className="cursor-pointer"
                  style={{ transition: 'fill-opacity 220ms cubic-bezier(0.22,1,0.36,1)' }}
                  onPointerEnter={() => onActivate(i)}
                  onClick={() => onActivate(on ? null : i)}
                />
                <motion.path
                  d={outerEdge(i)}
                  fill="none"
                  stroke={band}
                  strokeWidth={4}
                  strokeLinecap="round"
                  pointerEvents="none"
                  {...(reduced
                    ? {}
                    : {
                        initial: { pathLength: 0 },
                        whileInView: { pathLength: 1 },
                        viewport,
                        transition: { duration: 0.7, ease: EASE, delay: 0.35 + i * 0.07 },
                      })}
                />
              </motion.g>
            )
          })}
        </g>

        {/* Centre face */}
        <motion.path
          d={hexagon(R0 - 6)}
          fill="var(--surface)"
          stroke="var(--line-strong)"
          strokeLinejoin="round"
          {...appear(0.05)}
        />
      </svg>

      {/* Centre label */}
      <motion.div
        className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
        style={{ left: px(CX), top: py(CY) }}
        {...appear(0.1)}
      >
        <PrismMark className="size-7 sm:size-10" />
        <span className="text-[0.625rem] font-semibold tracking-[0.02em] whitespace-nowrap text-fg sm:text-[0.8125rem]">
          {brand.name}
        </span>
      </motion.div>

      {/* Facet labels: number on phones, number + title from 640 px */}
      {governance.dimensions.map((d, i) => {
        const p = labelAt(i)
        const on = active === i
        return (
          <motion.div
            key={d.id}
            className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-center"
            style={{ left: px(p.x), top: py(p.y) }}
            {...appear(0.45 + i * 0.07)}
          >
            <span
              className="font-mono text-[0.6875rem] tabular-nums transition-colors duration-200"
              style={{ color: on ? 'var(--surface)' : 'var(--fg-3)' }}
            >
              {d.number}
            </span>
            <span
              className="hidden text-[0.8125rem] leading-tight font-medium whitespace-nowrap transition-colors duration-200 sm:block"
              style={{ color: on ? 'var(--surface)' : 'var(--fg)' }}
            >
              {d.title}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}
