import { useEffect, useState } from 'react'
import {
  expressionOfInterestFormConfig,
  getExpressionOfInterestEmbedUrl,
  opportunityRoutes,
} from '../../content'
import type {
  ExpressionOfInterestFormConfig,
  OpportunityRoute,
} from '../../content'

const tallyEmbedScriptId = 'tally-embed-script'
const tallyEmbedScriptSrc = 'https://tally.so/widgets/embed.js'

type TallyWindow = Window & {
  Tally?: {
    loadEmbeds?: () => void
  }
}

type OpportunitiesPageProps = {
  formConfig?: ExpressionOfInterestFormConfig | null
  initialSelectedRouteSlug?: string
}

export function OpportunitiesPage({
  formConfig = expressionOfInterestFormConfig,
  initialSelectedRouteSlug,
}: OpportunitiesPageProps = {}) {
  const initialSelectedRoute = getOpportunityRoute(initialSelectedRouteSlug)
  const [selectedRouteSlug, setSelectedRouteSlug] = useState(
    initialSelectedRoute?.slug ?? '',
  )
  const selectedRoute = getOpportunityRoute(selectedRouteSlug)

  return (
    <section className="section-band page-content opportunities-index-page">
      <div className="opportunities-index-intro">
        <h1>Interested in joining, visiting, or collaborating with BOLD?</h1>
      </div>

      <div className="opportunity-route-index" aria-label="Opportunity Routes">
        {opportunityRoutes.map((route) => (
          <OpportunityRouteIndexEntry
            key={route.slug}
            route={route}
            onSelect={() => setSelectedRouteSlug(route.slug)}
          />
        ))}
      </div>

      <ExpressionOfInterestSection
        formConfig={formConfig}
        selectedRoute={selectedRoute}
        selectedRouteSlug={selectedRouteSlug}
        onSelectedRouteChange={setSelectedRouteSlug}
      />
    </section>
  )
}

function OpportunityRouteIndexEntry({
  route,
  onSelect,
}: {
  route: OpportunityRoute
  onSelect: () => void
}) {
  return (
    <article className="opportunity-route-index-entry" id={route.slug}>
      <div className="opportunity-route-index-main">
        <div className="opportunity-route-index-heading">
          <h3>{route.title}</h3>
        </div>
        <p>{route.shortSummary}</p>
      </div>

      <a
        className="button button-primary"
        href="#express-interest"
        aria-label={`Apply for ${route.title}`}
        onClick={onSelect}
      >
        {route.primaryActionLabel}
      </a>
    </article>
  )
}

function ExpressionOfInterestSection({
  formConfig,
  selectedRoute,
  selectedRouteSlug,
  onSelectedRouteChange,
}: {
  formConfig: ExpressionOfInterestFormConfig | null
  selectedRoute: OpportunityRoute | undefined
  selectedRouteSlug: string
  onSelectedRouteChange: (slug: string) => void
}) {
  const embedUrl = selectedRoute
    ? getExpressionOfInterestEmbedUrl(selectedRoute, formConfig)
    : undefined

  return (
    <section
      className="expression-interest-section"
      id="express-interest"
      aria-label="Expression of Interest form"
    >
      <div className="expression-interest-panel">
        <label
          className="select-filter opportunity-route-selector"
          htmlFor="opportunity-route-select"
        >
          <select
            id="opportunity-route-select"
            aria-label="Select a role"
            value={selectedRouteSlug}
            onChange={(event) => onSelectedRouteChange(event.target.value)}
          >
            <option value="">Select a role</option>
            {opportunityRoutes.map((route) => (
              <option key={route.slug} value={route.slug}>
                {route.title}
              </option>
            ))}
          </select>
        </label>

        {selectedRoute ? (
          <SelectedRouteForm
            embedUrl={embedUrl}
            route={selectedRoute}
          />
        ) : null}
      </div>
    </section>
  )
}

function SelectedRouteForm({
  embedUrl,
  route,
}: {
  embedUrl: string | undefined
  route: OpportunityRoute
}) {
  const autoResizeEmbedUrl = embedUrl
    ? getAutoResizeEmbedUrl(embedUrl)
    : undefined

  useTallyEmbedResizer(autoResizeEmbedUrl)

  return (
    <div className="selected-route-form">
      <div className="selected-route-guidance">
        <h3>{route.title}</h3>
        <p>{route.positioning}</p>
        <p>{route.howThisWorks}</p>
        <p>{route.formPrompt}</p>
      </div>

      {autoResizeEmbedUrl ? (
        <iframe
          key={autoResizeEmbedUrl}
          src={autoResizeEmbedUrl}
          title={`${route.title} Expression of Interest form`}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <div className="empty-state">
          <h3>Form coming soon</h3>
          <p>{route.formComingSoon}</p>
          <p>
            This section will host the embedded Expression of Interest form. It
            will not replace any separate Formal Application Path where one is
            required.
          </p>
        </div>
      )}
    </div>
  )
}

function getAutoResizeEmbedUrl(embedUrl: string) {
  const autoResizeEmbedUrl = new URL(embedUrl)
  autoResizeEmbedUrl.searchParams.set('dynamicHeight', '1')
  return autoResizeEmbedUrl.toString()
}

function useTallyEmbedResizer(embedUrl: string | undefined) {
  useEffect(() => {
    if (!embedUrl) {
      return
    }

    let cancelled = false
    const tallyWindow = window as TallyWindow
    const loadEmbeds = () => {
      if (!cancelled) {
        tallyWindow.Tally?.loadEmbeds?.()
      }
    }

    if (tallyWindow.Tally?.loadEmbeds) {
      loadEmbeds()
      return () => {
        cancelled = true
      }
    }

    const existingScript = document.getElementById(tallyEmbedScriptId)
    if (existingScript) {
      existingScript.addEventListener('load', loadEmbeds)
      return () => {
        cancelled = true
        existingScript.removeEventListener('load', loadEmbeds)
      }
    }

    const script = document.createElement('script')
    script.id = tallyEmbedScriptId
    script.src = tallyEmbedScriptSrc
    script.async = true
    script.addEventListener('load', loadEmbeds)
    document.body.appendChild(script)

    return () => {
      cancelled = true
      script.removeEventListener('load', loadEmbeds)
    }
  }, [embedUrl])
}

function getOpportunityRoute(slug: string | undefined) {
  return opportunityRoutes.find((route) => route.slug === slug)
}
