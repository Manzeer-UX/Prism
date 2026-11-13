import { useThree } from '@react-three/fiber'
import { useLayoutEffect, useMemo } from 'react'
import * as THREE from 'three'
import { edgeMaterial } from './materials'

export type Segment = { a: THREE.Vector3; b: THREE.Vector3; color: THREE.Color; intensity: number; width: number }

/**
 * Many soft-edged line segments in one draw call. Width is in world units with
 * a minimum on-screen width, so far connections stay visible but never shimmer.
 */
export function EdgeBatch({ segments, fov, capacity = 2048, minPx = 1.1 }: { segments: Segment[]; fov: number; capacity?: number; minPx?: number }) {
  const { size } = useThree()
  const { geometry, material } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const v = capacity * 4
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v * 3), 3))
    g.setAttribute('aStart', new THREE.BufferAttribute(new Float32Array(v * 3), 3))
    g.setAttribute('aEnd', new THREE.BufferAttribute(new Float32Array(v * 3), 3))
    g.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(v * 3), 3))
    g.setAttribute('aWidth', new THREE.BufferAttribute(new Float32Array(v), 1))
    const side = new Float32Array(v)
    const alongArr = new Float32Array(v)
    const index: number[] = []
    for (let i = 0; i < capacity; i++) {
      const o = i * 4
      side.set([-1, 1, -1, 1], o)
      alongArr.set([0, 0, 1, 1], o)
      index.push(o, o + 1, o + 2, o + 2, o + 1, o + 3)
    }
    g.setAttribute('aSide', new THREE.BufferAttribute(side, 1))
    g.setAttribute('aAlong', new THREE.BufferAttribute(alongArr, 1))
    g.setIndex(index)
    return { geometry: g, material: edgeMaterial() }
  }, [capacity])

  useLayoutEffect(() => {
    const st = geometry.getAttribute('aStart') as THREE.BufferAttribute
    const en = geometry.getAttribute('aEnd') as THREE.BufferAttribute
    const co = geometry.getAttribute('aColor') as THREE.BufferAttribute
    const wi = geometry.getAttribute('aWidth') as THREE.BufferAttribute
    const n = Math.min(segments.length, capacity)
    for (let i = 0; i < n; i++) {
      const s = segments[i]
      const r = s.color.r * s.intensity
      const gg = s.color.g * s.intensity
      const b = s.color.b * s.intensity
      for (let k = 0; k < 4; k++) {
        const j = i * 4 + k
        st.setXYZ(j, s.a.x, s.a.y, s.a.z)
        en.setXYZ(j, s.b.x, s.b.y, s.b.z)
        co.setXYZ(j, r, gg, b)
        wi.setX(j, s.width)
      }
    }
    geometry.setDrawRange(0, n * 6)
    st.needsUpdate = true
    en.needsUpdate = true
    co.needsUpdate = true
    wi.needsUpdate = true
  })

  material.uniforms.uResolution.value.set(size.width, size.height)
  material.uniforms.uProjScale.value = size.height / (2 * Math.tan(((fov * Math.PI) / 180) / 2))
  material.uniforms.uMinPx.value = minPx

  return <mesh geometry={geometry} material={material} frustumCulled={false} />
}
