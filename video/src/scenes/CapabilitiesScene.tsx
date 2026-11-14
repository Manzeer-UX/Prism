import { AbsoluteFill } from 'remotion'
import { AnimatedHeadline } from '../components/AnimatedHeadline'
import { CapabilityWheel } from '../components/CapabilityWheel'
import type { SceneProps } from '../Film'
import { EASE, ramp } from '../lib/anim'
import { L, M, scene } from '../timeline'
import { type } from '../theme'

const S = scene('capabilities').from

/**
 * 06 — Nine connected capabilities (96–107 s)
 * Trace lines run out from the PRISM AI mark to the nine official capability
 * groups, which light three at a time with the narration.
 */
export function CapabilitiesScene({ frame }: SceneProps) {
  const g = (name: 'group1' | 'group2' | 'group3') => M(name) - S
  const groups = [g('group1'), g('group2'), g('group3')]
  const segment = Array.from({ length: 9 }, (_, i) => groups[Math.floor(i / 3)] + (i % 3) * 5)
  // A clean hand-off: the wheel gathers into its centre mark and is gone
  // before the organised network fades in (Film starts it at 106.4 s).
  const exit = ramp(frame, scene('capabilities').to - S - 35, 18, EASE)
  const nine = L('s6-nine').from - S

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - exit,
        transform: `scale(${1 - exit * 0.22})`,
        transformOrigin: '1010px 604px',
        filter: exit > 0 ? `blur(${exit * 10}px)` : undefined,
      }}
    >
      <CapabilityWheel frame={frame} timing={{ draw: 4, segment, complete: M('wheelComplete') - S }} cx={1010} cy={604} />
      <div style={{ position: 'absolute', left: 128, top: 58, width: 820 }}>
        <AnimatedHeadline text="Nine capabilities." frame={frame} start={nine} stagger={3} style={{ ...type.displayM, fontSize: 58 }} />
        <AnimatedHeadline
          text="One governed ecosystem."
          frame={frame}
          start={M('wheelComplete') - S}
          stagger={3}
          style={{ ...type.displayM, fontSize: 58, marginTop: 4 }}
        />
      </div>
    </AbsoluteFill>
  )
}
