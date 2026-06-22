export function FilterBar({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="filter-bar" aria-label={label}>
      {options.map((option) => (
        <button
          aria-pressed={value === option.value}
          className={value === option.value ? 'filter-chip active' : 'filter-chip'}
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
