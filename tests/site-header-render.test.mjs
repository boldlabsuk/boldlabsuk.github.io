import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

test('Site Header hides the home brand slot and uses the full logo when shown', () => {
  const result = spawnSync(
    './node_modules/.bin/tsx',
    ['--tsconfig', 'tsconfig.app.json', 'tests/site-header-render-case.tsx'],
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
