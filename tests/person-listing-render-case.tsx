import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import type { PersonListing as PersonListingViewModel } from '../src/domain/people'
import { PersonListing } from '../src/ui/cards/PersonListing'

const noLinkListing: PersonListingViewModel = {
  slug: 'no-link-listing',
  name: 'No Link Listing',
  role: 'Researcher',
  peopleSection: 'Postdoc',
  primaryPersonLink: null,
}

const linkedListing: PersonListingViewModel = {
  slug: 'linked-listing',
  name: 'Linked Listing',
  role: 'Researcher',
  peopleSection: 'Postdoc',
  primaryPersonLink: null,
  links: {
    website: 'https://example.ac.uk/linked-listing',
    email: 'mailto:linked.listing@example.ac.uk',
  },
}

const noLinkCard = renderToStaticMarkup(
  createElement(PersonListing, {
    listing: noLinkListing,
  }),
)

assert.match(noLinkCard, /class="person-listing-social-slot"/)
assert.doesNotMatch(noLinkCard, /<a\b/)
assert.doesNotMatch(noLinkCard, /data-social-link-key=/)

const linkedCard = renderToStaticMarkup(
  createElement(PersonListing, {
    listing: linkedListing,
  }),
)

assert.match(linkedCard, /class="person-listing-social-slot"/)
assert.match(linkedCard, /class="social-links social-links-compact"/)
assert.match(linkedCard, /aria-label="Website for Linked Listing"/)
assert.match(linkedCard, /aria-label="Email for Linked Listing"/)
assert.match(linkedCard, /data-social-link-key="website"/)
assert.match(linkedCard, /data-social-link-key="email"/)
assert.match(linkedCard, /href="https:\/\/example\.ac\.uk\/linked-listing"/)
assert.match(linkedCard, /href="mailto:linked\.listing@example\.ac\.uk"/)
