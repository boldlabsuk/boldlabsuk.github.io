import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { OpportunityRoutePage } from '../src/features/opportunities/OpportunityRoutePage'

const routePage = renderToStaticMarkup(
  createElement(OpportunityRoutePage, { slug: 'research-engineers' }),
)

assert.match(routePage, />Research Engineers</)
assert.match(routePage, /ML systems, research infrastructure/)
assert.match(routePage, />Status</)
assert.match(routePage, />Rolling interest</)
assert.match(routePage, />Working mode</)
assert.match(routePage, />Formal Application Path</)
assert.match(routePage, /not a job application/)
assert.match(routePage, />Express interest</)
assert.match(routePage, /Form coming soon/)
assert.match(routePage, /embedded Expression of Interest form/)
assert.doesNotMatch(routePage, /Apply now/)
assert.doesNotMatch(routePage, /<iframe/)
