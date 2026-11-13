/**
 * Film design tokens. Values mirror the website's dark-surface tokens in
 * ../../src/index.css (see docs/DESIGN_SYSTEM.md) so the film and the site
 * read as one system. Spectrum hues are the site's OKLCH bands converted to
 * sRGB hex for WebGL; DOM layers use the same hex values.
 */

export const FPS = 30
export const WIDTH = 1920
export const HEIGHT = 1080

export const color = {
  ink950: '#060911',
  ink900: '#0a0e18',
  ink850: '#0f1420',
  ink800: '#161c2a',
  ink700: '#222a3b',
  fg: '#eef0f5',
  fg2: '#a3a9b8',
  fg3: '#81899c',
  line: 'rgba(238, 240, 245, 0.09)',
  lineStrong: 'rgba(238, 240, 245, 0.18)',
  accent: '#4c8dff',
  accentInk: '#7fb0ff',
  positive: '#4cc38a',
  negative: '#e5484d',
  warning: '#f5a524',
  brandNavy: '#0d2d6c',
  brandBlue: '#0057d9',
  brandTeal: '#0aa5a5',
  brandGreen: '#0d9f6f',
  brandViolet: '#6a5ae0',
  logoBlue: '#1677ff',
  logoOutline: '#07143d',
} as const

/** Capability spectrum, violet → blue → teal → green (site --band-1 … --band-9, dark set) */
export const BANDS = [
  '#9e8afa',
  '#8194ff',
  '#5e9efd',
  '#30abf5',
  '#0bb5e4',
  '#08bdd2',
  '#10c3c0',
  '#18c6a8',
  '#40c68b',
] as const

/** Hue per governance dimension, as the site's GovernanceHub assigns them */
export const DIMENSION_BAND = [1, 3, 4, 6, 7, 9] as const

export const font = {
  display: "'Space Grotesk Variable', 'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
  sans: "'Inter Variable', Inter, ui-sans-serif, system-ui, sans-serif",
  mono: "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, Consolas, monospace",
} as const

/** Display type, scaled up from the site's Display XL for a 1080p frame viewed on large screens */
export const type = {
  hero: { fontFamily: font.display, fontWeight: 500, fontSize: 132, lineHeight: 1.02, letterSpacing: '-0.035em' },
  displayL: { fontFamily: font.display, fontWeight: 500, fontSize: 96, lineHeight: 1.04, letterSpacing: '-0.03em' },
  displayM: { fontFamily: font.display, fontWeight: 500, fontSize: 64, lineHeight: 1.08, letterSpacing: '-0.025em' },
  title: { fontFamily: font.display, fontWeight: 500, fontSize: 44, lineHeight: 1.15, letterSpacing: '-0.015em' },
  lead: { fontFamily: font.sans, fontWeight: 400, fontSize: 30, lineHeight: 1.45 },
  meta: { fontFamily: font.mono, fontWeight: 400, fontSize: 20, lineHeight: 1.3, letterSpacing: '0.01em' },
} as const
