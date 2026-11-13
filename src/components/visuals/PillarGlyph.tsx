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

/** Enterprise governance — inbound actions pass through a governance shield */
function Governance() {
  const a = useAnim()
  const shield = 'M 120 8 L 164 22 V 56 C 164 84 145 102 120 112 C 95 102 76 84 76 56 V 22 Z'
  return (
    <>
      {[36, 60, 84].map((y, i) => (
        <motion.line
          key={y}
          x1={2}
          x2={70}
          y1={y}
          y2={y}
          stroke={NEUTRAL}
          strokeOpacity={0.6}
          strokeDasharray="3 4"
          {...a.fade(0.1 + i * 0.08)}
        />
      ))}
      <motion.path d={shield} stroke={NEUTRAL} strokeWidth={1.5} strokeLinejoin="round" {...a.draw(0.1, 1)} />
      <motion.path
        d="M 106 60 l 9 9 l 19 -20"
        stroke={ACCENT}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...a.draw(0.85, 0.45)}
      />
      <motion.line x1={170} x2={238} y1={60} y2={60} stroke={ACCENT} strokeWidth={1.5} {...a.grow(1.1)} />
      <motion.circle cx={238} cy={60} r={2.5} fill={ACCENT} {...a.fade(1.4)} />
    </>
  )
}

/** Cost intelligence — a spend meter with its budget mark */
function Cost() {
  const a = useAnim()
  const reduced = useReducedMotion()
  const cx = 120
  const cy = 108
  const r = 92
  const value = 0.62
  const budget = 0.8
  const at = (t: number, radius: number) => {
    const th = Math.PI - t * Math.PI
    return { x: cx + radius * Math.cos(th), y: cy - radius * Math.sin(th) }
  }
  const end = at(value, r)
  const b1 = at(budget, r + 9)
  const b2 = at(budget, r - 12)
  const needle = -90 + value * 180
  return (
    <>
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        stroke={NEUTRAL}
        strokeOpacity={0.3}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <motion.path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${end.x.toFixed(1)} ${end.y.toFixed(1)}`}
        stroke={ACCENT}
        strokeWidth={6}
        strokeLinecap="round"
        {...a.draw(0.15, 1)}
      />
      {Array.from({ length: 9 }, (_, i) => {
        const p = at(i / 8, r - 16)
        const q = at(i / 8, r - 22)
        return (
          <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={NEUTRAL} strokeOpacity={0.6} strokeWidth={1.25} />
        )
      })}
      <motion.line
        x1={b1.x}
        y1={b1.y}
        x2={b2.x}
        y2={b2.y}
        stroke={NEUTRAL}
        strokeWidth={1.5}
        strokeDasharray="2 3"
        {...a.fade(0.6)}
      />
      <motion.g
        style={{ transformBox: 'view-box', transformOrigin: `${cx}px ${cy}px` }}
        initial={reduced ? false : { rotate: -90 }}
        whileInView={{ rotate: needle }}
        viewport={{ once: true, margin: '0px 0px -15% 0px' }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
      >
        <line x1={cx} y1={cy} x2={cx} y2={cy - 66} stroke={NEUTRAL} strokeWidth={2} strokeLinecap="round" />
      </motion.g>
      <circle cx={cx} cy={cy} r={5} fill="var(--surface)" stroke={NEUTRAL} strokeWidth={1.5} />
    </>
  )
}

/** Security & accountability — stacked access-control layers, locked at the top */
function Security() {
  const a = useAnim()
  const layer = (y: number) => `M 40 ${y + 20} L 120 ${y} L 200 ${y + 20} L 120 ${y + 40} Z`
  const ys = [70, 42, 14]
  return (
    <>
      {ys.map((y, i) => {
        const top = i === ys.length - 1
        return (
          <motion.path
            key={y}
            d={layer(y)}
            fill="var(--surface)"
            stroke={top ? ACCENT : NEUTRAL}
            strokeOpacity={top ? 1 : 0.7}
            strokeWidth={1.5}
            strokeLinejoin="round"
            {...a.fade(0.1 + i * 0.15)}
          />
        )
      })}
      <motion.g {...a.fade(0.65)}>
        <path d="M 115 33 V 29 a 5 5 0 0 1 10 0 V 33" stroke={ACCENT} strokeWidth={1.5} strokeLinecap="round" />
        <rect x={111} y={33} width={18} height={12} rx={3} fill={ACCENT} />
      </motion.g>
      {[
        [76, 82],
        [164, 82],
        [86, 54],
        [154, 54],
      ].map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y + 8} r={2.5} fill={NEUTRAL} fillOpacity={0.7} {...a.fade(0.4 + i * 0.06)} />
      ))}
    </>
  )
}

const GLYPHS = {
  visibility: Visibility,
  quality: Quality,
  governance: Governance,
  cost: Cost,
  security: Security,
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
