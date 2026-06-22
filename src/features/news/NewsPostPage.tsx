import { newsTypeLabels } from '../../content'
import { getNewsPost, getRelatedPosts } from '../../domain/news'
import { getAuthors } from '../../domain/people'
import { formatDate } from '../../lib/format'
import { ArticleCard } from '../../ui/cards/ArticleCard'
import { PageHero } from '../../ui/layout/PageHero'
import { SectionHeader } from '../../ui/layout/SectionHeader'
import { ExternalLink } from '../../ui/primitives/ExternalLink'
import { TagList, TagPill } from '../../ui/primitives/TagList'
import { NotFoundPage } from '../not-found/NotFoundPage'

export function NewsPostPage({ slug }: { slug: string }) {
  const post = getNewsPost(slug)

  if (!post) {
    return <NotFoundPage />
  }

  const authors = getAuthors(post.authorIds)
  const relatedPosts = getRelatedPosts(post)

  return (
    <>
      <PageHero
        eyebrow={newsTypeLabels[post.type]}
        title={post.title}
        description={post.excerpt}
      />
      <article className="section-band article-detail">
        <header className="article-detail-header">
          <div className="article-meta-line">
            <TagPill>{newsTypeLabels[post.type]}</TagPill>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {authors.length > 0 && <span>{authors.join(', ')}</span>}
          </div>
          <TagList tags={post.tags} />
        </header>

        {post.socialEmbedUrl && (
          <div className="social-embed">
            <span>Social post</span>
            <p>
              This announcement is available as an external public social post.
            </p>
            <ExternalLink href={post.socialEmbedUrl}>Open social post</ExternalLink>
          </div>
        )}

        {post.content ? (
          <div className="article-body">
            {post.content.split('\n\n').map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <div className="article-body">
            <p>{post.excerpt}</p>
          </div>
        )}

        {post.externalUrl && (
          <a
            className="button button-primary"
            href={post.externalUrl}
            rel="noreferrer"
            target="_blank"
          >
            Read external article
          </a>
        )}
      </article>

      {relatedPosts.length > 0 && (
        <section className="section-band muted-band">
          <SectionHeader
            eyebrow="Related"
            title="More from the institute."
            description="Related posts selected by shared tags."
          />
          <div className="article-grid">
            {relatedPosts.map((relatedPost) => (
              <ArticleCard key={relatedPost.slug} post={relatedPost} compact />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
