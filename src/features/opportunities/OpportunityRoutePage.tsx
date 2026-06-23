import { opportunityRoutes } from '../../content'
import { NotFoundPage } from '../not-found/NotFoundPage'

export function OpportunityRoutePage({ slug }: { slug: string }) {
  const route = opportunityRoutes.find((item) => item.slug === slug)

  if (!route) {
    return <NotFoundPage />
  }

  const facts = [
    ['Status', route.status],
    [getPlaceFactLabel(route.slug), route.location],
    ['Timing', route.timing],
    ['Formal Application Path', route.formalApplicationPath],
  ].filter((fact): fact is [string, string] => Boolean(fact[1]))

  return (
    <>
      <section className="page-hero opportunity-route-hero">
        <div className="page-hero-inner">
          <p className="eyebrow">Expression of Interest</p>
          <h1>{route.title}</h1>
          <p>{route.positioning}</p>
          <a className="button button-primary" href="#express-interest">
            {route.primaryActionLabel}
          </a>
        </div>
      </section>

      <section className="section-band page-content opportunity-route-page">
        <dl className="opportunity-facts">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <div className="opportunity-route-layout">
          <article>
            <p className="detail-lede">{route.shortSummary}</p>

            <section>
              <h2>Who this is for</h2>
              <ul>
                {route.whoThisIsFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2>What we look for</h2>
              <ul>
                {route.whatWeLookFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2>How this works</h2>
              <p>{route.howThisWorks}</p>
            </section>
          </article>

          <aside className="expression-interest-panel" id="express-interest">
            <p className="eyebrow">{route.primaryActionLabel}</p>
            <h2>Form coming soon</h2>
            <p>{route.formComingSoon}</p>
            <p>
              This page will host the embedded Expression of Interest form for
              the {route.title} route. It will not replace any separate Formal
              Application Path where one is required.
            </p>
          </aside>
        </div>
      </section>
    </>
  )
}

function getPlaceFactLabel(slug: string) {
  return slug === 'research-engineers' || slug === 'collaborators'
    ? 'Working mode'
    : 'Location'
}
