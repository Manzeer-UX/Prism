import { EdgeBatch, type Segment } from './EdgeBatch'
import { GlowPoints, type GlowPoint } from './GlowPoints'

/**
 * Connections between AI components and the data flowing along them: soft
 * lines for the links, travelling points of light for requests, signals and
 * the governed rhythm once the ecosystem is structured.
 */
export function DataFlowConnection({ segments, pulses, fov }: { segments: Segment[]; pulses: GlowPoint[]; fov: number }) {
  return (
    <>
      <EdgeBatch segments={segments} fov={fov} capacity={3072} />
      <GlowPoints points={pulses} fov={fov} capacity={1536} />
    </>
  )
}
