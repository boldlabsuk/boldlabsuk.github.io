import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'

test('People Page initial render hides active filters and reset controls', () => {
  const result = spawnSync(
    'node',
    [
      '--import',
      'tsx',
      '--import',
      './tests/static-asset-loader.mjs',
      'tests/people-page-render-case.tsx',
    ],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        TSX_TSCONFIG_PATH: 'tsconfig.app.json',
      },
    },
  )

  assert.equal(
    result.status,
    0,
    `${result.stdout.trim()}\n${result.stderr.trim()}`.trim(),
  )
})
