import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

const scenarios = [
  [
    'opportunities-index-render-case.tsx',
    'Opportunities Index offers a simple invitation and five accessible interest choices',
  ],
  [
    'opportunities-interaction-case.tsx',
    'Opportunity selection replaces the shared form and cleans up Tally resize listeners',
  ],
]

for (const [filename, title] of scenarios) {
  test(title, () => {
    const result = spawnSync(
      './node_modules/.bin/tsx',
      ['--tsconfig', 'tsconfig.app.json', `tests/${filename}`],
      { cwd: process.cwd(), encoding: 'utf8' },
    )
    assert.equal(
      result.status,
      0,
      `${result.stdout.trim()}\n${result.stderr.trim()}`.trim(),
    )
  })
}
