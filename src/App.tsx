import heroImage from './assets/bold-students-hero.webp'
import profileAmara from './assets/profile-amara.webp'
import profileEve from './assets/profile-eve.webp'
import profileJules from './assets/profile-jules.webp'
import profileMarcus from './assets/profile-marcus.webp'
import {
  blogPosts,
  navigation,
  people,
  publications,
  researchPillars,
  siteMeta,
} from './content'
import type { Person } from './content'
import './App.css'

const profileImages = {
  amara: profileAmara,
  marcus: profileMarcus,
  jules: profileJules,
  eve: profileEve,
} satisfies Record<Person['imageKey'], string>

function App() {
  return (
    <main>
      <header className="site-header" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="BOLD home">
          <span className="brand-mark">B</span>
          <span>
            <strong>{siteMeta.name}</strong>
            <small>AI Lab</small>
          </span>
        </a>
        <nav className="nav-links">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <section className="hero-section" id="top" aria-labelledby="hero-title">
        <img
          className="hero-image"
          src={heroImage}
          alt="Students collaborating in a bright AI research lab"
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">{siteMeta.expandedName}</p>
          <h1 id="hero-title">BOLD</h1>
          <p className="hero-lede">{siteMeta.mission}</p>
          <div className="hero-actions" aria-label="Primary actions">
            <a className="button button-primary" href="#research">
              Explore research
            </a>
            <a className="button button-secondary" href="#people">
              Meet the students
            </a>
          </div>
        </div>
        <dl className="hero-metrics" aria-label="Lab highlights">
          <div>
            <dt>04</dt>
            <dd>research pillars</dd>
          </div>
          <div>
            <dt>05</dt>
            <dd>prototype publications</dd>
          </div>
          <div>
            <dt>100%</dt>
            <dd>static public site</dd>
          </div>
        </dl>
      </section>

      <section className="intro-section section-band">
        <div className="section-grid">
          <div>
            <p className="eyebrow">Why BOLD exists</p>
            <h2>Open-ended AI needs institutions built for discovery.</h2>
          </div>
          <p className="section-copy">
            The best AI lab sites make the mission immediate, then give visitors
            credible paths into research, people, writing, and publications.
            BOLD follows that pattern with a public-first static site that can
            grow from prototype into a real lab archive.
          </p>
        </div>
      </section>

      <section
        className="section-band research-section"
        id="research"
        aria-labelledby="research-title"
      >
        <div className="section-header">
          <p className="eyebrow">Research</p>
          <h2 id="research-title">A focused programme for open-ended learning.</h2>
          <p>
            Four strands keep the lab legible: the systems we build, the
            discoveries they enable, the evidence we publish, and the
            infrastructure students can reuse.
          </p>
        </div>
        <div className="pillar-grid">
          {researchPillars.map((pillar) => (
            <article className="pillar-card" key={pillar.title}>
              <p className="card-eyebrow">{pillar.eyebrow}</p>
              <h3>{pillar.title}</h3>
              <p>{pillar.summary}</p>
              <ul>
                {pillar.signals.map((signal) => (
                  <li key={signal}>{signal}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section
        className="section-band people-section"
        id="people"
        aria-labelledby="people-title"
      >
        <div className="section-header">
          <p className="eyebrow">People</p>
          <h2 id="people-title">Student researchers at the centre.</h2>
          <p>
            The first prototype foregrounds students because an academic AI lab
            should make its early-career researchers visible and easy to contact.
          </p>
        </div>
        <div className="people-grid">
          {people.map((person) => (
            <article
              className="person-card"
              id={`people-${person.id}`}
              key={person.id}
            >
              <img
                src={profileImages[person.imageKey]}
                alt={`${person.name}, ${person.role}`}
              />
              <div className="person-body">
                <p className="card-eyebrow">{person.role}</p>
                <h3>{person.name}</h3>
                <p>{person.focus}</p>
                <div className="inline-links">
                  {person.links.map((link) => (
                    <a key={link.href} href={link.href}>
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="section-band blog-section"
        id="blog"
        aria-labelledby="blog-title"
      >
        <div className="section-header">
          <p className="eyebrow">Blog</p>
          <h2 id="blog-title">Lab notes, field reports, and research previews.</h2>
          <p>
            Writing should feel like a live research practice, not a marketing
            feed. Each post has a category, date, and clear reason to read.
          </p>
        </div>
        <div className="post-list">
          {blogPosts.map((post) => (
            <article className="post-row" id={post.href.slice(1)} key={post.href}>
              <div className="post-meta">
                <span>{post.category}</span>
                <time dateTime={post.isoDate}>{post.date}</time>
              </div>
              <div>
                <h3>
                  <a href={post.href}>{post.title}</a>
                </h3>
                <p>{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        className="section-band publications-section"
        id="publications"
        aria-labelledby="publications-title"
      >
        <div className="section-header">
          <p className="eyebrow">Publications</p>
          <h2 id="publications-title">A publication index designed for scanning.</h2>
          <p>
            Dense metadata, short summaries, and persistent links make the
            research archive more useful than a decorative news grid.
          </p>
        </div>
        <div className="publication-list">
          {publications.map((publication) => (
            <article className="publication-row" key={publication.title}>
              <div className="publication-date">
                <span>{publication.year}</span>
                <small>{publication.venue}</small>
              </div>
              <div className="publication-main">
                <h3>{publication.title}</h3>
                <p className="authors">{publication.authors}</p>
                <p>{publication.summary}</p>
                <div className="inline-links">
                  {publication.links.map((link) => (
                    <a key={link.href} href={link.href}>
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="site-footer" id="contact">
        <div>
          <p className="eyebrow">BOLD</p>
          <h2>{siteMeta.strapline}</h2>
        </div>
        <a className="button button-primary" href="mailto:hello@boldlab.uk">
          hello@boldlab.uk
        </a>
      </footer>
    </main>
  )
}

export default App
