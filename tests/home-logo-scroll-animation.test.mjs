import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getLogoScrollProgress,
  resolveLogoScrollRange,
} from '../src/features/home/logoScrollAnimation.ts'

test('logo scroll progress stays at 0 before the initial delay', () => {
  const range = { startDelayPx: 36, distancePx: 320 }

  assert.equal(getLogoScrollProgress(0, range), 0)
  assert.equal(getLogoScrollProgress(35, range), 0)
})

test('logo scroll progress advances proportionally through the scroll range', () => {
  const range = { startDelayPx: 40, distancePx: 400 }

  assert.equal(getLogoScrollProgress(240, range), 0.5)
})

test('logo scroll progress clamps at 1 after the scroll range', () => {
  const range = { startDelayPx: 40, distancePx: 400 }

  assert.equal(getLogoScrollProgress(440, range), 1)
  assert.equal(getLogoScrollProgress(840, range), 1)
})

test('logo scroll progress reverses as scroll moves upward', () => {
  const range = { startDelayPx: 40, distancePx: 400 }

  assert.ok(
    getLogoScrollProgress(140, range) < getLogoScrollProgress(340, range),
  )
})

test('logo scroll ranges use desktop viewport timing bounds', () => {
  assert.deepEqual(resolveLogoScrollRange({ widthPx: 1200, heightPx: 1000 }), {
    startDelayPx: 60,
    distancePx: 420,
  })

  assert.deepEqual(resolveLogoScrollRange({ widthPx: 1200, heightPx: 500 }), {
    startDelayPx: 36,
    distancePx: 320,
  })

  assert.deepEqual(resolveLogoScrollRange({ widthPx: 1200, heightPx: 1400 }), {
    startDelayPx: 72,
    distancePx: 520,
  })
})

test('logo scroll ranges use shorter mobile viewport timing bounds', () => {
  assert.deepEqual(resolveLogoScrollRange({ widthPx: 820, heightPx: 800 }), {
    startDelayPx: 40,
    distancePx: 288,
  })

  assert.deepEqual(resolveLogoScrollRange({ widthPx: 390, heightPx: 800 }), {
    startDelayPx: 40,
    distancePx: 288,
  })

  assert.deepEqual(resolveLogoScrollRange({ widthPx: 390, heightPx: 500 }), {
    startDelayPx: 28,
    distancePx: 220,
  })

  assert.deepEqual(resolveLogoScrollRange({ widthPx: 390, heightPx: 1200 }), {
    startDelayPx: 56,
    distancePx: 360,
  })
})
