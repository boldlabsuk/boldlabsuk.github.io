import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { OpportunityRoutePage } from '../src/features/opportunities/OpportunityRoutePage'

const routePage = renderToStaticMarkup(
  createElement(OpportunityRoutePage, { slug: 'research-engineers' }),
)
const fallbackRoutePage = renderToStaticMarkup(
  createElement(OpportunityRoutePage, {
    slug: 'research-engineers',
    formConfig: null,
  }),
)
const studentRoutePages = [
  {
    slug: 'phd-students',
    title: 'PhD Students',
    routeSpecificPrompt: /possible supervisors or groups/,
    formalBoundary: /not a PhD application/,
  },
  {
    slug: 'visiting-students',
    title: 'Visiting Students',
    routeSpecificPrompt: /proposed visit dates and duration/,
    formalBoundary: /institutional visiting process/,
  },
  {
    slug: 'masters-students',
    title: "Master's Students",
    routeSpecificPrompt: /project window/,
    formalBoundary: /does not replace your university programme/,
  },
].map((route) => ({
  ...route,
  page: renderToStaticMarkup(
    createElement(OpportunityRoutePage, { slug: route.slug }),
  ),
}))

assert.match(routePage, />Research Engineers</)
assert.match(routePage, /ML systems, research infrastructure/)
assert.match(routePage, />Status</)
assert.match(routePage, />Rolling interest</)
assert.match(routePage, />Working mode</)
assert.match(routePage, />Formal Application Path</)
assert.match(routePage, /not a job application/)
assert.match(routePage, />Express interest</)
assert.match(routePage, /PDF CV\/resume/)
assert.match(routePage, /review Expressions of Interest periodically/)
assert.match(routePage, /<iframe/)
assert.match(routePage, /src="https:\/\/tally.so\/embed\/A7aa0W\?route=research-engineers"/)
assert.doesNotMatch(routePage, /Apply now/)

assert.match(fallbackRoutePage, /Form coming soon/)
assert.match(fallbackRoutePage, /embedded Expression of Interest form/)
assert.doesNotMatch(fallbackRoutePage, /<iframe/)

for (const route of studentRoutePages) {
  assert.match(route.page, new RegExp(`>${route.title.replace("'", '&#x27;')}<`))
  assert.match(route.page, />Expression of Interest</)
  assert.match(route.page, />Status</)
  assert.match(route.page, />Rolling interest</)
  assert.match(route.page, />Location</)
  assert.match(route.page, />Timing</)
  assert.match(route.page, />Formal Application Path</)
  assert.match(route.page, route.formalBoundary)
  assert.match(route.page, />Express interest</)
  assert.match(route.page, route.routeSpecificPrompt)
  assert.match(route.page, /PDF CV\/resume is required/)
  assert.match(route.page, /accepts PDF only/)
  assert.match(route.page, /10 MB per file/)
  assert.match(route.page, /review Expressions of Interest periodically/)
  assert.doesNotMatch(route.page, /Apply now/)
  assert.doesNotMatch(route.page, /Submit application/)
}
