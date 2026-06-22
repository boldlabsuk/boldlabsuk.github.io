import { people, roleOrder } from '../content.ts'
import type { Person } from '../content.ts'
import { sortedNews } from './news.ts'
import { sortedPapers } from './papers.ts'
import { allFilterValue, unique } from './shared.ts'

export const peopleSectionOrder = [
  'PIs',
  'Postdocs',
  'DPhil Students',
  "Master's Students",
  'Associate Members',
  'Alumni',
] as const

export type PeopleSection = (typeof peopleSectionOrder)[number]

export type PeopleDirectoryFilters = {
  query: string
  section: string
  area: string
  affiliation: string
}

export type PersonListing = {
  person: Person
  peopleSection: PeopleSection
}

export type PeopleDirectorySection = {
  title: PeopleSection
  people: PersonListing[]
}

export type PeopleDirectoryViewModel = {
  sections: PeopleDirectorySection[]
  totalPeople: number
  visiblePeopleCount: number
}

const groupToPeopleSection: Record<string, PeopleSection> = {
  Faculty: 'PIs',
  Researchers: 'Postdocs',
  'PhD Students': 'DPhil Students',
  "Master's Students": "Master's Students",
  'Research Engineers': 'Associate Members',
  'Software Engineers': 'Associate Members',
  'Visiting Students': 'Associate Members',
  Fellows: 'Associate Members',
  Staff: 'Associate Members',
  Affiliates: 'Associate Members',
  Alumni: 'Alumni',
}

export type PeopleFilters = {
  query: string
  group: string
  area: string
  affiliation: string
}

export function getPeopleFilterOptions() {
  const sections = peopleSectionOrder.filter((section) =>
    people.some((person) => getPeopleSection(person) === section),
  )

  return {
    sections,
    areas: unique(people.flatMap((person) => person.researchAreas)),
    affiliations: unique(
      people.flatMap((person) => (person.affiliation ? [person.affiliation] : [])),
    ),
  }
}

export function buildPeopleDirectoryViewModel({
  people,
  filters,
}: {
  people: Person[]
  filters: PeopleDirectoryFilters
}): PeopleDirectoryViewModel {
  const matchedPeople = people.filter((person) => {
    const peopleSection = getPeopleSection(person)
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
      people: matchedPeople
        .filter((person) => getPeopleSection(person) === section)
        .map((person) => ({
          person,
          peopleSection: section,
        })),
    }))
    .filter((section) => section.people.length > 0)

  return {
    sections,
    totalPeople: people.length,
    visiblePeopleCount: matchedPeople.length,
  }
}

export function getPeopleSection(person: Pick<Person, 'group' | 'alumni'>) {
  if (person.alumni || person.group === 'Alumni') {
    return 'Alumni'
  }

  return groupToPeopleSection[person.group] ?? 'Associate Members'
}

export function filterPeople({
  query,
  group,
  area,
  affiliation,
}: PeopleFilters) {
  return people
    .filter((person) => {
      const matchesQuery = person.name
        .toLowerCase()
        .includes(query.trim().toLowerCase())
      const matchesGroup = group === allFilterValue || person.group === group
      const matchesArea =
        area === allFilterValue ||
        person.researchAreas.some((item) => item === area)
      const matchesAffiliation =
        affiliation === allFilterValue || person.affiliation === affiliation

      return matchesQuery && matchesGroup && matchesArea && matchesAffiliation
    })
    .sort(comparePeople)
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

export function comparePeople(a: Person, b: Person) {
  const aIndex = roleOrder.indexOf(a.group)
  const bIndex = roleOrder.indexOf(b.group)
  const normalizedA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex
  const normalizedB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex

  if (normalizedA !== normalizedB) {
    return normalizedA - normalizedB
  }

  return a.name.localeCompare(b.name)
}
