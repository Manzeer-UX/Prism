/**
 * Cue sheet — the film's single source of timing (seconds).
 *
 * The voiceover was recorded first; these placements were then set around the
 * measured line lengths (src/data/vo.json) with natural pauses, and snapped to
 * the 120 BPM beat grid (one beat = 0.5 s = 15 frames) wherever a cut, impact
 * or on-screen word lands. `npm run timeline` resolves this into
 * src/data/timeline.json, which both the audio mix and every scene read.
 */
export const BPM = 120
export const DURATION = 120

export const SCENES = [
  { id: 'opening', title: '01 · The opening question', start: 0, end: 16 },
  { id: 'chain', title: '02 · The invisible AI chain', start: 16, end: 29 },
  { id: 'challenges', title: '03 · The enterprise AI challenge', start: 29, end: 42.5 },
  { id: 'reveal', title: '04 · Introducing PRISM AI', start: 42.5, end: 57 },
  { id: 'product', title: '05 · The PRISM AI product experience', start: 57, end: 96 },
  { id: 'capabilities', title: '06 · Nine connected capabilities', start: 96, end: 107 },
  { id: 'value', title: '07 · Enterprise business value', start: 107, end: 114 },
  { id: 'closing', title: '08 · The final brand reveal', start: 114, end: 120 },
]

/** Product-experience chapters inside scene 05 */
export const CHAPTERS = [
  { id: 'overview', start: 57, end: 64.5 },
  { id: 'traces', start: 64.5, end: 72 },
  { id: 'prompts', start: 72, end: 79.5 },
  { id: 'evaluations', start: 79.5, end: 87.5 },
  { id: 'analytics', start: 87.5, end: 96 },
]

/** Where each voiceover line starts */
export const VO = {
  's1-ai': 1.0,
  's1-models': 4.4,
  's1-agents': 6.0,
  's1-decisions': 7.5,
  's1-question': 9.8,
  's1-built': 12.0,
  's1-governing': 14.0,

  's2-chain': 16.9,
  's2-together': 21.1,
  's2-trace': 25.0,

  's3-answers': 29.3,
  's3-failures': 31.2,
  's3-costs': 32.7,
  's3-risks': 34.3,
  's3-control': 36.5,

  's4-intro': 43.5,
  's4-platform': 45.9,
  's4-focus': 50.1,
  's4-observe': 53.5,
  's4-evaluate': 54.5,
  's4-govern': 55.5,

  's5-overview-1': 57.6,
  's5-overview-2': 61.0,
  's5-traces-1': 65.0,
  's5-traces-2': 67.3,
  's5-prompts-1': 72.5,
  's5-prompts-2': 74.75,
  's5-evals-1': 80.0,
  's5-evals-2': 82.65,
  's5-analytics-1': 88.0,
  's5-analytics-2': 90.75,

  's6-nine': 96.6,
  's6-range': 98.9,
  's6-one': 104.4,

  's7-faster': 107.6,
  's7-reliability': 109.2,
  's7-costs': 110.85,
  's7-confidence': 112.4,

  's8-name': 115.0,
  's8-chain': 116.5,
  's8-outcome': 117.75,
}

/** Non-speech moments shared by picture and sound */
export const MARKS = {
  firstLight: 0.5,
  networkForms: 1.5,
  slowDown: 9.5,
  headline: 12.0,
  question: 14.0,
  pushIn: 15.5,
  promptCard: 16.2,
  complexity: 23.5,
  q1: 25.0,
  q2: 26.2,
  q3: 27.4,
  challenge1: 29.3,
  challenge2: 31.2,
  challenge3: 32.7,
  challenge4: 34.3,
  fragment: 36.5,
  silence: 40.8,
  cannotSee: 41.0,
  ignite: 42.5,
  logo: 43.5,
  structure: 50.1,
  observe: 53.5,
  evaluate: 54.5,
  govern: 55.5,
  refraction: 56.5,
  groove: 57.0,
  wheel: 96.0,
  group1: 98.9,
  group2: 100.4,
  group3: 101.6,
  wheelComplete: 104.4,
  organised: 107.0,
  converge: 114.0,
  resolve: 115.0,
  tagline: 116.5,
  end: 120.0,
}
