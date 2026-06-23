import { useCallback, useEffect, useMemo, useState } from 'react'
import { HomePage } from '../features/home/HomePage'
import { NotFoundPage } from '../features/not-found/NotFoundPage'
import { OpportunitiesPage } from '../features/opportunities/OpportunitiesPage'
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
  const isHomeRoute = route.name === 'home'
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isHomeHeroLogoVisible, setIsHomeHeroLogoVisible] =
    useState(isHomeRoute)

  useEffect(() => {
    setDocumentMeta(getRouteMeta(route))
  }, [route])

  const handleHomeHeroLogoVisibilityChange = useCallback((isVisible: boolean) => {
    setIsHomeHeroLogoVisible(isVisible)
  }, [])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteHeader
        activeSection={getActiveSection(route)}
        showBrandLogo={!isHomeRoute || !isHomeHeroLogoVisible}
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen((open) => !open)}
      />
      <main id="main-content">
        {route.name === 'home' && (
          <HomePage
            onHeroLogoVisibilityChange={handleHomeHeroLogoVisibilityChange}
          />
        )}
        {route.name === 'people' && !route.slug && <PeoplePage />}
        {route.name === 'people' && route.slug && (
          <PersonDetailPage slug={route.slug} />
        )}
        {route.name === 'opportunities' && <OpportunitiesPage />}
        {route.name === 'not-found' && <NotFoundPage />}
      </main>
      <SiteFooter isBrandLinkEnabled={!isHomeRoute} />
    </div>
  )
}

export default App
