import { navigation, siteMeta } from '../../content'

export function SiteHeader({
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
