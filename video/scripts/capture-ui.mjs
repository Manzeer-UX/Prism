/**
 * Captures the real PRISM AI console UI from the running website so the film
 * shows the actual product interface rather than a redrawn imitation.
 *
 *   node scripts/capture-ui.mjs http://localhost:5173
 *
 * Output
 *   public/ui/<state>.png          console window at 3x device pixels (4K-ready)
 *   src/data/ui-layout.json        element boxes (CSS px, relative to the window)
 *
 * The site is not modified. Capture-only tweaks are applied in the headless
 * browser: the platform section is switched to its dark surface (the design
 * system supports both), the window shadow is removed (the film adds its own),
 * and every view gets the same panel height so views can cross-fade in place.
 * Reduced motion is emulated so every figure renders at its final value.
 */
import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const url = process.argv[2] ?? 'http://localhost:5173'
const outDir = path.join(root, 'public', 'ui')
const dataDir = path.join(root, 'src', 'data')
const DPR = 3

await mkdir(outDir, { recursive: true })
await mkdir(dataDir, { recursive: true })

const browser = await chromium.launch({ channel: 'msedge', headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: DPR,
  reducedMotion: 'reduce',
})
const page = await context.newPage()
await page.goto(url, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)

// Capture-only presentation tweaks (dark surface, transparent surroundings, no shadow)
await page.addStyleTag({
  content: `
    html, body, #platform { background: transparent !important; }
    #platform { border: 0 !important; }
  `,
})
await page.evaluate(() => {
  const section = document.getElementById('platform')
  section.dataset.theme = 'dark'
  const win = document.getElementById('console-panel').closest('.rounded-2xl')
  win.id = 'capture-window'
  win.style.boxShadow = 'none'
  win.scrollIntoView({ block: 'center' })
})

const settle = (ms = 700) => page.waitForTimeout(ms)

async function selectTab(id) {
  await page.click(`#console-tab-${id}`)
  await settle()
  await page.evaluate(() => document.getElementById('capture-window').scrollIntoView({ block: 'center' }))
  await settle(250)
}

// Pass 1 — equalise panel heights so every view has identical window dimensions
const tabs = ['overview', 'traces', 'prompts', 'evaluations', 'analytics']
let maxPanel = 0
for (const id of tabs) {
  await selectTab(id)
  const h = await page.evaluate(() => document.getElementById('console-panel').getBoundingClientRect().height)
  maxPanel = Math.max(maxPanel, h)
}
await page.evaluate((h) => {
  document.getElementById('console-panel').style.minHeight = `${Math.ceil(h)}px`
}, maxPanel)

/** Boxes of everything the film may point at, relative to the window */
function collect() {
  const win = document.getElementById('capture-window')
  const panel = document.getElementById('console-panel')
  const origin = win.getBoundingClientRect()
  const box = (el, kind, text) => {
    const r = el.getBoundingClientRect()
    return {
      kind,
      text: (text ?? el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 80),
      x: +(r.left - origin.left).toFixed(1),
      y: +(r.top - origin.top).toFixed(1),
      w: +r.width.toFixed(1),
      h: +r.height.toFixed(1),
    }
  }
  const out = [box(win, 'window', 'window'), box(panel, 'panel', 'panel')]
  const rail = win.querySelector('.bg-brand-navy')
  if (rail) {
    const names = ['logo', 'overview', 'traces', 'prompts', 'evaluations', 'analytics']
    ;[...rail.children].forEach((el, i) => out.push(box(el, 'rail', names[i] ?? `rail-${i}`)))
  }
  const header = panel.previousElementSibling
  if (header) out.push(box(header, 'header'))
  panel.querySelectorAll('.rounded-xl').forEach((el) => {
    const label = el.querySelector('p, dt')?.textContent ?? ''
    out.push(box(el, 'card', label))
  })
  panel.querySelectorAll('dl > div').forEach((el) => out.push(box(el, 'stat')))
  panel.querySelectorAll('button').forEach((el) => out.push(box(el, 'row')))
  panel.querySelectorAll('li').forEach((el) => out.push(box(el, 'li')))
  panel.querySelectorAll('tbody tr').forEach((el) => out.push(box(el, 'tr')))
  panel.querySelectorAll('pre').forEach((el) => out.push(box(el, 'pre')))
  panel.querySelectorAll('svg[role="img"], [role="img"]').forEach((el) => out.push(box(el, 'chart', el.getAttribute('aria-label') ?? '')))
  panel.querySelectorAll('ol').forEach((el) => out.push(box(el, 'ol')))
  return out
}

const layout = { dpr: DPR, states: {} }

async function shoot(state) {
  // Park the pointer outside the window so no row shows a hover state
  await page.mouse.move(2, 2)
  await settle(300)
  const win = page.locator('#capture-window')
  await win.screenshot({ path: path.join(outDir, `${state}.png`), omitBackground: true, animations: 'disabled' })
  layout.states[state] = await page.evaluate(collect)
  console.log('captured', state)
}

// Pass 2 — the views and the interaction states the film steps through
await selectTab('overview')
await shoot('overview')

await selectTab('traces')
await shoot('traces') // default selection: llm.generate
const spans = ['run', 'plan', 'retrieve', 'tool', 'eval']
const spanLabels = { run: 'agent.run', plan: 'plan.step', retrieve: 'retrieval.search', tool: 'tool.call', eval: 'eval.judge' }
for (const s of spans) {
  await page.locator('#console-panel button', { hasText: spanLabels[s] }).click()
  await shoot(`traces-${s}`)
}
await page.locator('#console-panel button', { hasText: 'llm.generate' }).click()

await selectTab('prompts')
await shoot('prompts') // v14 selected
for (const v of ['v13', 'v12']) {
  await page.locator('#console-panel button', { hasText: v }).first().click()
  await shoot(`prompts-${v}`)
}

await selectTab('evaluations')
await shoot('evaluations')

await selectTab('analytics')
await shoot('analytics')

await writeFile(path.join(dataDir, 'ui-layout.json'), JSON.stringify(layout, null, 1))
await browser.close()
console.log(`done — ${Object.keys(layout.states).length} states, panel height ${Math.ceil(maxPanel)}px`)
