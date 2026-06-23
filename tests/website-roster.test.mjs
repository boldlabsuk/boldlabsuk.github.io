import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { access, readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { buildWebsiteRoster, people } from '../src/content/people.ts'
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
  ['DPhil Students', 'Shashank Reddy Chirra', 'shashank-reddy-chirra', 'Shashank Reddy Chirra', 'PhD Student'],
  ['DPhil Students', 'Alistair Letcher', 'alistair-letcher', 'Alistair Letcher', 'PhD Student'],
  ['DPhil Students', 'Theo Wolf', 'theo-wolf', 'Theo Wolf', 'PhD Student'],
  ['DPhil Students', 'Antonio León Villares', 'antonio-leon-villares', 'Antonio León Villares', 'PhD Student'],
  ['DPhil Students', 'Austin Tudor David Andrews', 'austin-tudor-david-andrews', 'Austin Tudor David Andrews', 'PhD Student'],
  ['DPhil Students', 'Jarek Liesen', 'jarek-liesen', 'Jarek Liesen', 'PhD Student'],
  ['DPhil Students', 'Ravi Hammond', 'ravi-hammond', 'Ravi Hammond', 'PhD Student'],
  ['DPhil Students', 'J Rosser', 'j-rosser', 'J Rosser', 'PhD Student'],
  ['DPhil Students', 'Hannah Erlebach', 'hannah-erlebach', 'Hannah Erlebach', 'PhD Student'],
  ['DPhil Students', 'Harry Mayne', 'harry-mayne', 'Harry Mayne', 'PhD Student'],
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
  ['Associate Members', 'Garrett Deceuninck-Ziviani', 'garrett-deceuninck-ziviani', 'Garrett Deceuninck-Ziviani', 'Associate Members'],
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
  'shashank-reddy-chirra': [
    'github',
    'googleScholar',
    'twitter',
    'website',
  ],
  'alistair-letcher': ['github', 'googleScholar', 'twitter', 'website'],
  'theo-wolf': ['github', 'googleScholar', 'twitter', 'website'],
  'antonio-leon-villares': ['github', 'googleScholar', 'website'],
  'austin-tudor-david-andrews': [
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
      homeInstitution: 'BOLD Lab',
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
    'Adjunct Faculty',
    'Postdoc',
    'Research Engineers',
    'PhD Student',
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

test('Website Roster retains explicit source alumni markers outside the public directory', () => {
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
      homeInstitution: 'University of Oxford',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'current-linked-person.jpg',
      listOnBoldWebsite: 'YES',
    },
    {
      source: 'foerster',
      name: 'Current Linked Person',
      role: 'Alumni',
      homeInstitution: 'University of Oxford',
      researchInterestKeywords: ['Evaluation'],
      profilePicture: 'current-linked-person.jpg',
      alumni: 'YES',
      socialLinks: 'https://github.com/current-linked-person',
    },
    {
      source: 'foerster',
      name: 'Out Of Scope Alumni',
      role: 'Former visitor',
      homeInstitution: 'University of Oxford',
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
      homeInstitution: 'University of Oxford',
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
      'garrett-deceuninck-ziviani',
      'Garrett Deceuninck-Ziviani',
      'Group Support',
      'Associate Members',
    ],
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
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
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
      image: `/profile-assets/${slug}.webp`,
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
  assert.deepEqual(
    people.find((person) => person.slug === 'garrett-deceuninck-ziviani')?.links,
    undefined,
  )
  assert.equal(listingBySlug['garrett-deceuninck-ziviani']?.primaryPersonLink, null)

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
    ['garrett-deceuninck-ziviani', 'maksymilian-wolski', 'tim-franzmeyer'].map(
      (slug) =>
        associateDirectory.sections
          .flatMap((section) => section.people)
          .some((listing) => listing.slug === slug),
    ),
    [true, true, true],
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

  assert.equal(foersterMembersPageFixture.length, 51)
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
        image: `/profile-assets/${rosterSlug}.webp`,
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
      listingBySlug['garrett-deceuninck-ziviani']?.primaryPersonLink,
      listingBySlug['maksymilian-wolski']?.primaryPersonLink,
    ],
    [null, null, null],
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

test('Full Website Roster builds the real sectioned People Directory', () => {
  const directory = buildPeopleDirectoryViewModel({
    people,
    filters: emptyFilters,
  })
  const listings = directory.sections.flatMap((section) => section.people)

  assert.equal(people.length, 96)
  assert.equal(people.filter((person) => person.alumni).length, 7)
  assert.equal(directory.totalPeople, 89)
  assert.equal(directory.visiblePeopleCount, 89)
  assert.deepEqual(
    Object.fromEntries(
      directory.sections.map((section) => [section.title, section.people.length]),
    ),
    {
      'Principal Investigator': 6,
      'Adjunct Faculty': 3,
      Postdoc: 7,
      'Research Engineers': 1,
      'PhD Student': 53,
      'Masters Student': 6,
      'Associate Members': 13,
    },
  )
  assert.equal(new Set(listings.map((listing) => listing.slug)).size, 89)
  assert.deepEqual(
    directory.sections.map((section) => section.title),
    [
      'Principal Investigator',
      'Adjunct Faculty',
      'Postdoc',
      'Research Engineers',
      'PhD Student',
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

  assert.equal(
    listingBySlug['nathan-monette']?.primaryPersonLink,
    'https://nmonette.github.io',
  )
  assert.equal(
    listingBySlug['shashank-reddy-chirra']?.primaryPersonLink,
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
  assert.equal(matchingDirectory.totalPeople, 89)

  assert.deepEqual(
    areaDirectory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [
      ['Principal Investigator', ['shimon-whiteson']],
      ['Adjunct Faculty', ['jack-parker-holder', 'roberta-raileanu']],
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
  assert.equal(areaDirectory.visiblePeopleCount, 17)

  assert.deepEqual(
    affiliationDirectory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [
      ['Principal Investigator', ['antoine-cully']],
      ['Postdoc', ['paul-templier', 'cong-sun']],
      ['Research Engineers', ['oscar-pang']],
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
      ['Associate Members', ['george-mavroghenis', 'jiankai-wang']],
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
          'yuhe-gao',
          'aramis-marti-shahandeh',
          'jacinto-suner',
          'samuel-simons',
          'ali-farhat',
        ],
      ],
    ],
  )
  assert.equal(sectionDirectory.visiblePeopleCount, 6)

  assert.deepEqual(
    combinedDirectory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [],
  )
  assert.equal(combinedDirectory.visiblePeopleCount, 0)
  assert.equal(combinedDirectory.totalPeople, 89)

  assert.deepEqual(emptyDirectory.sections, [])
  assert.equal(emptyDirectory.visiblePeopleCount, 0)
  assert.equal(emptyDirectory.totalPeople, 89)
})
