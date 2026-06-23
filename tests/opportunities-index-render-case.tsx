import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { opportunityRoutes } from '../src/content'
import { OpportunitiesPage } from '../src/features/opportunities/OpportunitiesPage'

const opportunitiesIndex = renderToStaticMarkup(createElement(OpportunitiesPage))

assert.match(
  opportunitiesIndex,
  /<h1>Express interest in joining, visiting, working with, or collaborating with BOLD\.<\/h1>/,
)

for (const route of opportunityRoutes) {
  const renderedTitle = escapeHtml(route.title)
  const renderedHref = escapeHtml(`/opportunities#${route.slug}`)
  const renderedAction = escapeHtml(route.primaryActionLabel)

  assert.ok(route.location)
  assert.ok(route.timing)
  assert.ok(route.formalApplicationPath)

  assert.match(opportunitiesIndex, new RegExp(`>${escapeRegExp(renderedTitle)}<`))
  assert.match(opportunitiesIndex, new RegExp(escapeRegExp(escapeHtml(route.shortSummary))))
  assert.match(
    opportunitiesIndex,
    new RegExp(`href="${renderedHref}"[^>]*>${escapeRegExp(renderedAction)}</a>`),
  )
  assert.match(opportunitiesIndex, new RegExp(`>${escapeRegExp(route.status)}<`))
  assert.match(opportunitiesIndex, new RegExp(escapeRegExp(escapeHtml(route.location))))
  assert.match(opportunitiesIndex, new RegExp(escapeRegExp(escapeHtml(route.timing))))
  assert.match(
    opportunitiesIndex,
    new RegExp(escapeRegExp(escapeHtml(route.formalApplicationPath))),
  )
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

assert.match(opportunitiesIndex, /this Opportunities page/)
assert.doesNotMatch(opportunitiesIndex, /stable anchor/)
assert.doesNotMatch(opportunitiesIndex, /\/opportunities\/phd-students/)
assert.doesNotMatch(opportunitiesIndex, />Apply now</)
assert.equal(
  opportunitiesIndex.match(/>Express interest<\/a>/g)?.length ?? 0,
  opportunityRoutes.length,
)

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escapeHtml(value: string) {
  return value.replace(/'/g, '&#x27;')
}
