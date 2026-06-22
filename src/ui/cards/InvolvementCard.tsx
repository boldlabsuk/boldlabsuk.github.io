import { siteMeta } from '../../content'
import type { InvolvementRoute } from '../../content'

export function InvolvementCard({ route }: { route: InvolvementRoute }) {
  return (
    <article className="involvement-card" id={route.id}>
      <div>
        <p className="card-eyebrow">{route.shortTitle}</p>
        <h3>{route.title}</h3>
        <p>{route.summary}</p>
      </div>
      <ul>
        {route.guidance.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <a href={`mailto:${siteMeta.contactEmail}`}>Contact intake</a>
    </article>
  )
}
