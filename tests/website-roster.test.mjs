import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { access, readFile } from 'node:fs/promises'
import { join } from 'node:path'

import {
  buildWebsiteRoster,
  canonicalPeopleResearchAreas,
  people,
} from '../src/content/people.ts'
import {
  buildPeopleDirectoryViewModel,
  getPrimaryPersonLink,
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

// Mirrors https://foersterlab.com/members/ as checked on 2026-06-22.
const foersterMembersPageFixture = [
  ['Faculty', 'Jakob Foerster', 'jakob-foerster', 'Jakob Foerster', 'Principal Investigator'],
  ['Postdocs', 'Yulin Wang', 'yulin-wang', 'Yulin Wang', 'Postdoc'],
  ['Postdocs', 'Dylan Cope', 'dylan-cope', 'Dylan Cope', 'Postdoc'],
  ['Postdocs', 'Johannes Forkel', 'johannes-forkel', 'Johannes Forkel', 'Postdoc'],
  ['Postdocs', 'Mattie Fellows', 'mattie-fellows', 'Mattie Fellows', 'Postdoc'],
  ['DPhil Students', 'Lukas Seier', 'lukas-seier', 'Lukas Seier', 'PhD Student'],
  ['DPhil Students', 'Shashank Reddy', 'shashank-reddy', 'Shashank Reddy', 'PhD Student'],
  ['DPhil Students', 'Alistair Letcher', 'alistair-letcher', 'Alistair Letcher', 'PhD Student'],
  ['DPhil Students', 'Theo Wolf', 'theo-wolf', 'Theo Wolf', 'PhD Student'],
  ['DPhil Students', 'Antonio León Villares', 'antonio-leon-villares', 'Antonio León Villares', 'PhD Student'],
  ['DPhil Students', 'Austin Andrews', 'austin-andrews', 'Austin Andrews', 'PhD Student'],
  ['DPhil Students', 'Jarek Liesen', 'jarek-liesen', 'Jarek Liesen', 'PhD Student'],
  ['DPhil Students', 'Ravi Hammond', 'ravi-hammond', 'Ravi Hammond', 'PhD Student'],
  ['DPhil Students', 'J Rosser', 'j-rosser', 'J Rosser', 'PhD Student'],
  ['DPhil Students', 'Hannah Erlebach', 'hannah-erlebach', 'Hannah Erlebach', 'PhD Student'],
  [
    'DPhil Students',
    'Harry Mayne',
    'harry-mayne',
    'Harry Mayne',
    'Incoming PhD Students',
  ],
  ['DPhil Students', 'Darius Muglich', 'darius-muglich', 'Darius Muglich', 'PhD Student'],
  ['DPhil Students', 'Bidipta Sarkar', 'bidipta-sarkar', 'Bidipta Sarkar', 'PhD Student'],
  ['DPhil Students', 'Thom Foster', 'thom-foster', 'Thom Foster', 'PhD Student'],
  ['DPhil Students', 'Clarisse Wibault', 'clarisse-wibault', 'Clarisse Wibault', 'PhD Student'],
  ['DPhil Students', 'Zilin Wang', 'zilin-wang', 'Zilin Wang', 'PhD Student'],
  ['DPhil Students', 'Sam Coward', 'sam-coward', 'Sam Coward', 'PhD Student'],
  ['DPhil Students', 'Michael Matthews', 'michael-matthews', 'Michael Matthews', 'PhD Student'],
  ['DPhil Students', 'Uljad Berdica', 'uljad-berdica', 'Uljad Berdica', 'PhD Student'],
  ['DPhil Students', 'Jonathan Cook', 'jonny-cook', 'Jonny Cook', 'PhD Student'],
  ['DPhil Students', 'Michael Beukman', 'michael-beukman', 'Michael Beukman', 'PhD Student'],
  ['DPhil Students', 'Alex Goldie', 'alex-goldie', 'Alex Goldie', 'PhD Student'],
  ['DPhil Students', 'Matthew Jackson', 'matthew-jackson', 'Matthew Jackson', 'PhD Student'],
  ['DPhil Students', 'Qizhen Zhang (Irene)', 'qizhen-zhang-irene', 'Qizhen Zhang (Irene)', 'PhD Student'],
  ['DPhil Students', 'Silvia Sapora', 'silvia-sapora', 'Silvia Sapora', 'PhD Student'],
  ['DPhil Students', 'Andrei Lupu', 'andrei-lupu', 'Andrei Lupu', 'PhD Student'],
  ['DPhil Students', 'Alex Rutherford', 'alexander-rutherford', 'Alexander Rutherford', 'PhD Student'],
  ['DPhil Students', 'Ola Kalisz', 'ola-kalisz', 'Ola Kalisz', 'PhD Student'],
  ['DPhil Students', 'Sebastian Towers', 'sebastian-towers', 'Sebastian Towers', 'PhD Student'],
  ["Master's Students", 'Aramis Marti-Shahandeh', 'aramis-marti-shahandeh', 'Aramis Marti-Shahandeh', 'Masters Student'],
  ["Master's Students", 'Samuel Simons', 'samuel-simons', 'Samuel Simons', 'Masters Student'],
  ["Master's Students", 'Satyam Agarwal', 'satyam-agarwal', 'Satyam Agarwal', 'Associate Members'],
  ["Master's Students", 'Yuhe Gao', 'yuhe-gao', 'Yuhe Gao', 'Masters Student'],
  ["Master's Students", 'Nathan Monette', 'nathan-monette', 'Nathan Monette', 'Masters Student'],
  ['Associate Members', 'Elif Akata', 'elif-akata', 'Elif Akata', 'Associate Members'],
  ['Associate Members', 'Maksymilian Wolski', 'maksymilian-wolski', 'Maksymilian Wolski', 'Associate Members'],
  ['Associate Members', 'Tim Franzmeyer', 'tim-franzmeyer', 'Tim Franzmeyer', 'Associate Members'],
  ['Alumni', 'Ben Ellis', 'ben-ellis', 'Ben Ellis', 'Alumni'],
  ['Alumni', 'Chris Lu', 'chris-lu', 'Chris Lu', 'Alumni'],
  ['Alumni', 'Timon Willi', 'timon-willi', 'Timon Willi', 'Alumni'],
  ['Alumni', 'Christian Schroeder de Witt', 'christian-schroeder-de-witt', 'Christian Schroeder de Witt', 'Alumni'],
  ['Alumni', 'Jia Wan', 'jia-wan', 'Jia Wan', 'Alumni'],
  ['Alumni', 'Kang Li', 'kang-li', 'Kang Li', 'PhD Student'],
  ['Alumni', 'Matthias Hericks', 'matthias-hericks', 'Matthias Hericks', 'Alumni'],
  ['Alumni', 'Noah Sarfati', 'noah-sarfati', 'Noah Sarfati', 'Alumni'],
]

const foersterExpectedPublicLinkTypesBySlug = {
  'jakob-foerster': ['github', 'googleScholar', 'twitter', 'website'],
  'yulin-wang': ['googleScholar', 'website'],
  'dylan-cope': ['github', 'googleScholar', 'twitter', 'website'],
  'johannes-forkel': ['googleScholar'],
  'lukas-seier': ['github', 'googleScholar', 'website'],
  'shashank-reddy': [
    'github',
    'googleScholar',
    'twitter',
    'website',
  ],
  'alistair-letcher': ['github', 'googleScholar', 'twitter', 'website'],
  'theo-wolf': ['github', 'googleScholar', 'twitter', 'website'],
  'antonio-leon-villares': ['github', 'googleScholar', 'website'],
  'austin-andrews': [
    'github',
    'googleScholar',
    'twitter',
    'website',
  ],
  'jarek-liesen': ['github', 'googleScholar', 'twitter', 'website'],
  'ravi-hammond': ['github', 'googleScholar', 'linkedin', 'twitter'],
  'j-rosser': ['github', 'googleScholar', 'twitter', 'website'],
  'hannah-erlebach': ['github', 'googleScholar', 'twitter', 'website'],
  'harry-mayne': ['github', 'googleScholar', 'twitter', 'website'],
  'darius-muglich': ['github', 'googleScholar'],
  'bidipta-sarkar': ['github', 'googleScholar', 'twitter', 'website'],
  'thom-foster': ['github', 'googleScholar', 'twitter', 'website'],
  'clarisse-wibault': ['github'],
  'zilin-wang': ['github', 'googleScholar', 'twitter', 'website'],
  'sam-coward': ['github', 'googleScholar', 'twitter', 'website'],
  'michael-matthews': ['github', 'googleScholar', 'twitter', 'website'],
  'uljad-berdica': ['github', 'googleScholar', 'twitter', 'website'],
  'jonny-cook': ['github', 'googleScholar', 'twitter'],
  'michael-beukman': ['github', 'googleScholar', 'twitter', 'website'],
  'alex-goldie': ['github', 'twitter'],
  'matthew-jackson': ['github', 'googleScholar', 'twitter', 'website'],
  'qizhen-zhang-irene': ['github', 'googleScholar', 'twitter', 'website'],
  'silvia-sapora': ['github', 'googleScholar', 'twitter'],
  'andrei-lupu': ['github', 'googleScholar', 'twitter'],
  'alexander-rutherford': ['github', 'googleScholar', 'twitter', 'website'],
  'ola-kalisz': ['github', 'googleScholar', 'twitter', 'website'],
  'aramis-marti-shahandeh': ['github'],
  'samuel-simons': ['github', 'googleScholar', 'twitter'],
  'satyam-agarwal': ['github'],
  'yuhe-gao': ['github'],
  'nathan-monette': ['github', 'googleScholar', 'twitter', 'website'],
  'elif-akata': ['googleScholar', 'twitter', 'website'],
  'tim-franzmeyer': ['github', 'googleScholar', 'twitter', 'website'],
  'ben-ellis': ['github', 'googleScholar', 'twitter'],
  'chris-lu': ['github', 'googleScholar', 'twitter', 'website'],
  'timon-willi': ['googleScholar', 'twitter'],
  'christian-schroeder-de-witt': [
    'github',
    'googleScholar',
    'twitter',
    'website',
  ],
  'jia-wan': ['github', 'twitter'],
  'kang-li': ['github', 'twitter'],
  'matthias-hericks': ['github', 'twitter'],
  'noah-sarfati': ['github'],
}

test('Website Roster derives public Person Listings from central source rows', () => {
  const roster = buildWebsiteRoster([
    {
      source: 'main',
      name: '  Included PI  ',
      role: '  BOLD PI  ',
      piRole: '  Strategic Lead  ',
      homeInstitution: 'Oxford',
      researchInterestKeywords: ['Multi-Agent Reinforcement Learning'],
      profilePicture: 'included-pi.jpg',
      listOnBoldWebsite: 'YES',
    },
    {
      source: 'main',
      name: 'Blank Flag Postdoc',
      role: 'Postdoc',
      piRole: ' ',
      homeInstitution: 'Imperial',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'blank-flag-postdoc.jpg',
      listOnBoldWebsite: '',
    },
    {
      source: 'main',
      name: 'Opted Out Student',
      role: 'PhD student',
      homeInstitution: 'UCL',
      researchInterestKeywords: ['Language Models'],
      profilePicture: 'opted-out-student.jpg',
      listOnBoldWebsite: 'No',
    },
    {
      source: 'slack',
      name: 'Slack Only Person',
      role: 'Research visitor',
      homeInstitution: 'BOLD Lab',
      researchInterestKeywords: ['Operations'],
      profilePicture: 'slack-only-person.jpg',
      listOnBoldWebsite: 'YES',
    },
    {
      source: 'main',
      name: 'Missing Picture',
      role: 'Master Student',
      homeInstitution: 'Oxford',
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
    'Oxford',
    'Imperial',
  ])
  assert.deepEqual(roster.map((person) => person.image), [
    '/profile-assets/included-pi.webp',
    '/profile-assets/blank-flag-postdoc.webp',
  ])
  assert.equal(roster[0]?.piRole, 'Strategic Lead')
  assert.equal(Object.hasOwn(roster[1] ?? {}, 'piRole'), false)

  const directory = buildPeopleDirectoryViewModel({
    people: roster,
    filters: emptyFilters,
  })

  assert.deepEqual(peopleSectionOrder, [
    'Principal Investigator',
    'Adjunct Faculty',
    'Postdoc',
    'Research Engineers',
    'PhD Student',
    'Incoming PhD Students',
    'Masters Student',
    'Associate Members',
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

test('Website Roster normalizes source Research Area keywords to canonical public areas', () => {
  const roster = buildWebsiteRoster([
    {
      source: 'main',
      name: 'Canonical Researcher',
      role: 'PhD student',
      homeInstitution: 'Oxford',
      researchInterestKeywords: [
        'RL',
        'Reinforcment Learning',
        'LLMs',
        'AI4Science',
        'Open-endedness',
        'Multi-Agent Reinforcement Learning Human-AI Coordination',
      ],
      profilePicture: 'canonical-researcher.jpg',
      listOnBoldWebsite: 'YES',
    },
  ])

  assert.deepEqual(roster[0]?.researchAreas, [
    'Reinforcement Learning',
    'Language Models',
    'AI for Science',
    'Open-Ended Learning',
    'Multi-Agent Systems',
    'Human-AI Interaction',
  ])
})

test('Website Roster maps unsupported profile source formats to generated web-safe assets', () => {
  const roster = buildWebsiteRoster([
    {
      source: 'main',
      name: 'HEIC Upload',
      role: 'Postdoc',
      homeInstitution: 'Oxford',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'heic-upload.HEIC',
      listOnBoldWebsite: 'YES',
    },
    {
      source: 'main',
      name: 'PDF Upload',
      role: 'PhD student',
      homeInstitution: 'Imperial',
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

test('Website Roster retains explicit source alumni markers outside the public directory', () => {
  const roster = buildWebsiteRoster([
    {
      source: 'main',
      name: 'Flagged Alumni',
      role: 'Former PI',
      homeInstitution: 'Oxford',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'flagged-alumni.jpg',
      listOnBoldWebsite: 'YES',
      alumni: 'YES',
    },
    {
      source: 'main',
      name: 'Current PI',
      role: 'BOLD PI',
      homeInstitution: 'Imperial',
      researchInterestKeywords: ['Agents'],
      profilePicture: 'current-pi.jpg',
      listOnBoldWebsite: 'YES',
    },
    {
      source: 'main',
      name: 'Unmarked Alumni Role',
      role: 'Alumni',
      homeInstitution: 'UCL',
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

  assert.equal(roster.find((person) => person.slug === 'flagged-alumni')?.alumni, true)
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
  const roster = buildWebsiteRoster([
    {
      source: 'main',
      name: 'Current Linked Person',
      role: 'PhD student',
      homeInstitution: 'Oxford',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'current-linked-person.jpg',
      listOnBoldWebsite: 'YES',
    },
    {
      source: 'foerster',
      name: 'Current Linked Person',
      role: 'Alumni',
      homeInstitution: 'Oxford',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'current-linked-person.jpg',
      alumni: 'YES',
      socialLinks: 'https://github.com/current-linked-person',
    },
    {
      source: 'foerster',
      name: 'Out Of Scope Alumni',
      role: 'Former visitor',
      homeInstitution: 'Oxford',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'out-of-scope-alumni.jpg',
      listOnBoldWebsite: 'YES',
      alumni: 'YES',
      socialLinks: 'https://github.com/out-of-scope-alumni',
    },
    {
      source: 'foerster-alumni',
      name: 'Explicit Alumni',
      role: 'Former student',
      homeInstitution: 'Oxford',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'explicit-alumni.jpg',
      listOnBoldWebsite: 'YES',
      alumni: 'YES',
      socialLinks: 'https://github.com/explicit-alumni',
    },
  ])

  const directory = buildPeopleDirectoryViewModel({
    people: roster,
    filters: emptyFilters,
  })

  assert.deepEqual(
    roster.map((person) => [person.slug, person.links]),
    [
      [
        'current-linked-person',
        { github: 'https://github.com/current-linked-person' },
      ],
      ['explicit-alumni', { github: 'https://github.com/explicit-alumni' }],
    ],
  )
  assert.equal(roster.find((person) => person.slug === 'explicit-alumni')?.alumni, true)
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
  const roster = buildWebsiteRoster([
    {
      source: 'main',
      name: 'Linked Researcher',
      role: 'Postdoc',
      homeInstitution: 'Oxford',
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
      homeInstitution: 'Oxford',
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

test('Website Roster shortens source affiliation names for public display', () => {
  const roster = buildWebsiteRoster([
    {
      source: 'main',
      name: 'Oxford Long Name',
      role: 'Postdoc',
      homeInstitution: 'University of Oxford',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'oxford-long-name.jpg',
      listOnBoldWebsite: 'YES',
    },
    {
      source: 'main',
      name: 'Imperial Long Name',
      role: 'Postdoc',
      homeInstitution: 'Imperial College London',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'imperial-long-name.jpg',
      listOnBoldWebsite: 'YES',
    },
    {
      source: 'main',
      name: 'UCL Long Name',
      role: 'PhD student',
      homeInstitution: 'University College London',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'ucl-long-name.jpg',
      listOnBoldWebsite: 'YES',
    },
    {
      source: 'main',
      name: 'UCL Joint Affiliation',
      role: 'PhD student',
      homeInstitution: 'Google DeepMind; University College London',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'ucl-joint-affiliation.jpg',
      listOnBoldWebsite: 'YES',
    },
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
    'Oxford',
    'Imperial',
    'UCL',
    'Google DeepMind; UCL',
    'Oxford',
    'Imperial',
    'UCL',
  ])
})

test('Full Website Roster exposes PI role metadata only for named Principal Investigators', () => {
  const expectedPiRoles = {
    'jakob-foerster': 'Director / Human-Centric Learning and Discovery',
    'ani-calinescu': 'Training Environment',
    'antoine-cully': 'Strategy / Embodied Learning',
    'tim-rocktaschel': 'Stakeholder Engagement',
    'laura-toni': 'EDI / Beyond Backpropagation',
    'shimon-whiteson': 'Innovation & Translation',
  }

  assert.deepEqual(
    Object.fromEntries(
      people
        .filter((person) => person.piRole)
        .map((person) => [person.slug, person.piRole]),
    ),
    expectedPiRoles,
  )
})

test('Full Website Roster carries PhD cohort and CDT metadata', () => {
  const alistair = people.find((person) => person.slug === 'alistair-letcher')
  const antoine = people.find((person) => person.slug === 'antoine-gorceix')
  const francesco = people.find((person) => person.slug === 'francesco-capuano')
  const george = people.find((person) => person.slug === 'george-mavroghenis')
  const gregory = people.find((person) => person.slug === 'gregory-levy')
  const hannah = people.find((person) => person.slug === 'hannah-janmohamed')
  const harry = people.find((person) => person.slug === 'harry-mayne')
  const jakob = people.find((person) => person.slug === 'jakob-hartmann')
  const james = people.find((person) => person.slug === 'james-harvey')
  const jess = people.find((person) => person.slug === 'jess-carr')
  const marek = people.find((person) => person.slug === 'marek-masiak')
  const valentin = people.find((person) => person.slug === 'valentin-mohl')

  assert.equal(francesco?.phdSortSurname, 'Capuano')
  assert.equal(francesco?.phdStartYear, 2026)
  assert.equal(francesco?.phdStartYearStatus, 'user_provided')
  assert.equal(francesco?.cdtStudent, true)
  assert.equal(francesco?.cdtStartYear, 2025)
  assert.equal(antoine?.phdSortSurname, 'Gorceix')
  assert.equal(antoine?.phdStartYear, 2026)
  assert.equal(antoine?.phdStartYearStatus, 'user_provided')
  assert.equal(antoine?.cdtStudent, true)
  assert.equal(antoine?.cdtStartYear, 2025)
  assert.equal(jakob?.phdSortSurname, 'Hartmann')
  assert.equal(jakob?.phdStartYear, 2026)
  assert.equal(jakob?.phdStartYearStatus, 'user_provided')
  assert.equal(jakob?.cdtStudent, true)
  assert.equal(jakob?.cdtStartYear, 2025)
  assert.equal(james?.phdSortSurname, 'Harvey')
  assert.equal(james?.phdStartYear, 2026)
  assert.equal(james?.phdStartYearStatus, 'user_provided')
  assert.equal(james?.cdtStudent, true)
  assert.equal(james?.cdtStartYear, 2025)
  assert.equal(marek?.phdSortSurname, 'Masiak')
  assert.equal(marek?.phdStartYear, 2026)
  assert.equal(marek?.phdStartYearStatus, 'user_provided')
  assert.equal(marek?.cdtStudent, true)
  assert.equal(marek?.cdtStartYear, 2025)
  assert.equal(george?.phdSortSurname, 'Mavroghenis')
  assert.equal(george?.phdStartYear, 2026)
  assert.equal(george?.phdStartYearStatus, 'user_provided')
  assert.equal(george?.cdtStudent, false)
  assert.equal(george?.cdtStartYear, undefined)
  assert.equal(gregory?.phdSortSurname, 'Levy')
  assert.equal(gregory?.phdStartYear, 2026)
  assert.equal(gregory?.phdStartYearStatus, 'user_provided')
  assert.equal(gregory?.cdtStudent, false)
  assert.equal(gregory?.cdtStartYear, undefined)
  assert.equal(harry?.phdSortSurname, 'Mayne')
  assert.equal(harry?.phdStartYear, 2026)
  assert.equal(harry?.phdStartYearStatus, 'user_provided')
  assert.equal(harry?.cdtStudent, false)
  assert.equal(harry?.cdtStartYear, undefined)
  assert.equal(jess?.phdSortSurname, 'Carr')
  assert.equal(jess?.phdStartYear, 2026)
  assert.equal(jess?.phdStartYearStatus, 'user_provided')
  assert.equal(jess?.cdtStudent, true)
  assert.equal(jess?.cdtStartYear, 2025)
  assert.equal(alistair?.phdSortSurname, 'Letcher')
  assert.equal(alistair?.phdStartYear, 2024)
  assert.equal(alistair?.phdStartYearStatus, 'user_provided')
  assert.equal(alistair?.cdtStudent, false)
  assert.equal(alistair?.cdtStartYear, undefined)
  assert.equal(hannah?.phdSortSurname, 'Janmohamed')
  assert.equal(hannah?.phdStartYear, 2022)
  assert.equal(hannah?.phdStartYearStatus, 'user_provided')
  assert.equal(hannah?.cdtStudent, false)
  assert.equal(hannah?.cdtStartYear, undefined)
  assert.equal(valentin?.phdSortSurname, 'Mohl')
  assert.equal(valentin?.phdStartYear, 2024)
  assert.equal(valentin?.phdStartYearStatus, 'user_provided')
  assert.equal(valentin?.cdtStudent, false)
  assert.equal(valentin?.cdtStartYear, undefined)
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
      homeInstitution: 'Oxford',
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
      homeInstitution: 'Oxford',
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
      homeInstitution: 'Imperial',
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
      homeInstitution: 'UCL',
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
      homeInstitution: 'Oxford',
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
      homeInstitution: 'Oxford',
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
      ['X', 'https://x.com/compact_linked', false],
      ['LinkedIn', 'https://www.linkedin.com/in/compact-linked', false],
      ['GitHub', 'https://github.com/compact-linked', false],
    ],
  )
})

test('Every Website Roster Person resolves to an existing generated public image asset', async () => {
  assert.ok(people.length > 0)

  await Promise.all(
    people.map(async (person) => {
      assert.ok(person.image, `${person.name} is missing a profile image URL`)
      assert.match(person.image, /^\/profile-assets\/[A-Za-z0-9-]+\.(?:jpe?g|png|webp)$/)
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

test('Full Website Roster includes the missing active Foerster People once in the right People Sections', () => {
  const directory = buildPeopleDirectoryViewModel({
    people,
    filters: emptyFilters,
  })
  const listings = directory.sections.flatMap((section) => section.people)
  const listingBySlug = Object.fromEntries(
    listings.map((listing) => [listing.slug, listing]),
  )
  const scopedFoersterPeople = [
    ['jakob-foerster', 'Jakob Foerster', 'Faculty', 'Principal Investigator'],
    ['sam-coward', 'Sam Coward', 'DPhil Student', 'PhD Student'],
    ['matthew-jackson', 'Matthew Jackson', 'DPhil Student', 'PhD Student'],
    ['qizhen-zhang-irene', 'Qizhen Zhang (Irene)', 'DPhil Student', 'PhD Student'],
    ['andrei-lupu', 'Andrei Lupu', 'DPhil Student', 'PhD Student'],
    ['sebastian-towers', 'Sebastian Towers', 'DPhil Student', 'PhD Student'],
    [
      'maksymilian-wolski',
      'Maksymilian Wolski',
      'Visiting Student (MSc)',
      'Associate Members',
    ],
    ['tim-franzmeyer', 'Tim Franzmeyer', 'Associate PhD', 'Associate Members'],
  ]

  assert.deepEqual(
    scopedFoersterPeople.map(([slug]) => people.filter((person) => person.slug === slug).length),
    [1, 1, 1, 1, 1, 1, 1, 1],
  )
  assert.deepEqual(
    scopedFoersterPeople.map(([slug, name, role, peopleSection]) => ({
      slug,
      name: listingBySlug[slug]?.name,
      role: listingBySlug[slug]?.role,
      peopleSection: listingBySlug[slug]?.peopleSection,
      image: listingBySlug[slug]?.image,
    })),
    scopedFoersterPeople.map(([slug, name, role, peopleSection]) => ({
      slug,
      name,
      role,
      peopleSection,
      image: expectedProfileAssetUrl(slug),
    })),
  )

  assert.deepEqual(
    people.find((person) => person.slug === 'jakob-foerster')?.links,
    {
      website: 'https://www.jakobfoerster.com',
      twitter: 'https://twitter.com/j_foerst',
      googleScholar: 'https://scholar.google.com/citations?user=6z4lQzMAAAAJ&hl=en',
      github: 'https://github.com/jakobnicolaus',
    },
  )
  assert.equal(
    listingBySlug['sam-coward']?.primaryPersonLink,
    'https://dramacow.github.io',
  )
  const searchDirectory = buildPeopleDirectoryViewModel({
    people,
    filters: {
      ...emptyFilters,
      query: 'qizhen',
    },
  })
  const associateDirectory = buildPeopleDirectoryViewModel({
    people,
    filters: {
      ...emptyFilters,
      section: 'Associate Members',
    },
  })

  assert.deepEqual(
    searchDirectory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [['PhD Student', ['qizhen-zhang-irene']]],
  )
  assert.deepEqual(
    ['maksymilian-wolski', 'tim-franzmeyer'].map(
      (slug) =>
        associateDirectory.sections
          .flatMap((section) => section.people)
          .some((listing) => listing.slug === slug),
    ),
    [true, true],
  )
})

test('Full Website Roster retains scoped Foerster alumni without listing them publicly', () => {
  const directory = buildPeopleDirectoryViewModel({
    people,
    filters: emptyFilters,
  })
  const listings = directory.sections.flatMap((section) => section.people)
  const listingBySlug = Object.fromEntries(
    listings.map((listing) => [listing.slug, listing]),
  )
  const scopedFoersterAlumni = [
    [
      'ben-ellis',
      'Ben Ellis',
      'Research Scientist @ Reflection AI; DPhil 2021-2025',
    ],
    [
      'chris-lu',
      'Chris Lu',
      'Research Scientist @ OpenAI; DPhil 2021-2025',
    ],
    [
      'timon-willi',
      'Timon Willi',
      'Research Scientist @ Meta; DPhil 2021-2025',
    ],
    [
      'christian-schroeder-de-witt',
      'Christian Schroeder de Witt',
      'Postdoc @ TVG, Oxford; Postdoc 2021-2023',
    ],
    ['jia-wan', 'Jia Wan', 'PhD @ MIT; MSc 2022-2023'],
    ['matthias-hericks', 'Matthias Hericks', 'Data Scientist @ BCG; MSc 2021-2022'],
    ['noah-sarfati', 'Noah Sarfati', 'Applied Scientist @ Amazon; MSc 2021-2022'],
  ]

  assert.deepEqual(
    scopedFoersterAlumni.map(([slug]) => people.filter((person) => person.slug === slug).length),
    [1, 1, 1, 1, 1, 1, 1],
  )
  assert.deepEqual(
    scopedFoersterAlumni.map(([slug]) => {
      const person = people.find((person) => person.slug === slug)

      return {
        slug,
        name: person?.name,
        role: person?.role,
        alumni: person?.alumni,
        image: person?.image,
        listed: Boolean(listingBySlug[slug]),
      }
    }),
    scopedFoersterAlumni.map(([slug, name, role]) => ({
      slug,
      name,
      role,
      alumni: true,
      image: `/profile-assets/${slug}.webp`,
      listed: false,
    })),
  )
  assert.equal(people.filter((person) => person.slug === 'kang-li').length, 1)
  assert.equal(listingBySlug['kang-li']?.peopleSection, 'PhD Student')
  assert.equal(
    getPrimaryPersonLink(people.find((person) => person.slug === 'chris-lu')),
    'https://chrislu.page',
  )
  assert.deepEqual(people.find((person) => person.slug === 'noah-sarfati')?.links, {
    github: 'https://github.com/NoahSfi',
  })
})

test('Foerster members page comparison is represented in the Website Roster', () => {
  const directory = buildPeopleDirectoryViewModel({
    people,
    filters: emptyFilters,
  })
  const listingBySlug = Object.fromEntries(
    directory.sections
      .flatMap((section) => section.people)
      .map((listing) => [listing.slug, listing]),
  )
  const rosterBySlug = Object.fromEntries(
    people.map((person) => [person.slug, person]),
  )
  const publicFoersterRows = foersterMembersPageFixture.filter(
    ([, , , , peopleSection]) => peopleSection !== 'Alumni',
  )
  const alumniFoersterRows = foersterMembersPageFixture.filter(
    ([, , , , peopleSection]) => peopleSection === 'Alumni',
  )

  assert.equal(foersterMembersPageFixture.length, 50)
  assert.deepEqual(
    foersterMembersPageFixture.map(([, , rosterSlug]) =>
      people.filter((person) => person.slug === rosterSlug).length,
    ),
    Array.from({ length: foersterMembersPageFixture.length }, () => 1),
  )
  assert.deepEqual(
    publicFoersterRows.map(
      ([sourceSection, sourceName, rosterSlug, expectedName, peopleSection]) => {
        const listing = listingBySlug[rosterSlug]

        return {
          sourceSection,
          sourceName,
          rosterSlug,
          name: listing?.name,
          peopleSection: listing?.peopleSection,
          image: listing?.image,
        }
      },
    ),
    publicFoersterRows.map(
      ([sourceSection, sourceName, rosterSlug, expectedName, peopleSection]) => ({
        sourceSection,
        sourceName,
        rosterSlug,
        name: expectedName,
        peopleSection,
        image: expectedProfileAssetUrl(rosterSlug),
      }),
    ),
  )
  assert.deepEqual(
    alumniFoersterRows.map(
      ([sourceSection, sourceName, rosterSlug, expectedName]) => {
        const person = rosterBySlug[rosterSlug]

        return {
          sourceSection,
          sourceName,
          rosterSlug,
          name: person?.name,
          alumni: person?.alumni,
          image: person?.image,
          listed: Boolean(listingBySlug[rosterSlug]),
        }
      },
    ),
    alumniFoersterRows.map(
      ([sourceSection, sourceName, rosterSlug, expectedName]) => ({
        sourceSection,
        sourceName,
        rosterSlug,
        name: expectedName,
        alumni: true,
        image: `/profile-assets/${rosterSlug}.webp`,
        listed: false,
      }),
    ),
  )
  assert.deepEqual(
    [
      listingBySlug['sebastian-towers']?.primaryPersonLink,
      listingBySlug['maksymilian-wolski']?.primaryPersonLink,
    ],
    [null, null],
  )
  assert.deepEqual(
    Object.fromEntries(
      ['jonny-cook', 'alexander-rutherford', 'kang-li'].map((slug) => [
        slug,
        listingBySlug[slug]?.peopleSection,
      ]),
    ),
    {
      'jonny-cook': 'PhD Student',
      'alexander-rutherford': 'PhD Student',
      'kang-li': 'PhD Student',
    },
  )
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(foersterExpectedPublicLinkTypesBySlug).map(
        ([slug, expectedPublicLinkTypes]) => [
          slug,
          Object.keys(rosterBySlug[slug]?.links ?? {})
            .filter((linkType) => expectedPublicLinkTypes.includes(linkType))
            .sort(),
        ],
      ),
    ),
    Object.fromEntries(
      Object.entries(foersterExpectedPublicLinkTypesBySlug).map(
        ([slug, expectedPublicLinkTypes]) => [
          slug,
          [...expectedPublicLinkTypes].sort(),
        ],
      ),
    ),
  )
})

function expectedProfileAssetUrl(slug) {
  if (slug === 'ani-calinescu') {
    return '/profile-assets/ani-calinescu-new.jpg'
  }

  if (slug === 'antoine-cully') {
    return '/profile-assets/Antoine-Cully-new.png'
  }

  if (slug === 'jakob-foerster') {
    return '/profile-assets/jakob-foerster-new.png'
  }

  if (slug === 'ravi-hammond') {
    return '/profile-assets/ravi-hammond.png'
  }

  if (slug === 'shimon-whiteson') {
    return '/profile-assets/shimon-whiteson-new.jpg'
  }

  return `/profile-assets/${slug}.webp`
}

test('Full Website Roster builds the real sectioned People Directory', () => {
  const directory = buildPeopleDirectoryViewModel({
    people,
    filters: emptyFilters,
  })
  const listings = directory.sections.flatMap((section) => section.people)

  assert.equal(people.length, 108)
  assert.equal(people.filter((person) => person.alumni).length, 7)
  assert.equal(directory.totalPeople, 101)
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
  assert.equal(directory.visiblePeopleCount, 101)
  assert.deepEqual(
    Object.fromEntries(
      directory.sections.map((section) => [section.title, section.people.length]),
    ),
    {
      'Principal Investigator': 6,
      'Adjunct Faculty': 3,
      Postdoc: 7,
      'Research Engineers': 2,
      'PhD Student': 47,
      'Incoming PhD Students': 9,
      'Masters Student': 10,
      'Associate Members': 17,
    },
  )
  assert.equal(new Set(listings.map((listing) => listing.slug)).size, 101)
  assert.deepEqual(
    directory.sections.map((section) => section.title),
    [
      'Principal Investigator',
      'Adjunct Faculty',
      'Postdoc',
      'Research Engineers',
      'PhD Student',
      'Incoming PhD Students',
      'Masters Student',
      'Associate Members',
    ],
  )
  const alumniSlugs = new Set(
    people.filter((person) => person.alumni).map((person) => person.slug),
  )

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
  const listingBySlug = Object.fromEntries(
    listings.map((listing) => [listing.slug, listing]),
  )
  const expectedNewPublicSlugs = [
    'ahmet-hamdi-guzel',
    'kevin-buhler',
    'colin-lu',
    'luca-furieri',
    'kristen-menou',
    'aniket-chatterjee',
    'marek-masiak',
    'edan-toledo',
    'juan-agustin-duque',
    'arina-kosovskaia',
    'borja-gonzalez-leon',
    'aaron-rose',
    'henry-heppe',
  ]
  const expectedHiddenNewSlugs = [
    'labeebah-islaam',
    'lize-alberts',
    'garrett-deceuninck-ziviani',
    'utkarsh-gupta',
    'xi-xiong',
    'benjamin-moll',
  ]

  assert.deepEqual(
    expectedNewPublicSlugs.map((slug) => [
      slug,
      listingBySlug[slug]?.peopleSection,
    ]),
    [
      ['ahmet-hamdi-guzel', 'PhD Student'],
      ['kevin-buhler', 'Masters Student'],
      ['colin-lu', 'Associate Members'],
      ['luca-furieri', 'Associate Members'],
      ['kristen-menou', 'Associate Members'],
      ['aniket-chatterjee', 'Associate Members'],
      ['marek-masiak', 'Incoming PhD Students'],
      ['edan-toledo', 'Associate Members'],
      ['juan-agustin-duque', 'Associate Members'],
      ['arina-kosovskaia', 'Masters Student'],
      ['borja-gonzalez-leon', 'Associate Members'],
      ['aaron-rose', 'Masters Student'],
      ['henry-heppe', 'Masters Student'],
    ],
  )
  assert.deepEqual(
    expectedHiddenNewSlugs.map((slug) => listingBySlug[slug]),
    expectedHiddenNewSlugs.map(() => undefined),
  )
  assert.deepEqual(people.find((person) => person.slug === 'kevin-buhler')?.links, {
    website: 'https://kevinbuhler.com',
    linkedin: 'https://www.linkedin.com/in/kevin-buhler',
    github: 'https://github.com/kevbuh',
  })
  assert.deepEqual(people.find((person) => person.slug === 'colin-lu')?.links, {
    website: 'https://simplegeometry.github.io',
    twitter: 'https://x.com/_colin_lu',
  })
  assert.deepEqual(people.find((person) => person.slug === 'marek-masiak')?.links, {
    linkedin: 'https://www.linkedin.com/in/marekmasiak',
    twitter: 'https://x.com/marekmmas',
    googleScholar: 'https://scholar.google.com/citations?user=XBUX-cwAAAAJ',
  })
  assert.deepEqual(people.find((person) => person.slug === 'edan-toledo')?.links, {
    twitter: 'https://x.com/EdanToledo',
    googleScholar:
      'https://scholar.google.com/citations?user=_bLUH-MAAAAJ&hl=en&oi=ao',
  })
  assert.deepEqual(
    people.find((person) => person.slug === 'borja-gonzalez-leon')?.links,
    {
      website: 'https://borjagleon.com',
      twitter: 'https://x.com/borruell',
      googleScholar:
        'https://scholar.google.es/citations?user=sJiadiMAAAAJ&hl=en',
      linkedin: 'https://www.linkedin.com/in/borja-gonzalez-leon',
    },
  )
  assert.deepEqual(people.find((person) => person.slug === 'henry-heppe')?.links, {
    github: 'https://github.com/henry-heppe',
  })

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
  assert.deepEqual(people.find((person) => person.slug === 'gregory-levy')?.links, {
    website: 'https://gregorylevy.github.io',
    linkedin: 'https://www.linkedin.com/in/greg-levy-3779071a3',
    github: 'https://github.com/gregorylevy',
  })
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
      area: 'Human-AI Interaction',
      affiliation: allFilterValue,
    },
  })
  const affiliationDirectory = buildPeopleDirectoryViewModel({
    people,
    filters: {
      query: '',
      section: allFilterValue,
      area: allFilterValue,
      affiliation: 'Imperial',
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
      area: 'Robotics',
      affiliation: 'UCL',
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
      ['Research Engineers', ['jiankai-wang']],
      ['PhD Student', ['zilin-wang']],
    ],
  )
  assert.equal(matchingDirectory.visiblePeopleCount, 3)
  assert.equal(matchingDirectory.totalPeople, 101)

  assert.deepEqual(
    areaDirectory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [
      ['Postdoc', ['johannes-forkel']],
      [
        'PhD Student',
        ['ravi-hammond', 'shashank-reddy'],
      ],
      [
        'Incoming PhD Students',
        ['harry-mayne'],
      ],
      ['Associate Members', ['elif-akata']],
    ],
  )
  assert.equal(areaDirectory.visiblePeopleCount, 5)

  assert.deepEqual(
    affiliationDirectory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [
      ['Principal Investigator', ['antoine-cully']],
      ['Postdoc', ['cong-sun', 'paul-templier']],
      ['Research Engineers', ['jiankai-wang', 'oscar-pang']],
      [
        'PhD Student',
        [
          'konstantinos-mitsides',
          'hannah-janmohamed',
          'richard-bornemann',
          'lisa-coiffard',
          'runjun-mao',
        ],
      ],
      ['Incoming PhD Students', ['george-mavroghenis']],
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
          'kevin-buhler',
          'ali-farhat',
          'yuhe-gao',
          'henry-heppe',
          'arina-kosovskaia',
          'aramis-marti-shahandeh',
          'nathan-monette',
          'aaron-rose',
          'samuel-simons',
          'jacinto-suner',
        ],
      ],
    ],
  )
  assert.equal(sectionDirectory.visiblePeopleCount, 10)

  assert.deepEqual(
    combinedDirectory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [],
  )
  assert.equal(combinedDirectory.visiblePeopleCount, 0)
  assert.equal(combinedDirectory.totalPeople, 101)

  assert.deepEqual(emptyDirectory.sections, [])
  assert.equal(emptyDirectory.visiblePeopleCount, 0)
  assert.equal(emptyDirectory.totalPeople, 101)
})
