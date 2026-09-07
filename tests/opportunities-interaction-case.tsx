import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><div id="root"></div>', {
  pretendToBeVisual: true,
  url: 'https://bold-lab.ai/opportunities#express-interest',
})
Object.defineProperties(globalThis, {
  document: { configurable: true, value: dom.window.document },
  HTMLElement: { configurable: true, value: dom.window.HTMLElement },
  navigator: { configurable: true, value: dom.window.navigator },
  window: { configurable: true, value: dom.window },
})
globalThis.IS_REACT_ACT_ENVIRONMENT = true
const [{ act, createElement }, { createRoot }, { OpportunitiesPage }] =
  await Promise.all([
    import('react'),
    import('react-dom/client'),
    import('../src/features/opportunities/OpportunitiesPage.tsx'),
  ])
const rootElement = document.getElementById('root')
assert.ok(rootElement)
const root = createRoot(rootElement)
await act(async () => root.render(createElement(OpportunitiesPage)))
assert.equal(document.querySelector('iframe'), null)
assert.equal(document.querySelector('script'), null)

await selectRoute('phd-students')
const firstFrame = document.querySelector('iframe')
assert.ok(firstFrame)
assert.equal(new URL(firstFrame.src).searchParams.get('route'), 'phd-students')
assert.equal(new URL(firstFrame.src).searchParams.get('dynamicHeight'), '1')
const script = document.querySelector('script')
assert.ok(script)
assert.equal(script.src, 'https://tally.so/widgets/embed.js')

await selectRoute('research-engineers')
assert.notEqual(document.querySelector('iframe'), firstFrame)
assert.equal(firstFrame.isConnected, false)
assert.equal(document.querySelectorAll('script').length, 1)
let resizeCalls = 0
const tallyWindow = window as Window & { Tally?: { loadEmbeds: () => void } }
tallyWindow.Tally = { loadEmbeds: resizeCurrentForm }
script.dispatchEvent(new dom.window.Event('load'))
assert.equal(resizeCalls, 1)
assert.equal(document.querySelector('iframe')?.style.height, '1400px')

await selectRoute('collaborators')
assert.equal(resizeCalls, 2)
assert.match(
  document.querySelector('.selected-route-guidance')?.textContent ?? '',
  /experienced researchers/,
)
await selectRoute('')
assert.equal(document.querySelector('iframe'), null)
script.dispatchEvent(new dom.window.Event('load'))
assert.equal(resizeCalls, 2)

// A pending third-party script must not invoke a stale listener after unmount.
delete tallyWindow.Tally
await selectRoute('masters-students')
await act(async () => root.unmount())
tallyWindow.Tally = { loadEmbeds: resizeCurrentForm }
script.dispatchEvent(new dom.window.Event('load'))
assert.equal(resizeCalls, 2)

// A later mount reuses the script and activates only its current listener.
delete tallyWindow.Tally
const remountedRoot = createRoot(rootElement)
await act(async () => remountedRoot.render(createElement(OpportunitiesPage)))
await selectRoute('visiting-students')
assert.equal(document.querySelectorAll('script').length, 1)
tallyWindow.Tally = { loadEmbeds: resizeCurrentForm }
script.dispatchEvent(new dom.window.Event('load'))
assert.equal(resizeCalls, 3)
assert.equal(
  new URL(document.querySelector('iframe')?.src ?? '').searchParams.get(
    'route',
  ),
  'visiting-students',
)
await act(async () =>
  remountedRoot.render(createElement(OpportunitiesPage, { formConfig: null })),
)
assert.equal(document.querySelector('iframe'), null)
assert.match(document.body.textContent ?? '', /Form coming soon/)
script.dispatchEvent(new dom.window.Event('load'))
assert.equal(resizeCalls, 3)
await act(async () => remountedRoot.unmount())
dom.window.close()

async function selectRoute(slug: string) {
  const selector = document.querySelector('select')
  assert.ok(selector)
  await act(async () => {
    selector.value = slug
    selector.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
  })
}

function resizeCurrentForm() {
  resizeCalls += 1
  const iframe = document.querySelector('iframe')
  if (iframe) iframe.style.height = '1400px'
}
