import type { PersonListing as PersonListingViewModel } from '../../domain/people'
import { Avatar } from './Avatar'
import { SocialLinks } from './SocialLinks'

export function PersonListing({
  imagePriority = 'auto',
  listing,
}: {
  imagePriority?: 'auto' | 'high'
  listing: PersonListingViewModel
}) {
  return (
    <article className="person-listing">
      <h3>{listing.name}</h3>
      <Avatar person={listing} imagePriority={imagePriority} />
      {listing.affiliation && (
        <p className="person-affiliation">{listing.affiliation}</p>
      )}
      <div className="person-listing-social-slot">
        <SocialLinks links={listing.links} personName={listing.name} compact />
      </div>
    </article>
  )
}
