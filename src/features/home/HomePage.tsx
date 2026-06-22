import { heroImage } from '../../assets/images'
import { involvementRoutes, siteMeta } from '../../content'
import { SectionHeader } from '../../ui/layout/SectionHeader'
import { FeatureCard } from '../../ui/primitives/FeatureCard'

export function HomePage() {
  return (
    <>
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero-copy">
          <p className="eyebrow">{siteMeta.expandedName}</p>
          <h1 id="home-hero-title">{siteMeta.missionPhrase}</h1>
          <p className="hero-lede">{siteMeta.mission}</p>
          <div className="hero-actions" aria-label="Primary actions">
            <a className="button button-primary" href="/people">
              Meet Our People
            </a>
            <a className="button button-secondary" href="/opportunities">
              Work With Us
            </a>
          </div>
          <dl className="hero-metrics" aria-label="Institute highlights">
            <div>
              <dt>3</dt>
              <dd>university labs</dd>
            </div>
            <div>
              <dt>12</dt>
              <dd>research themes</dd>
            </div>
            <div>
              <dt>6</dt>
              <dd>routes to join</dd>
            </div>
          </dl>
        </div>
        <div className="home-hero-media" aria-label="Institute research setting">
          <img
            src={heroImage}
            alt="Researchers collaborating in a bright university AI lab"
          />
          <div className="hero-graphic" aria-hidden="true">
            <span className="graphic-node node-a" />
            <span className="graphic-node node-b" />
            <span className="graphic-node node-c" />
            <span className="graphic-node node-d" />
            <span className="graphic-line line-a" />
            <span className="graphic-line line-b" />
            <span className="graphic-line line-c" />
          </div>
        </div>
      </section>

      <section className="section-band feature-link-section">
        <SectionHeader
          eyebrow="Institute"
          title="One institute, clear routes in."
          description="The launch site is organised around the people and opportunities that make the research programme legible."
        />
        <div className="feature-card-grid two-up">
          <FeatureCard
            href="/people"
            kicker="Directory"
            title="Our People"
            description="Meet the researchers, engineers, students, and fellows building the institute."
            variant="teal"
          />
          <FeatureCard
            href="/opportunities"
            kicker="Join"
            title="Opportunities"
            description="Learn how to join, visit, collaborate, or get involved."
            variant="slate"
          />
        </div>
      </section>

      <section className="statement-section">
        <p>{siteMeta.statement}</p>
      </section>

      <section className="section-band identity-section">
        <div className="identity-copy">
          <p className="eyebrow">About</p>
          <h2>A unified environment for long-term AI research.</h2>
          <p>{siteMeta.identity}</p>
        </div>
        <div className="identity-panel" aria-label="Institute structure">
          <div>
            <span>01</span>
            <strong>Academic depth</strong>
            <p>Research groups remain connected to university strengths.</p>
          </div>
          <div>
            <span>02</span>
            <strong>Engineering excellence</strong>
            <p>Shared systems make ambitious programmes reproducible.</p>
          </div>
          <div>
            <span>03</span>
            <strong>Scientific ambition</strong>
            <p>Long-horizon projects are coordinated at institute scale.</p>
          </div>
        </div>
      </section>

      <section className="section-band opportunities-preview">
        <SectionHeader
          eyebrow="Opportunities"
          title="Ways to work with us."
          description="Find the route that best matches your stage, expertise, and proposed contribution."
          cta={{ label: 'See all opportunities', href: '/opportunities' }}
        />
        <div className="opportunity-link-grid">
          {involvementRoutes.map((route) => (
            <a className="opportunity-link-card" href={route.href} key={route.id}>
              <span>{route.shortTitle}</span>
              <p>{route.summary}</p>
            </a>
          ))}
        </div>
      </section>
    </>
  )
}
