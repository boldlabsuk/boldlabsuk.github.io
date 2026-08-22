import assert from 'node:assert/strict'
import test from 'node:test'

import {
  expressionOfInterestFormConfig,
  getExpressionOfInterestEmbedUrl,
  homepageContent,
  involvementRoutes,
  navigation,
  newsPosts,
  opportunities,
  opportunityRoutes,
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

test('BOLD presents the v2 lab information architecture', () => {
  assert.equal(siteMeta.name, 'BOLD Lab')
  assert.match(siteMeta.description, /focused, critical-mass AI research lab/)
  assert.match(
    siteMeta.fundingAcknowledgement,
    /Engineering and Physical Sciences Research Council \(EPSRC\)/,
  )

  assert.deepEqual(
    navigation.map((item) => item.label),
    ['Our People', 'Opportunities'],
  )

  assert.deepEqual(
    navigation.map((item) => item.href),
    ['/people', '/opportunities'],
  )
})

test('homepage presents the supervisor brief in document order', () => {
  assert.equal(homepageContent.hero.headline, 'Building the next AI paradigm.')
  assert.equal(
    homepageContent.hero.lede,
    'A world-leading academic lab catalyzing open frontier AI research, uniting top machine-learning groups at Oxford, UCL, and Imperial under one ambitious vision.',
  )
  assert.deepEqual(
    homepageContent.researchPillars.map((pillar) => pillar.name),
    [
      'Beyond Backpropagation',
      'Human-Centric Learning & Discovery',
      'Embodied Learning',
    ],
  )
  assert.equal(homepageContent.team.faculty.length, 6)
  assert.equal(homepageContent.operatingModel.phases.length, 3)
  assert.deepEqual(
    homepageContent.atAGlance.map((item) => item.label),
    ['Focus', 'Home', 'Model', 'Founding labs', 'Recognition', 'Advisors'],
  )
  assert.equal('proofMetrics' in homepageContent, false)
  assert.equal('labBet' in homepageContent, false)
  assert.equal('researchDirections' in homepageContent, false)

  assert.equal(
    getRouteMeta({ name: 'home' }).description,
    homepageContent.hero.lede,
  )
})

test('homepage content exposes the approved controls and corrected document copy', () => {
  const homepageText = JSON.stringify(homepageContent)

  assert.deepEqual(
    homepageContent.hero.actions.map((action) => action.label),
    ['Join BOLD', 'Meet the team'],
  )
  assert.deepEqual(
    homepageContent.hero.actions.map((action) => action.href),
    ['/opportunities', '/people'],
  )

  assert.match(homepageText, /paradigm-breaking discoveries/)
  assert.match(homepageText, /core training component/)
  assert.match(homepageText, /Jakob Foerster/)
  assert.match(homepageText, /Reflection AI/)
  assert.match(homepageText, /Phase 3: Deep Mission Execution/)
  assert.match(homepageText, /Europe’s AI sovereignty/)
  assert.ok(!homepageText.includes('[a]'))
  assert.ok(!homepageText.includes('[b]'))
  assert.ok(!homepageText.includes('coretraining'))
  assert.ok(!homepageText.includes('Jakob Forester'))
  assert.ok(!homepageText.includes('Reflective'))
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

  assert.ok(
    people.every((person) => person.slug && person.researchAreas.length),
  )
  assert.ok(newsPosts.every((post) => /^\d{4}-\d{2}-\d{2}$/.test(post.date)))
  assert.ok(papers.every((paper) => paper.id && paper.links))
  assert.ok(involvementRoutes.every((route) => route.href === '/opportunities'))
})

test('launch routes exclude news and papers while content remains available', () => {
  assert.deepEqual(parseRoute('/news'), { name: 'not-found' })
  assert.deepEqual(parseRoute('/news/bold-lab-launch'), {
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

  assert.deepEqual(
    opportunityRoutes.map((route) => route.shortSummary),
    [
      'PhD routes with BOLD-aligned supervision.',
      'Time-bound research visits with a BOLD host.',
      'Supervised projects where timing and fit align.',
      'ML systems and research tooling close to frontier work.',
      'Fellowship, visiting, or longer-term research relationships.',
      'Research collaborations with clear scientific fit.',
    ],
  )

  for (const route of opportunityRoutes) {
    assert.equal(route.primaryActionLabel, 'Apply')
    assert.ok(route.shortSummary)
    assert.ok(route.status)
    assert.ok(route.prefillValue)
    assert.ok(route.formalApplicationPath)
    assert.ok(route.formPrompt)
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
