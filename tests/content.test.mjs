import test from 'node:test'
import assert from 'node:assert/strict'

import {
  involvementRoutes,
  navigation,
  newsPosts,
  opportunities,
  papers,
  people,
  siteMeta,
} from '../src/content.ts'
import { parseRoute } from '../src/routing/routes.ts'

test('BOLD presents the v2 institute information architecture', () => {
  assert.equal(siteMeta.name, 'BOLD Institute')
  assert.match(siteMeta.description, /three university AI labs/)

  assert.deepEqual(
    navigation.map((item) => item.label),
    ['Our People', 'Opportunities'],
  )

  assert.deepEqual(
    navigation.map((item) => item.href),
    ['/people', '/opportunities'],
  )
})

test('structured content supports people, news, papers, and opportunities', () => {
  assert.ok(people.length >= 10)
  assert.ok(newsPosts.length >= 6)
  assert.ok(papers.length >= 7)
  assert.ok(involvementRoutes.length === 6)
  assert.ok(opportunities.length >= 1)

  assert.ok(people.every((person) => person.slug && person.researchAreas.length))
  assert.ok(newsPosts.every((post) => /^\d{4}-\d{2}-\d{2}$/.test(post.date)))
  assert.ok(papers.every((paper) => paper.id && paper.links))
  assert.ok(involvementRoutes.every((route) => route.href.includes(`#${route.id}`)))
})

test('launch routes exclude news and papers while content remains available', () => {
  assert.deepEqual(parseRoute('/news'), { name: 'not-found' })
  assert.deepEqual(parseRoute('/news/bold-institute-launch'), {
    name: 'not-found',
  })
  assert.deepEqual(parseRoute('/papers'), { name: 'not-found' })
})
