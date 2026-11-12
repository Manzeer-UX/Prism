import { useState } from 'react'

/* Sample prompt history — illustrative names, versions and dates. */
type Version = {
  id: string
  version: string
  env: 'Production' | 'Staging' | 'Development'
  status: 'Approved' | 'Awaiting approval' | 'Draft'
  author: string
  date: string
  diff: { type: 'add' | 'remove' | 'keep'; text: string }[]
}

const VERSIONS: Version[] = [
  {
    id: 'v14',
    version: 'v14',
    env: 'Staging',
    status: 'Awaiting approval',
    author: 'R. Mehta',
    date: '12 Nov',
    diff: [
      { type: 'keep', text: 'You are a support assistant for {product}.' },
      { type: 'remove', text: 'Answer every question in full detail.' },
      { type: 'add', text: 'Answer in three sentences or fewer.' },
      { type: 'add', text: 'Cite the knowledge-base article you used.' },
    ],
  },
  {
    id: 'v13',
    version: 'v13',
    env: 'Production',
    status: 'Approved',
    author: 'A. Okafor',
    date: '04 Nov',
    diff: [
      { type: 'keep', text: 'You are a support assistant for {product}.' },
      { type: 'remove', text: 'Be friendly.' },
      { type: 'add', text: 'Answer every question in full detail.' },
    ],
  },
  {
    id: 'v12',
    version: 'v12',
    env: 'Development',
    status: 'Draft',
    author: 'R. Mehta',
    date: '28 Oct',
    diff: [
      { type: 'keep', text: 'You are a support assistant for {product}.' },
      { type: 'add', text: 'Be friendly.' },
    ],
  },
]

const ENVS = ['Development', 'Staging', 'Production'] as const

export function PromptsView() {
  const [selected, setSelected] = useState('v14')
  const current = VERSIONS.find((v) => v.id === selected) ?? VERSIONS[0]

  return (
    <div className="grid gap-3 md:gap-4 lg:grid-cols-[17rem_1fr]">
      <div className="rounded-xl border border-line bg-surface">
        <div className="border-b border-line px-4 py-3 md:px-5">
          <p className="font-mono text-[0.8125rem] text-fg">support-reply</p>
          <p className="mt-1 text-[0.75rem] text-fg-3">Version history</p>
        </div>
        <ul className="p-2" aria-label="Prompt versions — select one to compare">
          {VERSIONS.map((v) => {
            const isSel = v.id === selected
            return (
              <li key={v.id}>
                <button
                  type="button"
                  aria-pressed={isSel}
                  onClick={() => setSelected(v.id)}
                  className={`flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 ${
                    isSel ? 'bg-raised' : 'hover:bg-raised/60'
                  }`}
                >
                  <span>
                    <span className="block font-mono text-[0.8125rem] text-fg">{v.version}</span>
                    <span className="mt-0.5 block text-[0.75rem] text-fg-3">
                      {v.author} · {v.date}
                    </span>
                  </span>
                  <span className="text-right text-meta text-fg-2">{v.env}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="flex flex-col rounded-xl border border-line bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-5">
          <ol className="flex items-center gap-1.5" aria-label="Deployment environments">
            {ENVS.map((env, i) => (
              <li key={env} className="flex items-center gap-1.5">
                <span
                  className={`rounded-md px-2 py-1 text-[0.75rem] ${
                    env === current.env ? 'bg-raised text-fg' : 'text-fg-3'
                  }`}
                >
                  {env}
                </span>
                {i < ENVS.length - 1 && (
                  <span className="text-fg-3" aria-hidden="true">
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
          <span className="text-meta text-fg-2">{current.status}</span>
        </div>
        <pre className="m-0 flex-1 overflow-x-auto p-4 font-mono text-[0.75rem] leading-6 md:p-5">
          {current.diff.map((line, i) => (
            <div
              key={i}
              className={
                line.type === 'add'
                  ? 'text-positive'
                  : line.type === 'remove'
                    ? 'text-negative line-through decoration-1'
                    : 'text-fg-2'
              }
            >
              <span className="mr-3 inline-block w-3 text-fg-3 select-none" aria-hidden="true">
                {line.type === 'add' ? '+' : line.type === 'remove' ? '−' : ' '}
              </span>
              <span className="sr-only">
                {line.type === 'add' ? 'Added: ' : line.type === 'remove' ? 'Removed: ' : ''}
              </span>
              {line.text}
            </div>
          ))}
        </pre>
        <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-line px-4 py-3 text-meta text-fg-3 md:px-5">
          <span>Compare with previous</span>
          <span>Rollback available</span>
          <span>Audit log: 3 entries</span>
        </div>
      </div>
    </div>
  )
}
