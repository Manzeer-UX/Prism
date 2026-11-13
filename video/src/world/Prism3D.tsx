import { useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import type { PrismState } from './director'
import { EdgeBatch, type Segment } from './EdgeBatch'
import { innerLightMaterial } from './materials'
import { PRISM } from './network'

function triangleShape(scale = 1) {
  const s = new THREE.Shape()
  s.moveTo(PRISM.apex.x * scale, PRISM.apex.y * scale)
  s.lineTo(PRISM.right.x * scale, PRISM.right.y * scale)
  s.lineTo(PRISM.left.x * scale, PRISM.left.y * scale)
  s.closePath()
  return s
}

function prismGeometry(scale: number, bevel: number) {
  const depth = PRISM.depth * scale - bevel * 2
  const g = new THREE.ExtrudeGeometry(triangleShape(scale * (1 - bevel * 0.9)), {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 1,
  })
  g.translate(0, 0, -depth / 2)
  g.computeVertexNormals()
  return g
}

const WHITE = new THREE.Color('#eef0f5')

/**
 * A dark studio for reflections: near-black walls and a few soft strip lights
 * in the brand's cool hues, so the glass reads as crisp highlights, not grey.
 */
function studio() {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#04060c')
  const strip = (w: number, h: number, c: string, intensity: number, pos: [number, number, number], look: [number, number, number]) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(intensity), side: THREE.DoubleSide }),
    )
    m.position.set(...pos)
    m.lookAt(...look)
    scene.add(m)
  }
  strip(8, 1.2, '#ffffff', 6, [0, 7, 3], [0, 0, 0]) // overhead softbox
  strip(1.0, 7, '#cfe0ff', 4, [-7, 1, 4], [0, 0, 0]) // key strip, left
  strip(0.8, 6, '#9e8afa', 3, [7, 0, 2], [0, 0, 0]) // violet rim, right
  strip(6, 0.6, '#10c3c0', 2, [0, -6, 3], [0, 0, 0]) // teal floor bounce
  strip(4, 3, '#ffffff', 1.4, [0, 2, -8], [0, 0, 0]) // back light through the glass
  return scene
}

/** The nine outline edges of the prism, as the website draws it */
function edgeSegments(intensity: number): Segment[] {
  const half = PRISM.depth / 2
  const f = [PRISM.apex, PRISM.right, PRISM.left].map((p) => new THREE.Vector3(p.x, p.y, half))
  const b = [PRISM.apex, PRISM.right, PRISM.left].map((p) => new THREE.Vector3(p.x, p.y, -half))
  const segs: Segment[] = []
  for (let i = 0; i < 3; i++) {
    segs.push({ a: f[i], b: f[(i + 1) % 3], color: WHITE, intensity: intensity * 0.85, width: 0.018 })
    segs.push({ a: b[i], b: b[(i + 1) % 3], color: WHITE, intensity: intensity * 0.35, width: 0.014 })
    segs.push({ a: f[i], b: b[i], color: WHITE, intensity: intensity * 0.5, width: 0.014 })
  }
  return segs
}

/**
 * The prism — glass with real refraction and chromatic dispersion, an inner
 * light that carries the beam, and the line-drawn outline from the website.
 */
export function Prism3D({ state, fov }: { state: PrismState; fov: number }) {
  const gl = useThree((s) => s.gl)
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const tex = pmrem.fromScene(studio(), 0.02).texture
    pmrem.dispose()
    return tex
  }, [gl])

  const { glassGeo, innerGeo, glass, inner } = useMemo(() => {
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      metalness: 0,
      roughness: 0.05,
      transmission: 1,
      thickness: 1.8,
      ior: 1.5,
      dispersion: 5,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      iridescence: 0.18,
      iridescenceIOR: 1.25,
      attenuationColor: new THREE.Color('#c6d4ff'),
      attenuationDistance: 5,
      specularIntensity: 1,
      envMapIntensity: 1.25,
      transparent: true,
      depthWrite: false,
    })
    glassMat.envMap = env
    return {
      glassGeo: prismGeometry(1, 0.06),
      innerGeo: prismGeometry(0.9, 0),
      glass: glassMat,
      inner: innerLightMaterial(),
    }
  }, [env])

  glass.opacity = Math.min(1, state.glass)
  glass.visible = state.glass > 0.01
  inner.uniforms.uIntensity.value = state.inner
  inner.uniforms.uSpectrum.value = state.spectrum
  inner.visible = state.inner > 0.005

  const segs = useMemo(() => edgeSegments(state.edges), [state.edges])

  return (
    <group rotation={[0, state.rotY, 0]}>
      <mesh geometry={glassGeo} material={glass} renderOrder={2} />
      <mesh geometry={innerGeo} material={inner} renderOrder={3} />
      {state.edges > 0.005 ? <EdgeBatch segments={segs} fov={fov} capacity={16} minPx={1.2} /> : null}
    </group>
  )
}
