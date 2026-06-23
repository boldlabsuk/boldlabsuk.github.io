import {
  getPeopleActiveFilterPills,
  type PeopleActiveFilterPill,
  type PeopleDirectoryFilters,
} from '../../domain/people.ts'

export type PeopleActiveFilterPillKey = PeopleActiveFilterPill['key']

export function getNextPeopleActiveFilterPillOrder(
  currentOrder: readonly PeopleActiveFilterPillKey[],
  nextFilters: PeopleDirectoryFilters,
): PeopleActiveFilterPillKey[] {
  const nextKeys = getPeopleActiveFilterPills(nextFilters).map(
    (pill) => pill.key,
  )
  const nextKeySet = new Set(nextKeys)
  const preservedKeys = currentOrder.filter((key) => nextKeySet.has(key))
  const preservedKeySet = new Set(preservedKeys)
  const newKeys = nextKeys.filter((key) => !preservedKeySet.has(key))

  return [...preservedKeys, ...newKeys]
}

export function orderPeopleActiveFilterPills(
  pills: readonly PeopleActiveFilterPill[],
  order: readonly PeopleActiveFilterPillKey[],
): PeopleActiveFilterPill[] {
  const pillsByKey = new Map(pills.map((pill) => [pill.key, pill]))
  const orderedPills = order.flatMap((key) => {
    const pill = pillsByKey.get(key)

    return pill ? [pill] : []
  })
  const orderedKeySet = new Set(orderedPills.map((pill) => pill.key))
  const unorderedPills = pills.filter((pill) => !orderedKeySet.has(pill.key))

  return [...orderedPills, ...unorderedPills]
}
