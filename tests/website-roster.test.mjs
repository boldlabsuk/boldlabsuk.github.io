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
