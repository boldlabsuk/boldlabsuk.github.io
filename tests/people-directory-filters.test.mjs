import assert from 'node:assert/strict'
import test from 'node:test'
import { canonicalPeopleResearchAreas } from '../src/content.ts'
import {
  buildPeopleDirectoryViewModel,
  getPeopleFilterOptions,
  peopleSectionOrder,
} from '../src/domain/people.ts'
import {
  emptyFilters,
  filterFixturePeople,
} from './fixtures/people-directory.mjs'
import * as fixtures from './fixtures/people-directory-filters.mjs'

test('People Directory filter options expose public People Sections and remaining filters', () => {
  const options = getPeopleFilterOptions()

  assert.deepEqual(options.sections, peopleSectionOrder)
  assert.ok(!options.sections.includes('Alumni'))
  assert.deepEqual(options.areas, [...canonicalPeopleResearchAreas])
  assert.deepEqual(
    ['RL', 'LLMs', 'Open-endedness', 'Embodied AI'].filter((area) =>
      options.areas.includes(area),
    ),
    [],
  )
  assert.deepEqual(options.affiliations, ['Imperial', 'UCL', 'Oxford'])
  assert.deepEqual(options.supervisors, fixtures.filterOptionsExpectedOptions)
})

test('People Directory search filters Person Listings while preserving People Sections', () => {
  const directory = buildPeopleDirectoryViewModel({
    people: filterFixturePeople,
    filters: {
      ...emptyFilters,
      query: 'alex',
    },
  })

  assert.deepEqual(
    directory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [['Principal Investigator', ['alex-principal']]],
  )
  assert.equal(directory.visiblePeopleCount, 1)
  assert.equal(directory.totalPeople, 4)
})

test('People Directory People Section filter hides empty People Sections', () => {
  const directory = buildPeopleDirectoryViewModel({
    people: filterFixturePeople,
    filters: {
      ...emptyFilters,
      section: 'Research Engineers',
    },
  })

  assert.deepEqual(
    directory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [['Research Engineers', ['riley-associate']]],
  )
  assert.equal(directory.visiblePeopleCount, 1)
})

test('People Directory research-area filter keeps grouped matching Person Listings', () => {
  const directory = buildPeopleDirectoryViewModel({
    people: filterFixturePeople,
    filters: {
      ...emptyFilters,
      area: 'Evaluation',
    },
  })

  assert.deepEqual(
    directory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [
      ['Principal Investigator', ['alex-principal']],
      ['PhD Student', ['devon-dphil']],
    ],
  )
  assert.equal(directory.visiblePeopleCount, 2)
})

test('People Directory excludes alumni before research-area and affiliation filters', () => {
  const areaDirectory = buildPeopleDirectoryViewModel({
    people: filterFixturePeople,
    filters: {
      ...emptyFilters,
      area: 'Governance',
    },
  })
  const affiliationDirectory = buildPeopleDirectoryViewModel({
    people: filterFixturePeople,
    filters: {
      ...emptyFilters,
      affiliation: 'Public Interest AI Network',
    },
  })

  assert.deepEqual(areaDirectory.sections, [])
  assert.equal(areaDirectory.visiblePeopleCount, 0)
  assert.equal(areaDirectory.totalPeople, 4)
  assert.deepEqual(affiliationDirectory.sections, [])
  assert.equal(affiliationDirectory.visiblePeopleCount, 0)
  assert.equal(affiliationDirectory.totalPeople, 4)
})

test('People Directory affiliation filter keeps grouped matching Person Listings', () => {
  const directory = buildPeopleDirectoryViewModel({
    people: filterFixturePeople,
    filters: {
      ...emptyFilters,
      affiliation: 'BOLD Lab',
    },
  })

  assert.deepEqual(
    directory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [
      ['PhD Student', ['devon-dphil']],
      ['Research Engineers', ['riley-associate']],
    ],
  )
  assert.equal(directory.visiblePeopleCount, 2)
})

test('People Directory supervisor filter keeps the selected Principal Investigator visible', () => {
  const directory = buildPeopleDirectoryViewModel({
    people: filterFixturePeople,
    filters: {
      ...emptyFilters,
      supervisor: 'Alex Principal',
    },
  })

  assert.deepEqual(
    directory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    fixtures.supervisorFilterExpectedDirectory,
  )
  assert.equal(directory.visiblePeopleCount, 4)
})

test('People Directory returns a no-results model when active filters match nobody', () => {
  const directory = buildPeopleDirectoryViewModel({
    people: filterFixturePeople,
    filters: {
      ...emptyFilters,
      query: 'missing person',
    },
  })

  assert.deepEqual(directory.sections, [])
  assert.equal(directory.visiblePeopleCount, 0)
  assert.equal(directory.totalPeople, 4)
})

test('People Directory exposes Primary Person Link priority for Person Listings', () => {
  const directory = buildPeopleDirectoryViewModel({
    people: fixtures.primaryLinksExpected,
    filters: emptyFilters,
  })

  assert.deepEqual(
    directory.sections.flatMap((section) =>
      section.people.map((listing) => [
        listing.name,
        listing.primaryPersonLink,
      ]),
    ),
    fixtures.primaryLinksExpectedDirectory,
  )
})

test('People Directory returns compact Person Listing output without biography or research area fields', () => {
  const directory = buildPeopleDirectoryViewModel({
    people: fixtures.compactListingsExpected,
    filters: emptyFilters,
  })

  assert.deepEqual(
    directory.sections[0]?.people[0],
    fixtures.compactListingsExpectedDirectory,
  )
})

test('People Directory includes PI role only when defined', () => {
  const directory = buildPeopleDirectoryViewModel({
    people: fixtures.piRoleExpected,
    filters: emptyFilters,
  })

  const listings = directory.sections.flatMap((section) => section.people)
  const listingBySlug = Object.fromEntries(
    listings.map((listing) => [listing.slug, listing]),
  )

  assert.equal(listingBySlug['pi-with-role']?.piRole, 'Training Environment')
  assert.equal(
    Object.hasOwn(listingBySlug['postdoc-without-role'] ?? {}, 'piRole'),
    false,
  )
})
