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
