import ourPeople from './our_people.json' with { type: 'json' }
import type { Person } from './types.ts'

export type SourcePerson = {
  source: string
  name: string
  role: string
  homeInstitution?: string
  researchInterestKeywords: string[] | string
  profilePicture?: string
  listOnBoldWebsite?: string
}

export function buildWebsiteRoster(sourcePeople: SourcePerson[]): Person[] {
  return sourcePeople
    .filter(isWebsiteRosterSourcePerson)
    .map((sourcePerson) => {
      const name = sourcePerson.name.trim()
      const role = sourcePerson.role.trim()
      const affiliation = sourcePerson.homeInstitution?.trim()
      const slug = slugify(name)

      return {
        slug,
        name,
        role,
        group: role,
        affiliation: affiliation || undefined,
        bio: '',
        image: buildProfileAssetUrl(slug),
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

function normalizeResearchAreas(researchInterestKeywords: string[] | string) {
  const keywords = Array.isArray(researchInterestKeywords)
    ? researchInterestKeywords
    : researchInterestKeywords.split(/[;,]/)

  return keywords
    .map((keyword) => keyword.trim())
    .filter((keyword): keyword is string => Boolean(keyword))
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
