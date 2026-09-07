export const centralSourceRowsSourcePeople = [
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
    supervisors: 'Included PI, External Mentor',
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
]

export const centralSourceRowsExpectedPeopleSectionOrder = [
  'Principal Investigator',
  'Adjunct Faculty',
  'Postdoc',
  'PhD Student',
  'Research Engineers',
  'Masters Student',
  'Incoming PhD Students',
  'Associate Faculty',
  'Associate Members',
]

export const researchAreasSourcePeople = [
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
]

export const researchAreasExpectedRoster = [
  'Reinforcement Learning',
  'Language Models',
  'AI for Science',
  'Open-Ended Learning',
  'Multi-Agent Systems',
  'Human-AI Interaction',
]

export const profileFormatsSourcePeople = [
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
]

export const explicitAlumniSourcePeople = [
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
]

export const supplementalAlumniSourcePeople = [
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
]

export const supplementalAlumniExpectedRoster = [
  [
    'current-linked-person',
    { github: 'https://github.com/current-linked-person' },
  ],
  ['explicit-alumni', { github: 'https://github.com/explicit-alumni' }],
]

export const publicLinksSourcePeople = [
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
]

export const publicLinksExpectedRoster = {
  website: 'https://linked.example',
  googleScholar: 'https://scholar.google.com/citations?user=abc',
  github: 'https://github.com/linked-researcher',
  linkedin: 'https://www.linkedin.com/in/linked-researcher',
  twitter: 'https://x.com/linked_ai',
}

export const labeledLinksSourcePeople = [
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
]

export const labeledLinksExpectedRoster = {
  website: 'https://spreadsheet.example',
  twitter: 'https://x.com/spreadsheet_ai',
  googleScholar: 'https://scholar.google.co.uk/citations?user=spreadsheet',
  linkedin: 'https://www.linkedin.com/in/spreadsheet',
}

export const affiliationsSourcePeople = [
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
]

export const affiliationsExpectedRoster = [
  'Oxford',
  'Imperial',
  'UCL',
  'Google DeepMind; UCL',
  'Oxford',
  'Imperial',
  'UCL',
]

export const piMetadataExpectedPiRoles = {
  'jakob-foerster': 'Director / Human-Centric Learning and Discovery',
  'ani-calinescu': 'Training Environment',
  'antoine-cully': 'Strategy / Embodied Learning',
  'tim-rocktaschel': 'Stakeholder Engagement',
  'laura-toni': 'EDI / Beyond Backpropagation',
  'shimon-whiteson': 'Innovation & Translation',
}

export const expectedAssociateFacultyMetadata = {
  'aya-kayal': {
    role: 'Assistant Professor',
    affiliation: 'American University of Beirut',
  },
  'luca-furieri': {
    role: 'Associate Professor',
    affiliation: 'Oxford',
  },
  'stefan-zohren': {
    role: 'Associate Faculty',
    affiliation: 'Oxford',
  },
  'xi-xiong': {
    role: 'Associate Faculty',
    affiliation: 'Tongji University',
  },
  'kristen-menou': {
    role: 'Associate Faculty',
    affiliation: 'University of Toronto',
  },
  'zhengyao-jiang': {
    role: 'Professor',
    affiliation: 'Tongji University',
  },
}

export const blueskySourcePeople = [
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
]

export const socialDomainsSourcePeople = [
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
]

export const primaryLinksSourcePeople = [
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
]

export const primaryLinksExpectedDirectory = [
  ['website-preferred', 'https://website-preferred.example'],
  ['scholar-preferred', 'https://scholar.google.com/citations?user=scholar'],
  ['social-only', 'https://x.com/social_only'],
]

export const privateLinksSourcePeople = [
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
]

export const compactLinksSourcePeople = [
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
]

export const compactLinksExpectedLinks = [
  ['Website', 'https://compact.example', false],
  [
    'Google Scholar',
    'https://scholar.google.com/citations?user=compact',
    false,
  ],
  ['X', 'https://x.com/compact_linked', false],
  ['LinkedIn', 'https://www.linkedin.com/in/compact-linked', false],
  ['GitHub', 'https://github.com/compact-linked', false],
]

export const phdMetadataByPerson = [
  {
    slug: 'alistair-letcher',
    fields: {
      phdSortSurname: 'Letcher',
      phdStartYear: 2024,
      phdStartYearStatus: 'user_provided',
      cdtStudent: false,
      cdtStartYear: undefined,
    },
  },
  {
    slug: 'antoine-gorceix',
    fields: {
      phdSortSurname: 'Gorceix',
      phdStartYear: 2026,
      phdStartYearStatus: 'user_provided',
      cdtStudent: true,
      cdtStartYear: 2025,
    },
  },
  {
    slug: 'bassel-al-omari',
    fields: {
      phdStartYear: 2026,
      phdStartYearStatus: 'user_provided',
      cdtStudent: undefined,
      cdtStartYear: undefined,
    },
  },
  {
    slug: 'george-mavroghenis',
    fields: {
      phdSortSurname: 'Mavroghenis',
      phdStartYear: 2026,
      phdStartYearStatus: 'user_provided',
      cdtStudent: false,
      cdtStartYear: undefined,
    },
  },
  {
    slug: 'gregory-levy',
    fields: {
      phdSortSurname: 'Levy',
      phdStartYear: 2025,
      phdStartYearStatus: 'user_provided',
      cdtStudent: false,
      cdtStartYear: undefined,
    },
  },
  {
    slug: 'hannah-janmohamed',
    fields: {
      phdSortSurname: 'Janmohamed',
      phdStartYear: 2022,
      phdStartYearStatus: 'user_provided',
      cdtStudent: false,
      cdtStartYear: undefined,
    },
  },
  {
    slug: 'harry-mayne',
    fields: {
      phdSortSurname: 'Mayne',
      phdStartYear: 2023,
      phdStartYearStatus: 'user_provided',
      cdtStudent: false,
      cdtStartYear: undefined,
    },
  },
  {
    slug: 'kang-li',
    fields: {
      phdSortSurname: 'Li',
      phdStartYear: 2022,
      phdStartYearStatus: 'user_provided',
      cdtStudent: false,
      cdtStartYear: undefined,
    },
  },
  {
    slug: 'lisa-coiffard',
    fields: {
      phdSortSurname: 'Coiffard',
      phdStartYear: 2024,
      phdStartYearStatus: 'user_provided',
      cdtStudent: false,
      cdtStartYear: undefined,
    },
  },
  {
    slug: 'nathan-herr',
    fields: {
      phdSortSurname: 'Herr',
      phdStartYear: 2024,
      phdStartYearStatus: 'user_provided',
      cdtStudent: true,
      cdtStartYear: 2023,
    },
  },
  {
    slug: 'richard-bornemann',
    fields: {
      phdSortSurname: 'Bornemann',
      phdStartYear: 2025,
      phdStartYearStatus: 'user_provided',
      cdtStudent: false,
      cdtStartYear: undefined,
    },
  },
  {
    slug: 'ross-murphy',
    fields: {
      phdSortSurname: 'Murphy',
      phdStartYear: 2025,
      phdStartYearStatus: 'user_provided',
      cdtStudent: false,
      cdtStartYear: undefined,
    },
  },
  {
    slug: 'runjun-mao',
    fields: {
      phdSortSurname: 'Mao',
      phdStartYear: 2024,
      phdStartYearStatus: 'user_provided',
      cdtStudent: false,
      cdtStartYear: undefined,
    },
  },
  {
    slug: 'valentin-mohl',
    fields: {
      phdSortSurname: 'Mohl',
      phdStartYear: 2024,
      phdStartYearStatus: 'user_provided',
      cdtStudent: false,
      cdtStartYear: undefined,
    },
  },
]
