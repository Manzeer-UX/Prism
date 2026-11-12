/**
 * PRISM AI — source-grounded content.
 *
 * Every product string in this file was extracted from the PRISM AI Governance
 * product page (SOURCE_URL) on 2026-11-12, either from the page text or from the
 * "PRISM AI Core Capabilities diagram" infographic embedded on that page.
 *
 * Casing has been normalised to sentence case for the redesign; wording is
 * unchanged. Strings that are editorial labels written for this redesign (not
 * product claims) live in `editorial` at the bottom and are listed in
 * docs/CONTENT_INVENTORY.md.
 */

export const SOURCE_URL = 'https://www.groupseasia.com/enterprise-ai/prism-ai-governance'
export const SITE_URL = 'https://www.groupseasia.com'

const site = (path: string) => `${SITE_URL}${path}`

export const product = {
  name: 'PRISM AI',
  descriptor: 'A Seasia AI Governance Engine',
  tagline: 'AI observability, prompt & evaluation governance',
  /** First sentence of the source description */
  summary: 'PRISM AI delivers complete visibility, control, evaluation, and compliance across your AI ecosystem.',
  /** Second sentence of the source description */
  mission:
    'Empowering teams to govern LLMs, agents, prompts, and data with confidence through an enterprise-grade governance platform.',
  /** Closing statement at the foot of the source page */
  statement:
    "PRISM AI is Seasia's proprietary AI Governance Engine, purpose-built for managing and governing enterprise AI systems to ensure performance, reliability, and responsible AI adoption.",
  /** The four things the source says teams govern with PRISM */
  governed: ['LLMs', 'Agents', 'Prompts', 'Data'] as const,
}

export const links = {
  scheduleMeeting: site('/partners?schedule=1'),
  partners: site('/partners'),
  sdlcTooling: site('/enterprise-ai/sdlc-tooling'),
}

export type Pillar = {
  id: string
  title: string
  body: string
}

/** "Why PRISM AI?" — five pillars, verbatim */
export const pillars: Pillar[] = [
  {
    id: 'visibility',
    title: 'Complete visibility',
    body: 'Trace every AI interaction, model call, and workflow across applications.',
  },
  {
    id: 'quality',
    title: 'Quality & reliability',
    body: 'Continuously evaluate responses and detect regressions.',
  },
  {
    id: 'governance',
    title: 'Enterprise governance',
    body: 'Enforce policies, maintain audit trails, and ensure compliance.',
  },
  {
    id: 'cost',
    title: 'Cost optimization',
    body: 'Monitor usage, tokens, and costs to optimize performance.',
  },
  {
    id: 'secure',
    title: 'Secure & compliant',
    body: 'Built for enterprise scale with role-based access and data isolation.',
  },
]

export type Capability = {
  id: string
  number: string
  title: string
  /** Short label for dense visuals (hero prism, index) — derived from the title */
  short: string
  items: [string, string, string, string, string]
}

/** "Core capabilities" — nine groups from the PRISM infographic, verbatim */
export const capabilities: Capability[] = [
  {
    id: 'observability',
    number: '01',
    title: 'AI observability & tracing',
    short: 'Observability',
    items: [
      'End-to-end request tracing',
      'Multi-step agent execution visibility',
      'Token usage, latency & cost tracking',
      'Error monitoring & root cause analysis',
      'Session & user journey tracking',
    ],
  },
  {
    id: 'prompt-governance',
    number: '02',
    title: 'Prompt governance',
    short: 'Prompts',
    items: [
      'Central prompt repository',
      'Version control & change history',
      'Environment-based deployment',
      'Prompt comparison & rollback',
      'Approval workflows & audit logs',
    ],
  },
  {
    id: 'evaluation',
    number: '03',
    title: 'Evaluation & QA',
    short: 'Evaluation',
    items: [
      'Automated & human evaluations',
      'LLM-as-a-Judge & custom metrics',
      'Hallucination & safety detection',
      'Regression testing & benchmarking',
      'Quality scorecards & trend analysis',
    ],
  },
  {
    id: 'agent-monitoring',
    number: '04',
    title: 'Agent & workflow monitoring',
    short: 'Agents',
    items: [
      'Agent execution tracking',
      'Tool usage & decision path visibility',
      'Workflow success rate & analytics',
      'Multi-agent orchestration monitoring',
      'Failure analysis & debugging',
    ],
  },
  {
    id: 'rag-governance',
    number: '05',
    title: 'RAG & knowledge governance',
    short: 'RAG & knowledge',
    items: [
      'Retrieval tracing & context analysis',
      'Source attribution & citation tracking',
      'Retrieval quality & relevance scoring',
      'Embedding & index performance',
      'Knowledge freshness monitoring',
    ],
  },
  {
    id: 'datasets',
    number: '06',
    title: 'Datasets & experiments',
    short: 'Experiments',
    items: [
      'Create & manage evaluation datasets',
      'Benchmark prompts, models & chains',
      'A/B testing & side-by-side comparison',
      'Experiment tracking & results',
      'Promote best-performing versions',
    ],
  },
  {
    id: 'analytics',
    number: '07',
    title: 'Analytics & dashboards',
    short: 'Analytics',
    items: [
      'Real-time dashboards & KPI monitoring',
      'Usage, quality, latency & cost insights',
      'Custom filters & drill-down analytics',
      'Reports for teams & leadership',
      'Exportable dashboards & reports',
    ],
  },
  {
    id: 'cost',
    number: '08',
    title: 'Cost & usage intelligence',
    short: 'Cost & usage',
    items: [
      'Token usage & cost tracking',
      'Model-wise & project-wise reporting',
      'Budget alerts & anomaly detection',
      'Cost optimization recommendations',
      'Resource utilization insights',
    ],
  },
  {
    id: 'security',
    number: '09',
    title: 'Security & governance',
    short: 'Security',
    items: [
      'Role-based access control',
      'Audit logs & activity tracking',
      'Policy enforcement & compliance',
      'Data residency & environment isolation',
      'Enterprise-grade security',
    ],
  },
]

/** "Delivering business value" — verbatim */
export const businessValue: string[] = [
  'Improve AI reliability and user trust',
  'Reduce risk and ensure compliance',
  'Accelerate AI development with confidence',
  'Optimize costs and infrastructure usage',
  'Drive continuous improvement at scale',
]

/** "Built for enterprise scale" — verbatim (titles only on the source) */
export const enterpriseScale = [
  { id: 'scalability', title: 'High scalability' },
  { id: 'deployment', title: 'Global deployment' },
  { id: 'security', title: 'Enterprise security' },
  { id: 'audit', title: 'Audit & compliance' },
  { id: 'apis', title: 'APIs & integrations' },
] as const

/**
 * The "Overview" dashboard shown on the source page. These are sample figures
 * from an illustrative product UI, not performance claims, and are labelled as
 * such wherever they are displayed.
 */
export const overviewSample = {
  stats: [
    { id: 'traces', label: 'Total traces', value: 1.23, display: '1.23M', change: '+17.3%', format: 'millions' },
    { id: 'cost', label: 'Total cost', value: 12345.67, display: '$12,345.67', change: '+8.6%', format: 'currency' },
    { id: 'latency', label: 'Avg. latency', value: 1.45, display: '1.45s', change: '+3.1%', format: 'seconds' },
    { id: 'errors', label: 'Error rate', value: 0.27, display: '0.27%', change: '+2.4%', format: 'percent' },
  ],
  topModels: [
    { name: 'GPT-4o', share: 42 },
    { name: 'Claude 3.5', share: 33 },
    { name: 'Llama 3.1', share: 25 },
  ],
  evaluationSuccessRate: 92.7,
} as const

export const seasia = {
  name: 'Seasia',
  fullName: 'Seasia Group of Companies',
  tagline: 'Engineering the Intelligent Enterprise',
}

/**
 * Editorial labels written for this redesign. They name sections or describe
 * the illustrative UI; none of them is a product claim.
 */
export const editorial = {
  nav: [
    { id: 'platform', label: 'Platform' },
    { id: 'why', label: 'Why PRISM' },
    { id: 'capabilities', label: 'Capabilities' },
    { id: 'value', label: 'Value' },
    { id: 'enterprise', label: 'Enterprise' },
  ],
  consoleNote:
    'Conceptual interface for illustration. Overview figures are reproduced from the PRISM AI product page; the other views use sample data.',
  exploreCapabilities: 'Explore capabilities',
}
