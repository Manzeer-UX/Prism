import { motion, useReducedMotion } from 'motion/react'
import { EASE } from '../../lib/motion'

/*
  Small line diagrams, one per "Why PRISM AI?" pillar. Each one draws the idea
  in the pillar's sentence — no numbers, no data claims. Neutral ink with a
  single accent element.
*/

const W = 240
const H = 120
const NEUTRAL = 'var(--fg-3)'
const ACCENT = 'var(--accent)'

function useAnim() {
  const reduced = useReducedMotion()
  const viewport = { once: true, margin: '0px 0px -15% 0px' } as const
  return {
    grow: (delay: number, origin: 'left' | 'bottom' = 'left') =>
      reduced
        ? {}
        : {
            initial: origin === 'left' ? { scaleX: 0 } : { scaleY: 0 },
            whileInView: origin === 'left' ? { scaleX: 1 } : { scaleY: 1 },
            viewport,
            transition: { duration: 0.6, ease: EASE, delay },
            style: {
              transformOrigin: origin === 'left' ? 'left center' : 'center bottom',
              transformBox: 'fill-box' as const,
            },
          },
    draw: (delay: number, duration = 1) =>
      reduced
        ? {}
        : {
            initial: { pathLength: 0 },
            whileInView: { pathLength: 1 },
            viewport,
            transition: { duration, ease: EASE, delay },
          },
    fade: (delay: number) =>
      reduced
        ? {}
        : { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport, transition: { duration: 0.4, delay } },
  }
}

/** Complete visibility — a trace waterfall */
function Visibility() {
  const a = useAnim()
  const spans = [
    { x: 0, w: 236, accent: false },
    { x: 8, w: 52, accent: false },
    { x: 64, w: 50, accent: false },
    { x: 118, w: 82, accent: true },
    { x: 204, w: 28, accent: false },
  ]
  return (
    <>
      {spans.map((s, i) => (
        <motion.rect
          key={i}
          x={s.x + 2}
          y={10 + i * 22}
          width={s.w}
          height={8}
          rx={4}
          fill={s.accent ? ACCENT : NEUTRAL}
          fillOpacity={s.accent ? 1 : i === 0 ? 0.55 : 0.35}
          {...a.grow(0.1 + i * 0.08)}
        />
      ))}
    </>
  )
}

/** Quality & reliability — a score line that dips below its threshold and is caught */
function Quality() {
  const a = useAnim()
  const d = 'M 2 44 C 30 40, 44 36, 66 38 S 110 34, 128 40 S 150 86, 164 84 S 186 46, 204 40 S 228 36, 238 34'
  return (
    <>
      <line x1={2} x2={238} y1={62} y2={62} stroke={NEUTRAL} strokeOpacity={0.6} strokeDasharray="3 4" />
      <motion.path d={d} fill="none" stroke={NEUTRAL} strokeWidth={1.5} strokeLinecap="round" {...a.draw(0.1, 1.1)} />
      <motion.g {...a.fade(0.9)}>
        <circle cx={162} cy={84} r={9} fill="none" stroke={ACCENT} strokeWidth={1.5} />
        <circle cx={162} cy={84} r={2.5} fill={ACCENT} />
        <line x1={162} x2={162} y1={93} y2={114} stroke={ACCENT} strokeWidth={1.5} />
      </motion.g>
    </>
  )
}

/** Enterprise governance — an append-only audit trail */
function Governance() {
  const a = useAnim()
  return (
    <>
      {[0, 1, 2, 3].map((i) => {
        const y = 12 + i * 27
        const accent = i === 3
        return (
          <motion.g key={i} {...a.fade(0.1 + i * 0.1)}>
            <rect
              x={2}
              y={y}
              width={14}
              height={14}
              rx={4}
              fill="none"
              stroke={accent ? ACCENT : NEUTRAL}
              strokeWidth={1.25}
            />
            <path
              d={`M ${5.5} ${y + 7} l 2.5 2.5 l 4.5 -5`}
              fill="none"
              stroke={accent ? ACCENT : NEUTRAL}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect x={28} y={y + 3} width={[120, 96, 132, 108][i]} height={8} rx={4} fill={NEUTRAL} fillOpacity={0.35} />
            <rect x={196} y={y + 3} width={42} height={8} rx={4} fill={NEUTRAL} fillOpacity={0.2} />
          </motion.g>
        )
      })}
      <line x1={9} x2={9} y1={26} y2={93} stroke={NEUTRAL} strokeOpacity={0.35} />
    </>
  )
}

/** Cost optimization — usage against a budget line */
function Cost() {
  const a = useAnim()
  const bars = [62, 74, 70, 86, 66, 58, 52, 46]
  const bw = 20
  const gap = (236 - bars.length * bw) / (bars.length - 1)
  return (
    <>
      <line x1={2} x2={238} y1={34} y2={34} stroke={NEUTRAL} strokeOpacity={0.6} strokeDasharray="3 4" />
      {bars.map((h, i) => {
        const last = i === bars.length - 1
        return (
          <motion.rect
            key={i}
            x={2 + i * (bw + gap)}
            y={118 - h}
            width={bw}
            height={h}
            rx={4}
            fill={last ? ACCENT : NEUTRAL}
            fillOpacity={last ? 1 : 0.35}
            {...a.grow(0.1 + i * 0.05, 'bottom')}
          />
        )
      })}
    </>
  )
}

/** Secure & compliant — role-based access inside isolated environments */
function Secure() {
  const a = useAnim()
  const grants = [
    [1, 1, 0, 0],
    [1, 0, 1, 0],
    [1, 1, 1, 2],
  ]
  return (
    <>
      <motion.rect
        x={1}
        y={4}
        width={110}
        height={112}
        rx={12}
        fill="none"
        stroke={NEUTRAL}
        strokeOpacity={0.6}
        strokeDasharray="4 4"
        {...a.fade(0.05)}
      />
      <motion.rect
        x={129}
        y={4}
        width={110}
        height={112}
        rx={12}
        fill="none"
        stroke={NEUTRAL}
        strokeOpacity={0.6}
        strokeDasharray="4 4"
        {...a.fade(0.15)}
      />
      {[0, 1].map((env) =>
        grants.map((row, r) =>
          row.map((g, c) => {
            const v =
              env === 0
                ? g
                : [
                    [1, 0, 0, 1],
                    [1, 1, 0, 0],
                    [1, 0, 1, 0],
                  ][r][c]
            const accent = env === 0 && v === 2
            const x = 13 + env * 128 + c * 23
            const y = 24 + r * 28
            return (
              <motion.rect
                key={`${env}-${r}-${c}`}
                x={x}
                y={y}
                width={17}
                height={17}
                rx={4}
                fill={accent ? ACCENT : v ? NEUTRAL : 'none'}
                fillOpacity={accent ? 1 : v ? 0.4 : 0}
                stroke={v ? 'none' : NEUTRAL}
                strokeOpacity={0.5}
                {...a.fade(0.2 + (r * 4 + c) * 0.03 + env * 0.1)}
              />
            )
          }),
        ),
      )}
    </>
  )
}

const GLYPHS = {
  visibility: Visibility,
  quality: Quality,
  governance: Governance,
  cost: Cost,
  secure: Secure,
} as const

export function PillarGlyph({ id, className = '' }: { id: keyof typeof GLYPHS; className?: string }) {
  const Glyph = GLYPHS[id]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden="true" fill="none">
      <Glyph />
    </svg>
  )
}

export type PillarGlyphId = keyof typeof GLYPHS
