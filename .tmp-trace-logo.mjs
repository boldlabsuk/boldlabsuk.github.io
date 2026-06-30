import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const [, , inputPath, outputPath, thresholdArg = '0.5', toleranceArg = '0.55'] =
  process.argv

if (!inputPath || !outputPath) {
  throw new Error(
    'Usage: node .tmp-trace-logo.mjs input.png output.svg [threshold] [tolerance]',
  )
}

const width = 205
const height = 228
const threshold = Number(thresholdArg)
const tolerance = Number(toleranceArg)
const raw = execFileSync('magick', [inputPath, '-depth', '8', 'rgba:-'])

const blue = estimateBlue(raw)
const white = [255, 255, 255]
const values = Array.from({ length: height }, () => new Float64Array(width))

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const i = (y * width + x) * 4
    const r = raw[i]
    const g = raw[i + 1]
    const b = raw[i + 2]
    const alpha =
      [
        (white[0] - r) / (white[0] - blue[0]),
        (white[1] - g) / (white[1] - blue[1]),
        (white[2] - b) / (white[2] - blue[2]),
      ].reduce((sum, item) => sum + item, 0) / 3

    values[y][x] = Math.max(0, Math.min(1, alpha))
  }
}

const segments = []

for (let y = 0; y < height - 1; y += 1) {
  for (let x = 0; x < width - 1; x += 1) {
    const tl = values[y][x]
    const tr = values[y][x + 1]
    const br = values[y + 1][x + 1]
    const bl = values[y + 1][x]
    const mask =
      (tl >= threshold ? 1 : 0) |
      (tr >= threshold ? 2 : 0) |
      (br >= threshold ? 4 : 0) |
      (bl >= threshold ? 8 : 0)

    if (mask === 0 || mask === 15) {
      continue
    }

    const points = {
      top: interpolate([x + 0.5, y + 0.5], [x + 1.5, y + 0.5], tl, tr),
      right: interpolate([x + 1.5, y + 0.5], [x + 1.5, y + 1.5], tr, br),
      bottom: interpolate([x + 0.5, y + 1.5], [x + 1.5, y + 1.5], bl, br),
      left: interpolate([x + 0.5, y + 0.5], [x + 0.5, y + 1.5], tl, bl),
    }

    const add = (a, b) => segments.push([points[a], points[b]])

    switch (mask) {
      case 1:
      case 14:
        add('left', 'top')
        break
      case 2:
      case 13:
        add('top', 'right')
        break
      case 3:
      case 12:
        add('left', 'right')
        break
      case 4:
      case 11:
        add('right', 'bottom')
        break
      case 5:
        add('left', 'bottom')
        add('top', 'right')
        break
      case 6:
      case 9:
        add('top', 'bottom')
        break
      case 7:
      case 8:
        add('left', 'bottom')
        break
      case 10:
        add('top', 'left')
        add('right', 'bottom')
        break
      default:
        break
    }
  }
}

const loops = connectSegments(segments)
  .filter((loop) => loop.length > 8 && Math.abs(polygonArea(loop)) > 1)
  .sort((a, b) => Math.abs(polygonArea(b)) - Math.abs(polygonArea(a)))

const d = loops
  .map((loop) => pathFromLoop(simplifyClosed(loop, tolerance)))
  .join(' ')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="BOLD butterfly logo">
  <rect width="${width}" height="${height}" fill="#fff"/>
  <path fill="${rgbToHex(blue)}" fill-rule="evenodd" d="${d}"/>
</svg>
`

writeFileSync(outputPath, svg)

function estimateBlue(bytes) {
  const pixels = []

  for (let i = 0; i < bytes.length; i += 4) {
    const r = bytes[i]
    const g = bytes[i + 1]
    const b = bytes[i + 2]

    if (r <= 12 && g >= 45 && g <= 70 && b >= 92 && b <= 130) {
      pixels.push([r, g, b])
    }
  }

  if (pixels.length === 0) {
    return [3, 56, 112]
  }

  return [0, 1, 2].map((channel) => {
    const items = pixels.map((pixel) => pixel[channel]).sort((a, b) => a - b)
    return items[Math.floor(items.length / 2)]
  })
}

function interpolate(a, b, va, vb) {
  const denom = vb - va
  const t = Math.abs(denom) < 1e-9 ? 0.5 : (threshold - va) / denom
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
}

function connectSegments(items) {
  const unused = new Set(items.map((_, index) => index))
  const byStart = new Map()

  items.forEach((segment, index) => {
    for (const point of segment) {
      const key = pointKey(point)
      if (!byStart.has(key)) {
        byStart.set(key, [])
      }

      byStart.get(key).push(index)
    }
  })

  const loops = []

  while (unused.size > 0) {
    const firstIndex = unused.values().next().value
    unused.delete(firstIndex)
    const first = items[firstIndex]
    const loop = [first[0], first[1]]
    let current = first[1]

    for (let guard = 0; guard < items.length + 10; guard += 1) {
      const currentKey = pointKey(current)
      const nextIndex = (byStart.get(currentKey) ?? []).find((index) =>
        unused.has(index),
      )

      if (nextIndex === undefined) {
        break
      }

      unused.delete(nextIndex)
      const [a, b] = items[nextIndex]
      const next = samePoint(a, current) ? b : a
      loop.push(next)
      current = next

      if (samePoint(current, loop[0])) {
        loop.pop()
        loops.push(loop)
        break
      }
    }
  }

  return loops
}

function simplifyClosed(points, epsilon) {
  const prepared = points.slice()

  if (prepared.length < 4) {
    return prepared
  }

  let start = 0
  for (let i = 1; i < prepared.length; i += 1) {
    if (
      prepared[i][0] < prepared[start][0] ||
      (prepared[i][0] === prepared[start][0] &&
        prepared[i][1] < prepared[start][1])
    ) {
      start = i
    }
  }

  const rotated = prepared.slice(start).concat(prepared.slice(0, start))
  const open = rotated.concat([rotated[0]])
  const simplified = rdp(open, epsilon)
  simplified.pop()
  return simplified
}

function rdp(points, epsilon) {
  if (points.length <= 2) {
    return points
  }

  let maxDistance = 0
  let maxIndex = 0

  for (let i = 1; i < points.length - 1; i += 1) {
    const distance = pointLineDistance(
      points[i],
      points[0],
      points[points.length - 1],
    )
    if (distance > maxDistance) {
      maxDistance = distance
      maxIndex = i
    }
  }

  if (maxDistance <= epsilon) {
    return [points[0], points[points.length - 1]]
  }

  const left = rdp(points.slice(0, maxIndex + 1), epsilon)
  const right = rdp(points.slice(maxIndex), epsilon)
  return left.slice(0, -1).concat(right)
}

function pathFromLoop(points) {
  if (points.length < 3) {
    return ''
  }

  const closed = points.concat([points[0], points[1], points[2]])
  let d = `M${fmt(points[0][0])} ${fmt(points[0][1])}`

  for (let i = 0; i < points.length; i += 1) {
    const p0 = closed[i]
    const p1 = closed[i + 1]
    const p2 = closed[i + 2]
    const p3 = closed[i + 3]

    if (isStraight(p0, p1, p2)) {
      d += `L${fmt(p2[0])} ${fmt(p2[1])}`
      continue
    }

    const cp1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const cp2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]

    d += `C${fmt(cp1[0])} ${fmt(cp1[1])} ${fmt(cp2[0])} ${fmt(cp2[1])} ${fmt(p2[0])} ${fmt(p2[1])}`
  }

  return `${d}Z`
}

function isStraight(a, b, c) {
  return pointLineDistance(b, a, c) < 0.08
}

function pointLineDistance(point, lineStart, lineEnd) {
  const dx = lineEnd[0] - lineStart[0]
  const dy = lineEnd[1] - lineStart[1]
  const denominator = Math.hypot(dx, dy)

  if (denominator === 0) {
    return Math.hypot(point[0] - lineStart[0], point[1] - lineStart[1])
  }

  return (
    Math.abs(
      dy * point[0] -
        dx * point[1] +
        lineEnd[0] * lineStart[1] -
        lineEnd[1] * lineStart[0],
    ) / denominator
  )
}

function polygonArea(points) {
  let area = 0

  for (let i = 0; i < points.length; i += 1) {
    const point = points[i]
    const next = points[(i + 1) % points.length]
    area += point[0] * next[1] - next[0] * point[1]
  }

  return area / 2
}

function pointKey(point) {
  return `${Math.round(point[0] * 10000)},${Math.round(point[1] * 10000)}`
}

function samePoint(a, b) {
  return pointKey(a) === pointKey(b)
}

function fmt(value) {
  return Number(value.toFixed(2)).toString()
}

function rgbToHex(rgb) {
  return `#${rgb.map((item) => item.toString(16).padStart(2, '0')).join('')}`
}
