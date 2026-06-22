import { paperTypeLabels } from '../../content'
import type { Paper } from '../../content'
import { getPrimaryPaperLink } from '../../domain/papers'
import { ExternalLink } from '../primitives/ExternalLink'
import { TagList, TagPill } from '../primitives/TagList'
import { PaperLinks } from './PaperLinks'

export function PaperCard({ paper }: { paper: Paper }) {
  const primaryLink = getPrimaryPaperLink(paper)

  return (
    <article className="paper-card">
      <div className="paper-card-top">
        <TagPill>{paperTypeLabels[paper.paperType]}</TagPill>
        <span>{paper.year}</span>
      </div>
      <h3>
        {primaryLink ? (
          <ExternalLink href={primaryLink}>{paper.title}</ExternalLink>
        ) : (
          paper.title
        )}
      </h3>
      {paper.authors.length > 0 && (
        <p className="authors">{paper.authors.join(', ')}</p>
      )}
      <p>{paper.summary ?? paper.abstract}</p>
      <TagList tags={paper.researchAreas.slice(0, 3)} />
      <PaperLinks paper={paper} />
    </article>
  )
}
