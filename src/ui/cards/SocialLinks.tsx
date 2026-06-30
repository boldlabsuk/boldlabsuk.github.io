import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faBluesky,
  faGithub,
  faGoogleScholar,
  faSquareLinkedin,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons'
import { faEnvelope, faHouseChimney } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { Person } from '../../content'
import { ExternalLink } from '../primitives/ExternalLink'
import { getPersonSocialLinkItems } from './socialLinkItems'

const socialLinkIcons: Record<string, IconDefinition> = {
  website: faHouseChimney,
  googleScholar: faGoogleScholar,
  twitter: faXTwitter,
  linkedin: faSquareLinkedin,
  github: faGithub,
  bluesky: faBluesky,
  email: faEnvelope,
}

export function SocialLinks({
  links,
  personName,
  compact = false,
}: {
  links?: Person['links']
  personName: string
  compact?: boolean
}) {
  const items = getPersonSocialLinkItems({ links, personName })

  if (items.length === 0) {
    return null
  }

  return (
    <div
      className={compact ? 'social-links social-links-compact' : 'social-links'}
    >
      {items.map((item) => {
        const content = compact ? (
          <SocialLinkIcon key={item.key} icon={item.key} />
        ) : (
          item.label
        )
        const title = compact ? item.label : undefined

        return item.isEmail ? (
          <a
            aria-label={item.accessibleName}
            data-social-link-key={item.key}
            href={item.href}
            key={item.key}
            title={title}
          >
            {content}
          </a>
        ) : (
          <ExternalLink
            ariaLabel={item.accessibleName}
            href={item.href}
            key={item.key}
            title={title}
          >
            <span data-social-link-key={item.key}>{content}</span>
          </ExternalLink>
        )
      })}
    </div>
  )
}

function SocialLinkIcon({ icon }: { icon: string }) {
  const iconDefinition = socialLinkIcons[icon]

  return (
    <span
      className={`social-link-icon social-link-icon-fontawesome social-link-icon-${icon}`}
      aria-hidden="true"
    >
      <FontAwesomeIcon
        icon={iconDefinition}
        aria-hidden="true"
        focusable="false"
      />
    </span>
  )
}
