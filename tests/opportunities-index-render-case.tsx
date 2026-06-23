import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { opportunityRoutes } from '../src/content'
import { OpportunitiesPage } from '../src/features/opportunities/OpportunitiesPage'

const opportunitiesIndex = renderToStaticMarkup(createElement(OpportunitiesPage))

for (const route of opportunityRoutes) {
  const renderedTitle = escapeHtml(route.title)

  assert.match(opportunitiesIndex, new RegExp(`>${escapeRegExp(renderedTitle)}<`))
  assert.match(
    opportunitiesIndex,
    new RegExp(
      `aria-label="Express interest in ${escapeRegExp(renderedTitle)}"`,
    ),
  )
}

assert.match(opportunitiesIndex, /dedicated Expression of Interest page/)
assert.doesNotMatch(opportunitiesIndex, /stable anchor/)

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escapeHtml(value: string) {
  return value.replace(/'/g, '&#x27;')
}
