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
  primaryPersonLink: 'https://example.ac.uk/primary-linked-listing',
  image: '/profile-assets/linked-listing.webp',
  links: {
    website: 'https://example.ac.uk/linked-listing',
    email: 'mailto:linked.listing@example.ac.uk',
  },
}

const piListing: PersonListingViewModel = {
  slug: 'pi-listing',
  name: 'PI Listing',
  role: 'BOLD PI',
  piRole: 'Training Environment',
  affiliation: 'Oxford',
  peopleSection: 'Principal Investigator',
  primaryPersonLink: null,
}

const compositeAffiliationListing: PersonListingViewModel = {
  slug: 'composite-affiliation-listing',
  name: 'Composite Affiliation Listing',
  role: 'Researcher',
  affiliation: 'Google DeepMind; UCL',
  peopleSection: 'Postdoc',
  primaryPersonLink: null,
}

const noLinkCard = renderToStaticMarkup(
  createElement(PersonListing, {
    listing: noLinkListing,
  }),
)

assert.match(noLinkCard, /class="person-listing-social-slot"/)
assert.doesNotMatch(noLinkCard, /<a\b/)
assert.doesNotMatch(noLinkCard, /data-social-link-key=/)
assert.doesNotMatch(noLinkCard, /person-pi-role/)

const linkedCard = renderToStaticMarkup(
  createElement(PersonListing, {
    listing: linkedListing,
    imagePriority: 'high',
  }),
)

assert.match(linkedCard, /class="person-listing-social-slot"/)
assert.match(linkedCard, /class="social-links social-links-compact"/)
assert.match(
  linkedCard,
  /<img class="avatar avatar-standard" src="\/profile-assets\/linked-listing\.webp" alt="Linked Listing" width="150" height="150" loading="eager" decoding="sync" fetchPriority="high"\/>/,
)
assert.doesNotMatch(linkedCard, /primary-linked-listing/)
assert.match(linkedCard, /aria-label="Website for Linked Listing"/)
assert.doesNotMatch(linkedCard, /aria-label="Email for Linked Listing"/)
assert.match(linkedCard, /data-social-link-key="website"/)
assert.doesNotMatch(linkedCard, /data-social-link-key="email"/)
assert.match(linkedCard, /href="https:\/\/example\.ac\.uk\/linked-listing"/)
assert.doesNotMatch(linkedCard, /href="mailto:linked\.listing@example\.ac\.uk"/)

const piCard = renderToStaticMarkup(
  createElement(PersonListing, {
    listing: piListing,
  }),
)

assert.match(
  piCard,
  /<p class="person-pi-role">Training Environment<\/p><p class="person-affiliation">Oxford<\/p>/,
)
assert.doesNotMatch(piCard, /person-affiliation-oxford/)

const compositeAffiliationCard = renderToStaticMarkup(
  createElement(PersonListing, {
    listing: compositeAffiliationListing,
  }),
)

assert.match(
  compositeAffiliationCard,
  /<p class="person-affiliation">Google DeepMind; UCL<\/p>/,
)
