/**
 * Final deliverables.
 *
 *   node scripts/render.mjs [--scale 1] [--chunk 600] [--concurrency 3] [--force]
 *
 * 1. Renders the film silently in chunks (resumable: finished chunks are kept),
 *    H.264 CRF 16, and frame-checks every chunk (re-rendered if any frame is
 *    blank or flashes). Scale 1 = 1920×1080 (the master); scale 2 = 3840×2160.
 * 2. Joins the chunks without re-encoding.
 * 3. Muxes the full mix and the music-and-effects mix (AAC 320 kb/s, 48 kHz).
 * 4. At scale 2 only, also makes a 1080p review copy (Lanczos downscale).
 *
 * Output: out/PRISM-AI_Launch-Film_1080p.mp4 and …_1080p_NoVO.mp4
 *         (…_4K.mp4, …_4K_NoVO.mp4, …_1080p_Review.mp4 at scale 2)
 *
 * Re-running with every chunk present just re-joins and re-muxes — the quick
 * way to pick up a new soundtrack.
 */
import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises'
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import override from './webpack-override.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`)
  return i > -1 ? process.argv[i + 1] : d
}
const SCALE = Number(arg('scale', '1'))
const CHUNK = Number(arg('chunk', '600'))
const CONCURRENCY = Number(arg('concurrency', '3'))
const FORCE = process.argv.includes('--force')
const tag = SCALE === 2 ? '4K' : `${Math.round(1080 * SCALE)}p`

const out = path.join(root, 'out')
const chunksDir = path.join(out, 'chunks', tag)
await mkdir(chunksDir, { recursive: true })

const ffmpeg = (args) => {
  const r = spawnSync('npx', ['remotion', 'ffmpeg', '-hide_banner', '-y', ...args], { cwd: root, stdio: 'inherit', shell: true })
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${args.join(' ')}`)
}
const probe = (file) => {
  const r = spawnSync('npx', ['remotion', 'ffprobe', '-v', 'error', '-show_entries', 'stream=codec_name,width,height,r_frame_rate,sample_rate,channels:format=duration', '-of', 'compact', `"${file}"`], { cwd: root, encoding: 'utf8', shell: true })
  return r.stdout.trim()
}

/**
 * Frame check: every frame downscaled to 96×54 and measured. The film has no
 * near-white frames and no single-frame flashes, so either one means a frame
 * lost its 3D layer.
 */
async function qc(file) {
  const dir = path.join(root, '.tmp', 'qc')
  await rm(dir, { recursive: true, force: true })
  await mkdir(dir, { recursive: true })
  ffmpeg(['-loglevel', 'error', '-i', `"${file}"`, '-vf', 'scale=96:54', `"${path.join(dir, 'f%04d.png')}"`])
  const files = (await readdir(dir)).sort()
  const means = []
  for (const f of files) {
    const { data } = await sharp(path.join(dir, f)).greyscale().raw().toBuffer({ resolveWithObject: true })
    let s = 0
    for (const v of data) s += v
    means.push(s / data.length)
  }
  const bad = []
  for (let i = 0; i < means.length; i++) {
    const flash = i > 0 && i < means.length - 1 && Math.abs(means[i] - (means[i - 1] + means[i + 1]) / 2) > 20
    if (means[i] > 200 || flash) bad.push(i)
  }
  console.log(`\n  frame check: ${means.length} frames, brightness ${Math.min(...means).toFixed(0)}–${Math.max(...means).toFixed(0)}, ${bad.length ? bad.length + ' bad' : 'clean'}`)
  return bad
}

console.log('bundling…')
const serveUrl = await bundle({ entryPoint: path.join(root, 'src', 'index.ts'), webpackOverride: override, publicDir: path.join(root, 'public') })
const composition = await selectComposition({ serveUrl, id: 'PrismLaunchFilm', inputProps: { audio: 'none' }, chromiumOptions: { gl: 'angle' } })
const total = composition.durationInFrames

const parts = []
for (let from = 0; from < total; from += CHUNK) {
  const to = Math.min(total, from + CHUNK) - 1
  const file = path.join(chunksDir, `part-${String(from).padStart(4, '0')}-${String(to).padStart(4, '0')}.mp4`)
  parts.push(file)
  if (!FORCE && existsSync(file) && (await stat(file)).size > 0) {
    console.log(`chunk ${from}–${to}: kept`)
    continue
  }
  const t0 = Date.now()
  // A lost WebGL context or a failed shader link cancels the render (see World3D),
  // and every finished chunk is scanned for blank or flashing frames, so a chunk
  // is either right or re-rendered at lower concurrency — never silently broken.
  for (let attempt = 0, conc = CONCURRENCY; ; attempt++, conc = Math.max(1, conc - 1)) {
    let last = -1
    try {
      await renderMedia({
        serveUrl,
        composition,
        inputProps: { audio: 'none' },
        codec: 'h264',
        crf: 16,
        x264Preset: 'medium',
        pixelFormat: 'yuv420p',
        colorSpace: 'bt709',
        scale: SCALE,
        muted: true,
        frameRange: [from, to],
        concurrency: conc,
        imageFormat: 'jpeg',
        jpegQuality: 95,
        chromiumOptions: { gl: 'angle' },
        timeoutInMilliseconds: 120000,
        outputLocation: file + '.tmp.mp4',
        onProgress: ({ progress }) => {
          const p = Math.floor(progress * 20)
          if (p !== last) {
            last = p
            process.stdout.write(`\rchunk ${from}–${to}: ${Math.round(progress * 100)}%   `)
          }
        },
      })
      const bad = await qc(file + '.tmp.mp4')
      if (bad.length) throw new Error(`frame check failed at frames ${bad.slice(0, 8).map((i) => from + i).join(', ')}`)
      break
    } catch (e) {
      await rm(file + '.tmp.mp4', { force: true })
      console.log(`\nchunk ${from}–${to}: attempt ${attempt + 1} failed (${e.message.split('\n')[0]})`)
      if (attempt >= 3) throw e
      console.log(`retrying with concurrency ${Math.max(1, conc - 1)}`)
    }
  }
  await rm(file, { force: true })
  ffmpeg(['-i', `"${file}.tmp.mp4"`, '-c', 'copy', '-movflags', '+faststart', `"${file}"`])
  await rm(file + '.tmp.mp4', { force: true })
  console.log(`\rchunk ${from}–${to}: ${((Date.now() - t0) / 1000).toFixed(0)} s`)
}

// join
const list = path.join(chunksDir, 'list.txt')
await writeFile(list, parts.map((p) => `file '${p.replace(/\\/g, '/')}'`).join('\n'))
const silent = path.join(out, `PRISM-AI_Launch-Film_${tag}_silent.mp4`)
ffmpeg(['-f', 'concat', '-safe', '0', '-i', `"${list}"`, '-c', 'copy', '-movflags', '+faststart', `"${silent}"`])

// mux the mixes
const mux = (audio, dest) =>
  ffmpeg([
    '-i', `"${silent}"`,
    '-i', `"${path.join(root, 'public', 'audio', audio)}"`,
    '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'copy', '-c:a', 'libfdk_aac', '-b:a', '320k', '-ar', '48000',
    '-shortest', '-movflags', '+faststart',
    '-metadata', 'title="PRISM AI — See the chain. Govern the outcome."',
    `"${dest}"`,
  ])
const master = path.join(out, `PRISM-AI_Launch-Film_${tag}.mp4`)
const novo = path.join(out, `PRISM-AI_Launch-Film_${tag}_NoVO.mp4`)
mux('mix-full.wav', master)
mux('mix-novo.wav', novo)

// 1080p review copy
if (SCALE > 1) {
  const review = path.join(out, 'PRISM-AI_Launch-Film_1080p_Review.mp4')
  ffmpeg([
    '-i', `"${master}"`,
    '-vf', 'scale=1920:1080:flags=lanczos',
    '-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-pix_fmt', 'yuv420p',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-c:a', 'copy', '-movflags', '+faststart',
    `"${review}"`,
  ])
  console.log(probe(review))
}
console.log(probe(master))
console.log(probe(novo))
await rm(silent, { force: true })
console.log('done')
