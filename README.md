# PRISM AI Governance — website

Product site for **PRISM AI — Enterprise AI Governance Platform by MoogleLabs** (part of Group Seasia), built with React, TypeScript, Vite and Tailwind CSS. All copy comes from the MoogleLabs website content brief and lives in `src/content/prism.ts`.

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
  content/prism.ts         Every string on the site, from the content brief, plus link targets
  lib/
    motion.ts              Easing, durations, stagger, rise distance
    hooks.ts               Media queries, scroll-spy, on-screen detection
  components/
    ui/                    ButtonLink, Reveal, BandMarker, PrismMark
    reactbits/             Adapted React Bits components
    visuals/               SVG diagrams: hero prism, capability dial, pillar glyphs, governance hub, closing beam
    console/               Conceptual product console and its five views
    booking/               Calendly booking overlay (native dialog) and its trigger hook
  sections/                One file per page section, in page order
docs/                      Content inventory and design system
public/favicon.svg
```

## Page sections

Order follows the brief's narrative: attention → problem → positioning → product → differentiation → capabilities → governance → agentic control → value → trust → conversion.

1. Header — PrismAI logo, "by MoogleLabs", scroll-spy nav, Schedule a meeting
2. Hero — "You built the AI. Who's governing it?", signature line, prism diagram (five ecosystem inputs → nine capability streams)
3. The enterprise AI challenge — scroll-revealed problem statement and five challenges
4. Introducing PRISM AI — positioning and the Observe → Evaluate → Govern stages
5. The platform — tabbed console (Overview, Traces, Prompts, Evaluations, Analytics) with per-tab copy
6. Why PRISM AI? — five pillars with line glyphs
7. Core capabilities — nine groups with a sticky dial that follows the reader
8. Six dimensions of AI governance — six-facet prism with PRISM AI at the centre, linked to the dimension list
9. G.A.T.E. Way — agentic approval flow, labelled "Product direction" (see below)
10. Business value — five outcomes
11. Enterprise readiness — five attributes and the security & governance controls
12. Closing CTA and footer

## Before publishing

- **Demo and live-platform links.** There is no demo URL yet, so every "Watch the demo" button is shown without a link; add the URL to `links` in `src/content/prism.ts` and pass it as `href`. `links.livePlatform` points at the Group Seasia meeting page until a real URL exists.
- **G.A.T.E. Way.** Per the brief, it is labelled "Product direction" until the approval workflow is implemented or demonstrable. Set `gateWay.status = 'available'` to drop the label, or `gateWay.show = false` to remove the section.
- **Claims.** Confirm the integration, security, deployment, compliance, data-residency and real-time claims. Integration logos (OpenAI, LangChain, LlamaIndex, OpenTelemetry) are intentionally not shown until the integrations are confirmed.

## Accessibility and performance

- Semantic landmarks, one `h1`, no skipped heading levels, skip link.
- Keyboard: visible focus rings, ARIA tabs with arrow keys in the console, focus-trapped mobile menu that closes on Escape.
- Touch targets meet WCAG 2.2 target size (24 px, or spaced inline links); menu and primary buttons are 44–48 px.
- Text contrast ≥ 4.5 : 1 for body and meta text on every surface.
- `prefers-reduced-motion` respected everywhere; content never depends on an animation finishing.
- Animated figures and scroll-revealed text expose their final value to assistive tech.
- Diagrams are SVG with an HTML label layer; looping pulses pause off-screen.
- ~155 KB gzip JS, ~13 KB gzip CSS, fonts subset by `unicode-range`. Fixed aspect ratios on visuals to avoid layout shift.

Tested at 390, 768, 1024 and 1440 px widths with no horizontal overflow.

## Known gaps

See §4 of the content inventory: confirmed demo and live-platform URLs, G.A.T.E. Way availability and verified integrations are still open. Console views use clearly labelled sample data.

## Credits

- [Unslop](https://github.com/heydamir/unslop) by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), CC BY 4.0 — design-refinement method.
- [React Bits](https://reactbits.dev) — source of the adapted animation components (MIT + Commons Clause).
- Content © Group Seasia. Source: "PRISM AI — Complete Website Content & Design Change Brief" by MoogleLabs.
