import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { generateStaticRouteEntries } from '../scripts/generate-static-routes.mjs'

test('static route generation creates deployable SPA entry files', async () => {
  const distDir = await mkdtemp(join(tmpdir(), 'bold-static-routes-'))
  const indexHtml = '<!doctype html><div id="root"></div>'
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

  assert.deepEqual(routes, ['/people', '/opportunities', '/people/ada-lovelace'])
  assert.equal(await readFile(join(distDir, '404.html'), 'utf8'), indexHtml)
  assert.equal(await readFile(join(distDir, 'people/index.html'), 'utf8'), indexHtml)
  assert.equal(
    await readFile(join(distDir, 'opportunities/index.html'), 'utf8'),
    indexHtml,
  )
  assert.equal(
    await readFile(join(distDir, 'people/ada-lovelace/index.html'), 'utf8'),
    indexHtml,
  )

  await assert.rejects(
    stat(join(distDir, 'people/hidden-person/index.html')),
    /ENOENT/,
  )
})
