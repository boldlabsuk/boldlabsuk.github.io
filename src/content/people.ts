import ourPeople from '../../our_people.json' with { type: 'json' }
import type { Person, PersonLinkSet } from './types.ts'

export type SourcePerson = {
  source: string
  name: string
  role: string
  homeInstitution?: string
  researchInterestKeywords: string[] | string
  profilePicture?: string
  listOnBoldWebsite?: string
  socialLinks?: string
  'social-links'?: string
}

export function buildWebsiteRoster(sourcePeople: SourcePerson[]): Person[] {
  return sourcePeople
    .filter(isWebsiteRosterSourcePerson)
    .map((sourcePerson) => {
      const name = sourcePerson.name.trim()
      const role = sourcePerson.role.trim()
      const affiliation = normalizeAffiliation(sourcePerson.homeInstitution)
      const slug = slugify(name)

      return {
        slug,
        name,
        role,
        group: role,
        affiliation: affiliation || undefined,
        bio: '',
        image: buildProfileAssetUrl(slug),
        links: parsePublicPersonLinks(
          sourcePerson.socialLinks ?? sourcePerson['social-links'],
        ),
        researchAreas: normalizeResearchAreas(
          sourcePerson.researchInterestKeywords,
        ),
      }
    })
}

function isWebsiteRosterSourcePerson(sourcePerson: SourcePerson) {
  return (
    sourcePerson.source.trim().toLowerCase() === 'main' &&
    Boolean(sourcePerson.name.trim()) &&
    Boolean(sourcePerson.role.trim()) &&
    Boolean(sourcePerson.profilePicture?.trim()) &&
    sourcePerson.listOnBoldWebsite?.trim().toLowerCase() !== 'no'
  )
}

function normalizeAffiliation(homeInstitution?: string) {
  const affiliation = homeInstitution?.trim()

  if (!affiliation) {
    return undefined
  }

  const expandedAffiliations: Record<string, string> = {
    Oxford: 'University of Oxford',
    Imperial: 'Imperial College London',
    UCL: 'University College London',
  }

  return expandedAffiliations[affiliation] ?? affiliation
}

function normalizeResearchAreas(researchInterestKeywords: string[] | string) {
  const keywords = Array.isArray(researchInterestKeywords)
    ? researchInterestKeywords
    : researchInterestKeywords.split(/[;,]/)

  return keywords
    .map((keyword) => keyword.trim())
    .filter((keyword): keyword is string => Boolean(keyword))
}

function parsePublicPersonLinks(sourceLinks?: string) {
  if (!sourceLinks?.trim()) {
    return undefined
  }

  const links: PersonLinkSet = {}

  for (const value of sourceLinks.split(/[\n;,|]+|\s+(?=https?:\/\/|www\.|@)/i)) {
    const link = normalizePublicPersonLink(value)

    if (link && !links[link.key]) {
      links[link.key] = link.href
    }
  }

  return Object.keys(links).length > 0 ? links : undefined
}

function normalizePublicPersonLink(value: string) {
  const trimmedValue = cleanPublicLinkValue(value)

  if (!trimmedValue || isPlaceholderLinkValue(trimmedValue)) {
    return undefined
  }

  const handle = trimmedValue.match(/^@([A-Za-z0-9_]{1,15})$/)

  if (handle) {
    return {
      key: 'twitter' as const,
      href: `https://x.com/${handle[1]}`,
    }
  }

  const href = normalizePublicUrl(trimmedValue)

  if (!href) {
    return undefined
  }

  const hostname = new URL(href).hostname.toLowerCase().replace(/^www\./, '')

  if (/^scholar\.google\./.test(hostname)) {
    return { key: 'googleScholar' as const, href }
  }

  if (isHostnameOrSubdomain(hostname, 'github.com')) {
    return { key: 'github' as const, href }
  }

  if (isHostnameOrSubdomain(hostname, 'linkedin.com')) {
    return { key: 'linkedin' as const, href }
  }

  if (
    isHostnameOrSubdomain(hostname, 'x.com') ||
    isHostnameOrSubdomain(hostname, 'twitter.com')
  ) {
    return { key: 'twitter' as const, href }
  }

  if (isHostnameOrSubdomain(hostname, 'bsky.app')) {
    return { key: 'bluesky' as const, href }
  }

  return { key: 'website' as const, href }
}

function isPlaceholderLinkValue(value: string) {
  return /^(?:n\s*\/\s*a|na|none|null|nil|-|--|no|nope|placeholder)$/i.test(
    value,
  )
}

function cleanPublicLinkValue(value: string) {
  return value
    .trim()
    .replace(
      /^(?:website|site|x|twitter|scholar|google scholar|linkedin|github)\s*:\s*/i,
      '',
    )
    .replace(
      /\s+\((?:website|site|x|twitter|scholar|google scholar|linkedin|github)\)\s*$/i,
      '',
    )
    .trim()
}

function normalizePublicUrl(value: string) {
  if (isEmailLikeValue(value) || value.toLowerCase().startsWith('mailto:')) {
    return undefined
  }

  const maybeUrl = /^https?:\/\//i.test(value) ? value : `https://${value}`

  try {
    const url = new URL(maybeUrl)

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return undefined
    }

    if (!isDomainLikeHostname(url.hostname)) {
      return undefined
    }

    return url.toString().replace(/\/$/, '')
  } catch {
    return undefined
  }
}

function isEmailLikeValue(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isDomainLikeHostname(hostname: string) {
  return hostname.includes('.') && !hostname.startsWith('.') && !hostname.endsWith('.')
}

function isHostnameOrSubdomain(hostname: string, domain: string) {
  return hostname === domain || hostname.endsWith(`.${domain}`)
}

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function buildProfileAssetUrl(personSlug: string) {
  return `/profile-assets/${personSlug}.webp`
}

export const people = buildWebsiteRoster(ourPeople)

export const roleOrder = [
  'Principal Investigator',
  'Postdoc',
  'PhD Student',
  'Masters Student',
  'Associate Members',
  'Alumni',
]
