/**
 * Frame-based animation helpers. Everything in the film is a pure function of
 * the frame number, so renders are deterministic and never flicker.
 */
import { Easing, interpolate } from 'remotion'

/** The site's one easing curve: cubic-bezier(0.22, 1, 0.36, 1) */
export const EASE = Easing.bezier(0.22, 1, 0.36, 1)
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1)
export const EASE_IN = Easing.bezier(0.55, 0, 0.85, 0.4)

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const mix = lerp

/** 0 → 1 over [start, start + duration] frames, eased */
export function ramp(frame: number, start: number, duration: number, easing: (t: number) => number = EASE) {
  if (duration <= 0) return frame >= start ? 1 : 0
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  })
}

/** Fade in over `inDur`, hold, fade out over `outDur` ending at `end` */
export function window(frame: number, start: number, end: number, inDur = 12, outDur = 12, easing = EASE) {
  const a = ramp(frame, start, inDur, easing)
  const b = 1 - ramp(frame, end - outDur, outDur, easing)
  return Math.min(a, b)
}

/** Piecewise keyframes: [[frame, value], …] with the site easing between keys */
export function keys(frame: number, k: [number, number][], easing: (t: number) => number = EASE_IN_OUT) {
  if (frame <= k[0][0]) return k[0][1]
  for (let i = 0; i < k.length - 1; i++) {
    const [f0, v0] = k[i]
    const [f1, v1] = k[i + 1]
    if (frame <= f1) {
      const t = f1 === f0 ? 1 : easing(clamp((frame - f0) / (f1 - f0)))
      return v0 + (v1 - v0) * t
    }
  }
  return k[k.length - 1][1]
}

/** Smooth pulse (0 → 1 → 0) centred on `at`, `width` frames wide */
export function pulse(frame: number, at: number, width: number) {
  const d = Math.abs(frame - at) / (width / 2)
  if (d >= 1) return 0
  return 0.5 + 0.5 * Math.cos(d * Math.PI)
}

export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
