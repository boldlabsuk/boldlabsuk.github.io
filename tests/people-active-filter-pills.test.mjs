import test from 'node:test'
import assert from 'node:assert/strict'

import { getPeopleActiveFilterPills } from '../src/domain/people.ts'
import { allFilterValue } from '../src/domain/shared.ts'

const emptyFilters = {
  query: '',
  section: allFilterValue,
  area: allFilterValue,
  affiliation: allFilterValue,
}

test('People active filter pills omit inactive All filters and trim name search', () => {
  assert.deepEqual(getPeopleActiveFilterPills(emptyFilters), [])
  assert.deepEqual(
    getPeopleActiveFilterPills({
      ...emptyFilters,
      query: '  Alex  ',
    }),
    [
      {
        key: 'query',
        label: 'Name',
        value: 'Alex',
        displayLabel: 'Name: Alex',
        removeLabel: 'Remove name filter: Alex',
      },
    ],
  )
})

test('People active filter pills map People Section values to public plural labels', () => {
  assert.deepEqual(
    getPeopleActiveFilterPills({
      ...emptyFilters,
      section: 'PhD Student',
    }),
    [
      {
        key: 'section',
        label: 'Section',
        value: 'PhD Students',
        displayLabel: 'Section: PhD Students',
        removeLabel: 'Remove section filter: PhD Students',
      },
    ],
  )
})

test('People active filter pills preserve every active filter in control order', () => {
  assert.deepEqual(
    getPeopleActiveFilterPills({
      query: 'Casey',
      section: 'Research Engineers',
      area: 'Evaluation',
      affiliation: 'BOLD Lab',
    }),
    [
      {
        key: 'query',
        label: 'Name',
        value: 'Casey',
        displayLabel: 'Name: Casey',
        removeLabel: 'Remove name filter: Casey',
      },
      {
        key: 'section',
        label: 'Section',
        value: 'Research Engineers',
        displayLabel: 'Section: Research Engineers',
        removeLabel: 'Remove section filter: Research Engineers',
      },
      {
        key: 'area',
        label: 'Area',
        value: 'Evaluation',
        displayLabel: 'Area: Evaluation',
        removeLabel: 'Remove area filter: Evaluation',
      },
      {
        key: 'affiliation',
        label: 'Affiliation',
        value: 'BOLD Lab',
        displayLabel: 'Affiliation: BOLD Lab',
        removeLabel: 'Remove affiliation filter: BOLD Lab',
      },
    ],
  )
})
