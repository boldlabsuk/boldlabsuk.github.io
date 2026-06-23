export type BoldLogoAnimationMode = 'scrollLockedManim' | 'triggeredManim'

export type BoldLogoAnimationConfig = {
  mode: BoldLogoAnimationMode
  durationMs: number
  lagRatio: number
  rateFunction: (t: number) => number
}

export type LogoAnimationTiming = {
  scrollLockedStartY: number
  scrollLockedEndY: number
  triggerDownY: number
  triggerUpY: number
}

export type LogoScrollViewport = {
  widthPx: number
  heightPx: number
}

export type LogoAnimationRect = {
  top: number
  left: number
  width: number
  height: number
}

export type LogoAnimationTransform = {
  x: number
  y: number
  scale: number
}

export type TriggeredLogoAlphaInput = {
  nowMs: number
  animationStartTimeMs: number
  durationMs: number
  alphaAtAnimationStart: number
  targetAlpha: number
  rateFunction?: (t: number) => number
}

export const boldLogoAnimationConfig: BoldLogoAnimationConfig = {
  mode: 'scrollLockedManim',
  durationMs: 700,
  lagRatio: 0,
  rateFunction: manimSmooth,
}

const mobileViewportMaxWidthPx = 820

export function resolveLogoAnimationTiming({
  widthPx,
  heightPx,
}: LogoScrollViewport): LogoAnimationTiming {
  const isMobile = widthPx <= mobileViewportMaxWidthPx
  const scrollLockedStartY = isMobile
    ? clamp(heightPx * 0.05, 28, 56)
    : clamp(heightPx * 0.06, 36, 72)
  const scrollLockedDistancePx = isMobile
    ? clamp(heightPx * 0.36, 220, 360)
    : clamp(heightPx * 0.42, 320, 520)
  const triggerOffsetPx = Math.round(
    clamp(scrollLockedDistancePx * 0.18, 36, 72),
  )
  const hysteresisPx = Math.round(clamp(heightPx * 0.05, 28, 64))
  const triggerDownY = scrollLockedStartY + triggerOffsetPx

  return {
    scrollLockedStartY,
    scrollLockedEndY: scrollLockedStartY + scrollLockedDistancePx,
    triggerDownY,
    triggerUpY: Math.max(0, triggerDownY - hysteresisPx),
  }
}

export function getScrollLockedLogoRawAlpha(
  scrollY: number,
  { scrollLockedStartY, scrollLockedEndY }: LogoAnimationTiming,
) {
  const distancePx = scrollLockedEndY - scrollLockedStartY

  if (distancePx <= 0) {
    return 1
  }

  return clamp01((scrollY - scrollLockedStartY) / distancePx)
}

export function getScrollLockedLogoAlpha(
  scrollY: number,
  timing: LogoAnimationTiming,
  rateFunction: (t: number) => number = manimSmooth,
) {
  return rateFunction(getScrollLockedLogoRawAlpha(scrollY, timing))
}

export function getTriggeredLogoTargetAlpha(
  scrollY: number,
  { triggerDownY, triggerUpY }: LogoAnimationTiming,
  currentTargetAlpha: number,
) {
  if (scrollY >= triggerDownY) {
    return 1
  }

  if (scrollY <= triggerUpY) {
    return 0
  }

  return currentTargetAlpha >= 0.5 ? 1 : 0
}

export function getTriggeredLogoAlpha({
  nowMs,
  animationStartTimeMs,
  durationMs,
  alphaAtAnimationStart,
  targetAlpha,
  rateFunction = manimSmooth,
}: TriggeredLogoAlphaInput) {
  if (durationMs <= 0) {
    return clamp01(targetAlpha)
  }

  const timeProgress = clamp01((nowMs - animationStartTimeMs) / durationMs)
  const easedTimeProgress = rateFunction(timeProgress)

  return lerp(
    clamp01(alphaAtAnimationStart),
    clamp01(targetAlpha),
    easedTimeProgress,
  )
}

export function isTriggeredLogoAnimationComplete({
  nowMs,
  animationStartTimeMs,
  durationMs,
}: Pick<
  TriggeredLogoAlphaInput,
  'nowMs' | 'animationStartTimeMs' | 'durationMs'
>) {
  return durationMs <= 0 || nowMs - animationStartTimeMs >= durationMs
}

export function interpolateLogoState({
  startRect,
  targetRect,
  alpha,
}: {
  startRect: LogoAnimationRect
  targetRect: LogoAnimationRect
  alpha: number
}): LogoAnimationTransform {
  const clampedAlpha = clamp01(alpha)

  return {
    x: lerp(startRect.left, targetRect.left, clampedAlpha),
    y: lerp(startRect.top, targetRect.top, clampedAlpha),
    scale:
      startRect.width > 0
        ? lerp(1, targetRect.width / startRect.width, clampedAlpha)
        : 1,
  }
}

export function formatLogoTransform({
  x,
  y,
  scale,
}: LogoAnimationTransform) {
  return `translate3d(${x}px, ${y}px, 0) scale(${scale})`
}

export function clamp01(t: number) {
  return Math.max(0, Math.min(1, t))
}

// Manim-inspired normalized alpha interpolation using the default smooth
// rate function: smooth(t) = 10t^3 - 15t^4 + 6t^5.
export function manimSmooth(t: number) {
  t = clamp01(t)

  return t * t * t * (10 - 15 * t + 6 * t * t)
}

export function lerp(a: number, b: number, alpha: number) {
  return a + (b - a) * alpha
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
