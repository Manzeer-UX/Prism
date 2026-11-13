import * as THREE from 'three'
import { InstancedNodes, type NodeInstance } from './nodes'

/** Agents — an octahedron: directional, a form that acts */
export const agentGeometry = new THREE.OctahedronGeometry(1.05, 0)

export function AgentNode({ instances }: { instances: NodeInstance[] }) {
  return <InstancedNodes geometry={agentGeometry} instances={instances} />
}
