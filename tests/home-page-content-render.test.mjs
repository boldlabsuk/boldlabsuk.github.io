import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

test('Home Page renders the complete supervisor brief in order', () => {
  const result = spawnSync(
    './node_modules/.bin/tsx',
    [
      '--tsconfig',
      'tsconfig.app.json',
      '--import',
      './tests/static-asset-loader.mjs',
      'tests/home-page-content-render-case.tsx',
    ],
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
