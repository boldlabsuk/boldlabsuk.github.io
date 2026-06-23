import { navigation, siteMeta } from '../../content'
import { SocialLinks } from '../cards/SocialLinks'

export function SiteFooter({
  isBrandLinkEnabled = true,
}: {
  isBrandLinkEnabled?: boolean
}) {
  const brandLogo = (
    <img
      className="brand-logo"
      src="/bold_full_vector_logo_white_no_background.svg"
      alt=""
    />
  )
  const linkedInHref = siteMeta.socialLinks.find(
    (link) => link.label === 'LinkedIn',
  )?.href
  const xHref = siteMeta.socialLinks.find((link) => link.label === 'X')?.href

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-summary">
          {isBrandLinkEnabled ? (
            <a className="footer-brand" href="/">
              {brandLogo}
            </a>
          ) : (
            <span className="footer-brand">{brandLogo}</span>
          )}
          <p>{siteMeta.description}</p>
        </div>

        <div className="footer-links" aria-label="Footer navigation">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </div>

        <div
          className="footer-links footer-social-links"
          aria-label="Professional links"
        >
          <SocialLinks
            compact
            links={{
              linkedin: linkedInHref,
              twitter: xHref,
            }}
            personName={siteMeta.name}
          />
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {siteMeta.copyrightYear} {siteMeta.name}.
        </span>
        <span>Unified university AI research institute.</span>
      </div>
    </footer>
  )
}
