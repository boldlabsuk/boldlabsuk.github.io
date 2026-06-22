import { navigation, siteMeta } from '../../content'

type BrandVariant = 'full' | 'icon'

export function SiteHeader({
  activeSection,
  brandVariant,
  isMenuOpen,
  onMenuToggle,
}: {
  activeSection: string
  brandVariant: BrandVariant
  isMenuOpen: boolean
  onMenuToggle: () => void
}) {
  const brandLogo =
    brandVariant === 'icon'
      ? {
          className: 'brand-logo brand-logo-icon',
          src: '/bold-butterfly-logo.svg',
        }
      : {
          className: 'brand-logo',
          src: '/bold_full_vector_logo.svg',
        }

  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label={`${siteMeta.name} home`}>
        <img className={brandLogo.className} src={brandLogo.src} alt="" />
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
