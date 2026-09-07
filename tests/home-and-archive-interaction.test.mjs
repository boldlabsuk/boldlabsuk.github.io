import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

test('home shell interactions and dormant archive filters preserve their behavior', () => {
  const result = spawnSync(
    './node_modules/.bin/tsx',
    [
      '--tsconfig',
      'tsconfig.app.json',
      '--import',
      './tests/static-asset-loader.mjs',
      'tests/home-and-archive-interaction-case.tsx',
    ],
    { cwd: process.cwd(), encoding: 'utf8' },
  )

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`.trim())
})
