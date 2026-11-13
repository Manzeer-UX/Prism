/**
 * Typed access to the resolved timeline (src/data/timeline.json, produced by
 * `npm run timeline` from scripts/plan.mjs and the measured voiceover).
 */
import data from './data/timeline.json'

export type SceneId = 'opening' | 'chain' | 'challenges' | 'reveal' | 'product' | 'capabilities' | 'value' | 'closing'

export const timeline = data
export const DURATION = data.durationInFrames
export const BEAT = 15 // frames per beat at 120 BPM / 30 fps

type Mark = keyof typeof data.marks

/** Frame of a named moment */
export const M = (name: Mark) => data.marks[name].frame

const lineMap = new Map(data.lines.map((l) => [l.id, l]))
/** Voiceover line by id: { from, to } in frames */
export function L(id: string) {
  const l = lineMap.get(id)
  if (!l) throw new Error(`unknown voiceover line ${id}`)
  return l
}

export function scene(id: SceneId) {
  const s = data.scenes.find((x) => x.id === id)
  if (!s) throw new Error(`unknown scene ${id}`)
  return s
}

export function chapter(id: string) {
  const c = data.chapters.find((x) => x.id === id)
  if (!c) throw new Error(`unknown chapter ${id}`)
  return c
}

export const sec = (t: number) => Math.round(t * data.fps)
