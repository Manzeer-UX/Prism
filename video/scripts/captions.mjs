/**
 * Captions from the timed voiceover: out/PRISM-AI_Launch-Film_EN.srt and .vtt.
 * Short lines that belong together are merged so each caption is readable
 * (max ~42 characters per line, two lines, at least 1.2 s on screen).
 *
 *   node scripts/captions.mjs
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const TL = JSON.parse(await readFile(path.join(root, 'src', 'data', 'timeline.json'), 'utf8'))

// on screen the brand keeps its official spelling
const display = (t) => t.replace(/Prism AI/g, 'PRISM AI').replace(/Moogle Labs/g, 'MoogleLabs')

const cues = []
for (const l of TL.lines) {
  const text = display(l.text)
  const prev = cues[cues.length - 1]
  if (prev && l.start - prev.end < 0.6 && (prev.text + ' ' + text).length <= 84 && l.scene === prev.scene) {
    prev.text += ' ' + text
    prev.end = l.end
  } else {
    cues.push({ start: l.start, end: l.end, text, scene: l.scene })
  }
}
for (let i = 0; i < cues.length; i++) {
  const c = cues[i]
  const next = cues[i + 1]
  c.end = Math.max(c.end + 0.25, c.start + 1.2)
  if (next) c.end = Math.min(c.end, next.start - 0.05)
}

function wrap(text, max = 42) {
  if (text.length <= max) return [text]
  const words = text.split(' ')
  let best = [text]
  let bestScore = Infinity
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ')
    const b = words.slice(i).join(' ')
    const score = Math.abs(a.length - b.length) + (a.length > max || b.length > max ? 1000 : 0)
    if (score < bestScore) {
      bestScore = score
      best = [a, b]
    }
  }
  return best
}

const ts = (t, sep) => {
  const ms = Math.round(t * 1000)
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const r = ms % 1000
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}${sep}${String(r).padStart(3, '0')}`
}

const srt = cues.map((c, i) => `${i + 1}\n${ts(c.start, ',')} --> ${ts(c.end, ',')}\n${wrap(c.text).join('\n')}\n`).join('\n')
const vtt = 'WEBVTT\n\n' + cues.map((c) => `${ts(c.start, '.')} --> ${ts(c.end, '.')}\n${wrap(c.text).join('\n')}\n`).join('\n')

await mkdir(path.join(root, 'out'), { recursive: true })
await writeFile(path.join(root, 'out', 'PRISM-AI_Launch-Film_EN.srt'), srt)
await writeFile(path.join(root, 'out', 'PRISM-AI_Launch-Film_EN.vtt'), vtt)
console.log(`${cues.length} captions → out/PRISM-AI_Launch-Film_EN.srt, .vtt`)
