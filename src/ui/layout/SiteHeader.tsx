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
