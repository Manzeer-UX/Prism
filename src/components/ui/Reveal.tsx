import { motion, type HTMLMotionProps } from 'motion/react'
import type { ReactNode } from 'react'
import { DURATION, EASE, RISE, viewportOnce } from '../../lib/motion'

type RevealProps = Omit<HTMLMotionProps<'div'>, 'children'> & {
  children: ReactNode
  delay?: number
  /** Soften from a small blur — reserve for headings */
  blur?: boolean
  as?: 'div' | 'li' | 'section' | 'p'
}

/**
 * Enter-on-view: a short fade and rise, once. Motion's MotionConfig
 * (reducedMotion="user") removes the transform for reduced-motion users,
 * leaving an opacity fade.
 */
export function Reveal({ children, delay = 0, blur = false, as = 'div', ...rest }: RevealProps) {
  const Component = motion[as] as typeof motion.div
  return (
    <Component
      initial={{ opacity: 0, y: RISE, filter: blur ? 'blur(6px)' : 'blur(0px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={viewportOnce}
      transition={{ duration: DURATION.enter, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Component>
  )
}
