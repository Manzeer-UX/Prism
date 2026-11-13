/**
 * Voiceover — open-source TTS (Kokoro-82M, Apache-2.0) via kokoro-js, run
 * locally on the CPU. No cloud service, no account.
 *
 *   node scripts/voiceover.mjs [--voice af_heart] [--speed 0.95] [--dry]
 *
 * Output
 *   public/audio/vo/<id>.wav    one file per spoken line (24 kHz mono)
 *   src/data/vo.json            ids, text, durations (seconds)
 *
 * Lines that belong together are synthesised as one utterance so the
 * intonation flows, then cut at the natural pauses into separate lines that
 * the timeline can place on the beat.
 */
import { KokoroTTS } from 'kokoro-js'
import { phonemize as espeak } from 'phonemizer'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 ? process.argv[i + 1] : fallback
}
const VOICE = arg('voice', 'af_heart')
const BASE_SPEED = Number(arg('speed', '0.95'))
const DRY = process.argv.includes('--dry')
const outDir = path.join(root, 'public', 'audio', 'vo')

/**
 * The script. `ids` lists one id per sentence; a unit with several ids is
 * spoken as one utterance and split at its pauses. Brand words are spelled
 * for the speech engine (Prism AI, Moogle Labs); on screen they keep the
 * official spelling.
 */
const UNITS = [
  // 01 — The opening question (serious, unhurried)
  { ids: ['s1-ai'], text: 'AI is transforming enterprise operations.', speed: 0.92 },
  { ids: ['s1-models', 's1-agents', 's1-decisions'], text: 'Models are thinking. Agents are acting. Decisions are accelerating.', speed: 0.92 },
  { ids: ['s1-question'], text: 'But one question remains.', speed: 0.9 },
  { ids: ['s1-built', 's1-governing'], text: "You built the AI. Who's governing it?", speed: 0.88 },
  // 02 — The invisible chain
  { ids: ['s2-chain'], text: 'Behind every AI response is a chain of interactions.', speed: 0.93 },
  { ids: ['s2-together'], text: 'Models, agents, tools and data, working together.', speed: 0.93 },
  { ids: ['s2-trace'], text: 'But when something goes wrong, can you trace what happened?', speed: 0.93 },
  // 03 — The enterprise challenge
  {
    ids: ['s3-answers', 's3-failures', 's3-costs', 's3-risks'],
    text: 'Inconsistent answers. Hidden failures. Rising costs. And growing governance risks.',
    speed: 0.93,
  },
  { ids: ['s3-control'], text: 'When AI becomes harder to understand, it becomes harder to control.', speed: 0.94 },
  // 04 — Introducing PRISM AI (confidence arrives)
  { ids: ['s4-intro'], text: 'Introducing Prism AI.', speed: 0.9 },
  { ids: ['s4-platform'], text: 'An enterprise AI governance platform, by Moogle Labs.', speed: 0.94 },
  { ids: ['s4-focus'], text: 'Bringing your AI ecosystem into focus.', speed: 0.94 },
  { ids: ['s4-observe', 's4-evaluate', 's4-govern'], text: 'Observe. Evaluate. Govern.', speed: 0.88 },
  // 05 — Product experience (calm, confident)
  { ids: ['s5-overview-1'], text: 'See your AI operations in one unified view.' },
  { ids: ['s5-overview-2'], text: 'Monitor activity, performance, errors and usage.' },
  { ids: ['s5-traces-1'], text: 'Follow the complete execution path.' },
  { ids: ['s5-traces-2'], text: 'Understand every model interaction, agent step and tool call.' },
  { ids: ['s5-prompts-1'], text: 'Manage prompts with greater control.' },
  { ids: ['s5-prompts-2'], text: 'Track versions, understand changes, and connect them to performance.' },
  { ids: ['s5-evals-1'], text: 'Measure the quality of AI responses.' },
  { ids: ['s5-evals-2'], text: 'Identify issues and evaluate performance before they affect users.' },
  { ids: ['s5-analytics-1'], text: 'Understand usage, speed and cost.' },
  { ids: ['s5-analytics-2'], text: 'Turn operational data into clearer decisions and stronger oversight.' },
  // 06 — Nine capabilities
  { ids: ['s6-nine'], text: 'Nine connected capabilities.' },
  { ids: ['s6-range'], text: 'From observability and evaluation, to cost intelligence, security and governance.' },
  { ids: ['s6-one'], text: 'One unified platform for enterprise AI.' },
  // 07 — Business value
  {
    ids: ['s7-faster', 's7-reliability', 's7-costs', 's7-confidence'],
    text: 'Find issues faster. Improve reliability. Understand costs. Scale with greater confidence.',
  },
  // 08 — Brand statement (strong, restrained)
  { ids: ['s8-name', 's8-chain', 's8-outcome'], text: 'Prism AI. See the chain. Govern the outcome.', speed: 0.88 },
]

/** Pronunciation fixes applied to the phoneme string (espeak → Kokoro) */
const PHONEME_FIXES = [
  // "Moogle" — rhymes with "Google"
  [/mˈuːɡəl|mˈuːɡl̩|mˈʊɡəl/g, 'mˈuɡəl'],
  // eSpeak quirks
  [/fˈeɪlɪɹz/g, 'fˈeɪljɚz'],
  [/sᵻkjˈʊɹɹᵻɾi/g, 'sᵻkjˈʊɹᵻɾi'],
]

// Same punctuation handling as kokoro-js: punctuation passes through, words go to eSpeak
const PUNCT = /(\s*[;:,.!?¡¿—…"«»“”()]+\s*)+/g
async function toPhonemes(text) {
  const parts = []
  let last = 0
  for (const m of text.matchAll(PUNCT)) {
    if (m.index > last) parts.push({ punct: false, text: text.slice(last, m.index) })
    parts.push({ punct: true, text: m[0] })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ punct: false, text: text.slice(last) })
  const out = (
    await Promise.all(parts.map(async (p) => (p.punct ? p.text : (await espeak(p.text, 'en-us')).join(' '))))
  ).join('')
  let ph = out
    .replace(/ʲ/g, 'j')
    .replace(/r/g, 'ɹ')
    .replace(/x/g, 'k')
    .replace(/ɬ/g, 'l')
    .replace(/ z(?=[;:,.!?¡¿—…"«»“” ]|$)/g, 'z')
    .trim()
  for (const [re, rep] of PHONEME_FIXES) ph = ph.replace(re, rep)
  return ph
}

/** RMS envelope in 10 ms hops */
function envelope(samples, sr, hopMs = 10) {
  const hop = Math.round((sr * hopMs) / 1000)
  const env = []
  for (let i = 0; i < samples.length; i += hop) {
    let s = 0
    const end = Math.min(samples.length, i + hop)
    for (let j = i; j < end; j++) s += samples[j] * samples[j]
    env.push(Math.sqrt(s / Math.max(1, end - i)))
  }
  return { env, hop }
}

/** Find the n longest pauses (as sample indices of their midpoints) */
function findPauses(samples, sr, n) {
  if (n <= 0) return []
  const { env, hop } = envelope(samples, sr)
  const peak = Math.max(...env)
  const thr = peak * 0.035
  const gaps = []
  let start = -1
  // ignore leading/trailing silence
  const first = env.findIndex((v) => v > thr)
  let lastIdx = env.length - 1
  while (lastIdx > 0 && env[lastIdx] <= thr) lastIdx--
  for (let i = first; i <= lastIdx; i++) {
    if (env[i] <= thr) {
      if (start < 0) start = i
    } else if (start >= 0) {
      gaps.push({ start, end: i, len: i - start })
      start = -1
    }
  }
  gaps.sort((a, b) => b.len - a.len)
  const chosen = gaps.slice(0, n).sort((a, b) => a.start - b.start)
  if (chosen.length < n) throw new Error(`found ${chosen.length} pauses, expected ${n}`)
  return chosen.map((g) => Math.round(((g.start + g.end) / 2) * hop))
}

/** Trim silence, keep a little air, short fades so cuts never click */
function trim(samples, sr, padMs = 40) {
  const { env, hop } = envelope(samples, sr)
  const peak = Math.max(...env)
  const thr = peak * 0.02
  let a = env.findIndex((v) => v > thr)
  let b = env.length - 1
  while (b > 0 && env[b] <= thr) b--
  const pad = Math.round((sr * padMs) / 1000)
  const s = Math.max(0, a * hop - pad)
  const e = Math.min(samples.length, (b + 1) * hop + pad * 2)
  const out = samples.slice(s, e)
  const fade = Math.round(sr * 0.012)
  for (let i = 0; i < fade && i < out.length; i++) {
    out[i] *= i / fade
    out[out.length - 1 - i] *= i / fade
  }
  return out
}

function wav16(samples, sr) {
  const buf = Buffer.alloc(44 + samples.length * 2)
  buf.write('RIFF', 0)
  buf.writeUInt32LE(36 + samples.length * 2, 4)
  buf.write('WAVEfmt ', 8)
  buf.writeUInt32LE(16, 16)
  buf.writeUInt16LE(1, 20)
  buf.writeUInt16LE(1, 22)
  buf.writeUInt32LE(sr, 24)
  buf.writeUInt32LE(sr * 2, 28)
  buf.writeUInt16LE(2, 32)
  buf.writeUInt16LE(16, 34)
  buf.write('data', 36)
  buf.writeUInt32LE(samples.length * 2, 40)
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]))
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2)
  }
  return buf
}

await mkdir(outDir, { recursive: true })

if (DRY) {
  for (const u of UNITS) console.log(u.ids.join('+').padEnd(40), await toPhonemes(u.text))
  process.exit(0)
}

console.log(`loading Kokoro-82M (fp32, cpu), voice ${VOICE}`)
const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'fp32', device: 'cpu' })

const manifest = { voice: VOICE, model: 'Kokoro-82M v1.0 (Apache-2.0)', sampleRate: 24000, lines: [] }
for (const u of UNITS) {
  const ph = await toPhonemes(u.text)
  const { input_ids } = tts.tokenizer(ph, { truncation: true })
  // Narrative lines are slowed for weight; product lines run at natural pace
  const speed = (u.speed ? u.speed * 0.97 : 1) * (BASE_SPEED / 0.95)
  const audio = await tts.generate_from_ids(input_ids, { voice: VOICE, speed })
  const sr = audio.sampling_rate
  const samples = audio.audio
  const cuts = findPauses(samples, sr, u.ids.length - 1)
  const bounds = [0, ...cuts, samples.length]
  const sentences = u.text.match(/[^.!?]+[.!?]/g) ?? [u.text]
  for (let k = 0; k < u.ids.length; k++) {
    const seg = trim(samples.slice(bounds[k], bounds[k + 1]), sr)
    const id = u.ids[k]
    await writeFile(path.join(outDir, `${id}.wav`), wav16(seg, sr))
    const text = u.ids.length > 1 ? sentences[k].trim() : u.text
    manifest.lines.push({ id, text, duration: +(seg.length / sr).toFixed(3) })
    console.log(id.padEnd(16), (seg.length / sr).toFixed(2) + 's', text)
  }
}
await writeFile(path.join(root, 'src', 'data', 'vo.json'), JSON.stringify(manifest, null, 1))
const total = manifest.lines.reduce((s, l) => s + l.duration, 0)
console.log(`total speech ${total.toFixed(1)}s across ${manifest.lines.length} lines`)
