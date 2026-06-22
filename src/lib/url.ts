export function isExternalUrl(href: string) {
  return href.startsWith('http://') || href.startsWith('https://')
}
