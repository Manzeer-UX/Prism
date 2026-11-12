import { motion } from 'motion/react'
import { useState } from 'react'
import { EASE } from '../../lib/motion'

/* Sample trace of a multi-step agent run. Names and figures are illustrative. */
type Span = {
  id: string
  name: string
  kind: 'agent' | 'step' | 'retrieval' | 'llm' | 'tool' | 'eval'
  start: number
  end: number
  depth: 0 | 1
  detail: { label: string; value: string }[]
}

const TOTAL = 2.41

const SPANS: Span[] = [
  {
    id: 'run',
    name: 'agent.run',
    kind: 'agent',
    start: 0,
    end: 2.41,
    depth: 0,
    detail: [
      { label: 'Steps', value: '5' },
      { label: 'Tokens', value: '1,842' },
      { label: 'Cost', value: '$0.014' },
      { label: 'Status', value: 'Completed' },
    ],
  },
  {
    id: 'plan',
    name: 'plan.step',
    kind: 'step',
    start: 0.02,
    end: 0.31,
    depth: 1,
    detail: [
      { label: 'Decision', value: 'retrieve → answer' },
      { label: 'Tokens', value: '212' },
      { label: 'Latency', value: '0.29s' },
      { label: 'Status', value: 'OK' },
    ],
  },
  {
    id: 'retrieve',
    name: 'retrieval.search',
    kind: 'retrieval',
    start: 0.33,
    end: 0.74,
    depth: 1,
    detail: [
      { label: 'Chunks', value: '6 of 40' },
      { label: 'Sources cited', value: '3' },
      { label: 'Latency', value: '0.41s' },
      { label: 'Status', value: 'OK' },
    ],
  },
  {
    id: 'llm',
    name: 'llm.generate',
    kind: 'llm',
    start: 0.78,
    end: 1.92,
    depth: 1,
    detail: [
      { label: 'Model', value: 'GPT-4o' },
      { label: 'Tokens', value: '1,284' },
      { label: 'Latency', value: '1.14s' },
      { label: 'Cost', value: '$0.011' },
    ],
  },
  {
    id: 'tool',
    name: 'tool.call',
    kind: 'tool',
    start: 1.95,
    end: 2.18,
    depth: 1,
    detail: [
      { label: 'Tool', value: 'ticket.lookup' },
      { label: 'Attempts', value: '1' },
      { label: 'Latency', value: '0.23s' },
      { label: 'Status', value: 'OK' },
    ],
  },
  {
    id: 'eval',
    name: 'eval.judge',
    kind: 'eval',
    start: 2.2,
    end: 2.39,
    depth: 1,
    detail: [
      { label: 'Method', value: 'LLM-as-a-Judge' },
      { label: 'Relevance', value: 'Pass' },
      { label: 'Hallucination', value: 'None found' },
      { label: 'Latency', value: '0.19s' },
    ],
  },
]

export function TracesView() {
  const [selected, setSelected] = useState('llm')
  const span = SPANS.find((s) => s.id === selected) ?? SPANS[0]

  return (
    <div className="grid gap-3 md:gap-4 lg:grid-cols-[1fr_15rem]">
      <div className="rounded-xl border border-line bg-surface">
        <div className="flex items-baseline justify-between gap-4 border-b border-line px-4 py-3 md:px-5">
          <p className="text-[0.875rem] font-medium text-fg">Trace waterfall</p>
          <span className="text-meta text-fg-3">{TOTAL.toFixed(2)}s total</span>
        </div>
        <ul className="p-2" aria-label="Spans in this trace — select one to inspect">
          {SPANS.map((s, i) => {
            const isSel = s.id === selected
            const left = (s.start / TOTAL) * 100
            const width = Math.max(1.5, ((s.end - s.start) / TOTAL) * 100)
            return (
              <li key={s.id}>
                <button
                  type="button"
                  aria-pressed={isSel}
                  onClick={() => setSelected(s.id)}
                  className={`grid h-11 w-full grid-cols-[8.5rem_1fr_3.5rem] items-center gap-3 rounded-lg px-2 text-left transition-colors duration-150 sm:grid-cols-[10rem_1fr_3.5rem] ${
                    isSel ? 'bg-raised' : 'hover:bg-raised/60'
                  }`}
                >
                  <span
                    className={`truncate font-mono text-[0.75rem] ${isSel ? 'text-fg' : 'text-fg-2'}`}
                    style={{ paddingLeft: s.depth * 12 }}
                  >
                    {s.name}
                  </span>
                  <span className="relative h-2 rounded-full bg-raised">
                    <motion.span
                      className="absolute inset-y-0 origin-left rounded-full"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        backgroundColor: isSel ? 'var(--accent)' : 'var(--fg-3)',
                        opacity: isSel ? 1 : 0.45,
                      }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.05 }}
                    />
                  </span>
                  <span className="text-right font-mono text-[0.75rem] text-fg-3 tabular-nums">
                    {(s.end - s.start).toFixed(2)}s
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="rounded-xl border border-line bg-surface p-4 md:p-5" aria-live="polite">
        <p className="text-meta text-fg-3">Selected span</p>
        <p className="mt-2 font-mono text-[0.875rem] text-fg">{span.name}</p>
        <dl className="mt-4 divide-y divide-line">
          {span.detail.map((d) => (
            <div key={d.label} className="flex items-baseline justify-between gap-3 py-2.5 text-[0.8125rem]">
              <dt className="text-fg-2">{d.label}</dt>
              <dd className="text-right text-fg tabular-nums">{d.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
