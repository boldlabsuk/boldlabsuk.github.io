export type LogoScrollRange = {
  startDelayPx: number
  distancePx: number
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

const mobileViewportMaxWidthPx = 820

export function resolveLogoScrollRange({
  widthPx,
  heightPx,
}: LogoScrollViewport): LogoScrollRange {
  const isMobile = widthPx <= mobileViewportMaxWidthPx

  if (isMobile) {
    return {
      startDelayPx: clamp(heightPx * 0.05, 28, 56),
      distancePx: clamp(heightPx * 0.36, 220, 360),
    }
  }

  return {
    startDelayPx: clamp(heightPx * 0.06, 36, 72),
    distancePx: clamp(heightPx * 0.42, 320, 520),
  }
}

export function getLogoScrollProgress(
  scrollY: number,
  { startDelayPx, distancePx }: LogoScrollRange,
) {
  if (distancePx <= 0) {
    return 1
  }

  return clamp((scrollY - startDelayPx) / distancePx, 0, 1)
}

export function getLogoAnimationTransform({
  startRect,
  targetRect,
  progress,
}: {
  startRect: LogoAnimationRect
  targetRect: LogoAnimationRect
  progress: number
}): LogoAnimationTransform {
  const clampedProgress = clamp(progress, 0, 1)

  return {
    x: interpolate(startRect.left, targetRect.left, clampedProgress),
    y: interpolate(startRect.top, targetRect.top, clampedProgress),
    scale:
      startRect.width > 0
        ? interpolate(1, targetRect.width / startRect.width, clampedProgress)
        : 1,
  }
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function interpolate(start: number, end: number, progress: number) {
  return start + (end - start) * progress
}
