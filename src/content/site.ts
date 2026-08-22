import type { NavigationItem } from './types.ts'

export const siteMeta = {
  name: 'BOLD Lab',
  shortName: 'BOLD',
  description:
    'A focused, critical-mass AI research lab across Oxford, UCL, and Imperial pursuing fundamental AI breakthroughs from the UK.',
  missionPhrase: 'Building the next AI paradigm.',
  mission:
    'A world-leading academic lab catalyzing open frontier AI research, uniting top machine-learning groups at Oxford, UCL, and Imperial under one ambitious vision.',
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
    eyebrow: 'British Open-ended Learning and Discovery',
    headline: siteMeta.missionPhrase,
    lede: siteMeta.mission,
    actions: [
      { label: 'Join BOLD', href: '/opportunities' },
      { label: 'Meet the team', href: '/people' },
    ],
  },
  vision: [
    "The current paradigm is that scale is all you need. Instead, we believe two things: First, that paradigm-breaking discoveries are possible and, secondly, that academia, if given focus, scale, and compute, is still the best place for these breakthroughs. BOLD develops new paradigms for AI that enable robust real-world intelligence: AI systems that learn, reason, coordinate, and adapt in environments that are noisy, interactive, resource-constrained, and often non-differentiable. To pursue this at the necessary scale, BOLD does something UK academia has not done before: it merges the field's leading AI groups at Oxford, UCL, and Imperial into a single, co-located lab, uniting their talent and resources behind one shared vision. It is a new model for academia operating at industry speed, focus, and ambition, and fully committed to open source and open science in the public interest.",
    'BOLD is racing to pioneer AI breakthroughs the field (and Europe) urgently needs—AI that is radically more compute-efficient, safer, and openly shared. If it succeeds, this unified national effort will become a critical enabler of UK and European AI sovereignty in a race currently dominated by the US and China.',
  ],
  researchPillars: [
    {
      name: 'Beyond Backpropagation',
      lead: 'Laura Toni',
      description:
        'Rethinking foundational neural network optimization. This pillar targets limitations of backpropagation (high communication overhead, poor handling of non-differentiable components, reduced plasticity) by developing zeroth-order, population-based, low-rank, and hybrid methods (e.g., the EGGROLL method) to unlock massive compute efficiency and decentralized, privacy-aware training.',
    },
    {
      name: 'Human-Centric Learning & Discovery',
      lead: 'Jakob Foerster',
      description:
        'Pioneering multi-agent coordination as a core training component rather than an afterthought. This pillar initially builds a co-improving, human-in-the-loop "co-scientist" system based on zero-shot coordination frameworks, allowing AI agents to actively collaborate with human teams and leapfrog purely autonomous models.',
    },
    {
      name: 'Embodied Learning',
      lead: 'Antoine Cully',
      description:
        'Developing resource-agile paradigms for data- and compute-constrained physical systems (robotics/autonomous vehicles). Instead of monolithic cloud-dependent models, this focuses on autonomous skill discovery in simulation (e.g., OMNI-EPIC), resilient adaptation, modular hierarchies, and edge-optimized scalability for real-time onboard deployment.',
    },
  ],
  team: {
    introduction:
      'BOLD has been created by folding 5 internationally leading labs into one effort—FLAIR and WhiRL (Oxford), DARK and LASP (UCL), and AIRL (Imperial). These labs have jointly published hundreds of papers in top venues and won best-paper awards at ICML, AAAI, and GECCO, and represent one of the highest concentrations of talent in Europe and globally. The founding faculty bring deep experience from the frontier labs shaping AI today:',
    faculty: [
      {
        identity: 'Jakob Foerster (Oxford)',
        description:
          'Director; pioneer of multi-agent learning and automated scientific discovery.',
      },
      {
        identity: 'Tim Rocktäschel (UCL)',
        description:
          'Co-founder of Recursive, co-author of RAG, Genie, and Promptbreeder; former Open-Endedness Team Lead at Google DeepMind; co-founded Bloomsbury AI (acquired by Meta).',
      },
      {
        identity: 'Antoine Cully (Imperial)',
        description:
          'Leader in robotics & Quality-Diversity optimisation; five consecutive GECCO best-paper awards; foundational work published in Nature.',
      },
      {
        identity: 'Anisoara Calinescu (Oxford)',
        description:
          "Co-Director for training environments, driving BOLD's agent-training infrastructure and simulation platforms.",
      },
      {
        identity: 'Laura Toni (UCL) / Roberta Raileanu (DeepMind / UCL)',
        description:
          'Leaders in agentic foundation models, open-ended learning, and signal processing.',
      },
      {
        identity: 'Shimon Whiteson (Oxford)',
        description:
          'Deep RL and imitation learning; founder of Latent Logic (acquired by Waymo, 2019).',
      },
    ],
    trackRecord:
      'The labs have a proven pipeline from research to real-world impact: alumni have gone on to OpenAI, Anthropic, DeepMind, and the UK AI Security Institute, and have co-founded companies including Weco.ai (whose AIDE agent has been used by OpenAI and Meta), Helical, and the foundation-model unicorn Reflection AI.',
  },
  fieldLeaders:
    "BOLD's scientific advisory board and endorsers read as a who's who of modern AI such as David Silver, Pieter Abbeel, Nando de Freitas, Jeff Clune, Doina Precup, Hugo Larochelle.",
  operatingModel: {
    introduction:
      'Rather than distributing resources thinly, BOLD consolidates existing world-class academic groups into a single co-located lab in Oxford, formally linked to all three universities. A lightweight three-phase research funnel—broad exploration, selective scale-up, then deep focused missions—lets promising ideas earn larger resources fast while failing cheaply, mirroring how the team turned early experiments into breakthroughs like EGGROLL within months.',
    phases: [
      {
        name: 'Phase 1: Broad Exploration',
        description:
          'Modest resource allocation (~5K GPU hours per project) to test ~100 high-risk, highly novel ideas pitched by any lab member.',
      },
      {
        name: 'Phase 2: Gated Scaling',
        description:
          'The most promising 3–5 projects per year advance to receive moderate scaling resources (~200K GPU hours each).',
      },
      {
        name: 'Phase 3: Deep Mission Execution',
        description:
          'The single most impactful project receives massive resources (~700K GPU hours) to achieve breakthrough results, top-tier publications, or commercial spin-out readiness.',
      },
    ],
    ukCase: [
      "Situating this lab in the UK creates a global centre of excellence comparable in ambition to Canada's Mila or Vector—but more focused. It strengthens the European AI talent pipeline, helps retain top faculty who might otherwise leave for the US or industry, and commits to releasing open-source models, weights, and benchmarks for the public good.",
      'For donors and founders, BOLD is a rare chance to shape the institutions that will define the next era of AI and to keep frontier, open science thriving in the UK and the continent.',
    ],
  },
  atAGlance: [
    {
      label: 'Focus',
      value:
        'Agentic foundation models, open-ended learning, multi-agent & embodied AI',
    },
    {
      label: 'Home',
      value:
        'A single co-located lab in Oxford, linked to Oxford, UCL & Imperial',
    },
    {
      label: 'Model',
      value: 'Non-profit, fully open-source and open-science',
    },
    {
      label: 'Founding labs',
      value: 'FLAIR, WhiRL, DARK, LASP & AIRL',
    },
    {
      label: 'Recognition',
      value: 'Best-paper awards at ICML, AAAI, GECCO & NeurIPS',
    },
    {
      label: 'Advisors',
      value: 'Sutton, Silver, Abbeel, Precup, Larochelle & more',
    },
  ],
  closingStatement:
    'Accelerating open frontier AI research for Europe’s AI sovereignty.',
}

export const navigation: NavigationItem[] = [
  { label: 'Our People', href: '/people' },
  { label: 'Opportunities', href: '/opportunities' },
]
