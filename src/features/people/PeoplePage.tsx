import {
  faMagnifyingGlass,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { people } from '../../content'
import {
  buildPeopleDirectoryViewModel,
  getPeopleActiveFilterPills,
  getPeopleFilterOptions,
  getPeopleSectionFilterLabel,
  shufflePeopleWithinSections,
  type PeopleActiveFilterPill,
  type PeopleDirectorySection,
  type PeopleDirectoryFilters,
} from '../../domain/people'
import { allFilterValue } from '../../domain/shared'
import { PersonListing } from '../../ui/cards/PersonListing'
import { SelectFilter } from '../../ui/forms/SelectFilter'
import { EmptyState } from '../../ui/primitives/EmptyState'
import {
  getNextPeopleActiveFilterPillOrder,
  orderPeopleActiveFilterPills,
  type PeopleActiveFilterPillKey,
} from './activeFilterPillOrder'

const shuffledPeople = shufflePeopleWithinSections(people)
const filterActionRowTransitionMs = 180
const initialViewportPeopleListingImageCount = 6

export function PeoplePage() {
  const [draftQuery, setDraftQuery] = useState('')
  const [query, setQuery] = useState('')
  const [section, setSection] = useState(allFilterValue)
  const [area, setArea] = useState(allFilterValue)
  const [affiliation, setAffiliation] = useState(allFilterValue)
  const [activeFilterPillOrder, setActiveFilterPillOrder] = useState<
    PeopleActiveFilterPillKey[]
  >([])
  const closeTimerRef = useRef<number | null>(null)
  const openFrameRef = useRef<number | null>(null)

  const { sections, areas, affiliations } = getPeopleFilterOptions()
  const filters = { query, section, area, affiliation }
  const activeFilterPills = orderPeopleActiveFilterPills(
    getPeopleActiveFilterPills(filters),
    activeFilterPillOrder,
  )
  const hasActiveFilters = activeFilterPills.length > 0
  const hasDraftQuery = draftQuery.trim().length > 0
  const [isFilterActionRowMounted, setIsFilterActionRowMounted] =
    useState(hasActiveFilters)
  const [isFilterActionRowOpen, setIsFilterActionRowOpen] =
    useState(hasActiveFilters)
  const directory = buildPeopleDirectoryViewModel({
    people: shuffledPeople,
    filters,
  })
  const highPriorityListingSlugs = new Set(
    directory.sections
      .flatMap((peopleSection) => peopleSection.people)
      .slice(0, initialViewportPeopleListingImageCount)
      .map((listing) => listing.slug),
  )

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current)
      }

      if (openFrameRef.current !== null) {
        window.cancelAnimationFrame(openFrameRef.current)
      }
    }
  }, [])

  function clearFilterActionRowTimers() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }

    if (openFrameRef.current !== null) {
      window.cancelAnimationFrame(openFrameRef.current)
      openFrameRef.current = null
    }
  }

  function openFilterActionRow() {
    clearFilterActionRowTimers()

    if (isFilterActionRowMounted) {
      setIsFilterActionRowOpen(true)
      return
    }

    setIsFilterActionRowMounted(true)
    setIsFilterActionRowOpen(false)

    openFrameRef.current = window.requestAnimationFrame(() => {
      openFrameRef.current = null
      setIsFilterActionRowOpen(true)
    })
  }

  function closeFilterActionRow() {
    clearFilterActionRowTimers()
    setIsFilterActionRowOpen(false)

    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null
      setIsFilterActionRowMounted(false)
    }, filterActionRowTransitionMs)
  }

  function updateFilterActionRow(nextFilters: PeopleDirectoryFilters) {
    if (getPeopleActiveFilterPills(nextFilters).length > 0) {
      openFilterActionRow()
    } else {
      closeFilterActionRow()
    }
  }

  function updateActiveFilterControls(nextFilters: PeopleDirectoryFilters) {
    setActiveFilterPillOrder((currentOrder) =>
      getNextPeopleActiveFilterPillOrder(currentOrder, nextFilters),
    )
    updateFilterActionRow(nextFilters)
  }

  function applyNameSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextQuery = draftQuery.trim()

    if (!nextQuery) {
      setDraftQuery('')
      return
    }

    updateActiveFilterControls({ ...filters, query: nextQuery })
    setQuery(nextQuery)
    setDraftQuery('')
  }

  function updateSection(nextSection: string) {
    updateActiveFilterControls({ ...filters, section: nextSection })
    setSection(nextSection)
  }

  function updateArea(nextArea: string) {
    updateActiveFilterControls({ ...filters, area: nextArea })
    setArea(nextArea)
  }

  function updateAffiliation(nextAffiliation: string) {
    updateActiveFilterControls({ ...filters, affiliation: nextAffiliation })
    setAffiliation(nextAffiliation)
  }

  function clearPeopleFilter(key: PeopleActiveFilterPill['key']) {
    const nextFilters = {
      ...filters,
      [key]: key === 'query' ? '' : allFilterValue,
    }

    updateActiveFilterControls(nextFilters)

    if (key === 'query') {
      setQuery('')
      setDraftQuery('')
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
          <form
            className="search-input people-name-search"
            role="search"
            onSubmit={applyNameSearch}
          >
            <label htmlFor="people-search">
              <span>Search by name</span>
            </label>
            <div
              className={
                hasDraftQuery
                  ? 'people-name-search-control has-submit'
                  : 'people-name-search-control'
              }
            >
              <input
                id="people-search"
                type="search"
                value={draftQuery}
                placeholder="Search people"
                onChange={(event) => setDraftQuery(event.target.value)}
              />
              {hasDraftQuery && (
                <button
                  className="people-name-search-submit"
                  type="submit"
                  aria-label="Apply name search"
                >
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    aria-hidden="true"
                    focusable="false"
                  />
                </button>
              )}
            </div>
          </form>
          <SelectFilter
            id="people-section"
            label="People Section"
            value={section}
            options={[allFilterValue, ...sections]}
            getLabel={getPeopleSectionFilterLabel}
            onChange={updateSection}
          />
          <SelectFilter
            id="people-area"
            label="Research area"
            value={area}
            options={[allFilterValue, ...areas]}
            onChange={updateArea}
          />
          <SelectFilter
            id="people-affiliation"
            label="Affiliation"
            value={affiliation}
            options={[allFilterValue, ...affiliations]}
            onChange={updateAffiliation}
          />
          {isFilterActionRowMounted && (
            <div
              className={
                isFilterActionRowOpen
                  ? 'people-filter-actions is-open'
                  : 'people-filter-actions is-closed'
              }
              aria-hidden={!isFilterActionRowOpen}
            >
              <div className="people-filter-actions-inner">
                <div
                  className="people-active-filter-pills"
                  role={hasActiveFilters ? 'group' : undefined}
                  aria-label={
                    hasActiveFilters ? 'Active people filters' : undefined
                  }
                >
                  {activeFilterPills.map((pill) => (
                    <button
                      className="people-active-filter-pill"
                      type="button"
                      key={pill.key}
                      aria-label={pill.removeLabel}
                      disabled={!isFilterActionRowOpen}
                      onClick={() => clearPeopleFilter(pill.key)}
                    >
                      <span className="people-active-filter-pill-text">
                        {pill.displayLabel}
                      </span>
                      <span
                        className="people-active-filter-pill-remove"
                        aria-hidden="true"
                      >
                        <FontAwesomeIcon
                          icon={faXmark}
                          aria-hidden="true"
                          focusable="false"
                        />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {directory.sections.length > 0 ? (
          <div
            className="people-directory"
            id="people-results"
          >
            {directory.sections.map((peopleSection) => (
              <section
                className="people-section"
                key={peopleSection.title}
              >
                <h2>{peopleSection.label}</h2>
                <PersonListingGrid
                  highPriorityListingSlugs={highPriorityListingSlugs}
                  people={peopleSection.people}
                />
              </section>
            ))}
          </div>
        ) : (
          <div
            id="people-results"
            role="status"
            aria-atomic="true"
            aria-live="polite"
          >
            <EmptyState message="No people match the selected filters." />
          </div>
        )}
      </section>
    </>
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
