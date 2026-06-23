import { navigation, siteMeta } from '../../content'

export function SiteHeader({
  activeSection,
  showBrandLogo,
  isMenuOpen,
  onMenuToggle,
}: {
  activeSection: string
  showBrandLogo: boolean
  isMenuOpen: boolean
  onMenuToggle: () => void
}) {
  return (
    <header className="site-header">
      <a
        aria-hidden={showBrandLogo ? undefined : true}
        aria-label={showBrandLogo ? `${siteMeta.name} home` : undefined}
        className={showBrandLogo ? 'brand' : 'brand brand-hidden'}
        href="/"
        tabIndex={showBrandLogo ? undefined : -1}
      >
        <img className="brand-logo" src="/bold_full_vector_logo.svg" alt="" />
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
