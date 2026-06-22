import { profileImages } from '../../assets/images'
import type { Person } from '../../content'
import { getInitials } from '../../lib/format'

type AvatarPerson = Pick<Person, 'image' | 'name' | 'role'>

export function Avatar({
  person,
  size = 'standard',
}: {
  person: AvatarPerson
  size?: 'standard' | 'large'
}) {
  const image = person.image ? profileImages[person.image] : undefined

  if (image) {
    return (
      <img
        className={`avatar avatar-${size}`}
        src={image}
        alt={`${person.name}, ${person.role}`}
      />
    )
  }

  return (
    <div
      className={`avatar avatar-placeholder avatar-${size}`}
      aria-label={`${person.name}, ${person.role}`}
      role="img"
    >
      {getInitials(person.name)}
    </div>
  )
}
