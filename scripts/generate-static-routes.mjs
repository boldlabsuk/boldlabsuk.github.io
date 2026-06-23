import { copyFile, mkdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { opportunityRoutes } from '../src/content.ts'

export const staticAppRoutes = [
  '/people',
  '/opportunities',
  ...opportunityRoutes.map((route) => `/opportunities/${route.slug}`),
]

const defaultPeopleSourcePath = new URL('../our_people.json', import.meta.url)

export function getWebsiteRosterRoutes(sourcePeople) {
  return sourcePeople
    .filter(isWebsiteRosterSourcePerson)
    .map((person) => `/people/${slugify(person.name)}`)
}

export async function generateStaticRouteEntries({
  distDir = 'dist',
  sourcePeople,
  sourcePeoplePath = defaultPeopleSourcePath,
  routes,
} = {}) {
  const indexPath = join(distDir, 'index.html')
  const allRoutes = routes ?? [
    ...staticAppRoutes,
    ...getWebsiteRosterRoutes(
      sourcePeople ?? JSON.parse(await readFile(sourcePeoplePath, 'utf8')),
    ),
  ]

  await copyFile(indexPath, join(distDir, '404.html'))

  for (const route of allRoutes) {
    const targetDir = join(distDir, route.replace(/^\/+|\/+$/g, ''))
    await mkdir(targetDir, { recursive: true })
    await copyFile(indexPath, join(targetDir, 'index.html'))
  }

  return { fallbackPath: join(distDir, '404.html'), routes: allRoutes }
}

function isWebsiteRosterSourcePerson(sourcePerson) {
  return (
    sourcePerson.source?.trim().toLowerCase() === 'main' &&
    Boolean(sourcePerson.name?.trim()) &&
    Boolean(sourcePerson.role?.trim()) &&
    Boolean(sourcePerson.profilePicture?.trim()) &&
    sourcePerson.listOnBoldWebsite?.trim().toLowerCase() !== 'no'
  )
}

function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const currentFilePath = fileURLToPath(import.meta.url)
const invokedFilePath = process.argv[1] ? fileURLToPath(pathToFileURL(process.argv[1])) : ''

if (currentFilePath === invokedFilePath) {
  const { routes } = await generateStaticRouteEntries({
    distDir: process.argv[2] ?? 'dist',
  })

  console.log(`Generated static entries for ${routes.length} routes.`)
}
