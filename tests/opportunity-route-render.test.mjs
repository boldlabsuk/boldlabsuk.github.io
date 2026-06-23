import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'

test('Opportunity Route Page renders foundation content and form-coming-soon state', () => {
  const result = spawnSync(
    './node_modules/.bin/tsx',
    ['--tsconfig', 'tsconfig.app.json', 'tests/opportunity-route-render-case.tsx'],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
    },
  )

  assert.equal(
    result.status,
    0,
    `${result.stdout.trim()}\n${result.stderr.trim()}`.trim(),
  )
})

test('Opportunities Index exposes route links with meaningful accessible names', () => {
  const result = spawnSync(
    './node_modules/.bin/tsx',
    ['--tsconfig', 'tsconfig.app.json', 'tests/opportunities-index-render-case.tsx'],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
    },
  )

  assert.equal(
    result.status,
    0,
    `${result.stdout.trim()}\n${result.stderr.trim()}`.trim(),
  )
})
