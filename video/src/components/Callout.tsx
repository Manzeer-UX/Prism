import type React from 'react'
import { color, font } from '../theme'

/** A small glass card in the website's console style, used to annotate the 3D world */
export function Callout({
  title,
  children,
  tag,
  tagColor = color.warning,
  width = 420,
  style,
}: {
  title: string
  children?: React.ReactNode
  tag?: string
  tagColor?: string
  width?: number
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        width,
        borderRadius: 14,
        border: `1px solid ${color.lineStrong}`,
        background: 'rgba(15, 20, 32, 0.88)',
        boxShadow: '0 24px 48px -24px rgba(0,0,0,0.65)',
        padding: '16px 20px 18px',
        ...style,
      }}
    >
      <div style={{ fontFamily: font.mono, fontSize: 16, color: color.fg3, letterSpacing: '0.01em' }}>{title}</div>
      {children ? <div style={{ marginTop: 10, fontFamily: font.sans, fontSize: 23, lineHeight: 1.35, color: color.fg }}>{children}</div> : null}
      {tag ? (
        <div
          style={{
            marginTop: 14,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 12px',
            borderRadius: 999,
            background: `${tagColor}1f`,
            border: `1px solid ${tagColor}55`,
            fontFamily: font.sans,
            fontSize: 18,
            fontWeight: 500,
            color: tagColor,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 8, background: tagColor }} />
          {tag}
        </div>
      ) : null}
    </div>
  )
}

/** A row in a small table inside a callout */
export function CalloutRow({ label, value, valueColor = color.fg, mono = false }: { label: string; value: React.ReactNode; valueColor?: string; mono?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 16,
        padding: '8px 0',
        borderTop: `1px solid ${color.line}`,
        fontSize: 20,
      }}
    >
      <span style={{ color: color.fg2, fontFamily: mono ? font.mono : font.sans, fontSize: mono ? 17 : 20 }}>{label}</span>
      <span style={{ color: valueColor, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  )
}
