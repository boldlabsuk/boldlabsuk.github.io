import { useState } from 'react'
import { people } from '../../content'
import {
  buildPeopleDirectoryViewModel,
  getPeopleFilterOptions,
} from '../../domain/people'
import { allFilterValue } from '../../domain/shared'
import { PersonCard } from '../../ui/cards/PersonCard'
import { SearchInput } from '../../ui/forms/SearchInput'
import { SelectFilter } from '../../ui/forms/SelectFilter'
import { PageHero } from '../../ui/layout/PageHero'
import { EmptyState } from '../../ui/primitives/EmptyState'

export function PeoplePage() {
  const [query, setQuery] = useState('')
  const [section, setSection] = useState(allFilterValue)
  const [area, setArea] = useState(allFilterValue)
  const [affiliation, setAffiliation] = useState(allFilterValue)

  const { sections, areas, affiliations } = getPeopleFilterOptions()
  const directory = buildPeopleDirectoryViewModel({
    people,
    filters: { query, section, area, affiliation },
  })

  return (
    <>
      <PageHero
        eyebrow="Our People"
        title="Our People"
        description="Meet the researchers, engineers, students, fellows, and collaborators building the institute."
      />

      <section className="section-band page-content">
        <div className="filter-panel" aria-label="People filters">
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

        <div className="result-count" aria-live="polite">
          Showing {directory.visiblePeopleCount} of {directory.totalPeople} people
        </div>

        {directory.sections.length > 0 ? (
          <div className="people-directory">
            {directory.sections.map((peopleSection) => (
              <section
                className="people-section"
                key={peopleSection.title}
              >
                <h2>{peopleSection.title}</h2>
                <div className="people-grid">
                  {peopleSection.people.map((listing) => (
                    <PersonCard
                      key={listing.person.slug}
                      person={listing.person}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState message="No people match the selected filters." />
        )}
      </section>
    </>
  )
}
