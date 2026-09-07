import assert from 'node:assert/strict'
import { execFileSync, spawn, spawnSync } from 'node:child_process'
import { once } from 'node:events'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'

async function createCropperWorkspace() {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'bold-cropper-test-'))
  await Promise.all(
    ['scripts', 'context', 'input'].map((name) =>
      mkdir(path.join(directory, name)),
    ),
  )
  await cp(
    'scripts/profile-cropper.mjs',
    path.join(directory, 'scripts/profile-cropper.mjs'),
  )
  await cp(
    'scripts/profile-cropper.html',
    path.join(directory, 'scripts/profile-cropper.html'),
  )
  await writeFile(
    path.join(directory, 'our_people.json'),
    JSON.stringify([
      { name: 'Cropper Example', profilePicture: 'original.png' },
    ]),
  )
  execFileSync('magick', [
    '-size',
    '32x24',
    'xc:red',
    path.join(directory, 'input/original.png'),
  ])
  return directory
}

function startCropper(directory) {
  const child = spawn(
    process.execPath,
    [
      'scripts/profile-cropper.mjs',
      '--source-dir',
      'input',
      '--output-dir',
      'output',
      '--port',
      '24177',
    ],
    { cwd: directory, stdio: ['ignore', 'pipe', 'pipe'] },
  )
  const ready = new Promise((resolve, reject) => {
    let output = ''
    child.stdout.on('data', (chunk) => {
      output += chunk
      const match = output.match(/Profile cropper: (http:\/\/127\.0\.0\.1:\d+)/)
      if (match) resolve(match[1])
    })
    child.once('error', reject)
    child.once('exit', (code) => reject(new Error(`Cropper exited: ${code}`)))
  })
  return { child, ready }
}

async function checkCropperPage(baseUrl) {
  const response = await fetch(baseUrl)
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type'), /text\/html/)
  assert.match(await response.text(), /<title>BOLD Profile Cropper<\/title>/)
  const missing = await fetch(`${baseUrl}/missing`)
  assert.equal(missing.status, 404)
  assert.equal(await missing.text(), 'Not found')
}

async function saveExampleCrop(baseUrl) {
  const response = await fetch(`${baseUrl}/api/save-crop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'cropper-example',
      crop: { x: 100, y: -5, size: 50 },
    }),
  })
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    ok: true,
    id: 'cropper-example',
    slug: 'cropper-example',
    saved: true,
    crop: { x: 8, y: 0, size: 24 },
  })
}

test('cropper serves matched images and saves a constrained square crop', {
  skip: spawnSync('magick', ['-version']).status !== 0,
  timeout: 20000,
}, async (context) => {
  const directory = await createCropperWorkspace()
  context.after(() => rm(directory, { recursive: true, force: true }))
  const { child, ready } = startCropper(directory)
  context.after(async () => {
    if (child.exitCode === null) {
      child.kill()
      await once(child, 'exit')
    }
  })
  const baseUrl = await ready
  await checkCropperPage(baseUrl)
  const { entries } = await (await fetch(`${baseUrl}/api/manifest`)).json()
  assert.equal(entries.length, 1)
  assert.equal(entries[0].name, 'Cropper Example')
  assert.equal(entries[0].sourceKind, 'folder-filename')
  assert.equal(entries[0].saved, false)
  const image = await fetch(`${baseUrl}/image/cropper-example`)
  assert.equal(image.status, 200)
  assert.equal(image.headers.get('content-type'), 'image/jpeg')
  await saveExampleCrop(baseUrl)
  assert.deepEqual(await (await fetch(`${baseUrl}/api/status`)).json(), {
    total: 1,
    saved: 1,
    remaining: 0,
  })
  const saved = await (await fetch(`${baseUrl}/api/manifest`)).json()
  assert.deepEqual(saved.entries[0].crop, { x: 8, y: 0, size: 24 })
  const output = path.join(directory, 'output/cropper-example.webp')
  assert.equal(
    execFileSync('magick', ['identify', '-format', '%wx%h', output], {
      encoding: 'utf8',
    }),
    '640x640',
  )
  assert.ok((await readFile(output)).length > 0)
})
