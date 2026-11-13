/**
 * Builds the soundtrack: score + sound design (scripts/audio/score.js, Tone.js
 * rendered offline in headless Edge), the voiceover placed on the cue sheet,
 * and the final mixes.
 *
 *   node scripts/audio.mjs
 *
 * Output
 *   public/audio/mix-full.wav     voiceover + music (ducked) + effects, mastered
 *   public/audio/mix-novo.wav     music + effects (M&E, for localisation)
 *   out/audio/*.wav               stems: voiceover, music, effects (24-bit)
 *
 * Loudness is measured with ITU-R BS.1770-4 gating. Targets: narration −17 LUFS,
 * music bed −23 LUFS (ducked 8 dB under speech), final mix −16 LUFS integrated
 * with peaks held under −1 dBFS.
 */
import { chromium } from 'playwright'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const TL = JSON.parse(await readFile(path.join(root, 'src', 'data', 'timeline.json'), 'utf8'))
const DURATION = TL.durationInFrames / TL.fps
const SR = 48000
const TARGET = { vo: -17, music: -21.5, sfx: -28, mix: -16 }
const CEILING_DB = -1.0

/**
 * Look-ahead brickwall limiter (5 ms look-ahead, 120 ms release) — the final
 * guarantee that no sample passes the ceiling, applied identically to both
 * channels so the stereo image never shifts.
 */
function limit(chs, ceilingDb = CEILING_DB) {
  const ceiling = Math.pow(10, ceilingDb / 20)
  const n = chs[0].length
  const look = Math.round(0.005 * SR)
  const need = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    let p = 0
    for (const c of chs) p = Math.max(p, Math.abs(c[i]))
    need[i] = p > ceiling ? ceiling / p : 1
  }
  // minimum over the look-ahead window (monotonic deque)
  const held = new Float32Array(n)
  const dq = []
  for (let i = n - 1; i >= 0; i--) {
    while (dq.length && need[dq[dq.length - 1]] >= need[i]) dq.pop()
    dq.push(i)
    while (dq[0] > i + 2 * look) dq.shift()
    held[i] = need[dq[0]]
  }
  // smooth: box filter over the look-ahead (attack), exponential release
  const out = chs.map(() => new Float32Array(n))
  const rel = Math.exp(-1 / (0.12 * SR))
  let acc = look // the window starts full of unity gain
  let g = 1
  const box = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    acc += held[i] - (i >= look ? held[i - look] : 1)
    box[i] = Math.min(held[i], acc / look)
  }
  for (let i = 0; i < n; i++) {
    g = box[i] < g ? box[i] : box[i] + (g - box[i]) * rel
    g = Math.min(g, held[i])
    for (let c = 0; c < chs.length; c++) out[c][i] = chs[c][i] * g
  }
  return out
}

/* ------------------------------------------------------------- WAV I/O */

function readWav16(buf) {
  const sr = buf.readUInt32LE(24)
  let off = 12
  while (off < buf.length) {
    const id = buf.toString('ascii', off, off + 4)
    const size = buf.readUInt32LE(off + 4)
    if (id === 'data') {
      const n = size / 2
      const out = new Float32Array(n)
      for (let i = 0; i < n; i++) out[i] = buf.readInt16LE(off + 8 + i * 2) / 32768
      return { sr, samples: out }
    }
    off += 8 + size
  }
  throw new Error('no data chunk')
}

function wav24(channels, sr = SR) {
  const n = channels[0].length
  const nc = channels.length
  const buf = Buffer.alloc(44 + n * nc * 3)
  buf.write('RIFF', 0)
  buf.writeUInt32LE(36 + n * nc * 3, 4)
  buf.write('WAVEfmt ', 8)
  buf.writeUInt32LE(16, 16)
  buf.writeUInt16LE(1, 20)
  buf.writeUInt16LE(nc, 22)
  buf.writeUInt32LE(sr, 24)
  buf.writeUInt32LE(sr * nc * 3, 28)
  buf.writeUInt16LE(nc * 3, 32)
  buf.writeUInt16LE(24, 34)
  buf.write('data', 36)
  buf.writeUInt32LE(n * nc * 3, 40)
  let o = 44
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < nc; c++) {
      const v = Math.max(-1, Math.min(1, channels[c][i]))
      buf.writeIntLE(Math.round(v * 8388607), o, 3)
      o += 3
    }
  }
  return buf
}

/* ------------------------------------------------- BS.1770 loudness meter */

function biquad(x, b, a) {
  const y = new Float64Array(x.length)
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0
  for (let i = 0; i < x.length; i++) {
    const v = b[0] * x[i] + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2
    x2 = x1
    x1 = x[i]
    y2 = y1
    y1 = v
    y[i] = v
  }
  return y
}

/** BS.1770 K-weighting at 48 kHz */
const kweight = (c) =>
  biquad(
    biquad(c, [1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585]),
    [1, -2, 1],
    [1, -1.99004745483398, 0.99007225036621],
  )

function lufs(chs) {
  const kw = chs.map(kweight)
  const block = Math.round(0.4 * SR)
  const hop = Math.round(0.1 * SR)
  const ms = []
  for (let s = 0; s + block <= kw[0].length; s += hop) {
    let sum = 0
    for (const c of kw) {
      let acc = 0
      for (let i = s; i < s + block; i++) acc += c[i] * c[i]
      sum += acc / block
    }
    ms.push(sum)
  }
  const L = (m) => -0.691 + 10 * Math.log10(m)
  const abs = ms.filter((m) => L(m) > -70)
  if (!abs.length) return -Infinity
  const rel = L(abs.reduce((a, b) => a + b, 0) / abs.length) - 10
  const gated = abs.filter((m) => L(m) > rel)
  return L(gated.reduce((a, b) => a + b, 0) / gated.length)
}

const peakDb = (chs) => 20 * Math.log10(Math.max(...chs.map((c) => c.reduce((m, v) => Math.max(m, Math.abs(v)), 0))) || 1e-9)

/* ----------------------------------------------------------- the browser */

const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] })
const page = await browser.newPage()
page.on('pageerror', (e) => console.error('page error:', e.message))
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') console.log('page:', m.text())
})
await page.goto('about:blank')
await page.addScriptTag({ path: path.join(root, 'node_modules', 'tone', 'build', 'Tone.js') })
await page.addScriptTag({ path: path.join(root, 'scripts', 'audio', 'score.js') })

async function pull(name) {
  const length = await page.evaluate((n) => window.PRISM_AUDIO.stems[n][0].length, name)
  const chs = []
  const step = SR * 6
  for (let ch = 0; ch < 2; ch++) {
    const out = new Float32Array(length)
    for (let from = 0; from < length; from += step) {
      const b64 = await page.evaluate(([n, c, a, b]) => window.PRISM_AUDIO.chunk(n, c, a, b), [name, ch, from, Math.min(length, from + step)])
      const bytes = Buffer.from(b64, 'base64')
      out.set(new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4), from)
    }
    chs.push(out)
  }
  return chs
}

const t0 = Date.now()
const time = () => `${((Date.now() - t0) / 1000).toFixed(0)}s`

// The score takes minutes to render offline, so stems are cached by content
const scoreSrc = await readFile(path.join(root, 'scripts', 'audio', 'score.js'), 'utf8')
// only the music and sound-design code invalidates the cache, not mix settings
const scorePart = scoreSrc.split('/* --------------------------------------------------------------- mix */')[0]
const key = createHash('sha1').update(scorePart).update(JSON.stringify(TL)).digest('hex').slice(0, 12)
const cacheDir = path.join(root, '.cache', 'audio')
await mkdir(cacheDir, { recursive: true })

async function stem(name) {
  const file = path.join(cacheDir, `${key}-${name}.f32`)
  try {
    const raw = await readFile(file)
    const all = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4)
    const n = all.length / 2
    await page.evaluate(([s, len]) => window.PRISM_AUDIO.alloc(s, len), [name, n])
    const step = SR * 6
    for (let ch = 0; ch < 2; ch++) {
      for (let from = 0; from < n; from += step) {
        const part = all.subarray(ch * n + from, ch * n + Math.min(n, from + step))
        const b64 = Buffer.from(part.buffer, part.byteOffset, part.byteLength).toString('base64')
        await page.evaluate(([s, c, f, b]) => window.PRISM_AUDIO.put(s, c, f, b), [name, ch, from, b64])
      }
    }
    console.log(`  ${name}: cached`, time())
  } catch {
    console.log(`  ${name}:`, await page.evaluate(([s, tl, d]) => window.PRISM_AUDIO.renderStem(s, tl, d), [name, TL, DURATION]), time())
    const chs = await pull(name)
    const both = new Float32Array(chs[0].length * 2)
    both.set(chs[0], 0)
    both.set(chs[1], chs[0].length)
    await writeFile(file, Buffer.from(both.buffer))
  }
}

console.log(`score (${DURATION}s)…`)
await stem('music')
await stem('sfx')

// voiceover lines, placed on the cue sheet
const voLines = []
for (const l of TL.lines) {
  const { sr, samples } = readWav16(await readFile(path.join(root, 'public', 'audio', 'vo', `${l.id}.wav`)))
  voLines.push({ start: l.start, end: l.end, sr, data: Buffer.from(samples.buffer).toString('base64') })
}
console.log('  voiceover lines', await page.evaluate((ls) => window.PRISM_AUDIO.loadVO(ls), voLines))

const music = await pull('music')
const sfx = await pull('sfx')
await page.evaluate(([d, o]) => window.PRISM_AUDIO.renderMix('vo', d, o), [DURATION, { voDb: 0, masterDb: 0 }])
const voRaw = await pull('mix-vo')

const measured = { music: lufs(music), sfx: lufs(sfx), vo: lufs(voRaw) }
console.log('stem loudness (LUFS):', Object.fromEntries(Object.entries(measured).map(([k, v]) => [k, v.toFixed(1)])), time())

const opts = {
  voDb: TARGET.vo - measured.vo,
  musicDb: TARGET.music - measured.music,
  sfxDb: TARGET.sfx - measured.sfx,
  duckDb: -7,
  masterDb: 0,
}

/**
 * Adaptive ducking: for each narration line, measure the voice and the music
 * under it (K-weighted, over the line's span) and duck the music just enough
 * that it sits at least MARGIN dB below the voice — never less than 5 dB, never
 * more than 15. Loud musical moments under a line get pulled down further.
 */
const MARGIN = 11
{
  const kMusic = music.map(kweight)
  const kVo = voRaw.map(kweight)
  const span = (k, a, b) => {
    const i0 = Math.max(0, Math.floor(a * SR))
    const i1 = Math.min(k[0].length, Math.floor(b * SR))
    let sum = 0
    for (const c of k) for (let i = i0; i < i1; i++) sum += c[i] * c[i]
    return -0.691 + 10 * Math.log10(sum / Math.max(1, i1 - i0) + 1e-12)
  }
  opts.lineDucks = TL.lines.map((l) => {
    const v = span(kVo, l.start, l.end) + opts.voDb
    const m = span(kMusic, l.start, l.end) + opts.musicDb
    const need = v - MARGIN - m
    return Math.max(-15, Math.min(-5, need))
  })
  const deep = TL.lines.map((l, i) => [l.id, opts.lineDucks[i]]).filter(([, d]) => d < -8.5)
  console.log('adaptive ducking — deeper than −8.5 dB:', deep.map(([id, d]) => `${id} ${d.toFixed(1)}`).join(', ') || 'none')
}

// pass 1: find the master gain that lands the full mix on target
await page.evaluate(([d, o]) => window.PRISM_AUDIO.renderMix('full', d, o), [DURATION, opts])
let full = limit(await pull('mix-full'))
let L = lufs(full)
opts.masterDb = TARGET.mix - L
console.log(`full mix pass 1: ${L.toFixed(1)} LUFS → master ${opts.masterDb.toFixed(1)} dB`, time())
// pass 2 (and a correction pass if limiting moved it)
for (let i = 0; i < 2; i++) {
  await page.evaluate(([d, o]) => window.PRISM_AUDIO.renderMix('full', d, o), [DURATION, opts])
  full = limit(await pull('mix-full'))
  L = lufs(full)
  if (Math.abs(L - TARGET.mix) < 0.4) break
  opts.masterDb += TARGET.mix - L
}
console.log(`full mix: ${L.toFixed(1)} LUFS, peak ${peakDb(full).toFixed(2)} dBFS`, time())

await page.evaluate(([d, o]) => window.PRISM_AUDIO.renderMix('novo', d, o), [DURATION, opts])
const novo = limit(await pull('mix-novo'))
console.log(`M&E mix: ${lufs(novo).toFixed(1)} LUFS, peak ${peakDb(novo).toFixed(2)} dBFS`, time())

await page.evaluate(([d, o]) => window.PRISM_AUDIO.renderMix('vo', d, o), [DURATION, { voDb: opts.voDb + opts.masterDb, masterDb: 0 }])
const vo = await pull('mix-vo')
await browser.close()

const gain = (chs, db) => chs.map((c) => c.map((v) => v * Math.pow(10, db / 20)))
await mkdir(path.join(root, 'public', 'audio'), { recursive: true })
await mkdir(path.join(root, 'out', 'audio'), { recursive: true })
await writeFile(path.join(root, 'public', 'audio', 'mix-full.wav'), wav24(full))
await writeFile(path.join(root, 'public', 'audio', 'mix-novo.wav'), wav24(novo))
await writeFile(path.join(root, 'out', 'audio', 'PRISM-AI_Stem_Voiceover.wav'), wav24(vo))
await writeFile(path.join(root, 'out', 'audio', 'PRISM-AI_Stem_Music.wav'), wav24(gain(music, opts.musicDb + opts.masterDb)))
await writeFile(path.join(root, 'out', 'audio', 'PRISM-AI_Stem_Effects.wav'), wav24(gain(sfx, opts.sfxDb + opts.masterDb)))
await writeFile(
  path.join(root, 'src', 'data', 'mix.json'),
  JSON.stringify({ targets: TARGET, measured, gains: opts, fullLufs: +L.toFixed(2), fullPeakDb: +peakDb(full).toFixed(2) }, null, 1),
)
console.log('wrote public/audio/mix-full.wav, mix-novo.wav and out/audio stems', time())
