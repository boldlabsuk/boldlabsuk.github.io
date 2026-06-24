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
      googleScholar: 'https://scholar.google.com/icon-person',
      linkedin: 'https://linkedin.com/in/icon-person',
      github: 'https://github.com/icon-person',
      twitter: 'https://x.com/iconperson',
      bluesky: 'https://bsky.app/profile/icon-person.bsky.social',
      email: 'mailto:icon.person@example.ac.uk',
    },
  }),
)

assert.doesNotMatch(compactLinks, />Site</)
assert.doesNotMatch(compactLinks, />Google Scholar</)
assert.match(compactLinks, /aria-label="Website for Icon Person"/)
assert.match(compactLinks, /aria-label="Google Scholar for Icon Person"/)
assert.match(compactLinks, /aria-label="LinkedIn for Icon Person"/)
assert.match(compactLinks, /aria-label="GitHub for Icon Person"/)
assert.match(compactLinks, /aria-label="X for Icon Person"/)
assert.match(compactLinks, /aria-label="Bluesky for Icon Person"/)
assert.doesNotMatch(compactLinks, /aria-label="Email for Icon Person"/)
assert.match(compactLinks, /title="Website"/)
assert.match(compactLinks, /title="Google Scholar"/)
assert.match(compactLinks, /data-social-link-key="website"/)
assert.match(compactLinks, /data-social-link-key="googleScholar"/)
assert.match(compactLinks, /data-social-link-key="linkedin"/)
assert.match(compactLinks, /data-social-link-key="github"/)
assert.match(compactLinks, /data-social-link-key="twitter"/)
assert.match(compactLinks, /data-social-link-key="bluesky"/)
assert.doesNotMatch(compactLinks, /data-social-link-key="email"/)
assert.deepEqual(
  [...compactLinks.matchAll(/data-social-link-key="([^"]+)"/g)].map(
    ([, key]) => key,
  ),
  ['website', 'googleScholar', 'twitter', 'linkedin', 'github', 'bluesky'],
)
assert.match(
  compactLinks,
  /social-link-icon social-link-icon-fontawesome social-link-icon-googleScholar/,
)
assert.match(
  compactLinks,
  /social-link-icon social-link-icon-fontawesome social-link-icon-github/,
)
assert.match(
  compactLinks,
  /social-link-icon social-link-icon-fontawesome social-link-icon-linkedin/,
)
assert.match(
  compactLinks,
  /social-link-icon social-link-icon-fontawesome social-link-icon-twitter/,
)
assert.match(
  compactLinks,
  /social-link-icon social-link-icon-fontawesome social-link-icon-bluesky/,
)
assert.match(
  compactLinks,
  /social-link-icon social-link-icon-fontawesome social-link-icon-website/,
)
assert.match(compactLinks, /data-icon="house-chimney"/)
assert.match(compactLinks, /data-icon="google-scholar"/)
assert.match(compactLinks, /data-icon="x-twitter"/)
assert.match(compactLinks, /data-icon="square-linkedin"/)
assert.match(compactLinks, /data-icon="github"/)
assert.match(compactLinks, /data-icon="bluesky"/)
assert.match(compactLinks, /href="https:\/\/example\.ac\.uk\/icon-person"/)
assert.match(compactLinks, /href="https:\/\/scholar\.google\.com\/icon-person"/)
assert.doesNotMatch(compactLinks, /href="mailto:icon\.person@example\.ac\.uk"/)
assert.match(compactLinks, /<svg/)
