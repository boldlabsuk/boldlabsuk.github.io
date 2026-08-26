import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('Research Pillar lead links change colour and show a pointer', async () => {
  const homeStyles = await readFile('src/styles/home.css', 'utf8')
  const restingRule = homeStyles.match(
    /\.pillar-lead-link\s*\{(?<declarations>[^}]*)\}/,
  )

  assert.ok(restingRule?.groups)
  assert.match(restingRule.groups.declarations, /color:\s*inherit;/)
  assert.match(restingRule.groups.declarations, /cursor:\s*pointer;/)
  assert.match(restingRule.groups.declarations, /transition:\s*none;/)

  const interactiveRule = homeStyles.match(
    /\.pillar-lead-link:hover,\s*\.pillar-lead-link:focus-visible\s*\{(?<declarations>[^}]*)\}/,
  )

  assert.ok(interactiveRule?.groups)
  assert.match(interactiveRule.groups.declarations, /color:\s*#026aa7;/)
})
