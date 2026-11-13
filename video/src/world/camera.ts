/**
 * The camera, as a pure function of time. The same function drives the WebGL
 * camera and the DOM label projection, so labels sit exactly on their nodes.
 *
 * Keys are joined with cubic Hermite curves: the camera glides through
 * intermediate keys and only comes to rest at keys marked `stop`.
 */
import * as THREE from 'three'

type Key = { t: number; pos: [number, number, number]; look: [number, number, number]; fov?: number; stop?: boolean }

const KEYS: Key[] = [
  // 01 — moving through the forming network, slowing for the question
  { t: 0, pos: [0, 0.25, 47], look: [0, 0.05, 16], fov: 34, stop: true },
  { t: 5, pos: [0.35, 0.3, 39.5], look: [0, 0.05, 12] },
  { t: 9.5, pos: [0.6, 0.38, 32.6], look: [0, 0.1, 9] },
  { t: 13, pos: [0.72, 0.42, 30.6], look: [0, 0.1, 8] },
  { t: 15.6, pos: [0.76, 0.44, 30.1], look: [0, 0.1, 8], stop: true },
  // 02 — to the request chain, tracking the request, then back to see the tangle
  { t: 17.6, pos: [-3.4, 1.05, 23.4], look: [-4.6, 0.3, 12] },
  { t: 21.0, pos: [0.0, 1.1, 23.0], look: [0.2, 0.35, 12] },
  { t: 24.2, pos: [3.0, 1.15, 23.6], look: [2.6, 0.3, 12] },
  { t: 27.6, pos: [0.4, 1.7, 26.4], look: [0.2, 0.25, 11.5] },
  { t: 29.1, pos: [0.3, 1.7, 26.6], look: [0.2, 0.25, 11.5], stop: true },
  // 03 — visiting each problem along the same workflow
  { t: 30.0, pos: [3.6, 1.15, 22.4], look: [5.4, 0.25, 12], stop: true },
  { t: 31.6, pos: [0.5, 1.3, 21.6], look: [0, 0.6, 11.4], stop: true },
  { t: 33.1, pos: [-3.0, 1.2, 22.0], look: [-4.2, 0.8, 11.5], stop: true },
  { t: 34.8, pos: [0, 2.0, 25.2], look: [0, 0.1, 11], stop: true },
  { t: 40.6, pos: [0, 2.6, 31.5], look: [0, 0.1, 8], stop: true },
  // freeze — the camera barely breathes
  { t: 42.4, pos: [0, 2.5, 30.6], look: [0, 0.2, 6], stop: true },
  // 04 — to the prism, around it, then back as the structure forms
  // framed low enough that the lock-up above never touches the apex
  { t: 45.2, pos: [-1.9, 1.55, 12.8], look: [0.1, 1.1, 0], fov: 32 },
  { t: 49.8, pos: [1.7, 1.65, 12.4], look: [0.3, 1.12, 0], fov: 32 },
  { t: 53.2, pos: [0.4, 0.75, 19.8], look: [0.9, 0.45, 0], fov: 34 },
  { t: 56.0, pos: [0.6, 0.72, 19.2], look: [1.0, 0.45, 0], fov: 34 },
  { t: 57.6, pos: [4.2, 0.6, 9.5], look: [7.0, 0.5, 0], fov: 34, stop: true },
  // 07 — the organised ecosystem
  { t: 106.6, pos: [0.9, 1.5, 22.5], look: [0.6, 0.3, 0], fov: 34, stop: true },
  { t: 114.0, pos: [-0.6, 1.05, 19.4], look: [0.4, 0.35, 0], fov: 34 },
  // 08 — to the prism, which becomes the logo
  { t: 116.4, pos: [0, 0.32, 9.4], look: [0, 0.32, 0], fov: 32 },
  { t: 120.0, pos: [0, 0.32, 8.9], look: [0, 0.32, 0], fov: 32, stop: true },
]

const tmpA = new THREE.Vector3()

function hermite(t: number, field: 'pos' | 'look', out: THREE.Vector3) {
  if (t <= KEYS[0].t) return out.fromArray(KEYS[0][field])
  const last = KEYS[KEYS.length - 1]
  if (t >= last.t) return out.fromArray(last[field])
  let i = 0
  while (i < KEYS.length - 2 && KEYS[i + 1].t < t) i++
  const k0 = KEYS[i]
  const k1 = KEYS[i + 1]
  const vel = (k: number) => {
    const key = KEYS[k]
    if (key.stop || k === 0 || k === KEYS.length - 1) return new THREE.Vector3()
    const prev = KEYS[k - 1]
    const next = KEYS[k + 1]
    return new THREE.Vector3()
      .fromArray(next[field])
      .sub(tmpA.fromArray(prev[field]))
      .divideScalar(next.t - prev.t)
  }
  const h = k1.t - k0.t
  const s = (t - k0.t) / h
  const s2 = s * s
  const s3 = s2 * s
  const h00 = 2 * s3 - 3 * s2 + 1
  const h10 = s3 - 2 * s2 + s
  const h01 = -2 * s3 + 3 * s2
  const h11 = s3 - s2
  const p0 = new THREE.Vector3().fromArray(k0[field])
  const p1 = new THREE.Vector3().fromArray(k1[field])
  return out
    .copy(p0)
    .multiplyScalar(h00)
    .addScaledVector(vel(i), h10 * h)
    .addScaledVector(p1, h01)
    .addScaledVector(vel(i + 1), h11 * h)
}

function fovAt(t: number) {
  let prev = KEYS[0]
  let fov = prev.fov ?? 34
  let prevFov = fov
  for (const k of KEYS) {
    if (k.fov === undefined) continue
    if (k.t <= t) {
      prev = k
      prevFov = k.fov
      fov = k.fov
    } else {
      const s = (t - prev.t) / (k.t - prev.t)
      const e = s * s * (3 - 2 * s)
      return prevFov + (k.fov - prevFov) * e
    }
  }
  return fov
}

export type Pose = { position: THREE.Vector3; target: THREE.Vector3; fov: number }

/** Camera pose at time t (seconds) */
export function poseAt(t: number): Pose {
  return {
    position: hermite(t, 'pos', new THREE.Vector3()),
    target: hermite(t, 'look', new THREE.Vector3()),
    fov: fovAt(t),
  }
}

export function applyPose(cam: THREE.PerspectiveCamera, pose: Pose) {
  cam.position.copy(pose.position)
  cam.fov = pose.fov
  cam.near = 0.1
  cam.far = 200
  cam.lookAt(pose.target)
  cam.updateProjectionMatrix()
  cam.updateMatrixWorld()
}

const projector = new THREE.PerspectiveCamera(34, 16 / 9, 0.1, 200)

/** Screen position (px in a 1920×1080 frame) of a world point at time t */
export function project(p: THREE.Vector3, t: number, width = 1920, height = 1080) {
  applyPose(projector, poseAt(t))
  const v = p.clone().project(projector)
  const view = p.clone().applyMatrix4(projector.matrixWorldInverse)
  return {
    x: (v.x * 0.5 + 0.5) * width,
    y: (-v.y * 0.5 + 0.5) * height,
    depth: -view.z,
    visible: view.z < -0.1 && Math.abs(v.x) < 1.15 && Math.abs(v.y) < 1.2,
  }
}
