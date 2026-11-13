import { Sparkles } from 'lucide-react'

/**
 * PRISM AI logo — matches the source page: the Lucide "sparkles" glyph in
 * brand blue next to an extra-bold "PRISM AI" wordmark in brand navy.
 * On dark surfaces the navy would disappear, so the logo tokens in index.css
 * switch the wordmark to the light foreground and the glyph to a lighter blue.
 */
export function PrismMark({ size = 22, className = '' }: { size?: number; className?: string }) {
  return <Sparkles size={size} strokeWidth={2} aria-hidden="true" className={className} />
}

export function PrismWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <PrismMark size={18} className="text-(--logo-mark)" />
      <span className="font-sans text-[1.3125rem] leading-none font-extrabold tracking-[-0.01em] text-(--logo-ink)">
        PRISM AI
      </span>
    </span>
  )
}
