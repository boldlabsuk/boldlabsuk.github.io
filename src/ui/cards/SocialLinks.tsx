import type { Person } from '../../content'
import { ExternalLink } from '../primitives/ExternalLink'

export function SocialLinks({
  links,
  compact = false,
}: {
  links?: Person['links']
  compact?: boolean
}) {
  if (!links) {
    return null
  }

  const labels: Record<keyof NonNullable<Person['links']>, string> = {
    website: 'Site',
    googleScholar: 'Scholar',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    twitter: 'X',
    email: 'Email',
  }

  const entries = Object.entries(links).filter((entry): entry is [string, string] =>
    Boolean(entry[1]),
  )

  if (entries.length === 0) {
    return null
  }

  return (
    <div className={compact ? 'social-links social-links-compact' : 'social-links'}>
      {entries.map(([key, href]) =>
        href.startsWith('mailto:') ? (
          <a
            aria-label={`${labels[key as keyof typeof labels]} for profile`}
            href={href}
            key={key}
          >
            {labels[key as keyof typeof labels]}
          </a>
        ) : (
          <ExternalLink
            ariaLabel={`${labels[key as keyof typeof labels]} for profile`}
            href={href}
            key={key}
          >
            {labels[key as keyof typeof labels]}
          </ExternalLink>
        ),
      )}
    </div>
  )
}
