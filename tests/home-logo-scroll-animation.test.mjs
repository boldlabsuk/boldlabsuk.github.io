import test from 'node:test'
import assert from 'node:assert/strict'

import {
  boldLogoAnimationConfig,
  clamp01,
  formatLogoTransform,
  getScrollLockedLogoAlpha,
  getScrollLockedLogoRawAlpha,
  getTriggeredLogoAlpha,
  getTriggeredLogoTargetAlpha,
  interpolateLogoState,
  isTriggeredLogoAnimationComplete,
  lerp,
  manimSmooth,
  resolveLogoAnimationTiming,
} from '../src/features/home/logoScrollAnimation.ts'

const assertAlmostEqual = (actual, expected) => {
  assert.ok(
    Math.abs(actual - expected) < 0.000_001,
    `expected ${actual} to be close to ${expected}`,
  )
}

test('home logo animation config defaults to scroll-locked Manim mode', () => {
  assert.equal(boldLogoAnimationConfig.mode, 'scrollLockedManim')
  assert.equal(boldLogoAnimationConfig.durationMs, 700)
  assert.equal(boldLogoAnimationConfig.lagRatio, 0)
  assert.equal(boldLogoAnimationConfig.rateFunction, manimSmooth)
})

test('Manim smooth clamps alpha and eases around the midpoint', () => {
  assert.equal(clamp01(-0.2), 0)
  assert.equal(clamp01(0.4), 0.4)
  assert.equal(clamp01(1.2), 1)
  assert.equal(manimSmooth(-1), 0)
  assert.equal(manimSmooth(0), 0)
  assert.equal(manimSmooth(0.5), 0.5)
  assert.equal(manimSmooth(1), 1)
  assert.equal(manimSmooth(2), 1)
  assert.ok(manimSmooth(0.25) < 0.25)
  assert.ok(manimSmooth(0.75) > 0.75)
})

test('scroll-locked mode keeps raw scroll progress but eases visual alpha', () => {
  const timing = {
    scrollLockedStartY: 40,
    scrollLockedEndY: 440,
    triggerDownY: 100,
    triggerUpY: 60,
  }

  assert.equal(getScrollLockedLogoRawAlpha(0, timing), 0)
  assert.equal(getScrollLockedLogoRawAlpha(240, timing), 0.5)
  assert.equal(getScrollLockedLogoRawAlpha(840, timing), 1)
  assert.equal(getScrollLockedLogoAlpha(240, timing), 0.5)
  assertAlmostEqual(getScrollLockedLogoAlpha(140, timing), manimSmooth(0.25))
  assert.ok(getScrollLockedLogoAlpha(140, timing) < 0.25)
})

test('logo animation timing uses viewport-derived scroll ranges and trigger hysteresis', () => {
  assert.deepEqual(
    resolveLogoAnimationTiming({ widthPx: 1200, heightPx: 1000 }),
    {
      scrollLockedStartY: 60,
      scrollLockedEndY: 480,
      triggerDownY: 132,
      triggerUpY: 82,
    },
  )

  assert.deepEqual(
    resolveLogoAnimationTiming({ widthPx: 1200, heightPx: 500 }),
    {
      scrollLockedStartY: 36,
      scrollLockedEndY: 356,
      triggerDownY: 94,
      triggerUpY: 66,
    },
  )

  assert.deepEqual(
    resolveLogoAnimationTiming({ widthPx: 820, heightPx: 800 }),
    {
      scrollLockedStartY: 40,
      scrollLockedEndY: 328,
      triggerDownY: 92,
      triggerUpY: 52,
    },
  )

  assert.deepEqual(
    resolveLogoAnimationTiming({ widthPx: 390, heightPx: 500 }),
    {
      scrollLockedStartY: 28,
      scrollLockedEndY: 248,
      triggerDownY: 68,
      triggerUpY: 40,
    },
  )

  assert.deepEqual(
    resolveLogoAnimationTiming({ widthPx: 390, heightPx: 1200 }),
    {
      scrollLockedStartY: 56,
      scrollLockedEndY: 416,
      triggerDownY: 121,
      triggerUpY: 61,
    },
  )
})

test('logo state interpolation uses eased alpha for position and uniform scale', () => {
  const startRect = { top: 200, left: 100, width: 400, height: 120 }
  const targetRect = { top: 40, left: 20, width: 100, height: 60 }
  const alpha = manimSmooth(0.25)
  const transform = interpolateLogoState({ startRect, targetRect, alpha })

  assertAlmostEqual(transform.x, lerp(100, 20, alpha))
  assertAlmostEqual(transform.y, lerp(200, 40, alpha))
  assertAlmostEqual(transform.scale, lerp(1, 0.25, alpha))
  assert.equal(
    formatLogoTransform(transform),
    `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
  )
})

test('triggered mode eases time progress between the current and target alpha', () => {
  assert.equal(
    getTriggeredLogoAlpha({
      nowMs: 0,
      animationStartTimeMs: 0,
      durationMs: 700,
      alphaAtAnimationStart: 0.2,
      targetAlpha: 1,
    }),
    0.2,
  )

  assertAlmostEqual(
    getTriggeredLogoAlpha({
      nowMs: 350,
      animationStartTimeMs: 0,
      durationMs: 700,
      alphaAtAnimationStart: 0.2,
      targetAlpha: 1,
    }),
    0.6,
  )

  assert.equal(
    getTriggeredLogoAlpha({
      nowMs: 700,
      animationStartTimeMs: 0,
      durationMs: 700,
      alphaAtAnimationStart: 0.2,
      targetAlpha: 1,
    }),
    1,
  )

  assertAlmostEqual(
    getTriggeredLogoAlpha({
      nowMs: 350,
      animationStartTimeMs: 0,
      durationMs: 700,
      alphaAtAnimationStart: 0.7,
      targetAlpha: 0,
    }),
    0.35,
  )
})

test('triggered mode target alpha uses hysteresis near the scroll threshold', () => {
  const timing = {
    scrollLockedStartY: 40,
    scrollLockedEndY: 440,
    triggerDownY: 100,
    triggerUpY: 60,
  }

  assert.equal(getTriggeredLogoTargetAlpha(120, timing, 0), 1)
  assert.equal(getTriggeredLogoTargetAlpha(40, timing, 1), 0)
  assert.equal(getTriggeredLogoTargetAlpha(80, timing, 1), 1)
  assert.equal(getTriggeredLogoTargetAlpha(80, timing, 0), 0)
})

test('triggered mode completion is based on elapsed duration', () => {
  assert.equal(
    isTriggeredLogoAnimationComplete({
      nowMs: 699,
      animationStartTimeMs: 0,
      durationMs: 700,
    }),
    false,
  )
  assert.equal(
    isTriggeredLogoAnimationComplete({
      nowMs: 700,
      animationStartTimeMs: 0,
      durationMs: 700,
    }),
    true,
  )
  assert.equal(
    isTriggeredLogoAnimationComplete({
      nowMs: 0,
      animationStartTimeMs: 0,
      durationMs: 0,
    }),
    true,
  )
})
