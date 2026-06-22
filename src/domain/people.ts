import { people } from '../content.ts'
import type { Person, PersonLinkSet } from '../content.ts'
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

export function getPeopleFilterOptions() {
  return {
    sections: [...peopleSectionOrder],
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
