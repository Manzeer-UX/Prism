import { motion } from 'motion/react'
import { overviewSample } from '../../content/prism'
import { EASE } from '../../lib/motion'

/* Sample scorecard — criteria names follow the PRISM capability list; scores are illustrative. */
const CRITERIA = [
  { name: 'Relevance', method: 'LLM-as-a-Judge', score: 94 },
  { name: 'Faithfulness', method: 'Hallucination detection', score: 91 },
  { name: 'Safety', method: 'Safety detection', score: 98 },
  { name: 'Tone & policy', method: 'Custom metric', score: 89 },
  { name: 'Regression suite', method: 'Benchmark dataset', score: 96 },
]

export function EvaluationsView() {
  return (
    <div className="grid gap-3 md:gap-4 lg:grid-cols-[15rem_1fr]">
      <div className="flex flex-col justify-between gap-6 rounded-xl border border-line bg-surface p-4 md:p-5">
        <div>
          <p className="text-[0.8125rem] text-fg-2">Evaluation success rate</p>
          <p className="mt-3 font-display text-[2.5rem] leading-none font-medium tracking-[-0.03em] text-fg tabular-nums">
            {overviewSample.evaluationSuccessRate}%
          </p>
        </div>
        <dl className="divide-y divide-line text-[0.8125rem]">
          <div className="flex justify-between py-2">
            <dt className="text-fg-2">Automated</dt>
            <dd className="text-fg tabular-nums">1,240 runs</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-fg-2">Human review</dt>
            <dd className="text-fg tabular-nums">86 runs</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-line bg-surface">
        <div className="flex items-baseline justify-between gap-4 border-b border-line px-4 py-3 md:px-5">
          <p className="text-[0.875rem] font-medium text-fg">Quality scorecard</p>
          <span className="text-meta text-fg-3">Pass rate</span>
        </div>
        <ul className="divide-y divide-line px-4 md:px-5">
          {CRITERIA.map((c, i) => (
            <li
              key={c.name}
              className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 py-3 sm:grid-cols-[11rem_1fr_3rem]"
            >
              <div>
                <p className="text-[0.875rem] text-fg">{c.name}</p>
                <p className="text-[0.75rem] text-fg-3">{c.method}</p>
              </div>
              <span className="order-3 col-span-2 h-1.5 overflow-hidden rounded-full bg-raised sm:order-none sm:col-span-1">
                <motion.span
                  className="block h-full origin-left rounded-full"
                  style={{
                    width: `${c.score}%`,
                    backgroundColor: i === 0 ? 'var(--accent)' : 'var(--fg-3)',
                    opacity: i === 0 ? 1 : 0.4,
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.1 + i * 0.05 }}
                />
              </span>
              <span className="text-right font-mono text-[0.8125rem] text-fg-2 tabular-nums">{c.score}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
