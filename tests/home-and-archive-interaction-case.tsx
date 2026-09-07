import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import type { ReactNode } from 'react'

const dom = new JSDOM('<!doctype html><div id="root"></div>', {
  pretendToBeVisual: true,
  url: 'https://bold-lab.ai/',
})
Object.defineProperties(globalThis, {
  document: { configurable: true, value: dom.window.document },
  HTMLElement: { configurable: true, value: dom.window.HTMLElement },
  navigator: { configurable: true, value: dom.window.navigator },
  window: { configurable: true, value: dom.window },
})
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const [React, { createRoot }, home, header, news, articles, papers] =
  await Promise.all([
    import('react'),
    import('react-dom/client'),
    import('../src/features/home/HomePage.tsx'),
    import('../src/ui/layout/SiteHeader.tsx'),
    import('../src/features/news/NewsPage.tsx'),
    import('../src/features/news/NewsPostPage.tsx'),
    import('../src/features/papers/PapersPage.tsx'),
  ])
const { act, useState } = React
const { HomePage } = home
const { SiteHeader } = header
const { NewsPage } = news
const { NewsPostPage } = articles
const { PapersPage } = papers
const rootElement = document.getElementById('root')
assert.ok(rootElement)
const root = createRoot(rootElement)
const frames = new Map<number, FrameRequestCallback>()
let nextFrameId = 0
window.requestAnimationFrame = (callback) => {
  frames.set(++nextFrameId, callback)
  return nextFrameId
}
window.cancelAnimationFrame = (frameId) => frames.delete(frameId)

const selectedPaperFilters = [
  ['#paper-year', '2026'],
  ['#paper-area', 'Agents'],
  ['#paper-type', 'conference'],
  ['#paper-venue', 'International Conference on Learning Representations'],
  ['#paper-author', 'BOLD Lab'],
]

await verifyHeroLogoVisibility()
await verifyMobileNavigation()
await verifyNewsFilters()
await verifyPaperFilters()
await verifyNewsArticleFallbacks()
await act(async () => root.unmount())
dom.window.close()

function HomeShell() {
  const [isHeroVisible, setIsHeroVisible] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <SiteHeader
        activeSection="/"
        showBrandLogo={!isHeroVisible}
        isMenuOpen={isMenuOpen}
        onMenuToggle={() => setIsMenuOpen((previous) => !previous)}
      />
      <HomePage onHeroLogoVisibilityChange={setIsHeroVisible} />
    </>
  )
}

async function render(element: ReactNode) {
  await act(async () => root.render(element))
}

async function flushFrames() {
  await act(async () => {
    for (const [frameId, callback] of [...frames]) {
      frames.delete(frameId)
      callback(0)
    }
  })
}

async function verifyHeroLogoVisibility() {
  assert.equal('IntersectionObserver' in window, false)
  await render(<HomeShell />)
  const logo = document.querySelector<HTMLImageElement>('.home-hero-logo')
  const header = document.querySelector<HTMLElement>('.site-header')
  assert.ok(logo)
  assert.ok(header)
  let logoTop = 0
  logo.getBoundingClientRect = () =>
    new dom.window.DOMRect(0, logoTop, 300, 788)
  header.getBoundingClientRect = () => new dom.window.DOMRect(0, 0, 1000, 100)
  await flushFrames()
  assert.ok(document.querySelector('.brand-hidden'))

  logoTop = -499
  window.dispatchEvent(new dom.window.Event('scroll'))
  window.dispatchEvent(new dom.window.Event('scroll'))
  assert.equal(frames.size, 1)
  await flushFrames()
  assert.ok(document.querySelector('a.brand'))

  logoTop = -498
  window.dispatchEvent(new dom.window.Event('resize'))
  await flushFrames()
  assert.ok(document.querySelector('.brand-hidden'))

  logoTop = window.innerHeight
  logo.dispatchEvent(new dom.window.Event('load'))
  await flushFrames()
  assert.ok(document.querySelector('a.brand'))

  window.dispatchEvent(new dom.window.Event('scroll'))
  assert.equal(frames.size, 1)
  await render(null)
  assert.equal(frames.size, 0)
  logo.dispatchEvent(new dom.window.Event('load'))
  window.dispatchEvent(new dom.window.Event('scroll'))
  window.dispatchEvent(new dom.window.Event('resize'))
  assert.equal(frames.size, 0)
}

async function verifyMobileNavigation() {
  await render(<HomeShell />)
  const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle')
  assert.ok(toggle)
  assert.equal(toggle.getAttribute('aria-expanded'), 'false')
  await act(async () => toggle.click())
  assert.equal(toggle.getAttribute('aria-expanded'), 'true')
  assert.ok(document.querySelector('#primary-navigation.nav-links-open'))
  assert.equal(
    document.querySelector('#primary-navigation a[href="/opportunities"]')
      ?.textContent,
    'Opportunities',
  )
  await act(async () => toggle.click())
  assert.equal(toggle.getAttribute('aria-expanded'), 'false')
  assert.equal(document.querySelector('.nav-links-open'), null)
}

async function changeInput(selector: string, value: string) {
  const input = document.querySelector<HTMLInputElement>(selector)
  assert.ok(input)
  const setValue = Object.getOwnPropertyDescriptor(
    dom.window.HTMLInputElement.prototype,
    'value',
  )?.set
  assert.ok(setValue)
  await act(async () => {
    setValue.call(input, value)
    input.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
  })
}

async function changeSelect(selector: string, value: string) {
  const select = document.querySelector<HTMLSelectElement>(selector)
  assert.ok(select)
  await act(async () => {
    select.value = value
    select.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
  })
}

async function verifyNewsFilters() {
  await render(<NewsPage />)
  assert.equal(
    document.querySelectorAll('.featured-news-layout article').length,
    3,
  )
  await changeInput('#news-search', 'no matching news anywhere')
  assert.match(rootElement?.textContent ?? '', /No news posts match/)
  assert.equal(
    document.querySelectorAll('.featured-news-layout article').length,
    3,
  )
  await changeInput('#news-search', '')
  const blogFilter = [
    ...document.querySelectorAll<HTMLButtonElement>('.filter-chip'),
  ].find((button) => button.textContent === 'Blog')
  assert.ok(blogFilter)
  await act(async () => blogFilter.click())
  assert.equal(blogFilter.getAttribute('aria-pressed'), 'true')
  assert.equal(document.querySelectorAll('.archive-grid article').length, 1)
  assert.match(
    document.querySelector('.archive-grid')?.textContent ?? '',
    /Why open-ended learning needs public evaluation/,
  )
}

async function verifyPaperFilters() {
  await render(<PapersPage />)
  const initialCount = document.querySelector('.result-count')?.textContent
  const initialResults = document.querySelector('.year-group-list')?.textContent
  for (const [selector, value] of selectedPaperFilters) {
    await changeSelect(selector, value)
  }
  assert.match(
    document.querySelector('.result-count')?.textContent ?? '',
    /Showing 1 of/,
  )
  assert.match(
    document.querySelector('.year-group-list')?.textContent ?? '',
    /Autocurricula/,
  )
  await changeInput('#paper-search', 'no matching papers anywhere')
  assert.match(rootElement?.textContent ?? '', /No papers match/)
  assert.match(
    document.querySelector('.result-count')?.textContent ?? '',
    /Showing 0 of/,
  )
  const reset = document.querySelector<HTMLButtonElement>(
    '.button-filter-reset',
  )
  assert.ok(reset)
  await act(async () => reset.click())
  assert.equal(
    document.querySelector<HTMLInputElement>('#paper-search')?.value,
    '',
  )
  for (const [selector] of selectedPaperFilters) {
    assert.equal(
      document.querySelector<HTMLSelectElement>(selector)?.value,
      'All',
    )
  }
  assert.equal(
    document.querySelector('.result-count')?.textContent,
    initialCount,
  )
  assert.equal(
    document.querySelector('.year-group-list')?.textContent,
    initialResults,
  )
}

async function verifyNewsArticleFallbacks() {
  await render(<NewsPostPage slug="bold-lab-launch" />)
  assert.equal(document.querySelectorAll('.article-body p').length, 3)
  assert.ok(document.querySelector('.article-card-compact'))
  await render(<NewsPostPage slug="external-policy-roundtable" />)
  assert.equal(document.querySelectorAll('.article-body p').length, 1)
  assert.match(
    document.querySelector('.article-body')?.textContent ?? '',
    /Lab members contributed evidence/,
  )
  assert.equal(
    document.querySelector('.article-detail a.button')?.getAttribute('href'),
    'https://example.ac.uk/news/ai-policy-roundtable',
  )
  await render(<NewsPostPage slug="social-launch-thread" />)
  assert.equal(
    document.querySelector('.social-embed a')?.textContent,
    'Open social post',
  )
  await render(<NewsPostPage slug="missing-post" />)
  assert.match(rootElement?.textContent ?? '', /Page not found/i)
}
