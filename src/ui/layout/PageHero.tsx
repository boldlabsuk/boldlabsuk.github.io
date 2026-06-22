export function PageHero({
  eyebrow,
  title,
  description,
  secondaryDescription,
}: {
  eyebrow: string
  title: string
  description: string
  secondaryDescription?: string
}) {
  return (
    <section className="page-hero">
      <div className="page-hero-inner">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
        {secondaryDescription && <p>{secondaryDescription}</p>}
      </div>
    </section>
  )
}
