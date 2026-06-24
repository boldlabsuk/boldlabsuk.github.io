import test from 'node:test'
import assert from 'node:assert/strict'

import { canonicalPeopleResearchAreas, people } from '../src/content.ts'
import {
  buildPeopleDirectoryViewModel,
  getPeopleSection,
  getPeopleFilterOptions,
  peopleSectionOrder,
  shufflePeopleWithinSections,
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
    affiliation: 'BOLD Lab',
    bio: 'Builds evaluation tools.',
    researchAreas: ['Evaluation'],
  },
  {
    slug: 'riley-associate',
    name: 'Riley Associate',
    role: 'Research Engineer',
    group: 'Research Engineers',
    affiliation: 'BOLD Lab',
    bio: 'Builds research infrastructure.',
    researchAreas: ['Infrastructure'],
  },
  {
    slug: 'alex-alumna',
    name: 'Alex Alumna',
    role: 'Alumna',
    group: 'Alumni',
    affiliation: 'Public Interest AI Network',
    bio: 'Former lab researcher.',
    researchAreas: ['Governance'],
    alumni: true,
  },
]

const shuffleFixturePeople = [
  {
    slug: 'pi-one',
    name: 'PI One',
    role: 'BOLD PI',
    group: 'BOLD PI',
    bio: 'Leads evaluation research.',
    researchAreas: ['Evaluation'],
  },
  {
    slug: 'postdoc-one',
    name: 'Postdoc One',
    role: 'Postdoc',
    group: 'Postdoc',
    bio: 'Studies evaluation systems.',
    researchAreas: ['Evaluation'],
  },
  {
    slug: 'pi-two',
    name: 'PI Two',
    role: 'BOLD PI',
    group: 'BOLD PI',
    bio: 'Leads agent research.',
    researchAreas: ['Agents'],
  },
  {
    slug: 'adjunct-one',
    name: 'Adjunct One',
    role: 'Adjunct Faculty',
    group: 'Adjunct Faculty',
    bio: 'Studies open-ended learning.',
    researchAreas: ['Evaluation'],
  },
  {
    slug: 'adjunct-two',
    name: 'Adjunct Two',
    role: 'Adjunct Faculty',
    group: 'Adjunct Faculty',
    bio: 'Studies reinforcement learning.',
    researchAreas: ['Agents'],
  },
  {
    slug: 'adjunct-three',
    name: 'Adjunct Three',
    role: 'Adjunct Faculty',
    group: 'Adjunct Faculty',
    bio: 'Studies foundation models.',
    researchAreas: ['Evaluation'],
  },
  {
    slug: 'alumni-hidden',
    name: 'Alumni Hidden',
    role: 'Former PI',
    group: 'BOLD PI',
    bio: 'Former lab lead.',
    researchAreas: ['Evaluation'],
    alumni: true,
  },
  {
    slug: 'postdoc-two',
    name: 'Postdoc Two',
    role: 'Postdoc',
    group: 'Postdoc',
    bio: 'Studies evaluation agents.',
    researchAreas: ['Evaluation'],
  },
  {
    slug: 'phd-one',
    name: 'PhD One',
    role: 'PhD student',
    group: 'PhD student',
    bio: 'Builds evaluation tools.',
    researchAreas: ['Evaluation'],
  },
  {
    slug: 'pi-three',
    name: 'PI Three',
    role: 'BOLD PI',
    group: 'BOLD PI',
    bio: 'Leads evaluation infrastructure.',
    researchAreas: ['Evaluation'],
  },
  {
    slug: 'postdoc-three',
    name: 'Postdoc Three',
    role: 'Postdoc',
    group: 'Postdoc',
    bio: 'Studies agent systems.',
    researchAreas: ['Agents'],
  },
]

function createDeterministicRandom(values) {
  let index = 0

  return () => {
    const value = values[index % values.length]

    index += 1

    return value
  }
}

test('shufflePeopleWithinSections keeps static People Sections ordered while shuffling randomized sections', () => {
  const sourceOrder = shuffleFixturePeople.map((person) => person.slug)
  const shuffledPeople = shufflePeopleWithinSections(
    shuffleFixturePeople,
    createDeterministicRandom([0.6, 0.2, 0.8, 0.1]),
  )
  const directory = buildPeopleDirectoryViewModel({
    people: shuffledPeople,
    filters: emptyFilters,
  })

  assert.deepEqual(
    shuffleFixturePeople.map((person) => person.slug),
    sourceOrder,
  )
  assert.deepEqual(
    directory.sections.map((section) => section.title),
    ['Principal Investigator', 'Adjunct Faculty', 'Postdoc', 'PhD Student'],
  )
  assert.deepEqual(
    directory.sections.map((section) => [section.title, section.people.length]),
    [
      ['Principal Investigator', 3],
      ['Adjunct Faculty', 3],
      ['Postdoc', 3],
      ['PhD Student', 1],
    ],
  )
  assert.deepEqual(
    directory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [
      ['Principal Investigator', ['pi-one', 'pi-two', 'pi-three']],
      ['Adjunct Faculty', ['adjunct-one', 'adjunct-two', 'adjunct-three']],
      ['Postdoc', ['postdoc-three', 'postdoc-one', 'postdoc-two']],
      ['PhD Student', ['phd-one']],
    ],
  )
  assert.equal(directory.totalPeople, 10)
  assert.equal(directory.visiblePeopleCount, 10)
})

test('People Directory filters preserve shuffled relative order within matching People Sections', () => {
  const shuffledPeople = shufflePeopleWithinSections(
    shuffleFixturePeople,
    createDeterministicRandom([0.6, 0.2, 0.8, 0.1]),
  )
  const directory = buildPeopleDirectoryViewModel({
    people: shuffledPeople,
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
      ['Principal Investigator', ['pi-one', 'pi-three']],
      ['Adjunct Faculty', ['adjunct-one', 'adjunct-three']],
      ['Postdoc', ['postdoc-one', 'postdoc-two']],
      ['PhD Student', ['phd-one']],
    ],
  )
  assert.equal(directory.totalPeople, 10)
  assert.equal(directory.visiblePeopleCount, 7)
})

test('shufflePeopleWithinSections applies static public PI and Adjunct Faculty roster ordering', () => {
  const directory = buildPeopleDirectoryViewModel({
    people: shufflePeopleWithinSections(
      people,
      createDeterministicRandom([0.6, 0.2, 0.8, 0.1]),
    ),
    filters: emptyFilters,
  })

  assert.deepEqual(
    directory.sections
      .find((section) => section.title === 'Principal Investigator')
      ?.people.map((listing) => listing.slug),
    [
      'jakob-foerster',
      'tim-rocktaschel',
      'ani-calinescu',
      'antoine-cully',
      'laura-toni',
      'shimon-whiteson',
    ],
  )
  assert.deepEqual(
    directory.sections
      .find((section) => section.title === 'Adjunct Faculty')
      ?.people.map((listing) => listing.slug),
    ['roberta-raileanu', 'ed-grefenstette', 'jack-parker-holder'],
  )
})

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
      'Adjunct Faculty',
      'Postdocs',
      'Research Engineers',
      'PhD Students',
      'Masters Students',
      'Associate Members',
    ],
  )
})

test('People Directory maps every public directory Person into exactly one People Section', () => {
  const directory = buildPeopleDirectoryViewModel({
    people,
    filters: emptyFilters,
  })
  const listings = directory.sections.flatMap((section) => section.people)
  const publicDirectoryPeople = people.filter((person) => !person.alumni)

  assert.equal(listings.length, publicDirectoryPeople.length)
  assert.equal(
    new Set(listings.map((listing) => listing.slug)).size,
    publicDirectoryPeople.length,
  )
  assert.deepEqual(
    Object.fromEntries(
      peopleSectionOrder.map((section) => [
        section,
        listings.filter((listing) => listing.peopleSection === section).length,
      ]),
    ),
    {
      'Principal Investigator': 6,
      'Adjunct Faculty': 3,
      Postdoc: 7,
      'Research Engineers': 2,
      'PhD Student': 56,
      'Masters Student': 10,
      'Associate Members': 16,
    },
  )
  assert.deepEqual(
    Object.fromEntries(
      [
        'tim-rocktaschel',
        'ed-grefenstette',
        'jack-parker-holder',
        'roberta-raileanu',
        'oscar-pang',
        'nathan-monette',
        'alfie-lamerton',
      ].map((slug) => [
        slug,
        listings.find((listing) => listing.slug === slug)?.peopleSection,
      ]),
    ),
    {
      'tim-rocktaschel': 'Principal Investigator',
      'ed-grefenstette': 'Adjunct Faculty',
      'jack-parker-holder': 'Adjunct Faculty',
      'roberta-raileanu': 'Adjunct Faculty',
      'oscar-pang': 'Research Engineers',
      'nathan-monette': 'Masters Student',
      'alfie-lamerton': 'Associate Members',
    },
  )
})

test('People Directory treats explicit alumni flags as non-directory people', () => {
  const alumniFlaggedPi = {
    slug: 'alumni-flagged-pi',
    name: 'Alumni Flagged PI',
    role: 'Former PI',
    group: 'BOLD PI',
    bio: 'Former lab lead.',
    researchAreas: ['Evaluation'],
    alumni: true,
  }
  const alumniGroupMember = {
    slug: 'alumni-group-member',
    name: 'Alumni Group Member',
    role: 'Former member',
    group: 'Alumni',
    bio: 'Former lab member.',
    researchAreas: ['Evaluation'],
  }
  const directory = buildPeopleDirectoryViewModel({
    people: [alumniFlaggedPi, alumniGroupMember],
    filters: emptyFilters,
  })

  assert.equal(getPeopleSection(alumniFlaggedPi), null)
  assert.equal(getPeopleSection(alumniGroupMember), 'Associate Members')
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
    ],
  )
  assert.equal(directory.totalPeople, 1)
  assert.equal(directory.visiblePeopleCount, 1)
})

test('People Directory maps canonical source role values to matching People Sections', () => {
  assert.equal(
    getPeopleSection({
      group: 'PhD Student',
    }),
    'PhD Student',
  )
  assert.equal(
    getPeopleSection({
      group: 'Masters Student',
    }),
    'Masters Student',
  )
  assert.equal(
    getPeopleSection({
      group: 'Associate Members',
    }),
    'Associate Members',
  )
})

test('People Directory preserves content order within each People Section', () => {
  const directory = buildPeopleDirectoryViewModel({
    people,
    filters: emptyFilters,
  })

  assert.deepEqual(
    directory.sections
      .find((section) => section.title === 'Principal Investigator')
      ?.people.map((listing) => listing.slug),
    [
      'jakob-foerster',
      'ani-calinescu',
      'tim-rocktaschel',
      'antoine-cully',
      'laura-toni',
      'shimon-whiteson',
    ],
  )
  assert.deepEqual(
    directory.sections
      .find((section) => section.title === 'Adjunct Faculty')
      ?.people.map((listing) => listing.slug),
    ['ed-grefenstette', 'jack-parker-holder', 'roberta-raileanu'],
  )
  assert.equal(
    directory.sections
      .find((section) => section.title === 'PhD Student')
      ?.people.at(0)?.slug,
    'ravi-hammond',
  )

  assert.deepEqual(
    directory.sections
      .find((section) => section.title === 'Associate Members')
      ?.people.map((listing) => listing.slug),
    [
      'aya-kayal',
      'evangelos-chatzaroulas',
      'satyam-agarwal',
      'erik-feng',
      'elif-akata',
      'simon-buhrer',
      'junming-an',
      'alfie-lamerton',
      'maksymilian-wolski',
      'tim-franzmeyer',
      'colin-lu',
      'luca-furieri',
      'kristen-menou',
      'edan-toledo',
      'juan-agustin-duque',
      'borja-gonzalez-leon',
    ],
  )
})

test('People Directory filter options expose public People Sections and remaining filters', () => {
  const options = getPeopleFilterOptions()

  assert.deepEqual(options.sections, peopleSectionOrder)
  assert.ok(!options.sections.includes('Alumni'))
  assert.deepEqual(options.areas, [...canonicalPeopleResearchAreas])
  assert.deepEqual(
    ['RL', 'LLMs', 'Open-endedness', 'Embodied AI'].filter((area) =>
      options.areas.includes(area),
    ),
    [],
  )
  assert.ok(options.affiliations.includes('Oxford'))
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
    ],
  )
  assert.equal(directory.visiblePeopleCount, 1)
  assert.equal(directory.totalPeople, 4)
})

test('People Directory People Section filter hides empty People Sections', () => {
  const directory = buildPeopleDirectoryViewModel({
    people: filterFixturePeople,
    filters: {
      ...emptyFilters,
      section: 'Research Engineers',
    },
  })

  assert.deepEqual(
    directory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [['Research Engineers', ['riley-associate']]],
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

test('People Directory excludes alumni before research-area and affiliation filters', () => {
  const areaDirectory = buildPeopleDirectoryViewModel({
    people: filterFixturePeople,
    filters: {
      ...emptyFilters,
      area: 'Governance',
    },
  })
  const affiliationDirectory = buildPeopleDirectoryViewModel({
    people: filterFixturePeople,
    filters: {
      ...emptyFilters,
      affiliation: 'Public Interest AI Network',
    },
  })

  assert.deepEqual(areaDirectory.sections, [])
  assert.equal(areaDirectory.visiblePeopleCount, 0)
  assert.equal(areaDirectory.totalPeople, 4)
  assert.deepEqual(affiliationDirectory.sections, [])
  assert.equal(affiliationDirectory.visiblePeopleCount, 0)
  assert.equal(affiliationDirectory.totalPeople, 4)
})

test('People Directory affiliation filter keeps grouped matching Person Listings', () => {
  const directory = buildPeopleDirectoryViewModel({
    people: filterFixturePeople,
    filters: {
      ...emptyFilters,
      affiliation: 'BOLD Lab',
    },
  })

  assert.deepEqual(
    directory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [
      ['Research Engineers', ['riley-associate']],
      ['PhD Student', ['devon-dphil']],
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
  assert.equal(directory.totalPeople, 4)
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
      ['No Link', null],
      ['Social Link', 'https://github.com/social-link'],
      [
        'Blank Preferred Link',
        'https://www.linkedin.com/in/blank-preferred-link',
      ],
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
        affiliation: 'BOLD Lab',
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
    affiliation: 'BOLD Lab',
    image: 'marcus',
    links: {
      website: 'https://example.ac.uk/compact-listing',
      email: 'mailto:compact.listing@example.ac.uk',
    },
    peopleSection: 'Postdoc',
    primaryPersonLink: 'https://example.ac.uk/compact-listing',
  })
})
