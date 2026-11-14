/**
 * The director: the complete state of the 3D world at time t (seconds).
 * Pure and deterministic — scenes 01–04 and 07–08 all read from here, which is
 * what keeps the network, the recurring request and the prism continuous
 * across cuts.
 */
import * as THREE from 'three'
import timeline from '../data/timeline.json'
import { hash } from '../lib/random'
import { BANDS, color } from '../theme'
import { poseAt, type Pose } from './camera'
import type { Segment } from './EdgeBatch'
import type { GlowPoint } from './GlowPoints'
import {
  CHAIN_LABELS,
  CHAIN_PATH,
  CHAIN_POS,
  FIRST_LIGHT,
  INPUT_LABELS,
  INPUT_START_X,
  INPUT_X,
  INPUT_Y,
  JUNCTION,
  LANE_X,
  NETWORK,
  PRISM,
  along,
  capabilityLanePath,
  inputLanePath,
  polyline,
  type NetNode,
  type NodeType,
  type Polyline,
} from './network'
import type { NodeInstance } from './nodes'

/* ----------------------------------------------------------------- time */

type MarkName = keyof typeof timeline.marks
const mk = (name: MarkName) => timeline.marks[name].t
const ln = (id: string) => timeline.lines.find((l) => l.id === id)!

export const T = {
  firstLight: mk('firstLight'),
  forms: mk('networkForms'),
  question: mk('question'),
  models: ln('s1-models').start,
  agents: ln('s1-agents').start,
  decisions: ln('s1-decisions').start,
  request: ln('s2-chain').start,
  together: ln('s2-together').start,
  complexity: mk('complexity'),
  c1: mk('challenge1'),
  c2: mk('challenge2'),
  c3: mk('challenge3'),
  c4: mk('challenge4'),
  fragment: mk('fragment'),
  silence: mk('silence'),
  ignite: mk('ignite'),
  structure: mk('structure'),
  observe: mk('observe'),
  refraction: mk('refraction'),
  organised: mk('organised'),
  value: ln('s7-faster').start,
  converge: mk('converge'),
  resolve: mk('resolve'),
}
/** When the request finishes travelling the chain */
const REQUEST_END = T.request + 3.4
const EMERGE = T.ignite + 5.1

/* --------------------------------------------------------------- easing */

const c01 = (x: number) => Math.min(1, Math.max(0, x))
const rampT = (t: number, a: number, d: number) => c01((t - a) / d)
const easeOut = (x: number) => 1 - Math.pow(1 - c01(x), 3)
const easeIn = (x: number) => Math.pow(c01(x), 2.2)
const easeInOut = (x: number) => {
  x = c01(x)
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}
const smooth = (t: number, a: number, d: number) => easeInOut(rampT(t, a, d))
const backOut = (x: number) => {
  x = c01(x)
  const c1 = 1.5
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}
const bell = (t: number, at: number, w: number) => {
  const d = Math.abs(t - at) / (w / 2)
  return d >= 1 ? 0 : 0.5 + 0.5 * Math.cos(d * Math.PI)
}
const between = (t: number, a: number, b: number) => t >= a && t < b

/* --------------------------------------------------------------- colour */

const C = {
  model: new THREE.Color(BANDS[2]),
  agent: new THREE.Color(BANDS[0]),
  tool: new THREE.Color(BANDS[5]),
  data: new THREE.Color(BANDS[7]),
  minor: new THREE.Color('#8f99b0'),
  white: new THREE.Color('#eef0f5'),
  edge: new THREE.Color('#8ea3cc'),
  accent: new THREE.Color(color.accent),
  warn: new THREE.Color('#f5a524'),
  error: new THREE.Color('#ff5a5f'),
  band: BANDS.map((b) => new THREE.Color(b)),
}
const typeColor = (t: NodeType) => C[t]
const INPUT_TYPES: NodeType[] = ['model', 'agent', 'minor', 'tool', 'data']

/* -------------------------------------------------------- precomputation */

const nodes = NETWORK.nodes
const cloudEdges = NETWORK.edges
const extraEdges = NETWORK.extra
const chainPL = polyline(CHAIN_PATH)
const capLanes = Array.from({ length: 9 }, (_, i) => polyline(capabilityLanePath(i)))
const inLanes = Array.from({ length: 5 }, (_, k) => polyline(inputLanePath(k)))

/** Cloud position, including idle drift and fragmentation */
function cloudPos(n: NetNode, t: number, out = new THREE.Vector3()) {
  out.copy(n.cloud)
  const s = n.seed * 40
  out.x += Math.sin(t * 0.33 + s) * 0.07
  out.y += Math.cos(t * 0.27 + s * 1.3) * 0.07
  out.z += Math.sin(t * 0.21 + s * 0.7) * 0.05
  const fr = easeOut(rampT(Math.min(t, T.silence), T.fragment, 4.2))
  if (fr > 0) out.addScaledVector(n.drift, fr * (0.9 + n.seed * 2.4))
  return out
}

/** Absorption into the prism (scene 04): each node streams into the beam */
const absorb = (() => {
  const freeze = T.silence
  const order = nodes
    .map((n) => ({ n, d: cloudPos(n, freeze).distanceTo(JUNCTION) }))
    .sort((a, b) => a.d - b.d)
  const map = new Map<number, { start: number; dur: number; curve: THREE.CubicBezierCurve3 }>()
  order.forEach(({ n, d }, rank) => {
    const p0 = cloudPos(n, freeze)
    const toward = JUNCTION.clone().sub(p0)
    const c1 = p0.clone().addScaledVector(toward, 0.35).add(new THREE.Vector3(0, (n.seed - 0.5) * 3, 0))
    const c2 = JUNCTION.clone().add(new THREE.Vector3(-4.5 - n.seed * 3, (n.seed - 0.5) * 1.2, 0))
    map.set(n.id, {
      start: T.ignite + 0.3 + (rank / order.length) * 2.7,
      dur: 1.0 + Math.min(1, d / 30) * 0.8,
      curve: new THREE.CubicBezierCurve3(p0, c1, c2, JUNCTION.clone()),
    })
  })
  return map
})()

function absorbPoint(n: NetNode, u: number, out = new THREE.Vector3()) {
  const a = absorb.get(n.id)!
  if (u < 0.88) return out.copy(a.curve.getPoint(u / 0.88))
  return out.copy(JUNCTION).lerp(PRISM.entry, (u - 0.88) / 0.12)
}

/** Emergence along an organised lane (capability lanes leave the prism; inputs enter from the left) */
const emerge = (() => {
  const map = new Map<number, { start: number; dur: number; path: Polyline }>()
  for (const n of nodes) {
    if (!n.org) continue
    if (n.lane >= 5) {
      const i = n.lane - 5
      const slot = LANE_X.indexOf(n.org.x)
      const base = capLanes[i]
      // the lane path truncated at the node's slot
      const pts: THREE.Vector3[] = []
      for (const p of base.pts) {
        if (p.x < n.org.x) pts.push(p)
        else break
      }
      pts.push(n.org.clone())
      const order = LANE_X.length - 1 - slot
      map.set(n.id, { start: EMERGE + order * 0.24 + i * 0.035, dur: 0.85 + slot * 0.12, path: polyline(pts) })
    } else {
      const k = n.lane
      const slot = INPUT_X.indexOf(n.org.x)
      const order = INPUT_X.length - 1 - slot
      const pts = [new THREE.Vector3(INPUT_START_X, INPUT_Y[k], 0), n.org.clone()]
      map.set(n.id, { start: EMERGE + 0.7 + order * 0.2 + k * 0.05, dur: 1.15, path: polyline(pts) })
    }
  }
  return map
})()

/* ---------------------------------------------------------------- state */

export type PrismState = {
  edges: number
  glass: number
  inner: number
  spectrum: number
  rotY: number
  flare: number
}

export type WorldState = {
  t: number
  pose: Pose
  nodes: Record<NodeType, NodeInstance[]>
  segments: Segment[]
  glows: GlowPoint[]
  prism: PrismState
}

const V = () => new THREE.Vector3()

/** Phase of the S2 request along the chain (0–1) */
export function requestProgress(t: number) {
  return easeInOut(rampT(t, T.request + 0.15, REQUEST_END - T.request - 0.15))
}

/** Is the world on screen at time t? (scenes 05–06 are pure interface) */
export function worldVisible(t: number) {
  return t < 58.2 || t > 106.35
}

export function worldAt(t: number): WorldState {
  const pose = poseAt(t)
  const cam = pose.position
  const tn = between(t, T.silence, T.ignite) ? T.silence : t // the freeze
  const organisedPhase = t >= T.ignite

  const out: Record<NodeType, NodeInstance[]> = { model: [], agent: [], tool: [], data: [], minor: [] }
  const segments: Segment[] = []
  const glows: GlowPoint[] = []
  const nodePos = new Map<number, THREE.Vector3>()
  const nodeVis = new Map<number, number>()

  // dim with distance, and fade anything that comes too close to the lens
  const depthFade = (p: THREE.Vector3) => {
    const d = p.distanceTo(cam)
    return (0.25 + 0.75 * (1 - c01((d - 18) / 34))) * c01((d - 3.5) / 7)
  }

  /* ---------------- nodes */
  const reqP = requestProgress(t)
  for (const n of nodes) {
    let p = V()
    let scale = 0
    let glow = 0.22
    let col = typeColor(n.type).clone()
    let spin = n.seed * 6 + t * (0.15 + n.seed * 0.25)

    if (!organisedPhase || t < T.ignite + 0.3) {
      // ---- the cloud (01–03)
      cloudPos(n, tn, p)
      const appear = rampT(tn, T.forms + n.delay, 0.65)
      scale = n.size * backOut(appear)
      // 01: highlights follow the narration
      if (n.type === 'model') glow += 0.9 * bell(t, T.models + 0.55, 1.6)
      if (n.type === 'agent') glow += 0.9 * bell(t, T.agents + 0.55, 1.6)
      glow += 0.35 * bell(t, T.decisions + 0.8, 2.0) * (hash(n.id) > 0.5 ? 1 : 0)
      // 02: the request lights each chain node as it passes
      if (n.chain >= 0) {
        const at = n.chain / 6
        const lit = c01((reqP - at) * 8 + 1) * (t > T.request ? 1 : 0)
        glow += 0.55 * lit + 1.1 * bell(reqP, at, 0.16) * (between(t, T.request, REQUEST_END + 0.5) ? 1 : 0)
        // "Models, agents, tools and data"
        const word = [-1, 0, 0.62, 1.2, 1.85, -1, -1][n.chain]
        if (word >= 0) glow += 1.0 * bell(t, T.together + word + 0.25, 0.9)
        scale *= 1 + 0.25 * c01((t - T.request) / 0.6)
        // 03: problems on the same workflow
        if (n.chain === 6) {
          const w = bell(t, T.c1 + 0.9, 2.2)
          glow += 1.3 * w
          col.lerp(C.warn, w)
        }
        if (n.chain === 3) {
          const w = bell(t, T.c2 + 0.75, 1.9) * (0.75 + 0.25 * Math.sin(t * 22))
          glow += 1.6 * w
          col.lerp(C.error, c01(w * 1.4))
        }
        if (n.chain === 1) glow += 1.2 * bell(t, T.c3 + 0.75, 1.9)
        if (between(t, T.complexity, T.c1)) glow *= 1 - 0.45 * smooth(t, T.complexity, 1.2)
      } else if (between(t, T.request - 0.4, T.c4 + 2)) {
        glow *= 0.7 // let the chain lead
      }
      // fragmentation: the network loses its light
      glow *= 1 - 0.6 * easeOut(rampT(tn, T.fragment, 3.5))
      if (organisedPhase) glow += 0.6 * bell(t, T.ignite, 0.6)
    } else {
      // ---- after the prism ignites (04, 07, 08)
      const a = absorb.get(n.id)!
      const e = emerge.get(n.id)
      const u = rampT(t, a.start, a.dur)
      if (t < a.start + a.dur) {
        if (u <= 0) cloudPos(n, T.silence, p)
        else absorbPoint(n, easeIn(u), p)
        scale = n.size * (1 - 0.55 * easeIn(u)) * (u >= 1 ? 0 : 1)
        glow = 0.25 + 1.2 * easeIn(u)
        col.lerp(C.white, easeIn(u) * 0.6)
        // the stream it leaves behind (faded near the lens so it never streaks across the titles)
        if (u > 0) {
          const steps = 7
          for (let s = 0; s < steps; s++) {
            const u0 = easeIn(Math.max(0, u - 0.2 * ((s + 1) / steps)))
            const u1 = easeIn(Math.max(0, u - 0.2 * (s / steps)))
            const k = 1 - s / steps
            const a = absorbPoint(n, u0, V())
            const b = absorbPoint(n, u1, V())
            const near = c01((Math.min(a.distanceTo(cam), b.distanceTo(cam)) - 6) / 8)
            // streams carry the ignition; they clear once the title is on screen
            const clear = 1 - smooth(t, T.ignite + 2.6, 1.4)
            segments.push({
              a,
              b,
              color: col.clone().lerp(C.white, 0.4),
              intensity: 0.4 * k * (0.4 + 0.6 * u) * near * clear,
              width: 0.03,
            })
          }
        }
      } else if (e && t >= e.start) {
        const v = rampT(t, e.start, e.dur)
        along(e.path, easeOut(v), p)
        scale = n.size * 0.82 * Math.min(1, 0.4 + v)
        glow = 0.35 + 0.9 * (1 - v)
        col = n.lane >= 5 ? C.band[n.lane - 5].clone() : typeColor(INPUT_TYPES[n.lane]).clone()
        // gentle life once settled
        if (v >= 1) {
          const s = n.seed * 30
          p.y += Math.sin(t * 0.8 + s) * 0.025
        }
        // 08: lanes converge back into the prism
        if (t > T.converge) {
          const back = easeIn(rampT(t, T.converge + (n.lane >= 5 ? (5 - LANE_X.indexOf(n.org!.x)) * 0.07 : 0), 1.25))
          if (n.lane >= 5) {
            along(e.path, 1 - back, p)
          } else {
            p.lerp(JUNCTION, back)
          }
          scale *= 1 - back
          glow += 1.2 * back
        }
      } else {
        scale = 0
      }
      spin = n.seed * 6 + t * 0.12
    }

    if (scale > 0.002) {
      nodePos.set(n.id, p)
      nodeVis.set(n.id, c01(scale / (n.size * 0.6)))
      out[n.type].push({ p, scale, color: col, glow, spin })
      // halo
      const halo = (0.08 + glow * 0.22) * depthFade(p)
      glows.push({ p, color: col, intensity: halo, size: n.size * 4.2 })
    } else {
      nodePos.set(n.id, p)
      nodeVis.set(n.id, 0)
    }
  }

  /* ---------------- connections in the cloud (01–04) */
  if (t < T.ignite + 2.2) {
    const fadeOutForPrism = 1 - smooth(t, T.ignite, 1.6)
    const fragAmount = easeOut(rampT(tn, T.fragment, 3.2))
    const focusDim = between(t, T.request - 0.5, T.c4 + 2.2) ? 0.55 : 1
    const drawEdge = (
      a: THREE.Vector3,
      b: THREE.Vector3,
      progress: number,
      h: number,
      baseI: number,
      col: THREE.Color,
      width: number,
    ) => {
      if (progress <= 0) return
      let s0 = 0
      let s1 = progress
      if (fragAmount > 0) {
        const f = fragAmount * (0.75 + 0.25 * hash(h + 3))
        const k = 1 - f * 0.84
        const c = 0.5 + (hash(h + 7) - 0.5) * 0.6 * f
        s0 = Math.max(0, c - k / 2)
        s1 = Math.min(progress, c + k / 2)
        if (hash(h + 11) < 0.38) baseI *= 1 - fragAmount
        baseI *= 1 - 0.45 * fragAmount
      }
      if (s1 <= s0) return
      const pa = a.clone().lerp(b, s0)
      const pb = a.clone().lerp(b, s1)
      const mid = pa.clone().add(pb).multiplyScalar(0.5)
      segments.push({ a: pa, b: pb, color: col, intensity: baseI * depthFade(mid) * fadeOutForPrism, width })
    }

    cloudEdges.forEach((e, i) => {
      const a = nodePos.get(e.a)!
      const b = nodePos.get(e.b)!
      const vis = Math.min(nodeVis.get(e.a)!, nodeVis.get(e.b)!)
      if (vis <= 0 && !organisedPhase) return
      const progress = easeOut(rampT(tn, T.forms + e.delay, 0.7))
      const isChain = e.kind === 'chain'
      // quiet by default: the network is context, not the subject
      let I = isChain ? 0.26 : 0.11
      const col = isChain ? C.accent : C.edge
      if (!isChain) I *= focusDim
      // 01: decisions accelerating — the whole network brightens
      I *= 1 + 0.6 * bell(t, T.decisions + 1.0, 2.6)
      drawEdge(a, b, progress, i * 13.1, I, col, isChain ? 0.03 : 0.02)
    })

    // 02: complexity grows around the request
    extraEdges.forEach((e, i) => {
      const a = nodePos.get(e.a)!
      const b = nodePos.get(e.b)!
      const progress = easeOut(rampT(tn, T.complexity + e.delay, 0.5))
      const col = i % 3 === 0 ? C.agent : i % 3 === 1 ? C.accent : C.tool
      drawEdge(a, b, progress, 500 + i * 7.7, 0.3, col, 0.024)
    })
  }

  /* ---------------- the request trail (02) and the broken audit trail (03) */
  if (between(t, T.request, T.fragment + 1)) {
    const head = reqP
    const fade = 1 - 0.75 * smooth(t, T.complexity, 1.6)
    const N = 60
    for (let s = 0; s < N; s++) {
      const u0 = (s / N) * head
      const u1 = ((s + 1) / N) * head
      const nearHead = 1 - (head - u1) / Math.max(0.0001, head)
      const I = (0.35 + 0.9 * Math.pow(nearHead, 3)) * fade
      segments.push({ a: along(chainPL, u0), b: along(chainPL, u1), color: C.white, intensity: I, width: 0.045 })
    }
    // 03 — governance gaps: the trail returns with pieces missing
    const g = smooth(t, T.c4, 0.5) * (1 - smooth(t, T.fragment, 0.8))
    if (g > 0) {
      const M = 42
      for (let s = 0; s < M; s++) {
        const missing = (s >= 9 && s <= 13) || (s >= 22 && s <= 25) || (s >= 31 && s <= 35) || s % 3 === 2
        if (missing) continue
        segments.push({
          a: along(chainPL, s / M),
          b: along(chainPL, (s + 0.7) / M),
          color: C.white,
          intensity: 0.75 * g,
          width: 0.05,
        })
      }
    }
  }

  /* ---------------- pulses travelling the cloud (01–03) */
  if (t < T.ignite) {
    const fast = smooth(t, T.decisions, 1.2)
    const quiet = 1 - easeOut(rampT(tn, T.fragment, 2.2))
    cloudEdges.forEach((e, i) => {
      const h = hash(i * 3.3 + 1)
      const share = 0.32 + 0.4 * fast
      if (h > share) return
      const formed = rampT(tn, T.forms + e.delay + 0.7, 0.3)
      if (formed <= 0) return
      const a = nodePos.get(e.a)!
      const b = nodePos.get(e.b)!
      const len = a.distanceTo(b)
      const speed = 3.2 + 4.5 * fast
      const period = 3.5 + hash(i + 9) * 5 - 1.6 * fast
      const travel = len / speed
      const local = (tn + hash(i + 2) * period) % period
      if (local > travel) return
      const u = local / travel
      const dirA = hash(i + 5) > 0.5
      const p = dirA ? a.clone().lerp(b, u) : b.clone().lerp(a, u)
      glows.push({ p, color: C.white.clone().lerp(C.accent, 0.4), intensity: 0.62 * quiet * depthFade(p) * formed, size: 0.32 })
    })
  }

  // 02: the request itself
  if (between(t, T.request, REQUEST_END + 0.45)) {
    const p = along(chainPL, reqP)
    const I = 2.2 * (1 - smooth(t, REQUEST_END, 0.45))
    glows.push({ p, color: C.white, intensity: I, size: 0.75 })
    glows.push({ p: p.clone(), color: C.accent, intensity: I * 0.6, size: 2.2 })
  }
  // 02: complexity — many fast pulses on new paths
  if (between(t, T.complexity, T.fragment + 1.5)) {
    const busy = smooth(t, T.complexity, 1.0) * (1 - easeOut(rampT(tn, T.fragment, 1.5)))
    extraEdges.forEach((e, i) => {
      const a = nodePos.get(e.a)!
      const b = nodePos.get(e.b)!
      const period = 1.1 + hash(i + 31) * 1.4
      const local = (tn + hash(i + 17) * period) % period
      const u = local / period
      const p = hash(i + 4) > 0.5 ? a.clone().lerp(b, u) : b.clone().lerp(a, u)
      glows.push({ p, color: i % 2 ? C.agent : C.accent, intensity: 0.9 * busy, size: 0.26 })
    })
  }
  // 03: problem signals along the same workflow
  if (between(t, T.c1, T.c4)) {
    const chainEdge = (k: number) => [CHAIN_POS[k], CHAIN_POS[k + 1]] as const
    const signal = (k: number, u: number, colr: THREE.Color, I: number, reverse = false) => {
      const [a, b] = chainEdge(k)
      const p = reverse ? b.clone().lerp(a, u) : a.clone().lerp(b, u)
      glows.push({ p, color: colr, intensity: I, size: 0.42 })
    }
    // 1 · unreliable output arriving at the response
    for (let j = 0; j < 3; j++) {
      const u = rampT(t, T.c1 + j * 0.45, 0.9)
      if (u > 0 && u < 1) signal(5, u, C.warn, 1.4)
    }
    // 2 · an error that echoes back through the chain — its source unclear
    for (let k = 2; k >= 0; k--) {
      const u = rampT(t, T.c2 + 0.35 + (2 - k) * 0.35, 0.6)
      if (u > 0 && u < 1) signal(k, u, C.error, 1.6, true)
      const u2 = rampT(t, T.c2 + 0.5 + (2 - k) * 0.3, 0.6)
      if (u2 > 0 && u2 < 1) signal(k + 3 > 5 ? 5 : k + 3, u2, C.error, 1.2)
    }
    // 3 · token traffic piling into the model
    for (let j = 0; j < 14; j++) {
      const u = rampT(t, T.c3 + j * 0.1, 0.55)
      if (u > 0 && u < 1) signal(0, u, C.accent, 1.1)
    }
  }

  /* ---------------- first light (01) */
  if (t < 6) {
    const I = 1.6 * easeOut(rampT(t, T.firstLight - 0.3, 0.6)) * (0.8 + 0.2 * Math.sin(t * 6)) * (1 - smooth(t, 2.4, 2.8))
    glows.push({ p: FIRST_LIGHT.clone(), color: C.white, intensity: I, size: 0.9 })
    glows.push({ p: FIRST_LIGHT.clone(), color: C.accent, intensity: I * 0.45, size: 4.0 })
  }

  /* ---------------- prism, beams and lanes (04, 07, 08) */
  const prism: PrismState = { edges: 0, glass: 0, inner: 0, spectrum: 0, rotY: 0, flare: 0 }
  if (t < T.ignite) {
    const fr = easeOut(rampT(tn, T.fragment, 3.5))
    // a background presence: found in the opening, half-lost behind the chain, lost in the chaos
    const presence = smooth(t, 5.5, 4.0) * (1 - 0.7 * smooth(t, T.question + 1.2, 1.6)) * (1 - 0.6 * fr)
    prism.edges = 0.3 * presence + 0.35 * bell(t, T.question + 0.2, 1.6)
    prism.glass = 0.45 * presence
    prism.inner = 0.05 * presence + 0.1 * bell(t, T.question + 0.2, 1.6)
    prism.rotY = Math.sin(t * 0.08) * 0.22 + 0.1
  } else {
    const ig = easeOut(rampT(t, T.ignite, 0.45))
    prism.edges = 0.2 + 0.8 * ig
    prism.glass = 0.4 + 0.6 * ig
    prism.inner = 0.3 * ig + 0.8 * bell(t, T.ignite + 0.35, 1.4) + 0.3 * bell(t, T.refraction + 0.6, 1.4)
    prism.spectrum = smooth(t, T.ignite + 2.6, 1.6)
    prism.rotY = (Math.sin(T.ignite * 0.08) * 0.22 + 0.1) * (1 - smooth(t, T.ignite, 1.2))
    prism.flare = bell(t, T.ignite + 0.25, 1.1) + 0.35 * bell(t, T.refraction + 0.6, 1.2)
    if (t > T.converge) {
      // the hand-off to the logo happens inside a brief bloom
      prism.inner += 1.0 * bell(t, T.resolve + 0.25, 0.8)
      prism.flare += 2.0 * bell(t, T.resolve + 0.32, 1.0)
      const gone = smooth(t, T.resolve + 0.12, 0.32)
      prism.edges *= 1 - gone
      prism.glass *= 1 - gone
      prism.inner *= 1 - gone
      prism.spectrum *= 1 - gone
    }

    const beamIn = smooth(t, T.ignite + 0.9, 1.2) * (1 - smooth(t, T.resolve + 0.4, 0.8))
    // single stream from the left before the input lanes form
    const pre = beamIn * (1 - smooth(t, EMERGE + 0.6, 1.4))
    if (pre > 0) {
      segments.push({ a: new THREE.Vector3(INPUT_START_X, JUNCTION.y, 0), b: JUNCTION.clone(), color: C.white, intensity: 0.45 * pre, width: 0.04 })
    }
    // the merged beam into the prism
    if (beamIn > 0) {
      segments.push({ a: JUNCTION.clone(), b: PRISM.entry.clone(), color: C.white, intensity: 1.15 * beamIn, width: 0.06 })
      segments.push({ a: JUNCTION.clone(), b: PRISM.entry.clone(), color: C.accent, intensity: 0.16 * beamIn, width: 0.42 })
    }
    // dispersion inside the prism
    if (prism.spectrum > 0) {
      PRISM.exits.forEach((x, i) => {
        segments.push({ a: PRISM.entry.clone(), b: x.clone(), color: C.band[i], intensity: 0.75 * prism.spectrum, width: 0.014 })
      })
    }
    // nine capability lanes
    const laneDraw = (i: number) => {
      const start = T.ignite + 2.7 + i * 0.05
      let d = easeOut(rampT(t, start, 2.2))
      if (t > T.converge) d *= 1 - easeIn(rampT(t, T.converge + 0.1, 1.3))
      return d
    }
    capLanes.forEach((pl, i) => {
      const d = laneDraw(i)
      if (d <= 0) return
      const steps = pl.pts.length - 1
      for (let s = 0; s < steps; s++) {
        const u0 = pl.cum[s] / pl.length
        const u1 = pl.cum[s + 1] / pl.length
        if (u0 >= d) break
        const a = pl.pts[s].clone()
        const b = u1 <= d ? pl.pts[s + 1].clone() : along(pl, d)
        segments.push({ a, b, color: C.band[i], intensity: 0.85, width: 0.026 })
        segments.push({ a: a.clone(), b: b.clone(), color: C.band[i], intensity: 0.1, width: 0.2 })
      }
    })
    // five input lanes
    inLanes.forEach((pl, k) => {
      let d = easeOut(rampT(t, EMERGE + 0.5 + k * 0.08, 1.7))
      if (t > T.converge) d *= 1 - easeIn(rampT(t, T.converge + 0.1, 1.3))
      if (d <= 0) return
      const col = typeColor(INPUT_TYPES[k]).clone().lerp(C.white, 0.35)
      const steps = pl.pts.length - 1
      for (let s = 0; s < steps; s++) {
        const u0 = pl.cum[s] / pl.length
        const u1 = pl.cum[s + 1] / pl.length
        if (u0 >= d) break
        const a = pl.pts[s].clone()
        const b = u1 <= d ? pl.pts[s + 1].clone() : along(pl, d)
        segments.push({ a, b, color: col, intensity: 0.5, width: 0.02 })
      }
    })

    // the governed rhythm: synchronised waves on the beat once structured
    const waves = smooth(t, EMERGE + 2.4, 1.0) * (1 - smooth(t, T.converge, 0.4))
    if (waves > 0) {
      const beat = 1.0
      for (let w = 0; w < 3; w++) {
        const local = ((t - EMERGE) % beat) / beat
        const phase = (local + w) / 3
        capLanes.forEach((pl, i) => {
          const u = (phase + 0.0) % 1
          const p = along(pl, u)
          glows.push({ p, color: C.band[i], intensity: 1.1 * waves * Math.sin(Math.PI * u), size: 0.34 })
        })
        inLanes.forEach((pl) => {
          const u = (phase + 0.5) % 1
          const p = along(pl, u)
          glows.push({ p, color: C.white, intensity: 0.7 * waves * Math.sin(Math.PI * u), size: 0.26 })
        })
      }
    }
    // 08: converging wave — every band flows back into the prism together
    if (between(t, T.converge, T.resolve + 1.2)) {
      const u = easeIn(rampT(t, T.converge + 0.05, 1.05))
      capLanes.forEach((pl, i) => {
        const p = along(pl, 1 - u)
        glows.push({ p, color: C.band[i], intensity: 1.6 * (1 - u * 0.3) * (u < 1 ? 1 : 0), size: 0.5 })
      })
      // one unified flow leaves the prism
      const out = easeOut(rampT(t, T.resolve - 0.1, 1.2))
      if (out > 0 && out < 1) {
        const exitStart = PRISM.onRightFace(0.48)
        const exitEnd = exitStart.clone().add(new THREE.Vector3(14, 0.1, 0))
        segments.push({ a: exitStart, b: exitStart.clone().lerp(exitEnd, out), color: C.white, intensity: 1.2 * (1 - out), width: 0.07 })
      }
    }
    // the ignition and the light inside the prism
    const centre = new THREE.Vector3(0, 0.3, 0)
    glows.push({ p: centre, color: C.accent.clone().lerp(C.white, 0.5), intensity: 0.5 * prism.flare, size: 6.5 })
    glows.push({ p: PRISM.entry.clone(), color: C.white, intensity: 1.1 * beamIn, size: 0.7 })
    // where the spectrum leaves the glass
    if (prism.spectrum > 0) {
      PRISM.exits.forEach((x, i) => {
        if (i % 2) return
        glows.push({ p: x.clone(), color: C.band[i], intensity: 0.5 * prism.spectrum, size: 0.5 })
      })
    }
  }

  return { t, pose, nodes: out, segments, glows, prism }
}

/* ---------------------------------------------------------------- labels */

export type WorldLabel = { id: string; text: string; p: THREE.Vector3; opacity: number; kind: 'chain' | 'input' | 'lane' }

export function labelsAt(t: number): WorldLabel[] {
  const labels: WorldLabel[] = []
  const reqP = requestProgress(t)
  // 02 — the request chain, named as the request reaches each node
  if (between(t, T.request - 0.5, T.c1 + 0.6)) {
    CHAIN_LABELS.forEach((text, i) => {
      const reached = t > T.request ? c01((reqP - i / 6) * 10 + 1) : 0
      const out = 1 - smooth(t, T.complexity + 0.6, 1.4)
      const o = reached * out
      if (o <= 0.01) return
      labels.push({ id: `chain-${i}`, text, p: CHAIN_POS[i].clone(), opacity: o, kind: 'chain' })
    })
  }
  // 04 / 07 — the five inputs, as on the website's hero diagram
  if (t > EMERGE + 0.9 && worldVisible(t)) {
    INPUT_LABELS.forEach((text, k) => {
      const o = smooth(t, EMERGE + 1.0 + k * 0.08, 0.8) * (1 - smooth(t, T.converge, 0.8))
      if (o <= 0.01) return
      labels.push({ id: `input-${k}`, text, p: new THREE.Vector3(-8.25, INPUT_Y[k] + 0.3, 0), opacity: o, kind: 'input' })
    })
  }
  return labels
}
