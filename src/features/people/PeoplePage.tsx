import { people } from '../../content'
import {
  buildPeopleDirectoryViewModel,
  type PeopleDirectorySection,
  shufflePeopleWithinSections,
} from '../../domain/people'
import { PersonListing } from '../../ui/cards/PersonListing'
import { EmptyState } from '../../ui/primitives/EmptyState'
import { PeopleFilters } from './PeopleFilters'
import { usePeopleDirectoryFilters } from './usePeopleDirectoryFilters'

const shuffledPeople = shufflePeopleWithinSections(people)
const initialViewportPeopleListingImageCount = 6

export function PeoplePage() {
  const controls = usePeopleDirectoryFilters()
  const directory = buildPeopleDirectoryViewModel({
    people: shuffledPeople,
    filters: controls.filters,
  })
  return (
    <section className="section-band page-content people-page-content">
      <PeopleFilters controls={controls} />
      <PeopleResults sections={directory.sections} />
    </section>
  )
}

function PeopleResults({ sections }: { sections: PeopleDirectorySection[] }) {
  const highPriorityListingSlugs = new Set(
    sections
      .flatMap((section) => section.people)
      .slice(0, initialViewportPeopleListingImageCount)
      .map((listing) => listing.slug),
  )
  if (sections.length === 0) {
    return (
      <div
        id="people-results"
        role="status"
        aria-atomic="true"
        aria-live="polite"
      >
        <EmptyState message="No people match the selected filters." />
      </div>
    )
  }
  return (
    <div className="people-directory" id="people-results">
      {sections.map((section) => (
        <section className="people-section" key={section.title}>
          <h2>{section.label}</h2>
          <PersonListingGrid
            highPriorityListingSlugs={highPriorityListingSlugs}
            people={section.people}
          />
        </section>
      ))}
    </div>
  )
}

function PersonListingGrid({
  highPriorityListingSlugs,
  people,
}: {
  highPriorityListingSlugs: Set<string>
  people: PeopleDirectorySection['people']
}) {
  return (
    <div className="person-listing-grid">
      {people.map((listing) => (
        <PersonListing
          key={listing.slug}
          imagePriority={
            highPriorityListingSlugs.has(listing.slug) ? 'high' : 'auto'
          }
          listing={listing}
        />
      ))}
    </div>
  )
}
