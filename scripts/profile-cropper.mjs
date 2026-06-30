import { execFile } from 'node:child_process'
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
} from 'node:fs'
import { rename, stat, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const rawImageDir = path.join(rootDir, 'context', 'our_people_pictures')
const publicImageDir = path.join(rootDir, 'public', 'profile-assets')
const cropRecordPath = path.join(rootDir, 'context', 'profile-crops.json')
const previewDir = path.join(os.tmpdir(), 'bold-profile-cropper-previews')
const previewMaxSize = 2400
const outputSize = 640
const imageSourceExtensions = new Set([
  '.avif',
  '.heic',
  '.heif',
  '.jpeg',
  '.jpg',
  '.pdf',
  '.png',
  '.tif',
  '.tiff',
  '.webp',
])

const personSlugAliases = {
  'alex-rutherford': 'alexander-rutherford',
  'jonathan-cook': 'jonny-cook',
}

const cliOptions = parseCliOptions(process.argv.slice(2))
const defaultPort = Number(cliOptions.port ?? process.env.PORT ?? 4177)
const outputImageDir = cliOptions.outputDir
  ? resolveCliPath(cliOptions.outputDir)
  : publicImageDir

if (cliOptions.help) {
  printHelp()
  process.exit(0)
}

if (!Number.isInteger(defaultPort) || defaultPort <= 0) {
  throw new Error(`Invalid port: ${cliOptions.port ?? process.env.PORT}`)
}

mkdirSync(previewDir, { recursive: true })
mkdirSync(outputImageDir, { recursive: true })

const manifest = buildManifest(cliOptions)
const cropRecords = loadCropRecords()

if (cliOptions.list) {
  console.log(
    manifest
      .map((entry) =>
        [
          entry.id,
          entry.name,
          entry.sourceKind,
          path.relative(rootDir, entry.sourcePath),
          path.relative(rootDir, entry.outputPath),
        ].join('\t'),
      )
      .join('\n'),
  )
  process.exit(0)
}

let port = defaultPort
const server = createServer(handleRequest)

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    port += 1
    server.listen(port, '127.0.0.1')
    return
  }

  throw error
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Profile cropper: http://127.0.0.1:${port}`)
  console.log(`Entries loaded: ${manifest.length}`)
  if (cliOptions.sourceDir) {
    console.log(`Source directory: ${resolveCliPath(cliOptions.sourceDir)}`)
  }
  console.log('Press Ctrl+C when cropping is complete.')
})

async function handleRequest(request, response) {
  try {
    const url = new URL(request.url ?? '/', `http://${request.headers.host}`)

    if (request.method === 'GET' && url.pathname === '/') {
      sendHtml(response)
      return
    }

    if (request.method === 'GET' && url.pathname === '/api/manifest') {
      sendJson(response, {
        entries: manifest.map((entry) => ({
          id: entry.id,
          slug: entry.slug,
          name: entry.name,
          role: entry.role,
          sourceFile: path.basename(entry.sourcePath),
          sourceKind: entry.sourceKind,
          outputFile: path.basename(entry.outputPath),
          saved: Boolean(getCropRecord(entry)),
          crop: getCropRecord(entry)?.crop ?? null,
        })),
      })
      return
    }

    if (request.method === 'GET' && url.pathname.startsWith('/image/')) {
      const id = decodeURIComponent(url.pathname.slice('/image/'.length))
      const entry = getEntry(id)
      const previewPath = await ensurePreview(entry)

      response.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-store',
      })
      createReadStream(previewPath).pipe(response)
      return
    }

    if (request.method === 'POST' && url.pathname === '/api/save-crop') {
      const payload = await readJsonBody(request)
      const entry = getEntry(String(payload.id ?? payload.slug ?? ''))
      const crop = normalizeCrop(payload.crop)
      const previewPath = await ensurePreview(entry)
      const dimensions = await getImageDimensions(previewPath)
      const safeCrop = clampCrop(crop, dimensions)

      await writeSquareCrop({
        inputPath: previewPath,
        outputPath: entry.outputPath,
        crop: safeCrop,
      })
      await recordCrop(entry, safeCrop)

      sendJson(response, {
        ok: true,
        id: entry.id,
        slug: entry.slug,
        saved: true,
        crop: safeCrop,
      })
      return
    }

    if (request.method === 'GET' && url.pathname === '/api/status') {
      const saved = manifest.filter((entry) => getCropRecord(entry)).length

      sendJson(response, {
        total: manifest.length,
        saved,
        remaining: manifest.length - saved,
      })
      return
    }

    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Not found')
  } catch (error) {
    console.error(error)
    response.writeHead(500, {
      'Content-Type': 'application/json; charset=utf-8',
    })
    response.end(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
    )
  }
}

function parseCliOptions(args) {
  const options = {
    help: false,
    list: false,
    outputDir: undefined,
    port: undefined,
    sourceDir: undefined,
  }

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    if (arg === '--help' || arg === '-h') {
      options.help = true
    } else if (arg === '--list') {
      options.list = true
    } else if (arg === '--source-dir' || arg === '--input-dir') {
      options.sourceDir = readOptionValue(args, index, arg)
      index += 1
    } else if (arg === '--output-dir') {
      options.outputDir = readOptionValue(args, index, arg)
      index += 1
    } else if (arg === '--port') {
      options.port = readOptionValue(args, index, arg)
      index += 1
    } else {
      throw new Error(`Unknown option: ${arg}`)
    }
  }

  return options
}

function readOptionValue(args, index, optionName) {
  const value = args[index + 1]

  if (!value || value.startsWith('--')) {
    throw new Error(`${optionName} requires a value`)
  }

  return value
}

function printHelp() {
  console.log(`Usage:
  npm run profile-cropper
  npm run profile-cropper -- --source-dir <folder>

Options:
  --source-dir <folder>  Crop only image/PDF files from this folder.
  --output-dir <folder>  Override the output folder. Defaults to public/profile-assets.
  --port <port>          Override the local server port. Defaults to PORT or 4177.
  --list                 Print the resolved crop manifest and exit.
  --help                 Show this help text.

Folder mode matching:
  Files are matched to Website Roster people by current asset filename, person slug,
  person name, or source profilePicture filename. Unmatched files are saved as
  public/profile-assets/<filename-slug>.webp and must be wired into content separately.`)
}

function resolveCliPath(value) {
  return path.resolve(process.cwd(), value)
}

function buildManifest(options) {
  const sourcePeople = readSourcePeople()

  return options.sourceDir
    ? buildSourceDirManifest(options.sourceDir, sourcePeople)
    : buildRosterManifest(sourcePeople)
}

function readSourcePeople() {
  return JSON.parse(readFileSync(path.join(rootDir, 'our_people.json'), 'utf8'))
}

function buildRosterManifest(sourcePeople) {
  const rosterPeople = [
    ...sourcePeople.filter(isWebsiteRosterSourcePerson),
    ...sourcePeople.filter(isSupplementalAlumniSourcePerson),
  ]
  const seenSlugs = new Set()
  const entries = []

  for (const sourcePerson of rosterPeople) {
    const slug = getCanonicalPersonSlug(sourcePerson.name)

    if (seenSlugs.has(slug)) {
      continue
    }

    seenSlugs.add(slug)

    const outputFile = getProfileAssetFilename(slug)
    const rawPath = path.join(rawImageDir, sourcePerson.profilePicture)
    const outputPath = path.join(outputImageDir, outputFile)
    const sourcePath = existsSync(rawPath) ? rawPath : outputPath

    if (!existsSync(sourcePath)) {
      throw new Error(
        `No source image found for ${sourcePerson.name}: ${sourcePath}`,
      )
    }

    entries.push({
      id: slug,
      slug,
      name: sourcePerson.name.trim(),
      role: sourcePerson.role.trim(),
      sourceKind: existsSync(rawPath) ? 'raw' : 'existing-public-asset',
      sourcePath,
      outputPath,
    })
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name))
}

function buildSourceDirManifest(sourceDir, sourcePeople) {
  const resolvedSourceDir = resolveCliPath(sourceDir)

  if (
    !existsSync(resolvedSourceDir) ||
    !statSync(resolvedSourceDir).isDirectory()
  ) {
    throw new Error(`Source directory does not exist: ${resolvedSourceDir}`)
  }

  const imagePaths = listImageSourcePaths(resolvedSourceDir)

  if (imagePaths.length === 0) {
    throw new Error(`No supported image files found in ${resolvedSourceDir}`)
  }

  const matcher = buildPersonMatcher(sourcePeople)
  const entries = imagePaths.map((sourcePath) =>
    buildSourceDirEntry(sourcePath, matcher),
  )

  assertUniqueOutputTargets(entries)

  return entries.sort((a, b) => a.name.localeCompare(b.name))
}

function listImageSourcePaths(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        return listImageSourcePaths(entryPath)
      }

      if (
        !entry.isFile() ||
        !imageSourceExtensions.has(path.extname(entry.name).toLowerCase())
      ) {
        return []
      }

      return [entryPath]
    })
    .sort((a, b) => a.localeCompare(b))
}

function buildSourceDirEntry(sourcePath, matcher) {
  const match = matcher.match(sourcePath)
  const fallbackSlug = getSourceFileSlug(sourcePath)
  const person = match?.person
  const slug = person?.slug ?? fallbackSlug
  const outputFile = person?.outputFile ?? `${slug}.webp`
  const outputPath = path.join(outputImageDir, outputFile)

  if (!person && existsSync(outputPath)) {
    throw new Error(
      `Refusing to overwrite existing asset for unmatched file ${sourcePath}: ${outputPath}`,
    )
  }

  return {
    id: slug,
    slug,
    name: person?.name ?? formatFallbackName(fallbackSlug),
    role: person?.role ?? 'Unmatched source image',
    sourceKind: person ? `folder-${match.matchedBy}` : 'folder-unmatched',
    sourcePath,
    outputPath,
  }
}

function buildPersonMatcher(sourcePeople) {
  const people = buildKnownPeople(sourcePeople)
  const matchMap = new Map()

  for (const person of people) {
    addMatchKey(matchMap, `slug:${person.slug}`, person)
    addMatchKey(matchMap, `slug:${slugify(person.name)}`, person)
    addMatchKey(
      matchMap,
      `filename:${normalizeFileName(person.outputFile)}`,
      person,
    )
    addMatchKey(
      matchMap,
      `slug:${slugify(getFileStem(person.outputFile))}`,
      person,
    )

    if (person.profilePicture) {
      addMatchKey(
        matchMap,
        `filename:${normalizeFileName(person.profilePicture)}`,
        person,
      )
      addMatchKey(
        matchMap,
        `slug:${slugify(getFileStem(person.profilePicture))}`,
        person,
      )
    }
  }

  return {
    match(sourcePath) {
      const sourceFile = path.basename(sourcePath)
      const sourceStem = getFileStem(sourceFile)
      const trailingName = getTrailingPersonName(sourceStem)
      const candidateKeys = [
        ['filename', `filename:${normalizeFileName(sourceFile)}`],
        ['slug', `slug:${slugify(sourceStem)}`],
        ['trailing-name', `slug:${slugify(trailingName)}`],
      ]

      for (const [matchedBy, key] of candidateKeys) {
        const matches = matchMap.get(key)

        if (!matches) {
          continue
        }

        if (matches.size > 1) {
          throw new Error(
            `Ambiguous cropper match for ${sourcePath}: ${[...matches]
              .map((person) => person.name)
              .join(', ')}`,
          )
        }

        return {
          matchedBy,
          person: [...matches][0],
        }
      }

      return undefined
    },
  }
}

function buildKnownPeople(sourcePeople) {
  const peopleBySlug = new Map()
  const preferredPeople = [
    ...sourcePeople.filter(isWebsiteRosterSourcePerson),
    ...sourcePeople.filter(isSupplementalAlumniSourcePerson),
    ...sourcePeople.filter((sourcePerson) =>
      Boolean(sourcePerson.name?.trim()),
    ),
  ]

  for (const sourcePerson of preferredPeople) {
    const slug = getCanonicalPersonSlug(sourcePerson.name)

    if (peopleBySlug.has(slug)) {
      continue
    }

    peopleBySlug.set(slug, {
      slug,
      name: sourcePerson.name.trim(),
      role: sourcePerson.role?.trim() || 'Person',
      profilePicture: sourcePerson.profilePicture?.trim(),
      outputFile: getProfileAssetFilename(slug),
    })
  }

  return [...peopleBySlug.values()]
}

function addMatchKey(matchMap, key, person) {
  if (!key || key.endsWith(':')) {
    return
  }

  const matches = matchMap.get(key) ?? new Set()
  matches.add(person)
  matchMap.set(key, matches)
}

function assertUniqueOutputTargets(entries) {
  const outputTargets = new Map()

  for (const entry of entries) {
    const key = path.resolve(entry.outputPath).toLowerCase()
    const existing = outputTargets.get(key)

    if (existing) {
      throw new Error(
        `Multiple cropper inputs resolve to the same output asset: ${existing.sourcePath} and ${entry.sourcePath}`,
      )
    }

    outputTargets.set(key, entry)
  }
}

function isWebsiteRosterSourcePerson(sourcePerson) {
  return (
    normalizeSourceName(sourcePerson.source) === 'main' &&
    hasWebsiteRosterRequiredFields(sourcePerson)
  )
}

function isSupplementalAlumniSourcePerson(sourcePerson) {
  return (
    normalizeSourceName(sourcePerson.source) === 'foerster-alumni' &&
    isExplicitAlumniMarker(sourcePerson.alumni) &&
    hasWebsiteRosterRequiredFields(sourcePerson)
  )
}

function hasWebsiteRosterRequiredFields(sourcePerson) {
  return (
    Boolean(sourcePerson.name?.trim()) &&
    Boolean(sourcePerson.role?.trim()) &&
    Boolean(sourcePerson.profilePicture?.trim()) &&
    sourcePerson.listOnBoldWebsite?.trim().toLowerCase() !== 'no'
  )
}

function normalizeSourceName(source) {
  return String(source ?? '')
    .trim()
    .toLowerCase()
}

function isExplicitAlumniMarker(value) {
  if (typeof value === 'boolean') {
    return value
  }

  return /^(?:1|alumni|true|y|yes)$/i.test(String(value ?? '').trim())
}

function getCanonicalPersonSlug(name) {
  const slug = slugify(name)

  return personSlugAliases[slug] ?? slug
}

function getSourceFileSlug(sourcePath) {
  return (
    slugify(getTrailingPersonName(getFileStem(path.basename(sourcePath)))) ||
    'profile-image'
  )
}

function getFileStem(fileName) {
  return path.basename(fileName, path.extname(fileName))
}

function getTrailingPersonName(value) {
  const delimiter = ' - '
  const index = value.lastIndexOf(delimiter)

  return index >= 0 ? value.slice(index + delimiter.length) : value
}

function normalizeFileName(fileName) {
  return path.basename(fileName).normalize('NFKC').toLowerCase()
}

function formatFallbackName(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function getProfileAssetFilename(slug) {
  if (slug === 'ani-calinescu') {
    return 'ani-calinescu-new.jpg'
  }

  if (slug === 'antoine-cully') {
    return 'Antoine-Cully-new.png'
  }

  if (slug === 'jakob-foerster') {
    return 'jakob-foerster-new.png'
  }

  if (slug === 'ravi-hammond') {
    return 'ravi-hammond.png'
  }

  if (slug === 'shimon-whiteson') {
    return 'shimon-whiteson-new.jpg'
  }

  return `${slug}.webp`
}

function getEntry(id) {
  const entry = manifest.find((candidate) => candidate.id === id)

  if (!entry) {
    throw new Error(`Unknown cropper entry: ${id}`)
  }

  return entry
}

async function ensurePreview(entry) {
  const previewPath = path.join(previewDir, `${entry.id}.jpg`)
  const previewExists = existsSync(previewPath)

  if (previewExists) {
    const [sourceStats, previewStats] = await Promise.all([
      stat(entry.sourcePath),
      stat(previewPath),
    ])

    if (previewStats.mtimeMs >= sourceStats.mtimeMs) {
      return previewPath
    }
  }

  const inputPath = entry.sourcePath.toLowerCase().endsWith('.pdf')
    ? `${entry.sourcePath}[0]`
    : entry.sourcePath

  await execFileAsync('magick', [
    inputPath,
    '-auto-orient',
    '-background',
    'white',
    '-alpha',
    'remove',
    '-alpha',
    'off',
    '-resize',
    `${previewMaxSize}x${previewMaxSize}>`,
    '-colorspace',
    'sRGB',
    '-strip',
    '-quality',
    '92',
    previewPath,
  ])

  return previewPath
}

async function getImageDimensions(imagePath) {
  const { stdout } = await execFileAsync('magick', [
    'identify',
    '-format',
    '%w %h',
    imagePath,
  ])
  const [width, height] = stdout.trim().split(/\s+/).map(Number)

  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    throw new Error(`Could not read dimensions for ${imagePath}`)
  }

  return { width, height }
}

async function writeSquareCrop({ inputPath, outputPath, crop }) {
  const extension = path.extname(outputPath).toLowerCase()
  const tempPath = path.join(
    path.dirname(outputPath),
    `.${path.basename(outputPath)}.${process.pid}.tmp${extension || '.webp'}`,
  )
  const args = [
    inputPath,
    '-crop',
    `${crop.size}x${crop.size}+${crop.x}+${crop.y}`,
    '+repage',
    '-resize',
    `${outputSize}x${outputSize}!`,
    '-strip',
  ]

  if (extension === '.webp') {
    args.push('-quality', '88')
  } else if (extension === '.jpg' || extension === '.jpeg') {
    args.push('-quality', '90')
  }

  args.push(tempPath)

  await execFileAsync('magick', args)
  await rename(tempPath, outputPath)
}

function normalizeCrop(value) {
  const crop = {
    x: Number(value?.x),
    y: Number(value?.y),
    size: Number(value?.size),
  }

  if (
    !Number.isFinite(crop.x) ||
    !Number.isFinite(crop.y) ||
    !Number.isFinite(crop.size) ||
    crop.size <= 0
  ) {
    throw new Error('Invalid crop payload')
  }

  return {
    x: Math.round(crop.x),
    y: Math.round(crop.y),
    size: Math.round(crop.size),
  }
}

function clampCrop(crop, dimensions) {
  const maxSize = Math.min(dimensions.width, dimensions.height)
  const size = Math.max(1, Math.min(crop.size, maxSize))

  return {
    x: Math.max(0, Math.min(crop.x, dimensions.width - size)),
    y: Math.max(0, Math.min(crop.y, dimensions.height - size)),
    size,
  }
}

function loadCropRecords() {
  if (!existsSync(cropRecordPath)) {
    return { updatedAt: null, crops: {} }
  }

  try {
    const parsed = JSON.parse(readFileSync(cropRecordPath, 'utf8'))

    return {
      updatedAt: parsed.updatedAt ?? null,
      crops: parsed.crops ?? {},
    }
  } catch {
    return { updatedAt: null, crops: {} }
  }
}

function getCropRecord(entry) {
  const record = cropRecords.crops[entry.id]

  if (!record) {
    return undefined
  }

  return record.sourcePath === getRelativePath(entry.sourcePath) &&
    record.outputPath === getRelativePath(entry.outputPath)
    ? record
    : undefined
}

async function recordCrop(entry, crop) {
  cropRecords.updatedAt = new Date().toISOString()
  cropRecords.crops[entry.id] = {
    name: entry.name,
    sourceKind: entry.sourceKind,
    sourcePath: getRelativePath(entry.sourcePath),
    outputPath: getRelativePath(entry.outputPath),
    crop,
    outputSize,
    updatedAt: cropRecords.updatedAt,
  }

  await writeFile(cropRecordPath, `${JSON.stringify(cropRecords, null, 2)}\n`)
}

function getRelativePath(filePath) {
  return path.relative(rootDir, filePath)
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''

    request.setEncoding('utf8')
    request.on('data', (chunk) => {
      body += chunk

      if (body.length > 1_000_000) {
        request.destroy()
        reject(new Error('Request body too large'))
      }
    })
    request.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(error)
      }
    })
    request.on('error', reject)
  })
}

function sendJson(response, data) {
  response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify(data))
}

async function sendHtml(response) {
  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  response.end(getHtml())
}

function getHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>BOLD Profile Cropper</title>
  <style>
    :root {
      --bg: #f7f4ef;
      --panel: #ffffff;
      --ink: #171717;
      --muted: #6a655e;
      --line: #d7d1c7;
      --accent: #1f6b62;
      --accent-strong: #154d47;
      --danger: #a74435;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      height: 100%;
      overflow: hidden;
    }

    body {
      margin: 0;
      min-height: 100vh;
      background: var(--bg);
      color: var(--ink);
    }

    button,
    input {
      font: inherit;
    }

    .app {
      display: grid;
      grid-template-columns: minmax(250px, 330px) 1fr;
      height: 100vh;
      min-height: 0;
      overflow: hidden;
    }

    .sidebar {
      display: grid;
      grid-template-rows: auto auto minmax(0, 1fr);
      height: 100vh;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
      border-right: 1px solid var(--line);
      background: var(--panel);
    }

    .sidebar-header {
      display: grid;
      gap: 8px;
      padding: 18px;
      border-bottom: 1px solid var(--line);
    }

    .sidebar-header h1 {
      margin: 0;
      font-size: 18px;
      line-height: 1.2;
    }

    .progress {
      color: var(--muted);
      font-size: 13px;
    }

    .search {
      width: calc(100% - 36px);
      margin: 12px 18px;
      padding: 9px 10px;
      border: 1px solid var(--line);
      border-radius: 6px;
      background: #fff;
    }

    .people-list {
      min-height: 0;
      overflow: auto;
      padding: 0 10px 14px;
    }

    .person-button {
      display: grid;
      grid-template-columns: 16px 1fr;
      gap: 8px;
      width: 100%;
      min-height: 44px;
      padding: 8px;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: inherit;
      text-align: left;
      cursor: pointer;
    }

    .person-button:hover,
    .person-button:focus-visible {
      background: #f0ebe4;
      outline: none;
    }

    .person-button.active {
      background: #e3f0ed;
    }

    .dot {
      width: 10px;
      height: 10px;
      margin-top: 5px;
      border: 1px solid var(--line);
      border-radius: 50%;
      background: #fff;
    }

    .person-button.saved .dot {
      border-color: var(--accent);
      background: var(--accent);
    }

    .person-name {
      min-width: 0;
      font-size: 14px;
      font-weight: 750;
      line-height: 1.2;
    }

    .person-meta {
      margin-top: 2px;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.25;
      overflow-wrap: anywhere;
    }

    .main {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      min-width: 0;
      min-height: 0;
      height: 100vh;
      overflow: hidden;
    }

    .topbar {
      display: grid;
      gap: 4px;
      padding: 18px 24px 14px;
      border-bottom: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.72);
    }

    .current-name {
      margin: 0;
      font-size: clamp(22px, 2.2vw, 32px);
      line-height: 1.08;
    }

    .current-meta {
      color: var(--muted);
      font-size: 13px;
      overflow-wrap: anywhere;
    }

    .stage {
      display: grid;
      place-items: center;
      min-height: 0;
      overflow: hidden;
      padding: clamp(14px, 2vw, 24px);
    }

    .crop-frame {
      position: relative;
      width: min(64vw, 640px, calc(100vh - 226px));
      min-width: min(84vw, 320px);
      max-width: 100%;
      aspect-ratio: 1;
      overflow: hidden;
      border: 2px solid #151515;
      background: #ddd8ce;
      box-shadow: 0 16px 50px rgba(34, 28, 20, 0.16);
      touch-action: none;
      cursor: grab;
      user-select: none;
    }

    .crop-frame.dragging {
      cursor: grabbing;
    }

    .crop-frame img {
      position: absolute;
      top: 0;
      left: 0;
      max-width: none;
      transform-origin: 0 0;
      user-select: none;
      -webkit-user-drag: none;
    }

    .crop-frame::before,
    .crop-frame::after {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .crop-frame::before {
      background:
        linear-gradient(to right, transparent 33.333%, rgba(255, 255, 255, 0.55) 33.333%, rgba(255, 255, 255, 0.55) calc(33.333% + 1px), transparent calc(33.333% + 1px), transparent 66.666%, rgba(255, 255, 255, 0.55) 66.666%, rgba(255, 255, 255, 0.55) calc(66.666% + 1px), transparent calc(66.666% + 1px)),
        linear-gradient(to bottom, transparent 33.333%, rgba(255, 255, 255, 0.55) 33.333%, rgba(255, 255, 255, 0.55) calc(33.333% + 1px), transparent calc(33.333% + 1px), transparent 66.666%, rgba(255, 255, 255, 0.55) 66.666%, rgba(255, 255, 255, 0.55) calc(66.666% + 1px), transparent calc(66.666% + 1px));
    }

    .crop-frame::after {
      border: 1px solid rgba(255, 255, 255, 0.88);
    }

    .loading {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      padding: 20px;
      color: var(--muted);
      font-size: 14px;
      text-align: center;
    }

    .controls {
      display: grid;
      grid-template-columns: auto minmax(180px, 360px) 1fr auto auto auto;
      align-items: center;
      gap: 12px;
      padding: 14px 24px 18px;
      border-top: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.78);
    }

    .zoom-label {
      color: var(--muted);
      font-size: 13px;
      font-weight: 700;
    }

    .zoom-slider {
      width: 100%;
      accent-color: var(--accent);
    }

    .status {
      min-width: 0;
      color: var(--muted);
      font-size: 13px;
      overflow-wrap: anywhere;
    }

    .status.error {
      color: var(--danger);
      font-weight: 700;
    }

    .button {
      min-height: 38px;
      padding: 8px 13px;
      border: 1px solid var(--line);
      border-radius: 6px;
      background: #fff;
      color: var(--ink);
      font-weight: 780;
      cursor: pointer;
    }

    .button:hover,
    .button:focus-visible {
      border-color: var(--accent);
      outline: none;
    }

    .button.primary {
      border-color: var(--accent);
      background: var(--accent);
      color: #fff;
    }

    .button.primary:hover,
    .button.primary:focus-visible {
      background: var(--accent-strong);
    }

    .button:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    @media (max-width: 880px) {
      .app {
        grid-template-rows: minmax(180px, 32vh) minmax(0, 1fr);
        grid-template-columns: 1fr;
      }

      .sidebar {
        height: auto;
        max-height: none;
        border-right: 0;
        border-bottom: 1px solid var(--line);
      }

      .main {
        height: auto;
        min-height: 0;
      }

      .crop-frame {
        width: min(88vw, calc(68vh - 178px));
        min-width: min(82vw, 260px);
      }

      .controls {
        grid-template-columns: 1fr 1fr;
        padding: 10px 14px 12px;
      }

      .zoom-label,
      .zoom-slider,
      .status {
        grid-column: 1 / -1;
      }
    }
  </style>
</head>
<body>
  <div class="app">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>BOLD Profile Cropper</h1>
        <div class="progress" id="progress">Loading</div>
      </div>
      <input class="search" id="search" type="search" placeholder="Search people">
      <div class="people-list" id="peopleList"></div>
    </aside>

    <main class="main">
      <div class="topbar">
        <h2 class="current-name" id="currentName"></h2>
        <div class="current-meta" id="currentMeta"></div>
      </div>

      <section class="stage">
        <div class="crop-frame" id="frame">
          <img id="photo" alt="">
          <div class="loading" id="loading">Loading image</div>
        </div>
      </section>

      <div class="controls">
        <label class="zoom-label" for="zoom">Zoom</label>
        <input class="zoom-slider" id="zoom" type="range" min="1" max="4" step="0.01" value="1">
        <div class="status" id="status"></div>
        <button class="button" id="previousButton" type="button">Previous</button>
        <button class="button" id="nextButton" type="button">Next</button>
        <button class="button primary" id="saveButton" type="button">Save and Next</button>
      </div>
    </main>
  </div>

  <script>
    const state = {
      entries: [],
      filteredEntries: [],
      index: 0,
      scale: 1,
      minScale: 1,
      offsetX: 0,
      offsetY: 0,
      imageReady: false,
      dragging: false,
      dragStartX: 0,
      dragStartY: 0,
      startOffsetX: 0,
      startOffsetY: 0,
    };

    const elements = {
      peopleList: document.getElementById('peopleList'),
      progress: document.getElementById('progress'),
      search: document.getElementById('search'),
      currentName: document.getElementById('currentName'),
      currentMeta: document.getElementById('currentMeta'),
      frame: document.getElementById('frame'),
      photo: document.getElementById('photo'),
      loading: document.getElementById('loading'),
      zoom: document.getElementById('zoom'),
      status: document.getElementById('status'),
      previousButton: document.getElementById('previousButton'),
      nextButton: document.getElementById('nextButton'),
      saveButton: document.getElementById('saveButton'),
    };

    async function boot() {
      const response = await fetch('/api/manifest');
      const data = await response.json();

      state.entries = data.entries;
      state.filteredEntries = state.entries;
      renderList();
      selectEntry(0);
    }

    function renderList() {
      const query = elements.search.value.trim().toLowerCase();
      state.filteredEntries = state.entries.filter((entry) => {
        return (
          !query ||
          entry.name.toLowerCase().includes(query) ||
          entry.outputFile.toLowerCase().includes(query)
        );
      });

      elements.peopleList.replaceChildren(
        ...state.filteredEntries.map((entry) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = [
            'person-button',
            entry.saved ? 'saved' : '',
            entry.id === currentEntry()?.id ? 'active' : '',
          ].filter(Boolean).join(' ');
          button.addEventListener('click', () => {
            selectEntry(state.entries.findIndex((candidate) => candidate.id === entry.id));
          });

          const dot = document.createElement('span');
          dot.className = 'dot';

          const body = document.createElement('span');
          const name = document.createElement('span');
          name.className = 'person-name';
          name.textContent = entry.name;

          const meta = document.createElement('span');
          meta.className = 'person-meta';
          meta.textContent = entry.outputFile;

          body.append(name, meta);
          button.append(dot, body);

          return button;
        }),
      );

      renderProgress();
    }

    function renderProgress() {
      const saved = state.entries.filter((entry) => entry.saved).length;
      elements.progress.textContent = saved + ' of ' + state.entries.length + ' saved';
    }

    function currentEntry() {
      return state.entries[state.index] ?? null;
    }

    async function selectEntry(index) {
      if (index < 0 || index >= state.entries.length) {
        return;
      }

      state.index = index;
      const entry = currentEntry();
      state.imageReady = false;
      elements.photo.removeAttribute('src');
      elements.photo.alt = entry.name;
      elements.photo.style.display = 'none';
      elements.loading.style.display = 'grid';
      elements.loading.textContent = 'Loading image';
      elements.status.className = 'status';
      elements.status.textContent = entry.saved ? 'Saved' : 'Unsaved';
      elements.currentName.textContent = entry.name;
      elements.currentMeta.textContent = entry.sourceKind + ' source: ' + entry.sourceFile + ' -> ' + entry.outputFile;
      elements.previousButton.disabled = state.index === 0;
      elements.nextButton.disabled = state.index === state.entries.length - 1;
      elements.saveButton.disabled = true;
      renderList();

      const imageUrl = '/image/' + encodeURIComponent(entry.id) + '?v=' + Date.now();
      elements.photo.onload = () => {
        state.imageReady = true;
        elements.photo.style.display = 'block';
        elements.loading.style.display = 'none';
        elements.saveButton.disabled = false;
        fitImage(entry.crop);
      };
      elements.photo.onerror = () => {
        elements.loading.textContent = 'Could not load this image. Check the terminal for details.';
        elements.status.className = 'status error';
        elements.status.textContent = 'Image load failed';
      };
      elements.photo.src = imageUrl;
    }

    function getFrameSize() {
      return elements.frame.getBoundingClientRect().width;
    }

    function fitImage(savedCrop) {
      const frameSize = getFrameSize();
      const naturalWidth = elements.photo.naturalWidth;
      const naturalHeight = elements.photo.naturalHeight;
      state.minScale = Math.max(frameSize / naturalWidth, frameSize / naturalHeight);

      if (savedCrop) {
        state.scale = frameSize / savedCrop.size;
        elements.zoom.value = String(Math.max(1, Math.min(4, state.scale / state.minScale)));
        state.offsetX = -savedCrop.x * state.scale;
        state.offsetY = -savedCrop.y * state.scale;
      } else {
        state.scale = state.minScale;
        elements.zoom.value = '1';
        state.offsetX = (frameSize - naturalWidth * state.scale) / 2;
        state.offsetY = (frameSize - naturalHeight * state.scale) / 2;
      }

      clampOffsets();
      renderImage();
    }

    function renderImage() {
      const width = elements.photo.naturalWidth * state.scale;
      const height = elements.photo.naturalHeight * state.scale;

      elements.photo.style.width = width + 'px';
      elements.photo.style.height = height + 'px';
      elements.photo.style.transform = 'translate(' + state.offsetX + 'px, ' + state.offsetY + 'px)';
    }

    function clampOffsets() {
      const frameSize = getFrameSize();
      const imageWidth = elements.photo.naturalWidth * state.scale;
      const imageHeight = elements.photo.naturalHeight * state.scale;
      const minX = Math.min(0, frameSize - imageWidth);
      const minY = Math.min(0, frameSize - imageHeight);

      state.offsetX = Math.max(minX, Math.min(0, state.offsetX));
      state.offsetY = Math.max(minY, Math.min(0, state.offsetY));
    }

    function getCrop() {
      const frameSize = getFrameSize();

      return {
        x: Math.max(0, -state.offsetX / state.scale),
        y: Math.max(0, -state.offsetY / state.scale),
        size: frameSize / state.scale,
      };
    }

    function goToNextUnsavedOrNext() {
      const nextUnsaved = state.entries.findIndex((entry, index) => {
        return index > state.index && !entry.saved;
      });

      if (nextUnsaved >= 0) {
        selectEntry(nextUnsaved);
        return;
      }

      if (state.index < state.entries.length - 1) {
        selectEntry(state.index + 1);
      } else {
        elements.status.className = 'status';
        elements.status.textContent = 'All entries after this one are saved';
      }
    }

    async function saveCrop() {
      const entry = currentEntry();

      if (!entry || !state.imageReady) {
        return;
      }

      elements.saveButton.disabled = true;
      elements.status.className = 'status';
      elements.status.textContent = 'Saving ' + entry.outputFile;

      try {
        const response = await fetch('/api/save-crop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: entry.id,
            crop: getCrop(),
          }),
        });
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error || 'Save failed');
        }

        entry.saved = true;
        entry.crop = data.crop;
        renderList();
        elements.status.textContent = 'Saved ' + entry.outputFile;
        goToNextUnsavedOrNext();
      } catch (error) {
        elements.status.className = 'status error';
        elements.status.textContent = error instanceof Error ? error.message : String(error);
      } finally {
        elements.saveButton.disabled = false;
      }
    }

    elements.frame.addEventListener('pointerdown', (event) => {
      if (!state.imageReady) {
        return;
      }

      state.dragging = true;
      state.dragStartX = event.clientX;
      state.dragStartY = event.clientY;
      state.startOffsetX = state.offsetX;
      state.startOffsetY = state.offsetY;
      elements.frame.classList.add('dragging');
      elements.frame.setPointerCapture(event.pointerId);
    });

    elements.frame.addEventListener('pointermove', (event) => {
      if (!state.dragging) {
        return;
      }

      state.offsetX = state.startOffsetX + event.clientX - state.dragStartX;
      state.offsetY = state.startOffsetY + event.clientY - state.dragStartY;
      clampOffsets();
      renderImage();
    });

    function stopDragging(event) {
      state.dragging = false;
      elements.frame.classList.remove('dragging');

      if (event.pointerId !== undefined && elements.frame.hasPointerCapture(event.pointerId)) {
        elements.frame.releasePointerCapture(event.pointerId);
      }
    }

    elements.frame.addEventListener('pointerup', stopDragging);
    elements.frame.addEventListener('pointercancel', stopDragging);

    elements.zoom.addEventListener('input', () => {
      if (!state.imageReady) {
        return;
      }

      const frameSize = getFrameSize();
      const centerX = (-state.offsetX + frameSize / 2) / state.scale;
      const centerY = (-state.offsetY + frameSize / 2) / state.scale;
      state.scale = state.minScale * Number(elements.zoom.value);
      state.offsetX = frameSize / 2 - centerX * state.scale;
      state.offsetY = frameSize / 2 - centerY * state.scale;
      clampOffsets();
      renderImage();
    });

    elements.previousButton.addEventListener('click', () => selectEntry(state.index - 1));
    elements.nextButton.addEventListener('click', () => selectEntry(state.index + 1));
    elements.saveButton.addEventListener('click', saveCrop);
    elements.search.addEventListener('input', renderList);

    window.addEventListener('resize', () => {
      const entry = currentEntry();

      if (entry && state.imageReady) {
        entry.crop = getCrop();
        fitImage(entry.crop);
      }
    });

    boot().catch((error) => {
      elements.status.className = 'status error';
      elements.status.textContent = error instanceof Error ? error.message : String(error);
    });
  </script>
</body>
</html>`
}
