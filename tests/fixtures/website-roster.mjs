import { allFilterValue } from '../../src/domain/shared.ts'

export const emptyFilters = {
  query: '',
  section: allFilterValue,
  area: allFilterValue,
  affiliation: allFilterValue,
  supervisor: allFilterValue,
}

// Mirrors https://foersterlab.com/members/ as checked on 2026-06-22.
export const foersterMembersPageFixture = [
  [
    'Faculty',
    'Jakob Foerster',
    'jakob-foerster',
    'Jakob Foerster',
    'Principal Investigator',
  ],
  ['Postdocs', 'Yulin Wang', 'yulin-wang', 'Yulin Wang', 'Postdoc'],
  ['Postdocs', 'Dylan Cope', 'dylan-cope', 'Dylan Cope', 'Postdoc'],
  [
    'Postdocs',
    'Johannes Forkel',
    'johannes-forkel',
    'Johannes Forkel',
    'Postdoc',
  ],
  ['Postdocs', 'Mattie Fellows', 'mattie-fellows', 'Mattie Fellows', 'Postdoc'],
  [
    'DPhil Students',
    'Lukas Seier',
    'lukas-seier',
    'Lukas Seier',
    'PhD Student',
  ],
  [
    'DPhil Students',
    'Shashank Reddy',
    'shashank-reddy',
    'Shashank Reddy',
    'PhD Student',
  ],
  [
    'DPhil Students',
    'Alistair Letcher',
    'alistair-letcher',
    'Alistair Letcher',
    'PhD Student',
  ],
  ['DPhil Students', 'Theo Wolf', 'theo-wolf', 'Theo Wolf', 'PhD Student'],
  [
    'DPhil Students',
    'Antonio León Villares',
    'antonio-leon-villares',
    'Antonio León Villares',
    'PhD Student',
  ],
  [
    'DPhil Students',
    'Austin Andrews',
    'austin-andrews',
    'Austin Andrews',
    'PhD Student',
  ],
  [
    'DPhil Students',
    'Jarek Liesen',
    'jarek-liesen',
    'Jarek Liesen',
    'PhD Student',
  ],
  [
    'DPhil Students',
    'Ravi Hammond',
    'ravi-hammond',
    'Ravi Hammond',
    'PhD Student',
  ],
  ['DPhil Students', 'J Rosser', 'j-rosser', 'J Rosser', 'PhD Student'],
  [
    'DPhil Students',
    'Hannah Erlebach',
    'hannah-erlebach',
    'Hannah Erlebach',
    'PhD Student',
  ],
  [
    'DPhil Students',
    'Harry Mayne',
    'harry-mayne',
    'Harry Mayne',
    'PhD Student',
  ],
  [
    'DPhil Students',
    'Darius Muglich',
    'darius-muglich',
    'Darius Muglich',
    'PhD Student',
  ],
  [
    'DPhil Students',
    'Bidipta Sarkar',
    'bidipta-sarkar',
    'Bidipta Sarkar',
    'PhD Student',
  ],
  [
    'DPhil Students',
    'Thom Foster',
    'thom-foster',
    'Thom Foster',
    'PhD Student',
  ],
  [
    'DPhil Students',
    'Clarisse Wibault',
    'clarisse-wibault',
    'Clarisse Wibault',
    'PhD Student',
  ],
  ['DPhil Students', 'Zilin Wang', 'zilin-wang', 'Zilin Wang', 'PhD Student'],
  ['DPhil Students', 'Sam Coward', 'sam-coward', 'Sam Coward', 'PhD Student'],
  [
    'DPhil Students',
    'Michael Matthews',
    'michael-matthews',
    'Michael Matthews',
    'PhD Student',
  ],
  [
    'DPhil Students',
    'Uljad Berdica',
    'uljad-berdica',
    'Uljad Berdica',
    'PhD Student',
  ],
  [
    'DPhil Students',
    'Jonathan Cook',
    'jonny-cook',
    'Jonny Cook',
    'PhD Student',
  ],
  [
    'DPhil Students',
    'Michael Beukman',
    'michael-beukman',
    'Michael Beukman',
    'PhD Student',
  ],
  [
    'DPhil Students',
    'Alex Goldie',
    'alex-goldie',
    'Alex Goldie',
    'PhD Student',
  ],
  [
    'DPhil Students',
    'Matthew Jackson',
    'matthew-jackson',
    'Matthew Jackson',
    'PhD Student',
  ],
  [
    'DPhil Students',
    'Qizhen Zhang (Irene)',
    'qizhen-zhang-irene',
    'Qizhen Zhang (Irene)',
    'PhD Student',
  ],
  [
    'DPhil Students',
    'Silvia Sapora',
    'silvia-sapora',
    'Silvia Sapora',
    'PhD Student',
  ],
  [
    'DPhil Students',
    'Andrei Lupu',
    'andrei-lupu',
    'Andrei Lupu',
    'PhD Student',
  ],
  [
    'DPhil Students',
    'Alex Rutherford',
    'alexander-rutherford',
    'Alexander Rutherford',
    'PhD Student',
  ],
  ['DPhil Students', 'Ola Kalisz', 'ola-kalisz', 'Ola Kalisz', 'PhD Student'],
  [
    'DPhil Students',
    'Sebastian Towers',
    'sebastian-towers',
    'Sebastian Towers',
    'PhD Student',
  ],
  [
    "Master's Students",
    'Aramis Marti-Shahandeh',
    'aramis-marti-shahandeh',
    'Aramis Marti-Shahandeh',
    'Masters Student',
  ],
  [
    "Master's Students",
    'Samuel Simons',
    'samuel-simons',
    'Samuel Simons',
    'Masters Student',
  ],
  [
    "Master's Students",
    'Satyam Agarwal',
    'satyam-agarwal',
    'Satyam Agarwal',
    'Associate Members',
  ],
  ["Master's Students", 'Yuhe Gao', 'yuhe-gao', 'Yuhe Gao', 'Masters Student'],
  [
    "Master's Students",
    'Nathan Monette',
    'nathan-monette',
    'Nathan Monette',
    'Masters Student',
  ],
  [
    'Associate Members',
    'Elif Akata',
    'elif-akata',
    'Elif Akata',
    'Associate Members',
  ],
  [
    'Associate Members',
    'Maksymilian Wolski',
    'maksymilian-wolski',
    'Maksymilian Wolski',
    'Associate Members',
  ],
  [
    'Associate Members',
    'Tim Franzmeyer',
    'tim-franzmeyer',
    'Tim Franzmeyer',
    'Associate Members',
  ],
  ['Alumni', 'Ben Ellis', 'ben-ellis', 'Ben Ellis', 'Alumni'],
  ['Alumni', 'Chris Lu', 'chris-lu', 'Chris Lu', 'Alumni'],
  ['Alumni', 'Timon Willi', 'timon-willi', 'Timon Willi', 'Associate Members'],
  [
    'Alumni',
    'Christian Schroeder de Witt',
    'christian-schroeder-de-witt',
    'Christian Schroeder de Witt',
    'Alumni',
  ],
  ['Alumni', 'Jia Wan', 'jia-wan', 'Jia Wan', 'Alumni'],
  ['Alumni', 'Kang Li', 'kang-li', 'Kang Li', 'PhD Student'],
  [
    'Alumni',
    'Matthias Hericks',
    'matthias-hericks',
    'Matthias Hericks',
    'Alumni',
  ],
  ['Alumni', 'Noah Sarfati', 'noah-sarfati', 'Noah Sarfati', 'Alumni'],
]

export const foersterExpectedPublicLinkTypesBySlug = {
  'jakob-foerster': ['github', 'googleScholar', 'twitter', 'website'],
  'yulin-wang': ['googleScholar', 'website'],
  'dylan-cope': ['github', 'googleScholar', 'twitter', 'website'],
  'johannes-forkel': ['googleScholar'],
  'lukas-seier': ['github', 'googleScholar', 'website'],
  'shashank-reddy': ['github', 'googleScholar', 'twitter', 'website'],
  'alistair-letcher': ['github', 'googleScholar', 'twitter', 'website'],
  'theo-wolf': ['github', 'googleScholar', 'twitter', 'website'],
  'antonio-leon-villares': ['github', 'googleScholar', 'website'],
  'austin-andrews': ['github', 'googleScholar', 'twitter', 'website'],
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

export function expectedProfileAssetUrl(slug) {
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
