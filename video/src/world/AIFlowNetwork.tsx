import { AgentNode } from './AgentNode'
import { DataFlowConnection } from './DataFlowConnection'
import type { WorldState } from './director'
import { ModelNode } from './ModelNode'
import { DataNode, MinorNode, ToolNode } from './nodes'

/** The AI ecosystem: models, agents, tools, data and the connections between them */
export function AIFlowNetwork({ state }: { state: WorldState }) {
  const fov = state.pose.fov
  return (
    <>
      <ModelNode instances={state.nodes.model} />
      <AgentNode instances={state.nodes.agent} />
      <ToolNode instances={state.nodes.tool} />
      <DataNode instances={state.nodes.data} />
      <MinorNode instances={state.nodes.minor} />
      <DataFlowConnection segments={state.segments} pulses={state.glows} fov={fov} />
    </>
  )
}
