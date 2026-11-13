import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { useRef, useState, type PointerEvent } from 'react'
import { capabilities, hero } from '../../content/prism'
import { useFinePointer, useOnScreen } from '../../lib/hooks'
import { EASE } from '../../lib/motion'

/*
  Hero diagram. Signals from the AI ecosystem (LLMs, agents, prompts, tools,
  data) merge into one beam, pass through the prism — the intelligence control
  plane — and emerge as nine distinct governance capability streams. Geometry is in viewBox units and the
  HTML label layer is positioned from the same numbers.
*/

const W = 900
const H = 640

const INPUT_Y = [196, 260, 324, 388, 452]
const JUNCTION = { x: 262, y: 324 }

const A = { x: 430, y: 168 } // apex
const B = { x: 306, y: 500 } // bottom left
const C = { x: 554, y: 500 } // bottom right
const DEPTH = { x: 16, y: -8 } // back face offset, gives the prism volume

const onLeftFace = (t: number) => ({ x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t })
const onRightFace = (t: number) => ({ x: A.x + (C.x - A.x) * t, y: A.y + (C.y - A.y) * t })

const ENTRY = onLeftFace(0.47)
const EXITS = capabilities.map((_, i) => onRightFace(0.4 + i * 0.01625))
const BAND_END_X = 668
const BAND_Y = capabilities.map((_, i) => 108 + i * 53)
const LABEL_X = 682

const pct = (v: number, of: number) => `${(v / of) * 100}%`

const inputPath = (y: number) => `M 0 ${y} L 96 ${y} C 176 ${y} 196 ${JUNCTION.y} ${JUNCTION.x} ${JUNCTION.y}`

const tri = (o = { x: 0, y: 0 }) =>
  `M ${A.x + o.x} ${A.y + o.y} L ${C.x + o.x} ${C.y + o.y} L ${B.x + o.x} ${B.y + o.y} Z`

export function PrismRefraction() {
  const reduced = useReducedMotion() ?? false
  const finePointer = useFinePointer()
  const rootRef = useRef<HTMLDivElement>(null)
  const onScreen = useOnScreen(rootRef)
  const [active, setActive] = useState<number | null>(null)

  // Pointer-responsive tilt: a few degrees at most, sprung so it never snaps.
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 60, damping: 18, mass: 0.6 })
  const sy = useSpring(py, { stiffness: 60, damping: 18, mass: 0.6 })
  const rotateY = useTransform(sx, [-1, 1], [-4, 4])
  const rotateX = useTransform(sy, [-1, 1], [3, -3])

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!finePointer || reduced) return
    const r = e.currentTarget.getBoundingClientRect()
    px.set(((e.clientX - r.left) / r.width) * 2 - 1)
    py.set(((e.clientY - r.top) / r.height) * 2 - 1)
  }
  const handleLeave = () => {
    px.set(0)
    py.set(0)
  }

  const draw = (delay: number, duration = 0.8) =>
    reduced
      ? { initial: false as const }
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { pathLength: { duration, ease: EASE, delay }, opacity: { duration: 0.2, delay } },
        }

  const fade = (delay: number) =>
    reduced
      ? { initial: false as const }
      : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5, ease: EASE, delay } }

  const dim = (i: number) => (active === null || active === i ? 1 : 0.22)

  return (
    <figure
      className="relative m-0 w-full"
      aria-labelledby="prism-figure-caption"
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      <figcaption id="prism-figure-caption" className="sr-only">
        Diagram: LLMs, agents, prompts, tools and data from your AI ecosystem converge into PRISM AI, the intelligence
        control plane, and emerge as nine governance capabilities.
      </figcaption>

      <motion.div
        ref={rootRef}
        className="relative w-full"
        style={{
          aspectRatio: `${W} / ${H}`,
          rotateX: reduced ? 0 : rotateX,
          rotateY: reduced ? 0 : rotateY,
          transformPerspective: 1400,
        }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
          data-paused={!onScreen}
        >
          <defs>
            <linearGradient id="prism-face" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#eef0f5" stopOpacity="0.07" />
              <stop offset="1" stopColor="#eef0f5" stopOpacity="0.015" />
            </linearGradient>
          </defs>

          {/* Inputs: what PRISM governs */}
          <g fill="none" strokeLinecap="round">
            {INPUT_Y.map((y, i) => (
              <motion.path
                key={y}
                d={inputPath(y)}
                stroke="var(--fg-2)"
                strokeOpacity={0.55}
                strokeWidth={1.25}
                {...draw(0.3 + i * 0.08)}
              />
            ))}
            {INPUT_Y.map((y, i) => (
              <motion.path
                key={`pulse-${y}`}
                d={inputPath(y)}
                pathLength={100}
                className="trace-pulse"
                stroke="var(--fg)"
                strokeWidth={2}
                style={{ ['--pulse-delay' as string]: `${2.4 + i * 1.3}s`, ['--pulse-duration' as string]: '6.5s' }}
                {...fade(2.2)}
              />
            ))}
            {INPUT_Y.map((y, i) => (
              <motion.circle key={`dot-${y}`} cx={0} cy={y} r={2.5} fill="var(--fg-2)" {...fade(0.3 + i * 0.08)} />
            ))}
          </g>

          {/* Combined beam into the prism */}
          <motion.path
            d={`M ${JUNCTION.x} ${JUNCTION.y} L ${ENTRY.x} ${ENTRY.y}`}
            stroke="var(--fg)"
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
            {...draw(0.95, 0.35)}
          />

          {/* Dispersion inside the prism */}
          <motion.g {...fade(1.2)}>
            {EXITS.map((x, i) => (
              <line
                key={i}
                x1={ENTRY.x}
                y1={ENTRY.y}
                x2={x.x}
                y2={x.y}
                stroke={`var(--band-${i + 1})`}
                strokeOpacity={0.55 * dim(i)}
                strokeWidth={1}
                style={{ transition: 'stroke-opacity 180ms cubic-bezier(0.22,1,0.36,1)' }}
              />
            ))}
          </motion.g>

          {/* The prism: back face, connecting edges, front face */}
          <g fill="none" strokeLinejoin="round">
            <motion.path d={tri(DEPTH)} stroke="var(--fg)" strokeOpacity={0.14} strokeWidth={1} {...draw(0.1, 0.9)} />
            {[A, B, C].map((p, i) => (
              <motion.path
                key={i}
                d={`M ${p.x} ${p.y} L ${p.x + DEPTH.x} ${p.y + DEPTH.y}`}
                stroke="var(--fg)"
                strokeOpacity={0.18}
                strokeWidth={1}
                {...draw(0.5, 0.3)}
              />
            ))}
            <motion.path
              d={tri()}
              fill="url(#prism-face)"
              stroke="var(--fg)"
              strokeOpacity={0.6}
              strokeWidth={1.25}
              {...draw(0.1, 1)}
            />
          </g>

          {/* Nine capability bands */}
          <g fill="none" strokeLinecap="round">
            {EXITS.map((x, i) => {
              const d = `M ${x.x} ${x.y} L ${BAND_END_X} ${BAND_Y[i]} L ${BAND_END_X + 6} ${BAND_Y[i]}`
              return (
                <g key={i} style={{ opacity: dim(i), transition: 'opacity 180ms cubic-bezier(0.22,1,0.36,1)' }}>
                  <motion.path
                    d={d}
                    stroke={`var(--band-${i + 1})`}
                    strokeWidth={active === i ? 2.25 : 1.5}
                    {...draw(1.3 + i * 0.045, 0.7)}
                  />
                  <motion.path
                    d={d}
                    pathLength={100}
                    className="trace-pulse"
                    stroke={`var(--band-${i + 1})`}
                    strokeWidth={3}
                    style={{
                      ['--pulse-delay' as string]: `${2.6 + ((i * 5) % 9) * 0.75}s`,
                      ['--pulse-duration' as string]: '7.5s',
                    }}
                    {...fade(2.4)}
                  />
                  <motion.circle
                    cx={BAND_END_X + 6}
                    cy={BAND_Y[i]}
                    r={3}
                    fill={`var(--band-${i + 1})`}
                    {...fade(1.75 + i * 0.04)}
                  />
                </g>
              )
            })}
          </g>
        </svg>

        {/* Label layer — real text and links, positioned from the SVG geometry */}
        <motion.p
          className="absolute hidden -translate-y-full pb-9 text-meta text-fg-3 sm:block"
          style={{ left: 0, top: pct(INPUT_Y[0], H) }}
          {...fade(0.4)}
        >
          {hero.diagram.inputsLabel}
        </motion.p>
        <ul className="m-0 list-none p-0" aria-label={hero.diagram.inputsLabel}>
          {hero.diagram.inputs.map((g, i) => (
            <motion.li
              key={g}
              className="absolute -translate-y-[calc(100%+6px)] text-meta text-fg-2"
              style={{ left: pct(4, W), top: pct(INPUT_Y[i], H) }}
              {...fade(0.45 + i * 0.08)}
            >
              {g}
            </motion.li>
          ))}
        </ul>

        <motion.div
          aria-hidden="true"
          className="absolute flex -translate-x-1/2 flex-col items-center gap-1.5 pt-5 text-center whitespace-nowrap"
          style={{ left: pct((B.x + C.x) / 2, W), top: pct(B.y, H) }}
          {...fade(1)}
        >
          <span className="text-[0.8125rem] font-semibold tracking-[0.02em] text-fg">{hero.diagram.centreLabel}</span>
          <span className="text-meta text-[0.6875rem] tracking-[0.08em] text-fg-3 uppercase sm:text-[0.75rem]">
            {hero.diagram.centreDescriptor}
          </span>
        </motion.div>

        <motion.p
          className="absolute hidden -translate-y-full pb-4 text-meta text-fg-3 sm:block lg:hidden xl:block"
          style={{ left: pct(LABEL_X, W), top: pct(BAND_Y[0] - 22, H), width: pct(W - LABEL_X + 24, W) }}
          {...fade(1.9)}
        >
          {hero.diagram.outputsLabel}
        </motion.p>
        <ol className="m-0 list-none p-0" aria-label={hero.diagram.outputsLabel}>
          {capabilities.map((c, i) => (
            <motion.li
              key={c.id}
              className="absolute -translate-y-1/2"
              style={{ left: pct(LABEL_X, W), top: pct(BAND_Y[i], H) }}
              {...fade(1.8 + i * 0.04)}
            >
              {/* Phones: the bands sit too close for 24px touch targets, so the
                  labels are plain text there and links from sm up. */}
              <span className="flex items-center font-mono text-[0.6875rem] leading-none text-fg-3 tabular-nums sm:hidden">
                {c.number}
                <span className="sr-only"> {c.title}</span>
              </span>
              <a
                href={`#cap-${c.id}`}
                className="group hidden min-h-6 items-center gap-2 text-[0.75rem] leading-none text-fg-2 transition-colors duration-150 hover:text-fg sm:flex xl:text-[0.8125rem]"
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              >
                <span className="font-mono text-[0.6875rem] text-fg-3 tabular-nums group-hover:text-fg-2">
                  {c.number}
                </span>
                <span aria-hidden="true" className="whitespace-nowrap lg:hidden xl:inline">
                  {c.short}
                </span>
                <span className="sr-only">{c.title}</span>
              </a>
            </motion.li>
          ))}
        </ol>
      </motion.div>

      <motion.p
        className="mt-6 max-w-[34rem] text-[0.875rem] text-fg-2 sm:mx-auto sm:mt-10 sm:text-center"
        {...fade(2.1)}
      >
        {hero.diagram.closingLine}
      </motion.p>
    </figure>
  )
}
