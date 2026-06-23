import type {
  ExpressionOfInterestFormConfig,
  OpportunityRoute,
} from './types.ts'

export const expressionOfInterestFormConfig: ExpressionOfInterestFormConfig = {
  formUrl: 'https://tally.so/r/A7aa0W',
  routeParameterName: 'route',
}

const tallyHostnames = new Set(['tally.so', 'www.tally.so'])

export function getExpressionOfInterestEmbedUrl(
  route: Pick<OpportunityRoute, 'prefillValue'>,
  config: ExpressionOfInterestFormConfig | null | undefined = expressionOfInterestFormConfig,
) {
  if (!config) {
    return undefined
  }

  const routeParameterName = config.routeParameterName.trim()
  if (!routeParameterName) {
    return undefined
  }

  const formId = getTallyFormId(config)
  if (!formId) {
    return undefined
  }

  const embedUrl = new URL(
    `https://tally.so/embed/${encodeURIComponent(formId)}`,
  )
  embedUrl.searchParams.set(routeParameterName, route.prefillValue)

  return embedUrl.toString()
}

function getTallyFormId(config: ExpressionOfInterestFormConfig) {
  const configuredFormId = normalizeTallyFormId(config.formId)
  if (configuredFormId) {
    return configuredFormId
  }

  if (!config.formUrl) {
    return undefined
  }

  let formUrl: URL
  try {
    formUrl = new URL(config.formUrl)
  } catch {
    return undefined
  }

  if (!tallyHostnames.has(formUrl.hostname)) {
    return undefined
  }

  const [pathKind, formId] = formUrl.pathname.split('/').filter(Boolean)

  if (pathKind !== 'r' && pathKind !== 'embed') {
    return undefined
  }

  return normalizeTallyFormId(formId)
}

function normalizeTallyFormId(formId: string | undefined) {
  const normalizedFormId = formId?.trim()

  return normalizedFormId && !/[/?#]/.test(normalizedFormId)
    ? normalizedFormId
    : undefined
}
