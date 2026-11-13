import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { brand, capabilities } from '../../content/prism'
import { useOnScreen } from '../../lib/hooks'

/*
  Closing echo of the hero, told in two acts.

  1. Scroll: the nine capability bands sweep in from wide apart, draw toward
     the prism and converge on its face; the prism draws itself and the single
     governed beam extends out the far side.
  2. Loop (once fully assembled): a synchronised wave — one pulse per band
     leaves together, accelerates into the prism, the prism lights up, and one
     white burst fires along the exit beam. Then a short rest. Many controls,
     one engine.

  Reduced motion: the finished diagram, no scrubbing and no loop.
*/

const W = 1200
const H = 360
const A = { x: 600, y: 96 }
const B = { x: 528, y: 290 }
const C = { x: 672, y: 290 }
const MID_Y = 180

const onLeft = (t: number) => ({ x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t })
const onRight = (t: number) => ({ x: A.x + (C.x - A.x) * t, y: A.y + (C.y - A.y) * t })

const ENTRIES = capabilities.map((_, i) => onLeft(0.42 + i * 0.022))
const EXIT = onRight(0.6)
const EXIT_END = { x: W, y: EXIT.y + 8 }
const START_Y = capabilities.map((_, i) => 24 + i * 39)

/** Band path; `spread` > 1 fans the left ends further apart (off-canvas at the start of the scroll) */
const bandPath = (i: number, spread: number) => {
  const y = MID_Y + (START_Y[i] - MID_Y) * spread
  const e = ENTRIES[i]
  return `M 0 ${y.toFixed(1)} C 260 ${y.toFixed(1)} ${e.x - 200} ${e.y} ${e.x} ${e.y}`
}

const PRISM = `M ${A.x} ${A.y} L ${C.x} ${C.y} L ${B.x} ${B.y} Z`
const EXIT_PATH = `M ${EXIT.x} ${EXIT.y} L ${EXIT_END.x} ${EXIT_END.y}`

function Band({ i, progress }: { i: number; progress: MotionValue<number> }) {
  // Centre bands lead, outer bands follow — the fan closes like an aperture.
  const lag = Math.abs(i - 4) * 0.025
  const spread = useTransform(progress, [0, 0.8], [1.8, 1])
  const d = useTransform(spread, (s) => bandPath(i, s))
  const draw = useTransform(progress, [0.04 + lag, 0.7 + lag], [0, 1])
  const opacity = useTransform(draw, [0, 0.03], [0, 1])

  return (
    <motion.path
      d={d}
      stroke={`var(--band-${i + 1})`}
      strokeOpacity={0.7}
      strokeWidth={1.25}
      style={{ pathLength: draw, opacity }}
    />
  )
}

export function ConvergeBeam() {
  const reduced = useReducedMotion() ?? false
  const wrapRef = useRef<HTMLDivElement>(null)
  const onScreen = useOnScreen(wrapRef)

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start end', 'end end'] })
  // A spring keeps the scrub smooth and runs in JS, so every mapping below is exact.
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.0005 })
  const finished = useMotionValue(1)
  const progress = reduced ? finished : smooth

  const prismDraw = useTransform(progress, [0, 0.35], [0, 1])
  const prismFill = useTransform(progress, [0.25, 0.6], [0, 1])
  const innerRays = useTransform(progress, [0.68, 0.86], [0, 0.45])
  const beamDraw = useTransform(progress, [0.74, 0.96], [0, 1])
  const beamOpacity = useTransform(beamDraw, [0, 0.03], [0, 1])
  const labelOpacity = useTransform(progress, [0.3, 0.55], [0, 1])

  // The loop only starts once the diagram is fully assembled.
  const [armed, setArmed] = useState(false)
  useMotionValueEvent(smooth, 'change', (v) => setArmed(v > 0.97))
  useEffect(() => setArmed(smooth.get() > 0.97), [smooth])

  return (
    <div ref={wrapRef} className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        aria-hidden="true"
        data-paused={!onScreen}
        data-armed={armed && !reduced}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="converge-face" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#eef0f5" stopOpacity="0.08" />
            <stop offset="1" stopColor="#eef0f5" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <g fill="none" strokeLinecap="round">
          {/* Act 1 — bands converge */}
          {capabilities.map((c, i) => (
            <Band key={c.id} i={i} progress={progress} />
          ))}

          {/* Rays inside the prism, from each entry point to the single exit */}
          <motion.g style={{ opacity: innerRays }}>
            {ENTRIES.map((e, i) => (
              <line key={i} x1={e.x} y1={e.y} x2={EXIT.x} y2={EXIT.y} stroke={`var(--band-${i + 1})`} strokeWidth={1} />
            ))}
          </motion.g>

          <motion.path
            d={PRISM}
            fill="url(#converge-face)"
            stroke="var(--fg)"
            strokeOpacity={0.55}
            strokeWidth={1.25}
            strokeLinejoin="round"
            style={{ pathLength: prismDraw, fillOpacity: prismFill }}
          />

          {/* The governed beam: a soft body plus a crisp core */}
          <motion.path
            d={EXIT_PATH}
            stroke="var(--fg)"
            strokeOpacity={0.07}
            strokeWidth={8}
            style={{ pathLength: beamDraw, opacity: beamOpacity }}
          />
          <motion.path
            d={EXIT_PATH}
            stroke="var(--fg)"
            strokeWidth={2}
            style={{ pathLength: beamDraw, opacity: beamOpacity }}
          />

          {/* Act 2 — the synchronised wave (CSS-driven, see index.css) */}
          {capabilities.map((c, i) => (
            <path
              key={c.id}
              d={bandPath(i, 1)}
              pathLength={100}
              className="converge-in"
              stroke={`var(--band-${i + 1})`}
              strokeWidth={2.75}
            />
          ))}
          <g className="converge-flash">
            {ENTRIES.map((e, i) => (
              <line
                key={i}
                x1={e.x}
                y1={e.y}
                x2={EXIT.x}
                y2={EXIT.y}
                stroke={`var(--band-${i + 1})`}
                strokeWidth={1.5}
              />
            ))}
            <path
              d={PRISM}
              fill="rgb(238 240 245 / 0.07)"
              stroke="var(--fg)"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
          </g>
          <path d={EXIT_PATH} pathLength={100} className="converge-out" stroke="var(--fg)" strokeWidth={4} />
          <path
            d={EXIT_PATH}
            pathLength={100}
            className="converge-out"
            stroke="var(--fg)"
            strokeOpacity={0.12}
            strokeWidth={12}
          />
        </g>
      </svg>

      <motion.p
        aria-hidden="true"
        className="absolute -translate-x-1/2 pt-3 text-meta text-fg-3"
        style={{ left: `${(A.x / W) * 100}%`, top: `${(B.y / H) * 100}%`, opacity: labelOpacity }}
      >
        {brand.name}
      </motion.p>
    </div>
  )
}
