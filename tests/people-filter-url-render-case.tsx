import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

const scenario = process.argv[2] ?? 'initial-url'
const initialUrl =
  scenario === 'initial-url'
    ? 'https://bold-lab.ai/people/?q=Davide&section=Associate+Members&affiliation=UCL'
    : scenario === 'clear-filter'
      ? 'https://bold-lab.ai/people/?utm_source=newsletter&q=Davide&section=Associate+Members&affiliation=UCL#people-results'
      : 'https://bold-lab.ai/people/?utm_source=newsletter#people-results'
const dom = new JSDOM('<!doctype html><div id="root"></div>', {
  pretendToBeVisual: true,
  url: initialUrl,
})

Object.defineProperties(globalThis, {
  document: { configurable: true, value: dom.window.document },
  HTMLElement: { configurable: true, value: dom.window.HTMLElement },
  navigator: { configurable: true, value: dom.window.navigator },
  window: { configurable: true, value: dom.window },
})

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const [{ act, createElement }, { createRoot }, { PeoplePage }] =
  await Promise.all([
    import('react'),
    import('react-dom/client'),
    import('../src/features/people/PeoplePage.tsx'),
  ])
const rootElement = document.getElementById('root')

assert.ok(rootElement)

const root = createRoot(rootElement)

await act(async () => {
  root.render(createElement(PeoplePage))
})

if (scenario === 'initial-url') {
  assert.equal(
    document.querySelector<HTMLSelectElement>('#people-section')?.value,
    'Associate Members',
  )
  assert.equal(
    document.querySelector<HTMLSelectElement>('#people-affiliation')?.value,
    'UCL',
  )
  assert.match(
    document.querySelector('#people-results')?.textContent ?? '',
    /Davide Paglieri/,
  )
  assert.doesNotMatch(
    document.querySelector('#people-results')?.textContent ?? '',
    /Mert Albeyoglu/,
  )
  assert.match(
    document.querySelector('.people-active-filter-pills')?.textContent ?? '',
    /Davide.*Associate Members.*UCL/,
  )
} else if (scenario === 'select-filter') {
  const sectionFilter =
    document.querySelector<HTMLSelectElement>('#people-section')

  assert.ok(sectionFilter)

  await act(async () => {
    sectionFilter.value = 'Associate Members'
    sectionFilter.dispatchEvent(
      new dom.window.Event('change', { bubbles: true }),
    )
    await new Promise((resolve) => window.requestAnimationFrame(resolve))
  })

  assert.equal(sectionFilter.value, 'Associate Members')
  assert.equal(
    window.location.href,
    'https://bold-lab.ai/people/?utm_source=newsletter&section=Associate+Members#people-results',
  )
} else if (scenario === 'name-search') {
  const searchInput = document.querySelector<HTMLInputElement>('#people-search')
  const searchForm = searchInput?.closest('form')
  const setInputValue = Object.getOwnPropertyDescriptor(
    dom.window.HTMLInputElement.prototype,
    'value',
  )?.set

  assert.ok(searchInput)
  assert.ok(searchForm)
  assert.ok(setInputValue)

  await act(async () => {
    setInputValue.call(searchInput, 'Davide')
    searchInput.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
  })

  assert.equal(
    window.location.href,
    'https://bold-lab.ai/people/?utm_source=newsletter#people-results',
  )

  await act(async () => {
    searchForm.dispatchEvent(
      new dom.window.SubmitEvent('submit', {
        bubbles: true,
        cancelable: true,
      }),
    )
    await new Promise((resolve) => window.requestAnimationFrame(resolve))
  })

  assert.equal(searchInput.value, '')
  assert.equal(
    window.location.href,
    'https://bold-lab.ai/people/?utm_source=newsletter&q=Davide#people-results',
  )
  assert.match(
    document.querySelector('#people-results')?.textContent ?? '',
    /Davide Paglieri/,
  )
} else if (scenario === 'combined-select-filters') {
  async function changeSelect(id: string, value: string) {
    const select = document.querySelector<HTMLSelectElement>(id)

    assert.ok(select)

    await act(async () => {
      select.value = value
      select.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
      await new Promise((resolve) => window.requestAnimationFrame(resolve))
    })
  }

  await changeSelect('#people-section', 'Associate Members')
  await changeSelect('#people-supervisor', 'Tim Rocktäschel')
  await changeSelect('#people-area', 'AI Agents')
  await changeSelect('#people-affiliation', 'UCL')

  assert.equal(
    window.location.href,
    'https://bold-lab.ai/people/?utm_source=newsletter&section=Associate+Members&supervisor=Tim+Rockt%C3%A4schel&area=AI+Agents&affiliation=UCL#people-results',
  )
  assert.match(
    document.querySelector('#people-results')?.textContent ?? '',
    /Davide Paglieri/,
  )
} else if (scenario === 'clear-filter') {
  const removeSectionFilter = document.querySelector<HTMLButtonElement>(
    'button[aria-label="Remove role filter: Associate Members"]',
  )

  assert.ok(removeSectionFilter)

  await act(async () => {
    removeSectionFilter.click()
  })

  assert.equal(
    document.querySelector<HTMLSelectElement>('#people-section')?.value,
    'All',
  )
  assert.equal(
    window.location.href,
    'https://bold-lab.ai/people/?utm_source=newsletter&q=Davide&affiliation=UCL#people-results',
  )
  assert.match(
    document.querySelector('#people-results')?.textContent ?? '',
    /Davide Paglieri/,
  )
} else if (scenario === 'history-navigation') {
  async function changeSelect(id: string, value: string) {
    const select = document.querySelector<HTMLSelectElement>(id)

    assert.ok(select)

    await act(async () => {
      select.value = value
      select.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
      await new Promise((resolve) => window.requestAnimationFrame(resolve))
    })
  }

  async function traverseHistory(direction: 'back' | 'forward') {
    const navigated = new Promise<void>((resolve) => {
      window.addEventListener('popstate', () => resolve(), { once: true })
    })

    await act(async () => {
      window.history[direction]()
      await navigated
    })
  }

  await changeSelect('#people-section', 'Associate Members')
  await changeSelect('#people-area', 'AI Agents')

  await traverseHistory('back')

  assert.equal(
    window.location.href,
    'https://bold-lab.ai/people/?utm_source=newsletter&section=Associate+Members#people-results',
  )
  assert.equal(
    document.querySelector<HTMLSelectElement>('#people-section')?.value,
    'Associate Members',
  )
  assert.equal(
    document.querySelector<HTMLSelectElement>('#people-area')?.value,
    'All',
  )

  await traverseHistory('back')

  assert.equal(
    window.location.href,
    'https://bold-lab.ai/people/?utm_source=newsletter#people-results',
  )
  assert.equal(
    document.querySelector<HTMLSelectElement>('#people-section')?.value,
    'All',
  )

  await traverseHistory('forward')

  assert.equal(
    document.querySelector<HTMLSelectElement>('#people-section')?.value,
    'Associate Members',
  )
  assert.equal(
    document.querySelector<HTMLSelectElement>('#people-area')?.value,
    'All',
  )

  await traverseHistory('forward')

  assert.equal(
    window.location.href,
    'https://bold-lab.ai/people/?utm_source=newsletter&section=Associate+Members&area=AI+Agents#people-results',
  )
  assert.equal(
    document.querySelector<HTMLSelectElement>('#people-area')?.value,
    'AI Agents',
  )
} else {
  throw new Error(`Unknown People filter URL test scenario: ${scenario}`)
}

await act(async () => {
  root.unmount()
})
dom.window.close()
