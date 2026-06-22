import {
  BriefcaseBusiness,
  Cloud,
  Code2,
  ExternalLink as ExternalLinkIcon,
  Globe,
  GraduationCap,
  Mail,
  X,
  type LucideIcon,
} from 'lucide-react'
import type { Person } from '../../content'
import { ExternalLink } from '../primitives/ExternalLink'
import { getPersonSocialLinkItems } from './socialLinkItems'

const socialLinkIcons: Record<string, LucideIcon> = {
  website: Globe,
  googleScholar: GraduationCap,
  github: Code2,
  linkedin: BriefcaseBusiness,
  twitter: X,
  bluesky: Cloud,
  email: Mail,
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
    <div className={compact ? 'social-links social-links-compact' : 'social-links'}>
      {items.map((item) => {
        const content = compact ? (
          <SocialLinkIcon icon={item.key} />
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
  const Icon = socialLinkIcons[icon] ?? ExternalLinkIcon

  return (
    <span className={`social-link-icon social-link-icon-${icon}`} aria-hidden="true">
      <Icon aria-hidden="true" focusable="false" />
    </span>
  )
}
