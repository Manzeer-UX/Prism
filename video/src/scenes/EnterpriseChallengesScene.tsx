import type React from 'react'
import { AbsoluteFill } from 'remotion'
import { AnimatedHeadline } from '../components/AnimatedHeadline'
import { Callout, CalloutRow } from '../components/Callout'
import { Scrim } from '../components/SceneTransition'
import type { SceneProps } from '../Film'
import { EASE, clamp, ramp } from '../lib/anim'
import { M, scene } from '../timeline'
import { color, font, type } from '../theme'
import { project } from '../world/camera'
import { CHAIN_POS } from '../world/network'

const S = scene('challenges').from

const CHALLENGES = ['Unreliable outputs', 'Hidden errors', 'Unexpected costs', 'Governance gaps']

/** A callout pinned to a point in the 3D world */
function Pinned({
  frame,
  t,
  at,
  until,
  node,
  dx,
  dy,
  children,
}: {
  frame: number
  t: number
  at: number
  until: number
  node: number
  dx: number
  dy: number
  children: React.ReactNode
}) {
  const a = ramp(frame, at, 12, EASE)
  const b = ramp(frame, until, 12, EASE)
  if (a <= 0 || b >= 1) return null
  const p = project(CHAIN_POS[node], t)
  return (
    <div
      style={{
        position: 'absolute',
        left: p.x + dx,
        top: p.y + dy,
        opacity: a * (1 - b),
        // set large: these are read from the back of a conference hall
        transform: `translateY(${(1 - a) * 12}px) scale(${(0.97 + 0.03 * a) * 1.2})`,
        transformOrigin: 'left bottom',
      }}
    >
      {children}
    </div>
  )
}

const count = (from: number, to: number, p: number) => from + (to - from) * p
const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })

/**
 * 03 — The enterprise AI challenge (29–42.5 s)
 * Four problems, all on the same workflow: an unreliable answer, an error
 * with no clear source, costs that climb, an audit trail with gaps. Then the
 * network breaks apart.
 */
export function EnterpriseChallengesScene({ frame, t }: SceneProps) {
  const c = [M('challenge1'), M('challenge2'), M('challenge3'), M('challenge4')].map((f) => f - S)
  const breakUp = M('fragment') - S
  const cannotSee = M('cannotSee') - S
  const ignite = M('ignite') - S

  const costP = clamp((frame - c[2] - 6) / 40)
  const eased = 1 - Math.pow(1 - costP, 2)

  const labelsScrim = ramp(frame, c[0] - 8, 16) * (1 - ramp(frame, breakUp, 16))
  const centreScrim = ramp(frame, cannotSee - 10, 20) * (1 - ramp(frame, ignite - 2, 10))

  return (
    <AbsoluteFill>
      {/* 1 · the response is wrong */}
      <Pinned frame={frame} t={t} at={c[0] + 4} until={c[1]} node={6} dx={-470} dy={-250}>
        <Callout title="Response" tag="Contradicts the knowledge base" tagColor={color.warning} width={430}>
          Ticket #4821 was resolved yesterday.
        </Callout>
      </Pinned>
      {/* 2 · something failed, somewhere */}
      <Pinned frame={frame} t={t} at={c[1] + 4} until={c[2]} node={3} dx={60} dy={-250}>
        <Callout title="tool.call · ticket.lookup" tag="Source unknown" tagColor={color.negative} width={400}>
          Request failed after 3 retries
        </Callout>
      </Pinned>
      {/* 3 · usage climbs */}
      <Pinned frame={frame} t={t} at={c[2] + 4} until={c[3]} node={1} dx={60} dy={-270}>
        <Callout title="Model usage · today" width={380}>
          <CalloutRow label="Tokens" value={fmt(count(1842, 48210, eased))} />
          <CalloutRow label="Cost" value={`$${fmt(count(0.014, 3.92, eased), 2)}`} valueColor={color.warning} />
          <CalloutRow label="Calls" value={fmt(count(5, 137, eased))} />
        </Callout>
      </Pinned>
      {/* 4 · the trail has gaps */}
      <Pinned frame={frame} t={t} at={c[3] + 4} until={breakUp} node={2} dx={-150} dy={-330}>
        <Callout title="Audit trail" tag="Incomplete" tagColor={color.warning} width={420}>
          <CalloutRow label="agent.run" value="Recorded" mono />
          <CalloutRow label="plan.step" value="No record" valueColor={color.fg3} mono />
          <CalloutRow label="tool.call" value="No record" valueColor={color.fg3} mono />
          <CalloutRow label="response" value="Sent" mono />
        </Callout>
      </Pinned>

      {/* the four problems, named */}
      <Scrim opacity={labelsScrim * 0.9} y={82} size={90} />
      <div style={{ position: 'absolute', left: 128, bottom: 104 }}>
        {CHALLENGES.map((text, i) => {
          const next = c[i + 1]
          const dim = next === undefined ? 0 : ramp(frame, next - 2, 14, EASE)
          return (
            <div key={text} style={{ display: 'flex', alignItems: 'baseline', gap: 22, marginTop: i ? 6 : 0 }}>
              <span
                style={{
                  fontFamily: font.mono,
                  fontSize: 20,
                  color: color.fg3,
                  opacity: ramp(frame, c[i], 10) * (1 - ramp(frame, breakUp, 14)) * (1 - dim * 0.6),
                  width: 30,
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <AnimatedHeadline
                text={text}
                frame={frame}
                start={c[i]}
                exit={breakUp}
                exitDuration={14}
                stagger={3}
                dim={dim}
                style={{ ...type.displayM, fontSize: 60 }}
              />
            </div>
          )
        })}
      </div>

      {/* the turn */}
      <Scrim opacity={centreScrim} y={50} size={72} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <AnimatedHeadline
          text="You cannot govern what you cannot see."
          frame={frame}
          start={cannotSee}
          exit={ignite - 4}
          exitDuration={10}
          stagger={3}
          wordDuration={18}
          style={{ ...type.displayL, fontSize: 88, width: 1500 }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
