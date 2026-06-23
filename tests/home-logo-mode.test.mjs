import test from 'node:test'
import assert from 'node:assert/strict'

import { resolveHomeLogoMode } from '../src/features/home/homeLogoMode.ts'

test('home logo mode defaults to scroll animation when the flag is unset', () => {
  assert.equal(resolveHomeLogoMode(undefined), 'scroll-animation')
})

test('home logo mode uses legacy reveal when the flag is false', () => {
  assert.equal(resolveHomeLogoMode('false'), 'legacy-reveal')
})

test('home logo mode keeps scroll animation for non-false flag values', () => {
  assert.equal(resolveHomeLogoMode(''), 'scroll-animation')
  assert.equal(resolveHomeLogoMode('FALSE'), 'scroll-animation')
  assert.equal(resolveHomeLogoMode('0'), 'scroll-animation')
  assert.equal(resolveHomeLogoMode('true'), 'scroll-animation')
})
