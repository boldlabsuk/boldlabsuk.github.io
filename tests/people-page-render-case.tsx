import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { PeoplePage } from '../src/features/people/PeoplePage'

const peoplePage = renderToStaticMarkup(createElement(PeoplePage))

assert.match(peoplePage, /aria-label="People filters"/)
assert.match(peoplePage, /role="search"/)
assert.doesNotMatch(peoplePage, /aria-label="Apply name search"/)
assert.doesNotMatch(peoplePage, /Showing \d+ of \d+ people/)
assert.doesNotMatch(peoplePage, /Reset filters/)
assert.doesNotMatch(peoplePage, /people-active-filter-pill/)
assert.match(
  peoplePage,
  /<img class="avatar avatar-standard" src="\/profile-assets\/jakob-foerster-new\.png" alt="Jakob Foerster" width="150" height="150" loading="eager" decoding="sync" fetchPriority="high"\/>/,
)
