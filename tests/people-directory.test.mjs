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
    role: 'BOLD PI',
    group: 'BOLD PI',
    affiliation: 'Northern Centre for AI',
    bio: 'Leads evaluation research.',
    researchAreas: ['Evaluation'],
  },
  {
    slug: 'casey-postdoc',
    name: 'Casey Postdoc',
    role: 'Postdoc',
    group: 'Postdoc',
    affiliation: 'London AI Systems Lab',
    bio: 'Studies agent systems.',
    researchAreas: ['Agents'],
  },
  {
    slug: 'devon-dphil',
    name: 'Devon DPhil',
    role: 'PhD student',
    group: 'PhD student',
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

test('People Directory exposes plural public People Section headings', () => {
  const directory = buildPeopleDirectoryViewModel({
    people,
    filters: emptyFilters,
  })

  assert.deepEqual(
    directory.sections.map((section) => section.label),
    [
      'Principal Investigators',
      'Postdocs',
      'PhD Students',
      'Masters Students',
      'Associate Members',
      'Alumni',
    ],
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
      peopleSectionOrder.map((section) => [
        section,
        listings.filter((listing) => listing.peopleSection === section).length,
      ]),
    ),
    {
      'Principal Investigator': 4,
      Postdoc: 7,
      'PhD Student': 52,
      'Masters Student': 7,
      'Associate Members': 14,
      Alumni: 7,
    },
  )
  assert.deepEqual(
    Object.fromEntries(
      ['tim-rocktaschel', 'nathan-monette', 'alfie-lamerton'].map((slug) => [
        slug,
        listings.find((listing) => listing.slug === slug)?.peopleSection,
      ]),
    ),
    {
      'tim-rocktaschel': 'Principal Investigator',
      'nathan-monette': 'Masters Student',
      'alfie-lamerton': 'Associate Members',
    },
  )
})

test('People Directory uses explicit Alumni flags without mapping current roles to Alumni', () => {
  const directory = buildPeopleDirectoryViewModel({
    people: [
      {
        slug: 'alumni-flagged-pi',
        name: 'Alumni Flagged PI',
        role: 'Former PI',
        group: 'BOLD PI',
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
        'Associate Members',
        ['alumni-group-member'],
      ],
      [
        'Alumni',
        ['alumni-flagged-pi'],
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
      'aya-kayal',
      'evangelos-chatzaroulas',
      'george-mavroghenis',
      'satyam-agarwal',
      'jiankai-wang',
      'oscar-pang',
      'erik-feng',
      'elif-akata',
      'simon-buhrer',
      'junming-an',
      'alfie-lamerton',
      'garrett-deceuninck-ziviani',
      'maksymilian-wolski',
      'tim-franzmeyer',
    ],
  )
})

test('People Directory filter options expose public People Sections and remaining filters', () => {
  const options = getPeopleFilterOptions()

  assert.deepEqual(options.sections, peopleSectionOrder)
  assert.ok(options.areas.includes('Reinforcement Learning'))
  assert.ok(options.affiliations.includes('University of Oxford'))
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
      ['Principal Investigator', ['alex-principal']],
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
      ['Principal Investigator', ['alex-principal']],
      ['PhD Student', ['devon-dphil']],
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
      ['PhD Student', ['devon-dphil']],
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
        role: 'BOLD PI',
        group: 'BOLD PI',
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
        role: 'Postdoc',
        group: 'Postdoc',
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
        role: 'PhD student',
        group: 'PhD student',
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
        role: 'Postdoc',
        group: 'Postdoc',
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
    role: 'Postdoc',
    affiliation: 'BOLD Institute',
    image: 'marcus',
    links: {
      website: 'https://example.ac.uk/compact-listing',
      email: 'mailto:compact.listing@example.ac.uk',
    },
    peopleSection: 'Postdoc',
    primaryPersonLink: 'https://example.ac.uk/compact-listing',
  })
})
