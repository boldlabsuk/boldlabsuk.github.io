export const expectedPublicSectionCounts = {
  'Principal Investigator': 6,
  'Adjunct Faculty': 3,
  Postdoc: 7,
  'Research Engineers': 2,
  'PhD Student': 51,
  'Incoming PhD Students': 3,
  'Masters Student': 14,
  'Associate Faculty': 6,
  'Associate Members': 33,
}

export const expectedPublicSectionOrder = [
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

export const publicDirectoryExpectedNewPublicSlugs = [
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
  'alexandre-bismuth',
  'michal-bravansky',
  'suhas-hariharan',
  'mert-albeyoglu',
  'ross-murphy',
  'jack-dalton',
  'mohammed-amara',
  'harry-mead',
  'zhengyao-jiang',
  'robert-kirk',
  'timon-willi',
  'yingchen-xu',
  'davide-paglieri',
  'efstathios-siatras',
  'mikayel-samvelyan',
  'roberto-rafael-maura-rivero',
  'evzen-wybitul',
  'bassel-al-omari',
  'xi-xiong',
  'kale-ab-tessera',
  'brandon-kaplowitz',
  'adrian-hayler',
  'aime-bienfait-igiraneza',
  'stefan-zohren',
]

export const publicDirectoryExpectedHiddenNewSlugs = [
  'labeebah-islaam',
  'lize-alberts',
  'garrett-deceuninck-ziviani',
  'utkarsh-gupta',
  'benjamin-moll',
]

export const expectedNewPublicSections = [
  ['ahmet-hamdi-guzel', 'PhD Student'],
  ['kevin-buhler', 'Masters Student'],
  ['colin-lu', 'Associate Members'],
  ['luca-furieri', 'Associate Faculty'],
  ['kristen-menou', 'Associate Faculty'],
  ['aniket-chatterjee', 'Associate Members'],
  ['marek-masiak', 'Associate Members'],
  ['edan-toledo', 'Associate Members'],
  ['juan-agustin-duque', 'Associate Members'],
  ['arina-kosovskaia', 'Masters Student'],
  ['borja-gonzalez-leon', 'Associate Members'],
  ['aaron-rose', 'Masters Student'],
  ['henry-heppe', 'Masters Student'],
  ['alexandre-bismuth', 'Masters Student'],
  ['michal-bravansky', 'Masters Student'],
  ['suhas-hariharan', 'Masters Student'],
  ['mert-albeyoglu', 'Masters Student'],
  ['ross-murphy', 'PhD Student'],
  ['jack-dalton', 'Associate Members'],
  ['mohammed-amara', 'Associate Members'],
  ['harry-mead', 'PhD Student'],
  ['zhengyao-jiang', 'Associate Faculty'],
  ['robert-kirk', 'Associate Members'],
  ['timon-willi', 'Associate Members'],
  ['yingchen-xu', 'Associate Members'],
  ['davide-paglieri', 'Associate Members'],
  ['efstathios-siatras', 'Associate Members'],
  ['mikayel-samvelyan', 'Associate Members'],
  ['roberto-rafael-maura-rivero', 'Associate Members'],
  ['evzen-wybitul', 'Associate Members'],
  ['bassel-al-omari', 'Incoming PhD Students'],
  ['xi-xiong', 'Associate Faculty'],
  ['kale-ab-tessera', 'Associate Members'],
  ['brandon-kaplowitz', 'Associate Members'],
  ['adrian-hayler', 'Associate Members'],
  ['aime-bienfait-igiraneza', 'Associate Members'],
  ['stefan-zohren', 'Associate Faculty'],
]

export const expectedKevinBuhlerLinks = {
  website: 'https://kevinbuhler.com',
  linkedin: 'https://www.linkedin.com/in/kevin-buhler',
  github: 'https://github.com/kevbuh',
}

export const expectedMarekMasiakLinks = {
  linkedin: 'https://www.linkedin.com/in/marekmasiak',
  twitter: 'https://x.com/marekmmas',
  googleScholar: 'https://scholar.google.com/citations?user=XBUX-cwAAAAJ',
}

export const expectedEdanToledoLinks = {
  twitter: 'https://x.com/EdanToledo',
  googleScholar:
    'https://scholar.google.com/citations?user=_bLUH-MAAAAJ&hl=en&oi=ao',
}

export const expectedBorjaGonzalezLeonLinks = {
  website: 'https://borjagleon.com',
  twitter: 'https://x.com/borruell',
  googleScholar: 'https://scholar.google.es/citations?user=sJiadiMAAAAJ&hl=en',
  linkedin: 'https://www.linkedin.com/in/borja-gonzalez-leon',
}

export const expectedMertAlbeyogluProfile = {
  slug: 'mert-albeyoglu',
  name: 'Mert Albeyoglu',
  role: 'MEng Computer Science ’26',
  group: 'Masters Student',
  affiliation: 'UCL',
  bio: '',
  image: '/profile-assets/mert-albeyoglu.webp',
  links: {
    linkedin: 'https://www.linkedin.com/in/mertalbeyoglu',
    github: 'https://github.com/LYOK0',
  },
  researchAreas: ['Machine Learning'],
  supervisors: ['Tim Rocktäschel'],
}

export const expectedGregoryLevyLinks = {
  website: 'https://gregorylevy.github.io',
  linkedin: 'https://www.linkedin.com/in/greg-levy-3779071a3',
  github: 'https://github.com/gregorylevy',
}

export const combinedRosterFilters = {
  query: 'wang',
  section: 'PhD Student',
  area: 'Robotics',
  affiliation: 'UCL',
}

export const expectedNameMatches = [
  ['Postdoc', ['yulin-wang']],
  ['PhD Student', ['zilin-wang']],
  ['Research Engineers', ['jiankai-wang']],
]

export const expectedResearchAreaMatches = [
  ['Postdoc', ['johannes-forkel']],
  [
    'PhD Student',
    ['ravi-hammond', 'ross-murphy', 'shashank-reddy', 'harry-mayne'],
  ],
  [
    'Associate Members',
    ['elif-akata', 'jack-dalton', 'roberto-rafael-maura-rivero'],
  ],
]

export const expectedAffiliationMatches = [
  ['Principal Investigator', ['antoine-cully']],
  ['Postdoc', ['cong-sun', 'paul-templier']],
  [
    'PhD Student',
    [
      'richard-bornemann',
      'lisa-coiffard',
      'runjun-mao',
      'konstantinos-mitsides',
      'hannah-janmohamed',
    ],
  ],
  ['Research Engineers', ['jiankai-wang', 'oscar-pang']],
  ['Incoming PhD Students', ['george-mavroghenis']],
]

export const expectedMastersStudents = [
  [
    'Masters Student',
    [
      'mert-albeyoglu',
      'alexandre-bismuth',
      'michal-bravansky',
      'kevin-buhler',
      'ali-farhat',
      'yuhe-gao',
      'suhas-hariharan',
      'henry-heppe',
      'arina-kosovskaia',
      'aramis-marti-shahandeh',
      'nathan-monette',
      'aaron-rose',
      'samuel-simons',
      'jacinto-suner',
    ],
  ],
]
