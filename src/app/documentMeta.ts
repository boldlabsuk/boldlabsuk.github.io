import type { Meta } from '../routing/routes'

export function setDocumentMeta(meta: Meta) {
  document.title = meta.title
  setMetaTag('description', meta.description)
  setMetaProperty('og:title', meta.title)
  setMetaProperty('og:description', meta.description)
  setMetaProperty('og:type', 'website')
}

function setMetaTag(name: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)

  if (!tag) {
    tag = document.createElement('meta')
    tag.name = name
    document.head.append(tag)
  }

  tag.content = content
}

function setMetaProperty(property: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(
    `meta[property="${property}"]`,
  )

  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('property', property)
    document.head.append(tag)
  }

  tag.content = content
}
