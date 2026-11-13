import { capabilities } from '@site/content/prism'
import { Activity, BarChart3, BookOpenText, ClipboardCheck, Coins, FileText, FlaskConical, ShieldCheck, Workflow, type LucideIcon } from 'lucide-react'
import { EASE, clamp, ramp } from '../lib/anim'
import { BANDS, color, font } from '../theme'
import { BrandMark } from './BrandLockup'

/** One recognisable icon per official capability group, in the site's Lucide set */
const ICONS: LucideIcon[] = [Activity, FileText, ClipboardCheck, Workflow, BookOpenText, FlaskConical, BarChart3, Coins, ShieldCheck]

const SEG = 360 / 9
const GAP = 2.4

const polar = (cx: number, cy: number, deg: number, r: number) => {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}
const arc = (cx: number, cy: number, i: number, r: number) => {
  const a0 = i * SEG + GAP / 2
  const a1 = (i + 1) * SEG - GAP / 2
  const p0 = polar(cx, cy, a0, r)
  const p1 = polar(cx, cy, a1, r)
  return `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${r} ${r} 0 0 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`
}

/** Official titles, sentence case as on the website, broken where a label needs two lines */
const TITLE_LINES: string[][] = [
  ['AI observability', '& tracing'],
  ['Prompt governance'],
  ['Evaluation &', 'quality assurance'],
  ['Agent & workflow', 'monitoring'],
  ['RAG & knowledge', 'governance'],
  ['Datasets &', 'experiments'],
  ['Analytics &', 'dashboards'],
  ['Cost & usage', 'intelligence'],
  ['Security &', 'governance'],
]

export type WheelTiming = {
  /** frame the ring starts drawing */
  draw: number
  /** frame each segment lights (9 values) */
  segment: number[]
  /** frame the wheel is complete and the centre glows */
  complete: number
}

/**
 * The nine-capability wheel — the website's spectrum dial, scaled for the
 * stage, with the PRISM AI mark at its centre. Segments light in groups.
 */
export function CapabilityWheel({ frame, timing, cx = 960, cy = 580, r = 268 }: { frame: number; timing: WheelTiming; cx?: number; cy?: number; r?: number }) {
  const draw = ramp(frame, timing.draw, 30, EASE)
  const complete = ramp(frame, timing.complete, 18, EASE)
  const centreIn = ramp(frame, timing.draw + 6, 20, EASE)
  // which group is "speaking"
  const groupOf = (i: number) => Math.floor(i / 3)
  const activeGroup = timing.segment.reduce((g, f, i) => (frame >= f ? groupOf(i) : g), -1)

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <defs>
          <radialGradient id="wheel-core" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#4c8dff" stopOpacity={0.22 + 0.25 * complete} />
            <stop offset="1" stopColor="#4c8dff" stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r * 0.78} fill="url(#wheel-core)" opacity={centreIn} />
        {/* frame circles */}
        <circle
          cx={cx}
          cy={cy}
          r={r - 54}
          fill="none"
          stroke="rgba(238,240,245,0.18)"
          strokeWidth={1.5}
          pathLength={100}
          strokeDasharray="100 100"
          strokeDashoffset={100 * (1 - draw)}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r + 34}
          fill="none"
          stroke="rgba(238,240,245,0.09)"
          strokeWidth={1.5}
          pathLength={100}
          strokeDasharray="100 100"
          strokeDashoffset={100 * (1 - draw)}
        />
        {capabilities.map((cap, i) => {
          const on = ramp(frame, timing.segment[i], 14, EASE)
          const speaking = groupOf(i) === activeGroup ? 1 : 0
          const weight = on * (0.55 + 0.45 * Math.max(speaking, complete))
          const tick = [polar(cx, cy, i * SEG, r - 16), polar(cx, cy, i * SEG, r + 16)]
          const mid = polar(cx, cy, i * SEG + SEG / 2, r)
          const ray = ramp(frame, timing.draw + 4 + i * 2, 16, EASE) * (1 - ramp(frame, timing.segment[i], 12))
          return (
            <g key={cap.id}>
              {/* trace lines from the centre out to each capability */}
              {ray > 0.01 ? (
                <line
                  x1={cx}
                  y1={cy}
                  x2={cx + (mid.x - cx) * ray}
                  y2={cy + (mid.y - cy) * ray}
                  stroke={BANDS[i]}
                  strokeWidth={2}
                  strokeOpacity={0.8 * (1 - ray * 0.3)}
                />
              ) : null}
              <path d={arc(cx, cy, i, r)} stroke={BANDS[i]} strokeOpacity={0.4 * draw} strokeWidth={2} fill="none" />
              <path
                d={arc(cx, cy, i, r)}
                stroke={BANDS[i]}
                strokeWidth={16}
                fill="none"
                pathLength={100}
                strokeDasharray="100 100"
                strokeDashoffset={100 * (1 - on)}
                opacity={weight}
                style={{ filter: `drop-shadow(0 0 ${10 + 14 * speaking}px ${BANDS[i]}80)` }}
              />
              <line x1={tick[0].x} y1={tick[0].y} x2={tick[1].x} y2={tick[1].y} stroke="rgba(238,240,245,0.18)" strokeWidth={1.5} opacity={draw} />
            </g>
          )
        })}
      </svg>

      {/* numbers, icons and titles */}
      {capabilities.map((cap, i) => {
        const on = ramp(frame, timing.segment[i] + 3, 14, EASE)
        if (on <= 0) return null
        const a = i * SEG + SEG / 2
        const num = polar(cx, cy, a, r - 92)
        const label = polar(cx, cy, a, r + 74)
        const Icon = ICONS[i]
        const side = Math.sin((a * Math.PI) / 180)
        const align: 'left' | 'right' | 'center' = side > 0.25 ? 'left' : side < -0.25 ? 'right' : 'center'
        const tx = align === 'left' ? '0%' : align === 'right' ? '-100%' : '-50%'
        const ty = Math.cos((a * Math.PI) / 180) > 0.5 ? '-100%' : Math.cos((a * Math.PI) / 180) < -0.5 ? '0%' : '-50%'
        const speaking = groupOf(i) === activeGroup || complete > 0
        return (
          <div key={cap.id}>
            <div
              style={{
                position: 'absolute',
                left: num.x,
                top: num.y,
                transform: `translate(-50%, -50%) scale(${0.9 + 0.1 * on})`,
                opacity: on,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Icon size={30} strokeWidth={1.6} color={BANDS[i]} />
              <span style={{ fontFamily: font.mono, fontSize: 15, color: color.fg3 }}>{cap.number}</span>
            </div>
            <div
              style={{
                position: 'absolute',
                left: label.x,
                top: label.y,
                transform: `translate(${tx}, ${ty}) translateX(${(1 - on) * (align === 'right' ? 12 : align === 'left' ? -12 : 0)}px)`,
                opacity: on * (speaking ? 1 : 0.62),
                textAlign: align,
                fontFamily: font.sans,
                fontWeight: 500,
                fontSize: 27,
                lineHeight: 1.22,
                color: color.fg,
                whiteSpace: 'nowrap',
              }}
            >
              {TITLE_LINES[i].map((l) => (
                <div key={l}>{l}</div>
              ))}
            </div>
          </div>
        )
      })}

      {/* the centre: PRISM AI */}
      <div
        style={{
          position: 'absolute',
          left: cx,
          top: cy,
          transform: `translate(-50%, -50%) scale(${0.85 + 0.15 * centreIn + 0.06 * complete})`,
          opacity: centreIn,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <BrandMark size={92} style={{ filter: `drop-shadow(0 0 ${18 + 22 * complete}px rgba(76,141,255,${0.35 + 0.3 * complete}))` }} />
        <span style={{ fontFamily: font.sans, fontWeight: 600, fontSize: 20, letterSpacing: '0.04em', color: color.fg, opacity: clamp(centreIn * 1.2) }}>
          PRISM AI
        </span>
      </div>
    </div>
  )
}
