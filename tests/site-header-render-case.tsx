import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { SiteHeader } from '../src/ui/layout/SiteHeader'

const hiddenBrandHeader = renderToStaticMarkup(
  createElement(SiteHeader, {
    activeSection: '/',
    showBrandLogo: false,
    isMenuOpen: false,
    onMenuToggle: () => {},
  }),
)

assert.match(hiddenBrandHeader, /class="brand brand-hidden"/)
assert.match(hiddenBrandHeader, /aria-hidden="true"/)
assert.match(hiddenBrandHeader, /tabindex="-1"/)
assert.match(hiddenBrandHeader, /src="\/bold_full_vector_logo\.svg"/)
assert.doesNotMatch(hiddenBrandHeader, /favicon\.svg/)
assert.doesNotMatch(hiddenBrandHeader, /brand-logo-icon/)

const visibleBrandHeader = renderToStaticMarkup(
  createElement(SiteHeader, {
    activeSection: '/people',
    showBrandLogo: true,
    isMenuOpen: false,
    onMenuToggle: () => {},
  }),
)

assert.match(visibleBrandHeader, /class="brand"/)
assert.match(visibleBrandHeader, /aria-label="BOLD Lab home"/)
assert.match(visibleBrandHeader, /src="\/bold_full_vector_logo\.svg"/)
assert.match(visibleBrandHeader, /aria-current="page"/)
assert.doesNotMatch(visibleBrandHeader, /favicon\.svg/)
assert.doesNotMatch(visibleBrandHeader, /brand-hidden/)
