# PRISM AI — design system and direction

## Direction

Written before any layout, following the Unslop method (see credits).

- **Product.** An AI governance engine that gives enterprise teams visibility, evaluation and control over their LLMs, agents, prompts and data.
- **Character.** Exact, watchful, accountable.
- **World.** Optics and instrumentation. A prism takes one beam and resolves it into its parts — the way PRISM takes a tangle of AI traffic and resolves it into nine things you can observe and govern. Supporting material: trace waterfalls, audit ledgers, dials.
- **Moments.** (1) The hero refraction diagram. (2) The product console. (3) The capability dial. Everything else stays quiet.
- **Signature.** The spectrum band marker — a 3 px bar in a capability's hue, used wherever a capability is named and nowhere else.

## Colour

Surfaces come from one ink ramp tinted toward the brand navy; colour lives in the moments.

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg` | `#0a0e18` | `#f5f7fa` | Page |
| `--surface` | `#0f1420` | `#ffffff` | Cards |
| `--raised` | `#161c2a` | `#eceff4` | Active rows, inputs, tinted sections |
| `--fg` | `#eef0f5` | `#111827` | Primary text |
| `--fg-2` | `#a3a9b8` | `#4b5565` | Secondary text |
| `--fg-3` | `#81899c` | `#5f687a` | Meta, captions (≥ 4.5 : 1 on its surfaces) |
| `--line` | fg @ 9 % | fg @ 10 % | Hairlines |
| `--accent` | `#4c8dff` | `#0057d9` | One key element per chart, selection |

Brand colours from the source (`#0D2D6C` navy, `#0057D9` blue, `#0AA5A5` teal, `#0D9F6F` green, `#6A5AE0` violet) are kept as tokens. Blue is the accent; navy appears only in the console rail.

**Capability spectrum** — nine steps from violet to green through the brand hues, defined in OKLCH as `--band-1 … --band-9`, with a lighter set for dark surfaces and a darker set for light ones. Hue = capability. Never used as a surface or gradient.

Themes switch per section with `data-theme="dark" | "light"`; components only read semantic tokens, so any component works on either surface.

## Type

| Role | Family | Size | Notes |
|---|---|---|---|
| Display XL (hero, CTA) | Space Grotesk 500 | 34 → 64 px | −0.03em |
| Display L (section H2) | Space Grotesk 500 | 28 → 44 px | −0.025em |
| Display M (H3) | Space Grotesk 500 | 22 → 30 px | −0.015em |
| Lead | Inter | 17 → 20 px / 1.6 | Max ~36 rem |
| Body | Inter | 15–16 px / 1.6 | |
| Meta | JetBrains Mono | 12 / 16 px | Sentence case, tabular figures |

Two weights (400, 500). No uppercase tracked labels, no gradient text. Fonts are self-hosted via Fontsource (variable, subset by `unicode-range`).

## Space, grid, radius

- 4 px grid. Section padding 80 / 112 / 128 px (mobile / tablet / desktop).
- `shell` container: max 1360 px, gutters 20 / 32 / 48 px.
- 12-column grid from `lg` (1024 px); single column below.
- Radius: controls 10 px, cards 12 px, windows 16 px.

## Motion

| Rule | Value |
|---|---|
| Easing (everything) | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Hover / press | 150–160 ms |
| Tabs, menus | 220 ms |
| Entrances | 500 ms, rise 12 px, stagger 40–60 ms |
| Line drawing | 0.7–1.2 s |

- Entrances happen once per element (`whileInView`, `once: true`).
- Scroll-linked effects: Statement words (opacity), Value lines (opacity + 12 px), header scroll-spy, capability dial. No scroll hijacking; every sticky element releases naturally.
- Continuous motion is limited to trace pulses along diagram lines. In the hero they drift slowly; in the closing beam they run as one 6 s wave (nine pulses arrive together, the prism flashes, one burst leaves along the exit beam, then a rest). The closing wave only starts once the beam has fully assembled on scroll. All pulses pause off-screen and are removed under `prefers-reduced-motion`.
- The closing beam assembles with scroll: bands sweep in from wide apart (centre bands first) and converge on the prism, the prism draws, then the exit beam extends.
- Reduced motion: `MotionConfig reducedMotion="user"` drops transforms; scroll-scrubbed text renders final state; CSS removes the pulses and shortens transitions.
- Only `transform`, `opacity` and SVG stroke properties animate.

## Components

| Component | Purpose |
|---|---|
| `ui/ButtonLink` | Primary / secondary / quiet link-buttons, 40 or 48 px tall |
| `ui/Reveal` | One-time fade + rise on view |
| `ui/BandMarker` | The signature spectrum bar |
| `ui/PrismMark` | Logo glyph + wordmark |
| `reactbits/BlurText` | Word-by-word blur-in for the two display headings |
| `reactbits/ScrollReveal` | Scroll-scrubbed word reveal (Statement) |
| `reactbits/SpotlightCard` | Pointer-following neutral wash (enterprise strip) |
| `reactbits/CountUp` | One-time number tween (console figures) |
| `visuals/PrismRefraction` | Hero diagram with HTML label layer and pointer tilt |
| `visuals/SpectrumRing` | Sticky capability dial |
| `visuals/PillarGlyph` | Five small line diagrams |
| `visuals/ConvergeBeam` | Closing reverse-prism |
| `console/ConsolePreview` | Tabbed conceptual console (ARIA tabs, arrow-key navigation) |

## Library decisions

- **Motion for React** is the only animation engine. React Bits' ScrollReveal uses GSAP; it was ported to Motion's `useScroll` so the site ships one engine.
- **GSAP / ScrollTrigger — not used.** No sequence needed more than Motion's scroll hooks provide.
- **Three.js / React Three Fiber — not used.** The diagrams carry labelled information that must stay legible, accessible and fast on phones. SVG does this at a fraction of the weight; a WebGL scene would add ~150 KB+ gzip for no extra meaning.
- **Lucide** for the few icons (16–20 px, stroke 1.5).

## Unslop audit — refinement pass

| Pass | Finding | Fix |
|---|---|---|
| Spacing | Hero left a dead band at 1024 px when stacked | Split layout from `lg`; labels collapse to numbers until `xl` |
| Color | Spotlight wash was brand blue | Neutral ink at 4 % |
| Icons | Brand supplied a new PrismAI lock-up (four-facet prism mark + wordmark) | Inline SVG in `ui/PrismMark`; "Prism" is navy on light and the light foreground on dark, "AI" stays #1677FF; the mark is reused for the favicon and console rail |
| Copy | Trailing period on a short CTA line | Removed; all headings and labels end without periods |
| Type | Source uses uppercase tracked headings | Sentence case throughout; two weights |
| Layout | Source presents capabilities as an image | Rebuilt as real text with a sticky dial — searchable, accessible |
| Details | Console chart axis labels shrank to ~5 px on phones | Moved to HTML at 11 px |
| Details | Console card titles were `h4` under an `h2` | Changed to text; outline no longer skips levels |
| Visuals | Source "Model system performance · Live" chart had no data | Omitted |
| Motion | Hero copy parallax on scroll | Removed — parallax is decoration |
| Motion | Scroll cue faded incorrectly with Motion's accelerated scroll timeline | Driven by page `scrollY` instead |
| A11y | Prism labels below 24 px target size on phones | Plain text on phones, links from 640 px |
| A11y | Mobile menu collapsed inside the header's `backdrop-filter` containing block | Sheet rendered as a sibling of `<header>` |

**Template check.** Swap "PRISM" for another product name and the page no longer fits: the refraction diagram, the nine-band spectrum, the capability dial and the trace/audit glyphs are all derived from this product.

## Credits

- Unslop by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)) — <https://github.com/heydamir/unslop>, CC BY 4.0. Its direction method, pass order and token ranges guided this system.
- React Bits — <https://reactbits.dev> (MIT + Commons Clause). BlurText, ScrollReveal, SpotlightCard and CountUp were adapted; each file names its source.
