import { EASE, EASE_IN_OUT, clamp, ramp } from '../lib/anim'

export type CursorKey = { f: number; x: number; y: number }

/** Cursor position at a frame: eased glides between keys, still between moves */
export function cursorAt(keys: CursorKey[], frame: number) {
  if (!keys.length) return { x: 0, y: 0 }
  if (frame <= keys[0].f) return keys[0]
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]
    const b = keys[i + 1]
    if (frame <= b.f) {
      const t = EASE_IN_OUT(clamp((frame - a.f) / Math.max(1, b.f - a.f)))
      // a gentle arc, like a hand moving a mouse
      const arc = Math.sin(t * Math.PI) * Math.min(28, Math.hypot(b.x - a.x, b.y - a.y) * 0.08)
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t - arc }
    }
  }
  return keys[keys.length - 1]
}

/**
 * Pointer with click feedback, drawn in the window's own coordinates so it
 * moves with the camera. `clicks` are frames at which it presses.
 */
export function Cursor({ x, y, frame, clicks, opacity = 1, scale = 1 }: { x: number; y: number; frame: number; clicks: number[]; opacity?: number; scale?: number }) {
  if (opacity <= 0.01) return null
  const last = clicks.filter((c) => c <= frame).pop()
  const since = last === undefined ? 999 : frame - last
  const press = since < 6 ? 1 - Math.abs(since - 3) / 3 : 0
  const ripple = since < 18 ? ramp(since, 0, 18, EASE) : 1
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity, pointerEvents: 'none' }}>
      {since < 18 ? (
        <div
          style={{
            position: 'absolute',
            left: -22 * ripple - 4,
            top: -22 * ripple - 4,
            width: 44 * ripple + 8,
            height: 44 * ripple + 8,
            borderRadius: '50%',
            border: '2px solid rgba(127,176,255,0.9)',
            opacity: 1 - ripple,
          }}
        />
      ) : null}
      <svg
        width={22 * scale}
        height={30 * scale}
        viewBox="0 0 22 30"
        style={{ position: 'absolute', left: -2, top: -2, transform: `scale(${1 - press * 0.12})`, transformOrigin: '2px 2px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}
      >
        <path d="M2 2 L2 24 L8 18.5 L12.2 27.5 L16 25.8 L11.9 17 L19.5 17 Z" fill="#ffffff" stroke="#0a0e18" strokeWidth={1.6} strokeLinejoin="round" />
      </svg>
    </div>
  )
}
