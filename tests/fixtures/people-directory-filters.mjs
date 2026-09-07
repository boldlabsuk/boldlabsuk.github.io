export const filterOptionsExpectedOptions = [
  'Jakob Foerster',
  'Tim Rocktäschel',
  'Ani Calinescu',
  'Antoine Cully',
  'Laura Toni',
  'Shimon Whiteson',
]

export const supervisorFilterExpectedDirectory = [
  ['Principal Investigator', ['alex-principal']],
  ['Postdoc', ['casey-postdoc']],
  ['PhD Student', ['devon-dphil']],
  ['Research Engineers', ['riley-associate']],
]

export const primaryLinksExpected = [
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
]

export const primaryLinksExpectedDirectory = [
  ['Website Link', 'https://example.ac.uk/website-link'],
  ['Scholar Link', 'https://scholar.google.com/scholar-link'],
  ['Social Link', 'https://github.com/social-link'],
  ['No Link', null],
  ['Blank Preferred Link', 'https://www.linkedin.com/in/blank-preferred-link'],
]

export const compactListingsExpected = [
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
]

export const compactListingsExpectedDirectory = {
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
}

export const piRoleExpected = [
  {
    slug: 'pi-with-role',
    name: 'PI With Role',
    role: 'BOLD PI',
    group: 'BOLD PI',
    piRole: 'Training Environment',
    affiliation: 'Oxford',
    bio: 'This biography belongs on the Person detail page only.',
    researchAreas: ['Evaluation'],
  },
  {
    slug: 'postdoc-without-role',
    name: 'Postdoc Without Role',
    role: 'Postdoc',
    group: 'Postdoc',
    affiliation: 'UCL',
    bio: 'This biography belongs on the Person detail page only.',
    researchAreas: ['Agents'],
  },
]
