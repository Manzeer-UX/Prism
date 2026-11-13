/**
 * Review stills: bundle once, render many frames.
 *
 *   node scripts/stills.mjs 240 420 1300 [--scale 0.5] [--comp PrismLaunchFilm] [--sheet name]
 *
 * Frames can be numbers or seconds with an "s" suffix (e.g. 14.5s).
 * With --sheet, the frames are also tiled into out/stills/<name>.png.
 */
import { bundle } from '@remotion/bundler'
import { renderStill, selectComposition } from '@remotion/renderer'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  if (i < 0) return fallback
  const v = args[i + 1]
  args.splice(i, 2)
  return v
}
const scale = Number(opt('scale', '0.5'))
const compId = opt('comp', 'PrismLaunchFilm')
const sheet = opt('sheet', null)
const frames = args.map((a) => (a.endsWith('s') ? Math.round(parseFloat(a) * 30) : Number(a)))
const outDir = path.join(root, 'out', 'stills')
await mkdir(outDir, { recursive: true })

const { default: config } = await import('./webpack-override.mjs')
const serveUrl = await bundle({ entryPoint: path.join(root, 'src', 'index.ts'), webpackOverride: config, publicDir: path.join(root, 'public') })
const composition = await selectComposition({ serveUrl, id: compId, inputProps: {}, chromiumOptions: { gl: 'angle' } })

const files = []
for (const frame of frames) {
  const file = path.join(outDir, `f${String(frame).padStart(4, '0')}.png`)
  const t0 = Date.now()
  await renderStill({ serveUrl, composition, frame, output: file, scale, chromiumOptions: { gl: 'angle' }, overwrite: true })
  console.log(`frame ${frame} (${(frame / 30).toFixed(2)}s) → ${path.relative(root, file)} in ${Date.now() - t0} ms`)
  files.push(file)
}

if (sheet && files.length) {
  const meta = await sharp(files[0]).metadata()
  const cols = Math.min(Number(opt('cols', '2')), files.length)
  const rows = Math.ceil(files.length / cols)
  const w = meta.width
  const h = meta.height
  const tiles = await Promise.all(files.map((f) => sharp(f).resize(w, h).toBuffer()))
  await sharp({ create: { width: w * cols, height: h * rows, channels: 3, background: '#000' } })
    .composite(tiles.map((input, i) => ({ input, left: (i % cols) * w, top: Math.floor(i / cols) * h })))
    .png()
    .toFile(path.join(outDir, `${sheet}.png`))
  console.log(`sheet → out/stills/${sheet}.png`)
}
