import { useEffect, useState } from 'react'
import type {
  ExpressionOfInterestFormConfig,
  OpportunityRoute,
} from '../../content'
import {
  expressionOfInterestFormConfig,
  getExpressionOfInterestEmbedUrl,
  opportunityRoutes,
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
    <>
      <OpportunitiesHero />
      <div className="home-section opportunities-intake">
        <ExpressionOfInterestSection
          formConfig={formConfig}
          selectedRoute={selectedRoute}
          selectedRouteSlug={selectedRouteSlug}
          onSelectedRouteChange={setSelectedRouteSlug}
        />
      </div>
      <BoldFellowsSection />
    </>
  )
}

function OpportunitiesHero() {
  return (
    <section
      className="home-section opportunities-hero"
      aria-labelledby="opportunities-title"
    >
      <div className="home-section-inner opportunities-index-intro">
        <h1 id="opportunities-title">Express your interest in BOLD.</h1>
        <p>We may be in touch if a relevant opportunity arises.</p>
      </div>
    </section>
  )
}

function BoldFellowsSection() {
  return (
    <section
      className="home-section opportunities-fellows"
      aria-labelledby="bold-fellows-title"
    >
      <div className="home-section-inner split-section-layout">
        <h2 className="home-section-title" id="bold-fellows-title">
          BOLD Fellows
        </h2>
        <div className="section-prose">
          <p>
            Explore BOLD Fellowship opportunities through the University of
            Oxford.
          </p>
          <a
            className="button button-primary"
            href="https://eng.ox.ac.uk/jobs/job-detail?vacancyID=187853"
          >
            View Oxford job advert
          </a>
        </div>
      </div>
    </section>
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
          <span>I’m interested in…</span>
          <select
            id="opportunity-route-select"
            required
            value={selectedRouteSlug}
            onChange={(event) => onSelectedRouteChange(event.target.value)}
          >
            <option value="">Choose an area of interest</option>
            {opportunityRoutes.map((route) => (
              <option key={route.slug} value={route.slug}>
                {route.title}
              </option>
            ))}
          </select>
        </label>

        {selectedRoute ? (
          <SelectedRouteForm embedUrl={embedUrl} route={selectedRoute} />
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
        <p>{route.description}</p>
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
          <p>Please check back later to express your interest in BOLD.</p>
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
