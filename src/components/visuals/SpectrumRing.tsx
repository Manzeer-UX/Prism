import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { capabilities } from '../../content/prism'
import { DURATION, EASE } from '../../lib/motion'

/*
  The "Core capabilities" wheel from the source infographic, redrawn as a
  nine-band instrument dial. The active segment follows the reader's scroll
  position; clicking a segment jumps to that capability.
*/

const SIZE = 400
const C = SIZE / 2
const R = 158
const SEG = 360 / 9
const GAP = 2.4

const polar = (deg: number, r: number) => {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: C + r * Math.cos(rad), y: C + r * Math.sin(rad) }
}

const arc = (i: number, r: number) => {
  const a0 = i * SEG + GAP / 2
  const a1 = (i + 1) * SEG - GAP / 2
  const p0 = polar(a0, r)
  const p1 = polar(a1, r)
  return `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${r} ${r} 0 0 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`
}

type SpectrumRingProps = {
  activeIndex: number
  onSelect: (index: number) => void
}

export function SpectrumRing({ activeIndex, onSelect }: SpectrumRingProps) {
  const reduced = useReducedMotion()
  const active = capabilities[activeIndex] ?? capabilities[0]

  return (
    <div className="relative aspect-square w-full">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx={C} cy={C} r={R - 34} fill="none" stroke="var(--line-strong)" />
        <circle cx={C} cy={C} r={R + 22} fill="none" stroke="var(--line)" />

        {capabilities.map((cap, i) => {
          const on = i === activeIndex
          const mid = polar(i * SEG + SEG / 2, R + 38)
          const tick = [polar(i * SEG, R - 12), polar(i * SEG, R + 12)]
          return (
            <g
              key={cap.id}
              className="cursor-pointer"
              onClick={() => onSelect(i)}
              style={{ ['--band' as string]: `var(--band-${i + 1})` }}
            >
              {/* generous invisible hit area */}
              <path d={arc(i, R)} stroke="transparent" strokeWidth={40} fill="none" />
              <path d={arc(i, R)} stroke="var(--band)" strokeOpacity={0.4} strokeWidth={2} fill="none" />
              <path
                d={arc(i, R)}
                stroke="var(--band)"
                strokeWidth={12}
                strokeLinecap="butt"
                fill="none"
                style={{
                  opacity: on ? 1 : 0,
                  transition: `opacity ${reduced ? 0 : 280}ms cubic-bezier(0.22,1,0.36,1)`,
                }}
              />
              <line x1={tick[0].x} y1={tick[0].y} x2={tick[1].x} y2={tick[1].y} stroke="var(--line-strong)" />
              <text
                x={mid.x}
                y={mid.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="font-mono"
                fontSize={12}
                fill={on ? 'var(--fg)' : 'var(--fg-3)'}
                style={{ transition: 'fill 200ms' }}
              >
                {cap.number}
              </text>
            </g>
          )
        })}
      </svg>

      <div className="pointer-events-none absolute inset-[24%] grid place-items-center text-center">
        <AnimatePresence initial={false}>
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: DURATION.menu, ease: EASE }}
            className="flex flex-col items-center [grid-area:1/1]"
            aria-hidden="true"
          >
            <span className="font-display text-[3.5rem] leading-none font-medium tracking-[-0.04em] text-fg tabular-nums xl:text-[4.25rem]">
              {active.number}
            </span>
            <span
              className="mt-3 h-[3px] w-8 rounded-full"
              style={{ backgroundColor: `var(--band-${activeIndex + 1})` }}
            />
            <span className="mt-3 max-w-[12rem] text-[0.9375rem] leading-snug text-fg-2">{active.title}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
