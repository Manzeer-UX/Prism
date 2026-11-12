import { motion, useReducedMotion } from 'motion/react'
import { CountUp } from '../reactbits/CountUp'
import { overviewSample } from '../../content/prism'
import { EASE } from '../../lib/motion'

/* Sample trace volume for the chart — illustrative shape only (the source chart has no axis values). */
const SERIES = [38, 44, 41, 52, 49, 58, 55, 63, 60, 71, 68, 76, 74, 82]
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const CW = 640
const CH = 220
const PAD = { t: 12, r: 8, b: 8, l: 8 }

function smoothPath(points: [number, number][]) {
  // Catmull-Rom to cubic Bézier, tension 0.5
  let d = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0]} ${p2[1]}`
  }
  return d
}

function TracesChart() {
  const reduced = useReducedMotion()
  const max = 90
  const min = 20
  const innerW = CW - PAD.l - PAD.r
  const innerH = CH - PAD.t - PAD.b
  const pts = SERIES.map((v, i) => [
    PAD.l + (i / (SERIES.length - 1)) * innerW,
    PAD.t + (1 - (v - min) / (max - min)) * innerH,
  ]) as [number, number][]
  const line = smoothPath(pts)
  const area = `${line} L ${pts[pts.length - 1][0]} ${CH - PAD.b} L ${pts[0][0]} ${CH - PAD.b} Z`
  const last = pts[pts.length - 1]

  return (
    <svg
      viewBox={`0 0 ${CW} ${CH}`}
      className="h-auto w-full"
      role="img"
      aria-label="Sample chart: traces over the last 7 days, trending upward"
    >
      <defs>
        <linearGradient id="traces-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.16" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={PAD.l}
          x2={CW - PAD.r}
          y1={PAD.t + (i / 3) * innerH}
          y2={PAD.t + (i / 3) * innerH}
          stroke="var(--line)"
          strokeDasharray={i === 3 ? undefined : '2 4'}
        />
      ))}
      <motion.path
        d={area}
        fill="url(#traces-area)"
        initial={reduced ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinecap="round"
        initial={reduced ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: EASE }}
      />
      <motion.circle
        cx={last[0]}
        cy={last[1]}
        r={4}
        fill="var(--surface)"
        stroke="var(--accent)"
        strokeWidth={2}
        initial={reduced ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.1 }}
      />
    </svg>
  )
}

function StatFigure({ id, value, display }: { id: string; value: number; display: string }) {
  switch (id) {
    case 'traces':
      return <CountUp to={value} decimals={2} suffix="M" />
    case 'cost':
      return <CountUp to={value} decimals={2} prefix="$" />
    case 'latency':
      return <CountUp to={value} decimals={2} suffix="s" />
    case 'errors':
      return <CountUp to={value} decimals={2} suffix="%" />
    default:
      return <>{display}</>
  }
}

export function OverviewView() {
  const { stats, topModels, evaluationSuccessRate } = overviewSample
  return (
    <div className="grid gap-3 md:gap-4">
      <dl className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.id} className="rounded-xl border border-line bg-surface p-4 md:p-5">
            <dt className="text-[0.8125rem] text-fg-2">{s.label}</dt>
            <dd className="mt-3 font-display text-[1.5rem] leading-none font-medium tracking-[-0.02em] text-fg md:text-[1.75rem]">
              <StatFigure id={s.id} value={s.value} display={s.display} />
            </dd>
            <dd className="mt-3 text-meta text-fg-3">{s.change}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-3 md:gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface p-4 md:p-5 lg:col-span-2">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-[0.875rem] font-medium text-fg">Traces over time</p>
            <span className="text-meta text-fg-3">Last 7 days</span>
          </div>
          <div className="mt-4">
            <TracesChart />
            {/* Axis labels in HTML so they stay legible at any chart width */}
            <div className="mt-2 flex justify-between px-1 font-mono text-[0.6875rem] text-fg-3" aria-hidden="true">
              {DAYS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-line bg-surface p-4 md:p-5">
          <p className="text-[0.875rem] font-medium text-fg">Top models by usage</p>
          <ul className="mt-5 flex flex-1 flex-col justify-center gap-5">
            {topModels.map((m, i) => (
              <li key={m.name}>
                <div className="flex items-baseline justify-between text-[0.875rem]">
                  <span className="text-fg">{m.name}</span>
                  <span className="font-mono text-[0.8125rem] text-fg-2 tabular-nums">{m.share}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-raised">
                  <motion.div
                    className="h-full origin-left rounded-full"
                    style={{
                      width: `${m.share}%`,
                      backgroundColor: i === 0 ? 'var(--accent)' : 'var(--fg-3)',
                      opacity: i === 0 ? 1 : 0.6 - i * 0.12,
                    }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.3 + i * 0.08 }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4 md:p-5">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-[0.875rem] font-medium text-fg">Evaluation success rate</p>
          <span className="font-display text-[1.25rem] leading-none font-medium tracking-[-0.01em] text-fg">
            <CountUp to={evaluationSuccessRate} decimals={1} suffix="%" />
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-raised">
          <motion.div
            className="h-full origin-left rounded-full bg-positive"
            style={{ width: `${evaluationSuccessRate}%` }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: EASE, delay: 0.2 }}
          />
        </div>
      </div>
    </div>
  )
}
