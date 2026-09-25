// Renders the pixel art in tools/sprites/art.mjs into PNGs under assets/default.s/.
// For every plant sprite it writes 4 variants: 2 idle-sway frames x healthy/wilted.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PNG } from 'pngjs'
import { PALETTE, POT, FACES, PLANTS, ICONS } from './sprites/art.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'assets/default.s')
const N = 32
const SCALE = 6
const SOIL_ROW = 23
const POT_CENTER = 15.5
const WILT_TINT = [0x8d, 0x6e, 0x3f]
const ICON_COLORS = { drop: '#4fc3f7', sun: '#ffd54f', heart: '#f06292' }

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const mix = (a, b, t) => a.map((v, i) => Math.round(v * (1 - t) + b[i] * t))

function blank(n = N) {
  return Array.from({ length: n }, () => Array(n).fill(null))
}

function put(grid, x, y, color) {
  if (y >= 0 && y < grid.length && x >= 0 && x < grid.length) grid[y][x] = color
}

// Horizontal offset per plant row: sway leans the top right, wilting droops it left.
function rowShift(rel, frame, wilted) {
  if (wilted) return rel < 0.33 ? -2 - frame : rel < 0.66 ? -1 : 0
  return frame === 1 && rel < 0.5 ? 1 : 0
}

function drawPlant(grid, lines, frame, wilted) {
  const h = lines.length
  const last = lines[h - 1]
  const cols = [...last].map((c, i) => (c === '.' ? -1 : i)).filter((i) => i >= 0)
  const anchor = cols.reduce((a, b) => a + b, 0) / cols.length
  const ox = Math.round(POT_CENTER - anchor)
  const oy = SOIL_ROW - (h - 1) + (wilted ? 1 : 0)
  lines.forEach((line, r) => {
    const dx = rowShift(r / h, frame, wilted)
    ;[...line].forEach((ch, c) => {
      if (ch === '.') return
      let color = rgb(PALETTE[ch])
      if (wilted) color = mix(color, WILT_TINT, 0.55).map((v) => Math.round(v * 0.85))
      put(grid, ox + c + dx, oy + r, color)
    })
  })
}

function drawPot(grid, face) {
  POT.forEach((line, r) => {
    ;[...line].forEach((ch, c) => {
      // Soil row sits behind the plant: only fill empty cells.
      if (ch === '.' || (ch === 'S' && grid[SOIL_ROW + r][c])) return
      put(grid, c, SOIL_ROW + r, rgb(PALETTE[ch]))
    })
  })
  for (const [x, y, ch] of FACES[face]) put(grid, x, y, rgb(PALETTE[ch]))
}

function writePng(file, grid, scale, size = grid.length * scale, bg = null) {
  const png = new PNG({ width: size, height: size })
  const off = Math.floor((size - grid.length * scale) / 2)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const gx = Math.floor((x - off) / scale)
      const gy = Math.floor((y - off) / scale)
      const inside = x >= off && y >= off && gx < grid.length && gy < grid.length
      const c = inside ? grid[gy][gx] : null
      const px = c || (bg ? bg(x, y) : null)
      const i = (y * size + x) * 4
      png.data[i] = px ? px[0] : 0
      png.data[i + 1] = px ? px[1] : 0
      png.data[i + 2] = px ? px[2] : 0
      png.data[i + 3] = px ? (px[3] ?? 255) : 0
    }
  }
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, PNG.sync.write(png))
}

function renderPlant(name, frame, wilted) {
  const grid = blank()
  drawPlant(grid, PLANTS[name], frame, wilted)
  drawPot(grid, wilted ? 'sad' : 'happy')
  return grid
}

let count = 0
for (const name of Object.keys(PLANTS)) {
  for (const frame of [0, 1]) {
    for (const wilted of [false, true]) {
      const file = path.join(OUT, 'plants', `${name}_${frame}${wilted ? '_w' : ''}.png`)
      writePng(file, renderPlant(name, frame, wilted), SCALE)
      count++
    }
  }
}

for (const [name, lines] of Object.entries(ICONS)) {
  const grid = blank(8)
  const color = rgb(ICON_COLORS[name])
  lines.forEach((line, y) => [...line].forEach((ch, x) => ch !== '.' && put(grid, x, y, color)))
  writePng(path.join(OUT, 'ui', `${name}.png`), grid, 3)
  count++
}

// App icon: blooming sunflower on a dark green disc.
const ICON_SIZE = 240
const disc = (x, y) => {
  const r = ICON_SIZE / 2
  return (x - r + 0.5) ** 2 + (y - r + 0.5) ** 2 <= r * r ? [0x1b, 0x3a, 0x1f] : null
}
writePng(path.join(OUT, 'icon.png'), renderPlant('sunflower_bloom', 0, false), 7, ICON_SIZE, disc)
count++

// README banner: pixel title over the growth stages and every final form.
const FONT = {
  P: ['1111.', '1...1', '1...1', '1111.', '1....', '1....', '1....'],
  L: ['1....', '1....', '1....', '1....', '1....', '1....', '11111'],
  A: ['.111.', '1...1', '1...1', '11111', '1...1', '1...1', '1...1'],
  N: ['1...1', '11..1', '1.1.1', '1..11', '1...1', '1...1', '1...1'],
  T: ['11111', '..1..', '..1..', '..1..', '..1..', '..1..', '..1..']
}
function banner(file) {
  const plants = ['seed', 'sprout', 'sapling', 'fern_bloom', 'sunflower_bloom', 'rose_bloom', 'oak_bloom', 'bonsai_bloom']
  const title = 'PLANTPAL'
  const T = 2 // title pixel size in cells
  const w = plants.length * (N + 1) + 3
  const h = 4 + 7 * T + 4 + N + 2
  const bg = rgb('#14261a')
  const cells = Array.from({ length: h }, () => Array(w).fill(bg))
  const tw = title.length * 6 * T - T
  let x0 = Math.floor((w - tw) / 2)
  for (const ch of title) {
    FONT[ch].forEach((row, y) => [...row].forEach((c, x) => {
      if (c !== '1') return
      for (let dy = 0; dy < T; dy++) {
        for (let dx = 0; dx < T; dx++) {
          cells[4 + y * T + dy + 1][x0 + x * T + dx + 1] = rgb('#2e7d32') // shadow
          cells[4 + y * T + dy][x0 + x * T + dx] = rgb('#9ccc65')
        }
      }
    }))
    x0 += 6 * T
  }
  plants.forEach((name, i) => {
    const g = renderPlant(name, 0, false)
    g.forEach((row, y) => row.forEach((c, x) => c && (cells[4 + 7 * T + 4 + y][2 + i * (N + 1) + x] = c)))
  })
  const scale = 4
  const png = new PNG({ width: w * scale, height: h * scale })
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const c = cells[Math.floor(y / scale)][Math.floor(x / scale)]
      png.data.set([c[0], c[1], c[2], 255], (y * png.width + x) * 4)
    }
  }
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, PNG.sync.write(png))
}
banner(path.join(ROOT, 'docs/banner.png'))
count++

// Contact sheet for eyeballing the art (not shipped).
if (process.argv.includes('--preview')) {
  const names = Object.keys(PLANTS)
  const cell = N + 2
  const sheet = Array.from({ length: cell * names.length }, () => Array(cell * 4).fill([40, 40, 40]))
  names.forEach((name, i) => {
    ;[[0, false], [1, false], [0, true], [1, true]].forEach(([f, w], j) => {
      const g = renderPlant(name, f, w)
      g.forEach((row, y) => row.forEach((c, x) => c && (sheet[i * cell + y + 1][j * cell + x + 1] = c)))
    })
  })
  const scale = 4
  const png = new PNG({ width: sheet[0].length * scale, height: sheet.length * scale })
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const c = sheet[Math.floor(y / scale)][Math.floor(x / scale)]
      const i = (y * png.width + x) * 4
      png.data.set([c[0], c[1], c[2], 255], i)
    }
  }
  const out = process.argv[process.argv.indexOf('--preview') + 1]
  fs.writeFileSync(out, PNG.sync.write(png))
  console.log(`preview: ${out}`)
}

console.log(`wrote ${count} images to ${path.relative(ROOT, OUT)}`)
