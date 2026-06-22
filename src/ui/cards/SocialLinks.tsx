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
            <SocialLinkIcon icon={item.key} />
          </a>
        ) : (
          <ExternalLink
            ariaLabel={item.accessibleName}
            href={item.href}
            key={item.key}
          >
            <SocialLinkIcon icon={item.key} />
          </ExternalLink>
        ),
      )}
    </div>
  )
}

function SocialLinkIcon({ icon }: { icon: string }) {
  return (
    <span className={`social-link-icon social-link-icon-${icon}`} aria-hidden="true">
      {getSocialLinkIcon(icon)}
    </span>
  )
}

function getSocialLinkIcon(icon: string) {
  switch (icon) {
    case 'website':
      return (
        <svg viewBox="0 0 24 24" focusable="false">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.5 12h17" />
          <path d="M12 3.5c2.2 2.3 3.3 5.1 3.3 8.5s-1.1 6.2-3.3 8.5" />
          <path d="M12 3.5C9.8 5.8 8.7 8.6 8.7 12s1.1 6.2 3.3 8.5" />
        </svg>
      )
    case 'googleScholar':
      return (
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M4 10.2 12 5l8 5.2-8 5.2-8-5.2Z" />
          <path d="M7.5 13v4c1.2 1.1 2.7 1.7 4.5 1.7s3.3-.6 4.5-1.7v-4" />
        </svg>
      )
    case 'github':
      return (
        <svg viewBox="0 0 24 24" focusable="false">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M8.2 15.6c1.1 1 2.4 1.4 3.8 1.4 3.1 0 5-2.1 5-5 0-1.1-.3-2.1-.9-2.9.1-.8 0-1.5-.2-2.1-.8.1-1.5.4-2.2.9a8 8 0 0 0-3.4 0C9.6 7.4 8.9 7.1 8.1 7c-.2.6-.3 1.3-.2 2.1A4.8 4.8 0 0 0 7 12c0 1.2.4 2.4 1.2 3.6Z" />
          <path d="M9.5 19v-2.2" />
          <path d="M14.5 19v-2.2" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" focusable="false">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M8 11v5.5" />
          <path d="M8 7.7v.1" />
          <path d="M12 16.5v-3.2c0-1.4.9-2.4 2.2-2.4 1.2 0 1.8.8 1.8 2.4v3.2" />
          <path d="M12 11v5.5" />
        </svg>
      )
    case 'twitter':
      return (
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="m6 5 12 14" />
          <path d="M18 5 6 19" />
        </svg>
      )
    case 'bluesky':
      return (
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M12 13.8c-1.4-3.1-3.5-5.4-6.4-6.9-1.1 2.8-.2 5.4 2.5 7.7-1.9.3-3.2 1.2-3.9 2.7 2.7 1.7 5.3 1.1 7.8-1.9 2.5 3 5.1 3.6 7.8 1.9-.7-1.5-2-2.4-3.9-2.7 2.7-2.3 3.6-4.9 2.5-7.7-2.9 1.5-5 3.8-6.4 6.9Z" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M10 13a5 5 0 0 0 7.1 0l1.4-1.4a5 5 0 0 0-7.1-7.1L10.5 5" />
          <path d="M14 11a5 5 0 0 0-7.1 0l-1.4 1.4a5 5 0 0 0 7.1 7.1l.9-.9" />
        </svg>
      )
  }
}
