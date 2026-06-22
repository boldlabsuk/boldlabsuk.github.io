import type { Person } from '../../content'
import { ExternalLink } from '../primitives/ExternalLink'
import { getPersonSocialLinkItems } from './socialLinkItems'

export function SocialLinks({
  links,
  personName,
  compact = false,
}: {
  links?: Person['links']
  personName: string
  compact?: boolean
}) {
  const items = getPersonSocialLinkItems({ links, personName, compact })

  if (items.length === 0) {
    return null
  }

  return (
    <div className={compact ? 'social-links social-links-compact' : 'social-links'}>
      {items.map((item) =>
        item.isEmail ? (
          <a
            aria-label={item.accessibleName}
            href={item.href}
            key={item.key}
          >
            {item.label}
          </a>
        ) : (
          <ExternalLink
            ariaLabel={item.accessibleName}
            href={item.href}
            key={item.key}
          >
            {item.label}
          </ExternalLink>
        ),
      )}
    </div>
  )
}
