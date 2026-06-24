import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { generateStaticRouteEntries } from '../scripts/generate-static-routes.mjs'

test('static route generation creates deployable SPA entry files', async () => {
  const distDir = await mkdtemp(join(tmpdir(), 'bold-static-routes-'))
  const indexHtml = '<!doctype html><html><head></head><body><div id="root"></div></body></html>'
  await import('node:fs/promises').then(({ writeFile }) =>
    writeFile(join(distDir, 'index.html'), indexHtml),
  )

  const { routes } = await generateStaticRouteEntries({
    distDir,
    sourcePeople: [
      {
        source: 'main',
        name: 'Ada Lovelace',
        role: 'PhD student',
        profilePicture: 'ada.jpg',
        listOnBoldWebsite: '',
      },
      {
        source: 'main',
        name: 'Jakob Foerster',
        role: 'Faculty',
        profilePicture: 'jakob.jpg',
        listOnBoldWebsite: '',
      },
      {
        source: 'main',
        name: 'Hidden Person',
        role: 'PhD student',
        profilePicture: 'hidden.jpg',
        listOnBoldWebsite: 'No',
      },
      {
        source: 'slack',
        name: 'Slack Only',
        role: 'Visitor',
        profilePicture: 'slack.jpg',
        listOnBoldWebsite: '',
      },
    ],
  })

  assert.deepEqual(routes, [
    '/people',
    '/opportunities',
    '/people/ada-lovelace',
    '/people/jakob-foerster',
  ])
  assert.equal(await readFile(join(distDir, '404.html'), 'utf8'), indexHtml)
  const peopleIndexHtml = await readFile(join(distDir, 'people/index.html'), 'utf8')

  assert.match(
    peopleIndexHtml,
    /<link\s+rel="preload"\s+as="image"\s+href="\/profile-assets\/ada-lovelace\.webp"\s+type="image\/webp"\s+fetchpriority="low"\s*\/>/,
  )
  assert.match(
    peopleIndexHtml,
    /<link\s+rel="preload"\s+as="image"\s+href="\/profile-assets\/jakob-foerster-new\.png"\s+type="image\/png"\s+fetchpriority="low"\s*\/>/,
  )
  assert.doesNotMatch(peopleIndexHtml, /hidden-person/)
  assert.doesNotMatch(peopleIndexHtml, /fetchpriority="high"/)
  assert.equal(
    peopleIndexHtml.match(/\/profile-assets\//g)?.length,
    2,
  )
  assert.equal(
    await readFile(join(distDir, 'opportunities/index.html'), 'utf8'),
    indexHtml,
  )
  assert.equal(
    await readFile(join(distDir, 'people/ada-lovelace/index.html'), 'utf8'),
    indexHtml,
  )

  await assert.rejects(
    stat(join(distDir, 'opportunities/phd-students/index.html')),
    /ENOENT/,
  )
  await assert.rejects(
    stat(join(distDir, 'people/hidden-person/index.html')),
    /ENOENT/,
  )
})
