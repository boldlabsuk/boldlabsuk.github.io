import test from 'node:test'
import assert from 'node:assert/strict'

import {
  blogPosts,
  navigation,
  people,
  publications,
  researchPillars,
  siteMeta,
} from '../src/content.ts'

test('BOLD presents a static AI lab website with the required sections', () => {
  assert.equal(siteMeta.name, 'BOLD')
  assert.match(siteMeta.expandedName, /British Open-Ended Learning & Discovery/)

  assert.deepEqual(
    navigation.map((item) => item.label),
    ['Research', 'People', 'Blog', 'Publications'],
  )

  assert.ok(researchPillars.length >= 3)
  assert.ok(people.length >= 4)
  assert.ok(blogPosts.length >= 3)
  assert.ok(publications.length >= 5)
  assert.ok(blogPosts.every((post) => /^\d{4}-\d{2}-\d{2}$/.test(post.isoDate)))
})
