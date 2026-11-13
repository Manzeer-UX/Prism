/**
 * Prints a short-term loudness map (BS.1770 K-weighted, 1 s windows) of the
 * mixes and stems against the scene list — a way to check the soundtrack's
 * shape (quiet open, impacts, the silence before the reveal, the groove,
 * the resolution) and that narration always sits above the music.
 *
 *   node scripts/loudness-map.mjs
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const TL = JSON.parse(await readFile(path.join(root, 'src', 'data', 'timeline.json'), 'utf8'))

function read24(buf) {
  const nc = buf.readUInt16LE(22)
  const sr = buf.readUInt32LE(24)
  let off = 12
  while (buf.toString('ascii', off, off + 4) !== 'data') off += 8 + buf.readUInt32LE(off + 4)
  const n = buf.readUInt32LE(off + 4) / (3 * nc)
  const chs = Array.from({ length: nc }, () => new Float32Array(n))
  let o = off + 8
  for (let i = 0; i < n; i++) for (let c = 0; c < nc; c++, o += 3) chs[c][i] = buf.readIntLE(o, 3) / 8388608
  return { sr, chs }
}

function kweight(x) {
  const run = (x, b, a) => {
    const y = new Float32Array(x.length)
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0
    for (let i = 0; i < x.length; i++) {
      const v = b[0] * x[i] + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2
      x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v
    }
    return y
  }
  return run(run(x, [1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585]), [1, -2, 1], [1, -1.99004745483398, 0.99007225036621])
}

async function map(file) {
  const { sr, chs } = read24(await readFile(file))
  const k = chs.map(kweight)
  const out = []
  for (let s = 0; s < 120; s++) {
    let sum = 0
    for (const c of k) {
      let acc = 0
      for (let i = s * sr; i < (s + 1) * sr && i < c.length; i++) acc += c[i] * c[i]
      sum += acc / sr
    }
    out.push(sum > 0 ? -0.691 + 10 * Math.log10(sum) : -99)
  }
  return out
}

const files = {
  full: path.join(root, 'public', 'audio', 'mix-full.wav'),
  vo: path.join(root, 'out', 'audio', 'PRISM-AI_Stem_Voiceover.wav'),
  music: path.join(root, 'out', 'audio', 'PRISM-AI_Stem_Music.wav'),
  fx: path.join(root, 'out', 'audio', 'PRISM-AI_Stem_Effects.wav'),
}
const maps = {}
for (const [k, f] of Object.entries(files)) maps[k] = await map(f)

const fmt = (v) => (v < -60 ? '   ·' : v.toFixed(0).padStart(4))
console.log('  s  scene          full    vo music   fx   vo−music')
for (let s = 0; s < 120; s++) {
  const scene = TL.scenes.find((x) => s >= x.start && s < x.end)?.id ?? ''
  const gap = maps.vo[s] > -45 ? (maps.vo[s] - maps.music[s] - 8).toFixed(0).padStart(5) : '    ·'
  console.log(`${String(s).padStart(3)}  ${scene.padEnd(13)} ${fmt(maps.full[s])}  ${fmt(maps.vo[s])}  ${fmt(maps.music[s])} ${fmt(maps.fx[s])}  ${gap}`)
}
