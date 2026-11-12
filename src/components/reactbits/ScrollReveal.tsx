/**
 * ScrollReveal — adapted from React Bits (https://reactbits.dev/text-animations/scroll-reveal,
 * MIT + Commons Clause). The original scrubs word opacity with GSAP ScrollTrigger;
 * this version uses Motion's useScroll so the site ships one animation engine.
 * Words in `emphasize` settle at the primary text colour, the rest at secondary,
 * so the finished sentence keeps a hierarchy.
 */
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useMemo, useRef } from 'react'

type ScrollRevealProps = {
  text: string
  as?: 'p' | 'h2' | 'blockquote'
  className?: string
  /** Opacity of words that have not been reached yet */
  baseOpacity?: number
  /** Words (compared without punctuation, case-insensitive) that end in the primary colour */
  emphasize?: string[]
}

const clean = (word: string) => word.replace(/[^\p{L}\p{N}-]/gu, '').toLowerCase()

function Word({
  word,
  progress,
  range,
  base,
  strong,
}: {
  word: string
  progress: MotionValue<number>
  range: [number, number]
  base: number
  strong: boolean
}) {
  const opacity = useTransform(progress, range, [base, 1])
  return (
    <motion.span
      style={{ opacity }}
      className={`inline-block will-change-[opacity] ${strong ? 'text-fg' : 'text-fg-2'}`}
    >
      {word}
    </motion.span>
  )
}

export function ScrollReveal({
  text,
  as: Tag = 'p',
  className = '',
  baseOpacity = 0.14,
  emphasize = [],
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.55'] })
  const words = useMemo(() => text.split(' '), [text])
  const strongSet = useMemo(() => new Set(emphasize.map(clean)), [emphasize])
  const n = words.length

  return (
    <Tag ref={ref as never} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => {
          const strong = strongSet.has(clean(word))
          const start = (i / n) * 0.82
          return (
            <span key={`${word}-${i}`}>
              {reduced ? (
                <span className={strong ? 'text-fg' : 'text-fg-2'}>{word}</span>
              ) : (
                <Word
                  word={word}
                  progress={scrollYProgress}
                  range={[start, start + 0.18]}
                  base={baseOpacity}
                  strong={strong}
                />
              )}
              {i < n - 1 ? ' ' : null}
            </span>
          )
        })}
      </span>
    </Tag>
  )
}
