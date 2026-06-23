import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { HomePage } from '../features/home/HomePage'
import { homeLogoMode } from '../features/home/homeLogoMode'
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
  const headerLogoRef = useRef<HTMLImageElement | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isHomeHeroLogoVisible, setIsHomeHeroLogoVisible] =
    useState(isHomeRoute)
  const [isHomeLogoAnimationComplete, setIsHomeLogoAnimationComplete] =
    useState(false)

  useEffect(() => {
    setDocumentMeta(getRouteMeta(route))
  }, [route])

  const handleHomeLogoAnimationCompleteChange = useCallback(
    (isComplete: boolean) => {
      setIsHomeLogoAnimationComplete(isComplete)
    },
    [],
  )

  const handleHomeHeroLogoVisibilityChange = useCallback(
    (isVisible: boolean) => {
      setIsHomeHeroLogoVisible(isVisible)
    },
    [],
  )

  const showBrandLogo =
    !isHomeRoute ||
    (homeLogoMode === 'scroll-animation'
      ? isHomeLogoAnimationComplete
      : !isHomeHeroLogoVisible)

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteHeader
        activeSection={getActiveSection(route)}
        brandLogoRef={headerLogoRef}
        showBrandLogo={showBrandLogo}
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen((open) => !open)}
      />
      <main id="main-content">
        {route.name === 'home' && (
          <HomePage
            headerLogoRef={headerLogoRef}
            logoMode={homeLogoMode}
            onHeroLogoVisibilityChange={handleHomeHeroLogoVisibilityChange}
            onLogoAnimationCompleteChange={
              handleHomeLogoAnimationCompleteChange
            }
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
