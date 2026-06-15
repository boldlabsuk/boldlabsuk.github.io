export type NavigationItem = {
  label: string
  href: string
}

export type ResearchPillar = {
  eyebrow: string
  title: string
  summary: string
  signals: string[]
}

export type Person = {
  id: string
  name: string
  role: string
  focus: string
  imageKey: 'amara' | 'marcus' | 'jules' | 'eve'
  links: {
    label: string
    href: string
  }[]
}

export type BlogPost = {
  date: string
  isoDate: string
  category: string
  title: string
  excerpt: string
  href: string
}

export type Publication = {
  year: string
  venue: string
  title: string
  authors: string
  summary: string
  links: {
    label: string
    href: string
  }[]
}

export const siteMeta = {
  name: 'BOLD',
  expandedName: 'British Open-Ended Learning & Discovery',
  strapline: 'A UK AI lab for open-ended learning systems and machine discovery.',
  mission:
    'We build open-ended AI systems that can explore, adapt, and discover alongside scientists, students, and public partners.',
}

export const navigation: NavigationItem[] = [
  { label: 'Research', href: '#research' },
  { label: 'People', href: '#people' },
  { label: 'Blog', href: '#blog' },
  { label: 'Publications', href: '#publications' },
]

export const researchPillars: ResearchPillar[] = [
  {
    eyebrow: 'Open-ended agents',
    title: 'Systems that generate their own frontier',
    summary:
      'Training loops, curricula, environments, and evaluations for agents that keep finding new skills, strategies, and questions.',
    signals: ['Autocurricula', 'Novelty search', 'Embodied tool use'],
  },
  {
    eyebrow: 'AI for discovery',
    title: 'Learning machines for scientific search',
    summary:
      'Model-guided exploration for experiments where the search space is too large for hand-designed hypotheses alone.',
    signals: ['Active learning', 'Simulation', 'Lab automation'],
  },
  {
    eyebrow: 'Evaluation and governance',
    title: 'Measure progress before scaling it',
    summary:
      'Benchmarks and auditing methods for open-ended systems, including failure discovery, reproducibility, and social impact.',
    signals: ['Capability evals', 'Safety cases', 'Public datasets'],
  },
  {
    eyebrow: 'Learning infrastructure',
    title: 'Tools students can build on',
    summary:
      'Shared datasets, environments, and experiment tooling that make ambitious student-led research faster to reproduce.',
    signals: ['Open tooling', 'Data lineage', 'Research ops'],
  },
]

export const people: Person[] = [
  {
    id: 'amara-singh',
    name: 'Amara Singh',
    role: 'PhD Student',
    focus: 'Autocurricula for language-guided agents',
    imageKey: 'amara',
    links: [
      { label: 'Profile', href: '#people-amara-singh' },
      { label: 'Research', href: '#publications' },
    ],
  },
  {
    id: 'marcus-adeyemi',
    name: 'Marcus Adeyemi',
    role: 'MSc Researcher',
    focus: 'Robotics evaluation and embodied discovery',
    imageKey: 'marcus',
    links: [
      { label: 'Profile', href: '#people-marcus-adeyemi' },
      { label: 'Research', href: '#publications' },
    ],
  },
  {
    id: 'jules-chen',
    name: 'Jules Chen',
    role: 'Undergraduate RA',
    focus: 'Interactive environments for open-ended learning',
    imageKey: 'jules',
    links: [
      { label: 'Profile', href: '#people-jules-chen' },
      { label: 'Research', href: '#publications' },
    ],
  },
  {
    id: 'eve-morrison',
    name: 'Eve Morrison',
    role: 'PhD Student',
    focus: 'Safety cases for self-improving systems',
    imageKey: 'eve',
    links: [
      { label: 'Profile', href: '#people-eve-morrison' },
      { label: 'Research', href: '#publications' },
    ],
  },
]

export const blogPosts: BlogPost[] = [
  {
    date: '15 Jun 2026',
    isoDate: '2026-06-15',
    category: 'Lab note',
    title: 'Why open-ended learning needs public evaluation',
    excerpt:
      'A short argument for measuring discovery, robustness, and governance together instead of treating them as separate workstreams.',
    href: '#blog-public-evaluation',
  },
  {
    date: '03 Jun 2026',
    isoDate: '2026-06-03',
    category: 'Field report',
    title: 'Building student-led discovery loops',
    excerpt:
      'How BOLD structures small, reproducible experiments so early researchers can contribute real frontier signal.',
    href: '#blog-student-discovery',
  },
  {
    date: '22 May 2026',
    isoDate: '2026-05-22',
    category: 'Research preview',
    title: 'From benchmark scores to behavioural portfolios',
    excerpt:
      'A preview of our internal work on richer capability profiles for agents that adapt after deployment.',
    href: '#blog-behavioural-portfolios',
  },
]

export const publications: Publication[] = [
  {
    year: '2026',
    venue: 'Workshop draft',
    title: 'Autocurricula for Tool-Using Language Agents',
    authors: 'A. Singh, J. Chen, R. Hammond',
    summary:
      'A prototype benchmark suite for measuring whether agents discover new tool-use strategies without a fixed task list.',
    links: [
      { label: 'PDF', href: '#publication-autocurricula' },
      { label: 'Code', href: '#publication-autocurricula-code' },
    ],
  },
  {
    year: '2026',
    venue: 'Preprint',
    title: 'Failure Discovery in Open-Ended Robotics Environments',
    authors: 'M. Adeyemi, E. Morrison, BOLD Lab',
    summary:
      'A methodology for surfacing brittle behaviours in embodied agents before performance metrics saturate.',
    links: [
      { label: 'PDF', href: '#publication-robotics-failures' },
      { label: 'Dataset', href: '#publication-robotics-failures-data' },
    ],
  },
  {
    year: '2025',
    venue: 'Technical report',
    title: 'Behavioural Portfolios for Continually Learning Systems',
    authors: 'E. Morrison, A. Singh',
    summary:
      'A reporting format for describing how an adaptive system changes capability, risk, and uncertainty over time.',
    links: [
      { label: 'PDF', href: '#publication-behavioural-portfolios' },
      { label: 'BibTeX', href: '#publication-behavioural-portfolios-bibtex' },
    ],
  },
  {
    year: '2025',
    venue: 'Lab memo',
    title: 'Research Operations for Reproducible Student Projects',
    authors: 'J. Chen, BOLD Lab',
    summary:
      'Practical infrastructure patterns for keeping small AI experiments inspectable, portable, and easy to extend.',
    links: [
      { label: 'PDF', href: '#publication-research-ops' },
      { label: 'Template', href: '#publication-research-ops-template' },
    ],
  },
  {
    year: '2025',
    venue: 'Position paper',
    title: 'Open-Ended Discovery as a Public Research Programme',
    authors: 'BOLD Lab',
    summary:
      'A framing paper for building AI discovery systems in a way that foregrounds students, public benefit, and shared evidence.',
    links: [
      { label: 'PDF', href: '#publication-public-programme' },
      { label: 'Slides', href: '#publication-public-programme-slides' },
    ],
  },
]
