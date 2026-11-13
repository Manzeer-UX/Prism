import { useLayoutEffect, useMemo } from 'react'
import * as THREE from 'three'
import { nodeMaterial } from './materials'

export type NodeInstance = { p: THREE.Vector3; scale: number; color: THREE.Color; glow: number; spin: number }

const dummy = new THREE.Object3D()

/** One instanced draw call for every node of a kind */
export function InstancedNodes({
  geometry,
  instances,
  capacity = 160,
}: {
  geometry: THREE.BufferGeometry
  instances: NodeInstance[]
  capacity?: number
}) {
  const { mesh } = useMemo(() => {
    const g = geometry.clone()
    g.setAttribute('aColor', new THREE.InstancedBufferAttribute(new Float32Array(capacity * 3), 3))
    g.setAttribute('aGlow', new THREE.InstancedBufferAttribute(new Float32Array(capacity), 1))
    const m = new THREE.InstancedMesh(g, nodeMaterial(), capacity)
    m.frustumCulled = false
    return { mesh: m }
  }, [geometry, capacity])

  useLayoutEffect(() => {
    const col = mesh.geometry.getAttribute('aColor') as THREE.InstancedBufferAttribute
    const glo = mesh.geometry.getAttribute('aGlow') as THREE.InstancedBufferAttribute
    const n = Math.min(instances.length, capacity)
    for (let i = 0; i < n; i++) {
      const it = instances[i]
      dummy.position.copy(it.p)
      dummy.rotation.set(it.spin * 0.7, it.spin, it.spin * 0.35)
      dummy.scale.setScalar(Math.max(0.0001, it.scale))
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      col.setXYZ(i, it.color.r, it.color.g, it.color.b)
      glo.setX(i, it.glow)
    }
    mesh.count = n
    mesh.instanceMatrix.needsUpdate = true
    col.needsUpdate = true
    glo.needsUpdate = true
  })

  return <primitive object={mesh} />
}

/** Tool nodes — a squared block */
export const toolGeometry = new THREE.BoxGeometry(1.15, 1.15, 1.15)
/** Data and knowledge sources — a hexagonal store */
export const dataGeometry = new THREE.CylinderGeometry(0.82, 0.82, 1.05, 6)
/** Small supporting nodes — prompts, sessions, intermediate steps */
export const minorGeometry = new THREE.IcosahedronGeometry(0.9, 1)

export function ToolNode({ instances }: { instances: NodeInstance[] }) {
  return <InstancedNodes geometry={toolGeometry} instances={instances} />
}
export function DataNode({ instances }: { instances: NodeInstance[] }) {
  return <InstancedNodes geometry={dataGeometry} instances={instances} />
}
export function MinorNode({ instances }: { instances: NodeInstance[] }) {
  return <InstancedNodes geometry={minorGeometry} instances={instances} />
}
