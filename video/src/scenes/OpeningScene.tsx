import { AbsoluteFill } from 'remotion'
import { AnimatedHeadline } from '../components/AnimatedHeadline'
import { Scrim } from '../components/SceneTransition'
import type { SceneProps } from '../Film'
import { ramp } from '../lib/anim'
import { L, M, scene } from '../timeline'
import { type } from '../theme'

const S = scene('opening').from

/**
 * 01 — The opening question (0–16 s)
 * Darkness, a pulse of light, the network forms around the camera and a
 * half-lit prism waits in the distance. Then: "You built the AI. Who's
 * governing it?"
 */
export function OpeningScene({ frame }: SceneProps) {
  const built = L('s1-built').from - S
  const governing = L('s1-governing').from - S
  const leave = M('pushIn') - S
  // the world steps back so the question owns the frame
  const scrim = ramp(frame, M('headline') - S - 12, 30) * (1 - ramp(frame, leave, 20))

  return (
    <AbsoluteFill>
      <Scrim opacity={scrim} y={50} size={70} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ width: 1600 }}>
          <AnimatedHeadline
            text="You built the AI."
            frame={frame}
            start={built}
            exit={leave}
            exitDuration={14}
            stagger={4}
            dim={ramp(frame, governing - 4, 18)}
            style={{ ...type.displayL, fontSize: 92 }}
          />
          <AnimatedHeadline
            text="Who's governing it?"
            frame={frame}
            start={governing}
            exit={leave + 4}
            exitDuration={14}
            stagger={4}
            wordDuration={18}
            style={{ ...type.hero, fontSize: 150, marginTop: 18 }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
