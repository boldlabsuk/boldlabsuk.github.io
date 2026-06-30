import type { NewsPost } from '../../content'
import { newsTypeLabels } from '../../content'
import { getNewsHref } from '../../domain/news'
import { getAuthors } from '../../domain/people'
import { formatDate } from '../../lib/format'
import { isExternalUrl } from '../../lib/url'
import { TagList, TagPill } from '../primitives/TagList'

export function ArticleCard({
  post,
  featured = false,
  compact = false,
}: {
  post: NewsPost
  featured?: boolean
  compact?: boolean
}) {
  const href = getNewsHref(post)
  const isExternal = isExternalUrl(href)
  const authors = getAuthors(post.authorIds)

  return (
    <article
      className={[
        'article-card',
        featured ? 'article-card-featured' : '',
        compact ? 'article-card-compact' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="card-visual" aria-hidden="true">
        <span>{newsTypeLabels[post.type]}</span>
      </div>
      <div className="card-body">
        <div className="article-card-meta">
          <TagPill>{newsTypeLabels[post.type]}</TagPill>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>
        <h3>
          <a
            href={href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noreferrer' : undefined}
          >
            {post.title}
          </a>
        </h3>
        <p>{post.excerpt}</p>
        {authors.length > 0 && (
          <p className="byline">By {authors.join(', ')}</p>
        )}
        <TagList tags={post.tags.slice(0, compact ? 2 : 3)} />
      </div>
    </article>
  )
}
