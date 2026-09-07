import type { FormEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getPeopleActiveFilterPills,
  getPeopleFilterOptions,
  type PeopleActiveFilterPill,
  type PeopleDirectoryFilters,
} from '../../domain/people'
import { allFilterValue } from '../../domain/shared'
import {
  getNextPeopleActiveFilterPillOrder,
  orderPeopleActiveFilterPills,
  type PeopleActiveFilterPillKey,
} from './activeFilterPillOrder'
import {
  buildPeopleDirectoryUrl,
  parsePeopleDirectoryFilters,
} from './peopleFilterUrl'

export const peopleFilterOptions = getPeopleFilterOptions()
const filterActionRowTransitionMs = 180

function getInitialPeopleDirectoryFilters(): PeopleDirectoryFilters {
  if (typeof window === 'undefined') {
    return {
      query: '',
      section: allFilterValue,
      area: allFilterValue,
      affiliation: allFilterValue,
      supervisor: allFilterValue,
    }
  }
  return parsePeopleDirectoryFilters(
    new URL(window.location.href),
    peopleFilterOptions,
  )
}

function useFilterActionRowTimers() {
  const closeTimerRef = useRef<number | null>(null)
  const openFrameRef = useRef<number | null>(null)
  const clearTimers = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    if (openFrameRef.current !== null) {
      window.cancelAnimationFrame(openFrameRef.current)
      openFrameRef.current = null
    }
  }, [])
  useEffect(() => clearTimers, [clearTimers])
  return { closeTimerRef, openFrameRef, clearTimers }
}

function useFilterActionRow(hasActiveFilters: boolean) {
  const [isMounted, setIsMounted] = useState(hasActiveFilters)
  const [isOpen, setIsOpen] = useState(hasActiveFilters)
  const { closeTimerRef, openFrameRef, clearTimers } =
    useFilterActionRowTimers()
  const updateFilterActionRow = useCallback(
    (nextFilters: PeopleDirectoryFilters) => {
      clearTimers()
      if (getPeopleActiveFilterPills(nextFilters).length === 0) {
        setIsOpen(false)
        closeTimerRef.current = window.setTimeout(() => {
          closeTimerRef.current = null
          setIsMounted(false)
        }, filterActionRowTransitionMs)
        return
      }
      if (isMounted) {
        setIsOpen(true)
        return
      }
      setIsMounted(true)
      setIsOpen(false)
      openFrameRef.current = window.requestAnimationFrame(() => {
        openFrameRef.current = null
        setIsOpen(true)
      })
    },
    [clearTimers, closeTimerRef, openFrameRef, isMounted],
  )
  return { isMounted, isOpen, updateFilterActionRow }
}

function useRestorePeopleDirectoryFilters(
  restoreFilters: (filters: PeopleDirectoryFilters) => void,
) {
  useEffect(() => {
    function restoreFromLocation() {
      restoreFilters(
        parsePeopleDirectoryFilters(
          new URL(window.location.href),
          peopleFilterOptions,
        ),
      )
    }
    window.addEventListener('popstate', restoreFromLocation)
    return () => window.removeEventListener('popstate', restoreFromLocation)
  }, [restoreFilters])
}

function usePeopleFilterActions(
  filters: PeopleDirectoryFilters,
  commitFilters: (filters: PeopleDirectoryFilters) => void,
) {
  const [draftQuery, setDraftQuery] = useState('')
  function submitNameSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextQuery = draftQuery.trim()
    if (nextQuery) {
      commitFilters({ ...filters, query: nextQuery })
    }
    setDraftQuery('')
  }
  function updateFilter(key: PeopleActiveFilterPill['key'], value: string) {
    commitFilters({ ...filters, [key]: value })
  }
  function clearPeopleFilter(key: PeopleActiveFilterPill['key']) {
    updateFilter(key, key === 'query' ? '' : allFilterValue)
    if (key === 'query') {
      setDraftQuery('')
    }
  }
  return {
    draftQuery,
    setDraftQuery,
    submitNameSearch,
    updateFilter,
    clearPeopleFilter,
  }
}

export function usePeopleDirectoryFilters() {
  const [filters, setFilters] = useState(getInitialPeopleDirectoryFilters)
  const [pillOrder, setPillOrder] = useState<PeopleActiveFilterPillKey[]>([])
  const activeFilterPills = orderPeopleActiveFilterPills(
    getPeopleActiveFilterPills(filters),
    pillOrder,
  )
  const { isMounted, isOpen, updateFilterActionRow } = useFilterActionRow(
    activeFilterPills.length > 0,
  )
  const updateActiveFilterControls = useCallback(
    (nextFilters: PeopleDirectoryFilters) => {
      setPillOrder((currentOrder) =>
        getNextPeopleActiveFilterPillOrder(currentOrder, nextFilters),
      )
      updateFilterActionRow(nextFilters)
    },
    [updateFilterActionRow],
  )
  function commitFilters(nextFilters: PeopleDirectoryFilters) {
    updateActiveFilterControls(nextFilters)
    window.history.pushState(
      null,
      '',
      buildPeopleDirectoryUrl(new URL(window.location.href), nextFilters),
    )
    setFilters(nextFilters)
  }
  const actions = usePeopleFilterActions(filters, commitFilters)
  const { setDraftQuery } = actions
  const restoreFilters = useCallback(
    (nextFilters: PeopleDirectoryFilters) => {
      updateActiveFilterControls(nextFilters)
      setFilters(nextFilters)
      setDraftQuery('')
    },
    [setDraftQuery, updateActiveFilterControls],
  )
  useRestorePeopleDirectoryFilters(restoreFilters)
  return { filters, activeFilterPills, isMounted, isOpen, ...actions }
}

export type PeopleDirectoryControls = ReturnType<
  typeof usePeopleDirectoryFilters
>
