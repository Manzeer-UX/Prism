/**
 * Motion rules — one easing curve, three durations, small distances.
 * Keep every animation inside these values so the page moves as one system.
 */
export const EASE = [0.22, 1, 0.36, 1] as const

export const DURATION = {
  /** hover, press, toggles */
  quick: 0.16,
  /** menus, tabs, popovers */
  menu: 0.22,
  /** entrances and view changes */
  enter: 0.5,
  /** line drawing inside diagrams */
  draw: 0.9,
} as const

/** Stagger between siblings — never more than ~6 items in one sequence */
export const STAGGER = 0.05

/** Rise distance for entrances, in px */
export const RISE = 12

export const viewportOnce = { once: true, margin: '0px 0px -12% 0px' } as const
