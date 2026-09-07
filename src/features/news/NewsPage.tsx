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
  return (
    <>
      <PageHero
        eyebrow="News"
        title="News"
        description="Read the latest articles, announcements, research updates, and stories from the lab."
      />
      <FeaturedNews />
      <NewsArchive />
    </>
  )
}

function FeaturedNews() {
  return (
    <section className="section-band page-content">
      <SectionHeader
        eyebrow="Featured"
        title="Latest from the lab."
        description="Selected updates from the launch, research, and engineering programmes."
      />
      <div className="featured-news-layout">
        {getFeaturedNews().map((post, index) => (
          <ArticleCard featured={index === 0} key={post.slug} post={post} />
        ))}
      </div>
    </section>
  )
}

function NewsArchive() {
  const [type, setType] = useState<NewsPostType | 'all'>('all')
  const [query, setQuery] = useState('')
  const archivePosts = filterNewsPosts({ query, type })

  return (
    <section className="section-band muted-band page-content">
      <SectionHeader
        eyebrow="Archive"
        title="Browse all updates."
        description="Filter by content type or search across titles, excerpts, and tags."
      />
      <NewsFilters
        query={query}
        type={type}
        onQueryChange={setQuery}
        onTypeChange={setType}
      />
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
  )
}

function NewsFilters({
  query,
  type,
  onQueryChange,
  onTypeChange,
}: {
  query: string
  type: NewsPostType | 'all'
  onQueryChange: (query: string) => void
  onTypeChange: (type: NewsPostType | 'all') => void
}) {
  return (
    <div className="filter-panel archive-filters">
      <SearchInput
        id="news-search"
        label="Search news"
        value={query}
        onChange={onQueryChange}
        placeholder="Search news"
      />
      <FilterBar
        label="Content type"
        options={getNewsTypeOptions()}
        value={type}
        onChange={(next) => onTypeChange(next as NewsPostType | 'all')}
      />
    </div>
  )
}
