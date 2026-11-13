import * as THREE from 'three'

/**
 * The film's backdrop as a WebGL background texture — the same gradients as
 * components/Backdrop.tsx, so the 3D world and the interface scenes share one
 * stage. Rendering it inside WebGL lets the glass refract the dark stage.
 */
export const BACKDROP_GRADIENTS = [
  { cx: 0.5, cy: 0.46, rx: 0.7, ry: 0.6, stops: [[0, 'rgba(22, 40, 92, 0.55)'], [0.38 / 0.72, 'rgba(13, 24, 56, 0.35)'], [1, 'rgba(6, 9, 17, 0)']] },
  { cx: 0.78, cy: 0.24, rx: 0.45, ry: 0.4, stops: [[0, 'rgba(106, 90, 224, 0.10)'], [1, 'rgba(6, 9, 17, 0)']] },
  { cx: 0.18, cy: 0.82, rx: 0.5, ry: 0.45, stops: [[0, 'rgba(10, 165, 165, 0.07)'], [1, 'rgba(6, 9, 17, 0)']] },
] as const

export function backdropTexture(width = 1920, height = 1080) {
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#060911'
  ctx.fillRect(0, 0, width, height)
  for (const g of BACKDROP_GRADIENTS) {
    // CSS "ellipse W% H%" radii are fractions of the box; the gradient ends at 72% / 70% of them
    const end = g === BACKDROP_GRADIENTS[0] ? 0.72 : 0.7
    const rx = g.rx * width * end
    const ry = g.ry * height * end
    ctx.save()
    ctx.translate(g.cx * width, g.cy * height)
    ctx.scale(1, ry / rx)
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx)
    for (const [o, col] of g.stops) grad.addColorStop(o as number, col as string)
    ctx.fillStyle = grad
    ctx.fillRect(-rx, -rx, rx * 2, rx * 2)
    ctx.restore()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
