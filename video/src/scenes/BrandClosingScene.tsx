import { AbsoluteFill } from 'remotion'
import { AnimatedHeadline } from '../components/AnimatedHeadline'
import { BrandMark, BrandWordmark } from '../components/BrandLockup'
import type { SceneProps } from '../Film'
import { EASE, EASE_IN_OUT, clamp, ramp } from '../lib/anim'
import { L, M, scene } from '../timeline'
import { BANDS, color, font, type } from '../theme'
import { project } from '../world/camera'
import { PRISM } from '../world/network'
import * as THREE from 'three'

const S = scene('closing').from

/**
 * 08 — The final brand reveal (114–120 s)
 * Every lane flows back into the prism; one governed beam leaves it; the
 * prism resolves into the official PrismAI mark, then the full lock-up,
 * attribution and signature line — held to the last frame.
 */
export function BrandClosingScene({ frame, t }: SceneProps) {
  const resolve = M('resolve') - S
  const chain = L('s8-chain').from - S
  const outcome = L('s8-outcome').from - S

  // where the 3D prism sits on screen as it resolves
  const prismCentre = project(new THREE.Vector3(0, (PRISM.apex.y + PRISM.left.y) / 2 + 0.12, 0), Math.min(t, 116.4))

  // the mark emerges inside the bloom, then settles exactly where the lock-up's mark sits
  const markIn = ramp(frame, resolve + 12, 16, EASE)
  const toLockup = EASE_IN_OUT(clamp((frame - (resolve + 28)) / 24))
  const lockupY = 392
  const WORD_H = 170
  const markTargetX = 960 - (WORD_H * 160) / 48 / 2 + (24 * WORD_H) / 48
  const markX = 960 + (markTargetX - 960) * toLockup
  const markY = prismCentre.y + (lockupY - prismCentre.y) * toLockup
  const markSize = 300 + (0.9375 * WORD_H - 300) * toLockup
  const wordIn = ramp(frame, resolve + 38, 16, EASE)
  const attribution = ramp(frame, resolve + 46, 18, EASE)
  const clean = ramp(frame, resolve + 20, 40, EASE)

  return (
    <AbsoluteFill>
      {/* the stage clears */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(9,14,30,0.75) 0%, rgba(6,9,17,0.95) 100%)', opacity: clean * 0.9 }} />

      {/* the prism, resolved into the mark */}
      {markIn > 0 && wordIn < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: markX,
            top: markY,
            transform: 'translate(-50%, -50%)',
            opacity: markIn * (1 - wordIn),
            filter: markIn < 1 ? `blur(${(1 - markIn) * 16}px) drop-shadow(0 0 40px rgba(76,141,255,0.5))` : 'drop-shadow(0 0 30px rgba(76,141,255,0.35))',
          }}
        >
          <BrandMark size={markSize} />
        </div>
      ) : null}

      {/* the lock-up */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: lockupY - WORD_H / 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ opacity: wordIn, filter: wordIn < 1 ? `blur(${(1 - wordIn) * 8}px)` : undefined }}>
          <BrandWordmark height={WORD_H} style={{ filter: 'drop-shadow(0 0 26px rgba(76,141,255,0.22))' }} />
        </div>
        <div
          style={{
            marginTop: 26,
            opacity: attribution,
            transform: `translateY(${(1 - attribution) * 10}px)`,
            fontFamily: font.sans,
            fontSize: 30,
            color: color.fg2,
            letterSpacing: '0.005em',
          }}
        >
          By MoogleLabs, a Group Seasia Company
        </div>
        {/* the signature: nine spectrum bands */}
        <div style={{ display: 'flex', gap: 6, marginTop: 40, opacity: attribution }}>
          {BANDS.map((b, i) => (
            <span
              key={b}
              style={{ width: 34, height: 3, borderRadius: 3, background: b, transform: `scaleX(${ramp(frame, resolve + 48 + i * 2, 12, EASE)})` }}
            />
          ))}
        </div>
        <div style={{ marginTop: 42, display: 'flex', gap: 24, justifyContent: 'center' }}>
          <AnimatedHeadline text="See the chain." frame={frame} start={chain - 2} stagger={4} style={{ ...type.displayM, fontSize: 76 }} />
          <AnimatedHeadline text="Govern the outcome." frame={frame} start={outcome - 2} stagger={4} style={{ ...type.displayM, fontSize: 76 }} />
        </div>
      </div>
    </AbsoluteFill>
  )
}
