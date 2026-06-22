import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { access, readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { buildWebsiteRoster, people } from '../src/content/people.ts'
import {
  buildPeopleDirectoryViewModel,
  peopleSectionOrder,
} from '../src/domain/people.ts'
import { allFilterValue } from '../src/domain/shared.ts'
import { getPersonSocialLinkItems } from '../src/ui/cards/socialLinkItems.ts'

const emptyFilters = {
  query: '',
  section: allFilterValue,
  area: allFilterValue,
  affiliation: allFilterValue,
}

test('Website Roster derives public Person Listings from central source rows', () => {
  const roster = buildWebsiteRoster([
    {
      source: 'main',
      name: '  Included PI  ',
      role: '  BOLD PI  ',
      homeInstitution: 'University of Oxford',
      researchInterestKeywords: ['Multi-Agent Reinforcement Learning'],
      profilePicture: 'included-pi.jpg',
      listOnBoldWebsite: 'YES',
    },
    {
      source: 'main',
      name: 'Blank Flag Postdoc',
      role: 'Postdoc',
      homeInstitution: 'Imperial College London',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'blank-flag-postdoc.jpg',
      listOnBoldWebsite: '',
    },
    {
      source: 'main',
      name: 'Opted Out Student',
      role: 'PhD student',
      homeInstitution: 'University College London',
      researchInterestKeywords: ['Language Models'],
      profilePicture: 'opted-out-student.jpg',
      listOnBoldWebsite: 'No',
    },
    {
      source: 'slack',
      name: 'Slack Only Person',
      role: 'Research visitor',
      homeInstitution: 'BOLD Institute',
      researchInterestKeywords: ['Operations'],
      profilePicture: 'slack-only-person.jpg',
      listOnBoldWebsite: 'YES',
    },
    {
      source: 'main',
      name: 'Missing Picture',
      role: 'Master Student',
      homeInstitution: 'University of Oxford',
      researchInterestKeywords: ['Robotics'],
      profilePicture: '',
      listOnBoldWebsite: 'YES',
    },
  ])

  assert.deepEqual(
    roster.map((person) => [person.slug, person.name, person.role, person.group]),
    [
      ['included-pi', 'Included PI', 'BOLD PI', 'BOLD PI'],
      [
        'blank-flag-postdoc',
        'Blank Flag Postdoc',
        'Postdoc',
        'Postdoc',
      ],
    ],
  )
  assert.deepEqual(roster.map((person) => person.affiliation), [
    'University of Oxford',
    'Imperial College London',
  ])
  assert.deepEqual(roster.map((person) => person.image), [
    '/profile-assets/included-pi.webp',
    '/profile-assets/blank-flag-postdoc.webp',
  ])

  const directory = buildPeopleDirectoryViewModel({
    people: roster,
    filters: emptyFilters,
  })

  assert.deepEqual(peopleSectionOrder, [
    'Principal Investigator',
    'Postdoc',
    'PhD Student',
    'Masters Student',
    'Associate Members',
    'Alumni',
  ])
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

test('Website Roster maps unsupported profile source formats to generated web-safe assets', () => {
  const roster = buildWebsiteRoster([
    {
      source: 'main',
      name: 'HEIC Upload',
      role: 'Postdoc',
      homeInstitution: 'University of Oxford',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'heic-upload.HEIC',
      listOnBoldWebsite: 'YES',
    },
    {
      source: 'main',
      name: 'PDF Upload',
      role: 'PhD student',
      homeInstitution: 'Imperial College London',
      researchInterestKeywords: ['Agent Learning'],
      profilePicture: 'pdf-upload.pdf',
      listOnBoldWebsite: 'YES',
    },
  ])

  assert.deepEqual(
    roster.map((person) => person.image),
    ['/profile-assets/heic-upload.webp', '/profile-assets/pdf-upload.webp'],
  )
})

test('Website Roster parses public profile links from source social-links text', () => {
  const roster = buildWebsiteRoster([
    {
      source: 'main',
      name: 'Linked Researcher',
      role: 'Postdoc',
      homeInstitution: 'University of Oxford',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'linked-researcher.jpg',
      listOnBoldWebsite: 'YES',
      socialLinks:
        'linked.example; https://scholar.google.com/citations?user=abc; https://github.com/linked-researcher; https://www.linkedin.com/in/linked-researcher; https://x.com/linked_ai',
    },
  ])

  assert.deepEqual(roster[0]?.links, {
    website: 'https://linked.example',
    googleScholar: 'https://scholar.google.com/citations?user=abc',
    github: 'https://github.com/linked-researcher',
    linkedin: 'https://www.linkedin.com/in/linked-researcher',
    twitter: 'https://x.com/linked_ai',
  })
})

test('Website Roster classifies first-party social subdomain URLs as social links', () => {
  const roster = buildWebsiteRoster([
    {
      source: 'main',
      name: 'Regional Social',
      role: 'Postdoc',
      homeInstitution: 'University of Oxford',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'regional-social.jpg',
      listOnBoldWebsite: 'YES',
      socialLinks:
        'https://uk.linkedin.com/in/regional-social; regional-social.example',
    },
  ])

  assert.deepEqual(roster[0]?.links, {
    linkedin: 'https://uk.linkedin.com/in/regional-social',
    website: 'https://regional-social.example',
  })
})

test('Website Roster parsed links feed Primary Person Link priority', () => {
  const roster = buildWebsiteRoster([
    {
      source: 'main',
      name: 'Website Preferred',
      role: 'Postdoc',
      homeInstitution: 'University of Oxford',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'website-preferred.jpg',
      listOnBoldWebsite: 'YES',
      'social-links':
        'website-preferred.example; https://scholar.google.com/citations?user=website',
    },
    {
      source: 'main',
      name: 'Scholar Preferred',
      role: 'PhD student',
      homeInstitution: 'Imperial College London',
      researchInterestKeywords: ['Agents'],
      profilePicture: 'scholar-preferred.jpg',
      listOnBoldWebsite: 'YES',
      socialLinks:
        'https://scholar.google.com/citations?user=scholar; https://github.com/scholar-preferred',
    },
    {
      source: 'main',
      name: 'Social Only',
      role: 'Master Student',
      homeInstitution: 'University College London',
      researchInterestKeywords: ['Language Models'],
      profilePicture: 'social-only.jpg',
      listOnBoldWebsite: 'YES',
      socialLinks: '@social_only',
    },
  ])

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
    [
      ['website-preferred', 'https://website-preferred.example'],
      [
        'scholar-preferred',
        'https://scholar.google.com/citations?user=scholar',
      ],
      ['social-only', 'https://x.com/social_only'],
    ],
  )
})

test('Website Roster ignores invalid placeholders and Gmail values as public links', () => {
  const roster = buildWebsiteRoster([
    {
      source: 'main',
      name: 'No Public Link',
      role: 'Postdoc',
      homeInstitution: 'University of Oxford',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'no-public-link.jpg',
      listOnBoldWebsite: 'YES',
      socialLinks:
        'n/a; none; no; not a url; no.public.link@gmail.com; mailto:no.public.link@gmail.com',
    },
  ])

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
  const roster = buildWebsiteRoster([
    {
      source: 'main',
      name: 'Compact Linked',
      role: 'Postdoc',
      homeInstitution: 'University of Oxford',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'compact-linked.jpg',
      listOnBoldWebsite: 'YES',
      socialLinks:
        'compact.example; https://scholar.google.com/citations?user=compact; https://github.com/compact-linked; https://www.linkedin.com/in/compact-linked; @compact_linked',
    },
  ])

  const links = getPersonSocialLinkItems({
    links: roster[0]?.links,
    personName: 'Compact Linked',
    compact: true,
  })

  assert.deepEqual(
    links.map((link) => [link.label, link.href, link.isEmail]),
    [
      ['Site', 'https://compact.example', false],
      ['Scholar', 'https://scholar.google.com/citations?user=compact', false],
      ['GitHub', 'https://github.com/compact-linked', false],
      ['LinkedIn', 'https://www.linkedin.com/in/compact-linked', false],
      ['X', 'https://x.com/compact_linked', false],
    ],
  )
})

test('Every Website Roster Person resolves to an existing generated public image asset', async () => {
  assert.ok(people.length > 0)

  await Promise.all(
    people.map(async (person) => {
      assert.ok(person.image, `${person.name} is missing a profile image URL`)
      assert.match(person.image, /^\/profile-assets\/[a-z0-9-]+\.webp$/)
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

  assert.equal(directory.totalPeople, 12)
  assert.equal(directory.visiblePeopleCount, 12)
  assert.deepEqual(
    directory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [
      ['Principal Investigator', ['jakob-foerster']],
      ['Postdoc', ['yulin-wang', 'dylan-cope']],
      [
        'PhD Student',
        ['lukas-seier', 'bidipta-sarkar', 'zilin-wang', 'sam-coward'],
      ],
      ['Masters Student', ['matthew-jackson', 'clarisse-wibault']],
      [
        'Associate Members',
        ['shashank-reddy-chirra', 'jarek-liesen', 'hannah-erlebach'],
      ],
    ],
  )
  assert.deepEqual(
    listings.map((listing) => listing.peopleSection),
    [
      'Principal Investigator',
      'Postdoc',
      'Postdoc',
      'PhD Student',
      'PhD Student',
      'PhD Student',
      'PhD Student',
      'Masters Student',
      'Masters Student',
      'Associate Members',
      'Associate Members',
      'Associate Members',
    ],
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
  assert.ok(listings.every((listing) => listing.primaryPersonLink === null))
  assert.ok(listings.every((listing) => listing.links === undefined))
  assert.ok(
    listings.every(
      (listing) =>
        !Object.hasOwn(listing, 'bio') &&
        !Object.hasOwn(listing, 'researchAreas'),
    ),
  )
})

test('Full Website Roster filters preserve grouping, counts, and empty state model', () => {
  const matchingDirectory = buildPeopleDirectoryViewModel({
    people,
    filters: {
      query: 'wang',
      section: allFilterValue,
      area: allFilterValue,
      affiliation: allFilterValue,
    },
  })
  const areaDirectory = buildPeopleDirectoryViewModel({
    people,
    filters: {
      query: '',
      section: allFilterValue,
      area: 'Evaluation',
      affiliation: allFilterValue,
    },
  })
  const affiliationDirectory = buildPeopleDirectoryViewModel({
    people,
    filters: {
      query: '',
      section: allFilterValue,
      area: allFilterValue,
      affiliation: 'Imperial College London',
    },
  })
  const combinedDirectory = buildPeopleDirectoryViewModel({
    people,
    filters: {
      query: 'wang',
      section: 'PhD Student',
      area: 'Embodied AI',
      affiliation: 'University College London',
    },
  })
  const emptyDirectory = buildPeopleDirectoryViewModel({
    people,
    filters: {
      query: 'not a real person',
      section: allFilterValue,
      area: allFilterValue,
      affiliation: allFilterValue,
    },
  })

  assert.deepEqual(
    matchingDirectory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [
      ['Postdoc', ['yulin-wang']],
      ['PhD Student', ['zilin-wang']],
    ],
  )
  assert.equal(matchingDirectory.visiblePeopleCount, 2)
  assert.equal(matchingDirectory.totalPeople, 12)

  assert.deepEqual(
    areaDirectory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [
      ['Postdoc', ['yulin-wang', 'dylan-cope']],
      ['Associate Members', ['shashank-reddy-chirra', 'jarek-liesen']],
    ],
  )
  assert.equal(areaDirectory.visiblePeopleCount, 4)

  assert.deepEqual(
    affiliationDirectory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [
      ['Postdoc', ['dylan-cope']],
      ['Associate Members', ['jarek-liesen']],
    ],
  )
  assert.equal(affiliationDirectory.visiblePeopleCount, 2)

  assert.deepEqual(
    combinedDirectory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [['PhD Student', ['zilin-wang']]],
  )
  assert.equal(combinedDirectory.visiblePeopleCount, 1)
  assert.equal(combinedDirectory.totalPeople, 12)

  assert.deepEqual(emptyDirectory.sections, [])
  assert.equal(emptyDirectory.visiblePeopleCount, 0)
  assert.equal(emptyDirectory.totalPeople, 12)
})
