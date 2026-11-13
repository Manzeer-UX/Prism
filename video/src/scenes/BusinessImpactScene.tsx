import { governance } from '@site/content/prism'
import { AbsoluteFill } from 'remotion'
import { AnimatedHeadline } from '../components/AnimatedHeadline'
import type { SceneProps } from '../Film'
import { EASE, ramp } from '../lib/anim'
import { L, scene } from '../timeline'
import { BANDS, DIMENSION_BAND, color, font, type } from '../theme'

const S = scene('value').from

const OUTCOMES = [
  { text: 'Better visibility', line: 's7-faster', band: 0 },
  { text: 'Greater reliability', line: 's7-reliability', band: 2 },
  { text: 'Cost intelligence', line: 's7-costs', band: 7 },
  { text: 'Stronger governance', line: 's7-confidence', band: 8 },
]

/**
 * 07 — Enterprise business value (107–114 s)
 * Back in the ecosystem — now organised and traceable. Four outcomes, and
 * the six documented governance dimensions along the top.
 */
export function BusinessImpactScene({ frame }: SceneProps) {
  const exit = ramp(frame, scene('value').to - S - 8, 16, EASE)
  const intro = ramp(frame, -6, 20, EASE)

  return (
    <AbsoluteFill style={{ opacity: 1 - exit }}>
      {/* six governance dimensions, as on the website */}
      <div style={{ position: 'absolute', top: 64, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 44, opacity: intro }}>
        {governance.dimensions.map((d, i) => {
          const a = ramp(frame, 6 + i * 4, 14, EASE)
          return (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: a, fontFamily: font.mono, fontSize: 19, color: color.fg2 }}>
              <span style={{ width: 3, height: 16, borderRadius: 3, background: BANDS[DIMENSION_BAND[i] - 1] }} />
              {d.title}
            </div>
          )
        })}
      </div>

      {/* outcomes */}
      <AbsoluteFill style={{ background: 'linear-gradient(to top, rgba(6,9,17,0.92) 0%, rgba(6,9,17,0.6) 18%, rgba(6,9,17,0) 34%)', opacity: intro }} />
      <div style={{ position: 'absolute', left: 128, right: 128, bottom: 96, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
        {OUTCOMES.map((o, i) => {
          const at = L(o.line).from - S
          const a = ramp(frame, at - 3, 14, EASE)
          return (
            <div key={o.text}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: a, marginBottom: 14 }}>
                <span style={{ height: 3, width: 40 * a, borderRadius: 3, background: BANDS[o.band], boxShadow: `0 0 12px ${BANDS[o.band]}` }} />
                <span style={{ fontFamily: font.mono, fontSize: 17, color: color.fg3 }}>{String(i + 1).padStart(2, '0')}</span>
              </div>
              <AnimatedHeadline text={o.text} frame={frame} start={at - 3} stagger={3} style={{ ...type.title, fontSize: 40, whiteSpace: 'nowrap' }} />
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}
