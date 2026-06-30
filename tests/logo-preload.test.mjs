import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('critical home hero images are preloaded before route content renders', async () => {
  const indexHtml = await readFile('index.html', 'utf8')

  assert.match(
    indexHtml,
    /<link\s+rel="preload"\s+as="image"\s+href="\/bold_full_vector_logo\.svg"\s+type="image\/svg\+xml"\s+fetchpriority="high"\s*\/>/,
  )
  assert.match(
    indexHtml,
    /<link\s+rel="preload"\s+as="image"\s+href="\/butterfly_swam\.png"\s+type="image\/png"\s+fetchpriority="high"\s*\/>/,
  )
})
