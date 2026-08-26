import type { PeopleDirectoryFilters } from '../../domain/people.ts'
import { allFilterValue } from '../../domain/shared.ts'

export type PeopleDirectoryFilterOptions = {
  sections: readonly string[]
  supervisors: readonly string[]
  areas: readonly string[]
  affiliations: readonly string[]
}

export function parsePeopleDirectoryFilters(
  url: URL,
  options: PeopleDirectoryFilterOptions,
): PeopleDirectoryFilters {
  return {
    query: url.searchParams.get('q')?.trim() ?? '',
    section: readFilterValue(url.searchParams, 'section', options.sections),
    supervisor: readFilterValue(
      url.searchParams,
      'supervisor',
      options.supervisors,
    ),
    area: readFilterValue(url.searchParams, 'area', options.areas),
    affiliation: readFilterValue(
      url.searchParams,
      'affiliation',
      options.affiliations,
    ),
  }
}

export function buildPeopleDirectoryUrl(
  currentUrl: URL,
  filters: PeopleDirectoryFilters,
) {
  const nextUrl = new URL(currentUrl)
  const filterEntries = [
    ['q', filters.query],
    ['section', filters.section],
    ['supervisor', filters.supervisor],
    ['area', filters.area],
    ['affiliation', filters.affiliation],
  ] as const

  for (const [key] of filterEntries) {
    nextUrl.searchParams.delete(key)
  }

  for (const [key, rawValue] of filterEntries) {
    const value = rawValue.trim()

    if (value && value !== allFilterValue) {
      nextUrl.searchParams.append(key, value)
    }
  }

  return nextUrl
}

function readFilterValue(
  searchParams: URLSearchParams,
  key: string,
  validValues: readonly string[],
) {
  const value = searchParams.get(key)?.trim()

  return value && validValues.includes(value) ? value : allFilterValue
}
