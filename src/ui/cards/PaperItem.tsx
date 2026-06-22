import { paperTypeLabels } from '../../content'
import type { Paper } from '../../content'
import { getPrimaryPaperLink } from '../../domain/papers'
import { ExternalLink } from '../primitives/ExternalLink'
import { TagPill } from '../primitives/TagList'
import { PaperLinks } from './PaperLinks'

export function PaperItem({ paper }: { paper: Paper }) {
  const primaryLink = getPrimaryPaperLink(paper)

  return (
    <article className="publication-row">
      <div className="publication-date">
        <span>{paper.year}</span>
        <small>{paper.venue ?? paperTypeLabels[paper.paperType]}</small>
      </div>
      <div className="publication-main">
        <h4>
          {primaryLink ? (
            <ExternalLink href={primaryLink}>{paper.title}</ExternalLink>
          ) : (
            paper.title
          )}
        </h4>
        <p className="authors">{paper.authors.join(', ')}</p>
        {(paper.summary || paper.abstract) && (
          <p>{paper.summary ?? paper.abstract}</p>
        )}
        <div className="publication-tags">
          <TagPill>{paperTypeLabels[paper.paperType]}</TagPill>
          {paper.researchAreas.map((tag) => (
            <TagPill key={tag}>{tag}</TagPill>
          ))}
        </div>
        <PaperLinks paper={paper} />
      </div>
    </article>
  )
}
