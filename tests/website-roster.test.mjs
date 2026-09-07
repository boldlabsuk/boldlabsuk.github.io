import assert from 'node:assert/strict'
import test from 'node:test'
import { buildWebsiteRoster, people } from '../src/content/people.ts'
import {
  buildPeopleDirectoryViewModel,
  peopleSectionOrder,
} from '../src/domain/people.ts'
import { getPersonSocialLinkItems } from '../src/ui/cards/socialLinkItems.ts'
import { emptyFilters } from './fixtures/website-roster.mjs'
import * as fixtures from './fixtures/website-roster-source.mjs'

test('Website Roster derives public Person Listings from central source rows', () => {
  const roster = buildWebsiteRoster(fixtures.centralSourceRowsSourcePeople)

  assert.deepEqual(
    roster.map((person) => [
      person.slug,
      person.name,
      person.role,
      person.group,
    ]),
    [
      ['included-pi', 'Included PI', 'BOLD PI', 'BOLD PI'],
      ['blank-flag-postdoc', 'Blank Flag Postdoc', 'Postdoc', 'Postdoc'],
    ],
  )
  assert.deepEqual(
    roster.map((person) => person.affiliation),
    ['Oxford', 'Imperial'],
  )
  assert.deepEqual(
    roster.map((person) => person.image),
    [
      '/profile-assets/included-pi.webp',
      '/profile-assets/blank-flag-postdoc.webp',
    ],
  )
  assert.deepEqual(roster[1]?.supervisors, ['Included PI', 'External Mentor'])
  assert.equal(roster[0]?.piRole, 'Strategic Lead')
  assert.equal(Object.hasOwn(roster[1] ?? {}, 'piRole'), false)

  const directory = buildPeopleDirectoryViewModel({
    people: roster,
    filters: emptyFilters,
  })

  assert.deepEqual(
    peopleSectionOrder,
    fixtures.centralSourceRowsExpectedPeopleSectionOrder,
  )
  assert.deepEqual(
    directory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [
      ['Principal Investigator', ['included-pi']],
      ['Postdoc', ['blank-flag-postdoc']],
    ],
  )
})

test('Website Roster normalizes source Research Area keywords to canonical public areas', () => {
  const roster = buildWebsiteRoster(fixtures.researchAreasSourcePeople)

  assert.deepEqual(
    roster[0]?.researchAreas,
    fixtures.researchAreasExpectedRoster,
  )
})

test('Website Roster maps unsupported profile source formats to generated web-safe assets', () => {
  const roster = buildWebsiteRoster(fixtures.profileFormatsSourcePeople)

  assert.deepEqual(
    roster.map((person) => person.image),
    ['/profile-assets/heic-upload.webp', '/profile-assets/pdf-upload.webp'],
  )
})

test('Website Roster retains explicit source alumni markers outside the public directory', () => {
  const roster = buildWebsiteRoster(fixtures.explicitAlumniSourcePeople)

  const directory = buildPeopleDirectoryViewModel({
    people: roster,
    filters: emptyFilters,
  })
  const listings = directory.sections.flatMap((section) => section.people)

  assert.equal(
    roster.find((person) => person.slug === 'flagged-alumni')?.alumni,
    true,
  )
  assert.equal(listings.length, 2)
  assert.equal(directory.totalPeople, 2)
  assert.deepEqual(
    directory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [
      ['Principal Investigator', ['current-pi']],
      ['Associate Members', ['unmarked-alumni-role']],
    ],
  )
})

test('Website Roster only creates supplemental Alumni from the explicit alumni source', () => {
  const roster = buildWebsiteRoster(fixtures.supplementalAlumniSourcePeople)

  const directory = buildPeopleDirectoryViewModel({
    people: roster,
    filters: emptyFilters,
  })

  assert.deepEqual(
    roster.map((person) => [person.slug, person.links]),
    fixtures.supplementalAlumniExpectedRoster,
  )
  assert.equal(
    roster.find((person) => person.slug === 'explicit-alumni')?.alumni,
    true,
  )
  assert.deepEqual(
    directory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [['PhD Student', ['current-linked-person']]],
  )
  assert.equal(directory.totalPeople, 1)
})

test('Website Roster parses public profile links from source social-links text', () => {
  const roster = buildWebsiteRoster(fixtures.publicLinksSourcePeople)

  assert.deepEqual(roster[0]?.links, fixtures.publicLinksExpectedRoster)
})

test('Website Roster parses labeled and pipe-separated source profile links', () => {
  const roster = buildWebsiteRoster(fixtures.labeledLinksSourcePeople)

  assert.deepEqual(roster[0]?.links, fixtures.labeledLinksExpectedRoster)
})

test('Website Roster shortens source affiliation names for public display', () => {
  const roster = buildWebsiteRoster(fixtures.affiliationsSourcePeople)

  assert.deepEqual(
    roster.map((person) => person.affiliation),
    fixtures.affiliationsExpectedRoster,
  )
})

test('Full Website Roster exposes PI role metadata only for named Principal Investigators', () => {
  const expectedPiRoles = fixtures.piMetadataExpectedPiRoles

  assert.deepEqual(
    Object.fromEntries(
      people
        .filter((person) => person.piRole)
        .map((person) => [person.slug, person.piRole]),
    ),
    expectedPiRoles,
  )
})

test('Full Website Roster carries Associate Faculty titles and affiliations', () => {
  assert.deepEqual(
    Object.fromEntries(
      people
        .filter((person) => person.group === 'Associate Faculty')
        .map((person) => [
          person.slug,
          {
            role: person.role,
            affiliation: person.affiliation,
          },
        ]),
    ),
    fixtures.expectedAssociateFacultyMetadata,
  )
})

for (const { slug, fields } of fixtures.phdMetadataByPerson) {
  test(`Full Website Roster carries PhD cohort and CDT metadata for ${slug}`, () => {
    const person = people.find((entry) => entry.slug === slug)
    for (const [field, expected] of Object.entries(fields)) {
      assert.equal(person?.[field], expected, field)
    }
  })
}

test('Full Website Roster carries spreadsheet supervisor attachments', () => {
  assert.deepEqual(
    people.find((person) => person.slug === 'keyue-jiang')?.supervisors,
    ['Laura Toni'],
  )
  assert.deepEqual(
    people.find((person) => person.slug === 'alex-goldie')?.supervisors,
    ['Jakob Foerster', 'Shimon Whiteson'],
  )
  assert.deepEqual(
    people.find((person) => person.slug === 'borja-gonzalez-leon')?.supervisors,
    ['Tim Rocktäschel', 'Jakob Foerster', 'Antoine Cully'],
  )
  assert.equal(
    people.find((person) => person.slug === 'jakob-foerster')?.supervisors,
    undefined,
  )
})

test('Website Roster recognizes Bluesky profile links', () => {
  const roster = buildWebsiteRoster(fixtures.blueskySourcePeople)

  assert.deepEqual(roster[0]?.links, {
    bluesky: 'https://bsky.app/profile/bluesky-researcher.bsky.social',
  })
})

test('Website Roster classifies first-party social subdomain URLs as social links', () => {
  const roster = buildWebsiteRoster(fixtures.socialDomainsSourcePeople)

  assert.deepEqual(roster[0]?.links, {
    linkedin: 'https://uk.linkedin.com/in/regional-social',
    website: 'https://regional-social.example',
  })
})

test('Website Roster parsed links feed Primary Person Link priority', () => {
  const roster = buildWebsiteRoster(fixtures.primaryLinksSourcePeople)

  const directory = buildPeopleDirectoryViewModel({
    people: roster,
    filters: emptyFilters,
  })

  assert.deepEqual(
    directory.sections.flatMap((section) =>
      section.people.map((listing) => [
        listing.slug,
        listing.primaryPersonLink,
      ]),
    ),
    fixtures.primaryLinksExpectedDirectory,
  )
})

test('Website Roster ignores invalid placeholders and Gmail values as public links', () => {
  const roster = buildWebsiteRoster(fixtures.privateLinksSourcePeople)

  const directory = buildPeopleDirectoryViewModel({
    people: roster,
    filters: emptyFilters,
  })
  const listing = directory.sections[0]?.people[0]

  assert.equal(roster[0]?.links, undefined)
  assert.equal(listing?.primaryPersonLink, null)
  assert.equal(listing?.links, undefined)
})

test('Person Listing compact links remain available for parsed public links', () => {
  const roster = buildWebsiteRoster(fixtures.compactLinksSourcePeople)

  const links = getPersonSocialLinkItems({
    links: roster[0]?.links,
    personName: 'Compact Linked',
  })

  assert.deepEqual(
    links.map((link) => [link.label, link.href, link.isEmail]),
    fixtures.compactLinksExpectedLinks,
  )
})
