export function SectionHeader({
  eyebrow,
  title,
  description,
  cta,
}: {
  eyebrow: string
  title: string
  description: string
  cta?: { label: string; href: string }
}) {
  return (
    <div className="section-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <div className="section-header-side">
        <p>{description}</p>
        {cta && (
          <a className="text-link" href={cta.href}>
            {cta.label}
          </a>
        )}
      </div>
    </div>
  )
}
