export type NavigationItem = {
  label: string
  href: string
}

export type PersonLinkSet = {
  website?: string
  googleScholar?: string
  linkedin?: string
  github?: string
  twitter?: string
  email?: string
}

export type Person = {
  slug: string
  name: string
  role: string
  group: string
  affiliation?: string
  bio: string
  image?: string
  researchAreas: string[]
  links?: PersonLinkSet
  featured?: boolean
  alumni?: boolean
}

export type NewsPostType =
  | 'blog'
  | 'news'
  | 'article'
  | 'announcement'
  | 'research-update'
  | 'social-post'

export type NewsPost = {
  slug: string
  title: string
  type: NewsPostType
  date: string
  excerpt: string
  authorIds?: string[]
  tags: string[]
  image?: string
  featured?: boolean
  externalUrl?: string
  content?: string
  socialEmbedUrl?: string
}

export type PaperType =
  | 'conference'
  | 'journal'
  | 'preprint'
  | 'workshop'
  | 'technical-report'
  | 'dataset'
  | 'benchmark'
  | 'software'
  | 'thesis'
  | 'other'

export type Paper = {
  id: string
  title: string
  authors: string[]
  authorIds?: string[]
  venue?: string
  year: number
  date?: string
  abstract?: string
  summary?: string
  researchAreas: string[]
  paperType: PaperType
  featured?: boolean
  links: {
    paper?: string
    pdf?: string
    code?: string
    project?: string
    bibtex?: string
  }
}

export type OpportunityType =
  | 'phd'
  | 'visiting-student'
  | 'masters'
  | 'engineer'
  | 'fellow'
  | 'collaboration'
  | 'staff'
  | 'other'

export type Opportunity = {
  id: string
  title: string
  type: OpportunityType
  status: 'open' | 'closed' | 'rolling'
  location?: string
  deadline?: string
  summary: string
  link?: string
  contactEmail?: string
}

export type InvolvementRoute = {
  id: string
  title: string
  shortTitle: string
  href: string
  summary: string
  guidance: string[]
}

export const siteMeta = {
  name: 'BOLD Institute',
  shortName: 'BOLD',
  expandedName: 'British Open-Ended Learning & Discovery Institute',
  description:
    'A unified AI research institute in England bringing together three university AI labs.',
  missionPhrase: 'Research. Build. Transform.',
  mission:
    'Building the next generation of AI research through world-class collaboration across leading university labs.',
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

export const navigation: NavigationItem[] = [
  { label: 'Our People', href: '/people' },
  { label: 'News', href: '/news' },
  { label: 'Papers', href: '/papers' },
  { label: 'Opportunities', href: '/opportunities' },
]

export const people: Person[] = [
  {
    slug: 'amara-singh',
    name: 'Amara Singh',
    role: 'Associate Professor and Institute Co-Director',
    group: 'Faculty',
    affiliation: 'Northern Centre for AI',
    bio: 'Leads research on open-ended agents, scientific discovery systems, and evaluation for adaptive AI.',
    image: 'amara',
    researchAreas: ['Open-Ended Learning', 'Evaluation', 'AI Safety'],
    links: {
      website: 'https://example.ac.uk/amara-singh',
      googleScholar: 'https://scholar.google.com',
      email: 'mailto:amara.singh@example.ac.uk',
    },
    featured: true,
  },
  {
    slug: 'marcus-adeyemi',
    name: 'Marcus Adeyemi',
    role: 'Research Scientist',
    group: 'Researchers',
    affiliation: 'London AI Systems Lab',
    bio: 'Studies robotics evaluation, embodied world models, and reproducible benchmarks for physical agents.',
    image: 'marcus',
    researchAreas: ['Robotics', 'World Models', 'Benchmarking'],
    links: {
      website: 'https://example.ac.uk/marcus-adeyemi',
      github: 'https://github.com',
    },
    featured: true,
  },
  {
    slug: 'jules-chen',
    name: 'Jules Chen',
    role: 'PhD Student',
    group: 'PhD Students',
    affiliation: 'Eastern Machine Intelligence Lab',
    bio: 'Builds interactive environments for studying how language agents discover new tool-use strategies.',
    image: 'jules',
    researchAreas: ['Language Models', 'Agents', 'Tool Use'],
    links: {
      website: 'https://example.ac.uk/jules-chen',
      github: 'https://github.com',
    },
  },
  {
    slug: 'eve-morrison',
    name: 'Eve Morrison',
    role: 'PhD Student',
    group: 'PhD Students',
    affiliation: 'Northern Centre for AI',
    bio: 'Develops safety cases and reporting formats for self-improving and continually learning systems.',
    image: 'eve',
    researchAreas: ['AI Safety', 'Evaluation', 'Governance'],
    links: {
      googleScholar: 'https://scholar.google.com',
      email: 'mailto:eve.morrison@example.ac.uk',
    },
  },
  {
    slug: 'samira-patel',
    name: 'Samira Patel',
    role: 'Research Engineer',
    group: 'Research Engineers',
    affiliation: 'London AI Systems Lab',
    bio: 'Designs distributed training, experiment tracking, and infrastructure for large-scale research programmes.',
    researchAreas: ['ML Systems', 'Infrastructure', 'Distributed Training'],
    links: {
      github: 'https://github.com',
      linkedin: 'https://www.linkedin.com',
    },
    featured: true,
  },
  {
    slug: 'thomas-okoro',
    name: 'Thomas Okoro',
    role: 'Software Engineer',
    group: 'Software Engineers',
    affiliation: 'BOLD Institute',
    bio: 'Builds web platforms and data tooling that make research outputs reusable across the institute.',
    researchAreas: ['Research Tooling', 'Data', 'Web Platforms'],
    links: {
      github: 'https://github.com',
      linkedin: 'https://www.linkedin.com',
    },
  },
  {
    slug: 'nina-berg',
    name: 'Nina Berg',
    role: "Master's Student",
    group: "Master's Students",
    affiliation: 'Eastern Machine Intelligence Lab',
    bio: 'Works on representation learning for controllable generative models and evaluation dashboards.',
    researchAreas: ['Representation Learning', 'Generative Models', 'Evaluation'],
    links: {
      website: 'https://example.ac.uk/nina-berg',
    },
  },
  {
    slug: 'leo-williams',
    name: 'Leo Williams',
    role: 'Visiting Student',
    group: 'Visiting Students',
    affiliation: 'BOLD Institute',
    bio: 'Explores multi-agent reinforcement learning settings for coordination and emergent communication.',
    researchAreas: ['Multi-Agent RL', 'Reinforcement Learning', 'Coordination'],
    links: {
      website: 'https://example.ac.uk/leo-williams',
    },
  },
  {
    slug: 'marta-garcia',
    name: 'Marta Garcia',
    role: 'BOLD Fellow',
    group: 'Fellows',
    affiliation: 'BOLD Institute',
    bio: 'Leads a fellowship project on language-model evaluation under distribution shift and long-horizon use.',
    researchAreas: ['Language Models', 'Evaluation', 'AI Safety'],
    links: {
      googleScholar: 'https://scholar.google.com',
      website: 'https://example.ac.uk/marta-garcia',
    },
  },
  {
    slug: 'oliver-hart',
    name: 'Oliver Hart',
    role: 'Programme Manager',
    group: 'Staff',
    affiliation: 'BOLD Institute',
    bio: 'Coordinates institute programmes, partnerships, visitor processes, and research operations.',
    researchAreas: ['Research Operations', 'Partnerships'],
    links: {
      email: 'mailto:oliver.hart@example.ac.uk',
    },
  },
  {
    slug: 'fatima-rahman',
    name: 'Fatima Rahman',
    role: 'Affiliate Researcher',
    group: 'Affiliates',
    affiliation: 'Public Interest AI Network',
    bio: 'Collaborates on governance, public datasets, and evidence standards for high-impact AI systems.',
    researchAreas: ['Governance', 'Public Datasets', 'Evaluation'],
    links: {
      website: 'https://example.ac.uk/fatima-rahman',
    },
  },
  {
    slug: 'alex-kim',
    name: 'Alex Kim',
    role: 'Alumnus',
    group: 'Alumni',
    affiliation: 'BOLD Institute',
    bio: 'Former student researcher on behavioural portfolios for continually learning systems.',
    researchAreas: ['Continual Learning', 'Evaluation'],
    links: {
      website: 'https://example.ac.uk/alex-kim',
    },
    alumni: true,
  },
]

export const newsPosts: NewsPost[] = [
  {
    slug: 'bold-institute-launch',
    title: 'Three university AI labs launch the BOLD Institute',
    type: 'announcement',
    date: '2026-06-15',
    excerpt:
      'The new institute brings together researchers, engineers, students, and fellows into a single collaborative AI research environment.',
    authorIds: ['amara-singh', 'oliver-hart'],
    tags: ['Institute', 'Collaboration', 'Launch'],
    featured: true,
    content:
      'The BOLD Institute launches today as a unified AI research environment spanning three university labs in England.\n\nThe institute is designed to give researchers the scale, infrastructure, and collaborative density needed for long-term AI research. Its initial programme focuses on open-ended learning, evaluation, AI for discovery, research tooling, and responsible deployment.\n\nOver the coming months, BOLD will publish research updates, open calls, technical reports, and opportunities for students, engineers, fellows, and collaborators.',
  },
  {
    slug: 'evaluation-for-open-ended-systems',
    title: 'Why open-ended learning needs public evaluation',
    type: 'blog',
    date: '2026-06-03',
    excerpt:
      'A short argument for measuring discovery, robustness, and governance together instead of treating them as separate workstreams.',
    authorIds: ['eve-morrison', 'amara-singh'],
    tags: ['Evaluation', 'AI Safety', 'Open-Ended Learning'],
    featured: true,
    content:
      'Open-ended systems are built to continue finding new behaviours, strategies, and tasks. That makes evaluation a first-class research problem rather than a final reporting step.\n\nOur initial evaluation programme combines behavioural portfolios, failure discovery, reproducibility checks, and governance-relevant reporting. The aim is to create evidence that remains useful as systems adapt.\n\nThis work will be released through papers, datasets, and institute-wide infrastructure that teams can reuse across projects.',
  },
  {
    slug: 'research-engineering-programme',
    title: 'Inside the institute research engineering programme',
    type: 'article',
    date: '2026-05-24',
    excerpt:
      'How shared infrastructure, tooling, and engineering practice support ambitious academic AI research.',
    authorIds: ['samira-patel', 'thomas-okoro'],
    tags: ['Research Engineering', 'Infrastructure', 'ML Systems'],
    featured: true,
    content:
      'Research engineering is central to the institute model. The programme supports distributed training, experiment infrastructure, reproducibility tooling, and shared platforms for data and evaluation.\n\nThe goal is not to turn academic research into product development. It is to give scientists reliable systems, faster feedback loops, and reusable foundations for high-risk research.\n\nBOLD will maintain a public index of engineering outputs alongside papers and technical reports where appropriate.',
  },
  {
    slug: 'behavioural-portfolios-preview',
    title: 'From benchmark scores to behavioural portfolios',
    type: 'research-update',
    date: '2026-05-10',
    excerpt:
      'A preview of work on richer capability profiles for agents that continue adapting after deployment.',
    authorIds: ['eve-morrison'],
    tags: ['Evaluation', 'Continual Learning', 'Agents'],
    content:
      'Benchmark scores are useful, but they often compress the behaviour of adaptive systems too aggressively.\n\nBehavioural portfolios report a model or agent through multiple lenses: capability range, uncertainty, failure modes, environment coverage, and change over time.\n\nOur early prototypes focus on language-guided agents and embodied systems where the same headline score can hide important differences in risk and reliability.',
  },
  {
    slug: 'student-discovery-loops',
    title: 'Building student-led discovery loops',
    type: 'news',
    date: '2026-04-28',
    excerpt:
      'New student projects will use shared experiment templates to make exploratory AI research easier to reproduce.',
    authorIds: ['jules-chen', 'nina-berg'],
    tags: ['Students', 'Research Operations', 'Infrastructure'],
    content:
      'The institute is introducing shared discovery-loop templates for student projects across the three founding labs.\n\nEach template includes a clear research question, baseline implementation, experiment logging, evaluation checklist, and reporting format. Students can adapt the template while still producing outputs that other teams can inspect and extend.\n\nThe first cohort will focus on interactive environments, generative model evaluation, and world-model diagnostics.',
  },
  {
    slug: 'social-launch-thread',
    title: 'Launch thread: what BOLD will publish first',
    type: 'social-post',
    date: '2026-04-18',
    excerpt:
      'A public thread outlining the institute launch, initial research themes, and upcoming opportunities.',
    tags: ['Launch', 'Social', 'Opportunities'],
    socialEmbedUrl: 'https://x.com/example/status/0000000000000000000',
    content:
      'This social announcement summarises the first public-facing priorities for the institute: people, papers, news, opportunities, and open research infrastructure.\n\nThe full thread link is included for visitors who want to read the original public announcement.',
  },
  {
    slug: 'external-policy-roundtable',
    title: 'BOLD researchers join national AI policy roundtable',
    type: 'news',
    date: '2026-04-02',
    excerpt:
      'Institute members contributed evidence on evaluation, public datasets, and responsible AI research infrastructure.',
    tags: ['Policy', 'Governance', 'External'],
    externalUrl: 'https://example.ac.uk/news/ai-policy-roundtable',
  },
]

export const papers: Paper[] = [
  {
    id: 'autocurricula-tool-using-agents',
    title: 'Autocurricula for Tool-Using Language Agents',
    authors: ['Amara Singh', 'Jules Chen', 'BOLD Institute'],
    authorIds: ['amara-singh', 'jules-chen'],
    venue: 'International Conference on Learning Representations',
    year: 2026,
    date: '2026-05-20',
    abstract:
      'We introduce a benchmark suite for measuring whether language agents discover new tool-use strategies without a fixed task list.',
    summary:
      'A benchmark suite for measuring discovery, tool choice, and transfer in language-guided agents.',
    researchAreas: ['Language Models', 'Agents', 'Open-Ended Learning'],
    paperType: 'conference',
    featured: true,
    links: {
      paper: 'https://example.ac.uk/papers/autocurricula-tool-using-agents',
      pdf: 'https://example.ac.uk/papers/autocurricula-tool-using-agents.pdf',
      code: 'https://github.com',
      bibtex: '@inproceedings{singh2026autocurricula,title={Autocurricula for Tool-Using Language Agents}}',
    },
  },
  {
    id: 'failure-discovery-robotics',
    title: 'Failure Discovery in Open-Ended Robotics Environments',
    authors: ['Marcus Adeyemi', 'Eve Morrison', 'BOLD Institute'],
    authorIds: ['marcus-adeyemi', 'eve-morrison'],
    venue: 'Robotics: Science and Systems Workshop',
    year: 2026,
    date: '2026-04-12',
    abstract:
      'A methodology for surfacing brittle behaviours in embodied agents before performance metrics saturate.',
    summary:
      'Methods for finding brittle behaviours in embodied agents across changing environments.',
    researchAreas: ['Robotics', 'World Models', 'Evaluation'],
    paperType: 'workshop',
    featured: true,
    links: {
      paper: 'https://example.ac.uk/papers/failure-discovery-robotics',
      pdf: 'https://example.ac.uk/papers/failure-discovery-robotics.pdf',
      project: 'https://example.ac.uk/projects/failure-discovery',
    },
  },
  {
    id: 'behavioural-portfolios',
    title: 'Behavioural Portfolios for Continually Learning Systems',
    authors: ['Eve Morrison', 'Amara Singh'],
    authorIds: ['eve-morrison', 'amara-singh'],
    venue: 'BOLD Technical Report',
    year: 2026,
    date: '2026-03-29',
    abstract:
      'A reporting format for describing how an adaptive system changes capability, risk, and uncertainty over time.',
    summary:
      'A practical reporting framework for adaptive systems whose behaviour changes after release.',
    researchAreas: ['Evaluation', 'AI Safety', 'Continual Learning'],
    paperType: 'technical-report',
    featured: true,
    links: {
      paper: 'https://example.ac.uk/papers/behavioural-portfolios',
      pdf: 'https://example.ac.uk/papers/behavioural-portfolios.pdf',
      bibtex: '@techreport{morrison2026portfolios,title={Behavioural Portfolios for Continually Learning Systems}}',
    },
  },
  {
    id: 'research-ops-student-projects',
    title: 'Research Operations for Reproducible Student Projects',
    authors: ['Jules Chen', 'Thomas Okoro', 'BOLD Institute'],
    authorIds: ['jules-chen', 'thomas-okoro'],
    venue: 'Journal of Open Research Software',
    year: 2025,
    date: '2025-11-14',
    summary:
      'Infrastructure patterns for keeping small AI experiments inspectable, portable, and easy to extend.',
    researchAreas: ['Research Tooling', 'Infrastructure', 'Reproducibility'],
    paperType: 'journal',
    links: {
      paper: 'https://example.ac.uk/papers/research-ops-student-projects',
      code: 'https://github.com',
    },
  },
  {
    id: 'multi-agent-evaluation-suite',
    title: 'A Multi-Agent Evaluation Suite for Emergent Coordination',
    authors: ['Leo Williams', 'Marcus Adeyemi'],
    authorIds: ['leo-williams', 'marcus-adeyemi'],
    venue: 'NeurIPS Datasets and Benchmarks Track',
    year: 2025,
    date: '2025-10-02',
    summary:
      'A benchmark and dataset for coordination, communication, and adaptation in multi-agent systems.',
    researchAreas: ['Multi-Agent RL', 'Benchmarking', 'Evaluation'],
    paperType: 'benchmark',
    links: {
      paper: 'https://example.ac.uk/papers/multi-agent-evaluation-suite',
      pdf: 'https://example.ac.uk/papers/multi-agent-evaluation-suite.pdf',
      code: 'https://github.com',
    },
  },
  {
    id: 'representation-learning-control',
    title: 'Representations for Controllable Generative Discovery',
    authors: ['Nina Berg', 'Marta Garcia'],
    authorIds: ['nina-berg', 'marta-garcia'],
    venue: 'Preprint',
    year: 2025,
    date: '2025-08-19',
    summary:
      'Representation-learning methods for steering generative search across scientific design spaces.',
    researchAreas: ['Representation Learning', 'Generative Models', 'AI for Discovery'],
    paperType: 'preprint',
    links: {
      paper: 'https://example.ac.uk/papers/controllable-generative-discovery',
      pdf: 'https://example.ac.uk/papers/controllable-generative-discovery.pdf',
    },
  },
  {
    id: 'public-research-programme',
    title: 'Open-Ended Discovery as a Public Research Programme',
    authors: ['BOLD Institute'],
    venue: 'Position Paper',
    year: 2025,
    date: '2025-06-12',
    summary:
      'A framing paper for building AI discovery systems with shared evidence, public benefit, and durable infrastructure.',
    researchAreas: ['Open-Ended Learning', 'Governance', 'Public Datasets'],
    paperType: 'other',
    links: {
      paper: 'https://example.ac.uk/papers/public-research-programme',
      pdf: 'https://example.ac.uk/papers/public-research-programme.pdf',
    },
  },
]

export const involvementRoutes: InvolvementRoute[] = [
  {
    id: 'phd-students',
    title: 'Prospective PhD Students',
    shortTitle: 'PhD Students',
    href: '/opportunities#phd-students',
    summary:
      'Join through university and department processes while connecting your interests to institute research themes.',
    guidance: [
      'Review the research areas and supervisors whose work matches your interests.',
      'Follow the relevant university or department application process where applicable.',
      'Use the intake email if you want to share a short research fit statement before or during application.',
    ],
  },
  {
    id: 'visiting-students',
    title: 'Visiting Students',
    shortTitle: 'Visitors',
    href: '/opportunities#visiting-students',
    summary:
      'Spend a defined period in the institute to work on a focused research question with a BOLD host.',
    guidance: [
      'Include your current institution, proposed dates, and the research group you hope to work with.',
      'Share a concise project idea and relevant prior work.',
      'Duration, funding, and supervision fit can be discussed after initial contact.',
    ],
  },
  {
    id: 'masters-students',
    title: "Master's Students",
    shortTitle: "Master's",
    href: '/opportunities#masters-students',
    summary:
      'Work on supervised projects where capacity and research fit align with current institute priorities.',
    guidance: [
      'Describe the programme you are enrolled in and the project window you are seeking.',
      'Share technical interests, relevant coursework, and links to any code or writing.',
      'Project availability depends on supervision capacity.',
    ],
  },
  {
    id: 'engineers',
    title: 'Software Engineers / Research Engineers',
    shortTitle: 'Engineers',
    href: '/opportunities#engineers',
    summary:
      'Build the systems, infrastructure, evaluation tooling, and platforms that make institute-scale research possible.',
    guidance: [
      'Relevant experience includes ML systems, distributed training, data tooling, evaluation, web platforms, and research infrastructure.',
      'Current open roles are listed separately where available.',
      'General expressions of interest should include a CV, project links, and preferred work areas.',
    ],
  },
  {
    id: 'fellows',
    title: 'Fellows and Experienced Researchers',
    shortTitle: 'Fellows',
    href: '/opportunities#fellows',
    summary:
      'Collaborate, visit, lead ambitious research projects, or explore longer-term institute roles.',
    guidance: [
      'Include a short research statement and the institute themes you would contribute to.',
      'Share representative papers, projects, datasets, or research software.',
      'Use the intake email for visiting, collaboration, and longer-term interest.',
    ],
  },
  {
    id: 'collaborators',
    title: 'Collaborators',
    shortTitle: 'Collaborators',
    href: '/opportunities#collaborators',
    summary:
      'Start serious research collaborations with clear scientific motivation and mutual institutional fit.',
    guidance: [
      'Send a short description of the proposed collaboration and why BOLD is the right partner.',
      'Include relevant people, timing, expected outputs, and any funding or data considerations.',
      'Collaborations are reviewed for research fit, capacity, and responsible practice.',
    ],
  },
]

export const opportunities: Opportunity[] = [
  {
    id: 'research-engineer-expressions',
    title: 'Research Engineer Expressions of Interest',
    type: 'engineer',
    status: 'rolling',
    location: 'England / hybrid',
    summary:
      'Rolling expressions of interest for engineers with experience in ML systems, research infrastructure, evaluation tooling, and data platforms.',
    contactEmail: siteMeta.contactEmail,
  },
  {
    id: 'visiting-student-2026',
    title: 'Visiting Student Placements',
    type: 'visiting-student',
    status: 'open',
    location: 'BOLD Institute',
    deadline: '2026-09-30',
    summary:
      'A small number of visiting student placements will be considered for projects aligned with evaluation, agents, robotics, and AI for discovery.',
    contactEmail: siteMeta.contactEmail,
  },
]

export const roleOrder = [
  'Faculty',
  'Researchers',
  'PhD Students',
  'Research Engineers',
  'Software Engineers',
  "Master's Students",
  'Visiting Students',
  'Fellows',
  'Staff',
  'Affiliates',
  'Alumni',
]

export const newsTypeLabels: Record<NewsPostType, string> = {
  blog: 'Blog',
  news: 'News',
  article: 'Article',
  announcement: 'Announcement',
  'research-update': 'Research Update',
  'social-post': 'Social Post',
}

export const paperTypeLabels: Record<PaperType, string> = {
  conference: 'Conference',
  journal: 'Journal',
  preprint: 'Preprint',
  workshop: 'Workshop',
  'technical-report': 'Technical Report',
  dataset: 'Dataset',
  benchmark: 'Benchmark',
  software: 'Software',
  thesis: 'Thesis',
  other: 'Other',
}

export const opportunityTypeLabels: Record<OpportunityType, string> = {
  phd: 'PhD',
  'visiting-student': 'Visiting Student',
  masters: "Master's",
  engineer: 'Engineer',
  fellow: 'Fellow',
  collaboration: 'Collaboration',
  staff: 'Staff',
  other: 'Other',
}
