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
  assert.equal(new Set(listings.map((listing) => listing.slug)).size, people.length)
  assert.deepEqual(
    Object.fromEntries(
      people.map((person) => [
        person.slug,
        listings.find((listing) => listing.slug === person.slug)?.peopleSection,
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
      section.people.map((listing) => listing.slug),
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
      ?.people.map((listing) => listing.slug),
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

test('People Directory exposes Primary Person Link priority for Person Listings', () => {
  const directory = buildPeopleDirectoryViewModel({
    people: [
      {
        slug: 'website-link',
        name: 'Website Link',
        role: 'Associate Professor',
        group: 'Faculty',
        bio: 'Researches evaluation.',
        researchAreas: ['Evaluation'],
        links: {
          website: 'https://example.ac.uk/website-link',
          googleScholar: 'https://scholar.google.com/website-link',
          github: 'https://github.com/website-link',
        },
      },
      {
        slug: 'scholar-link',
        name: 'Scholar Link',
        role: 'Research Scientist',
        group: 'Researchers',
        bio: 'Researches agents.',
        researchAreas: ['Agents'],
        links: {
          googleScholar: 'https://scholar.google.com/scholar-link',
          linkedin: 'https://www.linkedin.com/in/scholar-link',
        },
      },
      {
        slug: 'social-link',
        name: 'Social Link',
        role: 'PhD Student',
        group: 'PhD Students',
        bio: 'Researches language models.',
        researchAreas: ['Language Models'],
        links: {
          github: 'https://github.com/social-link',
        },
      },
      {
        slug: 'no-link',
        name: 'No Link',
        role: 'Research Engineer',
        group: 'Research Engineers',
        bio: 'Builds tools.',
        researchAreas: ['Research Tooling'],
      },
    ],
    filters: emptyFilters,
  })

  assert.deepEqual(
    directory.sections.flatMap((section) =>
      section.people.map((listing) => [
        listing.name,
        listing.primaryPersonLink,
      ]),
    ),
    [
      ['Website Link', 'https://example.ac.uk/website-link'],
      ['Scholar Link', 'https://scholar.google.com/scholar-link'],
      ['Social Link', 'https://github.com/social-link'],
      ['No Link', null],
    ],
  )
})

test('People Directory returns compact Person Listing output without biography or research area fields', () => {
  const directory = buildPeopleDirectoryViewModel({
    people: [
      {
        slug: 'compact-listing',
        name: 'Compact Listing',
        role: 'Research Scientist',
        group: 'Researchers',
        affiliation: 'BOLD Institute',
        bio: 'This biography belongs on the Person detail page only.',
        image: 'marcus',
        researchAreas: ['Evaluation', 'Agents'],
        links: {
          website: 'https://example.ac.uk/compact-listing',
          email: 'mailto:compact.listing@example.ac.uk',
        },
      },
    ],
    filters: emptyFilters,
  })

  assert.deepEqual(directory.sections[0]?.people[0], {
    slug: 'compact-listing',
    name: 'Compact Listing',
    role: 'Research Scientist',
    affiliation: 'BOLD Institute',
    image: 'marcus',
    links: {
      website: 'https://example.ac.uk/compact-listing',
      email: 'mailto:compact.listing@example.ac.uk',
    },
    peopleSection: 'Postdocs',
    primaryPersonLink: 'https://example.ac.uk/compact-listing',
  })
})
