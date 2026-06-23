export type HomeLogoMode = 'scroll-animation' | 'legacy-reveal'

type HomeLogoAnimationEnv = {
  readonly VITE_HOME_LOGO_ANIMATION?: string
}

export function resolveHomeLogoMode(
  homeLogoAnimationFlag?: string,
): HomeLogoMode {
  return homeLogoAnimationFlag === 'false'
    ? 'legacy-reveal'
    : 'scroll-animation'
}

export const homeLogoMode = resolveHomeLogoMode(
  ((import.meta as ImportMeta & { env?: HomeLogoAnimationEnv }).env ?? {})
    .VITE_HOME_LOGO_ANIMATION,
)
