import { motion, useReducedMotion } from 'motion/react'
import { EASE } from '../../lib/motion'

/*
  Sample analytics for the illustrative console. Figures are made up, but kept
  consistent with the Overview sample: model costs sum to the Overview total,
  and request share, latency and pass rate average out to its headline figures.
*/

const MODELS = [
  { name: 'GPT-4o', requests: '517K', latency: '1.63s', pass: 93.8, cost: '$6,418.20' },
  { name: 'Claude 3.5', requests: '406K', latency: '1.39s', pass: 92.4, cost: '$4,197.53' },
  { name: 'Llama 3.1', requests: '308K', latency: '1.22s', pass: 91.1, cost: '$1,729.94' },
]

/** Daily cost split by model — shape only, no axis values */
const DAILY = [
  [52, 34, 14],
  [58, 37, 15],
  [55, 36, 16],
  [66, 41, 17],
  [61, 40, 18],
  [48, 30, 13],
  [70, 45, 19],
]
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const LATENCY = [
  { label: 'p50', value: 1.12 },
  { label: 'p95', value: 2.84 },
  { label: 'p99', value: 4.1 },
]

const SEGMENT = ['var(--accent)', 'var(--fg-3)', 'var(--line-strong)']
const SEGMENT_OPACITY = [1, 0.55, 1]

function CostChart() {
  const reduced = useReducedMotion()
  const max = Math.max(...DAILY.map((d) => d[0] + d[1] + d[2]))
  return (
    <div>
      <div
        className="flex h-40 items-end gap-2 md:h-44 md:gap-3"
        role="img"
        aria-label="Sample chart: daily cost by model over the last 7 days, highest on Sunday"
      >
        {DAILY.map((day, i) => {
          const total = day[0] + day[1] + day[2]
          return (
            <motion.div
              key={i}
              className="flex h-full flex-1 origin-bottom flex-col-reverse"
              initial={reduced ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 + i * 0.05 }}
            >
              <div
                className="flex flex-col-reverse gap-px overflow-hidden rounded-md"
                style={{ height: `${(total / max) * 100}%` }}
              >
                {day.map((v, j) => (
                  <span
                    key={j}
                    className="block w-full"
                    style={{
                      height: `${(v / total) * 100}%`,
                      backgroundColor: SEGMENT[j],
                      opacity: SEGMENT_OPACITY[j],
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>
      <div className="mt-2 flex gap-2 font-mono text-[0.6875rem] text-fg-3 md:gap-3" aria-hidden="true">
        {DAYS.map((d) => (
          <span key={d} className="flex-1 text-center">
            {d}
          </span>
        ))}
      </div>
    </div>
  )
}

export function AnalyticsView() {
  const reduced = useReducedMotion()
  const maxLatency = LATENCY[LATENCY.length - 1].value

  return (
    <div className="grid gap-3 md:gap-4">
      <div className="grid gap-3 md:gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface p-4 md:p-5 lg:col-span-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <p className="text-[0.875rem] font-medium text-fg">Cost by model</p>
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.75rem] text-fg-2">
              {MODELS.map((m, i) => (
                <li key={m.name} className="flex items-center gap-1.5">
                  <span
                    className="size-2 rounded-sm"
                    style={{ backgroundColor: SEGMENT[i], opacity: SEGMENT_OPACITY[i] }}
                    aria-hidden="true"
                  />
                  {m.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-5">
            <CostChart />
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-line bg-surface p-4 md:p-5">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-[0.875rem] font-medium text-fg">Latency percentiles</p>
            <span className="text-meta text-fg-3">All models</span>
          </div>
          <ul className="mt-5 flex flex-1 flex-col justify-center gap-5">
            {LATENCY.map((l, i) => (
              <li key={l.label}>
                <div className="flex items-baseline justify-between text-[0.875rem]">
                  <span className="font-mono text-[0.8125rem] text-fg-2">{l.label}</span>
                  <span className="font-mono text-[0.8125rem] text-fg tabular-nums">{l.value.toFixed(2)}s</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-raised">
                  <motion.div
                    className="h-full origin-left rounded-full"
                    style={{
                      width: `${(l.value / maxLatency) * 100}%`,
                      backgroundColor: i === 2 ? 'var(--accent)' : 'var(--fg-3)',
                      opacity: i === 2 ? 1 : 0.45 + i * 0.15,
                    }}
                    initial={reduced ? false : { scaleX: 0 }}
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

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="flex items-baseline justify-between gap-4 border-b border-line px-4 py-3 md:px-5">
          <p className="text-[0.875rem] font-medium text-fg">Model performance</p>
          <span className="text-meta text-fg-3">Last 7 days</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-[0.8125rem] md:text-[0.875rem]">
            <thead>
              <tr className="text-meta text-fg-3">
                <th scope="col" className="px-4 py-2.5 font-normal md:px-5">
                  Model
                </th>
                <th scope="col" className="px-3 py-2.5 text-right font-normal">
                  Requests
                </th>
                <th scope="col" className="px-3 py-2.5 text-right font-normal">
                  Avg. latency
                </th>
                <th scope="col" className="px-3 py-2.5 text-right font-normal">
                  Eval pass rate
                </th>
                <th scope="col" className="px-4 py-2.5 text-right font-normal md:px-5">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line border-t border-line">
              {MODELS.map((m) => (
                <tr key={m.name}>
                  <th scope="row" className="px-4 py-3 font-normal text-fg md:px-5">
                    {m.name}
                  </th>
                  <td className="px-3 py-3 text-right font-mono text-fg-2 tabular-nums">{m.requests}</td>
                  <td className="px-3 py-3 text-right font-mono text-fg-2 tabular-nums">{m.latency}</td>
                  <td className="px-3 py-3 text-right font-mono text-fg-2 tabular-nums">{m.pass.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-right font-mono text-fg tabular-nums md:px-5">{m.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
