import { AbsoluteFill } from 'remotion'
import { DashboardShowcase, box, centre, pad, union, type CamKey, type Highlight } from '../components/DashboardShowcase'
import type { CursorKey } from '../components/Cursor'
import { RefractionWipe } from '../components/SceneTransition'
import type { SceneProps } from '../Film'
import { EASE, ramp } from '../lib/anim'
import { M, chapter, scene } from '../timeline'
import { BANDS, color, font, type } from '../theme'
import { REQUEST_TEXT } from './InvisibleChainScene'

const S = scene('product').from
/** seconds → film frame */
const F = (s: number) => Math.round(s * 30)

/* ------------------------------------------------------------ elements */

const rail = (name: 'traces' | 'prompts' | 'evaluations' | 'analytics') => centre(box('overview', 'rail', name))

const OV = {
  traces: box('overview', 'card', 'Total traces'),
  cost: box('overview', 'card', 'Total cost'),
  latency: box('overview', 'card', 'Average latency'),
  errors: box('overview', 'card', 'Error rate'),
}
const TR = {
  card: box('traces', 'card', 'Trace waterfall'),
  span: box('traces', 'card', 'Selected span'),
  run: box('traces', 'row', 'agent.run'),
  plan: box('traces', 'row', 'plan.step'),
  retrieve: box('traces', 'row', 'retrieval.search'),
  llm: box('traces', 'row', 'llm.generate'),
  tool: box('traces', 'row', 'tool.call'),
  eval: box('traces', 'row', 'eval.judge'),
}
const PR = {
  versions: box('prompts', 'card', 'support-reply'),
  v14: box('prompts', 'row', 'v14'),
  v13: box('prompts', 'row', 'v13'),
  v12: box('prompts', 'row', 'v12'),
  diff: box('prompts', 'pre'),
}
const PR_FOOTER = { x: PR.diff.x, y: PR.diff.y + PR.diff.h + 2, w: PR.diff.w, h: 40 }
const EV = {
  rate: box('evaluations', 'card', 'Evaluation success rate'),
  card: box('evaluations', 'card', 'Quality scorecard'),
  tone: box('evaluations', 'li', 'Tone & policy'),
  regression: box('evaluations', 'li', 'Regression suite'),
}
const AN = {
  cost: box('analytics', 'card', 'Cost by model'),
  latency: box('analytics', 'card', 'Latency percentiles'),
  table: box('analytics', 'card', 'Model performance'),
  gpt: box('analytics', 'tr', 'GPT-4o'),
}

/* ------------------------------------------------------------ timeline */

const STATES = [
  { from: 0, state: 'overview' as const },
  { from: F(64.55), state: 'traces-run' as const },
  { from: F(67.95), state: 'traces' as const },
  { from: F(69.05), state: 'traces-plan' as const },
  { from: F(69.95), state: 'traces-tool' as const },
  { from: F(72.0), state: 'prompts' as const },
  { from: F(76.45), state: 'prompts-v13' as const },
  { from: F(79.5), state: 'evaluations' as const },
  { from: F(87.5), state: 'analytics' as const },
]

const full = { cx: 632, cy: 350 }
const CAMERA: CamKey[] = [
  { f: F(56.4), zoom: 0.9, ...full, rx: 13, ry: -16 },
  { f: F(59.0), zoom: 1.0, ...full, rx: 4, ry: -4 },
  { f: F(60.8), zoom: 1.0, cx: 640, cy: 345, rx: 3, ry: -2 },
  { f: F(61.5), zoom: 1.14, cx: 650, cy: 262, rx: 2, ry: -1 },
  { f: F(64.3), zoom: 1.12, cx: 640, cy: 262, rx: 2, ry: 0 },
  // traces
  { f: F(65.4), zoom: 1.28, cx: 600, cy: 232, rx: 2, ry: 1 },
  { f: F(67.5), zoom: 1.28, cx: 610, cy: 232, rx: 1, ry: 1 },
  { f: F(68.3), zoom: 1.24, cx: 660, cy: 236, rx: 1, ry: -1 },
  { f: F(71.6), zoom: 1.22, cx: 650, cy: 236, rx: 1, ry: -1 },
  // prompts
  { f: F(72.9), zoom: 1.24, cx: 662, cy: 210, rx: 2, ry: 1 },
  { f: F(79.2), zoom: 1.22, cx: 650, cy: 212, rx: 1, ry: 0 },
  // evaluations
  { f: F(80.3), zoom: 1.18, cx: 660, cy: 262, rx: 2, ry: -1 },
  { f: F(87.1), zoom: 1.16, cx: 650, cy: 262, rx: 1, ry: 0 },
  // analytics
  { f: F(88.4), zoom: 1.06, cx: 632, cy: 330, rx: 2, ry: 1 },
  { f: F(90.6), zoom: 1.06, cx: 632, cy: 330, rx: 1, ry: 0 },
  { f: F(92.0), zoom: 1.0, cx: 632, cy: 345, rx: 3, ry: -2 },
  { f: F(95.2), zoom: 1.0, cx: 632, cy: 345, rx: 3, ry: -3 },
  { f: F(96.4), zoom: 0.8, cx: 632, cy: 345, rx: 12, ry: -10 },
]

const H = (from: number, to: number, b: typeof OV.traces, extra: Partial<Highlight> = {}): Highlight => ({
  from: F(from),
  to: F(to),
  box: pad(b, 4),
  ...extra,
})

const HIGHLIGHTS: Highlight[] = [
  // overview — activity, performance, errors, usage
  H(61.45, 62.1, OV.traces),
  H(62.1, 62.8, OV.latency),
  H(62.8, 63.3, OV.errors),
  H(63.3, 64.3, OV.cost),
  // traces — follow the path, then open each step
  H(65.05, 65.3, TR.run, { dim: 0.32 }),
  H(65.3, 65.55, TR.plan, { dim: 0.32 }),
  H(65.55, 65.8, TR.retrieve, { dim: 0.32 }),
  H(65.8, 66.05, TR.llm, { dim: 0.32 }),
  H(66.05, 66.3, TR.tool, { dim: 0.32 }),
  H(66.3, 66.55, TR.eval, { dim: 0.32 }),
  H(66.55, 67.9, TR.card, { dim: 0.3 }),
  H(68.0, 69.05, TR.llm, { secondary: pad(TR.span, 3) }),
  H(69.05, 69.95, TR.plan, { secondary: pad(TR.span, 3) }),
  H(69.95, 71.7, TR.tool, { secondary: pad(TR.span, 3) }),
  // prompts — versions, changes, comparison
  H(72.6, 74.75, PR.versions),
  H(74.75, 75.05, PR.v14),
  H(75.05, 75.35, PR.v13),
  H(75.35, 75.65, PR.v12),
  H(75.65, 76.45, pad(PR.diff, 2)),
  H(76.5, 77.55, pad(PR.diff, 2), { secondary: pad(PR.v13, 3) }),
  H(77.55, 79.2, PR_FOOTER),
  // evaluations — quality, issues, before users see them
  H(80.1, 81.4, EV.rate),
  H(81.4, 82.6, EV.card),
  H(82.7, 83.75, EV.tone, { tone: 'warn' }),
  H(83.75, 84.9, EV.regression),
  H(84.9, 87.1, union(EV.rate, EV.card), { dim: 0.35 }),
  // analytics — usage, speed, cost, then the decision
  H(88.55, 89.15, AN.table),
  H(89.15, 89.7, AN.latency),
  H(89.7, 90.7, AN.cost),
  H(91.7, 93.2, AN.gpt),
]

const at = (b: typeof OV.traces, dx = 0, dy = 0) => ({ x: centre(b).x + dx, y: centre(b).y + dy })
const k = (s: number, p: { x: number; y: number }): CursorKey => ({ f: F(s), x: p.x, y: p.y })

const CURSOR: CursorKey[] = [
  k(63.4, { x: 760, y: 470 }),
  k(64.4, rail('traces')),
  k(64.9, rail('traces')),
  k(65.5, { x: 640, y: 470 }),
  k(67.4, { x: 640, y: 470 }),
  k(67.9, at(TR.llm, -170)),
  k(68.6, at(TR.llm, -170)),
  k(69.0, at(TR.plan, -190)),
  k(69.5, at(TR.plan, -190)),
  k(69.9, at(TR.tool, -200)),
  k(71.4, at(TR.tool, -200)),
  k(71.95, rail('prompts')),
  k(72.4, rail('prompts')),
  k(73.0, at(PR.v14, 40, 60)),
  k(75.9, at(PR.v14, 40, 60)),
  k(76.4, at(PR.v13, -40)),
  k(78.8, at(PR.v13, -40)),
  k(79.45, rail('evaluations')),
  k(79.9, rail('evaluations')),
  k(80.6, { x: 700, y: 520 }),
  k(86.9, { x: 700, y: 520 }),
  k(87.45, rail('analytics')),
  k(88.2, rail('analytics')),
]
const CLICKS = [64.55, 67.95, 69.05, 69.95, 72.0, 76.45, 79.5, 87.5].map(F)
const CURSOR_SHOW: [number, number][] = [
  [F(63.3), F(65.6)],
  [F(67.3), F(70.7)],
  [F(71.4), F(73.2)],
  [F(75.8), F(77.0)],
  [F(78.9), F(80.4)],
  [F(86.9), F(88.4)],
]

const CHAPTER_INFO = [
  { id: 'overview', title: 'See the complete picture', illustrates: [[1, 'Observability'], [7, 'Analytics']] },
  { id: 'traces', title: 'Follow the execution', illustrates: [[1, 'Observability'], [4, 'Agent monitoring'], [5, 'RAG & knowledge']] },
  { id: 'prompts', title: 'Control the instructions', illustrates: [[2, 'Prompt governance']] },
  { id: 'evaluations', title: 'Measure quality', illustrates: [[3, 'Evaluation'], [6, 'Experiments']] },
  { id: 'analytics', title: 'Understand performance and cost', illustrates: [[7, 'Analytics'], [8, 'Cost intelligence']] },
] as const

const LABEL: Record<string, string> = { overview: 'Overview', traces: 'Traces', prompts: 'Prompts', evaluations: 'Evaluations', analytics: 'Analytics' }

function ChapterTitle({ g }: { g: number }) {
  return (
    <>
      {CHAPTER_INFO.map((c, i) => {
        const ch = chapter(c.id)
        const a = ramp(g, ch.from + (i === 0 ? 18 : 6), 14, EASE)
        const b = ramp(g, ch.to - 10, 10, EASE)
        const o = a * (1 - b)
        if (o <= 0.001) return null
        return (
          <div key={c.id} style={{ position: 'absolute', left: 128, top: 52, opacity: o, transform: `translateY(${(1 - a) * 10}px)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: font.mono, fontSize: 20, color: color.fg2 }}>
              <span style={{ color: color.fg3 }}>{String(i + 1).padStart(2, '0')}</span>
              <span>{LABEL[c.id]}</span>
            </div>
            <div style={{ ...type.title, fontSize: 46, marginTop: 6, color: color.fg }}>{c.title}</div>
            <div style={{ display: 'flex', gap: 18, marginTop: 12, fontFamily: font.mono, fontSize: 16, color: color.fg3, alignItems: 'center' }}>
              <span>Illustrates</span>
              {c.illustrates.map(([n, name]) => (
                <span key={n} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: color.fg2 }}>
                  <span style={{ width: 3, height: 14, borderRadius: 3, background: BANDS[n - 1] }} />
                  {String(n).padStart(2, '0')} {name}
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </>
  )
}

/** The S2 request, docked onto the trace that PRISM AI captured for it */
/**
 * The connector runs in the empty gutter between the rail and the cards, so it
 * never crosses the span names: out from the left edge of the agent.run row,
 * down the gutter, and into the note below the waterfall.
 */
function RequestNote({ p }: { p: number }) {
  const noteX = TR.card.x
  const noteY = TR.card.y + TR.card.h + 22
  const noteH = 64
  const gutter = TR.card.x - 9
  const ax = TR.run.x + 4
  const ay = TR.run.y + TR.run.h / 2
  const by = noteY + noteH / 2
  const path = `M ${ax} ${ay} H ${gutter + 6} Q ${gutter} ${ay} ${gutter} ${ay + 6} V ${by - 6} Q ${gutter} ${by} ${gutter + 6} ${by} H ${noteX}`
  return (
    <>
      <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={1} height={1}>
        <path
          d={path}
          fill="none"
          stroke={color.accent}
          strokeWidth={1.5}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="100 100"
          strokeDashoffset={100 * (1 - p)}
          opacity={0.9}
        />
        <circle cx={ax} cy={ay} r={3} fill={color.accent} opacity={p} />
      </svg>
      <div style={{ position: 'absolute', left: noteX, top: noteY, opacity: p, transform: `translateY(${(1 - p) * 10}px)` }}>
        <div
          style={{
            width: 520,
            height: noteH,
            boxSizing: 'border-box',
            borderRadius: 12,
            border: `1px solid rgba(76,141,255,0.55)`,
            background: 'rgba(13, 22, 44, 0.94)',
            padding: '11px 16px',
            boxShadow: '0 0 30px rgba(76,141,255,0.2)',
          }}
        >
          <div style={{ fontFamily: font.mono, fontSize: 12, color: color.accentInk }}>agent.run · the request from before</div>
          <div style={{ marginTop: 6, fontFamily: font.sans, fontSize: 17, color: color.fg }}>{REQUEST_TEXT}</div>
        </div>
      </div>
    </>
  )
}

/**
 * 05 — The PRISM AI product experience (57–96 s)
 * The real console, captured from the website: Overview, Traces, Prompts,
 * Evaluations, Analytics — one meaningful interaction at a time, all figures
 * labelled as sample data.
 */
export function ProductExperienceScene({ frame }: SceneProps) {
  const g = frame + S
  const reveal = M('refraction')
  const wipe = ramp(g, reveal, 34)
  const exit = ramp(g, F(95.4), 30, EASE)
  const topBand = ramp(g, F(57.6), 20)

  const showcase = (
    <DashboardShowcase
      frame={g}
      states={STATES}
      camera={CAMERA}
      highlights={HIGHLIGHTS}
      cursor={{ keys: CURSOR, clicks: CLICKS, show: CURSOR_SHOW }}
      annotations={[{ from: F(65.0), to: F(67.6), render: (p) => <RequestNote p={p} /> }]}
      sheen={[F(58.2), F(93.3)]}
      opacity={1 - exit}
      blur={exit * 8}
    />
  )

  return (
    <AbsoluteFill>
      {wipe < 1 ? <RefractionWipe progress={wipe}>{showcase}</RefractionWipe> : showcase}
      {/* a quiet band so chapter titles read over the interface */}
      <AbsoluteFill
        style={{
          opacity: topBand * (1 - exit),
          background: 'linear-gradient(to bottom, rgba(6,9,17,0.96) 0%, rgba(6,9,17,0.86) 12%, rgba(6,9,17,0) 22%)',
        }}
      />
      <AbsoluteFill
        style={{
          opacity: topBand * (1 - exit),
          background: 'linear-gradient(to top, rgba(6,9,17,0.9) 0%, rgba(6,9,17,0) 9%)',
        }}
      />
      <div style={{ opacity: 1 - exit }}>
        <ChapterTitle g={g} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 128,
          bottom: 30,
          fontFamily: font.mono,
          fontSize: 17,
          color: color.fg3,
          opacity: topBand * (1 - exit),
          letterSpacing: '0.01em',
        }}
      >
        Conceptual interface · illustrative sample data
      </div>
    </AbsoluteFill>
  )
}
