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

test('Website Roster carries explicit source alumni markers into the Alumni People Section', () => {
  const roster = buildWebsiteRoster([
    {
      source: 'main',
      name: 'Flagged Alumni',
      role: 'Former PI',
      homeInstitution: 'University of Oxford',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'flagged-alumni.jpg',
      listOnBoldWebsite: 'YES',
      alumni: 'YES',
    },
    {
      source: 'main',
      name: 'Current PI',
      role: 'BOLD PI',
      homeInstitution: 'Imperial College London',
      researchInterestKeywords: ['Agents'],
      profilePicture: 'current-pi.jpg',
      listOnBoldWebsite: 'YES',
    },
    {
      source: 'main',
      name: 'Unmarked Alumni Role',
      role: 'Alumni',
      homeInstitution: 'University College London',
      researchInterestKeywords: ['Discovery'],
      profilePicture: 'unmarked-alumni-role.jpg',
      listOnBoldWebsite: 'YES',
    },
  ])

  const directory = buildPeopleDirectoryViewModel({
    people: roster,
    filters: emptyFilters,
  })
  const listings = directory.sections.flatMap((section) => section.people)

  assert.equal(listings.length, roster.length)
  assert.deepEqual(
    directory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [
      ['Principal Investigator', ['current-pi']],
      ['Associate Members', ['unmarked-alumni-role']],
      ['Alumni', ['flagged-alumni']],
    ],
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

test('Website Roster parses labeled and pipe-separated source profile links', () => {
  const roster = buildWebsiteRoster([
    {
      source: 'main',
      name: 'Spreadsheet Linked',
      role: 'Postdoc',
      homeInstitution: 'University of Oxford',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'spreadsheet-linked.jpg',
      listOnBoldWebsite: 'YES',
      socialLinks:
        'website: spreadsheet.example | X: https://x.com/spreadsheet_ai | Scholar: https://scholar.google.co.uk/citations?user=spreadsheet | LinkedIn: https://www.linkedin.com/in/spreadsheet',
    },
  ])

  assert.deepEqual(roster[0]?.links, {
    website: 'https://spreadsheet.example',
    twitter: 'https://x.com/spreadsheet_ai',
    googleScholar:
      'https://scholar.google.co.uk/citations?user=spreadsheet',
    linkedin: 'https://www.linkedin.com/in/spreadsheet',
  })
})

test('Website Roster expands spreadsheet affiliation shorthand for public display', () => {
  const roster = buildWebsiteRoster([
    {
      source: 'main',
      name: 'Oxford Shorthand',
      role: 'Postdoc',
      homeInstitution: 'Oxford',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'oxford-shorthand.jpg',
      listOnBoldWebsite: 'YES',
    },
    {
      source: 'main',
      name: 'Imperial Shorthand',
      role: 'Postdoc',
      homeInstitution: 'Imperial',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'imperial-shorthand.jpg',
      listOnBoldWebsite: 'YES',
    },
    {
      source: 'main',
      name: 'UCL Shorthand',
      role: 'PhD student',
      homeInstitution: 'UCL',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'ucl-shorthand.jpg',
      listOnBoldWebsite: 'YES',
    },
  ])

  assert.deepEqual(roster.map((person) => person.affiliation), [
    'University of Oxford',
    'Imperial College London',
    'University College London',
  ])
})

test('Website Roster recognizes Bluesky profile links', () => {
  const roster = buildWebsiteRoster([
    {
      source: 'main',
      name: 'Bluesky Researcher',
      role: 'Postdoc',
      homeInstitution: 'Oxford',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'bluesky-researcher.jpg',
      listOnBoldWebsite: 'YES',
      socialLinks: 'https://bsky.app/profile/bluesky-researcher.bsky.social',
    },
  ])

  assert.deepEqual(roster[0]?.links, {
    bluesky: 'https://bsky.app/profile/bluesky-researcher.bsky.social',
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

test('Website Roster reconciles Foerster aliases into existing People with merged public links', () => {
  const roster = buildWebsiteRoster([
    {
      source: 'main',
      name: 'Jonny Cook',
      role: 'PhD student',
      homeInstitution: 'Oxford',
      researchInterestKeywords: ['RL'],
      profilePicture: 'jonny-cook.jpg',
      listOnBoldWebsite: 'YES',
      socialLinks:
        'https://x.com/jonnycoook?s=11; https://scholar.google.com/citations?user=7tcPHHYAAAAJ&hl=en',
    },
    {
      source: 'main',
      name: 'Alexander Rutherford',
      role: 'PhD student',
      homeInstitution: 'Oxford',
      researchInterestKeywords: ['RL'],
      profilePicture: 'alexander-rutherford.jpg',
      listOnBoldWebsite: 'YES',
      socialLinks:
        'amacrutherford.com; https://scholar.google.com/citations?user=EOjYGf0AAAAJ&hl=en',
    },
    {
      source: 'main',
      name: 'Kang Li',
      role: 'PhD student',
      homeInstitution: 'Oxford',
      researchInterestKeywords: ['Reinforcement Learning'],
      profilePicture: 'kang-li.jpg',
      listOnBoldWebsite: 'YES',
      socialLinks:
        'https://scholar.google.com/citations?user=12Q-VD4AAAAJ&hl=en',
    },
    {
      source: 'main',
      name: 'Elif Akata',
      role: 'Visitor',
      homeInstitution: 'Oxford',
      researchInterestKeywords: ['Human-Centered AI'],
      profilePicture: 'elif-akata.jpg',
      listOnBoldWebsite: 'YES',
      socialLinks:
        'https://eliaka.github.io/; https://x.com/elifakata; https://scholar.google.com/citations?user=T__E730AAAAJ&hl=en&oi=ao',
    },
    {
      source: 'foerster',
      name: 'Jonathan Cook',
      role: 'DPhil Student',
      homeInstitution: 'Oxford',
      researchInterestKeywords: ['RL'],
      profilePicture: 'jonathan-cook.jpg',
      socialLinks:
        'https://twitter.com/JonnyCoook; https://scholar.google.com/citations?user=7tcPHHYAAAAJ&hl=en; https://github.com/jonathan-cook235',
    },
    {
      source: 'foerster',
      name: 'Alex Rutherford',
      role: 'DPhil Student',
      homeInstitution: 'Oxford',
      researchInterestKeywords: ['RL'],
      profilePicture: 'alex-rutherford.jpg',
      socialLinks:
        'https://amacrutherford.com/; https://twitter.com/alexrutherford0; https://github.com/amacrutherford',
    },
    {
      source: 'foerster',
      name: 'Kang Li',
      role: 'Alumni',
      homeInstitution: 'Oxford',
      researchInterestKeywords: ['Reinforcement Learning'],
      profilePicture: 'kang-li.jpg',
      alumni: 'YES',
      socialLinks: 'https://twitter.com/Kang__Oxford; https://github.com/KangOxford',
    },
    {
      source: 'foerster',
      name: 'Elif Akata',
      role: 'Associate Member',
      homeInstitution: 'Oxford',
      researchInterestKeywords: ['Human-Centered AI'],
      profilePicture: 'elif-akata.jpg',
      socialLinks:
        'https://eliaka.github.io/; https://twitter.com/elifakata; https://scholar.google.com/citations?user=T__E730AAAAJ&hl=en&oi=ao',
    },
  ])

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

  assert.deepEqual(roster.find((person) => person.slug === 'jonny-cook')?.links, {
    twitter: 'https://x.com/jonnycoook?s=11',
    googleScholar: 'https://scholar.google.com/citations?user=7tcPHHYAAAAJ&hl=en',
    github: 'https://github.com/jonathan-cook235',
  })
  assert.deepEqual(
    roster.find((person) => person.slug === 'alexander-rutherford')?.links,
    {
      website: 'https://amacrutherford.com',
      googleScholar: 'https://scholar.google.com/citations?user=EOjYGf0AAAAJ&hl=en',
      twitter: 'https://twitter.com/alexrutherford0',
      github: 'https://github.com/amacrutherford',
    },
  )
  assert.deepEqual(roster.find((person) => person.slug === 'kang-li')?.links, {
    googleScholar: 'https://scholar.google.com/citations?user=12Q-VD4AAAAJ&hl=en',
    twitter: 'https://twitter.com/Kang__Oxford',
    github: 'https://github.com/KangOxford',
  })
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

  assert.deepEqual(
    ['jonny-cook', 'alexander-rutherford', 'kang-li', 'elif-akata'].map(
      (slug) => people.filter((person) => person.slug === slug).length,
    ),
    [1, 1, 1, 1],
  )
  assert.deepEqual(people.find((person) => person.slug === 'jonny-cook')?.links, {
    twitter: 'https://x.com/jonnycoook?s=11',
    googleScholar: 'https://scholar.google.com/citations?user=7tcPHHYAAAAJ&hl=en',
    github: 'https://github.com/jonathan-cook235',
  })
  assert.deepEqual(
    people.find((person) => person.slug === 'alexander-rutherford')?.links,
    {
      website: 'https://amacrutherford.com',
      googleScholar: 'https://scholar.google.com/citations?user=EOjYGf0AAAAJ&hl=en',
      twitter: 'https://twitter.com/alexrutherford0',
      github: 'https://github.com/amacrutherford',
    },
  )
  assert.deepEqual(people.find((person) => person.slug === 'kang-li')?.links, {
    googleScholar: 'https://scholar.google.com/citations?user=12Q-VD4AAAAJ&hl=en',
    twitter: 'https://twitter.com/Kang__Oxford',
    github: 'https://github.com/KangOxford',
  })
  assert.deepEqual(people.find((person) => person.slug === 'elif-akata')?.links, {
    website: 'https://eliaka.github.io',
    twitter: 'https://x.com/elifakata',
    googleScholar: 'https://scholar.google.com/citations?user=T__E730AAAAJ&hl=en&oi=ao',
  })
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
  assert.equal(listingBySlug['kang-li']?.peopleSection, 'PhD Student')
  assert.equal(listingBySlug['elif-akata']?.peopleSection, 'Associate Members')
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
  })

  assert.deepEqual(
    links.map((link) => [link.label, link.href, link.isEmail]),
    [
      ['Website', 'https://compact.example', false],
      [
        'Google Scholar',
        'https://scholar.google.com/citations?user=compact',
        false,
      ],
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

  assert.equal(directory.totalPeople, 75)
  assert.equal(directory.visiblePeopleCount, 75)
  assert.deepEqual(
    Object.fromEntries(
      directory.sections.map((section) => [section.title, section.people.length]),
    ),
    {
      'Principal Investigator': 3,
      Postdoc: 7,
      'PhD Student': 47,
      'Masters Student': 7,
      'Associate Members': 11,
    },
  )
  assert.equal(new Set(listings.map((listing) => listing.slug)).size, 75)
  assert.deepEqual(
    directory.sections.map((section) => section.title),
    [
      'Principal Investigator',
      'Postdoc',
      'PhD Student',
      'Masters Student',
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
  const listingBySlug = Object.fromEntries(
    listings.map((listing) => [listing.slug, listing]),
  )

  assert.equal(
    listingBySlug['nathan-monette']?.primaryPersonLink,
    'https://nmonette.github.io',
  )
  assert.equal(
    listingBySlug['shashank-reddy-chirra']?.primaryPersonLink,
    'https://shshnkreddy.github.io',
  )
  assert.equal(listingBySlug['gregory-levy']?.primaryPersonLink, null)
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
      area: 'Reinforcement Learning',
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
  const sectionDirectory = buildPeopleDirectoryViewModel({
    people,
    filters: {
      query: '',
      section: 'Masters Student',
      area: allFilterValue,
      affiliation: allFilterValue,
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
      ['Associate Members', ['jiankai-wang']],
    ],
  )
  assert.equal(matchingDirectory.visiblePeopleCount, 3)
  assert.equal(matchingDirectory.totalPeople, 75)

  assert.deepEqual(
    areaDirectory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [
      [
        'PhD Student',
        [
          'alex-goldie',
          'george-nigmatulin',
          'keyue-jiang',
          'kang-li',
          'austin-tudor-david-andrews',
          'antoine-gorceix',
          'hannah-janmohamed',
          'michael-matthews',
          'theo-wolf',
        ],
      ],
      ['Masters Student', ['nathan-monette', 'jacinto-suner']],
      ['Associate Members', ['aya-kayal', 'erik-feng', 'junming-an']],
    ],
  )
  assert.equal(areaDirectory.visiblePeopleCount, 14)

  assert.deepEqual(
    affiliationDirectory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [
      ['Principal Investigator', ['antoine-cully']],
      ['Postdoc', ['paul-templier', 'cong-sun']],
      [
        'PhD Student',
        [
          'konstantinos-mitsides',
          'runjun-mao',
          'richard-bornemann',
          'hannah-janmohamed',
          'lisa-coiffard',
        ],
      ],
      ['Associate Members', ['george-mavroghenis', 'jiankai-wang', 'oscar-pang']],
    ],
  )
  assert.equal(affiliationDirectory.visiblePeopleCount, 11)

  assert.deepEqual(
    sectionDirectory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [
      [
        'Masters Student',
        [
          'nathan-monette',
          'aneesh-muppidi',
          'yuhe-gao',
          'aramis-marti-shahandeh',
          'jacinto-suner',
          'samuel-simons',
          'ali-farhat',
        ],
      ],
    ],
  )
  assert.equal(sectionDirectory.visiblePeopleCount, 7)

  assert.deepEqual(
    combinedDirectory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [],
  )
  assert.equal(combinedDirectory.visiblePeopleCount, 0)
  assert.equal(combinedDirectory.totalPeople, 75)

  assert.deepEqual(emptyDirectory.sections, [])
  assert.equal(emptyDirectory.visiblePeopleCount, 0)
  assert.equal(emptyDirectory.totalPeople, 75)
})
