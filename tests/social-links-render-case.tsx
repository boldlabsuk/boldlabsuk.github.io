import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { SocialLinks } from '../src/ui/cards/SocialLinks'

const fullLinks = renderToStaticMarkup(
  createElement(SocialLinks, {
    personName: 'Labelled Person',
    links: {
      website: 'https://example.ac.uk/labelled-person',
      googleScholar: 'https://scholar.google.com/labelled-person',
    },
  }),
)

assert.match(fullLinks, />Website</)
assert.match(fullLinks, />Google Scholar</)

const compactLinks = renderToStaticMarkup(
  createElement(SocialLinks, {
    personName: 'Icon Person',
    compact: true,
    links: {
      website: 'https://example.ac.uk/icon-person',
    },
  }),
)

assert.doesNotMatch(compactLinks, />Site</)
assert.match(compactLinks, /aria-label="Website for Icon Person"/)
