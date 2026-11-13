/**
 * PRISM AI — site content.
 *
 * Source: "PRISM AI — Complete Website Content & Design Change Brief" (MoogleLabs),
 * received 2026-11-13. Every string below is taken from that brief. Upper-case
 * labels in the brief are set in sentence case here and styled by the
 * components; wording is unchanged.
 *
 * Section order follows the brief's recommended narrative:
 * attention → problem → positioning → product experience → differentiation →
 * capabilities → governance → agentic control → business value →
 * enterprise trust → conversion.
 */

export const SITE_URL = 'https://www.groupseasia.com'

const site = (path: string) => `${SITE_URL}${path}`

export const brand = {
  name: 'PRISM AI',
  by: 'MoogleLabs',
  byline: 'by MoogleLabs',
  parent: 'Part of Group Seasia',
  copyrightHolder: 'Group Seasia',
  positioning: 'Enterprise AI Governance Platform',
  /** Replaces the old "A Seasia AI Governance Engine" descriptor */
  descriptor: 'Enterprise AI Governance Platform by MoogleLabs',
  signature: 'See the chain. Govern the outcome.',
  pillarsLine: 'AI observability · Evaluation · Governance',
}

/**
 * Link destinations. `demo` and `livePlatform` have no confirmed URL yet, so
 * they point at the meeting scheduler, which is the working way to get a demo
 * today. Swap in the real URLs here when they exist; every button reads from
 * this object.
 */
export const links = {
  scheduleMeeting: site('/partners?schedule=1'),
  demo: site('/partners?schedule=1'),
  livePlatform: site('/partners?schedule=1'),
  contact: site('/partners?schedule=1'),
}

export const nav = [
  { id: 'platform', label: 'The Platform' },
  { id: 'why', label: 'Why PRISM' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'value', label: 'Business Value' },
  { id: 'enterprise', label: 'Enterprise' },
] as const

export const footerNav = [
  { href: '#platform', label: 'The Platform' },
  { href: '#why', label: 'Why PRISM' },
  { href: '#capabilities', label: 'Capabilities' },
  { href: '#governance', label: 'Governance' },
  { href: '#enterprise', label: 'Enterprise' },
  { href: links.contact, label: 'Contact' },
] as const

export const cta = {
  scheduleMeeting: 'Schedule a meeting',
  explorePlatform: 'Explore the platform',
  watchDemo: 'Watch the demo',
  watchProductDemo: 'Watch the product demo',
  exploreLivePlatform: 'Explore the live platform',
}

/* ------------------------------------------------------------------ 01 */

export const hero = {
  title: "You built the AI. Who's governing it?",
  lines: [
    'Every prompt. Every model. Every agent. Every decision.',
    'Bring your entire AI ecosystem into view with PRISM AI.',
  ],
  diagram: {
    inputsLabel: 'Your AI ecosystem',
    inputs: ['LLMs', 'Agents', 'Prompts', 'Tools', 'Data'],
    centreLabel: 'PRISM AI',
    centreDescriptor: 'The intelligence control plane',
    outputsLabel: 'Nine governance capabilities',
    closingLine: 'From the first prompt to the final response, bring your AI ecosystem into focus.',
  },
}

/* ------------------------------------------------------------------ 02 */

export type Challenge = { id: string; label: string; question: string; body: string }

export const challenge = {
  eyebrow: 'The enterprise AI challenge',
  title: 'Your AI is getting smarter. But can you control it?',
  /** Set large and revealed word by word on scroll */
  reveal:
    'As enterprises scale AI across models, agents and workflows, visibility, accountability and governance become critical.',
  revealEmphasis: ['models', 'agents', 'workflows', 'visibility', 'accountability', 'governance'],
  body: [
    'What begins as a simple model interaction quickly becomes an interconnected ecosystem of prompts, autonomous agents, tools, retrieval systems and decisions.',
    'PRISM AI brings visibility, accountability and governance together in one unified control plane.',
  ],
  items: [
    {
      id: 'execution',
      label: 'The invisible execution',
      question: 'What happened between the prompt and the response?',
      body: 'Understand the model calls, agent steps, tool invocations and retrieval activities behind an AI interaction.',
    },
    {
      id: 'moving-target',
      label: 'The moving target',
      question: 'AI systems never stand still.',
      body: 'Prompts evolve. Models change. Workflows become more complex. Maintain visibility into changes and their impact on AI performance.',
    },
    {
      id: 'quality',
      label: 'The quality question',
      question: 'Is the output accurate, relevant and reliable?',
      body: 'Evaluate AI responses and identify regressions before they affect the user experience.',
    },
    {
      id: 'cost',
      label: 'The cost of complexity',
      question: 'Where is your AI expenditure going?',
      body: 'Understand token consumption, model usage, latency and operational costs.',
    },
    {
      id: 'governance',
      label: 'The governance gap',
      question: 'Who accessed what? Which actions were taken? Where is the audit trail?',
      body: 'Bring accountability and oversight into AI operations.',
    },
  ] satisfies Challenge[],
  closing: [
    'You cannot effectively govern what you cannot observe.',
    'And you cannot confidently scale what you cannot evaluate.',
  ],
}

/* ------------------------------------------------------------------ 03 */

export const introducing = {
  eyebrow: 'Introducing PRISM AI',
  title: 'AI at scale demands more than intelligence. It demands control.',
  body: [
    'PRISM AI is an enterprise AI governance platform by MoogleLabs, designed to help organisations observe, evaluate and govern AI systems through one unified platform.',
    'From individual model interactions to multi-agent workflows, prompt performance, retrieval activity and operational expenditure, PRISM brings critical AI intelligence into one operational view.',
  ],
  stages: ['Observe', 'Evaluate', 'Govern'],
  summary: 'One platform. Nine capability groups. Greater visibility across your AI ecosystem.',
}

/* ------------------------------------------------------------------ 04 */

export type ConsoleTab = {
  id: 'overview' | 'traces' | 'prompts' | 'evaluations' | 'analytics'
  label: string
  headline: string
  body: string
}

export const platform = {
  eyebrow: 'The platform',
  title: 'Your AI ecosystem. One unified view of its operations.',
  body: [
    'PRISM AI helps organisations understand, evaluate and govern AI-powered applications and agentic workflows.',
    'From individual model interactions to multi-agent execution, prompt performance, retrieval activity and operational expenditure, PRISM brings critical AI intelligence into a consolidated operational view.',
  ],
  pullLine: "Don't just look at the output. Look at what happened behind it.",
  tabs: [
    {
      id: 'overview',
      label: 'Overview',
      headline: 'The bigger picture, without the blind spots.',
      body: 'Monitor AI activity, performance, latency, errors and usage through consolidated dashboards.',
    },
    {
      id: 'traces',
      label: 'Traces',
      headline: 'Follow the execution.',
      body: 'Explore model interactions, individual trace events, agent steps and tool invocations to understand how an AI workflow unfolds.',
    },
    {
      id: 'prompts',
      label: 'Prompts',
      headline: 'Control the instructions behind the intelligence.',
      body: 'Manage prompt versions, track changes and connect prompt operations to execution performance.',
    },
    {
      id: 'evaluations',
      label: 'Evaluations',
      headline: 'Put AI output to the test.',
      body: 'Assess quality through automated evaluations, custom metrics and human feedback.',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      headline: 'Turn AI activity into intelligence.',
      body: 'Understand usage patterns, model performance, latency and associated costs.',
    },
  ] satisfies ConsoleTab[],
  disclaimer:
    'Conceptual interface for illustration. Sample dashboard metrics are illustrative and do not represent actual production usage figures.',
}

/**
 * Sample figures for the illustrative console. Not performance claims; the
 * console labels them as sample data wherever they appear.
 */
export const overviewSample = {
  stats: [
    { id: 'traces', label: 'Total traces', value: 1.23, display: '1.23M', change: '+17.3%' },
    { id: 'cost', label: 'Total cost', value: 12345.67, display: '$12,345.67', change: '+8.6%' },
    { id: 'latency', label: 'Average latency', value: 1.45, display: '1.45s', change: '+3.1%' },
    { id: 'errors', label: 'Error rate', value: 0.27, display: '0.27%', change: '+2.4%' },
  ],
  topModels: [
    { name: 'GPT-4o', share: 42 },
    { name: 'Claude 3.5', share: 33 },
    { name: 'Llama 3.1', share: 25 },
  ],
  evaluationSuccessRate: 92.7,
} as const

/* ------------------------------------------------------------------ 05 */

export type Pillar = { id: string; title: string; headline: string; body: string }

export const why = {
  eyebrow: 'Why PRISM AI?',
  title: 'Because intelligence without visibility is a blind spot.',
  body: 'As AI systems become more interconnected, enterprises need more than model performance metrics. They need visibility across execution, quality, cost and governance. PRISM AI brings these essential dimensions together.',
  closing: ['From visibility to accountability.', 'From experimentation to governed operations.'],
}

export const pillars: Pillar[] = [
  {
    id: 'visibility',
    title: 'Complete visibility',
    headline: 'See beyond the response.',
    body: 'Trace AI interactions, model calls, agent execution and workflows across applications.',
  },
  {
    id: 'quality',
    title: 'Quality & reliability',
    headline: "Don't assume AI is performing. Measure it.",
    body: 'Continuously evaluate responses, identify quality issues and detect performance regressions.',
  },
  {
    id: 'governance',
    title: 'Enterprise governance',
    headline: 'Establish control across the AI lifecycle.',
    body: 'Support structured oversight through policies, access controls, approval workflows and audit trails.',
  },
  {
    id: 'cost',
    title: 'Cost intelligence',
    headline: 'Understand what your AI is costing.',
    body: 'Monitor token consumption, model usage, latency and operational expenditure to identify optimisation opportunities.',
  },
  {
    id: 'security',
    title: 'Security & accountability',
    headline: 'Make every interaction more accountable.',
    body: 'Support enterprise governance through role-based access, activity tracking and environment-level controls.',
  },
]

/* ------------------------------------------------------------------ 06 */

export type Capability = {
  id: string
  number: string
  title: string
  /** Short label for dense visuals (hero prism, dial index, console links) */
  short: string
  headline: string
  intro: string
  items: [string, string, string, string, string]
}

export const capabilitiesIntro = {
  eyebrow: 'Core capabilities',
  title: 'Nine capabilities. One governed ecosystem.',
  lead: 'Every layer of AI has a story. PRISM helps you read it.',
  body: 'Nine capability groups bring visibility, measurement and governance across LLMs, agents, prompts and enterprise data.',
}

export const capabilities: Capability[] = [
  {
    id: 'observability',
    number: '01',
    title: 'AI observability & tracing',
    short: 'Observability',
    headline: "Don't just see the answer. Trace the journey.",
    intro: 'Understand how AI applications execute, interact and perform.',
    items: [
      'End-to-end request tracing',
      'Multi-step agent execution visibility',
      'Token usage, latency and cost tracking',
      'Error monitoring and root-cause analysis',
      'Session and user-journey tracking',
    ],
  },
  {
    id: 'prompt-governance',
    number: '02',
    title: 'Prompt governance',
    short: 'Prompt governance',
    headline: 'Every instruction matters. Every change should be traceable.',
    intro: 'Bring structure, visibility and control to the prompts driving AI applications.',
    items: [
      'Central prompt repository',
      'Version control and change history',
      'Environment-based deployment',
      'Prompt comparison and rollback',
      'Approval workflows and audit logs',
    ],
  },
  {
    id: 'evaluation',
    number: '03',
    title: 'Evaluation & quality assurance',
    short: 'Evaluation',
    headline: "Don't assume AI is performing. Measure it.",
    intro: 'Continuously assess AI outputs and identify quality issues through automated and human evaluations.',
    items: [
      'Automated and human evaluations',
      'LLM-as-a-Judge and custom metrics',
      'Hallucination and safety detection',
      'Regression testing and benchmarking',
      'Quality scorecards and trend analysis',
    ],
  },
  {
    id: 'agent-monitoring',
    number: '04',
    title: 'Agent & workflow monitoring',
    short: 'Agent monitoring',
    headline: 'When agents act, make every step visible.',
    intro: 'Understand how autonomous and multi-agent workflows execute, interact and perform.',
    items: [
      'Agent execution tracking',
      'Tool usage and decision-path visibility',
      'Workflow success-rate analytics',
      'Multi-agent orchestration monitoring',
      'Failure analysis and debugging',
    ],
  },
  {
    id: 'rag-governance',
    number: '05',
    title: 'RAG & knowledge governance',
    short: 'RAG & knowledge',
    headline: 'Better answers begin with better context.',
    intro: 'Understand the information retrieved by AI systems and how that context influences their outputs.',
    items: [
      'Retrieval tracing and context analysis',
      'Source attribution and citation tracking',
      'Retrieval quality and relevance scoring',
      'Embedding and index performance',
      'Knowledge freshness monitoring',
    ],
  },
  {
    id: 'datasets',
    number: '06',
    title: 'Datasets & experiments',
    short: 'Experiments',
    headline: 'Test the possibilities before they reach production.',
    intro: 'Turn evaluation datasets and experiments into a structured approach to improving AI performance.',
    items: [
      'Create and manage evaluation datasets',
      'Benchmark prompts, models and chains',
      'A/B testing and side-by-side comparison',
      'Experiment tracking and results',
      'Promote best-performing versions',
    ],
  },
  {
    id: 'analytics',
    number: '07',
    title: 'Analytics & dashboards',
    short: 'Analytics',
    headline: 'Turn AI activity into actionable intelligence.',
    intro: 'Bring operational metrics together to understand the health and performance of your AI ecosystem.',
    items: [
      'Real-time dashboards and KPI monitoring',
      'Usage, quality, latency and cost insights',
      'Custom filters and drill-down analytics',
      'Reports for teams and leadership',
      'Exportable dashboards and reports',
    ],
  },
  {
    id: 'cost',
    number: '08',
    title: 'Cost & usage intelligence',
    short: 'Cost intelligence',
    headline: 'Every token has a cost. Make every metric count.',
    intro: 'Understand where AI expenditure goes and identify opportunities for optimisation.',
    items: [
      'Token usage and cost tracking',
      'Model-wise and project-wise reporting',
      'Budget alerts and anomaly detection',
      'Cost optimisation recommendations',
      'Resource utilisation insights',
    ],
  },
  {
    id: 'security',
    number: '09',
    title: 'Security & governance',
    short: 'Security & governance',
    headline: 'Trust requires visibility. Accountability requires control.',
    intro: 'Support enterprise AI governance with access management, activity tracking and policy controls.',
    items: [
      'Role-based access control',
      'Audit logs and activity tracking',
      'Policy enforcement and compliance',
      'Data residency and environment isolation',
      'Enterprise security controls',
    ],
  },
]

/* ------------------------------------------------------------------ 07 */

export type Dimension = { id: string; number: string; title: string; body: string }

export const governance = {
  eyebrow: 'Six dimensions of AI governance',
  title: 'Visibility is the beginning. Governance is the objective.',
  body: [
    'Understanding AI activity is only one part of responsible AI operations.',
    'Enterprises also need the ability to evaluate behaviour, manage exposure, establish accountability and maintain oversight as AI systems evolve.',
  ],
  lead: 'PRISM AI brings together six essential governance dimensions.',
  closing: 'A more observable, more measurable, more governable AI ecosystem.',
  dimensions: [
    {
      id: 'governance',
      number: '01',
      title: 'Governance',
      body: 'Establish oversight and structured control across AI systems and workflows.',
    },
    {
      id: 'security',
      number: '02',
      title: 'Security',
      body: 'Support security monitoring and controls across AI interactions.',
    },
    {
      id: 'compliance',
      number: '03',
      title: 'Compliance',
      body: 'Maintain auditability, policy alignment and governance visibility.',
    },
    {
      id: 'observability',
      number: '04',
      title: 'Observability',
      body: 'Understand execution paths, behaviour and operational performance.',
    },
    { id: 'risk', number: '05', title: 'Risk', body: 'Monitor operational, behavioural and financial exposure.' },
    {
      id: 'evaluation',
      number: '06',
      title: 'Evaluation',
      body: 'Continuously assess the quality, reliability and performance of AI outputs.',
    },
  ] satisfies Dimension[],
}

/* ------------------------------------------------------------------ 08 */

export type GateStep = { id: string; number: string; title: string; body: string }

export const gateWay = {
  /**
   * Publication condition from the brief: show G.A.T.E. Way as a product
   * capability only once the agent approval workflow is implemented or can be
   * demonstrated. Until then it is labelled as a product direction.
   * Set `status` to 'available' to drop the label, or `show` to false to
   * remove the section and its nav link.
   */
  show: true,
  status: 'direction' as 'direction' | 'available',
  directionLabel: 'Product direction',
  eyebrow: 'Agentic governance',
  title: 'Autonomy needs checkpoints. Not blind trust.',
  name: 'G.A.T.E. Way',
  expansion: 'Governed Agentic Trace & Evaluation',
  body: [
    'As AI agents move beyond answering questions and begin executing multi-step actions, visibility and oversight become increasingly important.',
    'G.A.T.E. Way connects agent execution tracing and evaluation with human approval workflows for high-impact actions.',
  ],
  flowLabel: 'From autonomous execution to governed action',
  steps: [
    { id: 'execute', number: '01', title: 'Execute', body: 'An agent begins its assigned workflow.' },
    {
      id: 'trace',
      number: '02',
      title: 'Trace',
      body: 'Execution steps, interactions and tool invocations are captured.',
    },
    {
      id: 'evaluate',
      number: '03',
      title: 'Evaluate',
      body: 'The workflow is assessed against relevant checks and conditions.',
    },
    {
      id: 'validate',
      number: '04',
      title: 'Validate',
      body: 'High-impact actions can be routed through human approval gates.',
    },
    {
      id: 'continue',
      number: '05',
      title: 'Continue',
      body: 'Approved execution proceeds with its operational history retained.',
    },
  ] satisfies GateStep[],
  closing: ['Automation with visibility.', 'Autonomy with accountability.'],
}

/* ------------------------------------------------------------------ 09 */

export type Outcome = { id: string; label: string; headline: string; body: string }

export const value = {
  eyebrow: 'Business value',
  title: 'Make AI operationally accountable. Make enterprise adoption more confident.',
  body: 'PRISM AI helps turn AI activity into actionable operational intelligence, enabling organisations to improve reliability, strengthen oversight and make more informed decisions.',
  outcomes: [
    {
      id: 'reliability',
      label: 'Reliability',
      headline: 'Improve AI reliability and user trust.',
      body: 'Improve confidence in AI outputs through continuous evaluation, monitoring and quality assessment.',
    },
    {
      id: 'risk',
      label: 'Risk management',
      headline: 'Reduce risk and strengthen governance.',
      body: 'Support oversight through traceability, auditability and governance workflows.',
    },
    {
      id: 'velocity',
      label: 'Development velocity',
      headline: 'Accelerate AI development with confidence.',
      body: 'Support faster experimentation and structured evaluation of prompts, models and workflows.',
    },
    {
      id: 'cost',
      label: 'Cost visibility',
      headline: 'Optimise AI expenditure and infrastructure usage.',
      body: 'Understand model consumption, token usage and expenditure across AI operations.',
    },
    {
      id: 'improvement',
      label: 'Continuous improvement',
      headline: 'Turn operational intelligence into progress.',
      body: 'Use operational insights and evaluation results to improve AI systems over time.',
    },
  ] satisfies Outcome[],
}

/* ------------------------------------------------------------------ 10 */

export const enterprise = {
  eyebrow: 'Enterprise readiness',
  title: 'Built around the realities of enterprise AI.',
  body: [
    'AI governance must work within the environments enterprises already operate.',
    'PRISM AI is designed to support enterprise requirements around integration, deployment flexibility, operational visibility and governance.',
  ],
  attributes: [
    {
      id: 'scalability',
      title: 'High scalability',
      body: 'An architecture designed to support growing AI workloads and operational demands.',
    },
    {
      id: 'deployment',
      title: 'Deployment flexibility',
      body: 'Deployment options aligned with enterprise infrastructure and data-residency requirements.',
    },
    { id: 'security', title: 'Enterprise security', body: 'Access controls and environment-level governance.' },
    { id: 'audit', title: 'Audit & compliance', body: 'Activity tracking, audit logs and governance visibility.' },
    {
      id: 'apis',
      title: 'APIs & integrations',
      body: 'Support for relevant LLM providers, AI development frameworks and observability standards.',
    },
  ],
} as const

/* ------------------------------------------------------------------ 11 */

export const closing = {
  eyebrow: 'More models. More agents. More interactions. More decisions.',
  title: 'Your AI ecosystem will keep evolving. Your governance should keep pace.',
  body: 'The question is whether your organisation will have the visibility and governance to keep pace.',
  focus: 'Bring your AI ecosystem into focus with PRISM AI.',
  attribution: 'PRISM AI — An Enterprise AI Governance Platform by MoogleLabs. Part of Group Seasia.',
}
