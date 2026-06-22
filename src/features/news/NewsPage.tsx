import { useState } from 'react'
import type { NewsPostType } from '../../content'
import {
  filterNewsPosts,
  getFeaturedNews,
  getNewsTypeOptions,
} from '../../domain/news'
import { ArticleCard } from '../../ui/cards/ArticleCard'
import { FilterBar } from '../../ui/forms/FilterBar'
import { SearchInput } from '../../ui/forms/SearchInput'
import { PageHero } from '../../ui/layout/PageHero'
import { SectionHeader } from '../../ui/layout/SectionHeader'
import { EmptyState } from '../../ui/primitives/EmptyState'

export function NewsPage() {
  const [type, setType] = useState<NewsPostType | 'all'>('all')
  const [query, setQuery] = useState('')

  const featuredPosts = getFeaturedNews()
  const archivePosts = filterNewsPosts({ query, type })

  return (
    <>
      <PageHero
        eyebrow="News"
        title="News"
        description="Read the latest articles, announcements, research updates, and stories from the institute."
      />

      <section className="section-band page-content">
        <SectionHeader
          eyebrow="Featured"
          title="Latest from the institute."
          description="Selected updates from the launch, research, and engineering programmes."
        />
        <div className="featured-news-layout">
          {featuredPosts.map((post, index) => (
            <ArticleCard featured={index === 0} key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section className="section-band muted-band page-content">
        <SectionHeader
          eyebrow="Archive"
          title="Browse all updates."
          description="Filter by content type or search across titles, excerpts, and tags."
        />

        <div className="filter-panel archive-filters">
          <SearchInput
            id="news-search"
            label="Search news"
            value={query}
            onChange={setQuery}
            placeholder="Search news"
          />
          <FilterBar
            label="Content type"
            options={getNewsTypeOptions()}
            value={type}
            onChange={(next) => setType(next as NewsPostType | 'all')}
          />
        </div>

        {archivePosts.length > 0 ? (
          <div className="article-grid archive-grid">
            {archivePosts.map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState message="No news posts match the selected filters." />
        )}
      </section>
    </>
  )
}
