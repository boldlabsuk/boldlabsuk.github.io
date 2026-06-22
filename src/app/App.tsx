import { useEffect, useMemo, useState } from 'react'
import { HomePage } from '../features/home/HomePage'
import { NewsPage } from '../features/news/NewsPage'
import { NewsPostPage } from '../features/news/NewsPostPage'
import { NotFoundPage } from '../features/not-found/NotFoundPage'
import { OpportunitiesPage } from '../features/opportunities/OpportunitiesPage'
import { PapersPage } from '../features/papers/PapersPage'
import { PeoplePage } from '../features/people/PeoplePage'
import { PersonDetailPage } from '../features/people/PersonDetailPage'
import {
  getActiveSection,
  getRouteMeta,
  parseRoute,
} from '../routing/routes'
import { SiteFooter } from '../ui/layout/SiteFooter'
import { SiteHeader } from '../ui/layout/SiteHeader'
import { setDocumentMeta } from './documentMeta'
import '../styles/site.css'

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

export default App
