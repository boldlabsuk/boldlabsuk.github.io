import type { ReactNode } from 'react'
import { isExternalUrl } from '../../lib/url'

export function ExternalLink({
  href,
  children,
  ariaLabel,
}: {
  href: string
  children: ReactNode
  ariaLabel?: string
}) {
  return (
    <a
      aria-label={ariaLabel}
      href={href}
      rel="noreferrer"
      target={isExternalUrl(href) ? '_blank' : undefined}
    >
      {children}
    </a>
  )
}
