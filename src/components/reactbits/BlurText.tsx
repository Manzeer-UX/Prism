/**
 * BlurText — adapted from React Bits (https://reactbits.dev/text-animations/blur-text,
 * MIT + Commons Clause). Trimmed to the single "blur" effect by words, with the
 * PRISM easing curve, a polymorphic heading tag and screen-reader-safe markup.
 */
import { motion } from 'motion/react'
import { useMemo } from 'react'
import { EASE } from '../../lib/motion'

type BlurTextProps = {
  text: string
  as?: 'h1' | 'h2' | 'h3' | 'p'
  id?: string
  className?: string
  /** Seconds before the first word starts */
  startDelay?: number
  /** Seconds between words */
  stagger?: number
  blur?: number
  distance?: number
  trigger?: 'load' | 'view'
}

export function BlurText({
  text,
  as: Tag = 'p',
  id,
  className = '',
  startDelay = 0,
  stagger = 0.06,
  blur = 10,
  distance = 18,
  trigger = 'load',
}: BlurTextProps) {
  const words = useMemo(() => text.split(' '), [text])
  const from = { opacity: 0, filter: `blur(${blur}px)`, y: distance }
  const to = { opacity: 1, filter: 'blur(0px)', y: 0 }

  return (
    <Tag id={id} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span key={`${word}-${i}`}>
            <motion.span
              className="inline-block will-change-[transform,filter,opacity]"
              initial={from}
              {...(trigger === 'load'
                ? { animate: to }
                : { whileInView: to, viewport: { once: true, margin: '0px 0px -10% 0px' } })}
              transition={{ duration: 0.7, ease: EASE, delay: startDelay + i * stagger }}
            >
              {word}
            </motion.span>
            {i < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </Tag>
  )
}
