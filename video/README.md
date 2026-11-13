# PRISM AI — launch film

A 120-second cinematic launch film for **PRISM AI by MoogleLabs, a Group Seasia Company**, built as a separate React production module beside the website. Nothing in the website's build changes: the film lives in `video/` with its own `package.json`, and it reuses the site's own content (`src/content/prism.ts`), logo component (`src/components/ui/PrismMark.tsx`) and, through captured screenshots, its actual console interface.

**Signature line:** See the chain. Govern the outcome.

## Deliverables

Rendered into `video/out/` (not committed — rebuild with the steps below):

| File | What it is |
|---|---|
| `PRISM-AI_Launch-Film_1080p.mp4` | 1920 × 1080 landscape, 30 fps, H.264, full stereo mix (voiceover + music + effects) |
| `PRISM-AI_Launch-Film_1080p_NoVO.mp4` | Same picture, music and effects only — for localisation |
| `PRISM-AI_Launch-Film_EN.srt`, `.vtt` | English captions, timed to the voiceover |
| `audio/PRISM-AI_Stem_Voiceover.wav` | Voiceover stem, 48 kHz / 24-bit, placed on the timeline |
| `audio/PRISM-AI_Stem_Music.wav` | Music stem (unducked) |
| `audio/PRISM-AI_Stem_Effects.wav` | Sound-design stem |

The master is 1920 × 1080. The film is resolution-independent (text is live type, the 3D is rendered per frame, the console captures are 3× density), so `npm run render:4k` produces the same film at 3840 × 2160 if a venue needs it — on this machine that needs two browser tabs at most, or the GPU runs out of memory.

Mix: −16 LUFS integrated (ITU-R BS.1770-4), peaks held under −1 dBFS by a look-ahead limiter. Music ducks under every line by a measured amount (5–15 dB) so it always sits at least 11 dB below the voice — deepest under "Who's governing it?" and "PRISM AI.", where the narration lands on an impact. The voice, music and effects stems are delivered separately, so a localiser can lay a new voiceover over the music and effects.

## Story and timing

Eight scenes, each a separate component in `src/scenes/` and a separate composition in the Studio (`Scenes/…`), rendered exactly as they appear in the full film.

| # | Scene | Time | Component |
|---|---|---|---|
| 01 | The opening question | 0:00–0:16 | `OpeningScene` |
| 02 | The invisible AI chain | 0:16–0:29 | `InvisibleChainScene` |
| 03 | The enterprise AI challenge | 0:29–0:42.5 | `EnterpriseChallengesScene` |
| 04 | Introducing PRISM AI | 0:42.5–0:57 | `PrismRevealScene` |
| 05 | The product experience | 0:57–1:36 | `ProductExperienceScene` |
| 06 | Nine connected capabilities | 1:36–1:47 | `CapabilitiesScene` |
| 07 | Enterprise business value | 1:47–1:54 | `BusinessImpactScene` |
| 08 | The final brand reveal | 1:54–2:00 | `BrandClosingScene` |

The voiceover was recorded first and the picture was timed to it, as the brief asks. Measured narration ran a little longer than the brief's per-scene budget, so scenes 01–04 are 3 s longer and the product section is 39 s instead of 45 s; nothing was sped up beyond natural pace. `scripts/plan.mjs` is the single cue sheet: scene boundaries, where each voiceover line starts, and every shared "mark" (impacts, reveals, clicks). Cuts, impacts and on-screen words sit on a 120 BPM grid (one beat = 15 frames).

Continuity devices from the brief:

- **One recurring request** — "Can you check the status of ticket #4821?" — travels the 3D chain in 02, breaks down in 03, and is shown docked onto its trace (`agent.run`) in 05, where the `tool.call` span is `ticket.lookup`.
- **One 3D world** for 01–04 and 07–08 (`src/world/`): the same network forms, tangles, fragments, streams into the prism and leaves it as the website's nine-lane hero diagram, built in 3D. The prism is a background presence in 01–03, ignites in 04, and resolves into the official mark in 08.

## What is real and what is illustrative

- **Product interface.** Scene 05 uses screenshots of the website's console (`src/components/console/*`), captured at 3× pixel density by `scripts/capture-ui.mjs` — including real interaction states (each trace span selected, each prompt version selected). The site labels this console as a conceptual interface with sample data; the film keeps that honest with the window's own "Sample data" label and a persistent caption, "Conceptual interface · illustrative sample data". When the live platform is available, point the capture script at it and re-run; the scene reads element positions from `src/data/ui-layout.json`, so highlights follow the new layout.
- **Copy** comes from `src/content/prism.ts` (capability titles, governance dimensions) and the brief's voiceover script.
- **Not shown, deliberately:** G.A.T.E. Way approval workflows, the C.O.R.E. framework, integrations, certifications, compliance guarantees. In the prompts chapter the spotlight frames version history and comparison, not the approval or deployment controls.
- **Scene 03 call-outs** (contradicting answer, failed tool call, climbing token cost, audit trail with gaps) illustrate the problem, not PRISM output.

## Rebuild

Requires Node 20+, Microsoft Edge (used headless by the capture and audio scripts) and the website's dev server for capture.

```bash
cd video
npm install
```

1. Capture the console (website running on :5173):
   ```bash
   npm run capture -- http://localhost:5173
   ```
2. Voiceover — Kokoro-82M (Apache-2.0) via `kokoro-js`, on the CPU, first run downloads the model (~330 MB):
   ```bash
   npm run vo
   ```
   Options: `--voice af_heart` (default), e.g. `--voice am_michael` for a male narrator; `--dry` prints phonemes for pronunciation checks.
3. Resolve the cue sheet against the measured voiceover:
   ```bash
   node scripts/timeline.mjs
   ```
4. Score, sound design and mixes (Tone.js, rendered offline in headless Edge; stems are cached by content):
   ```bash
   npm run audio
   ```
5. Preview and review:
   ```bash
   npm run studio
   ```
   ```bash
   node scripts/stills.mjs 14.9s 46.5s 68.6s --scale 0.5 --sheet review
   ```
6. Final masters (resumable 600-frame chunks; each chunk is frame-checked for blank or flashing frames and re-rendered if needed):
   ```bash
   npm run render:master
   ```
7. Captions:
   ```bash
   node scripts/captions.mjs
   ```

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Composition, timeline, rendering | Remotion 4 | Frame-based throughout; every animation is a pure function of the frame |
| 3D | Three.js, React Three Fiber, `@remotion/three` | Custom shaders for nodes, connections and glow; physical glass with dispersion for the prism |
| Interface capture | Playwright (system Edge) | |
| Voice | Kokoro-82M via `kokoro-js` | Open-source, local |
| Music and effects | Tone.js, offline | Original, synthesised; no samples or library music |
| Encoding | FFmpeg (bundled with Remotion) | H.264, AAC (libfdk) 320 kb/s |
| Type | Space Grotesk, Inter, JetBrains Mono | Same Fontsource packages as the site |

Tailwind is not used inside the film: its design tokens are mirrored in `src/theme.ts`, and the one place the Tailwind UI appears — the console — is captured pixel-for-pixel from the site. GSAP and drei were not needed.

## Licences to check before publishing

- **Remotion** is free only for individuals and companies of up to three people. Group Seasia needs a [Remotion company licence](https://www.remotion.pro/license) to render this film commercially.
- Kokoro-82M and its voices: Apache-2.0. Tone.js, Three.js, React Three Fiber, Lucide: MIT/ISC. Fonts: SIL OFL.
- The voice is synthetic. If the event requires disclosure of AI-generated narration, add it to the credits or the event listing.
