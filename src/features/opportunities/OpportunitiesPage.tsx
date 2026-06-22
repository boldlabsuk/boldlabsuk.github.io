import { involvementRoutes, opportunities, siteMeta } from '../../content'
import { InvolvementCard } from '../../ui/cards/InvolvementCard'
import { OpportunityCard } from '../../ui/cards/OpportunityCard'
import { PageHero } from '../../ui/layout/PageHero'
import { SectionHeader } from '../../ui/layout/SectionHeader'
import { EmptyState } from '../../ui/primitives/EmptyState'

export function OpportunitiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Opportunities"
        title="Opportunities"
        description="Join, visit, collaborate, or work with us."
        secondaryDescription="We welcome outstanding students, researchers, engineers, fellows, and collaborators who want to help shape the next generation of AI research."
      />

      <section className="section-band page-content">
        <SectionHeader
          eyebrow="Ways to Get Involved"
          title="Find the right route."
          description="Each route has a stable anchor so prospective students, visitors, engineers, fellows, and collaborators can link directly to the relevant guidance."
        />
        <div className="involvement-grid">
          {involvementRoutes.map((route) => (
            <InvolvementCard key={route.id} route={route} />
          ))}
        </div>
      </section>

      <section className="section-band muted-band page-content">
        <SectionHeader
          eyebrow="Current Open Opportunities"
          title="Advertised and rolling routes."
          description="Specific opportunities are listed here when available. Rolling expressions of interest remain welcome."
        />
        {opportunities.length > 0 ? (
          <div className="current-opportunity-list">
            {opportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        ) : (
          <EmptyState message="There are no specific advertised opportunities at the moment, but we welcome expressions of interest from exceptional students, researchers, engineers, fellows, and collaborators." />
        )}
      </section>

      <section className="section-band contact-section">
        <div>
          <p className="eyebrow">Intake Contact</p>
          <h2>Contact us about joining, visiting, or collaborating.</h2>
          <p>
            Use the intake email for general expressions of interest. Include who
            you are, which route you are interested in, short research or
            technical interests, a CV or website link, relevant papers, projects,
            or code, and proposed timing if relevant.
          </p>
        </div>
        <a className="button button-primary" href={`mailto:${siteMeta.contactEmail}`}>
          Contact us
        </a>
      </section>
    </>
  )
}
