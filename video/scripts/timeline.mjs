/**
 * Resolves the cue sheet (scripts/plan.mjs) against the measured voiceover
 * (src/data/vo.json) and writes src/data/timeline.json.
 *
 *   node scripts/timeline.mjs
 *
 * Fails loudly if a line would overlap the next one or spill past its scene,
 * so timing problems surface before anything is rendered.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { BPM, CHAPTERS, DURATION, MARKS, SCENES, VO } from './plan.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FPS = 30
const vo = JSON.parse(await readFile(path.join(root, 'src', 'data', 'vo.json'), 'utf8'))
const byId = new Map(vo.lines.map((l) => [l.id, l]))

const problems = []
const lines = Object.entries(VO)
  .map(([id, start]) => {
    const line = byId.get(id)
    if (!line) throw new Error(`no recording for ${id}`)
    return { id, text: line.text, start, end: +(start + line.duration).toFixed(3), duration: line.duration }
  })
  .sort((a, b) => a.start - b.start)

for (let i = 0; i < lines.length; i++) {
  const l = lines[i]
  const next = lines[i + 1]
  if (next && l.end + 0.2 > next.start) problems.push(`${l.id} ends ${l.end}s, ${next.id} starts ${next.start}s`)
  const scene = SCENES.find((s) => l.start >= s.start && l.start < s.end)
  if (!scene) problems.push(`${l.id} starts outside every scene`)
  else if (l.end > scene.end + 1.2) problems.push(`${l.id} runs ${(l.end - scene.end).toFixed(2)}s past ${scene.id}`)
  l.scene = scene?.id
}
const last = lines[lines.length - 1]
if (last.end > DURATION - 0.8) problems.push(`last line ends ${last.end}s — no hold before the end`)

const f = (t) => Math.round(t * FPS)
const out = {
  fps: FPS,
  bpm: BPM,
  durationInFrames: f(DURATION),
  scenes: SCENES.map((s) => ({ ...s, from: f(s.start), to: f(s.end) })),
  chapters: CHAPTERS.map((c) => ({ ...c, from: f(c.start), to: f(c.end) })),
  lines: lines.map((l) => ({ ...l, from: f(l.start), to: f(l.end) })),
  marks: Object.fromEntries(Object.entries(MARKS).map(([k, t]) => [k, { t, frame: f(t) }])),
}
await writeFile(path.join(root, 'src', 'data', 'timeline.json'), JSON.stringify(out, null, 1))

for (const s of SCENES) {
  const ls = lines.filter((l) => l.scene === s.id)
  const speech = ls.reduce((a, l) => a + l.duration, 0)
  console.log(`${s.id.padEnd(13)} ${String(s.start).padStart(5)}–${String(s.end).padEnd(5)} speech ${speech.toFixed(1)}s`)
}
console.log(`last word ends ${last.end}s of ${DURATION}s`)
if (problems.length) {
  console.error('\nTiming problems:\n  ' + problems.join('\n  '))
  process.exit(1)
}
console.log('timeline ok')
