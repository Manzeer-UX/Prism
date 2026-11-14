import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import { Activity, CircleArrowRight, ClipboardCheck, Play, UserCheck, type LucideIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Reveal } from '../components/ui/Reveal'
import { gateWay } from '../content/prism'
import { useOnScreen } from '../lib/hooks'

const ICONS: Record<string, LucideIcon> = {
  execute: Play,
  trace: Activity,
  evaluate: ClipboardCheck,
  validate: UserCheck,
  continue: CircleArrowRight,
}

const GATE = 3 // index of the human approval step

/*
  One cycle of the flow, as fractions of the loop. The agent token travels the
  track station by station, holds at the approval gate until it is approved,
  then continues and the cycle rests before repeating.
*/
const CYCLE_S = 9
const ARRIVE = [0.04, 0.2, 0.36, 0.52, 0.84] // token reaches each station
const APPROVED_AT = 0.66
const LEAVE_GATE = 0.7
const X = ['10%', '30%', '50%', '70%', '90%']

function useFlowProgress(active: boolean, reduced: boolean) {
  const progress = useMotionValue(reduced ? 0.9 : 0)
  useEffect(() => {
    if (reduced) {
      progress.set(0.9)
      return
    }
    if (!active) return
    const controls = animate(progress, [0, 1], { duration: CYCLE_S, ease: 'linear', repeat: Infinity })
    return () => controls.stop()
  }, [active, reduced, progress])
  return progress
}

function Station({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const step = gateWay.steps[index]
  const Icon = ICONS[step.id]
  const reached = useTransform(progress, (v): number => (v >= ARRIVE[index] ? 1 : 0))
  const opacity = useTransform(reached, [0, 1], [0.45, 1])
  const ring = useTransform(reached, (r) => (r ? 'var(--line-strong)' : 'var(--line)'))
  const isGate = index === GATE
  const approved = useTransform(progress, [APPROVED_AT - 0.02, APPROVED_AT], [0, 1])
  const pending = useTransform(approved, [0, 1], [1, 0])
  const waiting = useTransform(progress, (v): number => (v >= ARRIVE[GATE] && v < APPROVED_AT ? 1 : 0))

  return (
    <div className="relative flex flex-col items-center text-center">
      <motion.span
        className="relative flex size-12 items-center justify-center rounded-xl border bg-raised text-fg"
        style={{ opacity, borderColor: ring }}
      >
        <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
        {isGate && (
          <motion.span
            className="absolute -inset-1.5 rounded-[14px] border border-dashed"
            style={{ borderColor: 'var(--band-6)', opacity: waiting }}
          />
        )}
      </motion.span>
      {isGate ? (
        <span className="relative mt-3 h-5 w-full text-[0.6875rem] font-medium" aria-hidden="true">
          <motion.span className="absolute inset-x-0 text-fg-3" style={{ opacity: pending }}>
            Awaiting approval
          </motion.span>
          <motion.span className="absolute inset-x-0 text-positive" style={{ opacity: approved }}>
            Approved
          </motion.span>
        </span>
      ) : (
        <span className="mt-3 h-5" aria-hidden="true" />
      )}
    </div>
  )
}

/** Horizontal, animated flow (md and up) */
function Flow() {
  const reduced = useReducedMotion() ?? false
  const ref = useRef<HTMLDivElement>(null)
  const onScreen = useOnScreen(ref)
  const progress = useFlowProgress(onScreen, reduced)

  const times = [0, ARRIVE[0], ARRIVE[1], ARRIVE[2], ARRIVE[3], LEAVE_GATE, ARRIVE[4], 1]
  const left = useTransform(progress, times, [X[0], X[0], X[1], X[2], X[3], X[3], X[4], X[4]])
  const tokenOpacity = useTransform(progress, [0, 0.03, 0.93, 1], [0, 1, 1, 0])
  const fill = useTransform(left, (l) => `calc(${l} - 10%)`)

  return (
    <div ref={ref} className="relative hidden md:block" aria-hidden="true">
      {/* Track: sits behind the station tiles at their vertical centre */}
      <div className="absolute top-6 right-[10%] left-[10%] h-px bg-line-strong" />
      <motion.div
        className="absolute top-6 left-[10%] h-px"
        style={{
          width: fill,
          background: 'linear-gradient(to right, var(--band-2), var(--band-5), var(--band-8))',
        }}
      />
      <motion.span
        className="absolute top-6 z-10 block size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg shadow-[0_0_0_4px_rgb(238_240_245/0.12),0_0_18px_rgb(238_240_245/0.5)]"
        style={{ left, opacity: reduced ? 0 : tokenOpacity }}
      />
      <div className="relative grid grid-cols-5">
        {gateWay.steps.map((s, i) => (
          <Station key={s.id} index={i} progress={progress} />
        ))}
      </div>
    </div>
  )
}

/**
 * 08 · G.A.T.E. Way — agentic governance. Rendered only while `gateWay.show`
 * is true, and labelled as a product direction until `gateWay.status` is
 * 'available' (the brief's publication condition).
 */
export function GateWay() {
  if (!gateWay.show) return null
  const direction = gateWay.status === 'direction'

  return (
    <section id="gate-way" data-theme="dark" aria-labelledby="gate-title" className="relative">
      <div className="shell section-pad">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal className="flex flex-wrap items-center gap-3">
              <p className="text-meta text-fg-3">{gateWay.eyebrow}</p>
              {direction && (
                <span className="inline-flex h-6 items-center rounded-full border border-line-strong px-2.5 text-[0.6875rem] font-medium tracking-[0.04em] text-fg-2 uppercase">
                  {gateWay.directionLabel}
                </span>
              )}
            </Reveal>
            <Reveal delay={0.05} blur>
              <h2 id="gate-title" className="mt-4 max-w-[18ch] text-display-l text-fg">
                {gateWay.title}
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="lg:col-span-5 lg:self-end lg:pb-1">
            <p className="text-title text-fg">
              {gateWay.name} <span className="text-fg-3">—</span>{' '}
              <span className="rounded-[4px] bg-accent/35 box-decoration-clone px-1.5 text-fg">
                {gateWay.expansion}
              </span>
            </p>
            <div className="mt-4 space-y-3">
              {gateWay.body.map((p, i) => (
                <p key={i} className="text-fg-2">
                  {p}
                </p>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-14 rounded-2xl border border-line bg-surface p-5 md:mt-20 md:p-8 lg:p-10">
          <p className="text-meta tracking-[0.06em] text-fg-3 uppercase">{gateWay.flowLabel}</p>

          <div className="mt-8 md:mt-10">
            <Flow />
          </div>

          <ol className="mt-2 grid gap-0 md:mt-6 md:grid-cols-5 md:gap-4">
            {gateWay.steps.map((s, i) => {
              const Icon = ICONS[s.id]
              const gate = i === GATE
              return (
                <li
                  key={s.id}
                  className="relative flex gap-4 border-t border-line py-5 first:border-t-0 md:block md:border-t-0 md:py-0 md:text-center"
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl border bg-raised text-fg md:hidden ${
                      gate ? 'border-dashed border-(--band-6)' : 'border-line-strong'
                    }`}
                    aria-hidden="true"
                  >
                    <Icon size={18} strokeWidth={1.5} />
                  </span>
                  <div>
                    <h3 className="flex items-baseline gap-2 text-[1.0625rem] font-medium text-fg md:justify-center">
                      <span className="font-mono text-[0.75rem] font-normal text-fg-3 tabular-nums">{s.number}</span>
                      {s.title}
                    </h3>
                    <p className="mt-1.5 text-[0.875rem] text-fg-2 md:mx-auto md:max-w-[15rem]">{s.body}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </Reveal>

        <Reveal className="mt-14 md:mt-20">
          <p className="text-display-m">
            <span className="text-fg-2">{gateWay.closing[0]}</span>{' '}
            <span className="text-fg">{gateWay.closing[1]}</span>
          </p>
        </Reveal>
      </div>
    </section>
  )
}
