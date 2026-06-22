import { paperTypeLabels, papers } from '../content'
import type { Paper, PaperType } from '../content'
import { allFilterValue, unique } from './shared'

export type PaperFilters = {
  query: string
  year: string
  area: string
  paperType: PaperType | typeof allFilterValue
  venue: string
  author: string
}

export const sortedPapers = [...papers].sort((a, b) => {
  if (a.year !== b.year) {
    return b.year - a.year
  }

  return (b.date ?? '').localeCompare(a.date ?? '')
})

export function getFeaturedPapers(limit = 3) {
  return sortedPapers.filter((paper) => paper.featured).slice(0, limit)
}

export function getPaperFilterOptions() {
  return {
    years: unique(sortedPapers.map((paper) => String(paper.year))),
    areas: unique(sortedPapers.flatMap((paper) => paper.researchAreas)),
    venues: unique(
      sortedPapers.flatMap((paper) => (paper.venue ? [paper.venue] : [])),
    ),
    authors: unique(sortedPapers.flatMap((paper) => paper.authors)),
    types: Object.keys(paperTypeLabels),
  }
}

export function filterPapers({
  query,
  year,
  area,
  paperType,
  venue,
  author,
}: PaperFilters) {
  return sortedPapers.filter((paper) => {
    const normalizedQuery = query.trim().toLowerCase()
    const searchableText = [
      paper.title,
      paper.authors.join(' '),
      paper.venue ?? '',
      paper.abstract ?? '',
      paper.summary ?? '',
      ...paper.researchAreas,
    ]
      .join(' ')
      .toLowerCase()
    const matchesQuery =
      normalizedQuery.length === 0 || searchableText.includes(normalizedQuery)
    const matchesYear = year === allFilterValue || String(paper.year) === year
    const matchesArea =
      area === allFilterValue || paper.researchAreas.some((item) => item === area)
    const matchesType = paperType === allFilterValue || paper.paperType === paperType
    const matchesVenue = venue === allFilterValue || paper.venue === venue
    const matchesAuthor =
      author === allFilterValue || paper.authors.some((item) => item === author)

    return (
      matchesQuery &&
      matchesYear &&
      matchesArea &&
      matchesType &&
      matchesVenue &&
      matchesAuthor
    )
  })
}

export function groupPapersByYear(items: Paper[]) {
  return items.reduce<Record<string, Paper[]>>((groups, paper) => {
    const year = String(paper.year)
    groups[year] = [...(groups[year] ?? []), paper]
    return groups
  }, {})
}

export function getPrimaryPaperLink(paper: Paper) {
  return paper.links.paper ?? paper.links.pdf
}
