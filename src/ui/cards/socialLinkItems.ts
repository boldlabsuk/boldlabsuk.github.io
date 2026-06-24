import type { Person } from '../../content'

type PersonSocialLinkKey = keyof NonNullable<Person['links']>

export const personSocialLinkOrder: readonly PersonSocialLinkKey[] = [
  'website',
  'googleScholar',
  'twitter',
  'linkedin',
  'github',
  'bluesky',
  'email',
]

const hiddenSocialLinkKeys = new Set<PersonSocialLinkKey>(['email'])

const labels: Record<PersonSocialLinkKey, string> = {
  website: 'Website',
  googleScholar: 'Google Scholar',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  twitter: 'X',
  bluesky: 'Bluesky',
  email: 'Email',
}

export type PersonSocialLinkItem = {
  key: string
  href: string
  label: string
  accessibleName: string
  isEmail: boolean
}

export function getPersonSocialLinkItems({
  links,
  personName,
}: {
  links?: Person['links']
  personName: string
}): PersonSocialLinkItem[] {
  if (!links) {
    return []
  }

  return personSocialLinkOrder.flatMap((key) => {
    const href = links[key]

    if (!href?.trim() || hiddenSocialLinkKeys.has(key)) {
      return []
    }

    return [{
      key,
      href,
      label: labels[key],
      accessibleName: `${labels[key]} for ${personName}`,
      isEmail: href.startsWith('mailto:'),
    }]
  })
}

export function getPersonPrimaryLinkName({
  personName,
  primaryPersonLink,
}: {
  personName: string
  primaryPersonLink: string | null
}) {
  if (!primaryPersonLink) {
    return null
  }

  return `Visit ${personName} primary profile`
}
