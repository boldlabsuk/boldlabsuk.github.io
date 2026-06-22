import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'

test('Social links render text labels by default and icon-only compact links', () => {
  const result = spawnSync(
    './node_modules/.bin/tsx',
    ['--tsconfig', 'tsconfig.app.json', 'tests/social-links-render-case.tsx'],
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
