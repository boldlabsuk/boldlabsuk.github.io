export const expectedShuffledSectionCounts = [
  ['Principal Investigator', 3],
  ['Adjunct Faculty', 3],
  ['Postdoc', 3],
  ['PhD Student', 1],
]

export const expectedShuffledSectionListings = [
  ['Principal Investigator', ['pi-one', 'pi-two', 'pi-three']],
  ['Adjunct Faculty', ['adjunct-one', 'adjunct-two', 'adjunct-three']],
  ['Postdoc', ['postdoc-one', 'postdoc-three', 'postdoc-two']],
  ['PhD Student', ['phd-one']],
]

export const phdOrderingExpectedPhdSection = [
  'uljad-berdica',
  'sam-coward',
  'matthew-jackson',
  'keyue-jiang',
  'qizhen-zhang-irene',
  'george-mavroghenis',
  'alex-zakharov',
]

export const filteredShuffleExpectedDirectory = [
  ['Principal Investigator', ['pi-one', 'pi-three']],
  ['Adjunct Faculty', ['adjunct-one', 'adjunct-three']],
  ['Postdoc', ['postdoc-one', 'postdoc-two']],
  ['PhD Student', ['phd-one']],
]

export const staticOrderingExpectedDirectory = [
  'jakob-foerster',
  'tim-rocktaschel',
  'ani-calinescu',
  'antoine-cully',
  'laura-toni',
  'shimon-whiteson',
]

export const sectionHeadingsExpectedDirectory = [
  'Principal Investigators',
  'Adjunct Faculty',
  'Postdocs',
  'PhD Students',
  'Research Engineers',
  "Master's Students",
  'Incoming PhD Students',
  'Associate Faculty',
  'Associate Members',
]

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

export const representativePublicSlugs = [
  'tim-rocktaschel',
  'ed-grefenstette',
  'jack-parker-holder',
  'roberta-raileanu',
  'oscar-pang',
  'nathan-monette',
  'alfie-lamerton',
]

export const expectedRepresentativeSections = {
  'tim-rocktaschel': 'Principal Investigator',
  'ed-grefenstette': 'Adjunct Faculty',
  'jack-parker-holder': 'Adjunct Faculty',
  'roberta-raileanu': 'Adjunct Faculty',
  'oscar-pang': 'Research Engineers',
  'nathan-monette': 'Masters Student',
  'alfie-lamerton': 'Associate Members',
}

export const alumniExclusionAlumniFlaggedPi = {
  slug: 'alumni-flagged-pi',
  name: 'Alumni Flagged PI',
  role: 'Former PI',
  group: 'BOLD PI',
  bio: 'Former lab lead.',
  researchAreas: ['Evaluation'],
  alumni: true,
}

export const alumniExclusionAlumniGroupMember = {
  slug: 'alumni-group-member',
  name: 'Alumni Group Member',
  role: 'Former member',
  group: 'Alumni',
  bio: 'Former lab member.',
  researchAreas: ['Evaluation'],
}

export const expectedPrincipalInvestigators = [
  'jakob-foerster',
  'ani-calinescu',
  'tim-rocktaschel',
  'antoine-cully',
  'laura-toni',
  'shimon-whiteson',
]

export const expectedPostdocs = [
  'dylan-cope',
  'branton-demoss',
  'mattie-fellows',
  'johannes-forkel',
  'cong-sun',
  'paul-templier',
  'yulin-wang',
]

export const expectedMastersStudents = [
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
]

export const expectedAssociateFaculty = [
  'luca-furieri',
  'zhengyao-jiang',
  'aya-kayal',
  'kristen-menou',
  'xi-xiong',
  'stefan-zohren',
]

export const expectedAssociateMembers = [
  'satyam-agarwal',
  'elif-akata',
  'mohammed-amara',
  'junming-an',
  'simon-buhrer',
  'francesco-capuano',
  'jess-carr',
  'aniket-chatterjee',
  'evangelos-chatzaroulas',
  'jack-dalton',
  'juan-agustin-duque',
  'erik-feng',
  'tim-franzmeyer',
  'jakob-hartmann',
  'james-harvey',
  'adrian-hayler',
  'aime-bienfait-igiraneza',
  'brandon-kaplowitz',
  'robert-kirk',
  'alfie-lamerton',
  'borja-gonzalez-leon',
  'colin-lu',
  'marek-masiak',
  'roberto-rafael-maura-rivero',
  'davide-paglieri',
  'mikayel-samvelyan',
  'efstathios-siatras',
  'kale-ab-tessera',
  'edan-toledo',
  'timon-willi',
  'maksymilian-wolski',
  'evzen-wybitul',
  'yingchen-xu',
]

export const phdCohortsExpectedPhdSection = [
  'austin-andrews',
  'richard-bornemann',
  'hannah-erlebach',
  'tingchen-fu',
  'ravi-hammond',
  'antonio-leon-villares',
  'gregory-levy',
  'jarek-liesen',
  'aneesh-muppidi',
  'ross-murphy',
  'shashank-reddy',
  'j-rosser',
  'lukas-seier',
  'theo-wolf',
  'lisa-coiffard',
  'thom-foster',
  'ahmet-hamdi-guzel',
  'nathan-herr',
  'alistair-letcher',
  'runjun-mao',
  'harry-mead',
  'konstantinos-mitsides',
  'valentin-mohl',
  'sumeet-motwani',
  'darius-muglich',
  'george-nigmatulin',
  'bidipta-sarkar',
  'zilin-wang',
  'clarisse-wibault',
  'eltayeb-ahmed',
  'uljad-berdica',
  'michael-beukman',
  'jonny-cook',
  'sam-coward',
  'alex-goldie',
  'alisia-lupidi',
  'michael-matthews',
  'harry-mayne',
  'alex-zakharov',
  'matthew-jackson',
  'hannah-janmohamed',
  'keyue-jiang',
  'ola-kalisz',
  'kang-li',
  'andrei-lupu',
  'alexander-rutherford',
  'silvia-sapora',
  'anya-sims',
  'sebastian-towers',
  'qizhen-zhang-irene',
  'nagham-osman',
]
