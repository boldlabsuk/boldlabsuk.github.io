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
