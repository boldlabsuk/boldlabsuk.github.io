import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { opportunityRoutes } from '../src/content'
import { OpportunitiesPage } from '../src/features/opportunities/OpportunitiesPage'

const opportunitiesIndex = renderToStaticMarkup(createElement(OpportunitiesPage))

for (const route of opportunityRoutes) {
  const renderedTitle = escapeHtml(route.title)
  const renderedHref = escapeHtml(`/opportunities/${route.slug}`)

  assert.match(opportunitiesIndex, new RegExp(`>${escapeRegExp(renderedTitle)}<`))
  assert.match(opportunitiesIndex, new RegExp(`href="${renderedHref}"`))
  assert.match(opportunitiesIndex, new RegExp(`>${escapeRegExp(route.status)}<`))
  assert.match(opportunitiesIndex, new RegExp(escapeRegExp(escapeHtml(route.location ?? ''))))
  assert.match(opportunitiesIndex, new RegExp(escapeRegExp(escapeHtml(route.timing ?? ''))))
  assert.match(
    opportunitiesIndex,
    new RegExp(
      `aria-label="Express interest in ${escapeRegExp(renderedTitle)}"`,
    ),
  )
  assert.doesNotMatch(
    opportunitiesIndex,
    new RegExp(escapeRegExp(escapeHtml(route.whoThisIsFor[0]))),
  )
}

assert.match(opportunitiesIndex, /dedicated Expression of Interest page/)
assert.doesNotMatch(opportunitiesIndex, /stable anchor/)
assert.doesNotMatch(opportunitiesIndex, />Apply now</)

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escapeHtml(value: string) {
  return value.replace(/'/g, '&#x27;')
}
