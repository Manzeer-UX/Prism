/**
 * PrismAI logo — the supplied lock-up: a four-facet prism mark (amber, blue,
 * teal, deep blue, with a white play-shaped core) beside a "Prism" + "AI"
 * wordmark. On light surfaces "Prism" is navy (#07143D); dark surfaces switch it
 * to the light foreground through --logo-ink in index.css. "AI" stays brand
 * blue (#1677FF) on both.
 */

function MarkPaths() {
  return (
    <>
      <path d="M30 4L53 18Q56 20 56 24V40Q56 44 53 46L39 54L23 44V31L30 26V4Z" fill="#F59E0B" />
      <path d="M30 4V26L23 31L8 23V20Q8 18 11 16L27 5Q28 4 30 4Z" fill="#2563EB" />
      <path d="M8 22L23 31V43L11 59Q8 62 8 57V22Z" fill="#14B8A6" />
      <path d="M23 43L39 54L11 60L23 43Z" fill="#1D4ED8" />
      <path d="M24 23Q24 20 27 22L43 31Q46 33 43 35L27 44Q24 46 24 42V23Z" fill="#FFFFFF" />
      <path
        d="M30 4L53 18Q56 20 56 24V40Q56 44 53 46L39 54L11 60Q8 61 8 57V20Q8 18 11 16L27 5Q28 4 30 4Z"
        fill="none"
        stroke="var(--logo-outline, #07143D)"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </>
  )
}

/** The mark on its own (console rail, governance hub, favicon). */
export function PrismMark({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="4 2 56 60" fill="none" aria-hidden="true" className={className}>
      <MarkPaths />
    </svg>
  )
}

/**
 * Full lock-up. Decorative by default because it usually sits inside a link
 * that carries its own label; pass `label` to expose it as an image.
 */
export function PrismWordmark({ className = '', label }: { className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 160 48"
      fill="none"
      className={`h-10 w-auto ${className}`}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      <g transform="scale(0.75)">
        <MarkPaths />
      </g>
      <text
        x="52"
        y="30"
        fontFamily="'Inter Variable', Inter, Arial, sans-serif"
        fontSize="21"
        fontWeight="800"
        letterSpacing="0"
      >
        <tspan fill="var(--logo-ink)">Prism</tspan>
        <tspan fill="#1677FF">AI</tspan>
      </text>
    </svg>
  )
}
