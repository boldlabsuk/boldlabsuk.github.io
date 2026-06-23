import assert from 'node:assert/strict'
import { createElement, createRef } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { HomePage } from '../src/features/home/HomePage'

const scrollAnimationPage = renderToStaticMarkup(
  createElement(HomePage, {
    headerLogoRef: createRef<HTMLImageElement>(),
    logoMode: 'scroll-animation',
  }),
)

assert.match(scrollAnimationPage, /class="home-logo-transition"/)
assert.match(scrollAnimationPage, /src="\/bold_full_vector_logo\.svg"/)

const legacyRevealPage = renderToStaticMarkup(
  createElement(HomePage, {
    headerLogoRef: createRef<HTMLImageElement>(),
    logoMode: 'legacy-reveal',
  }),
)

assert.doesNotMatch(legacyRevealPage, /class="home-logo-transition"/)
assert.doesNotMatch(legacyRevealPage, /home-hero-logo-hidden/)
