import type React from 'react'
import { EASE, clamp, ramp } from '../lib/anim'
import { color } from '../theme'

type Props = {
  text: string
  /** Frame (in the caller's timebase) the first word starts */
  start: number
  frame: number
  /** Frame the line starts leaving; omit to hold */
  exit?: number
  exitDuration?: number
  /** Frames between words */
  stagger?: number
  /** Frames each word takes to settle */
  wordDuration?: number
  style?: React.CSSProperties
  /** Words (exact match, punctuation stripped) set in the accent colour */
  accent?: string[]
  /** 0–1: fade the settled line back (used when the next line takes focus) */
  dim?: number
}

/**
 * Word-by-word blur-in — the site's BlurText, made frame-exact. Words rise a
 * little and sharpen as they arrive; on exit the line blurs and fades as one.
 */
export function AnimatedHeadline({
  text,
  start,
  frame,
  exit,
  exitDuration = 12,
  stagger = 3,
  wordDuration = 16,
  style,
  accent = [],
  dim = 0,
}: Props) {
  const words = text.split(' ')
  const out = exit === undefined ? 0 : ramp(frame, exit, exitDuration, EASE)
  if (frame < start - 1 || out >= 1) return null
  return (
    <div
      style={{
        color: color.fg,
        textWrap: 'balance',
        opacity: (1 - out) * (1 - dim * 0.62),
        filter: out > 0 ? `blur(${out * 10}px)` : undefined,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = ramp(frame, start + i * stagger, wordDuration, EASE)
        const bare = w.replace(/[.,!?]/g, '')
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              opacity: clamp(p * 1.4),
              filter: p < 1 ? `blur(${(1 - p) * 12}px)` : undefined,
              transform: `translateY(${(1 - p) * 0.28}em)`,
              color: accent.includes(bare) ? color.accentInk : undefined,
            }}
          >
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        )
      })}
    </div>
  )
}
