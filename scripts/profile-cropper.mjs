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
      sendJson(response, { entries: manifest.map(summarizeManifestEntry) })
      return
    }

    if (request.method === 'GET' && url.pathname.startsWith('/image/')) {
      await sendPreviewImage(url, response)
      return
    }

    if (request.method === 'POST' && url.pathname === '/api/save-crop') {
      await saveRequestedCrop(request, response)
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

function summarizeManifestEntry(entry) {
  const record = getCropRecord(entry)
  return {
    id: entry.id,
    slug: entry.slug,
    name: entry.name,
    role: entry.role,
    sourceFile: path.basename(entry.sourcePath),
    sourceKind: entry.sourceKind,
    outputFile: path.basename(entry.outputPath),
    saved: Boolean(record),
    crop: record?.crop ?? null,
  }
}

async function sendPreviewImage(url, response) {
  const id = decodeURIComponent(url.pathname.slice('/image/'.length))
  const previewPath = await ensurePreview(getEntry(id))
  response.writeHead(200, {
    'Content-Type': 'image/jpeg',
    'Cache-Control': 'no-store',
  })
  createReadStream(previewPath).pipe(response)
}

async function saveRequestedCrop(request, response) {
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
  const matchMap = buildPersonMatchMap(people)

  return { match: (sourcePath) => findPersonMatch(sourcePath, matchMap) }
}

function buildPersonMatchMap(people) {
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

  return matchMap
}

function findPersonMatch(sourcePath, matchMap) {
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
    return { matchedBy, person: [...matches][0] }
  }
  return undefined
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
  return readFileSync(
    new URL('./profile-cropper.html', import.meta.url),
    'utf8',
  )
}
