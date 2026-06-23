import { canonicalPeopleResearchAreas, people } from '../content.ts'
import type { Person, PersonLinkSet } from '../content.ts'
import { sortedNews } from './news.ts'
import { sortedPapers } from './papers.ts'
import { allFilterValue, unique } from './shared.ts'

export const peopleSectionOrder = [
  'Principal Investigator',
  'Adjunct Faculty',
  'Postdoc',
  'Research Engineers',
  'PhD Student',
  'Masters Student',
  'Associate Members',
] as const

export type PeopleSection = (typeof peopleSectionOrder)[number]

export const peopleSectionLabels: Record<PeopleSection, string> = {
  'Principal Investigator': 'Principal Investigators',
  'Adjunct Faculty': 'Adjunct Faculty',
  Postdoc: 'Postdocs',
  'Research Engineers': 'Research Engineers',
  'PhD Student': 'PhD Students',
  'Masters Student': 'Masters Students',
  'Associate Members': 'Associate Members',
}

const staticPeopleSectionOrders: Partial<Record<PeopleSection, readonly string[]>> = {
  'Principal Investigator': [
    'jakob-foerster',
    'tim-rocktaschel',
    'ani-calinescu',
    'antoine-cully',
    'laura-toni',
    'shimon-whiteson',
  ],
  'Adjunct Faculty': [
    'roberta-raileanu',
    'ed-grefenstette',
    'jack-parker-holder',
  ],
}

export type PeopleDirectoryFilters = {
  query: string
  section: string
  area: string
  affiliation: string
}

export type PeopleActiveFilterPill = {
  key: keyof PeopleDirectoryFilters
  label: string
  value: string
  displayLabel: string
  removeLabel: string
}

export type PersonListing = {
  slug: string
  name: string
  role: string
  affiliation?: string
  image?: string
  links?: PersonLinkSet
  peopleSection: PeopleSection
  primaryPersonLink: string | null
}

export type PeopleDirectorySection = {
  title: PeopleSection
  label: string
  people: PersonListing[]
}

export type PeopleDirectoryViewModel = {
  sections: PeopleDirectorySection[]
  totalPeople: number
  visiblePeopleCount: number
}

export function getPeopleActiveFilterPills(
  filters: PeopleDirectoryFilters,
): PeopleActiveFilterPill[] {
  const pills: PeopleActiveFilterPill[] = []
  const query = filters.query.trim()
  const section = filters.section.trim()
  const area = filters.area.trim()
  const affiliation = filters.affiliation.trim()

  if (query) {
    pills.push(createPeopleActiveFilterPill('query', 'Name', query))
  }

  if (section && section !== allFilterValue) {
    pills.push(
      createPeopleActiveFilterPill(
        'section',
        'Section',
        getPeopleSectionFilterLabel(section),
      ),
    )
  }

  if (area && area !== allFilterValue) {
    pills.push(createPeopleActiveFilterPill('area', 'Area', area))
  }

  if (affiliation && affiliation !== allFilterValue) {
    pills.push(
      createPeopleActiveFilterPill('affiliation', 'Affiliation', affiliation),
    )
  }

  return pills
}

const groupToPeopleSection: Record<string, PeopleSection> = {
  Faculty: 'Principal Investigator',
  'BOLD PI': 'Principal Investigator',
  'Adjunct Faculty': 'Adjunct Faculty',
  Postdoc: 'Postdoc',
  'Research Engineer': 'Research Engineers',
  'Research Engineers': 'Research Engineers',
  'DPhil Student': 'PhD Student',
  'PhD student': 'PhD Student',
  'Master Student': 'Masters Student',
  'Current Masters Student, but inc. PhD this fall with Jakob+Shimon':
    'Masters Student',
}

function createPeopleActiveFilterPill(
  key: keyof PeopleDirectoryFilters,
  label: string,
  value: string,
): PeopleActiveFilterPill {
  return {
    key,
    label,
    value,
    displayLabel: `${label}: ${value}`,
    removeLabel: `Remove ${label.toLowerCase()} filter: ${value}`,
  }
}

function getPeopleSectionFilterLabel(section: string) {
  return peopleSectionOrder.includes(section as PeopleSection)
    ? peopleSectionLabels[section as PeopleSection]
    : section
}

export function getPeopleFilterOptions() {
  const directoryPeople = people.filter((person) => getPeopleSection(person) !== null)
  const visibleAreaSet = new Set(
    directoryPeople.flatMap((person) => person.researchAreas),
  )
  const canonicalAreaSet = new Set<string>(canonicalPeopleResearchAreas)

  return {
    sections: [...peopleSectionOrder],
    areas: [
      ...canonicalPeopleResearchAreas.filter((area) => visibleAreaSet.has(area)),
      ...unique(
        [...visibleAreaSet].filter((area) => !canonicalAreaSet.has(area)),
      ),
    ],
    affiliations: unique(
      directoryPeople.flatMap((person) =>
        person.affiliation ? [person.affiliation] : [],
      ),
    ),
  }
}

export function shufflePeopleWithinSections(
  people: Person[],
  random: () => number = Math.random,
) {
  const peopleBySection: Record<PeopleSection, Person[]> = {
    'Principal Investigator': [],
    'Adjunct Faculty': [],
    Postdoc: [],
    'Research Engineers': [],
    'PhD Student': [],
    'Masters Student': [],
    'Associate Members': [],
  }
  const nonDirectoryPeople: Person[] = []

  for (const person of people) {
    const peopleSection = getPeopleSection(person)

    if (peopleSection) {
      peopleBySection[peopleSection].push(person)
    } else {
      nonDirectoryPeople.push(person)
    }
  }

  return [
    ...peopleSectionOrder.flatMap((section) =>
      orderPeopleWithinSection(peopleBySection[section], section, random),
    ),
    ...nonDirectoryPeople,
  ]
}

function orderPeopleWithinSection(
  people: Person[],
  section: PeopleSection,
  random: () => number,
) {
  const staticOrder = staticPeopleSectionOrders[section]

  return staticOrder
    ? orderStaticPeopleSection(people, staticOrder)
    : shuffleItems(people, random)
}

function orderStaticPeopleSection(
  people: Person[],
  orderedSlugs: readonly string[],
) {
  const peopleBySlug = new Map(people.map((person) => [person.slug, person]))
  const orderedSlugSet = new Set(orderedSlugs)

  return [
    ...orderedSlugs.flatMap((slug) => {
      const person = peopleBySlug.get(slug)

      return person ? [person] : []
    }),
    ...people.filter((person) => !orderedSlugSet.has(person.slug)),
  ]
}

function shuffleItems<T>(items: T[], random: () => number) {
  const shuffledItems = [...items]

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.min(
      index,
      Math.max(0, Math.floor(random() * (index + 1))),
    )
    const item = shuffledItems[index]

    shuffledItems[index] = shuffledItems[swapIndex]
    shuffledItems[swapIndex] = item
  }

  return shuffledItems
}

export function buildPeopleDirectoryViewModel({
  people,
  filters,
}: {
  people: Person[]
  filters: PeopleDirectoryFilters
}): PeopleDirectoryViewModel {
  const directoryPeople = people.flatMap((person) => {
    const peopleSection = getPeopleSection(person)

    return peopleSection ? [{ person, peopleSection }] : []
  })

  const matchedPeople = directoryPeople.filter(({ person, peopleSection }) => {
    const matchesQuery = person.name
      .toLowerCase()
      .includes(filters.query.trim().toLowerCase())
    const matchesSection =
      filters.section === allFilterValue || peopleSection === filters.section
    const matchesArea =
      filters.area === allFilterValue ||
      person.researchAreas.some((item) => item === filters.area)
    const matchesAffiliation =
      filters.affiliation === allFilterValue ||
      person.affiliation === filters.affiliation

    return matchesQuery && matchesSection && matchesArea && matchesAffiliation
  })

  const sections = peopleSectionOrder
    .map((section) => ({
      title: section,
      label: peopleSectionLabels[section],
      people: matchedPeople
        .filter((directoryPerson) => directoryPerson.peopleSection === section)
        .map(({ person }) => ({
          slug: person.slug,
          name: person.name,
          role: person.role,
          affiliation: person.affiliation,
          image: person.image,
          links: person.links,
          peopleSection: section,
          primaryPersonLink: getPrimaryPersonLink(person),
        })),
    }))
    .filter((section) => section.people.length > 0)

  return {
    sections,
    totalPeople: directoryPeople.length,
    visiblePeopleCount: matchedPeople.length,
  }
}

export function getPeopleSection(person: Pick<Person, 'group' | 'alumni'>) {
  if (person.alumni) {
    return null
  }

  return groupToPeopleSection[person.group] ?? 'Associate Members'
}

export function getPrimaryPersonLink(person: Pick<Person, 'links'>) {
  const links = person.links

  if (!links) {
    return null
  }

  const candidates = [
    links.website,
    links.googleScholar,
    links.github,
    links.linkedin,
    links.twitter,
    links.bluesky,
  ]

  return candidates.find((href): href is string => Boolean(href?.trim())) ?? null
}

export function getPerson(slug: string) {
  return people.find((person) => person.slug === slug)
}

export function getAuthoredPapers(person: Person) {
  return sortedPapers.filter((paper) => paper.authorIds?.includes(person.slug))
}

export function getAuthoredPosts(person: Person) {
  return sortedNews.filter((post) => post.authorIds?.includes(person.slug))
}

export function getAuthors(authorIds?: string[]) {
  if (!authorIds) {
    return []
  }

  return authorIds
    .map((id) => people.find((person) => person.slug === id)?.name)
    .filter((name): name is string => Boolean(name))
}
