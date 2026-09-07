import { useState } from 'react'
import type { Paper, PaperType } from '../../content'
import { papers, paperTypeLabels } from '../../content'
import {
  filterPapers,
  getFeaturedPapers,
  getPaperFilterOptions,
  groupPapersByYear,
  type PaperFilters,
} from '../../domain/papers'
import { allFilterValue } from '../../domain/shared'
import { PaperCard } from '../../ui/cards/PaperCard'
import { PaperItem } from '../../ui/cards/PaperItem'
import { SearchInput } from '../../ui/forms/SearchInput'
import { SelectFilter } from '../../ui/forms/SelectFilter'
import { PageHero } from '../../ui/layout/PageHero'
import { SectionHeader } from '../../ui/layout/SectionHeader'
import { EmptyState } from '../../ui/primitives/EmptyState'

const initialPaperFilters: PaperFilters = {
  query: '',
  year: allFilterValue,
  area: allFilterValue,
  paperType: allFilterValue,
  venue: allFilterValue,
  author: allFilterValue,
}

const paperSelectFilters = [
  { field: 'year', id: 'paper-year', label: 'Year', options: 'years' },
  { field: 'area', id: 'paper-area', label: 'Research area', options: 'areas' },
  {
    field: 'paperType',
    id: 'paper-type',
    label: 'Paper type',
    options: 'types',
  },
  { field: 'venue', id: 'paper-venue', label: 'Venue', options: 'venues' },
  { field: 'author', id: 'paper-author', label: 'Author', options: 'authors' },
] as const

export function PapersPage() {
  return (
    <>
      <PageHero
        eyebrow="Papers"
        title="Papers"
        description="Explore publications and research outputs from across the lab."
      />
      <FeaturedPapers />
      <PapersArchive />
    </>
  )
}

function FeaturedPapers() {
  return (
    <section className="section-band page-content">
      <SectionHeader
        eyebrow="Featured"
        title="Selected publications."
        description="Highlighted outputs from recent lab research programmes."
      />
      <div className="paper-card-grid">
        {getFeaturedPapers().map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>
    </section>
  )
}

function PapersArchive() {
  const [filters, setFilters] = useState(initialPaperFilters)
  const filteredPapers = filterPapers(filters)
  const updateFilters = (changes: Partial<PaperFilters>) => {
    setFilters((previous) => ({ ...previous, ...changes }))
  }

  return (
    <section className="section-band muted-band page-content">
      <SectionHeader
        eyebrow="Publication List"
        title="Full research output archive."
        description="Search and filter by year, topic, paper type, venue, or author."
      />
      <PaperFiltersPanel
        filters={filters}
        onChange={updateFilters}
        onReset={() => setFilters(initialPaperFilters)}
      />
      <div className="result-count" aria-live="polite">
        Showing {filteredPapers.length} of {papers.length} papers
      </div>
      <PaperResults papers={filteredPapers} />
    </section>
  )
}

function PaperFiltersPanel({
  filters,
  onChange,
  onReset,
}: {
  filters: PaperFilters
  onChange: (changes: Partial<PaperFilters>) => void
  onReset: () => void
}) {
  const options = getPaperFilterOptions()

  return (
    <div className="filter-panel paper-filters">
      <SearchInput
        id="paper-search"
        label="Search papers"
        value={filters.query}
        onChange={(query) => onChange({ query })}
        placeholder="Search papers"
      />
      {paperSelectFilters.map(({ field, id, label, options: optionKey }) => (
        <SelectFilter
          key={field}
          id={id}
          label={label}
          value={filters[field]}
          options={[allFilterValue, ...options[optionKey]]}
          getLabel={field === 'paperType' ? getPaperTypeLabel : undefined}
          onChange={(value) => onChange({ [field]: value })}
        />
      ))}
      <button
        className="button button-filter-reset"
        type="button"
        onClick={onReset}
      >
        Reset filters
      </button>
    </div>
  )
}

function getPaperTypeLabel(option: string) {
  return option === allFilterValue
    ? allFilterValue
    : paperTypeLabels[option as PaperType]
}

function PaperResults({ papers }: { papers: Paper[] }) {
  if (papers.length === 0) {
    return <EmptyState message="No papers match the selected filters." />
  }

  return (
    <div className="year-group-list">
      {Object.entries(groupPapersByYear(papers)).map(
        ([paperYear, yearPapers]) => (
          <section className="year-group" key={paperYear}>
            <h3>{paperYear}</h3>
            <div className="publication-list">
              {yearPapers.map((paper) => (
                <PaperItem key={paper.id} paper={paper} />
              ))}
            </div>
          </section>
        ),
      )}
    </div>
  )
}
