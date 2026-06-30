import type { NewsPost, NewsPostType } from '../content.ts'
import { newsPosts, newsTypeLabels } from '../content.ts'

export type NewsFilters = {
  query: string
  type: NewsPostType | 'all'
}

export const sortedNews = [...newsPosts].sort((a, b) =>
  b.date.localeCompare(a.date),
)

export function getFeaturedNews(limit = 3) {
  return sortedNews.filter((post) => post.featured).slice(0, limit)
}

export function filterNewsPosts({ query, type }: NewsFilters) {
  return sortedNews.filter((post) => {
    const normalizedQuery = query.trim().toLowerCase()
    const matchesType = type === 'all' || post.type === type
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [post.title, post.excerpt, ...post.tags]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)

    return matchesType && matchesQuery
  })
}

export function getRelatedPosts(post: NewsPost, limit = 3) {
  return sortedNews
    .filter(
      (candidate) =>
        candidate.slug !== post.slug &&
        candidate.tags.some((tag) => post.tags.includes(tag)),
    )
    .slice(0, limit)
}

export function getNewsPost(slug: string) {
  return newsPosts.find((post) => post.slug === slug)
}

export function getNewsHref(post: NewsPost) {
  if (post.externalUrl && !post.content && !post.socialEmbedUrl) {
    return post.externalUrl
  }

  return `/news/${post.slug}`
}

export function getNewsTypeOptions() {
  return [
    { label: 'All', value: 'all' },
    ...Object.entries(newsTypeLabels).map(([value, label]) => ({
      label,
      value,
    })),
  ]
}
