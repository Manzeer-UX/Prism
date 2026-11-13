import type React from 'react'
import { AbsoluteFill, Html5Audio, getStaticFiles, staticFile, useCurrentFrame } from 'remotion'
import { Backdrop } from './components/Backdrop'
import { Grade } from './components/Grade'
import { EASE } from './lib/anim'
import { BrandClosingScene } from './scenes/BrandClosingScene'
import { BusinessImpactScene } from './scenes/BusinessImpactScene'
import { CapabilitiesScene } from './scenes/CapabilitiesScene'
import { EnterpriseChallengesScene } from './scenes/EnterpriseChallengesScene'
import { InvisibleChainScene } from './scenes/InvisibleChainScene'
import { OpeningScene } from './scenes/OpeningScene'
import { PrismRevealScene } from './scenes/PrismRevealScene'
import { ProductExperienceScene } from './scenes/ProductExperienceScene'
import { timeline, type SceneId } from './timeline'
import { WorldLabels } from './world/Labels'
import { World3D } from './world/World3D'
import { worldVisible } from './world/director'

export type SceneProps = {
  /** Frame relative to the scene's start (negative before it, ≥ duration after it) */
  frame: number
  /** Scene length in frames */
  duration: number
  /** Film time in seconds */
  t: number
}

export type AudioMode = 'full' | 'novo' | 'none'
export type FilmProps = { offset?: number; audio?: AudioMode }

const SCENES: Record<SceneId, React.FC<SceneProps>> = {
  opening: OpeningScene,
  chain: InvisibleChainScene,
  challenges: EnterpriseChallengesScene,
  reveal: PrismRevealScene,
  product: ProductExperienceScene,
  capabilities: CapabilitiesScene,
  value: BusinessImpactScene,
  closing: BrandClosingScene,
}

/** Frames a scene stays mounted beyond its edges, for overlapping transitions */
const MARGIN = 45

const fps = timeline.fps

/**
 * The whole film. `offset` lets each scene be previewed on its own while
 * rendering exactly what the full film shows at that moment.
 */
export const Film: React.FC<FilmProps> = ({ offset = 0, audio = 'full' }) => {
  const f = useCurrentFrame() + offset
  const t = f / fps

  const showWorld = worldVisible(t)
  // the world hands over to the interface (05) and comes back for (07)
  const worldOpacity = t < 60 ? 1 - Math.min(1, Math.max(0, (t - 57.6) / 0.6)) : Math.min(1, Math.max(0, (t - 105.6) / 1.0))

  const audioFile = audio === 'none' ? null : `audio/mix-${audio}.wav`
  const hasAudio = audioFile !== null && getStaticFiles().some((s) => s.name === audioFile)

  return (
    <AbsoluteFill style={{ backgroundColor: '#060911', overflow: 'hidden' }}>
      <Backdrop grid={t > 56 && t < 108 ? 1 : 0} />
      {showWorld ? <World3D t={t} opacity={worldOpacity} /> : null}
      {showWorld ? <WorldLabels t={t} /> : null}
      {timeline.scenes.map((s) => {
        if (f < s.from - MARGIN || f >= s.to + MARGIN) return null
        const Scene = SCENES[s.id as SceneId]
        return (
          <AbsoluteFill key={s.id}>
            <Scene frame={f - s.from} duration={s.to - s.from} t={t} />
          </AbsoluteFill>
        )
      })}
      {/* the film opens in darkness; the first light arrives before the stage does */}
      <Grade frame={f} fadeToBlack={f < 80 ? 0.94 * (1 - EASE(Math.min(1, f / 78))) : 0} />
      {hasAudio && audioFile ? <Html5Audio src={staticFile(audioFile)} trimBefore={offset} /> : null}
    </AbsoluteFill>
  )
}
