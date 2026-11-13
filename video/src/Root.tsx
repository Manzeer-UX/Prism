import './fonts'
import { Composition, Folder } from 'remotion'
import { Film, type FilmProps } from './Film'
import { FPS, HEIGHT, WIDTH } from './theme'
import { DURATION, timeline } from './timeline'

const NAMES: Record<string, string> = {
  opening: 'Scene01-OpeningQuestion',
  chain: 'Scene02-InvisibleChain',
  challenges: 'Scene03-EnterpriseChallenges',
  reveal: 'Scene04-PrismReveal',
  product: 'Scene05-ProductExperience',
  capabilities: 'Scene06-NineCapabilities',
  value: 'Scene07-BusinessValue',
  closing: 'Scene08-BrandClosing',
}

/**
 * Compositions
 *  PrismLaunchFilm        the 120 s film with the full mix
 *  PrismLaunchFilm-NoVO   music and effects only, for localisation
 *  Scenes/…               each scene on its own, rendered exactly as in the film
 *
 * Authored and delivered at 1920×1080 landscape; `npm run render:4k` renders the
 * same film at 3840×2160 (scale 2) if a venue needs it.
 */
export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="PrismLaunchFilm"
        component={Film}
        durationInFrames={DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ offset: 0, audio: 'full' } satisfies FilmProps}
      />
      <Composition
        id="PrismLaunchFilm-NoVO"
        component={Film}
        durationInFrames={DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ offset: 0, audio: 'novo' } satisfies FilmProps}
      />
      <Folder name="Scenes">
        {timeline.scenes.map((s) => (
          <Composition
            key={s.id}
            id={NAMES[s.id]}
            component={Film}
            durationInFrames={s.to - s.from}
            fps={FPS}
            width={WIDTH}
            height={HEIGHT}
            defaultProps={{ offset: s.from, audio: 'full' } satisfies FilmProps}
          />
        ))}
      </Folder>
    </>
  )
}
