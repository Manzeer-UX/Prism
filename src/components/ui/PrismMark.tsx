/**
 * PRISM logo glyph — the source page pairs the wordmark with a sparkle icon;
 * this redraws it as a flat, single-colour prism splitting one beam, which is
 * the product idea itself.
 */
export function PrismMark({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 3.5 19.5 19H4.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M1 12.6 9.6 11.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M14.6 11 23 8.6M14.8 12.2 23 12.6M15.1 13.4 23 16.6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  )
}

export function PrismWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <PrismMark />
      <span className="font-display text-[1.0625rem] leading-none font-medium tracking-[-0.01em]">PRISM AI</span>
    </span>
  )
}
