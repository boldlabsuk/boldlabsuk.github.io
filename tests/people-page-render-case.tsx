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
assert.match(
  peoplePage,
  /<label class="select-filter" for="people-section"><span>Role<\/span>/,
)
assert.match(peoplePage, /<label class="select-filter" for="people-supervisor">/)
assert.match(peoplePage, /<option value="Jakob Foerster">Jakob Foerster<\/option>/)
const roleFilterIndex = peoplePage.indexOf('for="people-section"')
const supervisorFilterIndex = peoplePage.indexOf('for="people-supervisor"')
const researchAreaFilterIndex = peoplePage.indexOf('for="people-area"')
const affiliationFilterIndex = peoplePage.indexOf('for="people-affiliation"')

assert.ok(supervisorFilterIndex > roleFilterIndex)
assert.ok(researchAreaFilterIndex > supervisorFilterIndex)
assert.ok(affiliationFilterIndex > researchAreaFilterIndex)
assert.doesNotMatch(peoplePage, /aria-label="Apply name search"/)
assert.doesNotMatch(peoplePage, /Showing \d+ of \d+ people/)
assert.doesNotMatch(peoplePage, /Reset filters/)
assert.doesNotMatch(peoplePage, /people-active-filter-pill/)
const phdSectionIndex = peoplePage.indexOf('<h2>PhD Students</h2>')
const researchEngineersSectionIndex = peoplePage.indexOf('<h2>Research Engineers</h2>')
const incomingSectionIndex = peoplePage.indexOf('<h2>Incoming PhD Students</h2>')
const mastersSectionIndex = peoplePage.search(/<h2>Master(?:'|&#x27;)s Students<\/h2>/)

assert.ok(phdSectionIndex > -1)
assert.ok(researchEngineersSectionIndex > phdSectionIndex)
assert.ok(mastersSectionIndex > researchEngineersSectionIndex)
assert.ok(incomingSectionIndex > mastersSectionIndex)
assert.match(peoplePage, /<p class="person-phd-start-year">2026<\/p>/)
assert.doesNotMatch(
  peoplePage,
  /20\d{2} Cohort|Unknown Cohort|Start year unknown|people-cohort/,
)
assert.match(
  peoplePage,
  /<img class="avatar avatar-standard" src="\/profile-assets\/jakob-foerster-new\.png" alt="Jakob Foerster" width="150" height="150" loading="eager" decoding="sync" fetchPriority="high"\/>/,
)
