/**
 * The AI ecosystem as data. Everything is generated from a fixed seed, so the
 * network is identical in every scene preview and every render.
 *
 * Three arrangements of the same nodes:
 *  - cloud      the sprawling ecosystem of models, agents, tools and data (01–03)
 *  - chain      seven nodes inside the cloud carry the recurring user request (02–03)
 *  - organised  the same nodes after the prism: five input lanes on the left,
 *               nine capability lanes on the right — the website's hero diagram,
 *               built in 3D (04, 07, 08)
 */
import * as THREE from 'three'
import { rng } from '../lib/random'

export type NodeType = 'model' | 'agent' | 'tool' | 'data' | 'minor'

export type NetNode = {
  id: number
  type: NodeType
  cloud: THREE.Vector3
  /** Organised position; null when the node retires as the network is structured */
  org: THREE.Vector3 | null
  /** 0–4 input lanes, 5–13 capability lanes (band = lane − 5), −1 none */
  lane: number
  /** Seconds after the first light at which the node forms */
  delay: number
  size: number
  /** Index in the request chain, or −1 */
  chain: number
  seed: number
  /** Unit drift direction used when the network fragments */
  drift: THREE.Vector3
}

export type NetEdge = { a: number; b: number; delay: number; kind: 'cloud' | 'chain' | 'extra' }

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

/* ------------------------------------------------------------------ prism */

/** Equilateral prism, apex up, centroid at the origin, long axis along z */
export const PRISM = (() => {
  const side = 2.6
  const h = (side * Math.sqrt(3)) / 2
  const apex = V(0, (h * 2) / 3, 0)
  const left = V(-side / 2, -h / 3, 0)
  const right = V(side / 2, -h / 3, 0)
  const depth = 2.0
  const onLeftFace = (t: number) => apex.clone().lerp(left, t)
  const onRightFace = (t: number) => apex.clone().lerp(right, t)
  const entry = onLeftFace(0.47)
  const exits = Array.from({ length: 9 }, (_, i) => onRightFace(0.38 + i * 0.022))
  return { side, h, apex, left, right, depth, entry, exits, onLeftFace, onRightFace }
})()

/* ---------------------------------------------------------------- lanes */

export const INPUT_LABELS = ['LLMs', 'Agents', 'Prompts', 'Tools', 'Data'] as const
const INPUT_TYPES: NodeType[] = ['model', 'agent', 'minor', 'tool', 'data']

const BEAM_Y = PRISM.entry.y
/** Junction where the five inputs merge into one beam */
export const JUNCTION = V(-3.6, BEAM_Y, 0)
export const INPUT_Y = [1.8, 0.9, 0, -0.9, -1.8].map((d) => BEAM_Y + d)
export const INPUT_X = [-13.2, -11.2, -9.2, -7.2]
export const INPUT_START_X = -17

export const LANE_Y = Array.from({ length: 9 }, (_, i) => BEAM_Y + 2.4 - i * 0.6)
export const LANE_FAN_X = 3.8
export const LANE_X = [5.2, 6.9, 8.6, 10.3, 12.0, 13.7]
export const LANE_END_X = 17

/** Polyline for input lane k: from the far left, curving into the junction */
export function inputLanePath(k: number, segments = 30): THREE.Vector3[] {
  const y = INPUT_Y[k]
  const pts: THREE.Vector3[] = [V(INPUT_START_X, y, 0), V(-6.4, y, 0)]
  const p0 = V(-6.4, y, 0)
  const c1 = V(-5.0, y, 0)
  const c2 = V(-4.8, BEAM_Y, 0)
  const curve = new THREE.CubicBezierCurve3(p0, c1, c2, JUNCTION.clone())
  for (let i = 1; i <= segments; i++) pts.push(curve.getPoint(i / segments))
  return pts
}

/** Polyline for capability lane i: from its exit on the prism face, fanning out then running right */
export function capabilityLanePath(i: number, segments = 28): THREE.Vector3[] {
  const e = PRISM.exits[i]
  const y = LANE_Y[i]
  const curve = new THREE.CubicBezierCurve3(e.clone(), V(e.x + 1.2, e.y, 0), V(LANE_FAN_X - 1.0, y, 0), V(LANE_FAN_X, y, 0))
  const pts: THREE.Vector3[] = []
  for (let k = 0; k <= segments; k++) pts.push(curve.getPoint(k / segments))
  pts.push(V(LANE_END_X, y, 0))
  return pts
}

/* -------------------------------------------------------------- the chain */

/** User prompt → AI model → Agent → Tool → Knowledge source → Decision → Response */
export const CHAIN_LABELS = ['User prompt', 'AI model', 'Agent', 'Tool', 'Knowledge source', 'Decision', 'Response'] as const
const CHAIN_TYPES: NodeType[] = ['minor', 'model', 'agent', 'tool', 'data', 'agent', 'minor']
export const CHAIN_Z = 12
export const CHAIN_POS = [-6.3, -4.2, -2.1, 0, 2.1, 4.2, 6.3].map((x, i) =>
  V(x, 0.3 + [-0.55, 0.75, -0.35, 0.85, -0.6, 0.65, -0.2][i], CHAIN_Z + [0.4, -0.5, 0.3, -0.6, 0.2, -0.4, 0.5][i]),
)

/** First point of light, where the network starts forming */
export const FIRST_LIGHT = V(0, 0.1, 21)

/* -------------------------------------------------------------- generate */

function build() {
  const r = rng(20261113)
  const nodes: NetNode[] = []
  const typeRoll = (): NodeType => {
    const x = r()
    return x < 0.22 ? 'model' : x < 0.4 ? 'agent' : x < 0.58 ? 'tool' : x < 0.76 ? 'data' : 'minor'
  }
  const sizeOf = (t: NodeType) => (t === 'minor' ? 0.14 + r() * 0.08 : 0.26 + r() * 0.12)

  // Chain nodes first so their ids are stable (0–6)
  CHAIN_POS.forEach((p, i) => {
    nodes.push({
      id: i,
      type: CHAIN_TYPES[i],
      cloud: p.clone(),
      org: null,
      lane: -1,
      delay: 0,
      size: i === 0 || i === 6 ? 0.3 : 0.36,
      chain: i,
      seed: r(),
      drift: V(0, 0, 0),
    })
  })

  const blocked = (p: THREE.Vector3) => {
    if (p.length() < 4.6) return true // keep the prism partly clear
    // the S2/S3 viewing corridor in front of the chain
    if (Math.abs(p.x) < 8.8 && p.y > -3.0 && p.y < 3.4 && p.z > CHAIN_Z + 1.3 && p.z < 25) return true
    // the S1 camera path
    if (p.z > 21 && Math.hypot(p.x, p.y - 0.2) < 2.4) return true
    for (const c of CHAIN_POS) if (p.distanceTo(c) < 1.5) return true
    for (const n of nodes) if (p.distanceTo(n.cloud) < 1.15) return true
    return false
  }

  // Sample inside the frustum of the opening camera (at z ≈ 31, looking down −z)
  const CAM_Z = 31
  let guard = 0
  while (nodes.length < 132 && guard++ < 20000) {
    const d = 3 + Math.pow(r(), 0.85) * 46
    const z = CAM_Z - d
    const x = (r() * 2 - 1) * 0.66 * d
    const y = (r() * 2 - 1) * 0.38 * d
    const p = V(x, y, z)
    if (blocked(p)) continue
    const type = typeRoll()
    nodes.push({
      id: nodes.length,
      type,
      cloud: p,
      org: null,
      lane: -1,
      delay: 0,
      size: sizeOf(type),
      chain: -1,
      seed: r(),
      drift: V(0, 0, 0),
    })
  }
  // A few nodes the camera flies past in the opening
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2
    const rad = 2.8 + r() * 3.2
    const p = V(Math.cos(a) * rad, 0.2 + Math.sin(a) * rad * 0.6, 26 + r() * 15)
    const type = typeRoll()
    nodes.push({ id: nodes.length, type, cloud: p, org: null, lane: -1, delay: 0, size: sizeOf(type) * 0.8, chain: -1, seed: r(), drift: V(0, 0, 0) })
  }

  // Formation delay: a wave expanding from the first light
  const maxD = Math.max(...nodes.map((n) => n.cloud.distanceTo(FIRST_LIGHT)))
  for (const n of nodes) {
    const d = n.cloud.distanceTo(FIRST_LIGHT) / maxD
    n.delay = 0.15 + Math.pow(d, 0.75) * 7.2 + r() * 0.5
    if (n.chain >= 0) n.delay = 1.6 + n.chain * 0.12
    const out = n.cloud.clone().sub(V(0, 0, 10))
    n.drift = out.normalize().add(V(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(0.8)).normalize()
  }

  // Edges: nearest neighbours plus a few long links
  const edges: NetEdge[] = []
  const has = new Set<string>()
  const add = (a: number, b: number, kind: NetEdge['kind'], extraDelay = 0) => {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`
    if (a === b || has.has(key)) return
    has.add(key)
    edges.push({ a, b, kind, delay: Math.max(nodes[a].delay, nodes[b].delay) + 0.2 + extraDelay })
  }
  for (let i = 0; i < 6; i++) add(i, i + 1, 'chain')
  for (const n of nodes) {
    const near = nodes
      .filter((m) => m.id !== n.id)
      .map((m) => ({ m, d: m.cloud.distanceTo(n.cloud) }))
      .sort((a, b) => a.d - b.d)
    const k = n.chain >= 0 ? 2 : 2 + (r() < 0.35 ? 1 : 0)
    near.slice(0, k).forEach(({ m }) => add(n.id, m.id, 'cloud', r() * 0.3))
    if (r() < 0.08) add(n.id, near[4 + Math.floor(r() * 6)].m.id, 'cloud', 0.4)
  }

  // Complexity that appears around the request in scene 02
  const extra: NetEdge[] = []
  const skip = [
    [0, 2],
    [1, 3],
    [2, 4],
    [3, 5],
    [4, 6],
    [1, 5],
    [2, 6],
    [1, 4],
  ]
  skip.forEach(([a, b], i) => extra.push({ a, b, kind: 'extra', delay: i * 0.11 }))
  for (let c = 0; c < 7; c++) {
    const near = nodes
      .filter((m) => m.chain < 0)
      .map((m) => ({ m, d: m.cloud.distanceTo(nodes[c].cloud) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 6)
    for (let j = 0; j < 3; j++) {
      const m = near[(c * 2 + j) % near.length].m
      extra.push({ a: c, b: m.id, kind: 'extra', delay: 0.3 + r() * 1.2 })
    }
  }

  // Organised arrangement: fill input lanes by type, then capability lanes
  const free = new Set(nodes.map((n) => n.id))
  const takeNearest = (pos: THREE.Vector3, filter: (n: NetNode) => boolean) => {
    let best: NetNode | null = null
    let bd = Infinity
    for (const id of free) {
      const n = nodes[id]
      if (!filter(n)) continue
      const d = n.cloud.distanceTo(pos)
      if (d < bd) {
        bd = d
        best = n
      }
    }
    if (best) free.delete(best.id)
    return best
  }
  INPUT_Y.forEach((y, k) => {
    INPUT_X.forEach((x) => {
      const target = V(x, y, 0)
      const n = takeNearest(target, (m) => m.type === INPUT_TYPES[k] && m.chain < 0) ?? takeNearest(target, () => true)
      if (n) {
        n.org = target
        n.lane = k
      }
    })
  })
  LANE_Y.forEach((y, i) => {
    LANE_X.forEach((x) => {
      const target = V(x, y, 0)
      const n = takeNearest(target.clone().setZ(8), () => true)
      if (n) {
        n.org = target
        n.lane = 5 + i
      }
    })
  })

  return { nodes, edges, extra }
}

export const NETWORK = build()

/** Chain path as a smooth polyline through the seven request nodes */
export const CHAIN_PATH = (() => {
  const curve = new THREE.CatmullRomCurve3(CHAIN_POS.map((p) => p.clone()), false, 'centripetal', 0.5)
  return curve.getPoints(120)
})()

/* --------------------------------------------------------- polyline util */

export type Polyline = { pts: THREE.Vector3[]; cum: number[]; length: number }

export function polyline(pts: THREE.Vector3[]): Polyline {
  const cum = [0]
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]))
  return { pts, cum, length: cum[cum.length - 1] }
}

/** Point at fraction t (0–1) of a polyline's length */
export function along(pl: Polyline, t: number, out = new THREE.Vector3()) {
  const target = Math.min(1, Math.max(0, t)) * pl.length
  let i = 1
  while (i < pl.cum.length - 1 && pl.cum[i] < target) i++
  const seg = pl.cum[i] - pl.cum[i - 1] || 1
  const f = (target - pl.cum[i - 1]) / seg
  return out.copy(pl.pts[i - 1]).lerp(pl.pts[i], f)
}
