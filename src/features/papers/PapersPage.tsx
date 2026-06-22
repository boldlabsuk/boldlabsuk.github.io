import { useState } from 'react'
import { paperTypeLabels, papers } from '../../content'
import type { PaperType } from '../../content'
import {
  filterPapers,
  getFeaturedPapers,
  getPaperFilterOptions,
  groupPapersByYear,
} from '../../domain/papers'
import { allFilterValue } from '../../domain/shared'
import { PaperCard } from '../../ui/cards/PaperCard'
import { PaperItem } from '../../ui/cards/PaperItem'
import { SearchInput } from '../../ui/forms/SearchInput'
import { SelectFilter } from '../../ui/forms/SelectFilter'
import { PageHero } from '../../ui/layout/PageHero'
import { SectionHeader } from '../../ui/layout/SectionHeader'
import { EmptyState } from '../../ui/primitives/EmptyState'

export function PapersPage() {
  const [query, setQuery] = useState('')
  const [year, setYear] = useState(allFilterValue)
  const [area, setArea] = useState(allFilterValue)
  const [paperType, setPaperType] = useState<PaperType | typeof allFilterValue>(
    allFilterValue,
  )
  const [venue, setVenue] = useState(allFilterValue)
  const [author, setAuthor] = useState(allFilterValue)

  const filterOptions = getPaperFilterOptions()
  const featuredPapers = getFeaturedPapers()
  const filteredPapers = filterPapers({
    query,
    year,
    area,
    paperType,
    venue,
    author,
  })
  const papersByYear = groupPapersByYear(filteredPapers)

  return (
    <>
      <PageHero
        eyebrow="Papers"
        title="Papers"
        description="Explore publications and research outputs from across the institute."
      />

      <section className="section-band page-content">
        <SectionHeader
          eyebrow="Featured"
          title="Selected publications."
          description="Highlighted outputs from recent institute research programmes."
        />
        <div className="paper-card-grid">
          {featuredPapers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      </section>

      <section className="section-band muted-band page-content">
        <SectionHeader
          eyebrow="Publication List"
          title="Full research output archive."
          description="Search and filter by year, topic, paper type, venue, or author."
        />

        <div className="filter-panel paper-filters">
          <SearchInput
            id="paper-search"
            label="Search papers"
            value={query}
            onChange={setQuery}
            placeholder="Search papers"
          />
          <SelectFilter
            id="paper-year"
            label="Year"
            value={year}
            options={[allFilterValue, ...filterOptions.years]}
            onChange={setYear}
          />
          <SelectFilter
            id="paper-area"
            label="Research area"
            value={area}
            options={[allFilterValue, ...filterOptions.areas]}
            onChange={setArea}
          />
          <SelectFilter
            id="paper-type"
            label="Paper type"
            value={paperType}
            options={[allFilterValue, ...filterOptions.types]}
            getLabel={(option) =>
              option === allFilterValue
                ? allFilterValue
                : paperTypeLabels[option as PaperType]
            }
            onChange={(next) =>
              setPaperType(next as PaperType | typeof allFilterValue)
            }
          />
          <SelectFilter
            id="paper-venue"
            label="Venue"
            value={venue}
            options={[allFilterValue, ...filterOptions.venues]}
            onChange={setVenue}
          />
          <SelectFilter
            id="paper-author"
            label="Author"
            value={author}
            options={[allFilterValue, ...filterOptions.authors]}
            onChange={setAuthor}
          />
          <button
            className="button button-filter-reset"
            type="button"
            onClick={() => {
              setQuery('')
              setYear(allFilterValue)
              setArea(allFilterValue)
              setPaperType(allFilterValue)
              setVenue(allFilterValue)
              setAuthor(allFilterValue)
            }}
          >
            Reset filters
          </button>
        </div>

        <div className="result-count" aria-live="polite">
          Showing {filteredPapers.length} of {papers.length} papers
        </div>

        {filteredPapers.length > 0 ? (
          <div className="year-group-list">
            {Object.entries(papersByYear).map(([paperYear, yearPapers]) => (
              <section className="year-group" key={paperYear}>
                <h3>{paperYear}</h3>
                <div className="publication-list">
                  {yearPapers.map((paper) => (
                    <PaperItem key={paper.id} paper={paper} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState message="No papers match the selected filters." />
        )}
      </section>
    </>
  )
}
