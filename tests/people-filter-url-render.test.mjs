import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

test('copied People Directory URL restores the visible filters and results', () => {
  const result = spawnSync(
    'node',
    [
      '--import',
      'tsx',
      '--import',
      './tests/static-asset-loader.mjs',
      'tests/people-filter-url-render-case.tsx',
      'initial-url',
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

test('selecting a People Directory filter updates the shareable URL', () => {
  const result = spawnSync(
    'node',
    [
      '--import',
      'tsx',
      '--import',
      './tests/static-asset-loader.mjs',
      'tests/people-filter-url-render-case.tsx',
      'select-filter',
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

test('submitting a People Directory name search updates the shareable URL', () => {
  const result = spawnSync(
    'node',
    [
      '--import',
      'tsx',
      '--import',
      './tests/static-asset-loader.mjs',
      'tests/people-filter-url-render-case.tsx',
      'name-search',
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

test('People Section, supervisor, research area, and affiliation share one URL', () => {
  const result = spawnSync(
    'node',
    [
      '--import',
      'tsx',
      '--import',
      './tests/static-asset-loader.mjs',
      'tests/people-filter-url-render-case.tsx',
      'combined-select-filters',
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

test('clearing one People Directory filter preserves the other URL filters', () => {
  const result = spawnSync(
    'node',
    [
      '--import',
      'tsx',
      '--import',
      './tests/static-asset-loader.mjs',
      'tests/people-filter-url-render-case.tsx',
      'clear-filter',
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

test('Back and Forward restore People Directory filters from session history', () => {
  const result = spawnSync(
    'node',
    [
      '--import',
      'tsx',
      '--import',
      './tests/static-asset-loader.mjs',
      'tests/people-filter-url-render-case.tsx',
      'history-navigation',
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
