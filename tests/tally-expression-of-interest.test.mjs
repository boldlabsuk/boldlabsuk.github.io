import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import {
  ACCEPTED_TALLY_ROUTES,
  buildTallyEmbedUrl,
  extractTallyPayload,
  verifyTallyExpressionOfInterestPayload,
} from '../scripts/verify-tally-expression-of-interest.mjs'
import { configuredTallyPayload, inputBlocks } from './fixtures/tally-form.mjs'

function nextDataHtml(pageProps) {
  return `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify({
    props: { pageProps },
  })}</script>`
}

function inputFor(payload, label) {
  const titleIndex = payload.blocks.findIndex(
    (block) =>
      block.type === 'TITLE' && block.payload.safeHTMLSchema[0][0] === label,
  )
  return payload.blocks[titleIndex + 1]
}

test('all five Expression of Interest routes use the shared form', () => {
  assert.deepEqual(ACCEPTED_TALLY_ROUTES, [
    'phd-students',
    'visiting-students',
    'masters-students',
    'research-engineers',
    'collaborators',
  ])
  assert.deepEqual(ACCEPTED_TALLY_ROUTES.map(buildTallyEmbedUrl), [
    'https://tally.so/embed/A7aa0W?route=phd-students',
    'https://tally.so/embed/A7aa0W?route=visiting-students',
    'https://tally.so/embed/A7aa0W?route=masters-students',
    'https://tally.so/embed/A7aa0W?route=research-engineers',
    'https://tally.so/embed/A7aa0W?route=collaborators',
  ])
})

test('public form payload is extracted without integration credentials', () => {
  const payload = extractTallyPayload(nextDataHtml(configuredTallyPayload()))
  const result = verifyTallyExpressionOfInterestPayload(payload)
  assert.equal(result.ready, true, result.failures.join('\n'))
  assert.equal(result.summary.integrationsCount, 0)
  assert.deepEqual(result.summary.hiddenFields, ['route'])
})

for (const html of [
  '<html></html>',
  '<script id="__NEXT_DATA__">{}</script>',
]) {
  test(`invalid public payload is rejected: ${html}`, () => {
    assert.throws(() => extractTallyPayload(html), /Tally/)
  })
}

for (const [property, value] of [
  ['formId', 'wrong'],
  ['name', 'wrong'],
  ['blocks', []],
]) {
  test(`incorrect form contract is rejected: ${property}`, () => {
    const payload = configuredTallyPayload()
    payload[property] = value
    assert.equal(verifyTallyExpressionOfInterestPayload(payload).ready, false)
  })
}

const fieldLabels = [
  'Full name',
  'Email',
  'Your connection to BOLD’s research',
  'Profile links (optional)',
  'CV (optional)',
]

for (const label of fieldLabels) {
  test(`${label} cannot have its required setting reversed`, () => {
    const payload = configuredTallyPayload()
    const input = inputFor(payload, label)
    input.payload.isRequired = !input.payload.isRequired
    assert.equal(verifyTallyExpressionOfInterestPayload(payload).ready, false)
  })

  test(`${label} must be an actual input, not descriptive text`, () => {
    const payload = configuredTallyPayload()
    inputFor(payload, label).type = 'TEXT'
    assert.equal(verifyTallyExpressionOfInterestPayload(payload).ready, false)
  })
}

for (const settings of [
  { allowedFiles: { 'application/*': ['.pdf', '.docx'] } },
  { allowedFiles: {} },
  { hasMaxFileSize: false },
  { maxFileSize: 25 },
  { maxFileSizeUnit: 'GB' },
]) {
  test(`CV constraints are enforced: ${JSON.stringify(settings)}`, () => {
    const payload = configuredTallyPayload()
    Object.assign(inputFor(payload, 'CV (optional)').payload, settings)
    assert.equal(verifyTallyExpressionOfInterestPayload(payload).ready, false)
  })
}

test('missing hidden route cannot be replaced by a visible selector', () => {
  const payload = configuredTallyPayload()
  payload.blocks = payload.blocks.filter(
    (block) => block.type !== 'HIDDEN_FIELDS',
  )
  payload.blocks.splice(2, 0, ...inputBlocks('Desired role', 'DROPDOWN', true))
  const result = verifyTallyExpressionOfInterestPayload(payload)
  assert.equal(result.ready, false)
  assert.match(result.failures.join('\n'), /hidden route/)
})

test('the receipt cannot promise contact after acknowledging interest', () => {
  const payload = configuredTallyPayload()
  payload.blocks.at(-1).payload.safeHTMLSchema.push(['We will contact you.'])
  assert.equal(verifyTallyExpressionOfInterestPayload(payload).ready, false)
})

test('Tally verifier module can be imported without CLI argv', () => {
  const result = spawnSync(process.execPath, ['--input-type=module'], {
    cwd: process.cwd(),
    input:
      "await import('./scripts/verify-tally-expression-of-interest.mjs')\n",
    encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr)
})
