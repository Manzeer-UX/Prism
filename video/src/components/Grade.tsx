import { useMemo } from 'react'
import { AbsoluteFill } from 'remotion'
import { rng } from '../lib/random'

/** A 256 px tile of film grain, generated once and shifted every frame */
function useGrainTile() {
  return useMemo(() => {
    if (typeof document === 'undefined') return ''
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 256
    const ctx = c.getContext('2d')
    if (!ctx) return ''
    const img = ctx.createImageData(256, 256)
    const r = rng(7)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.round(r() * 255)
      img.data[i] = v
      img.data[i + 1] = v
      img.data[i + 2] = v
      img.data[i + 3] = 255
    }
    ctx.putImageData(img, 0, 0)
    return c.toDataURL('image/png')
  }, [])
}

/**
 * Final grade over every frame: a soft vignette and fine grain. The grain also
 * dithers the dark gradients so they never band on large LED walls.
 */
export function Grade({ frame, fadeToBlack = 0 }: { frame: number; fadeToBlack?: number }) {
  const tile = useGrainTile()
  const r = rng(frame * 7919 + 13)
  const ox = Math.floor(r() * 256)
  const oy = Math.floor(r() * 256)
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 85% 80% at 50% 48%, rgba(0,0,0,0) 55%, rgba(2,3,7,0.62) 100%)',
        }}
      />
      {tile ? (
        <AbsoluteFill
          style={{
            backgroundImage: `url(${tile})`,
            backgroundSize: '256px 256px',
            backgroundPosition: `${ox}px ${oy}px`,
            opacity: 0.045,
            mixBlendMode: 'overlay',
          }}
        />
      ) : null}
      {fadeToBlack > 0 ? <AbsoluteFill style={{ background: '#000', opacity: fadeToBlack }} /> : null}
    </AbsoluteFill>
  )
}
