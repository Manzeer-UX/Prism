import type React from 'react'
import { Img, staticFile } from 'remotion'
import layout from '../data/ui-layout.json'
import { EASE, EASE_IN_OUT, clamp, ramp } from '../lib/anim'
import { color } from '../theme'
import { Cursor, cursorAt, type CursorKey } from './Cursor'

/** Captured console window size in CSS px (see scripts/capture-ui.mjs) */
const WIN = (() => {
  const w = layout.states.overview.find((i) => i.kind === 'window')!
  return { w: w.w, h: w.h }
})()

export type Box = { x: number; y: number; w: number; h: number }
export type StateKey = keyof typeof layout.states

/** Look up a captured element box: kind + text prefix */
export function box(state: StateKey, kind: string, text = '', index = 0): Box {
  const items = layout.states[state].filter((i) => i.kind === kind && i.text.startsWith(text))
  const it = items[index]
  if (!it) throw new Error(`no ${kind} "${text}" in ${state}`)
  return { x: it.x, y: it.y, w: it.w, h: it.h }
}

export const pad = (b: Box, p = 6): Box => ({ x: b.x - p, y: b.y - p, w: b.w + p * 2, h: b.h + p * 2 })
export const union = (a: Box, b: Box): Box => {
  const x = Math.min(a.x, b.x)
  const y = Math.min(a.y, b.y)
  return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y }
}
export const centre = (b: Box) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 })

export type CamKey = { f: number; zoom: number; cx: number; cy: number; rx: number; ry: number }
export type Highlight = { from: number; to: number; box: Box; tone?: 'accent' | 'warn'; secondary?: Box; dim?: number }
export type Annotation = { from: number; to: number; render: (p: number) => React.ReactNode }

type Props = {
  frame: number
  /** Which captured image is on screen from which frame */
  states: { from: number; state: StateKey }[]
  camera: CamKey[]
  highlights: Highlight[]
  cursor: { keys: CursorKey[]; clicks: number[]; show: [number, number][] }
  annotations?: Annotation[]
  /** Screen point the camera's focus lands on */
  anchor?: { x: number; y: number }
  /** Displayed width of the window at zoom 1 */
  baseWidth?: number
  opacity?: number
  blur?: number
  sheen?: number[]
}

function camAt(keys: CamKey[], f: number): CamKey {
  if (f <= keys[0].f) return keys[0]
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]
    const b = keys[i + 1]
    if (f <= b.f) {
      const t = EASE_IN_OUT(clamp((f - a.f) / Math.max(1, b.f - a.f)))
      const m = (k: keyof Omit<CamKey, 'f'>) => a[k] + (b[k] - a[k]) * t
      return { f, zoom: m('zoom'), cx: m('cx'), cy: m('cy'), rx: m('rx'), ry: m('ry') }
    }
  }
  return keys[keys.length - 1]
}

/** The spotlight glides from one element to the next when highlights are back to back */
function spotlightAt(hs: Highlight[], f: number) {
  const i = hs.findIndex((h) => f >= h.from && f < h.to)
  if (i < 0) return null
  const h = hs[i]
  const prev = i > 0 && hs[i - 1].to >= h.from - 2 ? hs[i - 1] : null
  const k = ramp(f, h.from, 9, EASE)
  const b = prev
    ? {
        x: prev.box.x + (h.box.x - prev.box.x) * k,
        y: prev.box.y + (h.box.y - prev.box.y) * k,
        w: prev.box.w + (h.box.w - prev.box.w) * k,
        h: prev.box.h + (h.box.h - prev.box.h) * k,
      }
    : h.box
  const next = hs[i + 1]
  const holdsIntoNext = next && next.from <= h.to + 2
  const o = (prev ? 1 : k) * (holdsIntoNext ? 1 : 1 - ramp(f, h.to - 8, 8, EASE))
  return { box: b, opacity: o, tone: h.tone ?? 'accent', secondary: h.secondary, dim: h.dim ?? 0.4, secondaryK: ramp(f, h.from + 4, 10, EASE) }
}

/**
 * The real PRISM AI console, as captured from the website, presented in a
 * gently tilted window. Spotlight, rings, cursor and notes all live in the
 * window's own coordinates, so they stay locked to the interface as the
 * camera moves.
 */
export function DashboardShowcase({
  frame,
  states,
  camera,
  highlights,
  cursor,
  annotations = [],
  anchor = { x: 960, y: 590 },
  baseWidth = 1500,
  opacity = 1,
  blur = 0,
  sheen = [],
}: Props) {
  const cam = camAt(camera, frame)
  const s = (baseWidth / WIN.w) * cam.zoom

  // current and previous captured state (cross-fade 6 frames, like the site's tab change)
  let cur = 0
  for (let i = 0; i < states.length; i++) if (frame >= states[i].from) cur = i
  const fadeIn = ramp(frame, states[cur].from, 6)
  const prev = cur > 0 && fadeIn < 1 ? states[cur - 1] : null

  const spot = spotlightAt(highlights, frame)
  const c = cursorAt(cursor.keys, frame)
  const cursorOn = cursor.show.reduce((m, [a, b]) => Math.max(m, ramp(frame, a, 8) * (1 - ramp(frame, b - 8, 8))), 0)

  const ringColor = spot?.tone === 'warn' ? color.warning : color.accent
  const ringGlow = spot?.tone === 'warn' ? 'rgba(245,165,36,0.35)' : 'rgba(76,141,255,0.38)'

  const sheenP = sheen.length ? sheen.map((at) => clamp((frame - at) / 30)).find((p) => p > 0 && p < 1) : undefined

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        perspective: 2400,
        perspectiveOrigin: `${anchor.x}px ${anchor.y}px`,
        opacity,
        filter: blur > 0.1 ? `blur(${blur}px)` : undefined,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: anchor.x - cam.cx,
          top: anchor.y - cam.cy,
          width: WIN.w,
          height: WIN.h,
          transformOrigin: `${cam.cx}px ${cam.cy}px`,
          transform: `rotateX(${cam.rx}deg) rotateY(${cam.ry}deg) scale(${s})`,
        }}
      >
        {/* shadow and spectral edge light */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 16,
            boxShadow: '0 40px 90px -30px rgba(0,0,0,0.85), 0 0 0 1px rgba(238,240,245,0.06), 0 -1px 50px -10px rgba(76,141,255,0.25)',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, borderRadius: 16, overflow: 'hidden' }}>
          {prev ? <Img src={staticFile(`ui/${prev.state}.png`)} style={{ position: 'absolute', left: 0, top: 0, width: WIN.w }} /> : null}
          <Img src={staticFile(`ui/${states[cur].state}.png`)} style={{ position: 'absolute', left: 0, top: 0, width: WIN.w, opacity: prev ? fadeIn : 1 }} />
          {/* spotlight: dim everything except the element in focus */}
          {spot ? (
            <div
              style={{
                position: 'absolute',
                left: spot.box.x,
                top: spot.box.y,
                width: spot.box.w,
                height: spot.box.h,
                borderRadius: 12,
                boxShadow: `0 0 0 4000px rgba(6, 9, 17, ${spot.dim * spot.opacity})`,
              }}
            />
          ) : null}
          {sheenP !== undefined ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(105deg, rgba(255,255,255,0) ${sheenP * 140 - 30}%, rgba(190,210,255,0.10) ${sheenP * 140 - 18}%, rgba(255,255,255,0) ${sheenP * 140 - 6}%)`,
              }}
            />
          ) : null}
        </div>
        {/* focus ring */}
        {spot ? (
          <>
            <div
              style={{
                position: 'absolute',
                left: spot.box.x - 1,
                top: spot.box.y - 1,
                width: spot.box.w + 2,
                height: spot.box.h + 2,
                borderRadius: 13,
                opacity: spot.opacity,
                boxShadow: `0 0 0 ${2 / s + 0.6}px ${ringColor}, 0 0 28px 4px ${ringGlow}`,
              }}
            />
            {spot.secondary ? (
              <div
                style={{
                  position: 'absolute',
                  left: spot.secondary.x - 1,
                  top: spot.secondary.y - 1,
                  width: spot.secondary.w + 2,
                  height: spot.secondary.h + 2,
                  borderRadius: 13,
                  opacity: spot.opacity * spot.secondaryK,
                  boxShadow: `0 0 0 ${1.5 / s + 0.4}px ${ringColor}, 0 0 18px 2px ${ringGlow}`,
                }}
              />
            ) : null}
          </>
        ) : null}
        {annotations.map((a, i) => {
          const p = ramp(frame, a.from, 12, EASE) * (1 - ramp(frame, a.to - 10, 10, EASE))
          return p > 0.001 ? <div key={i}>{a.render(p)}</div> : null
        })}
        <Cursor x={c.x} y={c.y} frame={frame} clicks={cursor.clicks} opacity={cursorOn} scale={1.15 / Math.max(0.8, cam.zoom)} />
      </div>
    </div>
  )
}
