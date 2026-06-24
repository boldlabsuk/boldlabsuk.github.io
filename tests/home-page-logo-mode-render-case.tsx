import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { HomePage } from '../src/features/home/HomePage'

const homePage = renderToStaticMarkup(createElement(HomePage))

assert.match(homePage, /class="home-hero-logo"/)
assert.match(homePage, /src="\/bold_full_vector_logo\.svg"/)
assert.match(homePage, /width="1995"/)
assert.match(homePage, /height="788"/)
assert.match(homePage, /loading="eager"/)
assert.match(homePage, /decoding="sync"/)
assert.match(homePage, /fetchPriority="high"/)

assert.match(homePage, /class="home-hero-image"/)
assert.match(homePage, /src="\/butterfly_swam\.png"/)
assert.match(
  homePage,
  /<img class="home-hero-image" src="\/butterfly_swam\.png" width="1086" height="1448" loading="eager" decoding="sync" fetchPriority="high" alt=""/,
)
