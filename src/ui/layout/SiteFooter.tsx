import { navigation, siteMeta } from '../../content'
import { ExternalLink } from '../primitives/ExternalLink'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-summary">
          <a className="footer-brand" href="/">
            <img className="brand-logo" src="/bold_full_vector_logo.svg" alt="" />
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
