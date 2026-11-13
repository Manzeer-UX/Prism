import type React from 'react'
import { PrismMark, PrismWordmark } from '@site/components/ui/PrismMark'
import { color } from '../theme'

/** Logo colour variables the website sets for dark surfaces (see src/index.css) */
export const LOGO_VARS = {
  ['--logo-ink' as string]: color.fg,
  ['--logo-outline' as string]: color.logoOutline,
} as React.CSSProperties

/** The official PrismAI lock-up (mark + wordmark), straight from the website's component */
export function BrandWordmark({ height = 120, style }: { height?: number; style?: React.CSSProperties }) {
  return (
    <div style={{ ...LOGO_VARS, height, width: (height * 160) / 48, ...style }}>
      <PrismWordmark className="" label="PrismAI" />
    </div>
  )
}

/** The mark alone */
export function BrandMark({ size = 120, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <div style={{ ...LOGO_VARS, width: size, height: size, ...style }}>
      <PrismMark size={size} />
    </div>
  )
}
