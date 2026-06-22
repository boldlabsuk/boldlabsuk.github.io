import type { NavigationItem } from './types.ts'

export const siteMeta = {
  name: 'BOLD Institute',
  shortName: 'BOLD',
  expandedName: 'British Open-Ended Learning & Discovery Institute',
  description:
    'A unified AI research institute in England bringing together three university AI labs.',
  missionPhrase: 'Research. Build. Transform.',
  mission:
    'Building the next generation of AI research through world-class collaboration across leading university labs.',
  identity:
    'Our institute brings together three leading university AI labs into a single collaborative research environment. We combine academic depth, engineering excellence, and long-term scientific ambition.',
  statement:
    'We bring together researchers across universities to build a unified AI research institution with the scale, ambition, and depth needed for the next generation of AI.',
  contactEmail: 'contact@example.ac.uk',
  copyrightYear: '2026',
  socialLinks: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com' },
    { label: 'GitHub', href: 'https://github.com' },
    { label: 'X', href: 'https://x.com' },
  ],
}

export const navigation: NavigationItem[] = [
  { label: 'Our People', href: '/people' },
  { label: 'News', href: '/news' },
  { label: 'Papers', href: '/papers' },
  { label: 'Opportunities', href: '/opportunities' },
]
