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
      <a href={route.href} aria-label={`Express interest in ${route.title}`}>
        Express interest
      </a>
    </article>
  )
}
