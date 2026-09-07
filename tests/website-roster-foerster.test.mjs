import assert from 'node:assert/strict'
import test from 'node:test'
import { buildWebsiteRoster, people } from '../src/content/people.ts'
import {
  buildPeopleDirectoryViewModel,
  getPrimaryPersonLink,
} from '../src/domain/people.ts'
import {
  emptyFilters,
  expectedProfileAssetUrl,
  foersterExpectedPublicLinkTypesBySlug,
  foersterMembersPageFixture,
} from './fixtures/website-roster.mjs'
import * as fixtures from './fixtures/website-roster-foerster.mjs'

test('Website Roster reconciles Foerster aliases into existing People with merged public links', () => {
  const roster = buildWebsiteRoster(fixtures.foersterAliasesSourcePeople)

  assert.deepEqual(
    roster.map((person) => person.slug),
    ['jonny-cook', 'alexander-rutherford', 'kang-li', 'elif-akata'],
  )

  const directory = buildPeopleDirectoryViewModel({
    people: roster,
    filters: emptyFilters,
  })
  const listingBySlug = Object.fromEntries(
    directory.sections
      .flatMap((section) => section.people)
      .map((listing) => [listing.slug, listing]),
  )

  assert.deepEqual(
    roster.find((person) => person.slug === 'jonny-cook')?.links,
    fixtures.expectedAliasJonnyCookLinks,
  )
  assert.deepEqual(
    roster.find((person) => person.slug === 'alexander-rutherford')?.links,
    fixtures.expectedAliasAlexanderRutherfordLinks,
  )
  assert.deepEqual(
    roster.find((person) => person.slug === 'kang-li')?.links,
    fixtures.expectedAliasKangLiLinks,
  )
  assert.equal(
    listingBySlug['alexander-rutherford']?.primaryPersonLink,
    'https://amacrutherford.com',
  )
  assert.equal(
    listingBySlug['kang-li']?.primaryPersonLink,
    'https://scholar.google.com/citations?user=12Q-VD4AAAAJ&hl=en',
  )
  assert.equal(listingBySlug['kang-li']?.peopleSection, 'PhD Student')
  assert.equal(listingBySlug['elif-akata']?.peopleSection, 'Associate Members')
})

test('Full Website Roster has reconciled Foerster people exactly once with merged public links', () => {
  const directory = buildPeopleDirectoryViewModel({
    people,
    filters: emptyFilters,
  })
  const listingBySlug = Object.fromEntries(
    directory.sections
      .flatMap((section) => section.people)
      .map((listing) => [listing.slug, listing]),
  )

  assertReconciledFoersterLinks(listingBySlug)
  assert.equal(listingBySlug['kang-li']?.peopleSection, 'PhD Student')
  assert.equal(listingBySlug['elif-akata']?.peopleSection, 'Associate Members')
})

test('Full Website Roster includes the missing active Foerster People once in the right People Sections', () => {
  const directory = buildPeopleDirectoryViewModel({
    people,
    filters: emptyFilters,
  })
  const listings = directory.sections.flatMap((section) => section.people)
  const listingBySlug = Object.fromEntries(
    listings.map((listing) => [listing.slug, listing]),
  )
  const scopedFoersterPeople = fixtures.missingFoersterScopedFoersterPeople

  assertMissingFoersterListings(listingBySlug, scopedFoersterPeople)
  const searchDirectory = buildPeopleDirectoryViewModel({
    people,
    filters: {
      ...emptyFilters,
      query: 'qizhen',
    },
  })
  const associateDirectory = buildPeopleDirectoryViewModel({
    people,
    filters: {
      ...emptyFilters,
      section: 'Associate Members',
    },
  })

  assertFoersterDirectoryFilters(searchDirectory, associateDirectory)
})

test('Full Website Roster retains scoped Foerster alumni without listing them publicly', () => {
  const directory = buildPeopleDirectoryViewModel({
    people,
    filters: emptyFilters,
  })
  const listings = directory.sections.flatMap((section) => section.people)
  const listingBySlug = Object.fromEntries(
    listings.map((listing) => [listing.slug, listing]),
  )
  const scopedFoersterAlumni = fixtures.foersterAlumniScopedFoersterAlumni

  assertFoersterAlumniVisibility(listingBySlug, scopedFoersterAlumni)
  assert.deepEqual(
    people.find((person) => person.slug === 'noah-sarfati')?.links,
    {
      github: 'https://github.com/NoahSfi',
    },
  )
})

test('Foerster members page comparison is represented in the Website Roster', () => {
  const directory = buildPeopleDirectoryViewModel({
    people,
    filters: emptyFilters,
  })
  const listingBySlug = Object.fromEntries(
    directory.sections
      .flatMap((section) => section.people)
      .map((listing) => [listing.slug, listing]),
  )
  const rosterBySlug = Object.fromEntries(
    people.map((person) => [person.slug, person]),
  )
  const publicFoersterRows = foersterMembersPageFixture.filter(
    ([, , , , peopleSection]) => peopleSection !== 'Alumni',
  )
  const alumniFoersterRows = foersterMembersPageFixture.filter(
    ([, , , , peopleSection]) => peopleSection === 'Alumni',
  )

  assertFoersterPublicComparison(listingBySlug, publicFoersterRows)
  assertFoersterAlumniComparison(
    listingBySlug,
    rosterBySlug,
    alumniFoersterRows,
  )
  assertFoersterComparisonLinks(listingBySlug, rosterBySlug)
})

function assertReconciledFoersterLinks(listingBySlug) {
  assert.deepEqual(
    ['jonny-cook', 'alexander-rutherford', 'kang-li', 'elif-akata'].map(
      (slug) => people.filter((person) => person.slug === slug).length,
    ),
    [1, 1, 1, 1],
  )
  assert.deepEqual(
    people.find((person) => person.slug === 'jonny-cook')?.links,
    fixtures.expectedJonnyCookLinks,
  )
  assert.deepEqual(
    people.find((person) => person.slug === 'alexander-rutherford')?.links,
    fixtures.expectedAlexanderRutherfordLinks,
  )
  assert.deepEqual(
    people.find((person) => person.slug === 'kang-li')?.links,
    fixtures.expectedKangLiLinks,
  )
  assert.deepEqual(
    people.find((person) => person.slug === 'elif-akata')?.links,
    fixtures.expectedElifAkataLinks,
  )
  assert.equal(
    listingBySlug['jonny-cook']?.primaryPersonLink,
    'https://scholar.google.com/citations?user=7tcPHHYAAAAJ&hl=en',
  )
  assert.equal(
    listingBySlug['alexander-rutherford']?.primaryPersonLink,
    'https://amacrutherford.com',
  )
  assert.equal(
    listingBySlug['kang-li']?.primaryPersonLink,
    'https://scholar.google.com/citations?user=12Q-VD4AAAAJ&hl=en',
  )
  assert.equal(
    listingBySlug['elif-akata']?.primaryPersonLink,
    'https://eliaka.github.io',
  )
}

function assertMissingFoersterListings(listingBySlug, scopedFoersterPeople) {
  assert.deepEqual(
    scopedFoersterPeople.map(
      ([slug]) => people.filter((person) => person.slug === slug).length,
    ),
    [1, 1, 1, 1, 1, 1, 1, 1],
  )
  assert.deepEqual(
    scopedFoersterPeople.map(([slug]) => ({
      slug,
      name: listingBySlug[slug]?.name,
      role: listingBySlug[slug]?.role,
      peopleSection: listingBySlug[slug]?.peopleSection,
      image: listingBySlug[slug]?.image,
    })),
    scopedFoersterPeople.map(([slug, name, role, peopleSection]) => ({
      slug,
      name,
      role,
      peopleSection,
      image: expectedProfileAssetUrl(slug),
    })),
  )
  assert.deepEqual(
    people.find((person) => person.slug === 'jakob-foerster')?.links,
    fixtures.expectedJakobFoersterLinks,
  )
  assert.equal(
    listingBySlug['sam-coward']?.primaryPersonLink,
    'https://dramacow.github.io',
  )
}

function assertFoersterDirectoryFilters(searchDirectory, associateDirectory) {
  assert.deepEqual(
    searchDirectory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [['PhD Student', ['qizhen-zhang-irene']]],
  )
  assert.deepEqual(
    ['maksymilian-wolski', 'tim-franzmeyer'].map((slug) =>
      associateDirectory.sections
        .flatMap((section) => section.people)
        .some((listing) => listing.slug === slug),
    ),
    [true, true],
  )
}

function assertFoersterAlumniVisibility(listingBySlug, scopedFoersterAlumni) {
  assert.deepEqual(
    scopedFoersterAlumni.map(
      ([slug]) => people.filter((person) => person.slug === slug).length,
    ),
    [1, 1, 1, 1, 1, 1],
  )
  assert.deepEqual(
    scopedFoersterAlumni.map(([slug]) => {
      const person = people.find((person) => person.slug === slug)

      return {
        slug,
        name: person?.name,
        role: person?.role,
        alumni: person?.alumni,
        image: person?.image,
        listed: Boolean(listingBySlug[slug]),
      }
    }),
    scopedFoersterAlumni.map(([slug, name, role]) => ({
      slug,
      name,
      role,
      alumni: true,
      image: `/profile-assets/${slug}.webp`,
      listed: false,
    })),
  )
  assert.equal(people.filter((person) => person.slug === 'kang-li').length, 1)
  assert.equal(listingBySlug['kang-li']?.peopleSection, 'PhD Student')
  assert.equal(
    people.filter((person) => person.slug === 'timon-willi').length,
    1,
  )
  assert.equal(listingBySlug['timon-willi']?.peopleSection, 'Associate Members')
  assert.equal(
    getPrimaryPersonLink(people.find((person) => person.slug === 'chris-lu')),
    'https://chrislu.page',
  )
}

function assertFoersterPublicComparison(listingBySlug, publicFoersterRows) {
  assert.equal(foersterMembersPageFixture.length, 50)
  assert.deepEqual(
    foersterMembersPageFixture.map(
      ([, , rosterSlug]) =>
        people.filter((person) => person.slug === rosterSlug).length,
    ),
    Array.from({ length: foersterMembersPageFixture.length }, () => 1),
  )
  assert.deepEqual(
    publicFoersterRows.map(([sourceSection, sourceName, rosterSlug]) => {
      const listing = listingBySlug[rosterSlug]

      return {
        sourceSection,
        sourceName,
        rosterSlug,
        name: listing?.name,
        peopleSection: listing?.peopleSection,
        image: listing?.image,
      }
    }),
    publicFoersterRows.map(
      ([
        sourceSection,
        sourceName,
        rosterSlug,
        expectedName,
        peopleSection,
      ]) => ({
        sourceSection,
        sourceName,
        rosterSlug,
        name: expectedName,
        peopleSection,
        image: expectedProfileAssetUrl(rosterSlug),
      }),
    ),
  )
}

function assertFoersterAlumniComparison(
  listingBySlug,
  rosterBySlug,
  alumniFoersterRows,
) {
  assert.deepEqual(
    alumniFoersterRows.map(([sourceSection, sourceName, rosterSlug]) => {
      const person = rosterBySlug[rosterSlug]

      return {
        sourceSection,
        sourceName,
        rosterSlug,
        name: person?.name,
        alumni: person?.alumni,
        image: person?.image,
        listed: Boolean(listingBySlug[rosterSlug]),
      }
    }),
    alumniFoersterRows.map(
      ([sourceSection, sourceName, rosterSlug, expectedName]) => ({
        sourceSection,
        sourceName,
        rosterSlug,
        name: expectedName,
        alumni: true,
        image: `/profile-assets/${rosterSlug}.webp`,
        listed: false,
      }),
    ),
  )
  assert.deepEqual(
    [
      listingBySlug['sebastian-towers']?.primaryPersonLink,
      listingBySlug['maksymilian-wolski']?.primaryPersonLink,
    ],
    [null, null],
  )
}

function assertFoersterComparisonLinks(listingBySlug, rosterBySlug) {
  assert.deepEqual(
    Object.fromEntries(
      ['jonny-cook', 'alexander-rutherford', 'kang-li'].map((slug) => [
        slug,
        listingBySlug[slug]?.peopleSection,
      ]),
    ),
    fixtures.expectedFoersterAliasSections,
  )
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(foersterExpectedPublicLinkTypesBySlug).map(
        ([slug, expectedPublicLinkTypes]) => [
          slug,
          Object.keys(rosterBySlug[slug]?.links ?? {})
            .filter((linkType) => expectedPublicLinkTypes.includes(linkType))
            .sort(),
        ],
      ),
    ),
    Object.fromEntries(
      Object.entries(foersterExpectedPublicLinkTypesBySlug).map(
        ([slug, expectedPublicLinkTypes]) => [
          slug,
          [...expectedPublicLinkTypes].sort(),
        ],
      ),
    ),
  )
}
