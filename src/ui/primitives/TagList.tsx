import type { ReactNode } from 'react'

export function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return null
  }

  return (
    <div className="tag-list">
      {tags.map((tag) => (
        <TagPill key={tag}>{tag}</TagPill>
      ))}
    </div>
  )
}

export function TagPill({ children }: { children: ReactNode }) {
  return <span className="tag-pill">{children}</span>
}
