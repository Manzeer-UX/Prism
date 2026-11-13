import type React from 'react'
import { AbsoluteFill } from 'remotion'
import { EASE_IN_OUT, clamp, ramp } from '../lib/anim'
import { BANDS } from '../theme'

/** Fade a layer in and out on given frames */
export function Fade({
  frame,
  inAt,
  inDur = 15,
  outAt,
  outDur = 15,
  blur = 0,
  rise = 0,
  children,
  style,
}: {
  frame: number
  inAt: number
  inDur?: number
  outAt?: number
  outDur?: number
  blur?: number
  rise?: number
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  const a = ramp(frame, inAt, inDur)
  const b = outAt === undefined ? 0 : ramp(frame, outAt, outDur)
  const o = a * (1 - b)
  if (o <= 0.001) return null
  const bl = blur * (1 - a + b)
  return (
    <div
      style={{
        opacity: o,
        filter: bl > 0.05 ? `blur(${bl}px)` : undefined,
        transform: rise ? `translateY(${(1 - a) * rise - b * rise * 0.5}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/**
 * Refraction wipe — the prism's spectrum sweeps across the frame and what is
 * behind it is revealed in its wake. `progress` 0 → 1.
 */
export function RefractionWipe({ progress, children }: { progress: number; children?: React.ReactNode }) {
  const p = EASE_IN_OUT(clamp(progress))
  // leading edge travels from off-left to off-right, slanted
  const edge = -25 + p * 150 // percent of width
  const slant = 18
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {children ? (
        <AbsoluteFill
          style={{
            clipPath: `polygon(0% 0%, ${edge}% 0%, ${edge - slant}% 100%, 0% 100%)`,
          }}
        >
          {children}
        </AbsoluteFill>
      ) : null}
      {progress > 0 && progress < 1 ? (
        <AbsoluteFill style={{ mixBlendMode: 'screen' }}>
          {BANDS.map((b, i) => {
            const off = (i - 4) * 1.15
            const x = edge + off
            const w = 1.1
            return (
              <div
                key={b}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: b,
                  opacity: 0.55 * Math.sin(Math.PI * clamp(progress)),
                  clipPath: `polygon(${x}% 0%, ${x + w}% 0%, ${x + w - slant}% 100%, ${x - slant}% 100%)`,
                  filter: 'blur(6px)',
                }}
              />
            )
          })}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'white',
              opacity: 0.85 * Math.sin(Math.PI * clamp(progress)),
              clipPath: `polygon(${edge + 5.4}% 0%, ${edge + 5.9}% 0%, ${edge + 5.9 - slant}% 100%, ${edge + 5.4 - slant}% 100%)`,
              filter: 'blur(3px)',
            }}
          />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  )
}

/** A soft radial darkening behind headline text, so type stays legible over the network */
export function Scrim({ opacity, y = 50, size = 62 }: { opacity: number; y?: number; size?: number }) {
  if (opacity <= 0) return null
  return (
    <AbsoluteFill
      style={{
        opacity,
        background: `radial-gradient(ellipse ${size}% ${size * 0.62}% at 50% ${y}%, rgba(6,9,17,0.82) 0%, rgba(6,9,17,0.55) 45%, rgba(6,9,17,0) 100%)`,
      }}
    />
  )
}
