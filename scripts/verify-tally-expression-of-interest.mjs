import { pathToFileURL } from 'node:url'

export const TALLY_FORM_ID = 'A7aa0W'
export const TALLY_FORM_NAME = 'BOLD Expression of Interest'
export const TALLY_ROUTE_PARAMETER = 'route'
export const ACCEPTED_TALLY_ROUTES = [
  'phd-students',
  'visiting-students',
  'masters-students',
  'research-engineers',
  'collaborators',
]

const fieldChecks = [
  {
    name: 'full name',
    label: /^(full )?name$/i,
    type: 'INPUT_TEXT',
    required: true,
  },
  { name: 'email', label: /^email$/i, type: 'INPUT_EMAIL', required: true },
  {
    name: 'research connection note',
    label: /connection.*BOLD.*research/i,
    type: 'TEXTAREA',
    required: true,
  },
  {
    name: 'profile links',
    label: /^(profile|relevant) links/i,
    type: 'TEXTAREA',
    required: false,
  },
  { name: 'CV', label: /^CV\b/i, type: 'FILE_UPLOAD', required: false },
]

const contentBlockTypes = new Set([
  'FORM_TITLE',
  'HIDDEN_FIELDS',
  'TEXT',
  'PAGE_BREAK',
])

export function buildTallyEmbedUrl(routeValue) {
  const url = new URL(`https://tally.so/embed/${TALLY_FORM_ID}`)
  url.searchParams.set(TALLY_ROUTE_PARAMETER, routeValue)

  return url.toString()
}

export function extractTallyPayload(html) {
  const match = html.match(
    /<script[^>]+id=["']__NEXT_DATA__["'][^>]*>(?<json>[\s\S]*?)<\/script>/,
  )

  if (!match?.groups?.json) {
    throw new Error('Could not find Tally __NEXT_DATA__ payload')
  }

  const nextData = JSON.parse(match.groups.json)
  const pageProps = nextData?.props?.pageProps

  if (!pageProps || typeof pageProps !== 'object') {
    throw new Error('Tally __NEXT_DATA__ payload did not include pageProps')
  }

  return pageProps
}

export function summarizeTallyPayload(payload) {
  const blocks = Array.isArray(payload.blocks) ? payload.blocks : []
  const hiddenFields = blocks.flatMap((block) =>
    block.type === 'HIDDEN_FIELDS' && Array.isArray(block.payload?.hiddenFields)
      ? block.payload.hiddenFields
          .map((field) => field?.name)
          .filter((name) => typeof name === 'string')
      : [],
  )
  return {
    formId: payload.formId,
    name: payload.name,
    hiddenFields,
    blockTypes: blocks.map((block) => block.type),
    blockText: blocks.map((block) => flattenText(block.payload)).join(' '),
    confirmationText: getConfirmationText(blocks),
    submitLabel: blocks.find((block) => block.type === 'FORM_TITLE')?.payload
      ?.button?.label,
    fields: summarizeInputFields(blocks),
    integrationsCount: Array.isArray(payload.integrations)
      ? payload.integrations.length
      : 0,
  }
}

function summarizeInputFields(blocks) {
  const fields = []
  let label = ''
  let isThankYouPage = false
  for (const block of blocks) {
    if (block.type === 'PAGE_BREAK') {
      label = ''
      isThankYouPage = block.payload?.isThankYouPage === true
    }
    if (isThankYouPage) {
      continue
    }
    if (block.type === 'TITLE') {
      label = flattenText(block.payload)
    } else if (!contentBlockTypes.has(block.type)) {
      fields.push({ label, type: block.type, payload: block.payload })
      label = ''
    }
  }
  return fields
}

function checkInputFields(fields) {
  const failures = []
  for (const check of fieldChecks) {
    const matches = fields.filter((field) => check.label.test(field.label))
    if (matches.length !== 1 || matches[0].type !== check.type) {
      failures.push(`expected one ${check.name} ${check.type} input`)
    } else if (matches[0].payload?.isRequired !== check.required) {
      failures.push(
        `${check.name} must be ${check.required ? 'required' : 'optional'}`,
      )
    }
  }
  for (const field of fields) {
    if (!fieldChecks.some((check) => check.label.test(field.label))) {
      failures.push(`unexpected input: ${field.label || field.type}`)
    }
  }
  return failures
}

export function verifyTallyExpressionOfInterestPayload(payload) {
  const summary = summarizeTallyPayload(payload)
  const failures = checkInputFields(summary.fields)
  if (summary.formId !== TALLY_FORM_ID) {
    failures.push(`expected form ID ${TALLY_FORM_ID}, found ${summary.formId}`)
  }
  if (summary.name !== TALLY_FORM_NAME) {
    failures.push(
      `expected form name ${TALLY_FORM_NAME}, found ${summary.name}`,
    )
  }
  if (!summary.hiddenFields.includes(TALLY_ROUTE_PARAMETER)) {
    failures.push(`missing hidden route field: ${TALLY_ROUTE_PARAMETER}`)
  }
  const upload = summary.fields.find((field) => field.type === 'FILE_UPLOAD')
  const constraints = summarizeFileUpload(upload?.payload)
  if (!constraints.pdfOnly) {
    failures.push('missing PDF-only CV/resume setting')
  }
  if (!constraints.hasTenMbLimit) {
    failures.push('missing 10 MB upload limit setting')
  }
  if (!hasRequiredConfirmationCopy(summary.confirmationText)) {
    failures.push('missing non-promissory confirmation copy')
  }
  if (summary.submitLabel !== 'Express interest') {
    failures.push('submission action must be Express interest')
  }
  if (summary.blockTypes.includes('CONDITIONAL_LOGIC')) {
    failures.push('shared intake must not use conditional logic')
  }
  if (
    /\bapply\b|200\s*[-–]\s*400|(?:will|'ll|’ll)\s+(?:contact|respond|reply)|review.*periodically/i.test(
      summary.blockText,
    )
  ) {
    failures.push('form contains recruitment wording or response promises')
  }
  return { ready: failures.length === 0, failures, summary }
}

export async function verifyLiveTallyExpressionOfInterest(fetchImpl = fetch) {
  const routeResults = []

  for (const routeValue of ACCEPTED_TALLY_ROUTES) {
    const url = buildTallyEmbedUrl(routeValue)
    const response = await fetchImpl(url)
    const html = await response.text()
    const payload = extractTallyPayload(html)
    const result = verifyTallyExpressionOfInterestPayload(payload)

    routeResults.push({
      routeValue,
      url,
      status: response.status,
      ...result,
    })
  }

  return {
    ready:
      routeResults.every((result) => result.status === 200) &&
      routeResults.every((result) => result.ready),
    routeResults,
  }
}

function flattenText(value) {
  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value)) {
    return value.map(flattenText).join(' ')
  }

  if (value && typeof value === 'object') {
    return Object.values(value).map(flattenText).join(' ')
  }

  return ''
}

function summarizeFileUpload(payload) {
  const allowedExtensions = Object.values(payload?.allowedFiles ?? {})
    .flat()
    .filter((extension) => typeof extension === 'string')
    .map((extension) => extension.toLowerCase())
  const maxFileSizeUnit =
    typeof payload?.maxFileSizeUnit === 'string'
      ? payload.maxFileSizeUnit.toLowerCase()
      : ''

  return {
    pdfOnly:
      allowedExtensions.length > 0 &&
      allowedExtensions.every((extension) => extension === '.pdf'),
    hasTenMbLimit:
      payload?.hasMaxFileSize === true &&
      Number(payload.maxFileSize) === 10 &&
      maxFileSizeUnit === 'mb',
  }
}

function getConfirmationText(blocks) {
  let isThankYouPage = false
  const text = []
  for (const block of blocks) {
    if (block.type === 'PAGE_BREAK') {
      isThankYouPage = block.payload?.isThankYouPage === true
    } else if (isThankYouPage && ['TEXT', 'TITLE'].includes(block.type)) {
      text.push(flattenText(block.payload))
    }
  }
  return text.join(' ').replace(/\s+/g, ' ').trim()
}

function hasRequiredConfirmationCopy(text) {
  return (
    text ===
    'Thank you for expressing your interest in BOLD. ' +
      'We may be in touch if a relevant opportunity arises.'
  )
}

async function main() {
  const result = await verifyLiveTallyExpressionOfInterest()

  for (const routeResult of result.routeResults) {
    console.log(`${routeResult.routeValue}: HTTP ${routeResult.status}`)
    console.log(
      `  form=${routeResult.summary.formId} title="${routeResult.summary.name}" hidden=${routeResult.summary.hiddenFields.join(',') || 'none'} blocks=${routeResult.summary.blockTypes.join(',') || 'none'} integrations=${routeResult.summary.integrationsCount}`,
    )

    if (!routeResult.ready) {
      for (const failure of routeResult.failures) {
        console.log(`  - ${failure}`)
      }
    }
  }

  if (!result.ready) {
    process.exitCode = 1
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
