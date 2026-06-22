import test from 'node:test'
import assert from 'node:assert/strict'

import { people } from '../src/content.ts'
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

test('People Directory renders non-empty People Sections in canonical order', () => {
  const directory = buildPeopleDirectoryViewModel({
    people,
    filters: emptyFilters,
  })

  assert.deepEqual(
    directory.sections.map((section) => section.title),
    peopleSectionOrder,
  )
})

test('People Directory maps every Person into exactly one People Section', () => {
  const directory = buildPeopleDirectoryViewModel({
    people,
    filters: emptyFilters,
  })
  const listings = directory.sections.flatMap((section) => section.people)

  assert.equal(listings.length, people.length)
  assert.equal(new Set(listings.map((listing) => listing.person.slug)).size, people.length)
  assert.deepEqual(
    Object.fromEntries(
      people.map((person) => [
        person.slug,
        listings.find((listing) => listing.person.slug === person.slug)
          ?.peopleSection,
      ]),
    ),
    {
      'amara-singh': 'PIs',
      'marcus-adeyemi': 'Postdocs',
      'jules-chen': 'DPhil Students',
      'eve-morrison': 'DPhil Students',
      'samira-patel': 'Associate Members',
      'thomas-okoro': 'Associate Members',
      'nina-berg': "Master's Students",
      'leo-williams': 'Associate Members',
      'marta-garcia': 'Associate Members',
      'oliver-hart': 'Associate Members',
      'fatima-rahman': 'Associate Members',
      'alex-kim': 'Alumni',
    },
  )
})

test('People Directory gives Alumni precedence over a Person group', () => {
  const directory = buildPeopleDirectoryViewModel({
    people: [
      {
        slug: 'alumni-flagged-pi',
        name: 'Alumni Flagged PI',
        role: 'Former PI',
        group: 'Faculty',
        bio: 'Former institute lead.',
        researchAreas: ['Evaluation'],
        alumni: true,
      },
      {
        slug: 'alumni-group-member',
        name: 'Alumni Group Member',
        role: 'Former member',
        group: 'Alumni',
        bio: 'Former institute member.',
        researchAreas: ['Evaluation'],
      },
    ],
    filters: emptyFilters,
  })

  assert.deepEqual(
    directory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.person.slug),
    ]),
    [
      [
        'Alumni',
        ['alumni-flagged-pi', 'alumni-group-member'],
      ],
    ],
  )
})

test('People Directory preserves content order within each People Section', () => {
  const directory = buildPeopleDirectoryViewModel({
    people,
    filters: emptyFilters,
  })

  assert.deepEqual(
    directory.sections
      .find((section) => section.title === 'Associate Members')
      ?.people.map((listing) => listing.person.slug),
    [
      'samira-patel',
      'thomas-okoro',
      'leo-williams',
      'marta-garcia',
      'oliver-hart',
      'fatima-rahman',
    ],
  )
})
