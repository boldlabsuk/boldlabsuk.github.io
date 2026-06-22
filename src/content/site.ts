import type { NavigationItem } from './types.ts'

export const siteMeta = {
  name: 'BOLD Institute',
  shortName: 'BOLD',
  expandedName: 'British Open-Ended Learning & Discovery Institute',
  description:
    'A focused, critical-mass AI research institute across Oxford, UCL, and Imperial pursuing fundamental AI breakthroughs from Britain.',
  missionPhrase: 'Build the next paradigm in AI.',
  mission:
    'BOLD brings Oxford, UCL, and Imperial into one focused, critical-mass AI research institute pursuing fundamental breakthroughs from Britain.',
  identity:
    'Our institute brings together three leading university AI labs into a single collaborative research environment. We combine academic depth, engineering excellence, and long-term scientific ambition.',
  statement:
    'We bring together researchers across universities to build a unified AI research institution with the scale, ambition, and depth needed for the next generation of AI.',
  contactEmail: 'contact@example.ac.uk',
  copyrightYear: '2026',
  socialLinks: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com' },
    { label: 'GitHub', href: 'https://github.com' },
    { label: 'X', href: 'https://x.com' },
  ],
}

export const homepageContent = {
  hero: {
    eyebrow: siteMeta.expandedName,
    headline: siteMeta.missionPhrase,
    lede: siteMeta.mission,
    actions: [
      { label: 'Join BOLD', href: '/opportunities' },
      { label: 'Partner with us', href: '/opportunities#collaborators' },
    ],
  },
  proofMetrics: [
    {
      value: '3',
      label: 'universities',
      detail: 'Oxford, UCL, and Imperial working as one institute.',
    },
    {
      value: '37m GBP+',
      label: 'committed industry co-investment',
      detail: 'Serious backing for ambitious, long-horizon research.',
    },
    {
      value: '3',
      label: 'Research Directions',
      detail: 'A focused programme for open-ended learning and discovery.',
    },
  ],
  instituteBet: [
    {
      title: 'Fundamental AI breakthroughs are still possible.',
      body:
        'The current scale-only paradigm is powerful, but it is not the end of AI. Fundamental AI breakthroughs are still possible through new learning principles, discovery systems, and embodied intelligence.',
    },
    {
      title: 'Academia needs a new operating model to pursue them.',
      body:
        'Britain has exceptional AI talent, but paradigm-changing work needs a focused, agile, critical-mass lab where researchers, engineers, students, and fellows build under one ambitious research vision.',
    },
  ],
  researchDirections: [
    {
      name: 'Beyond Backpropagation',
      description:
        'New learning methods for settings where gradients are unavailable, unreliable, or a poor fit for the hardware and environment.',
    },
    {
      name: 'Human-Centric Learning & Discovery',
      description:
        'AI systems that collaborate with people and support multi-agent discovery rather than treating humans as data sources.',
    },
    {
      name: 'Embodied Learning',
      description:
        'Resource-agile systems for autonomous skill discovery, resilient adaptation, and deployment beyond the datacentre.',
    },
  ],
  credibility: {
    eyebrow: 'Operational Credibility',
    headline: 'Built to execute from day 0.',
    statement:
      'A single focused, critical-mass agile lab under one ambitious research vision: the next AI paradigm built from Britain.',
    points: [
      'High-impact collaborative research at institute scale.',
      'Frontier lab and startup experience in the operating model.',
      'Open-source and open-science commitment for public-interest progress.',
      'A lean merger model that turns university depth into one coherent lab.',
    ],
  },
}

export const navigation: NavigationItem[] = [
  { label: 'Our People', href: '/people' },
  { label: 'Opportunities', href: '/opportunities' },
]
