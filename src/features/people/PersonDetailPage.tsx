import { getPerson } from '../../domain/people'
import { Avatar } from '../../ui/cards/Avatar'
import { SocialLinks } from '../../ui/cards/SocialLinks'
import { PageHero } from '../../ui/layout/PageHero'
import { TagList } from '../../ui/primitives/TagList'
import { NotFoundPage } from '../not-found/NotFoundPage'

export function PersonDetailPage({ slug }: { slug: string }) {
  const person = getPerson(slug)

  if (!person) {
    return <NotFoundPage />
  }

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
        </div>
      </section>
    </>
  )
}
