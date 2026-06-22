import type { Person } from '../../content'
import { TagList } from '../primitives/TagList'
import { Avatar } from './Avatar'
import { SocialLinks } from './SocialLinks'

export function PersonCard({ person }: { person: Person }) {
  return (
    <article className="person-card">
      <a href={`/people/${person.slug}`} aria-label={`View ${person.name}`}>
        <Avatar person={person} />
      </a>
      <div className="person-body">
        <p className="card-eyebrow">{person.group}</p>
        <h3>
          <a href={`/people/${person.slug}`}>{person.name}</a>
        </h3>
        <p className="person-role">{person.role}</p>
        {person.affiliation && (
          <p className="person-affiliation">{person.affiliation}</p>
        )}
        <p className="person-bio">{person.bio}</p>
        <TagList tags={person.researchAreas.slice(0, 3)} />
        <SocialLinks links={person.links} compact />
      </div>
    </article>
  )
}
