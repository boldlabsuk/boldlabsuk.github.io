import { useState } from 'react'
import { people } from '../../content'
import {
  filterPeople,
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
  const [group, setGroup] = useState(allFilterValue)
  const [area, setArea] = useState(allFilterValue)
  const [affiliation, setAffiliation] = useState(allFilterValue)

  const { groups, areas, affiliations } = getPeopleFilterOptions()
  const filteredPeople = filterPeople({ query, group, area, affiliation })

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
            id="people-group"
            label="Role/group"
            value={group}
            options={[allFilterValue, ...groups]}
            onChange={setGroup}
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
              setGroup(allFilterValue)
              setArea(allFilterValue)
              setAffiliation(allFilterValue)
            }}
          >
            Reset filters
          </button>
        </div>

        <div className="result-count" aria-live="polite">
          Showing {filteredPeople.length} of {people.length} people
        </div>

        {filteredPeople.length > 0 ? (
          <div className="people-grid">
            {filteredPeople.map((person) => (
              <PersonCard key={person.slug} person={person} />
            ))}
          </div>
        ) : (
          <EmptyState message="No people match the selected filters." />
        )}
      </section>
    </>
  )
}
