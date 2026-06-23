import { useEffect, useRef } from 'react'
import { homepageContent } from '../../content'

const stickyHeaderOffsetPx = 67
const siteHeaderSelector = '.site-header'
// Increase this to make the navbar logo fade in earlier.
const navbarLogoRevealOffsetPx = 20
// The logo SVG has transparent space below the visible BOLD lettering.
const boldLogoTextVisualBottomRatio = 619 / 788

export function HomePage({
  onHeroLogoVisibilityChange,
}: {
  onHeroLogoVisibilityChange?: (isVisible: boolean) => void
}) {
  const heroLogoRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const heroLogo = heroLogoRef.current

    if (!heroLogo || !onHeroLogoVisibilityChange) {
      return
    }

    let animationFrameId: number | null = null

    const getStickyHeaderBottom = () => {
      const siteHeader = document.querySelector(siteHeaderSelector)

      return (
        siteHeader?.getBoundingClientRect().bottom ?? stickyHeaderOffsetPx
      )
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

      animationFrameId = window.requestAnimationFrame(updateLogoVisibilityFromRect)
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
  }, [onHeroLogoVisibilityChange])

  return (
    <>
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero-brand">
          <img
            ref={heroLogoRef}
            className="home-hero-logo"
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
