import assert from 'node:assert/strict'
import test from 'node:test'

import { getPeopleFilterOptions } from '../src/domain/people.ts'
import { allFilterValue } from '../src/domain/shared.ts'
import {
  buildPeopleDirectoryUrl,
  parsePeopleDirectoryFilters,
} from '../src/features/people/peopleFilterUrl.ts'

test('shared People Directory URL restores every filter', () => {
  const filters = parsePeopleDirectoryFilters(
    new URL(
      'https://bold-lab.ai/people/?q=%20Davide%20&section=Associate+Members&supervisor=Tim+Rockt%C3%A4schel&area=AI+Agents&affiliation=UCL',
    ),
    getPeopleFilterOptions(),
  )

  assert.deepEqual(filters, {
    query: 'Davide',
    section: 'Associate Members',
    supervisor: 'Tim Rocktäschel',
    area: 'AI Agents',
    affiliation: 'UCL',
  })
})

test('shared People Directory URL ignores stale select-filter values', () => {
  const filters = parsePeopleDirectoryFilters(
    new URL(
      'https://bold-lab.ai/people/?q=Alex&section=Former+Member&supervisor=Unknown+Person&area=Alchemy&affiliation=Atlantis',
    ),
    getPeopleFilterOptions(),
  )

  assert.deepEqual(filters, {
    query: 'Alex',
    section: allFilterValue,
    supervisor: allFilterValue,
    area: allFilterValue,
    affiliation: allFilterValue,
  })
})

test('People Directory filters produce a shareable URL without losing unrelated URL state', () => {
  const url = buildPeopleDirectoryUrl(
    new URL(
      'https://bold-lab.ai/people/?utm_source=newsletter&section=Old#people-results',
    ),
    {
      query: "Qizhen O'Connor",
      section: 'PhD Student',
      supervisor: 'Tim Rocktäschel',
      area: 'AI Agents',
      affiliation: 'UCL',
    },
  )

  assert.equal(
    url.href,
    'https://bold-lab.ai/people/?utm_source=newsletter&q=Qizhen+O%27Connor&section=PhD+Student&supervisor=Tim+Rockt%C3%A4schel&area=AI+Agents&affiliation=UCL#people-results',
  )
})

test('inactive People Directory filters are omitted from the URL', () => {
  const url = buildPeopleDirectoryUrl(
    new URL(
      'https://bold-lab.ai/people/?utm_source=newsletter&q=Alex&section=PhD+Student&supervisor=Tim+Rockt%C3%A4schel&area=AI+Agents&affiliation=UCL#people-results',
    ),
    {
      query: '   ',
      section: allFilterValue,
      supervisor: allFilterValue,
      area: allFilterValue,
      affiliation: allFilterValue,
    },
  )

  assert.equal(
    url.href,
    'https://bold-lab.ai/people/?utm_source=newsletter#people-results',
  )
})
