import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'

test('Site Footer renders the landing page brand logo without a link', () => {
  const result = spawnSync(
    './node_modules/.bin/tsx',
    ['--tsconfig', 'tsconfig.app.json', 'tests/site-footer-render-case.tsx'],
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
