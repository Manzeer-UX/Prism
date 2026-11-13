import { AbsoluteFill } from 'remotion'
import { color, font } from '../theme'
import { project } from './camera'
import { labelsAt } from './director'

/**
 * Names for things in the 3D world, set in the site's type as real DOM text
 * (crisp at 4K). Positions come from the same camera function as WebGL.
 */
export function WorldLabels({ t }: { t: number }) {
  const labels = labelsAt(t)
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {labels.map((l) => {
        const s = project(l.p, t)
        if (!s.visible) return null
        const isChain = l.kind === 'chain'
        const scale = isChain ? Math.min(1.25, Math.max(0.85, 13 / s.depth)) : 1
        return (
          <div
            key={l.id}
            style={{
              position: 'absolute',
              left: s.x,
              top: s.y,
              transform: isChain
                ? `translate(-50%, ${Math.round(34 * scale)}px) scale(${scale})`
                : 'translate(0, -100%)',
              transformOrigin: 'top center',
              opacity: l.opacity,
              fontFamily: isChain ? font.sans : font.mono,
              fontSize: isChain ? 25 : 20,
              fontWeight: isChain ? 500 : 400,
              letterSpacing: isChain ? '-0.005em' : '0.01em',
              color: isChain ? color.fg : color.fg2,
              whiteSpace: 'nowrap',
              textShadow: '0 1px 12px rgba(6,9,17,0.9)',
            }}
          >
            {l.text}
          </div>
        )
      })}
    </AbsoluteFill>
  )
}
