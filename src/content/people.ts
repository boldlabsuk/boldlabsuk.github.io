import ourPeople from '../../our_people.json' with { type: 'json' }
import type { Person, PersonLinkSet } from './types.ts'

export type SourcePerson = {
  source: string
  name: string
  role: string
  homeInstitution?: string
  researchInterestKeywords: string[] | string
  profilePicture?: string
  listOnBoldWebsite?: string
  socialLinks?: string
  'social-links'?: string
  alumni?: boolean | string
}

export const canonicalPeopleResearchAreas = [
  'AI Agents',
  'AI Safety & Governance',
  'AI for Science',
  'Automated Discovery',
  'Causal Inference',
  'Complex Systems',
  'Computer Vision',
  'Evolutionary Computation',
  'Financial AI',
  'Foundation Models',
  'Game Theory',
  'Generative Models',
  'Human-AI Interaction',
  'Interpretability',
  'Language Models',
  'Machine Learning',
  'Machine Learning Systems',
  'Meta-Learning & Adaptation',
  'Multi-Agent Systems',
  'NeuroAI',
  'Open-Ended Learning',
  'Optimization',
  'Planning & Control',
  'Reinforcement Learning',
  'Research Operations',
  'Robotics',
  'Robustness & Generalization',
  'World Models',
] as const

export type PeopleResearchArea = (typeof canonicalPeopleResearchAreas)[number]

const canonicalPeopleResearchAreaKeys = new Map(
  canonicalPeopleResearchAreas.map((area) => [
    normalizeResearchAreaKey(area),
    [area] as readonly PeopleResearchArea[],
  ]),
)

const peopleResearchAreaAliases = new Map<string, readonly PeopleResearchArea[]>(
  ([
    ['ABM', ['Complex Systems']],
    ['Agent-based modelling', ['Complex Systems']],
    ['agentic language model', ['AI Agents', 'Language Models']],
    ['AGI Safety', ['AI Safety & Governance']],
    ['AI Scientist', ['Automated Discovery']],
    ['AI safety', ['AI Safety & Governance']],
    ['AI4Science', ['AI for Science']],
    ['Algorithm Discovery', ['Automated Discovery']],
    ['Algorithm search', ['Automated Discovery']],
    ['alignment', ['AI Safety & Governance']],
    ['Anomaly Detection', ['Machine Learning']],
    ['antibody design', ['AI for Science']],
    ['Artificial Creativity', ['Open-Ended Learning']],
    ['Artificial Intelligence', ['Machine Learning']],
    ['Automated Research', ['Automated Discovery']],
    [
      'autonomous design of reward functions and optimisation metrics',
      ['Automated Discovery', 'Optimization'],
    ],
    ['Autonomous Driving', ['Robotics']],
    ['autonomous scientific discovery', ['Automated Discovery', 'AI for Science']],
    ['Autonomous Systems', ['Robotics']],
    ['Bayesian', ['Machine Learning']],
    ['Behaviour Diversity', ['Open-Ended Learning']],
    ['Binary Neural Networks', ['Machine Learning Systems']],
    ['bounded rationality', ['Game Theory']],
    ['co-scientist', ['Automated Discovery']],
    ['Co-Scientist', ['Automated Discovery']],
    ['Collective Intelligence', ['Complex Systems']],
    ['Complex networked systems', ['Complex Systems']],
    ['complexity economics', ['Complex Systems']],
    ['complexity/information theory', ['Complex Systems']],
    ['Complexity', ['Complex Systems']],
    ['compression', ['Machine Learning']],
    ['Continual learning', ['Meta-Learning & Adaptation']],
    ['Control', ['Planning & Control']],
    ['cooperative AI', ['Multi-Agent Systems']],
    ['Curriculum', ['Reinforcement Learning']],
    ['Curriculum Learning', ['Reinforcement Learning']],
    ['damage adaptation', ['Meta-Learning & Adaptation', 'Robustness & Generalization']],
    ['Data attribution', ['Interpretability']],
    ['Deep Reinforcement Learning', ['Reinforcement Learning']],
    ['Deep RL', ['Reinforcement Learning']],
    ['democracy', ['AI Safety & Governance']],
    ['Differentiable Logic Gate Networks', ['Machine Learning Systems']],
    ['Diffusion models', ['Generative Models']],
    ['Diffusion Models', ['Generative Models']],
    ['Digital twins', ['Complex Systems']],
    ['EGGROLL', ['Evolutionary Computation']],
    ['Embodied AI', ['Robotics']],
    ['emergent communication', ['Multi-Agent Systems']],
    ['Evolution', ['Evolutionary Computation']],
    ['Evolution Strategies', ['Evolutionary Computation']],
    ['evolutionary computation', ['Evolutionary Computation']],
    ['exploration', ['Reinforcement Learning']],
    ['Exploration', ['Reinforcement Learning']],
    ['Finance', ['Financial AI']],
    ['Fine-Tuning', ['Language Models']],
    ['forecasting', ['Financial AI']],
    ['Foundation Model', ['Foundation Models']],
    ['foundation models', ['Foundation Models']],
    ['FPGA-Based ML Hardware', ['Machine Learning Systems']],
    ['game theory', ['Game Theory']],
    ['generalist agents', ['AI Agents']],
    ['generalization', ['Robustness & Generalization']],
    ['Generative AI', ['Generative Models']],
    ['Geometric Deep Learning', ['Machine Learning']],
    ['Goal-Conditioned', ['Reinforcement Learning']],
    ['Goal-conditioned reinforcement learning', ['Reinforcement Learning']],
    ['Graph Machine Learning', ['Machine Learning']],
    ['Graph-ML', ['Machine Learning']],
    ['Hardware-Aware Neural Network Acceleration', ['Machine Learning Systems']],
    ['HCI', ['Human-AI Interaction']],
    ['Hierarchical Reinforcement Learning', ['Reinforcement Learning']],
    ['High-Performance Computing', ['Machine Learning Systems']],
    ['human-AI coordination', ['Human-AI Interaction']],
    ['Human-AI Coordination', ['Human-AI Interaction']],
    ['Human-Centered AI', ['Human-AI Interaction']],
    ['imitation learning', ['Reinforcement Learning']],
    ['In-Context Learning', ['Language Models']],
    ['language model post-training', ['Language Models']],
    ['Language Model Reasoning', ['Language Models']],
    ['Large Language Models', ['Language Models']],
    ['Learning from first principles', ['Machine Learning']],
    ['learning theory', ['Machine Learning']],
    ['LLM reasoning', ['Language Models']],
    ['LLM self-explanations', ['Interpretability']],
    ['llms', ['Language Models']],
    ['LLMs', ['Language Models']],
    ['Long-horizon reasoning and RL', ['Language Models', 'Reinforcement Learning']],
    ['Machine Learning Architectures', ['Machine Learning Systems']],
    ['MARL', ['Multi-Agent Systems', 'Reinforcement Learning']],
    ['Mechanistic Interpretability', ['Interpretability']],
    ['meta learning', ['Meta-Learning & Adaptation']],
    ['meta-learning', ['Meta-Learning & Adaptation']],
    ['Meta-Learning', ['Meta-Learning & Adaptation']],
    ['meta-rl', ['Meta-Learning & Adaptation', 'Reinforcement Learning']],
    ['ml acceleration', ['Machine Learning Systems']],
    ['Model Adaptation', ['Meta-Learning & Adaptation']],
    ['Model Predictive Control', ['Planning & Control']],
    ['model-based rl', ['World Models', 'Reinforcement Learning']],
    ['model-based RL', ['World Models', 'Reinforcement Learning']],
    ['Molecular Machine Learning', ['AI for Science']],
    ['Multi-agent', ['Multi-Agent Systems']],
    ['multi-agent reinforcement learning', ['Multi-Agent Systems', 'Reinforcement Learning']],
    ['Multi-Agent Reinforcement Learning', ['Multi-Agent Systems', 'Reinforcement Learning']],
    [
      'Multi-Agent Reinforcement Learning Human-AI Coordination',
      ['Multi-Agent Systems', 'Reinforcement Learning', 'Human-AI Interaction'],
    ],
    ['multi-agent rl', ['Multi-Agent Systems', 'Reinforcement Learning']],
    ['Natural Language Processing', ['Language Models']],
    ['Neuroscience', ['NeuroAI']],
    ['Neuromorphic Computing', ['Machine Learning Systems']],
    ['off-policy RL', ['Reinforcement Learning']],
    ['Offline', ['Reinforcement Learning']],
    ['Offline RL', ['Reinforcement Learning']],
    ['Open Ended RL', ['Open-Ended Learning', 'Reinforcement Learning']],
    ['Open-ended learning', ['Open-Ended Learning']],
    ['open-endedness', ['Open-Ended Learning']],
    ['Open-endedness', ['Open-Ended Learning']],
    ['Open-Endedness', ['Open-Ended Learning']],
    ['opponent shaping', ['Game Theory', 'Multi-Agent Systems']],
    ['Planning', ['Planning & Control']],
    ['power concentration', ['AI Safety & Governance']],
    ['Quality Diversity', ['Evolutionary Computation', 'Open-Ended Learning']],
    ['Quality-Diversity', ['Evolutionary Computation', 'Open-Ended Learning']],
    ['Quantitative Finance', ['Financial AI']],
    ['Real-time Embedded System', ['Machine Learning Systems']],
    ['Reasoning', ['Language Models']],
    ['regularisation', ['Robustness & Generalization']],
    ['reinforcement learning', ['Reinforcement Learning']],
    ['Reinforcement learning', ['Reinforcement Learning']],
    ['Reinforcment Learning', ['Reinforcement Learning']],
    ['representation learning', ['Machine Learning']],
    ['representational alignment', ['AI Safety & Governance']],
    ['research agent', ['Automated Discovery', 'AI Agents']],
    ['resilient robotics', ['Robotics', 'Robustness & Generalization']],
    ['rl', ['Reinforcement Learning']],
    ['RL', ['Reinforcement Learning']],
    ['RLVR', ['Reinforcement Learning']],
    ['robot learning', ['Robotics', 'Reinforcement Learning']],
    ['Robot learning', ['Robotics', 'Reinforcement Learning']],
    ['Robot Learning', ['Robotics', 'Reinforcement Learning']],
    ['robotics', ['Robotics']],
    ['Robotics and Autonomous Systems', ['Robotics']],
    ['robust adaptation', ['Meta-Learning & Adaptation', 'Robustness & Generalization']],
    ['Robustness', ['Robustness & Generalization']],
    ['RSI', ['Automated Discovery']],
    ['safety', ['AI Safety & Governance']],
    ['Safety', ['AI Safety & Governance']],
    ['Scaling RL', ['Reinforcement Learning']],
    ['Search', ['Planning & Control']],
    ['self-improvement', ['Automated Discovery']],
    ['sequential decision making', ['Reinforcement Learning']],
    ['Sim-to-Real', ['Robotics']],
    ['Simulation', ['Planning & Control']],
    ['Sustainability', ['AI Safety & Governance']],
    ['test-time planning', ['Planning & Control']],
    ['Theory', ['Machine Learning']],
    ['Trading', ['Financial AI']],
    ['Trajectory Optimization', ['Planning & Control', 'Optimization']],
    ['UED', ['Open-Ended Learning']],
    ['unsupervised environment design', ['Open-Ended Learning']],
    ['viral escape', ['AI for Science']],
    ['vision-language-action models', ['Robotics', 'Foundation Models']],
    ['World model', ['World Models']],
    ['World modeling', ['World Models']],
    ['world models', ['World Models']],
    ['World-models', ['World Models']],
    ['zero-shot rl', ['Reinforcement Learning']],
  ] satisfies readonly (readonly [string, readonly PeopleResearchArea[]])[]).map(
    ([sourceArea, canonicalAreas]) => [
      normalizeResearchAreaKey(sourceArea),
      canonicalAreas,
    ],
  ),
)

export function buildWebsiteRoster(sourcePeople: SourcePerson[]): Person[] {
  const roster = sourcePeople
    .filter(isWebsiteRosterSourcePerson)
    .map((sourcePerson) => buildPerson(sourcePerson))
  const rosterBySlug = new Map(roster.map((person) => [person.slug, person]))

  sourcePeople
    .filter(isSupplementalAlumniSourcePerson)
    .forEach((sourcePerson) => {
      const slug = getCanonicalPersonSlug(sourcePerson.name)

      if (rosterBySlug.has(slug)) {
        return
      }

      const person = buildPerson(sourcePerson)

      roster.push(person)
      rosterBySlug.set(person.slug, person)
    })

  sourcePeople
    .filter(isSupplementalSourcePerson)
    .forEach((sourcePerson) => {
      const person = rosterBySlug.get(getCanonicalPersonSlug(sourcePerson.name))

      if (!person) {
        return
      }

      person.links = mergePersonLinks(
        person.links,
        parsePublicPersonLinks(
          sourcePerson.socialLinks ?? sourcePerson['social-links'],
        ),
      )
    })

  return roster
}

function buildPerson(sourcePerson: SourcePerson): Person {
  const name = sourcePerson.name.trim()
  const role = sourcePerson.role.trim()
  const affiliation = normalizeAffiliation(sourcePerson.homeInstitution)
  const slug = getCanonicalPersonSlug(name)

  return {
    slug,
    name,
    role,
    group: role,
    ...(isExplicitAlumniMarker(sourcePerson.alumni) ? { alumni: true } : {}),
    affiliation: affiliation || undefined,
    bio: '',
    image: buildProfileAssetUrl(slug),
    links: parsePublicPersonLinks(
      sourcePerson.socialLinks ?? sourcePerson['social-links'],
    ),
    researchAreas: normalizeResearchAreas(sourcePerson.researchInterestKeywords),
  }
}

function isWebsiteRosterSourcePerson(sourcePerson: SourcePerson) {
  const source = normalizeSourceName(sourcePerson.source)

  return (
    source === 'main' &&
    hasWebsiteRosterRequiredFields(sourcePerson)
  )
}

function isSupplementalSourcePerson(sourcePerson: SourcePerson) {
  const source = normalizeSourceName(sourcePerson.source)

  return (
    isSupplementalRosterSource(source) &&
    Boolean(sourcePerson.name.trim()) &&
    Boolean(sourcePerson.socialLinks ?? sourcePerson['social-links'])
  )
}

function isSupplementalAlumniSourcePerson(sourcePerson: SourcePerson) {
  const source = normalizeSourceName(sourcePerson.source)

  return (
    source === 'foerster-alumni' &&
    isExplicitAlumniMarker(sourcePerson.alumni) &&
    hasWebsiteRosterRequiredFields(sourcePerson)
  )
}

function isSupplementalRosterSource(source: string) {
  return source.includes('foerster') || source === 'flair'
}

function hasWebsiteRosterRequiredFields(sourcePerson: SourcePerson) {
  return (
    Boolean(sourcePerson.name.trim()) &&
    Boolean(sourcePerson.role.trim()) &&
    Boolean(sourcePerson.profilePicture?.trim()) &&
    sourcePerson.listOnBoldWebsite?.trim().toLowerCase() !== 'no'
  )
}

function normalizeSourceName(source: string) {
  return source.trim().toLowerCase()
}

function isExplicitAlumniMarker(value: SourcePerson['alumni']) {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value !== 'string') {
    return false
  }

  return /^(?:1|alumni|true|y|yes)$/i.test(value.trim())
}

function normalizeAffiliation(homeInstitution?: string) {
  const affiliation = homeInstitution?.trim()

  if (!affiliation) {
    return undefined
  }

  const expandedAffiliations: Record<string, string> = {
    Oxford: 'University of Oxford',
    Imperial: 'Imperial College London',
    UCL: 'University College London',
  }

  return expandedAffiliations[affiliation] ?? affiliation
}

function normalizeResearchAreas(researchInterestKeywords: string[] | string) {
  const keywords = Array.isArray(researchInterestKeywords)
    ? researchInterestKeywords
    : researchInterestKeywords.split(/[;,]/)
  const normalizedAreas: string[] = []

  for (const keyword of keywords) {
    const canonicalAreas = normalizePeopleResearchArea(keyword)

    for (const area of canonicalAreas) {
      if (!normalizedAreas.includes(area)) {
        normalizedAreas.push(area)
      }
    }
  }

  return normalizedAreas
}

export function normalizePeopleResearchAreas(
  researchInterestKeywords: string[] | string,
) {
  return normalizeResearchAreas(researchInterestKeywords)
}

function normalizePeopleResearchArea(keyword: string) {
  const trimmedKeyword = keyword.trim()

  if (!trimmedKeyword) {
    return []
  }

  return (
    canonicalPeopleResearchAreaKeys.get(normalizeResearchAreaKey(trimmedKeyword)) ??
    peopleResearchAreaAliases.get(normalizeResearchAreaKey(trimmedKeyword)) ?? [
      trimmedKeyword,
    ]
  )
}

function normalizeResearchAreaKey(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function parsePublicPersonLinks(sourceLinks?: string) {
  if (!sourceLinks?.trim()) {
    return undefined
  }

  const links: PersonLinkSet = {}

  for (const value of sourceLinks.split(/[\n;,|]+|\s+(?=https?:\/\/|www\.|@)/i)) {
    const link = normalizePublicPersonLink(value)

    if (link && !links[link.key]) {
      links[link.key] = link.href
    }
  }

  return Object.keys(links).length > 0 ? links : undefined
}

function mergePersonLinks(
  existingLinks?: PersonLinkSet,
  supplementalLinks?: PersonLinkSet,
) {
  if (!supplementalLinks) {
    return existingLinks
  }

  const links: PersonLinkSet = { ...existingLinks }

  for (const [key, href] of Object.entries(supplementalLinks)) {
    if (!links[key as keyof PersonLinkSet]) {
      links[key as keyof PersonLinkSet] = href
    }
  }

  return Object.keys(links).length > 0 ? links : undefined
}

function normalizePublicPersonLink(value: string) {
  const trimmedValue = cleanPublicLinkValue(value)

  if (!trimmedValue || isPlaceholderLinkValue(trimmedValue)) {
    return undefined
  }

  const handle = trimmedValue.match(/^@([A-Za-z0-9_]{1,15})$/)

  if (handle) {
    return {
      key: 'twitter' as const,
      href: `https://x.com/${handle[1]}`,
    }
  }

  const href = normalizePublicUrl(trimmedValue)

  if (!href) {
    return undefined
  }

  const hostname = new URL(href).hostname.toLowerCase().replace(/^www\./, '')

  if (/^scholar\.google\./.test(hostname)) {
    return { key: 'googleScholar' as const, href }
  }

  if (isHostnameOrSubdomain(hostname, 'github.com')) {
    return { key: 'github' as const, href }
  }

  if (isHostnameOrSubdomain(hostname, 'linkedin.com')) {
    return { key: 'linkedin' as const, href }
  }

  if (
    isHostnameOrSubdomain(hostname, 'x.com') ||
    isHostnameOrSubdomain(hostname, 'twitter.com')
  ) {
    return { key: 'twitter' as const, href }
  }

  if (isHostnameOrSubdomain(hostname, 'bsky.app')) {
    return { key: 'bluesky' as const, href }
  }

  return { key: 'website' as const, href }
}

function isPlaceholderLinkValue(value: string) {
  return /^(?:n\s*\/\s*a|na|none|null|nil|-|--|no|nope|placeholder)$/i.test(
    value,
  )
}

function cleanPublicLinkValue(value: string) {
  return value
    .trim()
    .replace(
      /^(?:website|site|x|twitter|scholar|google scholar|linkedin|github)\s*:\s*/i,
      '',
    )
    .replace(
      /\s+\((?:website|site|x|twitter|scholar|google scholar|linkedin|github)\)\s*$/i,
      '',
    )
    .trim()
}

function normalizePublicUrl(value: string) {
  if (isEmailLikeValue(value) || value.toLowerCase().startsWith('mailto:')) {
    return undefined
  }

  const maybeUrl = /^https?:\/\//i.test(value) ? value : `https://${value}`

  try {
    const url = new URL(maybeUrl)

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return undefined
    }

    if (!isDomainLikeHostname(url.hostname)) {
      return undefined
    }

    return url.toString().replace(/\/$/, '')
  } catch {
    return undefined
  }
}

function isEmailLikeValue(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isDomainLikeHostname(hostname: string) {
  return hostname.includes('.') && !hostname.startsWith('.') && !hostname.endsWith('.')
}

function isHostnameOrSubdomain(hostname: string, domain: string) {
  return hostname === domain || hostname.endsWith(`.${domain}`)
}

const personSlugAliases: Record<string, string> = {
  'alex-rutherford': 'alexander-rutherford',
  'jonathan-cook': 'jonny-cook',
}

function getCanonicalPersonSlug(name: string) {
  const slug = slugify(name)

  return personSlugAliases[slug] ?? slug
}

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function buildProfileAssetUrl(personSlug: string) {
  if (personSlug === 'ani-calinescu') {
    return '/profile-assets/ani-calinescu-new.jpg'
  }

  if (personSlug === 'antoine-cully') {
    return '/profile-assets/Antoine-Cully-new.png'
  }

  if (personSlug === 'jakob-foerster') {
    return '/profile-assets/jakob-foerster-new.png'
  }

  if (personSlug === 'ravi-hammond') {
    return '/profile-assets/ravi-hammond.png'
  }

  if (personSlug === 'shimon-whiteson') {
    return '/profile-assets/shimon-whiteson-new.jpg'
  }

  return `/profile-assets/${personSlug}.webp`
}

export const people = buildWebsiteRoster(ourPeople)

export const roleOrder = [
  'Principal Investigator',
  'Adjunct Faculty',
  'Postdoc',
  'PhD Student',
  'Masters Student',
  'Associate Members',
  'Alumni',
]
