import { profileImages } from '../../assets/images'
import type { Person } from '../../content'
import { getInitials } from '../../lib/format'

type AvatarPerson = Pick<Person, 'image' | 'name' | 'role'>
type AvatarImagePriority = 'auto' | 'high'

const avatarDimensions: Record<'standard' | 'large', number> = {
  standard: 150,
  large: 320,
}

export function Avatar({
  person,
  size = 'standard',
  imagePriority = 'auto',
}: {
  person: AvatarPerson
  size?: 'standard' | 'large'
  imagePriority?: AvatarImagePriority
}) {
  const image = getAvatarImageSource(person.image)
  const dimension = avatarDimensions[size]

  if (image) {
    return (
      <img
        className={`avatar avatar-${size}`}
        src={image}
        alt={person.name}
        width={dimension}
        height={dimension}
        loading="eager"
        decoding="sync"
        fetchPriority={imagePriority === 'high' ? 'high' : undefined}
      />
    )
  }

  return (
    <div
      className={`avatar avatar-placeholder avatar-${size}`}
      aria-label={person.name}
      role="img"
    >
      {getInitials(person.name)}
    </div>
  )
}

function getAvatarImageSource(image?: string) {
  if (!image) {
    return undefined
  }

  if (image.startsWith('/') || URL.canParse(image)) {
    return image
  }

  return profileImages[image]
}
