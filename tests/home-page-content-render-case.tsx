import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { HomePage } from '../src/features/home/HomePage'

const homePage = renderToStaticMarkup(createElement(HomePage))
const renderedText = homePage
  .replace(/<[^>]+>/g, ' ')
  .replaceAll('&amp;', '&')
  .replaceAll('&#x27;', "'")
  .replaceAll('&quot;', '"')
  .replace(/\s+/g, ' ')

const orderedSectionIds = [
  'home-hero-title',
  'vision-title',
  'pillars-title',
  'team-title',
  'leaders-title',
  'operating-title',
  'glance-title',
]

let previousIndex = -1
for (const sectionId of orderedSectionIds) {
  const sectionIndex = homePage.indexOf(`id="${sectionId}"`)

  assert.ok(sectionIndex > previousIndex, `${sectionId} is out of order`)
  previousIndex = sectionIndex
}

for (const labelledSectionId of orderedSectionIds.slice(1)) {
  assert.match(homePage, new RegExp(`aria-labelledby="${labelledSectionId}"`))
}

for (const expectedCopy of [
  'Building the next AI paradigm.',
  'A world-leading academic lab catalyzing open frontier AI research',
  'The current paradigm is that scale is all you need.',
  'BOLD is racing to pioneer AI breakthroughs',
  'Three Initial Research Pillars',
  'Rethinking foundational neural network optimization.',
  'Pioneering multi-agent coordination as a core training component',
  'Developing resource-agile paradigms',
  'The Team & Track Record',
  'Jakob Foerster (Oxford)',
  'Reflection AI',
  "Backed by the Field's Leaders",
  "BOLD's scientific advisory board and endorsers",
  'How BOLD Works, and Why the UK',
  'Phase 1: Broad Exploration',
  'Phase 2: Gated Scaling',
  'Phase 3: Deep Mission Execution',
  'At a Glance',
  'Founding labs',
  'Accelerating open frontier AI research for Europe’s AI sovereignty.',
]) {
  assert.match(
    renderedText,
    new RegExp(expectedCopy.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  )
}

assert.doesNotMatch(renderedText, /Our Bets/)
assert.doesNotMatch(
  renderedText,
  /The next paradigm will not come from scale alone/,
)
assert.doesNotMatch(renderedText, /Each direction is designed to test Our Bets/)
assert.match(homePage, /class="hero-metrics"/)
assert.match(homePage, /aria-label="Lab highlights"/)
for (const expectedMetricCopy of [
  '3 Universities Oxford, UCL, and Imperial working as one lab.',
  '2 Bets Breakthroughs remain possible, and academia needs a new model.',
  '3 Research Directions A focused programme for open-ended learning and discovery.',
]) {
  assert.match(renderedText, new RegExp(expectedMetricCopy))
}

const pillarsSection = homePage.slice(
  homePage.indexOf('aria-labelledby="pillars-title"'),
  homePage.indexOf('aria-labelledby="team-title"'),
)
const pillarGraphics =
  pillarsSection.match(
    /<svg\b[^>]*class="pillar-item-icon[^>]*>[\s\S]*?<\/svg>/g,
  ) ?? []

assert.equal(pillarGraphics.length, 3)
assert.doesNotMatch(pillarsSection, /<img\b[^>]*research-pillar\.svg/)

const expectedPillarTones = [
  ['pillar-tone-dark-aqua', '#538FA1', '#E3E3E1'],
  ['pillar-tone-blue-periwinkle', '#6D89AC', '#E3E3E1'],
  ['pillar-tone-dark-violet', '#8781A9', '#E3E3E1'],
] as const

for (const [index, pillarGraphic] of pillarGraphics.entries()) {
  const [toneClass, dark, light] = expectedPillarTones[index]

  assert.match(pillarGraphic, new RegExp(`class="[^"]*${toneClass}[^"]*"`))
  assert.match(
    pillarGraphic,
    new RegExp(
      `style="[^"]*--pillar-dark:${dark};--pillar-light:${light}[^"]*"`,
    ),
  )
  assert.match(pillarGraphic, /aria-hidden="true"/)
  assert.match(pillarGraphic, /focusable="false"/)
  assert.match(
    pillarGraphic,
    /<use href="[^"]*research-pillar\.svg#research-pillar"><\/use>/,
  )
}
assert.match(
  pillarsSection,
  /<ol class="editorial-list pillar-list" role="list">/,
)
assert.doesNotMatch(pillarsSection, />0[123]</)
assert.doesNotMatch(renderedText, /\[a\]|\[b\]|coretraining|Jakob Forester/)
