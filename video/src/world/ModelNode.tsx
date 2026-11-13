import * as THREE from 'three'
import { InstancedNodes, type NodeInstance } from './nodes'

/** AI models — a faceted icosahedron, the most "intelligent" form in the network */
export const modelGeometry = new THREE.IcosahedronGeometry(1, 0)

export function ModelNode({ instances }: { instances: NodeInstance[] }) {
  return <InstancedNodes geometry={modelGeometry} instances={instances} />
}
