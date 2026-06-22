import { people, roleOrder } from '../content'
import type { Person } from '../content'
import { sortedNews } from './news'
import { sortedPapers } from './papers'
import { allFilterValue, unique } from './shared'

export type PeopleFilters = {
  query: string
  group: string
  area: string
  affiliation: string
}

export function getPeopleFilterOptions() {
  return {
    groups: roleOrder.filter((role) =>
      people.some((person) => person.group === role),
    ),
    areas: unique(people.flatMap((person) => person.researchAreas)),
    affiliations: unique(
      people.flatMap((person) => (person.affiliation ? [person.affiliation] : [])),
    ),
  }
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
