import { type NewsPost, newsTypeLabels } from '../../content'
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

  return (
    <>
      <PageHero
        eyebrow={newsTypeLabels[post.type]}
        title={post.title}
        description={post.excerpt}
      />
      <NewsArticle post={post} />
      <RelatedNews post={post} />
    </>
  )
}

function NewsArticle({ post }: { post: NewsPost }) {
  return (
    <article className="section-band article-detail">
      <NewsArticleHeader post={post} />
      {post.socialEmbedUrl && (
        <div className="social-embed">
          <span>Social post</span>
          <p>
            This announcement is available as an external public social post.
          </p>
          <ExternalLink href={post.socialEmbedUrl}>
            Open social post
          </ExternalLink>
        </div>
      )}
      <NewsArticleBody post={post} />
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
  )
}

function NewsArticleHeader({ post }: { post: NewsPost }) {
  const authors = getAuthors(post.authorIds)

  return (
    <header className="article-detail-header">
      <div className="article-meta-line">
        <TagPill>{newsTypeLabels[post.type]}</TagPill>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        {authors.length > 0 && <span>{authors.join(', ')}</span>}
      </div>
      <TagList tags={post.tags} />
    </header>
  )
}

function NewsArticleBody({ post }: { post: NewsPost }) {
  const paragraphs = post.content ? post.content.split('\n\n') : [post.excerpt]

  return (
    <div className="article-body">
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  )
}

function RelatedNews({ post }: { post: NewsPost }) {
  const relatedPosts = getRelatedPosts(post)

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <section className="section-band muted-band">
      <SectionHeader
        eyebrow="Related"
        title="More from the lab."
        description="Related posts selected by shared tags."
      />
      <div className="article-grid">
        {relatedPosts.map((relatedPost) => (
          <ArticleCard key={relatedPost.slug} post={relatedPost} compact />
        ))}
      </div>
    </section>
  )
}
