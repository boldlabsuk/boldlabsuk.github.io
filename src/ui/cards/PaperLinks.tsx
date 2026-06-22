import type { Paper } from '../../content'
import { ExternalLink } from '../primitives/ExternalLink'

export function PaperLinks({ paper }: { paper: Paper }) {
  const linkEntries: [string, string | undefined][] = [
    ['Paper', paper.links.paper],
    ['PDF', paper.links.pdf],
    ['Code', paper.links.code],
    ['Project', paper.links.project],
    ['BibTeX', paper.links.bibtex],
  ]

  return (
    <div className="inline-links">
      {linkEntries
        .filter((entry): entry is [string, string] => Boolean(entry[1]))
        .map(([label, href]) =>
          href.startsWith('@') ? (
            <span className="bibtex-chip" key={label}>
              BibTeX available
            </span>
          ) : (
            <ExternalLink href={href} key={label}>
              {label}
            </ExternalLink>
          ),
        )}
    </div>
  )
}
