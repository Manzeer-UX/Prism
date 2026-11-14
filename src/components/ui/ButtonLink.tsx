import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'quiet'
type Size = 'md' | 'lg'

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Leave out for a placeholder: same look, but not a link and not interactive */
  href?: string
  variant?: Variant
  size?: Size
  /** Arrow glyph after the label: "external" leaves the page, "forward" moves within it */
  arrow?: 'external' | 'forward' | 'none'
  children: ReactNode
}

const base =
  'group inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none ' +
  'transition-[background-color,border-color,color,transform] duration-150 ease-(--ease-prism) ' +
  'active:scale-[0.98] motion-reduce:active:scale-100'

const variants: Record<Variant, string> = {
  primary: 'bg-btn text-btn-fg hover:bg-btn-hover',
  secondary: 'border border-line-strong text-fg hover:bg-raised hover:border-fg-3',
  quiet: 'text-fg-2 hover:text-fg',
}

const sizes: Record<Size, string> = {
  md: 'h-10 rounded-[10px] px-4 text-sm',
  lg: 'h-12 rounded-[10px] px-5 text-[0.9375rem]',
}

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'lg',
  arrow = 'none',
  className = '',
  children,
  ...rest
}: ButtonLinkProps) {
  const Icon = arrow === 'external' ? ArrowUpRight : arrow === 'forward' ? ArrowRight : null
  const pad = variant === 'quiet' ? 'px-0 h-auto' : ''
  // An <a> without href is a placeholder: not focusable, not clickable, read as text.
  const inert = href ? '' : 'pointer-events-none cursor-default'
  return (
    <a
      href={href}
      className={`${base} ${variants[variant]} ${variant === 'quiet' ? '' : sizes[size]} ${pad} ${inert} ${className}`}
      {...rest}
    >
      <span>{children}</span>
      {Icon && (
        <Icon
          aria-hidden="true"
          size={16}
          strokeWidth={1.75}
          className="transition-transform duration-150 ease-(--ease-prism) group-hover:translate-x-0.5 motion-reduce:transition-none"
        />
      )}
    </a>
  )
}
