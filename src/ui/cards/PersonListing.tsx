import type { PersonListing as PersonListingViewModel } from '../../domain/people'
import { ExternalLink } from '../primitives/ExternalLink'
import { Avatar } from './Avatar'
import { SocialLinks } from './SocialLinks'
import { getPersonPrimaryLinkName } from './socialLinkItems'

export function PersonListing({
  listing,
}: {
  listing: PersonListingViewModel
}) {
  const avatar = <Avatar person={listing} />
  const name = <>{listing.name}</>
  const primaryLinkName = getPersonPrimaryLinkName({
    personName: listing.name,
    primaryPersonLink: listing.primaryPersonLink,
  })

  return (
    <article className="person-listing">
      <h3>
        {listing.primaryPersonLink ? (
          <ExternalLink
            ariaLabel={primaryLinkName ?? undefined}
            href={listing.primaryPersonLink}
          >
            {name}
          </ExternalLink>
        ) : (
          name
        )}
      </h3>
      {listing.primaryPersonLink ? (
        <ExternalLink
          ariaLabel={primaryLinkName ?? undefined}
          href={listing.primaryPersonLink}
        >
          {avatar}
        </ExternalLink>
      ) : (
        avatar
      )}
      {listing.affiliation && (
        <p className="person-affiliation">{listing.affiliation}</p>
      )}
      <SocialLinks links={listing.links} personName={listing.name} compact />
    </article>
  )
}
