import { AnimatePresence, motion } from 'motion/react'
import { Activity, BarChart3, ClipboardCheck, FileText, LayoutDashboard, type LucideIcon } from 'lucide-react'
import { useRef, useState, type KeyboardEvent } from 'react'
import { platform, type ConsoleTab } from '../../content/prism'
import { DURATION, EASE } from '../../lib/motion'
import { PrismMark } from '../ui/PrismMark'
import { AnalyticsView } from './AnalyticsView'
import { EvaluationsView } from './EvaluationsView'
import { OverviewView } from './OverviewView'
import { PromptsView } from './PromptsView'
import { TracesView } from './TracesView'

export type ViewId = ConsoleTab['id']

type ViewMeta = {
  icon: LucideIcon
  render: () => React.ReactNode
}

const META: Record<ViewId, ViewMeta> = {
  overview: { icon: LayoutDashboard, render: () => <OverviewView /> },
  traces: { icon: Activity, render: () => <TracesView /> },
  prompts: { icon: FileText, render: () => <PromptsView /> },
  evaluations: { icon: ClipboardCheck, render: () => <EvaluationsView /> },
  analytics: { icon: BarChart3, render: () => <AnalyticsView /> },
}

const VIEWS = platform.tabs.map((t) => ({ ...t, ...META[t.id] }))

type ConsolePreviewProps = {
  /** Selected view; pass with `onActiveChange` to control it from outside */
  active?: ViewId
  onActiveChange?: (id: ViewId) => void
}

export function ConsolePreview({ active: controlled, onActiveChange }: ConsolePreviewProps = {}) {
  const [own, setOwn] = useState<ViewId>('overview')
  const active = controlled ?? own
  const setActive = (id: ViewId) => {
    if (controlled === undefined) setOwn(id)
    onActiveChange?.(id)
  }
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
      <div className="-mx-5 [scrollbar-width:none] overflow-x-auto px-5 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
        <div
          role="tablist"
          aria-label="Console views"
          onKeyDown={onKeyDown}
          className="inline-flex rounded-xl border border-line bg-surface p-1"
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
                className={`relative h-10 flex-none rounded-lg px-3 text-[0.8125rem] font-medium whitespace-nowrap transition-colors duration-150 md:px-4 md:text-[0.875rem] ${
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
                <span className="relative">
                  <span className="mr-1.5 font-mono text-[0.6875rem] text-fg-3 tabular-nums" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {v.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* What the selected view is for */}
      <div className="mt-6" aria-live="polite">
        <p className="text-title text-fg">{view.headline}</p>
        <p className="mt-2 max-w-[40rem] text-fg-2">{view.body}</p>
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
              <PrismMark size={22} />
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
    </div>
  )
}
