import { AbsoluteFill } from 'remotion'
import { AnimatedHeadline } from '../components/AnimatedHeadline'
import { BrandWordmark } from '../components/BrandLockup'
import { Fade } from '../components/SceneTransition'
import type { SceneProps } from '../Film'
import { EASE, ramp } from '../lib/anim'
import { L, M, scene } from '../timeline'
import { BANDS, color, font, type } from '../theme'

const S = scene('reveal').from

const PILLARS = [
  { word: 'Observe.', line: 's4-observe', bands: [0, 1, 2] },
  { word: 'Evaluate.', line: 's4-evaluate', bands: [3, 4, 5] },
  { word: 'Govern.', line: 's4-govern', bands: [6, 7, 8] },
]

/**
 * 04 — Introducing PRISM AI (42.5–57 s)
 * The prism ignites; scattered activity streams into it and leaves as nine
 * ordered lanes. The official lock-up, the positioning line, then the three
 * pillars on the beat.
 */
export function PrismRevealScene({ frame }: SceneProps) {
  const intro = L('s4-intro').from - S
  const platform = L('s4-platform').from - S
  const structure = M('structure') - S
  const refraction = M('refraction') - S

  // lock-up: in with "Introducing PRISM AI", out as the camera pulls back
  const logoIn = ramp(frame, intro + 4, 22, EASE)
  const logoOut = ramp(frame, structure - 6, 18, EASE)
  const logoO = logoIn * (1 - logoOut)

  return (
    <AbsoluteFill>
      {logoO > 0 ? (
        <div
          style={{
            position: 'absolute',
            top: 86,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <Fade frame={frame} inAt={intro - 2} inDur={14} outAt={structure - 6} outDur={16} rise={8}>
            <div style={{ fontFamily: font.mono, fontSize: 22, color: color.fg2, letterSpacing: '0.04em' }}>Introducing</div>
          </Fade>
          <div
            style={{
              marginTop: 14,
              opacity: logoO,
              filter: logoIn < 1 ? `blur(${(1 - logoIn) * 14}px)` : logoOut > 0 ? `blur(${logoOut * 10}px)` : undefined,
              transform: `scale(${0.94 + 0.06 * logoIn})`,
            }}
          >
            <BrandWordmark height={150} />
          </div>
          <AnimatedHeadline
            text="Enterprise AI Governance Platform"
            frame={frame}
            start={platform + 2}
            exit={structure - 6}
            exitDuration={16}
            stagger={3}
            style={{ ...type.title, fontSize: 42, marginTop: 18, color: color.fg }}
          />
          <Fade frame={frame} inAt={platform + 40} inDur={16} outAt={structure - 6} outDur={16}>
            <div style={{ marginTop: 12, fontFamily: font.mono, fontSize: 20, color: color.fg3, letterSpacing: '0.02em' }}>
              by MoogleLabs
            </div>
          </Fade>
        </div>
      ) : null}

      {/* the three pillars, on the beat */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 118, display: 'flex', justifyContent: 'center', gap: 72 }}>
        {PILLARS.map((p) => {
          const at = L(p.line).from - S
          const a = ramp(frame, at - 2, 10, EASE)
          const out = ramp(frame, refraction - 2, 12, EASE)
          if (a <= 0) return <div key={p.word} style={{ width: 300 }} />
          return (
            <div key={p.word} style={{ width: 300, textAlign: 'center', opacity: 1 - out }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 22, opacity: a }}>
                {p.bands.map((b) => (
                  <span
                    key={b}
                    style={{
                      width: 3,
                      height: 26,
                      borderRadius: 3,
                      background: BANDS[b],
                      transform: `scaleY(${a})`,
                      boxShadow: `0 0 14px ${BANDS[b]}`,
                    }}
                  />
                ))}
              </div>
              <AnimatedHeadline
                text={p.word}
                frame={frame}
                start={at - 2}
                stagger={0}
                wordDuration={12}
                style={{ ...type.displayM, fontSize: 82 }}
              />
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}
