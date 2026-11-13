import { useThree } from '@react-three/fiber'
import { useLayoutEffect, useMemo } from 'react'
import * as THREE from 'three'
import { glowPointsMaterial } from './materials'

export type GlowPoint = { p: THREE.Vector3; color: THREE.Color; intensity: number; size: number }

/**
 * Soft points of light (pulses, node halos, first light). Size is in world
 * units, so glows scale with perspective and look the same at 1080p and 4K.
 */
export function GlowPoints({ points, fov, capacity = 1024 }: { points: GlowPoint[]; fov: number; capacity?: number }) {
  const size = useThree((s) => s.size)
  const dpr = useThree((s) => s.viewport.dpr)
  const { geometry, material } = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(capacity * 3), 3))
    g.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(capacity * 3), 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(capacity), 1))
    return { geometry: g, material: glowPointsMaterial() }
  }, [capacity])

  useLayoutEffect(() => {
    const pos = geometry.getAttribute('position') as THREE.BufferAttribute
    const col = geometry.getAttribute('aColor') as THREE.BufferAttribute
    const siz = geometry.getAttribute('aSize') as THREE.BufferAttribute
    const n = Math.min(points.length, capacity)
    for (let i = 0; i < n; i++) {
      const pt = points[i]
      pos.setXYZ(i, pt.p.x, pt.p.y, pt.p.z)
      col.setXYZ(i, pt.color.r * pt.intensity, pt.color.g * pt.intensity, pt.color.b * pt.intensity)
      siz.setX(i, pt.size)
    }
    geometry.setDrawRange(0, n)
    pos.needsUpdate = true
    col.needsUpdate = true
    siz.needsUpdate = true
  })

  // Pixels per world unit at distance 1, in drawing-buffer pixels
  material.uniforms.uProjScale.value = (size.height * dpr) / (2 * Math.tan(((fov * Math.PI) / 180) / 2))

  return <points geometry={geometry} material={material} frustumCulled={false} />
}
