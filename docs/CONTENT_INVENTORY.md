# PRISM AI — content inventory

Source page: <https://www.groupseasia.com/enterprise-ai/prism-ai-governance>
Extracted: 12 November 2026, from the page text and from the embedded image
`prism-infographic-BIe6KPh3.png` ("PRISM AI Core Capabilities diagram").

All product wording lives in [`src/content/prism.ts`](../src/content/prism.ts). Wording is verbatim;
casing was normalised to sentence case ("COMPLETE VISIBILITY" → "Complete visibility").

## 1. Source structure, in order

| # | Source block | What it contains |
|---|---|---|
| A | Back link | "← Back to SDLC Tooling" → `/enterprise-ai/sdlc-tooling` |
| B | Title block | "PRISM AI" · "A Seasia AI Governance Engine" · "AI Observability, Prompt & Evaluation Governance" · two-sentence description |
| C | Overview dashboard (illustrative UI) | System Operational · Total Traces 1.23M (+17.3%) · Total Cost $12,345.67 (+8.6%) · Avg. Latency 1.45s (+3.1%) · Error Rate 0.27% (+2.4%) · Traces over time chart · Top models by usage: GPT-4o 42%, Claude 3.5 33%, Llama 3.1 25% · Evaluation success rate 92.7% |
| D | Why PRISM AI? | Five pillars with one sentence each |
| E | Core capabilities infographic | Nine numbered groups, five items each |
| F | Delivering business value | Five outcome statements |
| G | Built for enterprise scale | Five titles (no descriptions) + "Model system performance · Live" bar chart (no values) |
| H | Closing statement | "PRISM AI is Seasia's proprietary AI Governance Engine, purpose-built for…" + Seasia logo |
| I | Site chrome | Seasia logo, sidebar navigation, "Partners", "Schedule a Meeting" (`/partners?schedule=1`), tagline "Engineering the Intelligent Enterprise" |

## 2. Mapping to the redesign

| Redesign section | Component | Source | Notes |
|---|---|---|---|
| 01 Header | `sections/Header.tsx` | I | Nav labels are editorial anchors to on-page sections. Primary CTA = source "Schedule a Meeting". |
| 02 Hero | `sections/Hero.tsx`, `visuals/PrismRefraction.tsx` | A, B | H1 = tagline; body = description sentence 1; breadcrumb keeps the back link to SDLC Tooling. The diagram uses the four governed subjects (from description sentence 2) and the nine capability names (E). |
| 03 Statement ("What PRISM AI governs") | `sections/Statement.tsx` | B | Description sentence 2, revealed on scroll. Stands in for the brief's "Challenge" section — see §4. |
| 04 Introducing PRISM | `sections/Platform.tsx`, `console/*` | H, C | Closing statement split into heading + body. Overview tab reproduces block C exactly; other tabs are conceptual (see §3). |
| 05 Why PRISM AI? | `sections/WhyPrism.tsx`, `visuals/PillarGlyph.tsx` | D | All five pillars verbatim. Line glyphs illustrate each sentence; they contain no data. |
| 06 Core capabilities | `sections/Capabilities.tsx`, `visuals/SpectrumRing.tsx` | E | All 9 × 5 items verbatim, numbered as in the infographic (01–09, items 01.1–01.5…). |
| 07 Business value | `sections/Value.tsx` | F | All five statements verbatim. |
| 08 Trust & security | `sections/EnterpriseScale.tsx` | G, E-09, D | Five enterprise-scale titles; capability 09 "Security & governance" items; pillars "Secure & compliant" and "Enterprise governance". |
| 09 Closing CTA | `sections/ClosingCta.tsx` | B, I | Heading is the clause "govern LLMs, agents, prompts, and data with confidence" from description sentence 2. Actions: Schedule a Meeting, Partners. |
| 10 Footer | `sections/Footer.tsx` | I | PRISM AI wordmark and a copyright line only: "© {current year} Seasia Group of Companies. All rights reserved." Seasia site links were removed at the client's request. |

## 3. Sample and conceptual content (clearly labelled on the page)

| Where | What | Status |
|---|---|---|
| Console → Overview | All figures from block C | **Source sample data.** These come from the illustrative dashboard on the product page; they are not performance claims. The console carries a "Sample data" label and a caption saying so. |
| Console → Overview chart | Line shape and Mon–Sun axis | Illustrative — the source chart has no axis values. |
| Console → Traces | Span names, durations, tokens, cost, tool name | **Conceptual sample**, written for this redesign to illustrate capabilities 01, 04 and 05. |
| Console → Prompts | Prompt name `support-reply`, versions, authors, dates, diff text | **Conceptual sample** illustrating capability 02. Author initials are fictional. |
| Console → Evaluations | Criteria scores, run counts | **Conceptual sample** illustrating capabilities 03 and 06. Only "Evaluation success rate 92.7%" comes from the source. |

## 4. Missing or unverified content

The brief allowed several sections only if the source supports them. These were checked and handled as follows:

| Brief item | Source support | Decision |
|---|---|---|
| "Enterprise AI governance challenge" | No problem statement on the PRISM page | Not invented. The slot is filled by the source's own mission sentence (Statement section). |
| "How PRISM works" workflow | No workflow or implementation steps on the source | **Omitted.** No process stages were invented. |
| Real product screenshots | None — only an illustrative dashboard | Console built as a labelled conceptual interface. |
| Statistics / outcomes figures | None beyond the sample dashboard | No outcome numbers shown outside the labelled console. |
| Testimonials, customer logos | None | Omitted. |
| Certifications, regulatory compliance | Not stated for PRISM | No certification or compliance guarantee is made. "Policy enforcement & compliance" and "Audit & compliance" appear only as the source's own capability names. |
| Named integrations | Only the title "APIs & Integrations" | No integration names listed. |
| Descriptions for "Built for enterprise scale" items | Titles only on the source | Shown as titles only. |
| "Model system performance · Live" chart | Decorative bars with no values or labels | **Omitted** — it carries no information and "Live" would imply real data. |
| Official logo files | Seasia logo at `https://www.groupseasia.com/assets/seasia.logo-BhiTrpKE.svg` | Not bundled (not downloaded). The footer shows the PRISM AI wordmark. To add the official Seasia mark, place it at `src/assets/seasia-logo.svg` and render it next to the wordmark in `Footer.tsx`. |
| PRISM icon | Source uses a sparkle glyph next to "PRISM AI" | Replaced by a flat prism glyph (`ui/PrismMark.tsx`) — a design decision, not a brand change. Revert if the sparkle is a required brand asset. |
| Legal footer (copyright, privacy, contact) | Not present on the source page | Copyright line added at the client's request. The holder name "Seasia Group of Companies" comes from the source logo's alt text (the page metadata names "Seasia Infotech") — **confirm the legal entity name** before launch. No privacy or contact links were added. |

## 5. Editorial labels written for this redesign

None of these are product claims. They name sections, guide navigation or describe the illustration.

- Navigation: Platform, Why PRISM, Capabilities, Value, Enterprise
- Section labels: "What PRISM AI governs", "The platform", "Five pillars", "Platform capabilities", "Outcomes", "Trust & security"
- Diagram labels: "Your AI ecosystem", "Core capabilities" (source heading), short capability names (Observability, Prompts, Evaluation, Agents, RAG & knowledge, Experiments, Analytics, Cost & usage, Security)
- Capabilities intro: "Nine capability groups, from tracing and prompt control to evaluation, cost and security, across LLMs, agents, prompts, and data."
- Buttons and cues: "Explore capabilities", "Scroll to explore"
- Console caption: "Conceptual interface for illustration. Overview figures are reproduced from the PRISM AI product page; the other views use sample data."
