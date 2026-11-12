/**
 * The PRISM signature detail: a short vertical bar in a capability's spectrum
 * hue. It appears wherever a capability is named, and nowhere else.
 */
export function BandMarker({ band, className = '' }: { band: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-3.5 w-[3px] shrink-0 rounded-full ${className}`}
      style={{ backgroundColor: `var(--band-${band})` }}
    />
  )
}
