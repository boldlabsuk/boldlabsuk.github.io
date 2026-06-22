import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import heroImage from './assets/bold-students-hero.webp'
import profileAmara from './assets/profile-amara.webp'
import profileEve from './assets/profile-eve.webp'
import profileJules from './assets/profile-jules.webp'
import profileMarcus from './assets/profile-marcus.webp'
import {
  involvementRoutes,
  navigation,
  newsPosts,
  newsTypeLabels,
  opportunities,
  opportunityTypeLabels,
  papers,
  paperTypeLabels,
  people,
  roleOrder,
  siteMeta,
} from './content'
import type {
  InvolvementRoute,
  NewsPost,
  NewsPostType,
  Opportunity,
  Paper,
  PaperType,
  Person,
} from './content'
import './App.css'

const profileImages: Record<string, string> = {
  amara: profileAmara,
  marcus: profileMarcus,
  jules: profileJules,
  eve: profileEve,
}

type Route =
  | { name: 'home' }
  | { name: 'people'; slug?: string }
  | { name: 'news'; slug?: string }
  | { name: 'papers' }
  | { name: 'opportunities' }
  | { name: 'not-found' }

type Meta = {
  title: string
  description: string
}

const sortedNews = [...newsPosts].sort((a, b) => b.date.localeCompare(a.date))
const sortedPapers = [...papers].sort((a, b) => {
  if (a.year !== b.year) {
    return b.year - a.year
  }

  return (b.date ?? '').localeCompare(a.date ?? '')
})

function App() {
  const route = useMemo(() => parseRoute(window.location.pathname), [])
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    setDocumentMeta(getRouteMeta(route))
  }, [route])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteHeader
        activeSection={getActiveSection(route)}
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen((open) => !open)}
      />
      <main id="main-content">
        {route.name === 'home' && <HomePage />}
        {route.name === 'people' && !route.slug && <PeoplePage />}
        {route.name === 'people' && route.slug && (
          <PersonDetailPage slug={route.slug} />
        )}
        {route.name === 'news' && !route.slug && <NewsPage />}
        {route.name === 'news' && route.slug && <NewsPostPage slug={route.slug} />}
        {route.name === 'papers' && <PapersPage />}
        {route.name === 'opportunities' && <OpportunitiesPage />}
        {route.name === 'not-found' && <NotFoundPage />}
      </main>
      <SiteFooter />
    </div>
  )
}

function parseRoute(pathname: string): Route {
  const path = pathname.replace(/\/+$/, '') || '/'
  const segments = path.split('/').filter(Boolean)

  if (path === '/') {
    return { name: 'home' }
  }

  if (segments[0] === 'people') {
    return { name: 'people', slug: segments[1] }
  }

  if (segments[0] === 'news') {
    return { name: 'news', slug: segments[1] }
  }

  if (segments.length === 1 && segments[0] === 'papers') {
    return { name: 'papers' }
  }

  if (segments.length === 1 && segments[0] === 'opportunities') {
    return { name: 'opportunities' }
  }

  return { name: 'not-found' }
}

function getActiveSection(route: Route) {
  if (route.name === 'home' || route.name === 'not-found') {
    return '/'
  }

  return `/${route.name}`
}

function getRouteMeta(route: Route): Meta {
  if (route.name === 'people' && route.slug) {
    const person = people.find((item) => item.slug === route.slug)

    return person
      ? {
          title: `${person.name} | ${siteMeta.name}`,
          description: `${person.role}. ${person.bio}`,
        }
      : {
          title: `Person Not Found | ${siteMeta.name}`,
          description: 'The requested person profile could not be found.',
        }
  }

  if (route.name === 'news' && route.slug) {
    const post = newsPosts.find((item) => item.slug === route.slug)

    return post
      ? {
          title: `${post.title} | ${siteMeta.name}`,
          description: post.excerpt,
        }
      : {
          title: `News Post Not Found | ${siteMeta.name}`,
          description: 'The requested news post could not be found.',
        }
  }

  const routeMeta: Record<Route['name'], Meta> = {
    home: {
      title: `Home | ${siteMeta.name}`,
      description: siteMeta.description,
    },
    people: {
      title: `Our People | ${siteMeta.name}`,
      description:
        'Meet the researchers, engineers, students, fellows, and collaborators building the institute.',
    },
    news: {
      title: `News | ${siteMeta.name}`,
      description:
        'Read the latest articles, announcements, research updates, and stories from the institute.',
    },
    papers: {
      title: `Papers | ${siteMeta.name}`,
      description:
        'Explore publications and research outputs from across the institute.',
    },
    opportunities: {
      title: `Opportunities | ${siteMeta.name}`,
      description: 'Join, visit, collaborate, or work with the institute.',
    },
    'not-found': {
      title: `Page Not Found | ${siteMeta.name}`,
      description: 'The requested page could not be found.',
    },
  }

  return routeMeta[route.name]
}

function setDocumentMeta(meta: Meta) {
  document.title = meta.title
  setMetaTag('description', meta.description)
  setMetaProperty('og:title', meta.title)
  setMetaProperty('og:description', meta.description)
  setMetaProperty('og:type', 'website')
}

function setMetaTag(name: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)

  if (!tag) {
    tag = document.createElement('meta')
    tag.name = name
    document.head.append(tag)
  }

  tag.content = content
}

function setMetaProperty(property: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(
    `meta[property="${property}"]`,
  )

  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('property', property)
    document.head.append(tag)
  }

  tag.content = content
}

function SiteHeader({
  activeSection,
  isMenuOpen,
  onMenuToggle,
}: {
  activeSection: string
  isMenuOpen: boolean
  onMenuToggle: () => void
}) {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label={`${siteMeta.name} home`}>
        <span className="brand-mark" aria-hidden="true">
          B
        </span>
        <span className="brand-text">
          <strong>{siteMeta.shortName}</strong>
          <small>AI Institute</small>
        </span>
      </a>

      <button
        className="menu-toggle"
        type="button"
        aria-controls="primary-navigation"
        aria-expanded={isMenuOpen}
        aria-label="Toggle navigation menu"
        onClick={onMenuToggle}
      >
        <span />
        <span />
        <span />
      </button>

      <nav
        className={isMenuOpen ? 'nav-links nav-links-open' : 'nav-links'}
        id="primary-navigation"
        aria-label="Primary navigation"
      >
        {navigation.map((item) => (
          <a
            aria-current={activeSection === item.href ? 'page' : undefined}
            key={item.href}
            href={item.href}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-summary">
          <a className="footer-brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              B
            </span>
            <span>{siteMeta.name}</span>
          </a>
          <p>{siteMeta.description}</p>
          <a href={`mailto:${siteMeta.contactEmail}`}>{siteMeta.contactEmail}</a>
        </div>

        <div className="footer-links" aria-label="Footer navigation">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </div>

        <div className="footer-links" aria-label="Professional links">
          {siteMeta.socialLinks.map((link) => (
            <ExternalLink href={link.href} key={link.label}>
              {link.label}
            </ExternalLink>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          Copyright {siteMeta.copyrightYear} {siteMeta.name}.
        </span>
        <span>Unified university AI research institute.</span>
      </div>
    </footer>
  )
}

function HomePage() {
  const featuredNews = sortedNews.filter((post) => post.featured).slice(0, 3)
  const featuredPapers = sortedPapers
    .filter((paper) => paper.featured)
    .slice(0, 3)

  return (
    <>
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero-copy">
          <p className="eyebrow">{siteMeta.expandedName}</p>
          <h1 id="home-hero-title">{siteMeta.missionPhrase}</h1>
          <p className="hero-lede">{siteMeta.mission}</p>
          <div className="hero-actions" aria-label="Primary actions">
            <a className="button button-primary" href="/papers">
              Explore Our Research
            </a>
            <a className="button button-secondary" href="/people">
              Meet Our People
            </a>
            <a className="button button-ghost" href="/news">
              Latest News
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
          description="The site is organised around the people, publications, stories, and opportunities that make the research programme legible."
        />
        <div className="feature-card-grid four-up">
          <FeatureCard
            href="/people"
            kicker="Directory"
            title="Our People"
            description="Meet the researchers, engineers, students, and fellows building the institute."
            variant="teal"
          />
          <FeatureCard
            href="/news"
            kicker="Updates"
            title="Latest News"
            description="Read updates, announcements, articles, and research stories."
            variant="blue"
          />
          <FeatureCard
            href="/papers"
            kicker="Research"
            title="Papers"
            description="Explore publications and research outputs from across the lab."
            variant="amber"
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

      <section className="section-band">
        <SectionHeader
          eyebrow="Featured News"
          title="Announcements, articles, and research stories."
          description="A concise view of the institute's most important public updates."
          cta={{ label: 'View all news', href: '/news' }}
        />
        <div className="article-grid">
          {featuredNews.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section className="section-band muted-band">
        <SectionHeader
          eyebrow="Featured Papers"
          title="Selected research outputs."
          description="Recent papers and technical reports from across the institute."
          cta={{ label: 'View all papers', href: '/papers' }}
        />
        <div className="paper-card-grid">
          {featuredPapers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
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

function PeoplePage() {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('All')
  const [area, setArea] = useState('All')
  const [affiliation, setAffiliation] = useState('All')

  const groupOptions = roleOrder.filter((role) =>
    people.some((person) => person.group === role),
  )
  const areaOptions = unique(people.flatMap((person) => person.researchAreas))
  const affiliationOptions = unique(
    people.flatMap((person) => (person.affiliation ? [person.affiliation] : [])),
  )

  const filteredPeople = people
    .filter((person) => {
      const matchesQuery = person.name
        .toLowerCase()
        .includes(query.trim().toLowerCase())
      const matchesGroup = group === 'All' || person.group === group
      const matchesArea =
        area === 'All' || person.researchAreas.some((item) => item === area)
      const matchesAffiliation =
        affiliation === 'All' || person.affiliation === affiliation

      return matchesQuery && matchesGroup && matchesArea && matchesAffiliation
    })
    .sort(comparePeople)

  return (
    <>
      <PageHero
        eyebrow="Our People"
        title="Our People"
        description="Meet the researchers, engineers, students, fellows, and collaborators building the institute."
      />

      <section className="section-band page-content">
        <div className="filter-panel" aria-label="People filters">
          <SearchInput
            id="people-search"
            label="Search by name"
            value={query}
            onChange={setQuery}
            placeholder="Search people"
          />
          <SelectFilter
            id="people-group"
            label="Role/group"
            value={group}
            options={['All', ...groupOptions]}
            onChange={setGroup}
          />
          <SelectFilter
            id="people-area"
            label="Research area"
            value={area}
            options={['All', ...areaOptions]}
            onChange={setArea}
          />
          <SelectFilter
            id="people-affiliation"
            label="Affiliation"
            value={affiliation}
            options={['All', ...affiliationOptions]}
            onChange={setAffiliation}
          />
          <button
            className="button button-filter-reset"
            type="button"
            onClick={() => {
              setQuery('')
              setGroup('All')
              setArea('All')
              setAffiliation('All')
            }}
          >
            Reset filters
          </button>
        </div>

        <div className="result-count" aria-live="polite">
          Showing {filteredPeople.length} of {people.length} people
        </div>

        {filteredPeople.length > 0 ? (
          <div className="people-grid">
            {filteredPeople.map((person) => (
              <PersonCard key={person.slug} person={person} />
            ))}
          </div>
        ) : (
          <EmptyState message="No people match the selected filters." />
        )}
      </section>
    </>
  )
}

function PersonDetailPage({ slug }: { slug: string }) {
  const person = people.find((item) => item.slug === slug)

  if (!person) {
    return <NotFoundPage />
  }

  const authoredPapers = sortedPapers.filter((paper) =>
    paper.authorIds?.includes(person.slug),
  )
  const authoredPosts = sortedNews.filter((post) =>
    post.authorIds?.includes(person.slug),
  )

  return (
    <>
      <PageHero
        eyebrow={person.group}
        title={person.name}
        description={`${person.role}${person.affiliation ? `, ${person.affiliation}` : ''}`}
      />
      <section className="section-band detail-layout">
        <aside className="profile-panel">
          <Avatar person={person} size="large" />
          <SocialLinks links={person.links} />
        </aside>
        <div className="detail-main">
          <p className="detail-lede">{person.bio}</p>
          <TagList tags={person.researchAreas} />

          {authoredPapers.length > 0 && (
            <section className="detail-subsection" aria-labelledby="person-papers">
              <h2 id="person-papers">Associated Papers</h2>
              <div className="publication-list compact">
                {authoredPapers.map((paper) => (
                  <PaperItem key={paper.id} paper={paper} />
                ))}
              </div>
            </section>
          )}

          {authoredPosts.length > 0 && (
            <section className="detail-subsection" aria-labelledby="person-news">
              <h2 id="person-news">Associated News</h2>
              <div className="article-grid two-up">
                {authoredPosts.map((post) => (
                  <ArticleCard key={post.slug} post={post} compact />
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </>
  )
}

function NewsPage() {
  const [type, setType] = useState<NewsPostType | 'all'>('all')
  const [query, setQuery] = useState('')

  const featuredPosts = sortedNews.filter((post) => post.featured).slice(0, 3)
  const archivePosts = sortedNews.filter((post) => {
    const normalizedQuery = query.trim().toLowerCase()
    const matchesType = type === 'all' || post.type === type
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [post.title, post.excerpt, ...post.tags]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)

    return matchesType && matchesQuery
  })

  return (
    <>
      <PageHero
        eyebrow="News"
        title="News"
        description="Read the latest articles, announcements, research updates, and stories from the institute."
      />

      <section className="section-band page-content">
        <SectionHeader
          eyebrow="Featured"
          title="Latest from the institute."
          description="Selected updates from the launch, research, and engineering programmes."
        />
        <div className="featured-news-layout">
          {featuredPosts.map((post, index) => (
            <ArticleCard featured={index === 0} key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section className="section-band muted-band page-content">
        <SectionHeader
          eyebrow="Archive"
          title="Browse all updates."
          description="Filter by content type or search across titles, excerpts, and tags."
        />

        <div className="filter-panel archive-filters">
          <SearchInput
            id="news-search"
            label="Search news"
            value={query}
            onChange={setQuery}
            placeholder="Search news"
          />
          <FilterBar
            label="Content type"
            options={[
              { label: 'All', value: 'all' },
              ...Object.entries(newsTypeLabels).map(([value, label]) => ({
                label,
                value,
              })),
            ]}
            value={type}
            onChange={(next) => setType(next as NewsPostType | 'all')}
          />
        </div>

        {archivePosts.length > 0 ? (
          <div className="article-grid archive-grid">
            {archivePosts.map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState message="No news posts match the selected filters." />
        )}
      </section>
    </>
  )
}

function NewsPostPage({ slug }: { slug: string }) {
  const post = newsPosts.find((item) => item.slug === slug)

  if (!post) {
    return <NotFoundPage />
  }

  const authors = getAuthors(post.authorIds)
  const relatedPosts = sortedNews
    .filter(
      (candidate) =>
        candidate.slug !== post.slug &&
        candidate.tags.some((tag) => post.tags.includes(tag)),
    )
    .slice(0, 3)

  return (
    <>
      <PageHero
        eyebrow={newsTypeLabels[post.type]}
        title={post.title}
        description={post.excerpt}
      />
      <article className="section-band article-detail">
        <header className="article-detail-header">
          <div className="article-meta-line">
            <TagPill>{newsTypeLabels[post.type]}</TagPill>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {authors.length > 0 && <span>{authors.join(', ')}</span>}
          </div>
          <TagList tags={post.tags} />
        </header>

        {post.socialEmbedUrl && (
          <div className="social-embed">
            <span>Social post</span>
            <p>
              This announcement is available as an external public social post.
            </p>
            <ExternalLink href={post.socialEmbedUrl}>Open social post</ExternalLink>
          </div>
        )}

        {post.content ? (
          <div className="article-body">
            {post.content.split('\n\n').map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <div className="article-body">
            <p>{post.excerpt}</p>
          </div>
        )}

        {post.externalUrl && (
          <a
            className="button button-primary"
            href={post.externalUrl}
            rel="noreferrer"
            target="_blank"
          >
            Read external article
          </a>
        )}
      </article>

      {relatedPosts.length > 0 && (
        <section className="section-band muted-band">
          <SectionHeader
            eyebrow="Related"
            title="More from the institute."
            description="Related posts selected by shared tags."
          />
          <div className="article-grid">
            {relatedPosts.map((relatedPost) => (
              <ArticleCard key={relatedPost.slug} post={relatedPost} compact />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

function PapersPage() {
  const [query, setQuery] = useState('')
  const [year, setYear] = useState('All')
  const [area, setArea] = useState('All')
  const [paperType, setPaperType] = useState<PaperType | 'All'>('All')
  const [venue, setVenue] = useState('All')
  const [author, setAuthor] = useState('All')

  const yearOptions = unique(sortedPapers.map((paper) => String(paper.year)))
  const areaOptions = unique(sortedPapers.flatMap((paper) => paper.researchAreas))
  const venueOptions = unique(
    sortedPapers.flatMap((paper) => (paper.venue ? [paper.venue] : [])),
  )
  const authorOptions = unique(sortedPapers.flatMap((paper) => paper.authors))
  const featuredPapers = sortedPapers
    .filter((paper) => paper.featured)
    .slice(0, 3)

  const filteredPapers = sortedPapers.filter((paper) => {
    const normalizedQuery = query.trim().toLowerCase()
    const searchableText = [
      paper.title,
      paper.authors.join(' '),
      paper.venue ?? '',
      paper.abstract ?? '',
      paper.summary ?? '',
      ...paper.researchAreas,
    ]
      .join(' ')
      .toLowerCase()
    const matchesQuery =
      normalizedQuery.length === 0 || searchableText.includes(normalizedQuery)
    const matchesYear = year === 'All' || String(paper.year) === year
    const matchesArea =
      area === 'All' || paper.researchAreas.some((item) => item === area)
    const matchesType = paperType === 'All' || paper.paperType === paperType
    const matchesVenue = venue === 'All' || paper.venue === venue
    const matchesAuthor =
      author === 'All' || paper.authors.some((item) => item === author)

    return (
      matchesQuery &&
      matchesYear &&
      matchesArea &&
      matchesType &&
      matchesVenue &&
      matchesAuthor
    )
  })

  const papersByYear = groupByYear(filteredPapers)

  return (
    <>
      <PageHero
        eyebrow="Papers"
        title="Papers"
        description="Explore publications and research outputs from across the institute."
      />

      <section className="section-band page-content">
        <SectionHeader
          eyebrow="Featured"
          title="Selected publications."
          description="Highlighted outputs from recent institute research programmes."
        />
        <div className="paper-card-grid">
          {featuredPapers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      </section>

      <section className="section-band muted-band page-content">
        <SectionHeader
          eyebrow="Publication List"
          title="Full research output archive."
          description="Search and filter by year, topic, paper type, venue, or author."
        />

        <div className="filter-panel paper-filters">
          <SearchInput
            id="paper-search"
            label="Search papers"
            value={query}
            onChange={setQuery}
            placeholder="Search papers"
          />
          <SelectFilter
            id="paper-year"
            label="Year"
            value={year}
            options={['All', ...yearOptions]}
            onChange={setYear}
          />
          <SelectFilter
            id="paper-area"
            label="Research area"
            value={area}
            options={['All', ...areaOptions]}
            onChange={setArea}
          />
          <SelectFilter
            id="paper-type"
            label="Paper type"
            value={paperType}
            options={['All', ...Object.keys(paperTypeLabels)]}
            getLabel={(option) =>
              option === 'All' ? 'All' : paperTypeLabels[option as PaperType]
            }
            onChange={(next) => setPaperType(next as PaperType | 'All')}
          />
          <SelectFilter
            id="paper-venue"
            label="Venue"
            value={venue}
            options={['All', ...venueOptions]}
            onChange={setVenue}
          />
          <SelectFilter
            id="paper-author"
            label="Author"
            value={author}
            options={['All', ...authorOptions]}
            onChange={setAuthor}
          />
          <button
            className="button button-filter-reset"
            type="button"
            onClick={() => {
              setQuery('')
              setYear('All')
              setArea('All')
              setPaperType('All')
              setVenue('All')
              setAuthor('All')
            }}
          >
            Reset filters
          </button>
        </div>

        <div className="result-count" aria-live="polite">
          Showing {filteredPapers.length} of {papers.length} papers
        </div>

        {filteredPapers.length > 0 ? (
          <div className="year-group-list">
            {Object.entries(papersByYear).map(([paperYear, yearPapers]) => (
              <section className="year-group" key={paperYear}>
                <h3>{paperYear}</h3>
                <div className="publication-list">
                  {yearPapers.map((paper) => (
                    <PaperItem key={paper.id} paper={paper} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState message="No papers match the selected filters." />
        )}
      </section>
    </>
  )
}

function OpportunitiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Opportunities"
        title="Opportunities"
        description="Join, visit, collaborate, or work with us."
        secondaryDescription="We welcome outstanding students, researchers, engineers, fellows, and collaborators who want to help shape the next generation of AI research."
      />

      <section className="section-band page-content">
        <SectionHeader
          eyebrow="Ways to Get Involved"
          title="Find the right route."
          description="Each route has a stable anchor so prospective students, visitors, engineers, fellows, and collaborators can link directly to the relevant guidance."
        />
        <div className="involvement-grid">
          {involvementRoutes.map((route) => (
            <InvolvementCard key={route.id} route={route} />
          ))}
        </div>
      </section>

      <section className="section-band muted-band page-content">
        <SectionHeader
          eyebrow="Current Open Opportunities"
          title="Advertised and rolling routes."
          description="Specific opportunities are listed here when available. Rolling expressions of interest remain welcome."
        />
        {opportunities.length > 0 ? (
          <div className="current-opportunity-list">
            {opportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        ) : (
          <EmptyState message="There are no specific advertised opportunities at the moment, but we welcome expressions of interest from exceptional students, researchers, engineers, fellows, and collaborators." />
        )}
      </section>

      <section className="section-band contact-section">
        <div>
          <p className="eyebrow">Intake Contact</p>
          <h2>Contact us about joining, visiting, or collaborating.</h2>
          <p>
            Use the intake email for general expressions of interest. Include who
            you are, which route you are interested in, short research or
            technical interests, a CV or website link, relevant papers, projects,
            or code, and proposed timing if relevant.
          </p>
        </div>
        <a className="button button-primary" href={`mailto:${siteMeta.contactEmail}`}>
          Contact us
        </a>
      </section>
    </>
  )
}

function NotFoundPage() {
  return (
    <section className="section-band not-found-page">
      <div>
        <p className="eyebrow">404</p>
        <h1>Page not found.</h1>
        <p>The page you requested does not exist on this site.</p>
        <a className="button button-primary" href="/">
          Return home
        </a>
      </div>
    </section>
  )
}

function PageHero({
  eyebrow,
  title,
  description,
  secondaryDescription,
}: {
  eyebrow: string
  title: string
  description: string
  secondaryDescription?: string
}) {
  return (
    <section className="page-hero">
      <div className="page-hero-inner">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
        {secondaryDescription && <p>{secondaryDescription}</p>}
      </div>
    </section>
  )
}

function SectionHeader({
  eyebrow,
  title,
  description,
  cta,
}: {
  eyebrow: string
  title: string
  description: string
  cta?: { label: string; href: string }
}) {
  return (
    <div className="section-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <div className="section-header-side">
        <p>{description}</p>
        {cta && (
          <a className="text-link" href={cta.href}>
            {cta.label}
          </a>
        )}
      </div>
    </div>
  )
}

function FeatureCard({
  href,
  kicker,
  title,
  description,
  variant,
}: {
  href: string
  kicker: string
  title: string
  description: string
  variant: 'teal' | 'blue' | 'amber' | 'slate'
}) {
  return (
    <a className={`feature-card feature-card-${variant}`} href={href}>
      <span>{kicker}</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </a>
  )
}

function ArticleCard({
  post,
  featured = false,
  compact = false,
}: {
  post: NewsPost
  featured?: boolean
  compact?: boolean
}) {
  const href = getNewsHref(post)
  const isExternal = isExternalUrl(href)
  const authors = getAuthors(post.authorIds)

  return (
    <article
      className={[
        'article-card',
        featured ? 'article-card-featured' : '',
        compact ? 'article-card-compact' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="card-visual" aria-hidden="true">
        <span>{newsTypeLabels[post.type]}</span>
      </div>
      <div className="card-body">
        <div className="article-card-meta">
          <TagPill>{newsTypeLabels[post.type]}</TagPill>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>
        <h3>
          <a
            href={href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noreferrer' : undefined}
          >
            {post.title}
          </a>
        </h3>
        <p>{post.excerpt}</p>
        {authors.length > 0 && <p className="byline">By {authors.join(', ')}</p>}
        <TagList tags={post.tags.slice(0, compact ? 2 : 3)} />
      </div>
    </article>
  )
}

function PaperCard({ paper }: { paper: Paper }) {
  const primaryLink = getPrimaryPaperLink(paper)

  return (
    <article className="paper-card">
      <div className="paper-card-top">
        <TagPill>{paperTypeLabels[paper.paperType]}</TagPill>
        <span>{paper.year}</span>
      </div>
      <h3>
        {primaryLink ? (
          <ExternalLink href={primaryLink}>{paper.title}</ExternalLink>
        ) : (
          paper.title
        )}
      </h3>
      <p className="authors">{paper.authors.join(', ')}</p>
      <p>{paper.summary ?? paper.abstract}</p>
      <TagList tags={paper.researchAreas.slice(0, 3)} />
      <PaperLinks paper={paper} />
    </article>
  )
}

function PaperItem({ paper }: { paper: Paper }) {
  const primaryLink = getPrimaryPaperLink(paper)

  return (
    <article className="publication-row">
      <div className="publication-date">
        <span>{paper.year}</span>
        <small>{paper.venue ?? paperTypeLabels[paper.paperType]}</small>
      </div>
      <div className="publication-main">
        <h4>
          {primaryLink ? (
            <ExternalLink href={primaryLink}>{paper.title}</ExternalLink>
          ) : (
            paper.title
          )}
        </h4>
        <p className="authors">{paper.authors.join(', ')}</p>
        {(paper.summary || paper.abstract) && (
          <p>{paper.summary ?? paper.abstract}</p>
        )}
        <div className="publication-tags">
          <TagPill>{paperTypeLabels[paper.paperType]}</TagPill>
          {paper.researchAreas.map((tag) => (
            <TagPill key={tag}>{tag}</TagPill>
          ))}
        </div>
        <PaperLinks paper={paper} />
      </div>
    </article>
  )
}

function PersonCard({ person }: { person: Person }) {
  return (
    <article className="person-card">
      <a href={`/people/${person.slug}`} aria-label={`View ${person.name}`}>
        <Avatar person={person} />
      </a>
      <div className="person-body">
        <p className="card-eyebrow">{person.group}</p>
        <h3>
          <a href={`/people/${person.slug}`}>{person.name}</a>
        </h3>
        <p className="person-role">{person.role}</p>
        {person.affiliation && (
          <p className="person-affiliation">{person.affiliation}</p>
        )}
        <p className="person-bio">{person.bio}</p>
        <TagList tags={person.researchAreas.slice(0, 3)} />
        <SocialLinks links={person.links} compact />
      </div>
    </article>
  )
}

function Avatar({ person, size = 'standard' }: { person: Person; size?: 'standard' | 'large' }) {
  const image = person.image ? profileImages[person.image] : undefined

  if (image) {
    return (
      <img
        className={`avatar avatar-${size}`}
        src={image}
        alt={`${person.name}, ${person.role}`}
      />
    )
  }

  return (
    <div
      className={`avatar avatar-placeholder avatar-${size}`}
      aria-label={`${person.name}, ${person.role}`}
      role="img"
    >
      {getInitials(person.name)}
    </div>
  )
}

function InvolvementCard({ route }: { route: InvolvementRoute }) {
  return (
    <article className="involvement-card" id={route.id}>
      <div>
        <p className="card-eyebrow">{route.shortTitle}</p>
        <h3>{route.title}</h3>
        <p>{route.summary}</p>
      </div>
      <ul>
        {route.guidance.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <a href={`mailto:${siteMeta.contactEmail}`}>Contact intake</a>
    </article>
  )
}

function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  return (
    <article className="current-opportunity-card">
      <div>
        <TagPill>{opportunityTypeLabels[opportunity.type]}</TagPill>
        <TagPill>{titleCase(opportunity.status)}</TagPill>
      </div>
      <h3>{opportunity.title}</h3>
      <p>{opportunity.summary}</p>
      <dl>
        {opportunity.location && (
          <div>
            <dt>Location</dt>
            <dd>{opportunity.location}</dd>
          </div>
        )}
        {opportunity.deadline && (
          <div>
            <dt>Deadline</dt>
            <dd>{formatDate(opportunity.deadline)}</dd>
          </div>
        )}
      </dl>
      <div className="inline-links">
        {opportunity.link && (
          <ExternalLink href={opportunity.link}>View details</ExternalLink>
        )}
        {opportunity.contactEmail && (
          <a href={`mailto:${opportunity.contactEmail}`}>Contact</a>
        )}
      </div>
    </article>
  )
}

function FilterBar({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="filter-bar" aria-label={label}>
      {options.map((option) => (
        <button
          aria-pressed={value === option.value}
          className={value === option.value ? 'filter-chip active' : 'filter-chip'}
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function SelectFilter({
  id,
  label,
  value,
  options,
  getLabel = (option) => option,
  onChange,
}: {
  id: string
  label: string
  value: string
  options: string[]
  getLabel?: (option: string) => string
  onChange: (value: string) => void
}) {
  return (
    <label className="select-filter" htmlFor={id}>
      <span>{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {getLabel(option)}
          </option>
        ))}
      </select>
    </label>
  )
}

function SearchInput({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label className="search-input" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return null
  }

  return (
    <div className="tag-list">
      {tags.map((tag) => (
        <TagPill key={tag}>{tag}</TagPill>
      ))}
    </div>
  )
}

function TagPill({ children }: { children: ReactNode }) {
  return <span className="tag-pill">{children}</span>
}

function PaperLinks({ paper }: { paper: Paper }) {
  const linkEntries: [string, string | undefined][] = [
    ['Paper', paper.links.paper],
    ['PDF', paper.links.pdf],
    ['Code', paper.links.code],
    ['Project', paper.links.project],
    ['BibTeX', paper.links.bibtex],
  ]

  return (
    <div className="inline-links">
      {linkEntries
        .filter((entry): entry is [string, string] => Boolean(entry[1]))
        .map(([label, href]) =>
          href.startsWith('@') ? (
            <span className="bibtex-chip" key={label}>
              BibTeX available
            </span>
          ) : (
            <ExternalLink href={href} key={label}>
              {label}
            </ExternalLink>
          ),
        )}
    </div>
  )
}

function SocialLinks({
  links,
  compact = false,
}: {
  links?: Person['links']
  compact?: boolean
}) {
  if (!links) {
    return null
  }

  const labels: Record<keyof NonNullable<Person['links']>, string> = {
    website: 'Site',
    googleScholar: 'Scholar',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    twitter: 'X',
    email: 'Email',
  }

  const entries = Object.entries(links).filter((entry): entry is [string, string] =>
    Boolean(entry[1]),
  )

  if (entries.length === 0) {
    return null
  }

  return (
    <div className={compact ? 'social-links social-links-compact' : 'social-links'}>
      {entries.map(([key, href]) =>
        href.startsWith('mailto:') ? (
          <a aria-label={`${labels[key as keyof typeof labels]} for profile`} href={href} key={key}>
            {labels[key as keyof typeof labels]}
          </a>
        ) : (
          <ExternalLink
            ariaLabel={`${labels[key as keyof typeof labels]} for profile`}
            href={href}
            key={key}
          >
            {labels[key as keyof typeof labels]}
          </ExternalLink>
        ),
      )}
    </div>
  )
}

function ExternalLink({
  href,
  children,
  ariaLabel,
}: {
  href: string
  children: ReactNode
  ariaLabel?: string
}) {
  return (
    <a
      aria-label={ariaLabel}
      href={href}
      rel="noreferrer"
      target={isExternalUrl(href) ? '_blank' : undefined}
    >
      {children}
    </a>
  )
}

function EmptyState({ message }: { message: string }) {
  return <p className="empty-state">{message}</p>
}

function getNewsHref(post: NewsPost) {
  if (post.externalUrl && !post.content && !post.socialEmbedUrl) {
    return post.externalUrl
  }

  return `/news/${post.slug}`
}

function getPrimaryPaperLink(paper: Paper) {
  return paper.links.paper ?? paper.links.pdf
}

function getAuthors(authorIds?: string[]) {
  if (!authorIds) {
    return []
  }

  return authorIds
    .map((id) => people.find((person) => person.slug === id)?.name)
    .filter((name): name is string => Boolean(name))
}

function unique(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

function comparePeople(a: Person, b: Person) {
  const aIndex = roleOrder.indexOf(a.group)
  const bIndex = roleOrder.indexOf(b.group)
  const normalizedA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex
  const normalizedB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex

  if (normalizedA !== normalizedB) {
    return normalizedA - normalizedB
  }

  return a.name.localeCompare(b.name)
}

function groupByYear(items: Paper[]) {
  return items.reduce<Record<string, Paper[]>>((groups, paper) => {
    const year = String(paper.year)
    groups[year] = [...(groups[year] ?? []), paper]
    return groups
  }, {})
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function isExternalUrl(href: string) {
  return href.startsWith('http://') || href.startsWith('https://')
}

function titleCase(value: string) {
  return value
    .split('-')
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ')
}

export default App
