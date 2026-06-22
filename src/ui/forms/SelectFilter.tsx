export function SelectFilter({
  id,
  label,
  value,
  options,
  getLabel = (option) => option,
  onChange,
}: {
  id: string
  label: string
  value: string
  options: string[]
  getLabel?: (option: string) => string
  onChange: (value: string) => void
}) {
  return (
    <label className="select-filter" htmlFor={id}>
      <span>{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {getLabel(option)}
          </option>
        ))}
      </select>
    </label>
  )
}
