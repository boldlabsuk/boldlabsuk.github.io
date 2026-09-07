import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { access, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import test from 'node:test'
import { canonicalPeopleResearchAreas, people } from '../src/content/people.ts'
import { buildPeopleDirectoryViewModel } from '../src/domain/people.ts'
import { allFilterValue } from '../src/domain/shared.ts'
import { emptyFilters } from './fixtures/website-roster.mjs'
import * as fixtures from './fixtures/website-roster-directory.mjs'

test('Every Website Roster Person resolves to an existing generated public image asset', async () => {
  assert.ok(people.length > 0)

  await Promise.all(
    people.map(async (person) => {
      assert.ok(person.image, `${person.name} is missing a profile image URL`)
      assert.match(
        person.image,
        /^\/profile-assets\/[A-Za-z0-9-]+\.(?:jpe?g|png|webp)$/,
      )
      await access(join(process.cwd(), 'public', person.image))
    }),
  )
})

test('Every Website Roster Person uses a distinct generated public image asset', async () => {
  const imageDigests = await Promise.all(
    people.map(async (person) => {
      assert.ok(person.image, `${person.name} is missing a profile image URL`)
      const image = await readFile(join(process.cwd(), 'public', person.image))
      const imageDigest = createHash('sha256').update(image).digest('hex')

      return [person.name, imageDigest]
    }),
  )

  const firstPersonByImage = new Map()

  for (const [personName, imageDigest] of imageDigests) {
    const firstPersonName = firstPersonByImage.get(imageDigest)

    assert.equal(
      firstPersonName,
      undefined,
      `${personName} shares a generated profile asset with ${firstPersonName}`,
    )

    firstPersonByImage.set(imageDigest, personName)
  }
})

test('Full Website Roster builds the real sectioned People Directory', () => {
  const directory = buildPeopleDirectoryViewModel({
    people,
    filters: emptyFilters,
  })
  const listings = directory.sections.flatMap((section) => section.people)

  assertPublicDirectoryCounts(directory, listings)
  const alumniSlugs = new Set(
    people.filter((person) => person.alumni).map((person) => person.slug),
  )

  assertPublicListingVisibility(listings, alumniSlugs)
  const listingBySlug = Object.fromEntries(
    listings.map((listing) => [listing.slug, listing]),
  )
  const expectedNewPublicSlugs = fixtures.publicDirectoryExpectedNewPublicSlugs
  const expectedHiddenNewSlugs = fixtures.publicDirectoryExpectedHiddenNewSlugs

  assertNewPublicListingsAndLinks(
    listingBySlug,
    expectedNewPublicSlugs,
    expectedHiddenNewSlugs,
  )
  assertEstablishedPublicProfileLinks(listingBySlug)
  assertCompactPublicListings(listings, listingBySlug)
})

const directoryFilterCases = [
  {
    name: 'name',
    filters: { query: 'wang' },
    sections: fixtures.expectedNameMatches,
    count: 3,
    total: 125,
  },
  {
    name: 'research area',
    filters: { area: 'Human-AI Interaction' },
    sections: fixtures.expectedResearchAreaMatches,
    count: 8,
  },
  {
    name: 'affiliation',
    filters: { affiliation: 'Imperial' },
    sections: fixtures.expectedAffiliationMatches,
    count: 11,
  },
  {
    name: 'People Section',
    filters: { section: 'Masters Student' },
    sections: fixtures.expectedMastersStudents,
    count: 14,
  },
  {
    name: 'combined filters',
    filters: fixtures.combinedRosterFilters,
    sections: [],
    count: 0,
    total: 125,
  },
  {
    name: 'unmatched name',
    filters: { query: 'not a real person' },
    sections: [],
    count: 0,
    total: 125,
  },
]

for (const scenario of directoryFilterCases) {
  test(`Full Website Roster preserves grouping and counts for ${scenario.name}`, () => {
    const directory = buildPeopleDirectoryViewModel({
      people,
      filters: {
        query: '',
        section: allFilterValue,
        area: allFilterValue,
        affiliation: allFilterValue,
        ...scenario.filters,
      },
    })
    assert.deepEqual(
      directory.sections.map((section) => [
        section.title,
        section.people.map((listing) => listing.slug),
      ]),
      scenario.sections,
    )
    assert.equal(directory.visiblePeopleCount, scenario.count)
    if (scenario.total !== undefined)
      assert.equal(directory.totalPeople, scenario.total)
  })
}

function assertPublicDirectoryCounts(directory, listings) {
  assert.equal(people.length, 131)
  assert.equal(people.filter((person) => person.alumni).length, 6)
  assert.equal(directory.totalPeople, 125)
  assert.deepEqual(
    [
      ...new Set(
        people
          .flatMap((person) => person.researchAreas)
          .filter((area) => !canonicalPeopleResearchAreas.includes(area)),
      ),
    ],
    [],
  )
  assert.equal(directory.visiblePeopleCount, 125)
  assert.deepEqual(
    Object.fromEntries(
      directory.sections.map((section) => [
        section.title,
        section.people.length,
      ]),
    ),
    fixtures.expectedPublicSectionCounts,
  )
  assert.equal(new Set(listings.map((listing) => listing.slug)).size, 125)
  assert.deepEqual(
    directory.sections.map((section) => section.title),
    fixtures.expectedPublicSectionOrder,
  )
}

function assertPublicListingVisibility(listings, alumniSlugs) {
  assert.equal(
    listings.some((listing) => alumniSlugs.has(listing.slug)),
    false,
  )
  assert.ok(
    listings.every(
      (listing) =>
        listing.name &&
        listing.role &&
        listing.affiliation &&
        listing.image?.startsWith('/profile-assets/'),
    ),
  )
}

function assertNewPublicListingsAndLinks(
  listingBySlug,
  expectedNewPublicSlugs,
  expectedHiddenNewSlugs,
) {
  assert.deepEqual(
    expectedNewPublicSlugs.map((slug) => [
      slug,
      listingBySlug[slug]?.peopleSection,
    ]),
    fixtures.expectedNewPublicSections,
  )
  assert.deepEqual(
    expectedHiddenNewSlugs.map((slug) => listingBySlug[slug]),
    expectedHiddenNewSlugs.map(() => undefined),
  )
  assert.deepEqual(
    people.find((person) => person.slug === 'kevin-buhler')?.links,
    fixtures.expectedKevinBuhlerLinks,
  )
  assert.deepEqual(people.find((person) => person.slug === 'colin-lu')?.links, {
    website: 'https://simplegeometry.github.io',
    twitter: 'https://x.com/_colin_lu',
  })
  assert.deepEqual(
    people.find((person) => person.slug === 'marek-masiak')?.links,
    fixtures.expectedMarekMasiakLinks,
  )
  assert.deepEqual(
    people.find((person) => person.slug === 'edan-toledo')?.links,
    fixtures.expectedEdanToledoLinks,
  )
  assert.deepEqual(
    people.find((person) => person.slug === 'borja-gonzalez-leon')?.links,
    fixtures.expectedBorjaGonzalezLeonLinks,
  )
  assert.deepEqual(
    people.find((person) => person.slug === 'henry-heppe')?.links,
    {
      github: 'https://github.com/henry-heppe',
    },
  )
}

function assertEstablishedPublicProfileLinks(listingBySlug) {
  assert.deepEqual(
    people.find((person) => person.slug === 'mert-albeyoglu'),
    fixtures.expectedMertAlbeyogluProfile,
  )
  assert.equal(
    listingBySlug['nathan-monette']?.primaryPersonLink,
    'https://nmonette.github.io',
  )
  assert.equal(
    listingBySlug['shashank-reddy']?.primaryPersonLink,
    'https://shshnkreddy.github.io',
  )
  assert.equal(
    listingBySlug['ani-calinescu']?.primaryPersonLink,
    'https://www.cs.ox.ac.uk/people/ani.calinescu',
  )
  assert.equal(
    listingBySlug['shimon-whiteson']?.primaryPersonLink,
    'https://whirl.cs.ox.ac.uk',
  )
  assert.equal(
    listingBySlug['ed-grefenstette']?.primaryPersonLink,
    'https://www.egrefen.com',
  )
  assert.equal(
    listingBySlug['jack-parker-holder']?.primaryPersonLink,
    'https://jparkerholder.github.io',
  )
  assert.equal(
    listingBySlug['roberta-raileanu']?.primaryPersonLink,
    'https://rraileanu.github.io',
  )
  assert.deepEqual(
    people.find((person) => person.slug === 'gregory-levy')?.links,
    fixtures.expectedGregoryLevyLinks,
  )
}

function assertCompactPublicListings(listings, listingBySlug) {
  assert.equal(
    listingBySlug['gregory-levy']?.primaryPersonLink,
    'https://gregorylevy.github.io',
  )
  assert.ok(
    listings.every(
      (listing) =>
        !Object.hasOwn(listing, 'bio') &&
        !Object.hasOwn(listing, 'researchAreas'),
    ),
  )
}
