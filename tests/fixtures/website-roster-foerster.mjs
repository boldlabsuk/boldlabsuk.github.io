export const foersterAliasesSourcePeople = [
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
    socialLinks: 'https://scholar.google.com/citations?user=12Q-VD4AAAAJ&hl=en',
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
    socialLinks:
      'https://twitter.com/Kang__Oxford; https://github.com/KangOxford',
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
]

export const expectedAliasJonnyCookLinks = {
  twitter: 'https://x.com/jonnycoook?s=11',
  googleScholar: 'https://scholar.google.com/citations?user=7tcPHHYAAAAJ&hl=en',
  github: 'https://github.com/jonathan-cook235',
}

export const expectedAliasAlexanderRutherfordLinks = {
  website: 'https://amacrutherford.com',
  googleScholar: 'https://scholar.google.com/citations?user=EOjYGf0AAAAJ&hl=en',
  twitter: 'https://twitter.com/alexrutherford0',
  github: 'https://github.com/amacrutherford',
}

export const expectedAliasKangLiLinks = {
  googleScholar: 'https://scholar.google.com/citations?user=12Q-VD4AAAAJ&hl=en',
  twitter: 'https://twitter.com/Kang__Oxford',
  github: 'https://github.com/KangOxford',
}

export const expectedJonnyCookLinks = {
  twitter: 'https://x.com/jonnycoook?s=11',
  googleScholar: 'https://scholar.google.com/citations?user=7tcPHHYAAAAJ&hl=en',
  github: 'https://github.com/jonathan-cook235',
}

export const expectedAlexanderRutherfordLinks = {
  website: 'https://amacrutherford.com',
  googleScholar: 'https://scholar.google.com/citations?user=EOjYGf0AAAAJ&hl=en',
  twitter: 'https://twitter.com/alexrutherford0',
  github: 'https://github.com/amacrutherford',
}

export const expectedKangLiLinks = {
  googleScholar: 'https://scholar.google.com/citations?user=12Q-VD4AAAAJ&hl=en',
  twitter: 'https://twitter.com/Kang__Oxford',
  github: 'https://github.com/KangOxford',
}

export const expectedElifAkataLinks = {
  website: 'https://eliaka.github.io',
  twitter: 'https://x.com/elifakata',
  googleScholar:
    'https://scholar.google.com/citations?user=T__E730AAAAJ&hl=en&oi=ao',
}

export const missingFoersterScopedFoersterPeople = [
  ['jakob-foerster', 'Jakob Foerster', 'Faculty', 'Principal Investigator'],
  ['sam-coward', 'Sam Coward', 'DPhil Student', 'PhD Student'],
  ['matthew-jackson', 'Matthew Jackson', 'DPhil Student', 'PhD Student'],
  [
    'qizhen-zhang-irene',
    'Qizhen Zhang (Irene)',
    'DPhil Student',
    'PhD Student',
  ],
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

export const expectedJakobFoersterLinks = {
  website: 'https://www.jakobfoerster.com',
  twitter: 'https://twitter.com/j_foerst',
  googleScholar: 'https://scholar.google.com/citations?user=6z4lQzMAAAAJ&hl=en',
  github: 'https://github.com/jakobnicolaus',
}

export const foersterAlumniScopedFoersterAlumni = [
  [
    'ben-ellis',
    'Ben Ellis',
    'Research Scientist @ Reflection AI; DPhil 2021-2025',
  ],
  ['chris-lu', 'Chris Lu', 'Research Scientist @ OpenAI; DPhil 2021-2025'],
  [
    'christian-schroeder-de-witt',
    'Christian Schroeder de Witt',
    'Postdoc @ TVG, Oxford; Postdoc 2021-2023',
  ],
  ['jia-wan', 'Jia Wan', 'PhD @ MIT; MSc 2022-2023'],
  [
    'matthias-hericks',
    'Matthias Hericks',
    'Data Scientist @ BCG; MSc 2021-2022',
  ],
  ['noah-sarfati', 'Noah Sarfati', 'Applied Scientist @ Amazon; MSc 2021-2022'],
]

export const expectedFoersterAliasSections = {
  'jonny-cook': 'PhD Student',
  'alexander-rutherford': 'PhD Student',
  'kang-li': 'PhD Student',
}
