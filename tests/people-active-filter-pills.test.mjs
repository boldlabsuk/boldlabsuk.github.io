import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getNextPeopleActiveFilterPillOrder,
  orderPeopleActiveFilterPills,
} from '../src/features/people/activeFilterPillOrder.ts'
import { getPeopleActiveFilterPills } from '../src/domain/people.ts'
import { allFilterValue } from '../src/domain/shared.ts'

const emptyFilters = {
  query: '',
  section: allFilterValue,
  area: allFilterValue,
  affiliation: allFilterValue,
  supervisor: allFilterValue,
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
        displayLabel: 'Alex',
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
        label: 'Role',
        value: 'PhD Students',
        displayLabel: 'PhD Students',
        removeLabel: 'Remove role filter: PhD Students',
      },
    ],
  )
})

test('People active filter pills include metadata for every active filter', () => {
  const activePills = getPeopleActiveFilterPills({
    query: 'Casey',
    section: 'Research Engineers',
    area: 'Evaluation',
    affiliation: 'BOLD Lab',
    supervisor: 'Jakob Foerster',
  })

  assert.deepEqual(
    Object.fromEntries(activePills.map((pill) => [pill.key, pill])),
    {
      query: {
        key: 'query',
        label: 'Name',
        value: 'Casey',
        displayLabel: 'Casey',
        removeLabel: 'Remove name filter: Casey',
      },
      section: {
        key: 'section',
        label: 'Role',
        value: 'Research Engineers',
        displayLabel: 'Research Engineers',
        removeLabel: 'Remove role filter: Research Engineers',
      },
      area: {
        key: 'area',
        label: 'Area',
        value: 'Evaluation',
        displayLabel: 'Evaluation',
        removeLabel: 'Remove area filter: Evaluation',
      },
      affiliation: {
        key: 'affiliation',
        label: 'Affiliation',
        value: 'BOLD Lab',
        displayLabel: 'BOLD Lab',
        removeLabel: 'Remove affiliation filter: BOLD Lab',
      },
      supervisor: {
        key: 'supervisor',
        label: 'Supervisor',
        value: 'Jakob Foerster',
        displayLabel: 'Jakob Foerster',
        removeLabel: 'Remove supervisor filter: Jakob Foerster',
      },
    },
  )
})

test('People active filter pills render in activation order', () => {
  let filters = emptyFilters
  let activePillOrder = []

  filters = { ...filters, affiliation: 'BOLD Lab' }
  activePillOrder = getNextPeopleActiveFilterPillOrder(
    activePillOrder,
    filters,
  )

  filters = { ...filters, query: 'Casey' }
  activePillOrder = getNextPeopleActiveFilterPillOrder(
    activePillOrder,
    filters,
  )

  filters = { ...filters, section: 'PhD Student' }
  activePillOrder = getNextPeopleActiveFilterPillOrder(
    activePillOrder,
    filters,
  )

  const orderedPills = orderPeopleActiveFilterPills(
    getPeopleActiveFilterPills(filters),
    activePillOrder,
  )

  assert.deepEqual(
    orderedPills.map((pill) => pill.key),
    ['affiliation', 'query', 'section'],
  )
})

test('People active filter pills keep position when active values change', () => {
  let filters = emptyFilters
  let activePillOrder = []

  filters = { ...filters, affiliation: 'BOLD Lab' }
  activePillOrder = getNextPeopleActiveFilterPillOrder(
    activePillOrder,
    filters,
  )

  filters = { ...filters, query: 'Casey' }
  activePillOrder = getNextPeopleActiveFilterPillOrder(
    activePillOrder,
    filters,
  )

  filters = { ...filters, query: 'Alex' }
  activePillOrder = getNextPeopleActiveFilterPillOrder(
    activePillOrder,
    filters,
  )

  const orderedPills = orderPeopleActiveFilterPills(
    getPeopleActiveFilterPills(filters),
    activePillOrder,
  )

  assert.deepEqual(
    orderedPills.map((pill) => [pill.key, pill.value]),
    [
      ['affiliation', 'BOLD Lab'],
      ['query', 'Alex'],
    ],
  )
})

test('People active filter pills remove cleared filters from activation order', () => {
  let filters = emptyFilters
  let activePillOrder = []

  filters = { ...filters, affiliation: 'BOLD Lab' }
  activePillOrder = getNextPeopleActiveFilterPillOrder(
    activePillOrder,
    filters,
  )

  filters = { ...filters, query: 'Casey' }
  activePillOrder = getNextPeopleActiveFilterPillOrder(
    activePillOrder,
    filters,
  )

  filters = { ...filters, query: '' }
  activePillOrder = getNextPeopleActiveFilterPillOrder(
    activePillOrder,
    filters,
  )

  assert.deepEqual(activePillOrder, ['affiliation'])
})

test('People active filter pills append removed filters when re-added', () => {
  let filters = emptyFilters
  let activePillOrder = []

  filters = { ...filters, affiliation: 'BOLD Lab' }
  activePillOrder = getNextPeopleActiveFilterPillOrder(
    activePillOrder,
    filters,
  )

  filters = { ...filters, query: 'Casey' }
  activePillOrder = getNextPeopleActiveFilterPillOrder(
    activePillOrder,
    filters,
  )

  filters = { ...filters, section: 'PhD Student' }
  activePillOrder = getNextPeopleActiveFilterPillOrder(
    activePillOrder,
    filters,
  )

  filters = { ...filters, query: '' }
  activePillOrder = getNextPeopleActiveFilterPillOrder(
    activePillOrder,
    filters,
  )

  filters = { ...filters, query: 'Alex' }
  activePillOrder = getNextPeopleActiveFilterPillOrder(
    activePillOrder,
    filters,
  )

  const orderedPills = orderPeopleActiveFilterPills(
    getPeopleActiveFilterPills(filters),
    activePillOrder,
  )

  assert.deepEqual(
    orderedPills.map((pill) => pill.key),
    ['affiliation', 'section', 'query'],
  )
})
