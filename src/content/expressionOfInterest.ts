import type {
  ExpressionOfInterestFormConfig,
  OpportunityRoute,
} from './types.ts'

export const expressionOfInterestFormConfig: ExpressionOfInterestFormConfig = {
  formUrl: 'https://tally.so/r/A7aa0W',
  routeParameterName: 'route',
}

export function getExpressionOfInterestEmbedUrl(
  route: Pick<OpportunityRoute, 'prefillValue'>,
  config: ExpressionOfInterestFormConfig | null | undefined = expressionOfInterestFormConfig,
) {
  if (!config) {
    return undefined
  }

  const formId = getTallyFormId(config)
  if (!formId) {
    return undefined
  }

  const embedUrl = new URL(`https://tally.so/embed/${formId}`)
  embedUrl.searchParams.set(config.routeParameterName, route.prefillValue)

  return embedUrl.toString()
}

function getTallyFormId(config: ExpressionOfInterestFormConfig) {
  if (config.formId) {
    return config.formId
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

  const [, pathKind, formId] = formUrl.pathname.split('/')

  return pathKind === 'r' || pathKind === 'embed' ? formId : undefined
}
