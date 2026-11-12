import { AnimatePresence, motion } from 'motion/react'
import { Activity, ClipboardCheck, FileText, LayoutDashboard, type LucideIcon } from 'lucide-react'
import { useRef, useState, type KeyboardEvent } from 'react'
import { capabilities, editorial } from '../../content/prism'
import { DURATION, EASE } from '../../lib/motion'
import { BandMarker } from '../ui/BandMarker'
import { PrismMark } from '../ui/PrismMark'
import { EvaluationsView } from './EvaluationsView'
import { OverviewView } from './OverviewView'
import { PromptsView } from './PromptsView'
import { TracesView } from './TracesView'

type ViewId = 'overview' | 'traces' | 'prompts' | 'evaluations'

type View = {
  id: ViewId
  label: string
  icon: LucideIcon
  /** Capability ids from content/prism.ts that this view illustrates */
  illustrates: string[]
  render: () => React.ReactNode
}

const VIEWS: View[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    illustrates: ['observability', 'analytics', 'cost'],
    render: () => <OverviewView />,
  },
  {
    id: 'traces',
    label: 'Traces',
    icon: Activity,
    illustrates: ['observability', 'agent-monitoring', 'rag-governance'],
    render: () => <TracesView />,
  },
  {
    id: 'prompts',
    label: 'Prompts',
    icon: FileText,
    illustrates: ['prompt-governance'],
    render: () => <PromptsView />,
  },
  {
    id: 'evaluations',
    label: 'Evaluations',
    icon: ClipboardCheck,
    illustrates: ['evaluation', 'datasets'],
    render: () => <EvaluationsView />,
  },
]

const capIndex = new Map(capabilities.map((c, i) => [c.id, { cap: c, band: i + 1 }]))

export function ConsolePreview() {
  const [active, setActive] = useState<ViewId>('overview')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const view = VIEWS.find((v) => v.id === active) ?? VIEWS[0]

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = VIEWS.findIndex((v) => v.id === active)
    let next = i
    if (e.key === 'ArrowRight') next = (i + 1) % VIEWS.length
    else if (e.key === 'ArrowLeft') next = (i - 1 + VIEWS.length) % VIEWS.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = VIEWS.length - 1
    else return
    e.preventDefault()
    setActive(VIEWS[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div
          role="tablist"
          aria-label="Console views"
          onKeyDown={onKeyDown}
          className="inline-flex w-full rounded-xl border border-line bg-surface p-1 md:w-auto"
        >
          {VIEWS.map((v, i) => {
            const selected = v.id === active
            return (
              <button
                key={v.id}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                role="tab"
                id={`console-tab-${v.id}`}
                aria-selected={selected}
                aria-controls="console-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(v.id)}
                className={`relative h-10 flex-1 rounded-lg px-3 text-[0.8125rem] font-medium transition-colors duration-150 md:flex-none md:px-4 md:text-[0.875rem] ${
                  selected ? 'text-fg' : 'text-fg-2 hover:text-fg'
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId="console-tab"
                    className="absolute inset-0 rounded-lg bg-raised"
                    transition={{ duration: DURATION.menu, ease: EASE }}
                  />
                )}
                <span className="relative">{v.label}</span>
              </button>
            )
          })}
        </div>

        <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-meta text-fg-3" aria-live="polite">
          <span>Illustrates</span>
          {view.illustrates.map((id) => {
            const entry = capIndex.get(id)
            if (!entry) return null
            return (
              <a
                key={id}
                href={`#cap-${id}`}
                className="inline-flex items-center gap-1.5 text-fg-2 transition-colors duration-150 hover:text-fg"
              >
                <BandMarker band={entry.band} className="h-3" />
                {entry.cap.number} {entry.cap.short}
              </a>
            )
          })}
        </p>
      </div>

      {/* Window */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-line-strong bg-raised shadow-[0_1px_2px_rgba(17,24,39,0.05),0_24px_48px_-24px_rgba(17,24,39,0.22)]">
        <div className="flex">
          {/* Rail — mirrors the tabs above; decorative */}
          <div
            aria-hidden="true"
            className="hidden w-14 shrink-0 flex-col items-center gap-2 bg-brand-navy py-4 text-white md:flex"
          >
            <span className="mb-3 flex size-9 items-center justify-center rounded-lg bg-white/10">
              <PrismMark size={18} />
            </span>
            {VIEWS.map((v) => {
              const Icon = v.icon
              const on = v.id === active
              return (
                <span
                  key={v.id}
                  className={`flex size-9 items-center justify-center rounded-lg transition-colors duration-150 ${
                    on ? 'bg-white/15 text-white' : 'text-white/55'
                  }`}
                >
                  <Icon size={18} strokeWidth={1.5} />
                </span>
              )
            })}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex h-12 items-center justify-between gap-4 border-b border-line bg-surface px-4 md:px-5">
              <p className="text-[0.875rem] font-medium text-fg">{view.label}</p>
              <div className="flex items-center gap-4">
                <span className="hidden text-meta text-fg-3 sm:inline">Sample data</span>
                <span className="inline-flex items-center gap-2 text-[0.75rem] text-fg-2">
                  <span className="size-1.5 rounded-full bg-positive" aria-hidden="true" />
                  System operational
                </span>
              </div>
            </div>

            <div
              id="console-panel"
              role="tabpanel"
              aria-labelledby={`console-tab-${active}`}
              tabIndex={0}
              className="relative min-h-[26rem] p-3 focus-visible:outline-offset-[-2px] md:p-5"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: DURATION.menu, ease: EASE }}
                >
                  {view.render()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 max-w-[46rem] text-[0.8125rem] text-fg-3">{editorial.consoleNote}</p>
    </div>
  )
}
