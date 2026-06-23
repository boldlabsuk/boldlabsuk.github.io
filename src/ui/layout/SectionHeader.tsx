export function SectionHeader({
  eyebrow,
  title,
  description,
  cta,
  titleElement = 'h2',
}: {
  eyebrow: string
  title: string
  description: string
  cta?: { label: string; href: string }
  titleElement?: 'h1' | 'h2'
}) {
  const TitleElement = titleElement

  return (
    <div className="section-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <TitleElement>{title}</TitleElement>
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
