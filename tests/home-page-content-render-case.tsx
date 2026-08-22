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
assert.doesNotMatch(homePage, /class="hero-metrics"/)
assert.doesNotMatch(renderedText, /\[a\]|\[b\]|coretraining|Jakob Forester/)
