import assert from 'node:assert/strict'
import test from 'node:test'
import { verifyTallyExpressionOfInterestPayload } from '../scripts/verify-tally-expression-of-interest.mjs'
import { configuredTallyPayload, inputBlocks } from './fixtures/tally-form.mjs'

test('Expression of Interest needs only contact details and a research note', () => {
  const result = verifyTallyExpressionOfInterestPayload(
    configuredTallyPayload(),
  )

  assert.equal(result.ready, true, result.failures.join('\n'))
  assert.deepEqual(result.failures, [])
})

test('required information is checked on real input blocks', () => {
  const payload = configuredTallyPayload()
  const email = payload.blocks.find((block) => block.type === 'INPUT_EMAIL')
  email.payload.isRequired = false

  const result = verifyTallyExpressionOfInterestPayload(payload)

  assert.equal(result.ready, false)
  assert.match(result.failures.join('\n'), /email.*required/i)
})

test('confirmation copy elsewhere cannot stand in for the receipt', () => {
  const payload = configuredTallyPayload()
  const receipt = payload.blocks.pop()
  payload.blocks.unshift(receipt)

  const result = verifyTallyExpressionOfInterestPayload(payload)

  assert.equal(result.ready, false)
  assert.match(result.failures.join('\n'), /confirmation/)
})

test('Expression of Interest does not collect a second area-of-interest field', () => {
  const payload = configuredTallyPayload()
  payload.blocks.splice(
    2,
    0,
    ...inputBlocks('Research Direction Interest', 'TEXTAREA', true),
  )

  const result = verifyTallyExpressionOfInterestPayload(payload)

  assert.equal(result.ready, false)
  assert.match(result.failures.join('\n'), /unexpected input/)
})

test('the submission action invites an expression of interest', () => {
  const payload = configuredTallyPayload()
  payload.blocks[0].payload.button.label = 'Apply'

  const result = verifyTallyExpressionOfInterestPayload(payload)

  assert.equal(result.ready, false)
  assert.match(result.failures.join('\n'), /submission action/)
})

test('the short research note has no old statement-length requirement', () => {
  const payload = configuredTallyPayload()
  const note = payload.blocks.find((block) => block.type === 'TEXTAREA')
  note.payload.placeholder = '200–400 words on why BOLD'

  const result = verifyTallyExpressionOfInterestPayload(payload)

  assert.equal(result.ready, false)
  assert.match(result.failures.join('\n'), /recruitment wording/)
})

test('an additional required rating is not part of the minimal intake', () => {
  const payload = configuredTallyPayload()
  payload.blocks.splice(2, 0, ...inputBlocks('Experience', 'RATING', true))
  assert.equal(verifyTallyExpressionOfInterestPayload(payload).ready, false)
})

test('only inputs before the thank-you page satisfy the intake contract', () => {
  const payload = configuredTallyPayload()
  const emailIndex = payload.blocks.findIndex(
    (block) => block.type === 'INPUT_EMAIL',
  )
  const [title, input] = payload.blocks.splice(emailIndex - 1, 2)
  const thanksIndex = payload.blocks.findIndex(
    (block) => block.type === 'PAGE_BREAK',
  )
  payload.blocks.splice(thanksIndex, 0, title)
  payload.blocks.splice(thanksIndex + 2, 0, input)
  assert.equal(verifyTallyExpressionOfInterestPayload(payload).ready, false)
})

test('the form introduction cannot promise a reply', () => {
  const payload = configuredTallyPayload()
  payload.blocks.unshift({
    type: 'TEXT',
    payload: { safeHTMLSchema: [['We will respond within one week.']] },
  })
  assert.equal(verifyTallyExpressionOfInterestPayload(payload).ready, false)
})

test('conditional logic cannot hide the shared intake questions', () => {
  const payload = configuredTallyPayload()
  payload.blocks.push({ type: 'CONDITIONAL_LOGIC', payload: {} })
  assert.equal(verifyTallyExpressionOfInterestPayload(payload).ready, false)
})
