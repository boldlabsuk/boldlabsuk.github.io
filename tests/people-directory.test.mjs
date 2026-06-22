import test from 'node:test'
import assert from 'node:assert/strict'

import { people } from '../src/content.ts'
import {
  buildPeopleDirectoryViewModel,
  getPeopleFilterOptions,
  peopleSectionOrder,
} from '../src/domain/people.ts'
import { allFilterValue } from '../src/domain/shared.ts'

const emptyFilters = {
  query: '',
  section: allFilterValue,
  area: allFilterValue,
  affiliation: allFilterValue,
}

const filterFixturePeople = [
  {
    slug: 'alex-principal',
    name: 'Alex Principal',
    role: 'Principal Investigator',
    group: 'Faculty',
    affiliation: 'Northern Centre for AI',
    bio: 'Leads evaluation research.',
    researchAreas: ['Evaluation'],
  },
  {
    slug: 'casey-postdoc',
    name: 'Casey Postdoc',
    role: 'Research Scientist',
    group: 'Researchers',
    affiliation: 'London AI Systems Lab',
    bio: 'Studies agent systems.',
    researchAreas: ['Agents'],
  },
  {
    slug: 'devon-dphil',
    name: 'Devon DPhil',
    role: 'DPhil Student',
    group: 'PhD Students',
    affiliation: 'BOLD Institute',
    bio: 'Builds evaluation tools.',
    researchAreas: ['Evaluation'],
  },
  {
    slug: 'riley-associate',
    name: 'Riley Associate',
    role: 'Research Engineer',
    group: 'Research Engineers',
    affiliation: 'BOLD Institute',
    bio: 'Builds research infrastructure.',
    researchAreas: ['Infrastructure'],
  },
  {
    slug: 'alex-alumna',
    name: 'Alex Alumna',
    role: 'Alumna',
    group: 'Alumni',
    affiliation: 'Public Interest AI Network',
    bio: 'Former institute researcher.',
    researchAreas: ['Governance'],
    alumni: true,
  },
]

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

test('People Directory filter options expose public People Sections and remaining filters', () => {
  const options = getPeopleFilterOptions()

  assert.deepEqual(options.sections, peopleSectionOrder)
  assert.ok(options.areas.includes('Evaluation'))
  assert.ok(options.affiliations.includes('BOLD Institute'))
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
    [
      ['PIs', ['alex-principal']],
      ['Alumni', ['alex-alumna']],
    ],
  )
  assert.equal(directory.visiblePeopleCount, 2)
  assert.equal(directory.totalPeople, filterFixturePeople.length)
})

test('People Directory People Section filter hides empty People Sections', () => {
  const directory = buildPeopleDirectoryViewModel({
    people: filterFixturePeople,
    filters: {
      ...emptyFilters,
      section: 'Associate Members',
    },
  })

  assert.deepEqual(
    directory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [['Associate Members', ['riley-associate']]],
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
      ['PIs', ['alex-principal']],
      ['DPhil Students', ['devon-dphil']],
    ],
  )
  assert.equal(directory.visiblePeopleCount, 2)
})

test('People Directory affiliation filter keeps grouped matching Person Listings', () => {
  const directory = buildPeopleDirectoryViewModel({
    people: filterFixturePeople,
    filters: {
      ...emptyFilters,
      affiliation: 'BOLD Institute',
    },
  })

  assert.deepEqual(
    directory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [
      ['DPhil Students', ['devon-dphil']],
      ['Associate Members', ['riley-associate']],
    ],
  )
  assert.equal(directory.visiblePeopleCount, 2)
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
  assert.equal(directory.totalPeople, filterFixturePeople.length)
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
        slug: 'blank-preferred-link',
        name: 'Blank Preferred Link',
        role: 'Programme Manager',
        group: 'Staff',
        bio: 'Coordinates programmes.',
        researchAreas: ['Research Operations'],
        links: {
          website: '',
          googleScholar: '',
          github: '',
          linkedin: 'https://www.linkedin.com/in/blank-preferred-link',
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
      [
        'Blank Preferred Link',
        'https://www.linkedin.com/in/blank-preferred-link',
      ],
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
