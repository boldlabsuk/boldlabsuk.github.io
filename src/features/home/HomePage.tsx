import { type CSSProperties, useEffect, useRef } from 'react'
import researchPillarIcon from '../../assets/research-pillar.svg'
import { homepageContent } from '../../content'

const stickyHeaderOffsetPx = 67
const siteHeaderSelector = '.site-header'
// Increase this to make the navbar logo fade in earlier.
const navbarLogoRevealOffsetPx = 20
// The logo SVG has transparent space below the visible BOLD lettering.
const boldLogoTextVisualBottomRatio = 619 / 788

type ResearchPillarTone = {
  className: string
  style: CSSProperties & Record<'--pillar-dark' | '--pillar-light', string>
}

const researchPillarTones: readonly ResearchPillarTone[] = [
  {
    className: 'pillar-tone-dark-aqua',
    style: { '--pillar-dark': '#538FA1', '--pillar-light': '#E3E3E1' },
  },
  {
    className: 'pillar-tone-blue-periwinkle',
    style: { '--pillar-dark': '#6D89AC', '--pillar-light': '#E3E3E1' },
  },
  {
    className: 'pillar-tone-dark-violet',
    style: { '--pillar-dark': '#8781A9', '--pillar-light': '#E3E3E1' },
  },
]

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
  }, [onHeroLogoVisibilityChange])

  return (
    <>
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero-brand">
          <img
            ref={heroLogoRef}
            className="home-hero-logo"
            src="/bold_full_vector_logo.svg"
            width="1995"
            height="788"
            loading="eager"
            decoding="sync"
            fetchPriority="high"
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
            <nav className="hero-actions" aria-label="Primary actions">
              {homepageContent.hero.actions.map((action, index) => (
                <a
                  className={`button ${index === 0 ? 'button-primary' : 'button-secondary'}`}
                  href={action.href}
                  key={action.label}
                >
                  {action.label}
                </a>
              ))}
            </nav>
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
            <img
              className="home-hero-image"
              src="/butterfly_swam.png"
              width="1086"
              height="1448"
              loading="eager"
              decoding="sync"
              fetchPriority="high"
              alt=""
            />
          </div>
        </div>
      </section>

      <section
        className="home-section vision-section"
        aria-labelledby="vision-title"
      >
        <div className="home-section-inner stacked-section-layout">
          <h2 className="home-section-title" id="vision-title">
            The Vision
          </h2>
          <div className="section-prose vision-copy">
            {homepageContent.vision.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section
        className="home-section pillars-section"
        aria-labelledby="pillars-title"
      >
        <div className="home-section-inner stacked-section-layout">
          <h2 className="home-section-title" id="pillars-title">
            Three Initial Research Pillars
          </h2>
          {/* biome-ignore lint/a11y/noRedundantRoles: Safari drops list semantics when list-style is none. */}
          <ol className="editorial-list pillar-list" role="list">
            {homepageContent.researchPillars.map((pillar, index) => (
              <li className="editorial-list-item pillar-item" key={pillar.name}>
                <article>
                  <svg
                    className={`pillar-item-icon ${researchPillarTones[index].className}`}
                    style={researchPillarTones[index].style}
                    width="506"
                    height="1104"
                    viewBox="0 0 506 1104"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <use href={`${researchPillarIcon}#research-pillar`} />
                  </svg>
                  <div className="pillar-item-heading">
                    <h3>{pillar.name}</h3>
                    <p className="item-kicker">Lead: {pillar.lead}</p>
                  </div>
                  <p className="pillar-item-description">
                    {pillar.description}
                  </p>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="home-section team-section"
        aria-labelledby="team-title"
      >
        <div className="home-section-inner">
          <div className="split-section-layout section-introduction">
            <h2 className="home-section-title" id="team-title">
              The Team &amp; Track Record
            </h2>
            <p>{homepageContent.team.introduction}</p>
          </div>
          <ol className="editorial-list faculty-list">
            {homepageContent.team.faculty.map((member, index) => (
              <li
                className="editorial-list-item faculty-item"
                key={member.identity}
              >
                <span className="item-index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3>{member.identity}</h3>
                <p>{member.description}</p>
              </li>
            ))}
          </ol>
          <p className="team-track-record">
            {homepageContent.team.trackRecord}
          </p>
        </div>
      </section>

      <section
        className="home-section leaders-section"
        aria-labelledby="leaders-title"
      >
        <div className="home-section-inner split-section-layout leaders-layout">
          <h2 className="home-section-title" id="leaders-title">
            Backed by the Field&apos;s Leaders
          </h2>
          <p className="leaders-statement">{homepageContent.fieldLeaders}</p>
        </div>
      </section>

      <section
        className="home-section operating-section"
        aria-labelledby="operating-title"
      >
        <div className="home-section-inner">
          <div className="split-section-layout section-introduction">
            <h2 className="home-section-title" id="operating-title">
              How BOLD Works, and Why the UK
            </h2>
            <p>{homepageContent.operatingModel.introduction}</p>
          </div>
          <ol className="editorial-list phase-list">
            {homepageContent.operatingModel.phases.map((phase, index) => (
              <li className="editorial-list-item phase-item" key={phase.name}>
                <span className="item-index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3>{phase.name}</h3>
                <p>{phase.description}</p>
              </li>
            ))}
          </ol>
          <div className="section-prose uk-case-copy">
            {homepageContent.operatingModel.ukCase.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section
        className="home-section glance-section"
        aria-labelledby="glance-title"
      >
        <div className="home-section-inner">
          <h2 className="home-section-title" id="glance-title">
            At a Glance
          </h2>
          <dl className="glance-list">
            {homepageContent.atAGlance.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="home-closing" aria-label="BOLD mission statement">
        <p>{homepageContent.closingStatement}</p>
      </section>
    </>
  )
}

function HomeHeroSubtitle({ text }: { text: string }) {
  const words = Array.from(text.matchAll(/\S+/g), (match) => ({
    text: match[0],
    offset: match.index,
  }))

  return (
    <>
      {words.map((word, position) => (
        <span key={`${word.offset}-${word.text}`}>
          {word.text[0] === word.text[0]?.toUpperCase() ? (
            <span className="home-hero-subtitle-initial">{word.text[0]}</span>
          ) : (
            word.text[0]
          )}
          {word.text.slice(1)}
          {position < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </>
  )
}
