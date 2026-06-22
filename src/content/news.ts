import type { NewsPost, NewsPostType } from './types.ts'

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

export const newsTypeLabels: Record<NewsPostType, string> = {
  blog: 'Blog',
  news: 'News',
  article: 'Article',
  announcement: 'Announcement',
  'research-update': 'Research Update',
  'social-post': 'Social Post',
}
