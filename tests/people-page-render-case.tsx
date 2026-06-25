import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { PeoplePage } from '../src/features/people/PeoplePage'

const peoplePage = renderToStaticMarkup(createElement(PeoplePage))

assert.match(peoplePage, /aria-label="People filters"/)
assert.match(peoplePage, /role="search"/)
assert.match(peoplePage, /<option value="PhD Student">PhD Students<\/option>/)
assert.match(
  peoplePage,
  /<option value="Incoming PhD Students">Incoming PhD Students<\/option>/,
)
assert.match(
  peoplePage,
  /<option value="Masters Student">Master(?:'|&#x27;)s Students<\/option>/,
)
assert.doesNotMatch(peoplePage, /aria-label="Apply name search"/)
assert.doesNotMatch(peoplePage, /Showing \d+ of \d+ people/)
assert.doesNotMatch(peoplePage, /Reset filters/)
assert.doesNotMatch(peoplePage, /people-active-filter-pill/)
const phdSectionIndex = peoplePage.indexOf('<h2>PhD Students</h2>')
const incomingSectionIndex = peoplePage.indexOf('<h2>Incoming PhD Students</h2>')
const mastersSectionIndex = peoplePage.search(/<h2>Master(?:'|&#x27;)s Students<\/h2>/)

assert.ok(phdSectionIndex > -1)
assert.ok(incomingSectionIndex > phdSectionIndex)
assert.ok(mastersSectionIndex > incomingSectionIndex)
assert.match(peoplePage, /<p class="person-phd-start-year">2026<\/p>/)
assert.doesNotMatch(
  peoplePage,
  /20\d{2} Cohort|Unknown Cohort|Start year unknown|people-cohort/,
)
assert.match(
  peoplePage,
  /<img class="avatar avatar-standard" src="\/profile-assets\/jakob-foerster-new\.png" alt="Jakob Foerster" width="150" height="150" loading="eager" decoding="sync" fetchPriority="high"\/>/,
)
