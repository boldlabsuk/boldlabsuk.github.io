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
  const image = getAvatarImageSource(person.image)

  if (image) {
    const uncroppedClassName = isUncroppedProfileImage(image)
      ? ' avatar-uncropped'
      : ''

    return (
      <img
        className={`avatar avatar-${size}${uncroppedClassName}`}
        src={image}
        alt={person.name}
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

function isUncroppedProfileImage(image: string) {
  return (
    image === '/profile-assets/ani-calinescu-new.jpg' ||
    image === '/profile-assets/Antoine-Cully-new.png' ||
    image === '/profile-assets/jakob-foerster-new.png' ||
    image === '/profile-assets/ravi-hammond.png' ||
    image === '/profile-assets/shimon-whiteson-new.jpg'
  )
}
