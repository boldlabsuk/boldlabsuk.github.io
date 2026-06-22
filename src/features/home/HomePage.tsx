import { homepageContent } from '../../content'

export function HomePage() {
  return (
    <>
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero-copy">
          <p className="eyebrow">{homepageContent.hero.eyebrow}</p>
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
          <dl className="hero-metrics" aria-label="Institute highlights">
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
        <div
          className="home-hero-visual"
          role="img"
          aria-label="Abstract research graphic showing open-ended learning loops"
        >
          <div className="learning-field" aria-hidden="true">
            <span className="field-ring ring-a" />
            <span className="field-ring ring-b" />
            <span className="field-ring ring-c" />
            <span className="field-path path-a" />
            <span className="field-path path-b" />
            <span className="field-path path-c" />
            <span className="field-node node-a" />
            <span className="field-node node-b" />
            <span className="field-node node-c" />
            <span className="field-node node-d" />
            <span className="field-testbed" />
          </div>
        </div>
      </section>

      <section className="home-section bet-section" aria-labelledby="bet-title">
        <div className="home-section-header">
          <p className="eyebrow">The Institute Bet</p>
          <h2 id="bet-title">The next paradigm will not come from scale alone.</h2>
        </div>
        <div className="bet-list">
          {homepageContent.instituteBet.map((bet, index) => (
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
          <p className="eyebrow">Research Directions</p>
          <h2 id="directions-title">Three directions, one programme.</h2>
          <p>
            Each direction is designed to test the Institute Bet from a different
            scientific angle while sharing systems, infrastructure, and critical
            mass.
          </p>
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

      <section
        className="home-section credibility-section"
        aria-labelledby="credibility-title"
      >
        <div className="credibility-inner">
          <div className="credibility-copy">
            <p className="eyebrow">{homepageContent.credibility.eyebrow}</p>
            <h2 id="credibility-title">
              {homepageContent.credibility.headline}
            </h2>
            <blockquote>{homepageContent.credibility.statement}</blockquote>
          </div>
          <ul className="credibility-list">
            {homepageContent.credibility.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
