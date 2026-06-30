import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  expressionOfInterestFormConfig,
  getExpressionOfInterestEmbedUrl,
  opportunityRoutes,
} from '../src/content'
import { OpportunitiesPage } from '../src/features/opportunities/OpportunitiesPage'

const opportunitiesIndex = renderToStaticMarkup(
  createElement(OpportunitiesPage),
)
const selectedRoute = opportunityRoutes.find(
  (route) => route.slug === 'research-engineers',
)

assert.ok(selectedRoute)

const selectedOpportunitiesIndex = renderToStaticMarkup(
  createElement(OpportunitiesPage, {
    initialSelectedRouteSlug: selectedRoute.slug,
  }),
)
const fallbackOpportunitiesIndex = renderToStaticMarkup(
  createElement(OpportunitiesPage, {
    formConfig: null,
    initialSelectedRouteSlug: selectedRoute.slug,
  }),
)

assert.match(
  opportunitiesIndex,
  /<h1>Interested in joining, visiting, or collaborating with BOLD\?<\/h1>/,
)
assert.doesNotMatch(opportunitiesIndex, />Opportunities<\/p>/)
assert.doesNotMatch(
  opportunitiesIndex,
  /BOLD reviews serious Expressions of Interest/,
)

for (const route of opportunityRoutes) {
  const renderedTitle = escapeHtml(route.title)
  const renderedHref = '#express-interest'
  const renderedAction = escapeHtml(route.primaryActionLabel)

  assert.ok(route.location)
  assert.ok(route.timing)
  assert.ok(route.formalApplicationPath)

  assert.match(
    opportunitiesIndex,
    new RegExp(`>${escapeRegExp(renderedTitle)}<`),
  )
  assert.match(
    opportunitiesIndex,
    new RegExp(escapeRegExp(escapeHtml(route.shortSummary))),
  )
  assert.match(
    opportunitiesIndex,
    new RegExp(
      `href="${renderedHref}"[^>]*>${escapeRegExp(renderedAction)}</a>`,
    ),
  )
  assert.doesNotMatch(
    opportunitiesIndex,
    new RegExp(`>${escapeRegExp(route.status)}<`),
  )
  assert.doesNotMatch(
    opportunitiesIndex,
    new RegExp(escapeRegExp(escapeHtml(route.location))),
  )
  assert.doesNotMatch(
    opportunitiesIndex,
    new RegExp(escapeRegExp(escapeHtml(route.timing))),
  )
  assert.doesNotMatch(
    opportunitiesIndex,
    new RegExp(escapeRegExp(escapeHtml(route.formalApplicationPath))),
  )
  assert.match(
    opportunitiesIndex,
    new RegExp(`aria-label="Apply for ${escapeRegExp(renderedTitle)}"`),
  )
  assert.doesNotMatch(
    opportunitiesIndex,
    new RegExp(escapeRegExp(escapeHtml(route.whoThisIsFor[0]))),
  )
}

assert.doesNotMatch(opportunitiesIndex, /this Opportunities page/)
assert.match(opportunitiesIndex, /id="express-interest"/)
assert.match(opportunitiesIndex, /aria-label="Expression of Interest form"/)
assert.match(opportunitiesIndex, /aria-label="Select a role"/)
assert.doesNotMatch(opportunitiesIndex, />Opportunity Route<\/span>/)
assert.doesNotMatch(opportunitiesIndex, /Select an Opportunity Route/)
assert.doesNotMatch(
  opportunitiesIndex,
  /<h2 id="express-interest-heading">Select a role<\/h2>/,
)
assert.doesNotMatch(
  opportunitiesIndex,
  /Changing route resets the embedded form/,
)
assert.doesNotMatch(opportunitiesIndex, /stable anchor/)
assert.doesNotMatch(opportunitiesIndex, /\/opportunities\/phd-students/)
assert.doesNotMatch(opportunitiesIndex, /<iframe/)
assert.doesNotMatch(opportunitiesIndex, />Apply now</)
assert.equal(
  opportunitiesIndex.match(/>Apply<\/a>/g)?.length ?? 0,
  opportunityRoutes.length,
)

assert.match(selectedOpportunitiesIndex, />Research Engineers</)
assert.match(
  selectedOpportunitiesIndex,
  /For engineers who want technical systems work/,
)
assert.match(
  selectedOpportunitiesIndex,
  /Use the Expression of Interest to share/,
)
assert.match(selectedOpportunitiesIndex, /ML systems, research infrastructure/)
assert.match(
  selectedOpportunitiesIndex,
  new RegExp(
    `<div class="selected-route-guidance"><h3>${escapeRegExp(escapeHtml(selectedRoute.title))}</h3>` +
      `<p>${escapeRegExp(escapeHtml(selectedRoute.positioning))}</p>` +
      `<p>${escapeRegExp(escapeHtml(selectedRoute.howThisWorks))}</p>` +
      `<p>${escapeRegExp(escapeHtml(selectedRoute.formPrompt))}</p></div>`,
  ),
)
assert.doesNotMatch(
  selectedOpportunitiesIndex,
  /Changing route resets the embedded form/,
)
assert.match(
  selectedOpportunitiesIndex,
  new RegExp(
    escapeRegExp(
      escapeHtml(
        getExpressionOfInterestEmbedUrl(
          selectedRoute,
          expressionOfInterestFormConfig,
        ) ?? '',
      ),
    ),
  ),
)
assert.match(selectedOpportunitiesIndex, /dynamicHeight=1/)

assert.match(fallbackOpportunitiesIndex, /Form coming soon/)
assert.match(fallbackOpportunitiesIndex, /embedded Expression of Interest form/)
assert.doesNotMatch(fallbackOpportunitiesIndex, /<iframe/)

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escapeHtml(value: string) {
  return value.replace(/'/g, '&#x27;')
}
