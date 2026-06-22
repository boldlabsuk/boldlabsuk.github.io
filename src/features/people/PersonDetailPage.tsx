import {
  getAuthoredPapers,
  getAuthoredPosts,
  getPerson,
} from '../../domain/people'
import { ArticleCard } from '../../ui/cards/ArticleCard'
import { Avatar } from '../../ui/cards/Avatar'
import { PaperItem } from '../../ui/cards/PaperItem'
import { SocialLinks } from '../../ui/cards/SocialLinks'
import { PageHero } from '../../ui/layout/PageHero'
import { TagList } from '../../ui/primitives/TagList'
import { NotFoundPage } from '../not-found/NotFoundPage'

export function PersonDetailPage({ slug }: { slug: string }) {
  const person = getPerson(slug)

  if (!person) {
    return <NotFoundPage />
  }

  const authoredPapers = getAuthoredPapers(person)
  const authoredPosts = getAuthoredPosts(person)

  return (
    <>
      <PageHero
        eyebrow={person.group}
        title={person.name}
        description={`${person.role}${person.affiliation ? `, ${person.affiliation}` : ''}`}
      />
      <section className="section-band detail-layout">
        <aside className="profile-panel">
          <Avatar person={person} size="large" />
          <SocialLinks links={person.links} />
        </aside>
        <div className="detail-main">
          <p className="detail-lede">{person.bio}</p>
          <TagList tags={person.researchAreas} />

          {authoredPapers.length > 0 && (
            <section className="detail-subsection" aria-labelledby="person-papers">
              <h2 id="person-papers">Associated Papers</h2>
              <div className="publication-list compact">
                {authoredPapers.map((paper) => (
                  <PaperItem key={paper.id} paper={paper} />
                ))}
              </div>
            </section>
          )}

          {authoredPosts.length > 0 && (
            <section className="detail-subsection" aria-labelledby="person-news">
              <h2 id="person-news">Associated News</h2>
              <div className="article-grid two-up">
                {authoredPosts.map((post) => (
                  <ArticleCard key={post.slug} post={post} compact />
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </>
  )
}
