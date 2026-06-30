import type { Person, PersonLinkSet } from '../content.ts'
import { canonicalPeopleResearchAreas, people } from '../content.ts'
import { sortedNews } from './news.ts'
import { sortedPapers } from './papers.ts'
import { allFilterValue, unique } from './shared.ts'

export const peopleSectionOrder = [
  'Principal Investigator',
  'Adjunct Faculty',
  'Postdoc',
  'PhD Student',
  'Research Engineers',
  'Masters Student',
  'Incoming PhD Students',
  'Associate Faculty',
  'Associate Members',
] as const

export type PeopleSection = (typeof peopleSectionOrder)[number]

export const peopleSectionLabels: Record<PeopleSection, string> = {
  'Principal Investigator': 'Principal Investigators',
  'Adjunct Faculty': 'Adjunct Faculty',
  Postdoc: 'Postdocs',
  'Research Engineers': 'Research Engineers',
  'PhD Student': 'PhD Students',
  'Incoming PhD Students': 'Incoming PhD Students',
  'Masters Student': "Master's Students",
  'Associate Faculty': 'Associate Faculty',
  'Associate Members': 'Associate Members',
}

const staticPeopleSectionOrders: Partial<
  Record<PeopleSection, readonly string[]>
> = {
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

const surnameSortedPeopleSections = new Set<PeopleSection>([
  'Postdoc',
  'Incoming PhD Students',
  'Masters Student',
  'Associate Faculty',
  'Associate Members',
])

export type PeopleDirectoryFilters = {
  query: string
  section: string
  area: string
  affiliation: string
  supervisor: string
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
  piRole?: string
  affiliation?: string
  image?: string
  links?: PersonLinkSet
  peopleSection: PeopleSection
  primaryPersonLink: string | null
  phdSortSurname?: string
  phdStartYear?: number
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
  const supervisor = (filters.supervisor ?? allFilterValue).trim()

  if (query) {
    pills.push(createPeopleActiveFilterPill('query', 'Name', query))
  }

  if (section && section !== allFilterValue) {
    pills.push(
      createPeopleActiveFilterPill(
        'section',
        'Role',
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

  if (supervisor && supervisor !== allFilterValue) {
    pills.push(
      createPeopleActiveFilterPill('supervisor', 'Supervisor', supervisor),
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
  'PhD Student': 'PhD Student',
  'DPhil Student': 'PhD Student',
  'PhD student': 'PhD Student',
  'Masters Student': 'Masters Student',
  'Master Student': 'Masters Student',
  'Current Masters Student, but inc. PhD this fall with Jakob+Shimon':
    'Masters Student',
  'Associate Faculty': 'Associate Faculty',
  'Associate Members': 'Associate Members',
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
    displayLabel: value,
    removeLabel: `Remove ${label.toLowerCase()} filter: ${value}`,
  }
}

export function getPeopleSectionFilterLabel(section: string) {
  return peopleSectionOrder.includes(section as PeopleSection)
    ? peopleSectionLabels[section as PeopleSection]
    : section
}

export function getPeopleFilterOptions() {
  const directoryPeople = people.filter(
    (person) => getPeopleSection(person) !== null,
  )
  const visibleAreaSet = new Set(
    directoryPeople.flatMap((person) => person.researchAreas),
  )
  const canonicalAreaSet = new Set<string>(canonicalPeopleResearchAreas)
  const supervisorSet = new Set(
    directoryPeople.flatMap((person) => person.supervisors ?? []),
  )
  const principalInvestigatorSupervisors = orderPeopleWithinSection(
    directoryPeople.filter(
      (person) => getPeopleSection(person) === 'Principal Investigator',
    ),
    'Principal Investigator',
    Math.random,
  )
    .map((person) => person.name)
    .filter((name) => supervisorSet.has(name))

  return {
    sections: [...peopleSectionOrder],
    areas: [
      ...canonicalPeopleResearchAreas.filter((area) =>
        visibleAreaSet.has(area),
      ),
      ...unique(
        [...visibleAreaSet].filter((area) => !canonicalAreaSet.has(area)),
      ),
    ],
    affiliations: unique(
      directoryPeople.flatMap((person) =>
        person.affiliation ? [person.affiliation] : [],
      ),
    ),
    supervisors: [
      ...principalInvestigatorSupervisors,
      ...unique(
        [...supervisorSet].filter(
          (supervisor) =>
            !principalInvestigatorSupervisors.includes(supervisor),
        ),
      ),
    ],
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
    'Incoming PhD Students': [],
    'Masters Student': [],
    'Associate Faculty': [],
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
  if (section === 'PhD Student' || section === 'Incoming PhD Students') {
    return section === 'PhD Student'
      ? orderPhDStudents(people)
      : orderPeopleBySurname(people)
  }

  const staticOrder = staticPeopleSectionOrders[section]

  if (surnameSortedPeopleSections.has(section)) {
    return orderPeopleBySurname(people)
  }

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

type PhDStudentSortable = Pick<
  PersonListing,
  'name' | 'phdSortSurname' | 'phdStartYear'
>

type SurnameSortable = Pick<PersonListing, 'name' | 'phdSortSurname'>

function orderPhDStudents<T extends PhDStudentSortable>(people: T[]) {
  return [...people].sort(comparePhDStudents)
}

function orderPeopleBySurname<T extends SurnameSortable>(people: T[]) {
  return [...people].sort(comparePeopleBySurname)
}

function comparePhDStudents(
  firstPerson: PhDStudentSortable,
  secondPerson: PhDStudentSortable,
) {
  const firstMetadata = getPhDStudentSortMetadata(firstPerson)
  const secondMetadata = getPhDStudentSortMetadata(secondPerson)
  const firstHasKnownStartYear = firstMetadata.phdStartYear !== undefined
  const secondHasKnownStartYear = secondMetadata.phdStartYear !== undefined

  if (firstHasKnownStartYear !== secondHasKnownStartYear) {
    return firstHasKnownStartYear ? -1 : 1
  }

  const startYearComparison =
    firstMetadata.phdStartYear === undefined ||
    secondMetadata.phdStartYear === undefined
      ? 0
      : secondMetadata.phdStartYear - firstMetadata.phdStartYear

  return (
    startYearComparison ||
    comparePeopleSortText(
      firstMetadata.sortSurname,
      secondMetadata.sortSurname,
    ) ||
    comparePeopleSortText(firstPerson.name, secondPerson.name)
  )
}

function comparePeopleBySurname(
  firstPerson: SurnameSortable,
  secondPerson: SurnameSortable,
) {
  return (
    comparePeopleSortText(
      getPersonSortSurname(firstPerson),
      getPersonSortSurname(secondPerson),
    ) || comparePeopleSortText(firstPerson.name, secondPerson.name)
  )
}

function getPhDStudentSortMetadata(person: PhDStudentSortable) {
  return {
    phdStartYear: person.phdStartYear,
    sortSurname: getPersonSortSurname(person),
  }
}

function getPersonSortSurname(person: SurnameSortable) {
  return person.phdSortSurname ?? getFallbackSortSurname(person.name)
}

function getFallbackSortSurname(name: string) {
  const nameWithoutParenthetical = name.replace(/\s*\([^)]*\)\s*/g, ' ').trim()
  const nameParts = nameWithoutParenthetical.split(/\s+/).filter(Boolean)

  return nameParts.at(-1) ?? name.trim()
}

function comparePeopleSortText(firstValue: string, secondValue: string) {
  return firstValue.localeCompare(secondValue, 'en', { sensitivity: 'base' })
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
    const supervisor = (filters.supervisor ?? allFilterValue).trim()
    const hasSupervisorFilter = supervisor && supervisor !== allFilterValue
    const isSelectedSupervisor =
      hasSupervisorFilter &&
      peopleSection === 'Principal Investigator' &&
      person.name === supervisor
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
    const matchesSupervisor =
      !hasSupervisorFilter || person.supervisors?.includes(supervisor)

    return (
      isSelectedSupervisor ||
      (matchesQuery &&
        matchesSection &&
        matchesArea &&
        matchesAffiliation &&
        matchesSupervisor)
    )
  })

  const sections = peopleSectionOrder
    .map((section) => {
      const sectionPeople = matchedPeople
        .filter((directoryPerson) => directoryPerson.peopleSection === section)
        .map(({ person }) => ({
          slug: person.slug,
          name: person.name,
          role: person.role,
          ...(person.piRole ? { piRole: person.piRole } : {}),
          affiliation: person.affiliation,
          image: person.image,
          links: person.links,
          peopleSection: section,
          primaryPersonLink: getPrimaryPersonLink(person),
          ...(person.phdSortSurname
            ? { phdSortSurname: person.phdSortSurname }
            : {}),
          ...(person.phdStartYear === undefined
            ? {}
            : { phdStartYear: person.phdStartYear }),
        }))
      const orderedPeople =
        section === 'PhD Student'
          ? orderPhDStudents(sectionPeople)
          : surnameSortedPeopleSections.has(section)
            ? orderPeopleBySurname(sectionPeople)
            : sectionPeople

      return {
        title: section,
        label: peopleSectionLabels[section],
        people: orderedPeople,
      }
    })
    .filter((section) => section.people.length > 0)

  return {
    sections,
    totalPeople: directoryPeople.length,
    visiblePeopleCount: matchedPeople.length,
  }
}

export function getPeopleSection(
  person: Pick<Person, 'group' | 'alumni' | 'phdStartYear'>,
) {
  if (person.alumni) {
    return null
  }

  const peopleSection =
    groupToPeopleSection[person.group] ?? 'Associate Members'

  if (peopleSection === 'PhD Student' && person.phdStartYear === 2026) {
    return 'Incoming PhD Students'
  }

  return peopleSection
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

  return (
    candidates.find((href): href is string => Boolean(href?.trim())) ?? null
  )
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
