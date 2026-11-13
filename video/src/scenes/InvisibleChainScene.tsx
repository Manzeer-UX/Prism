import { AbsoluteFill } from 'remotion'
import { AnimatedHeadline } from '../components/AnimatedHeadline'
import { Scrim } from '../components/SceneTransition'
import type { SceneProps } from '../Film'
import { EASE, clamp, ramp } from '../lib/anim'
import { L, M, scene } from '../timeline'
import { color, font, type } from '../theme'
import { project } from '../world/camera'
import { CHAIN_POS } from '../world/network'

const S = scene('chain').from

/** The recurring request — the same one PRISM AI traces in scene 05 */
export const REQUEST_TEXT = 'Can you check the status of ticket #4821?'

/** The user's request, typed into an AI application, pinned to the "User prompt" node */
function PromptCard({ frame, t }: { frame: number; t: number }) {
  const appear = M('promptCard') - S
  const send = L('s2-chain').from - S
  const a = ramp(frame, appear, 14)
  // leaves as the request sets off, before the camera tracks away
  const out = ramp(frame, send + 52, 16)
  if (a <= 0 || out >= 1) return null
  const typed = Math.floor(clamp((frame - appear - 4) / 20) * REQUEST_TEXT.length)
  const sent = ramp(frame, send, 10)
  const node = project(CHAIN_POS[0], t)
  return (
    <div
      style={{
        position: 'absolute',
        left: node.x - 40,
        top: node.y - 236,
        width: 540,
        opacity: a * (1 - out),
        transform: `translateY(${(1 - a) * 14}px)`,
        filter: out > 0 ? `blur(${out * 6}px)` : undefined,
      }}
    >
      <div
        style={{
          borderRadius: 14,
          border: `1px solid ${color.lineStrong}`,
          background: 'rgba(15, 20, 32, 0.86)',
          boxShadow: `0 24px 48px -24px rgba(0,0,0,0.6), 0 0 0 ${sent * 6}px rgba(76,141,255,${0.18 * (1 - sent)})`,
          padding: '18px 22px',
        }}
      >
        <div style={{ fontFamily: font.mono, fontSize: 18, color: color.fg3, letterSpacing: '0.01em' }}>User request</div>
        <div style={{ marginTop: 10, fontFamily: font.sans, fontSize: 29, lineHeight: 1.32, color: color.fg, minHeight: 76 }}>
          {REQUEST_TEXT.slice(0, typed)}
          <span style={{ opacity: typed < REQUEST_TEXT.length && Math.floor(frame / 8) % 2 === 0 ? 1 : 0, color: color.accentInk }}>|</span>
        </div>
      </div>
      {/* the thread down to the node */}
      <div
        style={{
          position: 'absolute',
          left: 40,
          top: '100%',
          width: 1,
          height: 236 - 166,
          background: `linear-gradient(to bottom, ${color.lineStrong}, rgba(238,240,245,0))`,
        }}
      />
    </div>
  )
}

/**
 * 02 — The invisible AI chain (16–29 s)
 * The request travels User prompt → AI model → Agent → Tool → Knowledge
 * source → Decision → Response; then the chain disappears into everything
 * else the system is doing.
 */
export function InvisibleChainScene({ frame, t }: SceneProps) {
  const q = [M('q1'), M('q2'), M('q3')].map((f) => f - S)
  const leave = scene('chain').to - S - 6
  const scrim = ramp(frame, q[0] - 10, 24) * (1 - ramp(frame, leave, 16))
  const lines = ['What happened?', 'Why did it happen?', 'Can you trace it?']

  return (
    <AbsoluteFill>
      <PromptCard frame={frame} t={t} />
      <Scrim opacity={scrim * 0.9} y={78} size={90} />
      <div style={{ position: 'absolute', left: 128, bottom: 112 }}>
        {lines.map((text, i) => {
          const next = q[i + 1]
          const dim = next === undefined ? 0 : ramp(frame, next - 2, 14, EASE)
          return (
            <AnimatedHeadline
              key={text}
              text={text}
              frame={frame}
              start={q[i]}
              exit={leave}
              exitDuration={14}
              stagger={3}
              dim={dim}
              style={{ ...type.displayM, fontSize: i === 2 ? 84 : 64, marginTop: i ? 10 : 0 }}
            />
          )
        })}
      </div>
    </AbsoluteFill>
  )
}
