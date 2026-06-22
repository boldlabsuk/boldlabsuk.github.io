export const allFilterValue = 'All'

export function unique(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}
