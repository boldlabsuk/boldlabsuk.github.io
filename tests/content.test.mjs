import test from 'node:test'
import assert from 'node:assert/strict'

import {
  homepageContent,
  expressionOfInterestFormConfig,
  getExpressionOfInterestEmbedUrl,
  involvementRoutes,
  navigation,
  newsPosts,
  opportunityRoutes,
  opportunities,
  papers,
  people,
  siteMeta,
} from '../src/content.ts'
import { getPaperFilterOptions } from '../src/domain/papers.ts'
import { getAuthors, getPerson } from '../src/domain/people.ts'
import { getRouteMeta, parseRoute } from '../src/routing/routes.ts'

const placeholderPersonNames = [
  'Amara Singh',
  'Jules Chen',
  'Marcus Adeyemi',
  'Eve Morrison',
  'Thomas Okoro',
  'Leo Williams',
  'Nina Berg',
  'Marta Garcia',
  'Oliver Hart',
  'Samira Patel',
]

const placeholderPersonIds = [
  'amara-singh',
  'jules-chen',
  'marcus-adeyemi',
  'eve-morrison',
  'thomas-okoro',
  'leo-williams',
  'nina-berg',
  'marta-garcia',
  'oliver-hart',
  'samira-patel',
]

test('BOLD presents the v2 institute information architecture', () => {
  assert.equal(siteMeta.name, 'BOLD Institute')
  assert.match(siteMeta.description, /focused, critical-mass AI research institute/)

  assert.deepEqual(
    navigation.map((item) => item.label),
    ['Our People', 'Opportunities'],
  )

  assert.deepEqual(
    navigation.map((item) => item.href),
    ['/people', '/opportunities'],
  )
})

test('homepage presents the BOLD Institute Bet positioning and proof metrics', () => {
  assert.equal(homepageContent.hero.headline, 'Building the next AI paradigm.')
  assert.match(
    homepageContent.hero.lede,
    /Oxford, UCL, and Imperial/,
  )

  assert.deepEqual(
    homepageContent.proofMetrics.map((metric) => metric.value),
    ['3', '2', '3'],
  )

  assert.deepEqual(
    homepageContent.proofMetrics.map((metric) => metric.label),
    [
      'Universities',
      'Bets',
      'Research Directions',
    ],
  )

  assert.match(
    homepageContent.proofMetrics[1].detail,
    /Breakthroughs remain possible/,
  )

  assert.match(
    getRouteMeta({ name: 'home' }).description,
    /fundamental AI breakthroughs from Britain/,
  )
})

test('homepage content exposes the approved CTAs, Institute Bet, and Research Directions', () => {
  const homepageText = JSON.stringify(homepageContent)

  assert.deepEqual(
    homepageContent.hero.actions.map((action) => action.label),
    ['Join BOLD', 'Partner with us'],
  )
  assert.deepEqual(
    homepageContent.hero.actions.map((action) => action.href),
    ['/opportunities', '/opportunities'],
  )

  assert.equal(homepageContent.instituteBet.length, 2)
  assert.match(homepageContent.instituteBet[0].body, /breakthroughs are still possible/)
  assert.match(homepageContent.instituteBet[1].body, /focused, agile, critical-mass/)

  assert.deepEqual(
    homepageContent.researchDirections.map((direction) => direction.name),
    [
      'Beyond Backpropagation',
      'Human-Centric Learning & Discovery',
      'Embodied Learning',
    ],
  )

  assert.match(homepageText, /gradients are unavailable/)
  assert.match(homepageText, /collaborate with people/)
  assert.match(homepageText, /deployment beyond the datacentre/)
  assert.ok(!homepageText.includes('Research. Build. Transform.'))
  assert.ok(!homepageText.includes('12 research themes'))
  assert.ok(!homepageText.includes('6 routes to join'))
})

test('structured content supports people, news, papers, and opportunities', () => {
  assert.ok(people.length >= 10)
  assert.ok(newsPosts.length >= 6)
  assert.ok(papers.length >= 7)
  assert.ok(involvementRoutes.length === 6)
  assert.ok(opportunities.length >= 1)

  assert.ok(people.every((person) => person.slug && person.researchAreas.length))
  assert.ok(newsPosts.every((post) => /^\d{4}-\d{2}-\d{2}$/.test(post.date)))
  assert.ok(papers.every((paper) => paper.id && paper.links))
  assert.ok(
    involvementRoutes.every(
      (route) => route.href === '/opportunities',
    ),
  )
})

test('launch routes exclude news and papers while content remains available', () => {
  assert.deepEqual(parseRoute('/news'), { name: 'not-found' })
  assert.deepEqual(parseRoute('/news/bold-institute-launch'), {
    name: 'not-found',
  })
  assert.deepEqual(parseRoute('/papers'), { name: 'not-found' })
})

test('Opportunity Routes remain structured content while child URLs are not public routes', () => {
  const approvedRoutes = [
    ['phd-students', 'PhD Students'],
    ['visiting-students', 'Visiting Students'],
    ['masters-students', "Master's Students"],
    ['research-engineers', 'Research Engineers'],
    ['fellows', 'Fellows and Experienced Researchers'],
    ['collaborators', 'Collaborators'],
  ]

  assert.deepEqual(
    opportunityRoutes.map((route) => [route.slug, route.title]),
    approvedRoutes,
  )

  for (const route of opportunityRoutes) {
    assert.equal(route.primaryActionLabel, 'Express interest')
    assert.ok(route.shortSummary)
    assert.ok(route.status)
    assert.ok(route.prefillValue)
    assert.ok(route.formalApplicationPath)
    assert.equal('metadata' in route, false)
    assert.deepEqual(parseRoute(`/opportunities/${route.slug}`), {
      name: 'not-found',
    })
  }

  assert.deepEqual(parseRoute('/opportunities'), { name: 'opportunities' })
  assert.deepEqual(parseRoute('/opportunities/not-a-route'), {
    name: 'not-found',
  })
})

test('Opportunity Routes share one Tally form with route-specific prefill values', () => {
  assert.equal(
    expressionOfInterestFormConfig.formUrl,
    'https://tally.so/r/A7aa0W',
  )
  assert.equal(expressionOfInterestFormConfig.routeParameterName, 'route')

  assert.deepEqual(
    opportunityRoutes.map((route) =>
      getExpressionOfInterestEmbedUrl(route, expressionOfInterestFormConfig),
    ),
    [
      'https://tally.so/embed/A7aa0W?route=phd-students',
      'https://tally.so/embed/A7aa0W?route=visiting-students',
      'https://tally.so/embed/A7aa0W?route=masters-students',
      'https://tally.so/embed/A7aa0W?route=research-engineers',
      'https://tally.so/embed/A7aa0W?route=fellows',
      'https://tally.so/embed/A7aa0W?route=collaborators',
    ],
  )
})

test('Expression of Interest embed URL requires complete Tally configuration', () => {
  const route = opportunityRoutes[0]

  assert.equal(getExpressionOfInterestEmbedUrl(route, null), undefined)
  assert.equal(
    getExpressionOfInterestEmbedUrl(route, {
      formUrl: 'https://example.com/r/A7aa0W',
      routeParameterName: 'route',
    }),
    undefined,
  )
  assert.equal(
    getExpressionOfInterestEmbedUrl(route, {
      formUrl: 'https://tally.so/r/A7aa0W',
      routeParameterName: '',
    }),
    undefined,
  )
})

test('related content omits removed placeholder Person names and unmapped Person IDs', () => {
  assert.deepEqual(
    getAuthors(['tim-rocktaschel', 'amara-singh', 'missing-person']),
    ['Tim Rocktäschel'],
  )
  assert.equal(getPerson('amara-singh'), undefined)

  const publicPaperAuthorNames = [
    ...papers.flatMap((paper) => paper.authors),
    ...getPaperFilterOptions().authors,
  ]
  const relatedPersonIds = [
    ...newsPosts.flatMap((post) => post.authorIds ?? []),
    ...papers.flatMap((paper) => paper.authorIds ?? []),
  ]

  for (const placeholderName of placeholderPersonNames) {
    assert.ok(!publicPaperAuthorNames.includes(placeholderName))
  }
  for (const placeholderId of placeholderPersonIds) {
    assert.ok(!relatedPersonIds.includes(placeholderId))
  }
})
