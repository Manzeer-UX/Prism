# PRISM AI — content inventory

Source: **"PRISM AI — Complete Website Content & Design Change Brief"** (MoogleLabs), received 2026-11-13. It replaces the earlier Seasia-branded copy taken from the groupseasia.com product page. Every string is in `src/content/prism.ts`; upper-case labels in the brief are set in sentence case there and styled in the components, with wording unchanged.

## 1. Brand

| Item | Value |
|---|---|
| Product | PRISM AI |
| Attribution | by MoogleLabs |
| Parent group | Part of Group Seasia |
| Positioning | Enterprise AI Governance Platform |
| Signature line | See the chain. Govern the outcome. |
| Logo | Supplied PrismAI SVG lock-up (`ui/PrismMark`, `public/favicon.svg`) |

"by Seasia" and "A Seasia AI Governance Engine" no longer appear anywhere on the site.

## 2. Brief section → site section

| Brief | Component | Notes |
|---|---|---|
| Navigation | `sections/Header` | The Platform · Why PRISM · Capabilities · Business Value · Enterprise; CTA Schedule a meeting |
| 01 Hero | `sections/Hero`, `visuals/PrismRefraction` | Headline option B; diagram has five inputs, centre descriptor, nine labelled streams and closing line |
| 02 Enterprise AI challenge | `sections/Challenge` | Headline option A; large-type scroll reveal emphasises models, agents, workflows, visibility, accountability, governance |
| 03 Introducing PRISM AI | `sections/Introducing` | Headline option C; Observe → Evaluate → Govern as three connected stages |
| 04 The platform | `sections/Platform`, `console/*` | Five tabs incl. new Analytics view; pull line added; sample-data disclaimer |
| 05 Why PRISM AI? | `sections/WhyPrism`, `visuals/PillarGlyph` | Glyphs: trace lines, evaluation graph, governance shield, cost meter, access-control layers |
| 06 Core capabilities | `sections/Capabilities` | Wheel and alternating layout kept; each group gains headline + intro |
| 07 Six dimensions | `sections/Governance`, `visuals/GovernanceHub` | Six-facet prism with PRISM AI as the centre face; facets and list rows highlight together; not called "C.O.R.E." |
| 08 G.A.T.E. Way | `sections/GateWay` | Labelled "Product direction" (publication condition) |
| 09 Business value | `sections/Value` | Large type and dividers kept; scroll emphasis per outcome |
| 10 Enterprise readiness | `sections/EnterpriseScale` | Five cards with descriptions; capability 09 control ledger |
| 11 Final CTA | `sections/ClosingCta` | Schedule a meeting · Watch the product demo; brand attribution |
| 12 Footer | `sections/Footer` | Minimal two rows: lock-up + footer nav, then © Group Seasia + descriptor and parent group. Signature line is not repeated (it sits directly above in the closing CTA) |

## 3. Sample and conceptual content (labelled on the page)

- The console is a conceptual interface. All five views use sample figures, labelled "Sample data" in the window and by the disclaimer under it.
- Analytics figures are made up but consistent with the Overview sample (model costs sum to the Overview total).

## 4. Open items before publishing

| Item | Status |
|---|---|
| Watch the demo / Watch the product demo URL | No URL supplied. `links.demo` points at the meeting scheduler |
| Explore the live platform URL | No URL supplied. `links.livePlatform` points at the meeting scheduler |
| Contact link | Points at the meeting scheduler |
| G.A.T.E. Way | Shown as "Product direction" until the workflow is implemented or demonstrable |
| Integrations (OpenAI, LangChain, LlamaIndex, OpenTelemetry) | Not shown until confirmed working |
| Security, deployment, compliance, data-residency, real-time claims | Need confirmation (brief checklist) |
| MoogleLabs consistency across demo, video and exhibition collateral | Outside this repo |

## 5. Editorial UI labels

Small labels that describe the illustrative UI rather than make product claims: console "Sample data", "System operational", chart titles not listed in the brief (Cost by model, Latency percentiles, Model performance), "Awaiting approval" / "Approved" in the G.A.T.E. Way flow, and "Scroll to explore".
