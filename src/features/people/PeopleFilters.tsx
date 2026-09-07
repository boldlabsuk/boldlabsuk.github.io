import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  getPeopleSectionFilterLabel,
  type PeopleActiveFilterPill,
} from '../../domain/people'
import { allFilterValue } from '../../domain/shared'
import { SelectFilter } from '../../ui/forms/SelectFilter'
import {
  type PeopleDirectoryControls,
  peopleFilterOptions,
} from './usePeopleDirectoryFilters'

type ControlsProps = { controls: PeopleDirectoryControls }

export function PeopleFilters({ controls }: ControlsProps) {
  return (
    <section
      className="filter-panel people-filter-panel"
      aria-label="People filters"
    >
      <PeopleNameSearch controls={controls} />
      <PeopleSelectFilters controls={controls} />
      <PeopleActiveFilters controls={controls} />
    </section>
  )
}

function PeopleNameSearch({ controls }: ControlsProps) {
  const { draftQuery, setDraftQuery, submitNameSearch } = controls
  const hasDraftQuery = draftQuery.trim().length > 0
  return (
    <search className="search-input people-name-search">
      <form onSubmit={submitNameSearch}>
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
              aria-label="Search by name"
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
    </search>
  )
}

const selectFilters = [
  {
    key: 'section',
    label: 'Role',
    options: peopleFilterOptions.sections,
    getLabel: getPeopleSectionFilterLabel,
  },
  {
    key: 'supervisor',
    label: 'Supervisor',
    options: peopleFilterOptions.supervisors,
  },
  { key: 'area', label: 'Research area', options: peopleFilterOptions.areas },
  {
    key: 'affiliation',
    label: 'Affiliation',
    options: peopleFilterOptions.affiliations,
  },
] as const

function PeopleSelectFilters({ controls }: ControlsProps) {
  return selectFilters.map((filter) => (
    <SelectFilter
      key={filter.key}
      id={`people-${filter.key}`}
      label={filter.label}
      value={controls.filters[filter.key] ?? allFilterValue}
      options={[allFilterValue, ...filter.options]}
      getLabel={'getLabel' in filter ? filter.getLabel : undefined}
      onChange={(value) => controls.updateFilter(filter.key, value)}
    />
  ))
}

function PeopleActiveFilters({ controls }: ControlsProps) {
  const { isMounted, isOpen, activeFilterPills } = controls
  if (!isMounted) {
    return null
  }
  return (
    <div
      className={
        isOpen
          ? 'people-filter-actions is-open'
          : 'people-filter-actions is-closed'
      }
      aria-hidden={!isOpen}
    >
      <div className="people-filter-actions-inner">
        <fieldset
          className="people-active-filter-pills"
          aria-label="Active people filters"
        >
          {activeFilterPills.map((pill) => (
            <PeopleFilterPill key={pill.key} pill={pill} controls={controls} />
          ))}
        </fieldset>
      </div>
    </div>
  )
}

function PeopleFilterPill({
  pill,
  controls,
}: ControlsProps & { pill: PeopleActiveFilterPill }) {
  return (
    <button
      className="people-active-filter-pill"
      type="button"
      aria-label={pill.removeLabel}
      disabled={!controls.isOpen}
      onClick={() => controls.clearPeopleFilter(pill.key)}
    >
      <span className="people-active-filter-pill-text">
        {pill.displayLabel}
      </span>
      <span className="people-active-filter-pill-remove" aria-hidden="true">
        <FontAwesomeIcon icon={faXmark} aria-hidden="true" focusable="false" />
      </span>
    </button>
  )
}
