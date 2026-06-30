import type { Paper, PaperType } from './types.ts'

export const papers: Paper[] = [
  {
    id: 'autocurricula-tool-using-agents',
    title: 'Autocurricula for Tool-Using Language Agents',
    authors: ['BOLD Lab'],
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
      bibtex:
        '@inproceedings{singh2026autocurricula,title={Autocurricula for Tool-Using Language Agents}}',
    },
  },
  {
    id: 'failure-discovery-robotics',
    title: 'Failure Discovery in Open-Ended Robotics Environments',
    authors: ['BOLD Lab'],
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
    authors: [],
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
      bibtex:
        '@techreport{morrison2026portfolios,title={Behavioural Portfolios for Continually Learning Systems}}',
    },
  },
  {
    id: 'research-ops-student-projects',
    title: 'Research Operations for Reproducible Student Projects',
    authors: ['BOLD Lab'],
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
    authors: [],
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
    authors: [],
    venue: 'Preprint',
    year: 2025,
    date: '2025-08-19',
    summary:
      'Representation-learning methods for steering generative search across scientific design spaces.',
    researchAreas: [
      'Representation Learning',
      'Generative Models',
      'AI for Discovery',
    ],
    paperType: 'preprint',
    links: {
      paper: 'https://example.ac.uk/papers/controllable-generative-discovery',
      pdf: 'https://example.ac.uk/papers/controllable-generative-discovery.pdf',
    },
  },
  {
    id: 'public-research-programme',
    title: 'Open-Ended Discovery as a Public Research Programme',
    authors: ['BOLD Lab'],
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
