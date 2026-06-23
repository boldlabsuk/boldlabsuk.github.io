import { pathToFileURL } from 'node:url'

export const TALLY_FORM_ID = 'A7aa0W'
export const TALLY_FORM_NAME = 'BOLD Expression of Interest'
export const TALLY_ROUTE_PARAMETER = 'route'
export const ACCEPTED_TALLY_ROUTES = [
  'phd-students',
  'visiting-students',
  'masters-students',
  'research-engineers',
  'fellows',
  'collaborators',
]

const baselineChecks = [
  ['full name', /full\s+name/i],
  ['email', /\bemail\b/i],
  ['current role/title', /current\s+role|role\/title|title/i],
  [
    'current organization/institution',
    /current\s+organi[sz]ation|current\s+institution|organi[sz]ation\/institution/i,
  ],
  ['location/time zone', /location|time\s*zone/i],
  ['fit statement', /fit\s+statement/i],
  ['200-400 word fit prompt', /200\s*-\s*400|200[^.]*400/i],
  ['relevant links', /relevant\s+links/i],
  ['free-form Research Direction Interest', /research\s+direction\s+interest/i],
  ['optional practical constraints', /constraints|timing|eligibility/i],
  ['desired timing', /desired\s+timing|ideally\s+start/i],
  [
    'what the respondent wants to work on with BOLD',
    /work\s+on\s+with\s+BOLD|project|technical\s+work|collaboration/i,
  ],
  [
    'current application or Formal Application Path status',
    /formal\s+application\s+path|formal\s+process|application\s+status|institutional\s+process/i,
  ],
  [
    'relevant BOLD people or groups',
    /relevant\s+BOLD\s+people|BOLD\s+researchers|supervisors|groups|labs/i,
  ],
]

const prohibitedChecks = [
  ['visible Desired role field', /desired\s+role/i],
  ['detailed immigration question', /\bimmigration\b/i],
  ['detailed visa question', /\bvisa\b/i],
  ['demographic question', /\bdemographic/i],
  ['equal-opportunities monitoring question', /equal[-\s]opportunities/i],
]

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
  const hiddenFields = blocks.flatMap((block) => {
    if (block.type !== 'HIDDEN_FIELDS') {
      return []
    }

    return Array.isArray(block.payload?.hiddenFields)
      ? block.payload.hiddenFields
          .map((field) => field?.name)
          .filter((name) => typeof name === 'string')
      : []
  })
  const blockText = blocks.map((block) => flattenText(block.payload)).join(' ')
  const blockTypes = blocks
    .map((block) => block.type)
    .filter((type) => typeof type === 'string')
  const integrations = Array.isArray(payload.integrations)
    ? payload.integrations
    : []

  return {
    formId: payload.formId,
    workspaceId: payload.workspaceId,
    name: payload.name,
    hiddenFields,
    blockTypes,
    blockText,
    hasFileUpload:
      blockTypes.some((type) => /file/i.test(type)) ||
      /CV\/resume upload|file upload/i.test(blockText),
    integrationsCount: integrations.length,
    visibleTextBlockCount: blocks.filter((block) => block.type === 'TEXT')
      .length,
  }
}

export function verifyTallyExpressionOfInterestPayload(payload) {
  const summary = summarizeTallyPayload(payload)
  const failures = []

  if (summary.formId !== TALLY_FORM_ID) {
    failures.push(`expected form ID ${TALLY_FORM_ID}, found ${summary.formId}`)
  }

  if (summary.name !== TALLY_FORM_NAME) {
    failures.push(`expected form name ${TALLY_FORM_NAME}, found ${summary.name}`)
  }

  if (!summary.hiddenFields.includes(TALLY_ROUTE_PARAMETER)) {
    failures.push(`missing hidden route field: ${TALLY_ROUTE_PARAMETER}`)
  }

  for (const [label, pattern] of baselineChecks) {
    if (!pattern.test(summary.blockText)) {
      failures.push(`missing baseline field: ${label}`)
    }
  }

  if (!summary.hasFileUpload) {
    failures.push('missing CV/resume upload field')
  }

  if (!/PDF only|Accepts PDF|PDF CV\/resume/i.test(summary.blockText)) {
    failures.push('missing visible PDF-only CV/resume guidance')
  }

  if (!/10\s*MB/i.test(summary.blockText)) {
    failures.push('missing visible 10 MB upload limit')
  }

  if (
    !/BOLD has received your Expression of Interest/i.test(summary.blockText) ||
    !/review Expressions of Interest periodically/i.test(summary.blockText) ||
    !/Formal applications? may still need/i.test(summary.blockText)
  ) {
    failures.push('missing non-promissory confirmation copy')
  }

  for (const [label, pattern] of prohibitedChecks) {
    if (pattern.test(summary.blockText)) {
      failures.push(`contains prohibited MVP content: ${label}`)
    }
  }

  if (summary.integrationsCount === 0) {
    failures.push(
      'public payload exposes no integrations; confirm Google Sheets sync and email notifications in Tally owner workspace',
    )
  }

  return {
    ready: failures.length === 0,
    failures,
    summary,
  }
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
