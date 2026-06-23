import { opportunityRoutes } from '../../content'
import type { OpportunityRoute } from '../../content'
import { SectionHeader } from '../../ui/layout/SectionHeader'

export function OpportunitiesPage() {
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
          <OpportunityRouteIndexEntry key={route.slug} route={route} />
        ))}
      </div>
    </section>
  )
}

function OpportunityRouteIndexEntry({ route }: { route: OpportunityRoute }) {
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
        href={`/opportunities#${route.slug}`}
        aria-label={`Express interest in ${route.title}`}
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
