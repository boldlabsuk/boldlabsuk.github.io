import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const staticAppRoutes = [
  '/people',
  '/opportunities',
]

const defaultPeopleSourcePath = new URL('../our_people.json', import.meta.url)
const profileAssetOverrides = {
  'ani-calinescu': '/profile-assets/ani-calinescu-new.jpg',
  'antoine-cully': '/profile-assets/Antoine-Cully-new.png',
  'jakob-foerster': '/profile-assets/jakob-foerster-new.png',
  'ravi-hammond': '/profile-assets/ravi-hammond.png',
  'shimon-whiteson': '/profile-assets/shimon-whiteson-new.jpg',
}

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
  const resolvedSourcePeople =
    sourcePeople ?? JSON.parse(await readFile(sourcePeoplePath, 'utf8'))
  const allRoutes = routes ?? [
    ...staticAppRoutes,
    ...getWebsiteRosterRoutes(resolvedSourcePeople),
  ]
  const indexHtml = await readFile(indexPath, 'utf8')
  const peopleRouteProfileImageHrefs =
    getPeopleRouteProfileImageHrefs(resolvedSourcePeople)

  await copyFile(indexPath, join(distDir, '404.html'))

  for (const route of allRoutes) {
    const targetDir = join(distDir, route.replace(/^\/+|\/+$/g, ''))
    await mkdir(targetDir, { recursive: true })
    await writeFile(
      join(targetDir, 'index.html'),
      getStaticRouteHtml({
        indexHtml,
        peopleRouteProfileImageHrefs,
        route,
      }),
    )
  }

  return { fallbackPath: join(distDir, '404.html'), routes: allRoutes }
}

function getStaticRouteHtml({
  indexHtml,
  peopleRouteProfileImageHrefs,
  route,
}) {
  if (route.replace(/\/+$/g, '') !== '/people') {
    return indexHtml
  }

  return injectImagePreloads(indexHtml, peopleRouteProfileImageHrefs)
}

function getPeopleRouteProfileImageHrefs(sourcePeople) {
  return unique(
    sourcePeople
      .filter(isPeopleDirectorySourcePerson)
      .map((person) => buildProfileAssetUrl(slugify(person.name))),
  )
}

function buildProfileAssetUrl(personSlug) {
  return profileAssetOverrides[personSlug] ?? `/profile-assets/${personSlug}.webp`
}

function injectImagePreloads(indexHtml, imageHrefs) {
  if (imageHrefs.length === 0) {
    return indexHtml
  }

  const preloadLinks = imageHrefs.map(createImagePreloadLink).join('\n')

  if (!indexHtml.includes('</head>')) {
    return `${preloadLinks}\n${indexHtml}`
  }

  return indexHtml.replace('</head>', `${preloadLinks}\n</head>`)
}

function createImagePreloadLink(href) {
  return `<link rel="preload" as="image" href="${href}" type="${getImageMimeType(href)}" fetchpriority="low" />`
}

function getImageMimeType(href) {
  const extension = href.split('.').pop()?.toLowerCase()

  if (extension === 'jpg' || extension === 'jpeg') {
    return 'image/jpeg'
  }

  if (extension === 'png') {
    return 'image/png'
  }

  if (extension === 'svg') {
    return 'image/svg+xml'
  }

  return 'image/webp'
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

function isPeopleDirectorySourcePerson(sourcePerson) {
  return isWebsiteRosterSourcePerson(sourcePerson) && sourcePerson.alumni !== true
}

function unique(values) {
  return [...new Set(values)]
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
