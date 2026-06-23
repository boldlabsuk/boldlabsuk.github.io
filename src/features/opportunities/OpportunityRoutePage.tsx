import {
  expressionOfInterestFormConfig,
  getExpressionOfInterestEmbedUrl,
  opportunityRoutes,
} from '../../content'
import type {
  ExpressionOfInterestFormConfig,
  OpportunityRoute,
} from '../../content'
import { NotFoundPage } from '../not-found/NotFoundPage'

type OpportunityRoutePageProps = {
  slug: string
  formConfig?: ExpressionOfInterestFormConfig | null
}

export function OpportunityRoutePage({
  slug,
  formConfig = expressionOfInterestFormConfig,
}: OpportunityRoutePageProps) {
  const route = opportunityRoutes.find((item) => item.slug === slug)

  if (!route) {
    return <NotFoundPage />
  }

  const facts = [
    ['Status', route.status],
    [getPlaceFactLabel(route.slug), route.location],
    ['Timing', route.timing],
    ['Formal Application Path', route.formalApplicationPath],
  ].filter((fact): fact is [string, string] => Boolean(fact[1]))

  return (
    <>
      <section className="page-hero opportunity-route-hero">
        <div className="page-hero-inner">
          <p className="eyebrow">Expression of Interest</p>
          <h1>{route.title}</h1>
          <p>{route.positioning}</p>
          <a className="button button-primary" href="#express-interest">
            {route.primaryActionLabel}
          </a>
        </div>
      </section>

      <section className="section-band page-content opportunity-route-page">
        <dl className="opportunity-facts">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <div className="opportunity-route-layout">
          <article>
            <p className="detail-lede">{route.shortSummary}</p>

            <section>
              <h2>Who this is for</h2>
              <ul>
                {route.whoThisIsFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2>What we look for</h2>
              <ul>
                {route.whatWeLookFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2>How this works</h2>
              <p>{route.howThisWorks}</p>
            </section>
          </article>

          <ExpressionOfInterestPanel route={route} formConfig={formConfig} />
        </div>
      </section>
    </>
  )
}

function ExpressionOfInterestPanel({
  route,
  formConfig,
}: {
  route: OpportunityRoute
  formConfig: ExpressionOfInterestFormConfig | null
}) {
  const embedUrl = getExpressionOfInterestEmbedUrl(route, formConfig)

  return (
    <aside className="expression-interest-panel" id="express-interest">
      <p className="eyebrow">{route.primaryActionLabel}</p>
      {embedUrl ? (
        <>
          <h2>Expression of Interest form</h2>
          <FormGuidance route={route} />
          <iframe
            src={embedUrl}
            title={`${route.title} Expression of Interest form`}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </>
      ) : (
        <>
          <h2>Form coming soon</h2>
          <p>{route.formComingSoon}</p>
          <FormGuidance route={route} />
          <p>
            This page will host the embedded Expression of Interest form for the{' '}
            {route.title} route. It will not replace any separate Formal
            Application Path where one is required.
          </p>
        </>
      )}
    </aside>
  )
}

function FormGuidance({ route }: { route: OpportunityRoute }) {
  return (
    <>
      <p>{getCvGuidance(route)}</p>
      <p>
        We review Expressions of Interest periodically and contact people if
        there is a strong fit with current BOLD priorities, supervision
        capacity, or open opportunities.
      </p>
    </>
  )
}

function getCvGuidance(route: OpportunityRoute) {
  return route.slug === 'collaborators'
    ? 'For collaborators, a PDF CV/resume is optional; proposal details, relevant people, and links can be more useful.'
    : 'Prepare a PDF CV/resume before you submit; the intake form is PDF-only for CV/resume uploads.'
}

function getPlaceFactLabel(slug: string) {
  return slug === 'research-engineers' || slug === 'collaborators'
    ? 'Working mode'
    : 'Location'
}
