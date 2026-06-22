import type { Person } from '../../content'

type PersonSocialLinkKey = keyof NonNullable<Person['links']>

const labels: Record<PersonSocialLinkKey, string> = {
  website: 'Website',
  googleScholar: 'Google Scholar',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  twitter: 'X',
  email: 'Email',
}

const compactLabels: Record<PersonSocialLinkKey, string> = {
  website: 'Site',
  googleScholar: 'Scholar',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  twitter: 'X',
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
  compact = false,
}: {
  links?: Person['links']
  personName: string
  compact?: boolean
}): PersonSocialLinkItem[] {
  if (!links) {
    return []
  }

  return Object.entries(links)
    .filter((entry): entry is [PersonSocialLinkKey, string] =>
      Boolean(entry[1]?.trim()),
    )
    .map(([key, href]) => ({
      key,
      href,
      label: compact ? compactLabels[key] : labels[key],
      accessibleName: `${labels[key]} for ${personName}`,
      isEmail: href.startsWith('mailto:'),
    }))
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
