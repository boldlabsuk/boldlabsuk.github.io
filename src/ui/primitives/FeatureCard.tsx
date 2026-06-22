export function FeatureCard({
  href,
  kicker,
  title,
  description,
  variant,
}: {
  href: string
  kicker: string
  title: string
  description: string
  variant: 'teal' | 'blue' | 'amber' | 'slate'
}) {
  return (
    <a className={`feature-card feature-card-${variant}`} href={href}>
      <span>{kicker}</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </a>
  )
}
