import { useRef } from 'react'
import { platform, type ConsoleTab } from '../../content/prism'
import { useOnScreen } from '../../lib/hooks'

/*
  "Look at what happened behind it": a single beam — the output — enters a
  three-dimensional prism and resolves into the five console views. The ray of
  the selected view is lit and carries a pulse; the others recede. Drawn at a
  fixed size (it only appears on wide screens), so text stays crisp.
*/

type ViewId = ConsoleTab['id']
type Point = { x: number; y: number }

const W = 480
const H = 320

const A = { x: 230, y: 16 } // apex
const B = { x: 150, y: 256 } // bottom left
const C = { x: 310, y: 256 } // bottom right
const DEPTH = { x: 26, y: -16 } // back face offset, gives the prism volume

const lerp = (p: Point, q: Point, t: number) => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t })
const n = (v: number) => v.toFixed(1)

const ENTRY = lerp(A, B, 0.42)
const RAY_BAND = [1, 3, 5, 7, 9]
const EXITS = RAY_BAND.map((_, i) => lerp(A, C, 0.46 + i * 0.04))
const RAY_END_X = 366
const RAY_Y = RAY_BAND.map((_, i) => 92 + i * 39)
const LABEL_X = 378

const tri = (o: Point = { x: 0, y: 0 }) =>
  `M ${n(A.x + o.x)} ${n(A.y + o.y)} L ${n(C.x + o.x)} ${n(C.y + o.y)} L ${n(B.x + o.x)} ${n(B.y + o.y)} Z`

const edge = (p: Point) => `M ${n(p.x)} ${n(p.y)} L ${n(p.x + DEPTH.x)} ${n(p.y + DEPTH.y)}`

type Props = {
  active: ViewId
  onSelect: (id: ViewId) => void
  className?: string
}

export function PlatformPrism({ active, onSelect, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const onScreen = useOnScreen(ref)
  const activeIndex = Math.max(
    0,
    platform.tabs.findIndex((t) => t.id === active),
  )

  return (
    <div ref={ref} className={className} style={{ width: W, height: H }} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="overflow-visible" data-paused={!onScreen}>
        <defs>
          {/* userSpaceOnUse: a bounding-box gradient never paints on a perfectly flat line */}
          <linearGradient id="pp-beam" gradientUnits="userSpaceOnUse" x1={24} x2={ENTRY.x} y1={0} y2={0}>
            <stop offset="0" style={{ stopColor: 'var(--fg)', stopOpacity: 0 }} />
            <stop offset="0.45" style={{ stopColor: 'var(--fg)', stopOpacity: 0.55 }} />
            <stop offset="1" style={{ stopColor: 'var(--fg)', stopOpacity: 0.7 }} />
          </linearGradient>
          <linearGradient id="pp-face" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--surface)', stopOpacity: 0.95 }} />
            <stop offset="1" style={{ stopColor: 'var(--band-4)', stopOpacity: 0.07 }} />
          </linearGradient>
          <linearGradient id="pp-back" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--band-2)', stopOpacity: 0.05 }} />
            <stop offset="1" style={{ stopColor: 'var(--band-8)', stopOpacity: 0.08 }} />
          </linearGradient>
          <linearGradient id="pp-fan" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" style={{ stopColor: 'var(--fg)', stopOpacity: 0.12 }} />
            <stop offset="1" style={{ stopColor: 'var(--band-5)', stopOpacity: 0.16 }} />
          </linearGradient>
        </defs>

        {/* Back face and depth edges */}
        <path d={tri(DEPTH)} fill="url(#pp-back)" stroke="var(--line-strong)" strokeLinejoin="round" />
        {[A, B, C].map((p, i) => (
          <path key={i} d={edge(p)} stroke="var(--line-strong)" />
        ))}

        {/* Incoming beam: the output */}
        <path d={`M 24 ${n(ENTRY.y)} L ${n(ENTRY.x)} ${n(ENTRY.y)}`} stroke="url(#pp-beam)" strokeWidth={2} />
        <path
          d={`M 24 ${n(ENTRY.y)} L ${n(ENTRY.x)} ${n(ENTRY.y)}`}
          pathLength={100}
          className="trace-pulse"
          stroke="var(--fg)"
          strokeWidth={2.5}
          strokeLinecap="round"
          style={{ ['--pulse-duration' as string]: '3.6s' }}
        />

        {/* Front face, with the light spreading inside it */}
        <path
          d={tri()}
          fill="url(#pp-face)"
          stroke="var(--fg)"
          strokeOpacity={0.45}
          strokeWidth={1.25}
          strokeLinejoin="round"
        />
        <path
          d={`M ${n(ENTRY.x)} ${n(ENTRY.y)} L ${n(EXITS[0].x)} ${n(EXITS[0].y)} L ${n(EXITS[4].x)} ${n(EXITS[4].y)} Z`}
          fill="url(#pp-fan)"
        />

        {/* Five rays: the console views */}
        {platform.tabs.map((tab, i) => {
          const on = i === activeIndex
          const band = `var(--band-${RAY_BAND[i]})`
          const d = `M ${n(EXITS[i].x)} ${n(EXITS[i].y)} L ${RAY_END_X} ${RAY_Y[i]}`
          return (
            <g
              key={tab.id}
              className="cursor-pointer"
              onClick={() => onSelect(tab.id)}
              style={{ opacity: on ? 1 : 0.4, transition: 'opacity 220ms cubic-bezier(0.22,1,0.36,1)' }}
            >
              <path d={d} stroke="transparent" strokeWidth={14} />
              <path
                d={d}
                stroke={band}
                strokeWidth={on ? 2.25 : 1.25}
                strokeLinecap="round"
                style={{ transition: 'stroke-width 220ms' }}
              />
              {on && (
                <path
                  d={d}
                  pathLength={100}
                  className="trace-pulse"
                  stroke={band}
                  strokeWidth={3}
                  strokeLinecap="round"
                  style={{ ['--pulse-duration' as string]: '3.6s', ['--pulse-delay' as string]: '1.1s' }}
                />
              )}
              <circle cx={RAY_END_X} cy={RAY_Y[i]} r={on ? 3.5 : 2.5} fill={band} />
              <text
                x={LABEL_X}
                y={RAY_Y[i] + 4}
                className="font-mono"
                fontSize={11.5}
                fill={on ? 'var(--fg)' : 'var(--fg-3)'}
              >
                {String(i + 1).padStart(2, '0')} {tab.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
