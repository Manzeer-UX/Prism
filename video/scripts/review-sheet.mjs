/**
 * Contact sheet from a finished film file — frames at the story's key beats,
 * tiled two across, for a final check of what was actually encoded.
 *
 *   node scripts/review-sheet.mjs out/PRISM-AI_Launch-Film_1080p.mp4 [name]
 */
import { spawnSync } from 'node:child_process'
import { mkdir, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const input = path.resolve(process.argv[2] ?? path.join(root, 'out', 'PRISM-AI_Launch-Film_1080p.mp4'))
const name = process.argv[3] ?? 'final-review'
const BEATS = [2, 8, 14.9, 18.5, 26.9, 32.0, 35.4, 41.9, 44.8, 48.5, 52.8, 55.9, 59.5, 62.4, 68.6, 70.6, 77.0, 83.2, 89.9, 92.5, 101.5, 105.6, 109.6, 113.4, 115.6, 119.5]

const dir = path.join(root, '.tmp', 'review')
await rm(dir, { recursive: true, force: true })
await mkdir(dir, { recursive: true })
const files = []
for (const t of BEATS) {
  const f = path.join(dir, `t${String(t).replace('.', '_')}.png`)
  const r = spawnSync('npx', ['remotion', 'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-ss', String(t), '-i', `"${input}"`, '-frames:v', '1', '-vf', 'scale=640:360', `"${f}"`], {
    cwd: root,
    shell: true,
    stdio: 'inherit',
  })
  if (r.status === 0) files.push({ f, t })
}
const W = 640
const H = 360
const cols = 3
const rows = Math.ceil(files.length / cols)
const tiles = await Promise.all(
  files.map(async ({ f, t }) => {
    const label = Buffer.from(
      `<svg width="${W}" height="${H}"><rect x="8" y="8" width="70" height="26" rx="6" fill="rgba(0,0,0,0.6)"/><text x="16" y="27" font-family="monospace" font-size="16" fill="#fff">${t.toFixed(1)}s</text></svg>`,
    )
    return sharp(f).composite([{ input: label }]).toBuffer()
  }),
)
const out = path.join(root, 'out', 'stills', `${name}.png`)
await mkdir(path.dirname(out), { recursive: true })
await sharp({ create: { width: W * cols, height: H * rows, channels: 3, background: '#000' } })
  .composite(tiles.map((input, i) => ({ input, left: (i % cols) * W, top: Math.floor(i / cols) * H })))
  .png()
  .toFile(out)
console.log(`${files.length} frames → ${path.relative(root, out)}`)
