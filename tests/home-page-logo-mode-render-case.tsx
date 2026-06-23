import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { HomePage } from '../src/features/home/HomePage'

const homePage = renderToStaticMarkup(createElement(HomePage))

assert.match(homePage, /class="home-hero-logo"/)
assert.match(homePage, /src="\/bold_full_vector_logo\.svg"/)
