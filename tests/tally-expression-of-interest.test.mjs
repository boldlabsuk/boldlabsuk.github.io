import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

import {
  ACCEPTED_TALLY_ROUTES,
  buildTallyEmbedUrl,
  extractTallyPayload,
  verifyTallyExpressionOfInterestPayload,
} from '../scripts/verify-tally-expression-of-interest.mjs'

function nextDataHtml(pageProps) {
  return `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify({
    props: { pageProps },
  })}</script>`
}

function representativeConfiguredBlocks({
  includeFileUpload = true,
  includePracticalConstraints = true,
  includeWorkWithBold = true,
} = {}) {
  return [
    { type: 'FORM_TITLE', payload: { title: 'BOLD Expression of Interest' } },
    {
      type: 'HIDDEN_FIELDS',
      payload: { hiddenFields: [{ name: 'route' }] },
    },
    {
      type: 'INPUT_TEXT',
      payload: {
        title:
          'Full name, email, current role/title, current organization/institution, and location/time zone',
      },
    },
    {
      type: 'TEXTAREA',
      payload: {
        title:
          'Fit statement: 200-400 words on why BOLD, this route, and the research or technical fit',
      },
    },
    {
      type: 'TEXTAREA',
      payload: {
        title:
          'Relevant links and free-form Research Direction Interest, including papers, projects, or portfolios',
      },
    },
    ...(includePracticalConstraints
      ? [
          {
            type: 'TEXTAREA',
            payload: {
              title: 'Optional location, timing, or eligibility constraints',
            },
          },
        ]
      : []),
    ...(includeFileUpload
      ? [
          {
            type: 'FILE_UPLOAD',
            payload: {
              title: 'CV/resume upload',
              allowedFiles: { 'application/*': ['.pdf'] },
              hasMaxFileSize: true,
              maxFileSize: 10,
              maxFileSizeUnit: 'MB',
            },
          },
        ]
      : [
          {
            type: 'TEXT',
            payload: {
              title:
                'CV/resume upload accepts PDF only and has a 10 MB file upload limit.',
            },
          },
        ]),
    {
      type: 'INPUT_TEXT',
      payload: { title: 'Desired timing' },
    },
    ...(includeWorkWithBold
      ? [
          {
            type: 'TEXTAREA',
            payload: {
              title: 'What would you like to work on with BOLD?',
            },
          },
        ]
      : []),
    {
      type: 'TEXTAREA',
      payload: {
        title: 'Current application or Formal Application Path status',
      },
    },
    {
      type: 'TEXTAREA',
      payload: { title: 'Relevant BOLD people or groups' },
    },
    {
      type: 'TEXT',
      payload: {
        title:
          'BOLD has received your Expression of Interest. We review Expressions of Interest periodically and will contact you if there is a strong fit with current BOLD priorities, supervision capacity, or open opportunities. Formal applications may still need to happen through university, departmental, placement, or employment processes.',
      },
    },
  ]
}

test('Tally verifier builds the shared form embed URLs for every Opportunity Route', () => {
  assert.deepEqual(ACCEPTED_TALLY_ROUTES, [
    'phd-students',
    'visiting-students',
    'masters-students',
    'research-engineers',
    'fellows',
    'collaborators',
  ])

  assert.deepEqual(ACCEPTED_TALLY_ROUTES.map(buildTallyEmbedUrl), [
    'https://tally.so/embed/A7aa0W?route=phd-students',
    'https://tally.so/embed/A7aa0W?route=visiting-students',
    'https://tally.so/embed/A7aa0W?route=masters-students',
    'https://tally.so/embed/A7aa0W?route=research-engineers',
    'https://tally.so/embed/A7aa0W?route=fellows',
    'https://tally.so/embed/A7aa0W?route=collaborators',
  ])
})

test('Tally verifier reports the live incomplete public form shape as not ready', () => {
  const payload = extractTallyPayload(
    nextDataHtml({
      formId: 'A7aa0W',
      workspaceId: '3NbqgN',
      name: 'BOLD Expression of Interest',
      blocks: [
        {
          type: 'FORM_TITLE',
          payload: { title: 'BOLD Expression of Interest' },
        },
        {
          type: 'HIDDEN_FIELDS',
          payload: { hiddenFields: [{ name: 'route' }] },
        },
        { type: 'TEXT', payload: { safeHTMLSchema: [] } },
      ],
      integrations: [],
    }),
  )

  const result = verifyTallyExpressionOfInterestPayload(payload)

  assert.equal(result.ready, false)
  assert.equal(result.summary.formId, 'A7aa0W')
  assert.deepEqual(result.summary.hiddenFields, ['route'])
  assert.match(result.failures.join('\n'), /baseline field/)
  assert.match(result.failures.join('\n'), /CV\/resume upload/)
  assert.match(result.failures.join('\n'), /desired timing/)
})

test('Tally verifier rejects a visible Desired role field', () => {
  const payload = extractTallyPayload(
    nextDataHtml({
      formId: 'A7aa0W',
      workspaceId: '3NbqgN',
      name: 'BOLD Expression of Interest',
      blocks: [
        {
          type: 'FORM_TITLE',
          payload: { title: 'BOLD Expression of Interest' },
        },
        {
          type: 'HIDDEN_FIELDS',
          payload: { hiddenFields: [{ name: 'route' }] },
        },
        {
          type: 'DROPDOWN',
          payload: {
            title: 'Desired role',
            options: ['Research Engineer', 'PhD Student'],
          },
        },
      ],
      integrations: [],
    }),
  )

  const result = verifyTallyExpressionOfInterestPayload(payload)

  assert.equal(result.ready, false)
  assert.match(result.failures.join('\n'), /visible Desired role field/)
})

test('Tally verifier rejects fixed-choice Research Direction Interest fields', () => {
  const payload = extractTallyPayload(
    nextDataHtml({
      formId: 'A7aa0W',
      workspaceId: '3NbqgN',
      name: 'BOLD Expression of Interest',
      blocks: [
        {
          type: 'FORM_TITLE',
          payload: { title: 'BOLD Expression of Interest' },
        },
        {
          type: 'HIDDEN_FIELDS',
          payload: { hiddenFields: [{ name: 'route' }] },
        },
        {
          type: 'TITLE',
          payload: { safeHTMLSchema: [['Research Direction Interest']] },
        },
        {
          type: 'DROPDOWN_OPTION',
          payload: { text: 'Beyond Backpropagation' },
        },
        {
          type: 'DROPDOWN_OPTION',
          payload: { text: 'Embodied Learning' },
        },
      ],
      integrations: [],
    }),
  )

  const result = verifyTallyExpressionOfInterestPayload(payload)

  assert.equal(result.ready, false)
  assert.match(
    result.failures.join('\n'),
    /Research Direction Interest must be free-form/,
  )
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

test('Tally verifier accepts a representative configured generic public form payload without public integration evidence', () => {
  const sharedBlocks = [
    { type: 'FORM_TITLE', payload: { title: 'BOLD Expression of Interest' } },
    {
      type: 'HIDDEN_FIELDS',
      payload: { hiddenFields: [{ name: 'route' }] },
    },
    {
      type: 'INPUT_TEXT',
      payload: {
        title:
          'Full name, email, current role/title, current organization/institution, and location/time zone',
      },
    },
    {
      type: 'TEXTAREA',
      payload: {
        title:
          'Fit statement: 200-400 words on why BOLD, this route, and the research or technical fit',
      },
    },
    {
      type: 'TEXTAREA',
      payload: {
        title:
          'Relevant links and free-form Research Direction Interest, not a fixed multiple-choice taxonomy',
      },
    },
    {
      type: 'FILE_UPLOAD',
      payload: {
        title: 'CV/resume upload',
        allowedFiles: { 'application/*': ['.pdf'] },
        hasMaxFileSize: true,
        maxFileSize: 10,
        maxFileSizeUnit: 'MB',
      },
    },
    {
      type: 'CHECKBOXES',
      payload: {
        title:
          'Optional location, timing, or eligibility constraints and desired timing',
      },
    },
    {
      type: 'TEXTAREA',
      payload: {
        title:
          'What would you like to work on with BOLD? Describe the project, research direction, technical work, visit, or collaboration you have in mind.',
      },
    },
    {
      type: 'TEXTAREA',
      payload: {
        title:
          'Current application or Formal Application Path status, if relevant.',
      },
    },
    {
      type: 'TEXTAREA',
      payload: {
        title:
          'Relevant BOLD people or groups whose work connects to your interests.',
      },
    },
    {
      type: 'TEXT',
      payload: {
        title:
          'BOLD has received your Expression of Interest. We review Expressions of Interest periodically and will contact you if there is a strong fit with current BOLD priorities, supervision capacity, or open opportunities. Formal applications may still need to happen through university, departmental, placement, or employment processes.',
      },
    },
  ]

  const payload = extractTallyPayload(
    nextDataHtml({
      formId: 'A7aa0W',
      workspaceId: '3NbqgN',
      name: 'BOLD Expression of Interest',
      blocks: sharedBlocks,
      integrations: [],
    }),
  )

  const result = verifyTallyExpressionOfInterestPayload(payload)

  assert.equal(result.ready, true)
  assert.deepEqual(result.failures, [])
})

test('Tally verifier accepts confirmation copy that reviews submissions periodically', () => {
  const payload = extractTallyPayload(
    nextDataHtml({
      formId: 'A7aa0W',
      workspaceId: '3NbqgN',
      name: 'BOLD Expression of Interest',
      blocks: [
        {
          type: 'FORM_TITLE',
          payload: { title: 'BOLD Expression of Interest' },
        },
        {
          type: 'HIDDEN_FIELDS',
          payload: { hiddenFields: [{ name: 'route' }] },
        },
        {
          type: 'INPUT_TEXT',
          payload: {
            title:
              'Full name, email, current role/title, current organization/institution, and location/time zone',
          },
        },
        {
          type: 'TEXTAREA',
          payload: {
            title:
              'Fit statement: 200-400 words on why BOLD, this route, and the research or technical fit',
          },
        },
        {
          type: 'TEXTAREA',
          payload: {
            title:
              'Relevant links and free-form Research Direction Interest, not a fixed multiple-choice taxonomy',
          },
        },
        {
          type: 'FILE_UPLOAD',
          payload: {
            title: 'CV/resume upload',
            allowedFiles: { 'application/*': ['.pdf'] },
            hasMaxFileSize: true,
            maxFileSize: 10,
            maxFileSizeUnit: 'MB',
          },
        },
        {
          type: 'CHECKBOXES',
          payload: {
            title:
              'Optional location, timing, or eligibility constraints and desired timing',
          },
        },
        {
          type: 'TEXTAREA',
          payload: {
            title:
              'What would you like to work on with BOLD? Describe the project, research direction, technical work, visit, or collaboration you have in mind.',
          },
        },
        {
          type: 'TEXTAREA',
          payload: {
            title:
              'Current application or Formal Application Path status, if relevant.',
          },
        },
        {
          type: 'TEXTAREA',
          payload: {
            title:
              'Relevant BOLD people or groups whose work connects to your interests.',
          },
        },
        {
          type: 'TEXT',
          payload: {
            title:
              'BOLD has received your Expression of Interest. We review submissions periodically and will contact you if there is a strong fit with current BOLD priorities, supervision capacity, or open opportunities. Formal applications may still need to be completed through university, departmental, placement, or employment processes.',
          },
        },
      ],
      integrations: [],
    }),
  )

  const result = verifyTallyExpressionOfInterestPayload(payload)

  assert.equal(result.ready, true)
  assert.deepEqual(result.failures, [])
})

test('Tally verifier rejects CV/resume uploads without PDF-only and 10 MB constraints', () => {
  const payload = extractTallyPayload(
    nextDataHtml({
      formId: 'A7aa0W',
      workspaceId: '3NbqgN',
      name: 'BOLD Expression of Interest',
      blocks: [
        {
          type: 'FORM_TITLE',
          payload: { title: 'BOLD Expression of Interest' },
        },
        {
          type: 'HIDDEN_FIELDS',
          payload: { hiddenFields: [{ name: 'route' }] },
        },
        {
          type: 'TITLE',
          payload: { safeHTMLSchema: [['CV/resume upload']] },
        },
        {
          type: 'FILE_UPLOAD',
          payload: {
            allowedFiles: { 'application/*': ['.pdf', '.docx'] },
            hasMaxFileSize: true,
            maxFileSize: 25,
            maxFileSizeUnit: 'MB',
          },
        },
      ],
      integrations: [],
    }),
  )

  const result = verifyTallyExpressionOfInterestPayload(payload)

  assert.equal(result.ready, false)
  assert.match(result.failures.join('\n'), /PDF-only CV\/resume setting/)
  assert.match(result.failures.join('\n'), /10 MB upload limit/)
})

test('Tally verifier rejects text-only CV/resume upload guidance without a configured upload block', () => {
  const payload = extractTallyPayload(
    nextDataHtml({
      formId: 'A7aa0W',
      workspaceId: '3NbqgN',
      name: 'BOLD Expression of Interest',
      blocks: representativeConfiguredBlocks({ includeFileUpload: false }),
      integrations: [],
    }),
  )

  const result = verifyTallyExpressionOfInterestPayload(payload)

  assert.equal(result.ready, false)
  assert.match(result.failures.join('\n'), /missing CV\/resume upload field/)
  assert.match(result.failures.join('\n'), /PDF-only CV\/resume setting/)
  assert.match(result.failures.join('\n'), /10 MB upload limit/)
})

test('Tally verifier does not let desired timing stand in for practical constraints', () => {
  const payload = extractTallyPayload(
    nextDataHtml({
      formId: 'A7aa0W',
      workspaceId: '3NbqgN',
      name: 'BOLD Expression of Interest',
      blocks: representativeConfiguredBlocks({
        includePracticalConstraints: false,
      }),
      integrations: [],
    }),
  )

  const result = verifyTallyExpressionOfInterestPayload(payload)

  assert.equal(result.ready, false)
  assert.match(
    result.failures.join('\n'),
    /missing baseline field: optional practical constraints/,
  )
})

test('Tally verifier requires the work-with-BOLD prompt, not just generic project links', () => {
  const payload = extractTallyPayload(
    nextDataHtml({
      formId: 'A7aa0W',
      workspaceId: '3NbqgN',
      name: 'BOLD Expression of Interest',
      blocks: representativeConfiguredBlocks({ includeWorkWithBold: false }),
      integrations: [],
    }),
  )

  const result = verifyTallyExpressionOfInterestPayload(payload)

  assert.equal(result.ready, false)
  assert.match(
    result.failures.join('\n'),
    /missing baseline field: what the respondent wants to work on with BOLD/,
  )
})
