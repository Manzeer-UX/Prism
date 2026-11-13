import { AbsoluteFill } from 'remotion'
import { color } from '../theme'
import { BACKDROP_GRADIENTS } from '../world/backdrop'

/**
 * The stage: dark charcoal into navy. The same gradients are painted into the
 * WebGL background (world/backdrop.ts), so the 3D world and the interface
 * scenes sit on one continuous stage. `grid` brings in the site's faint
 * architectural grid.
 */
export function Backdrop({ grid = 0 }: { grid?: number }) {
  return (
    <AbsoluteFill style={{ background: color.ink950 }}>
      {BACKDROP_GRADIENTS.map((g, i) => (
        <AbsoluteFill
          key={i}
          style={{
            background: `radial-gradient(ellipse ${g.rx * 100}% ${g.ry * 100}% at ${g.cx * 100}% ${g.cy * 100}%, ${g.stops
              .map(([o, c]) => `${c} ${(o as number) * (i === 0 ? 72 : 70)}%`)
              .join(', ')})`,
          }}
        />
      ))}
      {grid > 0 ? (
        <AbsoluteFill
          style={{
            opacity: grid,
            backgroundImage:
              'linear-gradient(to right, rgba(238,240,245,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(238,240,245,0.05) 1px, transparent 1px)',
            backgroundSize: '96px 96px',
            backgroundPosition: '-1px -1px',
            maskImage: 'radial-gradient(ellipse 65% 60% at 50% 50%, black 30%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse 65% 60% at 50% 50%, black 30%, transparent 85%)',
          }}
        />
      ) : null}
    </AbsoluteFill>
  )
}
