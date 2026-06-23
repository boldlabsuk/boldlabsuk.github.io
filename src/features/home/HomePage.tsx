import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { homepageContent } from '../../content'
import {
  getLogoAnimationTransform,
  getLogoScrollProgress,
  resolveLogoScrollRange,
  type LogoAnimationRect,
  type LogoScrollRange,
} from './logoScrollAnimation'
import type { HomeLogoMode } from './homeLogoMode'

type HomeLogoPhase = 'hero' | 'transition' | 'complete'

type LogoAnimationMeasurement = {
  range: LogoScrollRange
  startRect: LogoAnimationRect
  targetRect: LogoAnimationRect
}

const stickyHeaderOffsetPx = 67
const siteHeaderSelector = '.site-header'
// Increase this to make the navbar logo fade in earlier.
const navbarLogoRevealOffsetPx = 20
// The logo SVG has transparent space below the visible BOLD lettering.
const boldLogoTextVisualBottomRatio = 619 / 788

export function HomePage({
  headerLogoRef,
  logoMode,
  onHeroLogoVisibilityChange,
  onLogoAnimationCompleteChange,
}: {
  headerLogoRef: RefObject<HTMLImageElement | null>
  logoMode: HomeLogoMode
  onHeroLogoVisibilityChange?: (isVisible: boolean) => void
  onLogoAnimationCompleteChange?: (isComplete: boolean) => void
}) {
  const heroLogoRef = useRef<HTMLImageElement>(null)
  const overlayLogoRef = useRef<HTMLImageElement>(null)
  const [logoPhase, setLogoPhase] = useState<HomeLogoPhase>('hero')

  useEffect(() => {
    if (logoMode !== 'legacy-reveal') {
      return
    }

    const heroLogo = heroLogoRef.current

    if (!heroLogo || !onHeroLogoVisibilityChange) {
      return
    }

    let animationFrameId: number | null = null

    const getStickyHeaderBottom = () => {
      const siteHeader = document.querySelector(siteHeaderSelector)

      return siteHeader?.getBoundingClientRect().bottom ?? stickyHeaderOffsetPx
    }

    const updateLogoVisibilityFromRect = () => {
      animationFrameId = null
      const rect = heroLogo.getBoundingClientRect()
      const stickyHeaderBottom = getStickyHeaderBottom()
      const visibleBoldTextBottom =
        rect.top + rect.height * boldLogoTextVisualBottomRatio

      onHeroLogoVisibilityChange(
        visibleBoldTextBottom > stickyHeaderBottom + navbarLogoRevealOffsetPx &&
          rect.top < window.innerHeight &&
          rect.right > 0 &&
          rect.left < window.innerWidth,
      )
    }

    const scheduleLogoVisibilityUpdate = () => {
      if (animationFrameId !== null) {
        return
      }

      animationFrameId = window.requestAnimationFrame(
        updateLogoVisibilityFromRect,
      )
    }

    scheduleLogoVisibilityUpdate()

    heroLogo.addEventListener('load', scheduleLogoVisibilityUpdate)
    window.addEventListener('scroll', scheduleLogoVisibilityUpdate, {
      passive: true,
    })
    window.addEventListener('resize', scheduleLogoVisibilityUpdate)

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId)
      }

      heroLogo.removeEventListener('load', scheduleLogoVisibilityUpdate)
      window.removeEventListener('scroll', scheduleLogoVisibilityUpdate)
      window.removeEventListener('resize', scheduleLogoVisibilityUpdate)
    }
  }, [logoMode, onHeroLogoVisibilityChange])

  useEffect(() => {
    if (logoMode !== 'scroll-animation') {
      return
    }

    const heroLogo = heroLogoRef.current
    const headerLogo = headerLogoRef.current
    const overlayLogo = overlayLogoRef.current

    if (!heroLogo || !headerLogo || !overlayLogo) {
      return
    }

    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )
    const siteHeader = headerLogo.closest('.site-header')
    let measurement: LogoAnimationMeasurement | null = null
    let animationFrameId: number | null = null
    let lastLogoPhase: HomeLogoPhase | null = null

    const hideOverlayLogo = () => {
      overlayLogo.style.opacity = '0'
      overlayLogo.style.visibility = 'hidden'
    }

    const setNextLogoPhase = (nextLogoPhase: HomeLogoPhase) => {
      if (lastLogoPhase === nextLogoPhase) {
        return
      }

      lastLogoPhase = nextLogoPhase
      setLogoPhase(nextLogoPhase)
      onLogoAnimationCompleteChange?.(nextLogoPhase === 'complete')
    }

    const measureLogoAnimation = () => {
      const range = resolveLogoScrollRange({
        widthPx: window.innerWidth,
        heightPx: window.innerHeight,
      })
      const scrollY = window.scrollY
      const heroRect = heroLogo.getBoundingClientRect()
      const headerRect = headerLogo.getBoundingClientRect()

      if (
        heroRect.width <= 0 ||
        heroRect.height <= 0 ||
        headerRect.width <= 0 ||
        headerRect.height <= 0
      ) {
        measurement = null
        hideOverlayLogo()
        return
      }

      measurement = {
        range,
        startRect: {
          top: heroRect.top + scrollY - range.startDelayPx,
          left: heroRect.left,
          width: heroRect.width,
          height: heroRect.height,
        },
        targetRect: {
          top: headerRect.top,
          left: headerRect.left,
          width: headerRect.width,
          height: headerRect.height,
        },
      }

      overlayLogo.style.width = `${measurement.startRect.width}px`
      overlayLogo.style.height = `${measurement.startRect.height}px`
    }

    const updateLogoAnimation = () => {
      animationFrameId = null

      if (!measurement) {
        measureLogoAnimation()
      }

      if (!measurement) {
        setNextLogoPhase('hero')
        return
      }

      const progress = getLogoScrollProgress(window.scrollY, measurement.range)

      if (reducedMotionQuery.matches) {
        hideOverlayLogo()
        setNextLogoPhase(progress >= 1 ? 'complete' : 'hero')
        return
      }

      if (progress <= 0) {
        hideOverlayLogo()
        setNextLogoPhase('hero')
        return
      }

      if (progress >= 1) {
        hideOverlayLogo()
        setNextLogoPhase('complete')
        return
      }

      const transform = getLogoAnimationTransform({
        startRect: measurement.startRect,
        targetRect: measurement.targetRect,
        progress,
      })

      overlayLogo.style.opacity = '1'
      overlayLogo.style.visibility = 'visible'
      overlayLogo.style.transform = `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`
      setNextLogoPhase('transition')
    }

    const scheduleLogoAnimationUpdate = () => {
      if (animationFrameId !== null) {
        return
      }

      animationFrameId = window.requestAnimationFrame(updateLogoAnimation)
    }

    const scheduleLogoAnimationMeasure = () => {
      measurement = null
      scheduleLogoAnimationUpdate()
    }

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(scheduleLogoAnimationMeasure)

    measureLogoAnimation()
    scheduleLogoAnimationUpdate()

    heroLogo.addEventListener('load', scheduleLogoAnimationMeasure)
    headerLogo.addEventListener('load', scheduleLogoAnimationMeasure)
    window.addEventListener('scroll', scheduleLogoAnimationUpdate, {
      passive: true,
    })
    window.addEventListener('resize', scheduleLogoAnimationMeasure)
    window.addEventListener('orientationchange', scheduleLogoAnimationMeasure)
    reducedMotionQuery.addEventListener('change', scheduleLogoAnimationUpdate)
    resizeObserver?.observe(heroLogo)
    resizeObserver?.observe(headerLogo)

    if (siteHeader) {
      resizeObserver?.observe(siteHeader)
    }

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId)
      }

      heroLogo.removeEventListener('load', scheduleLogoAnimationMeasure)
      headerLogo.removeEventListener('load', scheduleLogoAnimationMeasure)
      window.removeEventListener('scroll', scheduleLogoAnimationUpdate)
      window.removeEventListener('resize', scheduleLogoAnimationMeasure)
      window.removeEventListener('orientationchange', scheduleLogoAnimationMeasure)
      reducedMotionQuery.removeEventListener(
        'change',
        scheduleLogoAnimationUpdate,
      )
      resizeObserver?.disconnect()
      onLogoAnimationCompleteChange?.(false)
    }
  }, [headerLogoRef, logoMode, onLogoAnimationCompleteChange])

  const isHeroLogoVisuallyHidden =
    logoMode === 'scroll-animation' && logoPhase !== 'hero'

  return (
    <>
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero-brand">
          <img
            ref={heroLogoRef}
            className={
              isHeroLogoVisuallyHidden
                ? 'home-hero-logo home-hero-logo-hidden'
                : 'home-hero-logo'
            }
            src="/bold_full_vector_logo.svg"
            alt=""
          />
          <p className="home-hero-subtitle">
            <HomeHeroSubtitle text={homepageContent.hero.eyebrow} />
          </p>
        </div>
        <div className="home-hero-main">
          <div className="home-hero-copy">
            <h1 id="home-hero-title">{homepageContent.hero.headline}</h1>
            <p className="hero-lede">{homepageContent.hero.lede}</p>
            <div className="hero-actions" aria-label="Primary actions">
              {homepageContent.hero.actions.map((action, index) => (
                <a
                  className={`button ${index === 0 ? 'button-primary' : 'button-secondary'}`}
                  href={action.href}
                  key={action.label}
                >
                  {action.label}
                </a>
              ))}
            </div>
            <dl className="hero-metrics" aria-label="Lab highlights">
              {homepageContent.proofMetrics.map((metric) => (
                <div key={metric.label}>
                  <dt>{metric.value}</dt>
                  <dd>
                    <strong>{metric.label}</strong>
                    <span>{metric.detail}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="home-hero-visual">
            <img className="home-hero-image" src="/butterfly_swam.png" alt="" />
          </div>
        </div>
      </section>
      {logoMode === 'scroll-animation' && (
        <img
          ref={overlayLogoRef}
          className="home-logo-transition"
          src="/bold_full_vector_logo.svg"
          alt=""
          aria-hidden="true"
        />
      )}

      <section className="home-section bet-section" aria-labelledby="bet-title">
        <div className="home-section-header">
          <p className="eyebrow eyebrow-title-case">Our Bets</p>
          <h2 id="bet-title">The next paradigm will not come from scale alone.</h2>
        </div>
        <div className="bet-list">
          {homepageContent.labBet.map((bet, index) => (
            <article className="bet-item" key={bet.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{bet.title}</h3>
              <p>{bet.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="home-section directions-section"
        aria-labelledby="directions-title"
      >
        <div className="home-section-header">
          <h2 id="directions-title">Three pillars.</h2>
          <div className="home-section-summary">
            <p className="eyebrow eyebrow-title-case">Research Directions</p>
            <p>
              Each direction is designed to test Our Bets from a different
              scientific angle while sharing systems, infrastructure, and critical
              mass.
            </p>
          </div>
        </div>
        <ol className="direction-list">
          {homepageContent.researchDirections.map((direction) => (
            <li className="direction-item" key={direction.name}>
              <h3>{direction.name}</h3>
              <p>{direction.description}</p>
            </li>
          ))}
        </ol>
      </section>

    </>
  )
}

function HomeHeroSubtitle({ text }: { text: string }) {
  if (text !== 'British Open-Ended Learning & Discovery Lab') {
    return text
  }

  return (
    <>
      <span className="home-hero-subtitle-initial">B</span>ritish{' '}
      <span className="home-hero-subtitle-initial">O</span>pen-Ended{' '}
      <span className="home-hero-subtitle-initial">L</span>earning &{' '}
      <span className="home-hero-subtitle-initial">D</span>iscovery Lab
    </>
  )
}
