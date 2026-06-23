import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { SiteFooter } from '../src/ui/layout/SiteFooter'

const landingFooter = renderToStaticMarkup(
  createElement(SiteFooter, { isBrandLinkEnabled: false }),
)

assert.match(landingFooter, /<span class="footer-brand">/)
assert.match(
  landingFooter,
  /src="\/bold_full_vector_logo_white_no_background\.svg"/,
)
assert.doesNotMatch(landingFooter, /<a class="footer-brand" href="\/">/)
assert.doesNotMatch(landingFooter, /contact@example\.ac\.uk/)
assert.doesNotMatch(landingFooter, /mailto:contact@example\.ac\.uk/)
assert.match(
  landingFooter,
  /href="https:\/\/www\.linkedin\.com\/company\/british-open-ended-learning-discovery-lab"/,
)
assert.match(landingFooter, /href="https:\/\/x\.com\/bold_lab_ai"/)
assert.doesNotMatch(landingFooter, /href="https:\/\/github\.com"/)
assert.match(landingFooter, /data-social-link-key="linkedin"/)
assert.match(landingFooter, /data-social-link-key="twitter"/)
assert.doesNotMatch(landingFooter, /data-social-link-key="github"/)
assert.match(
  landingFooter,
  /Supported by funding from the Engineering and Physical Sciences Research Council \(EPSRC\)\./,
)

const linkedFooter = renderToStaticMarkup(
  createElement(SiteFooter, { isBrandLinkEnabled: true }),
)

assert.match(linkedFooter, /<a class="footer-brand" href="\/">/)
assert.match(
  linkedFooter,
  /src="\/bold_full_vector_logo_white_no_background\.svg"/,
)
