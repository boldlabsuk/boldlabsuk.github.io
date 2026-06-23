import { X } from 'lucide-react'
import { useState } from 'react'
import { people } from '../../content'
import {
  buildPeopleDirectoryViewModel,
  getPeopleActiveFilterPills,
  getPeopleFilterOptions,
  shufflePeopleWithinSections,
  type PeopleActiveFilterPill,
} from '../../domain/people'
import { allFilterValue } from '../../domain/shared'
import { PersonListing } from '../../ui/cards/PersonListing'
import { SearchInput } from '../../ui/forms/SearchInput'
import { SelectFilter } from '../../ui/forms/SelectFilter'
import { EmptyState } from '../../ui/primitives/EmptyState'

const shuffledPeople = shufflePeopleWithinSections(people)

export function PeoplePage() {
  const [query, setQuery] = useState('')
  const [section, setSection] = useState(allFilterValue)
  const [area, setArea] = useState(allFilterValue)
  const [affiliation, setAffiliation] = useState(allFilterValue)

  const { sections, areas, affiliations } = getPeopleFilterOptions()
  const filters = { query, section, area, affiliation }
  const activeFilterPills = getPeopleActiveFilterPills(filters)
  const directory = buildPeopleDirectoryViewModel({
    people: shuffledPeople,
    filters,
  })

  function clearPeopleFilter(key: PeopleActiveFilterPill['key']) {
    if (key === 'query') {
      setQuery('')
    } else if (key === 'section') {
      setSection(allFilterValue)
    } else if (key === 'area') {
      setArea(allFilterValue)
    } else {
      setAffiliation(allFilterValue)
    }
  }

  return (
    <>
      <section className="section-band page-content people-page-content">
        <div className="filter-panel people-filter-panel" aria-label="People filters">
          <SearchInput
            id="people-search"
            label="Search by name"
            value={query}
            onChange={setQuery}
            placeholder="Search people"
          />
          <SelectFilter
            id="people-section"
            label="People Section"
            value={section}
            options={[allFilterValue, ...sections]}
            onChange={setSection}
          />
          <SelectFilter
            id="people-area"
            label="Research area"
            value={area}
            options={[allFilterValue, ...areas]}
            onChange={setArea}
          />
          <SelectFilter
            id="people-affiliation"
            label="Affiliation"
            value={affiliation}
            options={[allFilterValue, ...affiliations]}
            onChange={setAffiliation}
          />
          <div className="people-filter-actions">
            <div
              className="people-active-filter-pills"
              role={activeFilterPills.length > 0 ? 'group' : undefined}
              aria-label={
                activeFilterPills.length > 0 ? 'Active people filters' : undefined
              }
            >
              {activeFilterPills.map((pill) => (
                <button
                  className="people-active-filter-pill"
                  type="button"
                  key={pill.key}
                  aria-label={pill.removeLabel}
                  onClick={() => clearPeopleFilter(pill.key)}
                >
                  <span className="people-active-filter-pill-text">
                    <span className="people-active-filter-pill-label">
                      {pill.label}
                    </span>
                    <span className="people-active-filter-pill-separator">:</span>{' '}
                    <strong>{pill.value}</strong>
                  </span>
                  <span
                    className="people-active-filter-pill-remove"
                    aria-hidden="true"
                  >
                    <X aria-hidden="true" focusable="false" />
                  </span>
                </button>
              ))}
            </div>
            <button
              className="button button-filter-reset"
              type="button"
              onClick={() => {
                setQuery('')
                setSection(allFilterValue)
                setArea(allFilterValue)
                setAffiliation(allFilterValue)
              }}
            >
              Reset filters
            </button>
          </div>
        </div>

        <div
          className="result-count"
          id="people-result-count"
          role="status"
          aria-atomic="true"
          aria-live="polite"
        >
          Showing {directory.visiblePeopleCount} of {directory.totalPeople} people
        </div>

        {directory.sections.length > 0 ? (
          <div
            className="people-directory"
            id="people-results"
            aria-describedby="people-result-count"
          >
            {directory.sections.map((peopleSection) => (
              <section
                className="people-section"
                key={peopleSection.title}
              >
                <h2>{peopleSection.label}</h2>
                <div className="person-listing-grid">
                  {peopleSection.people.map((listing) => (
                    <PersonListing key={listing.slug} listing={listing} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div
            id="people-results"
            role="status"
            aria-atomic="true"
            aria-live="polite"
            aria-describedby="people-result-count"
          >
            <EmptyState message="No people match the selected filters." />
          </div>
        )}
      </section>
    </>
  )
}
