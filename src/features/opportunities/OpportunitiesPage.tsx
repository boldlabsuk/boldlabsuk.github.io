import { useState } from 'react'
import {
  expressionOfInterestFormConfig,
  getExpressionOfInterestEmbedUrl,
  opportunityRoutes,
} from '../../content'
import type {
  ExpressionOfInterestFormConfig,
  OpportunityRoute,
} from '../../content'
import { SectionHeader } from '../../ui/layout/SectionHeader'

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
        <SectionHeader
          eyebrow="Opportunities"
          title="Express interest in joining, visiting, working with, or collaborating with BOLD."
          titleElement="h1"
          description="BOLD reviews serious Expressions of Interest through a small set of approved Opportunity Routes. Choose the route that best matches the relationship you want to explore; detailed guidance and any Formal Application Path boundaries live on this Opportunities page."
        />
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
  const facts = [
    [getPlaceFactLabel(route.slug), route.location],
    ['Timing', route.timing],
    ['Formal Application Path', route.formalApplicationPath],
  ].filter((fact): fact is [string, string] => Boolean(fact[1]))

  return (
    <article className="opportunity-route-index-entry" id={route.slug}>
      <div className="opportunity-route-index-main">
        <div className="opportunity-route-index-heading">
          <p className="opportunity-route-status">{route.status}</p>
          <h3>{route.title}</h3>
        </div>
        <p>{route.shortSummary}</p>
      </div>

      <dl className="opportunity-route-index-facts">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <a
        className="button button-primary"
        href="#express-interest"
        aria-label={`Express interest in ${route.title}`}
        onClick={onSelect}
      >
        {route.primaryActionLabel}
      </a>
    </article>
  )
}

function getPlaceFactLabel(slug: string) {
  return slug === 'research-engineers' || slug === 'collaborators'
    ? 'Working mode'
    : 'Location'
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
      aria-labelledby="express-interest-heading"
    >
      <div className="expression-interest-copy">
        <p className="eyebrow">Expression of Interest</p>
        <h2 id="express-interest-heading">Select a role</h2>
        <p>
          Choose the Opportunity Route that best matches your interest. Changing
          route resets the embedded form.
        </p>
      </div>

      <div className="expression-interest-panel">
        <label className="select-filter opportunity-route-selector" htmlFor="opportunity-route-select">
          <span>Opportunity Route</span>
          <select
            id="opportunity-route-select"
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
        ) : (
          <p className="empty-state">
            Select an Opportunity Route to see route-specific guidance and load
            the embedded Expression of Interest form.
          </p>
        )}
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
  return (
    <div className="selected-route-form">
      <div className="selected-route-guidance">
        <h3>{route.title}</h3>
        <p>{route.positioning}</p>
        <p>{route.formPrompt}</p>
      </div>

      {embedUrl ? (
        <iframe
          key={embedUrl}
          src={embedUrl}
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

function getOpportunityRoute(slug: string | undefined) {
  return opportunityRoutes.find((route) => route.slug === slug)
}
