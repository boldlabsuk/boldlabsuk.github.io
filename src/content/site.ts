import type { NavigationItem } from './types.ts'

export const siteMeta = {
  name: 'BOLD Lab',
  shortName: 'BOLD',
  expandedName: 'British Open-Ended Learning & Discovery Lab',
  description:
    'A focused, critical-mass AI research lab across Oxford, UCL, and Imperial pursuing fundamental AI breakthroughs from Britain.',
  missionPhrase: 'Building the next AI paradigm.',
  mission:
    'BOLD brings together key researchers in fundamental AI from Oxford, UCL, and Imperial College into one focused, critical-mass UK AI Research Lab, dedicated to paradigm breaking discoveries in fundamental AI. Our initial research pillars are Beyond Backpropagation, Human-Centric Learning & Discovery, and Embodied AI.',
  identity:
    'Our lab brings together three leading university AI labs into a single collaborative research environment. We combine academic depth, engineering excellence, and long-term scientific ambition.',
  statement:
    'We bring together researchers across universities to build a unified AI research lab with the scale, ambition, and depth needed for the next generation of AI.',
  fundingAcknowledgement:
    'Supported by funding from the Engineering and Physical Sciences Research Council (EPSRC).',
  contactEmail: 'contact@example.ac.uk',
  copyrightYear: '2026',
  socialLinks: [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/company/british-open-ended-learning-discovery-lab',
    },
    { label: 'X', href: 'https://x.com/bold_lab_ai' },
  ],
}

export const homepageContent = {
  hero: {
    eyebrow: siteMeta.expandedName,
    headline: siteMeta.missionPhrase,
    lede: siteMeta.mission,
    actions: [
      { label: 'Join BOLD', href: '/opportunities' },
      { label: 'Meet the team', href: '/people' },
    ],
  },
  proofMetrics: [
    {
      value: '3',
      label: 'Universities',
      detail: 'Oxford, UCL, and Imperial working as one lab.',
    },
    {
      value: '2',
      label: 'Bets',
      detail: 'Breakthroughs remain possible, and academia needs a new model.',
    },
    {
      value: '3',
      label: 'Research Directions',
      detail: 'A focused programme for open-ended learning and discovery.',
    },
  ],
  labBet: [
    {
      title: 'Fundamental AI breakthroughs are still possible.',
      body: 'The current scale-only paradigm is powerful, but it is not the end of AI. Fundamental AI breakthroughs are still possible through new learning principles, discovery systems, and embodied intelligence.',
    },
    {
      title: 'Academia needs a new operating model to pursue them.',
      body: 'Britain has exceptional AI talent, but paradigm-changing work needs a focused, agile, critical-mass lab where researchers, engineers, students, and fellows build under one ambitious research vision.',
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
}

export const navigation: NavigationItem[] = [
  { label: 'Our People', href: '/people' },
  { label: 'Opportunities', href: '/opportunities' },
]
