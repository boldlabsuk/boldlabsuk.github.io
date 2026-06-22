import type { PersonListing as PersonListingViewModel } from '../../domain/people'
import { ExternalLink } from '../primitives/ExternalLink'
import { Avatar } from './Avatar'
import { SocialLinks } from './SocialLinks'

export function PersonListing({
  listing,
}: {
  listing: PersonListingViewModel
}) {
  const avatar = <Avatar person={listing} />
  const name = <>{listing.name}</>

  return (
    <article className="person-listing">
      {listing.primaryPersonLink ? (
        <ExternalLink
          ariaLabel={`Visit ${listing.name}`}
          href={listing.primaryPersonLink}
        >
          {avatar}
        </ExternalLink>
      ) : (
        avatar
      )}
      <div className="person-listing-body">
        <h3>
          {listing.primaryPersonLink ? (
            <ExternalLink href={listing.primaryPersonLink}>{name}</ExternalLink>
          ) : (
            name
          )}
        </h3>
        <p className="person-role">{listing.role}</p>
        {listing.affiliation && (
          <p className="person-affiliation">{listing.affiliation}</p>
        )}
        <SocialLinks links={listing.links} compact />
      </div>
    </article>
  )
}
