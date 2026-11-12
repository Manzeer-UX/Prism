# PRISM AI Governance — website

A redesigned product site for **PRISM AI, a Seasia AI Governance Engine**, built with React, TypeScript, Vite and Tailwind CSS. All product copy comes from the PRISM AI product page; the design, motion and interaction are new.

- Content source and mapping: [docs/CONTENT_INVENTORY.md](docs/CONTENT_INVENTORY.md)
- Design direction, tokens, motion rules and the Unslop audit: [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)

## Run it

Requires Node.js 20.19+ or 22.12+ (tested on Node 24, npm 11).

```bash
npm install
```

```bash
npm run dev
```

Open <http://localhost:5173>.

Production build (typechecks first) and local preview:

```bash
npm run build
```

```bash
npm run preview
```

| Script | What it does |
|---|---|
| `dev` | Vite dev server with HMR |
| `build` | `tsc --noEmit` then `vite build` into `dist/` |
| `typecheck` | TypeScript only |
| `preview` | Serve `dist/` locally |
| `format` / `format:check` | Prettier (with Tailwind class sorting) |

`dist/` is a static site — deploy it to any static host (Netlify, Vercel, S3 + CloudFront, Nginx). No server code or environment variables.

## Stack

| Layer | Choice |
|---|---|
| UI | React 19, TypeScript 7 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 (CSS-first tokens in `src/index.css`) |
| Motion | Motion for React 14 |
| Animated components | Adapted from React Bits (BlurText, ScrollReveal, SpotlightCard, CountUp) |
| Icons | Lucide React |
| Fonts | Space Grotesk, Inter, JetBrains Mono — self-hosted via Fontsource |

GSAP and Three.js/React Three Fiber were evaluated and deliberately left out — see "Library decisions" in the design-system doc.

## Project structure

```
src/
  main.tsx                 Entry: fonts, global CSS, <App />
  App.tsx                  Page composition and MotionConfig
  index.css                Design tokens, themes, type scale, utilities
  content/prism.ts         Every product string, from the source page
  lib/
    motion.ts              Easing, durations, stagger, rise distance
    hooks.ts               Media queries, scroll-spy, on-screen detection
  components/
    ui/                    ButtonLink, Reveal, BandMarker, PrismMark
    reactbits/             Adapted React Bits components
    visuals/               SVG diagrams: hero prism, capability dial, glyphs, closing beam
    console/               Conceptual product console and its four views
  sections/                One file per page section, in page order
docs/                      Content inventory and design system
public/favicon.svg
```

## Page sections

1. Header — sticky, scroll-spy, accessible mobile sheet
2. Hero — tagline, summary, refraction diagram of the nine capabilities
3. Statement — the mission sentence revealed on scroll
4. Platform — closing statement and the tabbed console (Overview, Traces, Prompts, Evaluations)
5. Why PRISM AI? — five pillars with line glyphs
6. Core capabilities — 9 × 5 functions with a sticky dial that follows the reader
7. Delivering business value — five outcomes
8. Built for enterprise scale — attributes and the security & governance controls
9. Closing CTA — Schedule a meeting, Partners
10. Footer — PRISM AI wordmark and copyright line

## Accessibility and performance

- Semantic landmarks, one `h1`, no skipped heading levels, skip link.
- Keyboard: visible focus rings, ARIA tabs with arrow keys in the console, focus-trapped mobile menu that closes on Escape.
- Touch targets meet WCAG 2.2 target size (24 px, or spaced inline links); menu and primary buttons are 44–48 px.
- Text contrast ≥ 4.5 : 1 for body and meta text on every surface.
- `prefers-reduced-motion` respected everywhere; content never depends on an animation finishing.
- Animated figures and scroll-revealed text expose their final value to assistive tech.
- Diagrams are SVG with an HTML label layer; looping pulses pause off-screen.
- ~147 KB gzip JS, ~12 KB gzip CSS, fonts subset by `unicode-range`. Fixed aspect ratios on visuals to avoid layout shift.

Tested at 390, 768, 1024 and 1440 px widths with no horizontal overflow.

## Known gaps

See §4 of the content inventory: no "How it works" section (the source has no workflow), no testimonials or certifications, the official Seasia logo file is not bundled, and three console views use clearly labelled sample data.

## Credits

- [Unslop](https://github.com/heydamir/unslop) by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), CC BY 4.0 — design-refinement method.
- [React Bits](https://reactbits.dev) — source of the adapted animation components (MIT + Commons Clause).
- Content © Seasia. Source: <https://www.groupseasia.com/enterprise-ai/prism-ai-governance>
