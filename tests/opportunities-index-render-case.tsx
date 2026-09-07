import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { OpportunitiesPage } from '../src/features/opportunities/OpportunitiesPage'

const approvedRoutes = [
  ['phd-students', 'PhD research'],
  ['visiting-students', 'a student visit'],
  ['masters-students', 'Master’s research'],
  ['research-engineers', 'research engineering'],
  ['collaborators', 'collaboration or affiliation'],
]
const document = renderPage().window.document
assert.equal(
  document.querySelector('h1')?.textContent,
  'Express your interest in BOLD.',
)
assert.equal(
  document.querySelector('.opportunities-index-intro p')?.textContent,
  'We may be in touch if a relevant opportunity arises.',
)
assert.equal(document.querySelectorAll('select').length, 1)
assert.equal(
  document
    .querySelector('label')
    ?.textContent?.trim()
    .startsWith('I’m interested in…'),
  true,
)
assert.equal(document.querySelector('select')?.required, true)
assert.deepEqual(
  [...document.querySelectorAll('option')].map((option) => [
    option.value,
    option.textContent,
  ]),
  [['', 'Choose an area of interest'], ...approvedRoutes],
)
assert.equal(document.querySelector('select')?.value, '')
assert.equal(document.querySelector('iframe'), null)
assert.equal(document.querySelector('.opportunity-route-index'), null)
assert.doesNotMatch(
  document.body.textContent ?? '',
  /\bapply\b|what we look for|exceptional candidates/i,
)
assertFellowsAfterForm(document)

for (const [slug, title] of approvedRoutes) {
  const selected = renderPage({ initialSelectedRouteSlug: slug }).window
    .document
  assertFellowsAfterForm(selected)
  const iframe = selected.querySelector('iframe')
  assert.ok(iframe)
  assert.equal(selected.querySelector('select')?.value, slug)
  assert.equal(iframe.title, `${title} Expression of Interest form`)
  const embedUrl = new URL(iframe.src)
  assert.equal(embedUrl.origin, 'https://tally.so')
  assert.equal(embedUrl.pathname, '/embed/A7aa0W')
  assert.equal(embedUrl.searchParams.get('route'), slug)
  assert.equal(embedUrl.searchParams.get('dynamicHeight'), '1')
}

const collaborators = renderPage({ initialSelectedRouteSlug: 'collaborators' })
  .window.document
assert.match(
  collaborators.querySelector('.selected-route-guidance')?.textContent ?? '',
  /experienced researchers seeking visits or longer-term affiliations/,
)
const fallback = renderPage({
  formConfig: null,
  initialSelectedRouteSlug: 'research-engineers',
}).window.document
assert.match(fallback.body.textContent, /Form coming soon/)
assert.equal(
  fallback.querySelector('.empty-state p')?.textContent,
  'Please check back later to express your interest in BOLD.',
)
assert.equal(fallback.querySelector('iframe'), null)
assertFellowsAfterForm(fallback)
assert.equal(
  renderPage({
    initialSelectedRouteSlug: 'fellows',
  }).window.document.querySelector('iframe'),
  null,
)

function renderPage(props = {}) {
  return new JSDOM(
    renderToStaticMarkup(createElement(OpportunitiesPage, props)),
  )
}

function assertFellowsAfterForm(page: Document) {
  const form = page.querySelector('#express-interest')
  const fellows = page.querySelector(
    'section[aria-labelledby="bold-fellows-title"]',
  )
  assert.ok(form)
  assert.ok(fellows)
  assert.equal(fellows.querySelector('h2')?.textContent, 'BOLD Fellows')
  const advertUrl = 'https://eng.ox.ac.uk/jobs/job-detail?vacancyID=187853'
  const links = page.querySelectorAll(`a[href="${advertUrl}"]`)
  assert.equal(links.length, 1)
  assert.ok(fellows.contains(links[0]))
  assert.equal(links[0]?.textContent?.trim(), 'View Oxford job advert')
  assert.equal(links[0]?.getAttribute('target'), '_blank')
  assert.equal(links[0]?.getAttribute('rel'), 'noopener noreferrer')
  assert.ok(page.defaultView)
  assert.ok(
    form.compareDocumentPosition(fellows) &
      page.defaultView.Node.DOCUMENT_POSITION_FOLLOWING,
  )
}
