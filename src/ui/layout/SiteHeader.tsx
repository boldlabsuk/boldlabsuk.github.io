import type { Ref } from 'react'
import { navigation, siteMeta } from '../../content'

export function SiteHeader({
  activeSection,
  brandLogoRef,
  showBrandLogo,
  isMenuOpen,
  onMenuToggle,
}: {
  activeSection: string
  brandLogoRef?: Ref<HTMLImageElement>
  showBrandLogo: boolean
  isMenuOpen: boolean
  onMenuToggle: () => void
}) {
  const brandLogo = (
    <img
      ref={brandLogoRef}
      className="brand-logo"
      src="/bold_full_vector_logo.svg"
      width="1995"
      height="788"
      loading="eager"
      decoding="sync"
      fetchPriority="high"
      alt=""
    />
  )

  return (
    <header className="site-header">
      {showBrandLogo ? (
        <a aria-label={`${siteMeta.name} home`} className="brand" href="/">
          {brandLogo}
        </a>
      ) : (
        <span aria-hidden="true" className="brand brand-hidden" tabIndex={-1}>
          {brandLogo}
        </span>
      )}

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
