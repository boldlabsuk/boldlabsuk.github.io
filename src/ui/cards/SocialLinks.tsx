import {
  ExternalLink as ExternalLinkIcon,
  Globe,
  Mail,
  type LucideIcon,
} from 'lucide-react'
import type { ReactElement } from 'react'
import type { Person } from '../../content'
import { ExternalLink } from '../primitives/ExternalLink'
import { getPersonSocialLinkItems } from './socialLinkItems'

const utilitySocialLinkIcons: Record<string, LucideIcon> = {
  website: Globe,
  email: Mail,
}

const brandSocialLinkIcons: Record<string, () => ReactElement> = {
  googleScholar: GoogleScholarLogo,
  github: GitHubLogo,
  linkedin: LinkedInLogo,
  twitter: XLogo,
  bluesky: BlueskyLogo,
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
  const BrandIcon = brandSocialLinkIcons[icon]

  if (BrandIcon) {
    return (
      <span
        className={`social-link-icon social-link-icon-brand social-link-icon-${icon}`}
        aria-hidden="true"
      >
        <BrandIcon />
      </span>
    )
  }

  const Icon = utilitySocialLinkIcons[icon] ?? ExternalLinkIcon

  return (
    <span
      className={`social-link-icon social-link-icon-lucide social-link-icon-${icon}`}
      aria-hidden="true"
    >
      <Icon aria-hidden="true" focusable="false" />
    </span>
  )
}

function GoogleScholarLogo() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14m0-24L0 9.5l4.838 3.94A8 8 0 0 1 12 9a8 8 0 0 1 7.162 4.44L24 9.5z" />
    </svg>
  )
}

function GitHubLogo() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

function LinkedInLogo() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065m1.782 13.019H3.555V9h3.564zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" />
    </svg>
  )
}

function XLogo() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zm-1.291 19.49h2.039L6.486 3.24H4.298z" />
    </svg>
  )
}

function BlueskyLogo() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 64 57">
      <path d="M13.873 3.805C21.21 9.332 29.103 20.537 32 26.55v15.882c0-.338-.13.044-.41.867-1.512 4.456-7.418 21.847-20.923 7.944-7.111-7.32-3.819-14.64 9.125-16.85-7.405 1.264-15.73-.825-18.014-9.015C1.12 23.022 0 8.51 0 6.55 0-3.268 8.579-.182 13.873 3.805m36.254 0C42.79 9.332 34.897 20.537 32 26.55v15.882c0-.338.13.044.41.867 1.512 4.456 7.418 21.847 20.923 7.944 7.111-7.32 3.819-14.64-9.125-16.85 7.405 1.264 15.73-.825 18.014-9.015C62.88 23.022 64 8.51 64 6.55c0-9.818-8.578-6.732-13.873-2.745" />
    </svg>
  )
}
