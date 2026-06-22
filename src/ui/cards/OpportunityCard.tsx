import { opportunityTypeLabels } from '../../content'
import type { Opportunity } from '../../content'
import { formatDate, titleCase } from '../../lib/format'
import { ExternalLink } from '../primitives/ExternalLink'
import { TagPill } from '../primitives/TagList'

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  return (
    <article className="current-opportunity-card">
      <div>
        <TagPill>{opportunityTypeLabels[opportunity.type]}</TagPill>
        <TagPill>{titleCase(opportunity.status)}</TagPill>
      </div>
      <h3>{opportunity.title}</h3>
      <p>{opportunity.summary}</p>
      <dl>
        {opportunity.location && (
          <div>
            <dt>Location</dt>
            <dd>{opportunity.location}</dd>
          </div>
        )}
        {opportunity.deadline && (
          <div>
            <dt>Deadline</dt>
            <dd>{formatDate(opportunity.deadline)}</dd>
          </div>
        )}
      </dl>
      <div className="inline-links">
        {opportunity.link && (
          <ExternalLink href={opportunity.link}>View details</ExternalLink>
        )}
        {opportunity.contactEmail && (
          <a href={`mailto:${opportunity.contactEmail}`}>Contact</a>
        )}
      </div>
    </article>
  )
}
