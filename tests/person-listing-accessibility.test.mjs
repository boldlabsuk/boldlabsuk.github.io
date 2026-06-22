import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getPersonPrimaryLinkName,
  getPersonSocialLinkItems,
} from '../src/ui/cards/socialLinkItems.ts'

test('Person Listing compact links expose destination and Person names', () => {
  const links = getPersonSocialLinkItems({
    personName: 'Accessible Links',
    links: {
      website: 'https://example.ac.uk/accessible-links',
      googleScholar: 'https://scholar.google.com/accessible-links',
      email: 'mailto:accessible.links@example.ac.uk',
    },
  })

  assert.deepEqual(
    links.map((link) => link.accessibleName),
    [
      'Website for Accessible Links',
      'Google Scholar for Accessible Links',
      'Email for Accessible Links',
    ],
  )
})

test('Person Listing Primary Person Link names distinguish linked and plain listings', () => {
  assert.equal(
    getPersonPrimaryLinkName({
      personName: 'Linked Person',
      primaryPersonLink: 'https://example.ac.uk/linked-person',
    }),
    'Visit Linked Person primary profile',
  )

  assert.equal(
    getPersonPrimaryLinkName({
      personName: 'Plain Person',
      primaryPersonLink: null,
    }),
    null,
  )
})
