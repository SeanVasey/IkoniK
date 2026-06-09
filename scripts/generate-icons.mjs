#!/usr/bin/env node
/**
 * Generate the full IkoniK PWA / favicon asset suite from the master SVG.
 *
 * Source of truth: public/icons/icon.svg (never hand-edit the PNGs — regenerate).
 * Every raster preserves the transparent background from the source SVG, per
 * CLAUDE.md (iOS 18+/26+ relies on transparency for adaptive Home Screen tinting).
 *
 * Usage: node scripts/generate-icons.mjs
 */
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const iconsDir = join(root, 'public', 'icons')
const publicDir = join(root, 'public')
const source = join(iconsDir, 'icon.svg')

const svg = readFileSync(source)

/** PNGs to emit: [filename, size]. */
const pngTargets = [
  ['icon-1024.png', 1024],
  ['icon-512.png', 512],
  ['icon-384.png', 384],
  ['icon-192.png', 192],
  ['icon-144.png', 144],
  ['icon-96.png', 96],
  ['apple-touch-icon.png', 180],
  ['apple-touch-icon-180.png', 180],
  ['apple-touch-icon-167.png', 167],
  ['apple-touch-icon-152.png', 152],
  ['apple-touch-icon-120.png', 120],
  ['favicon-32.png', 32],
  ['favicon-16.png', 16],
]

/** Render the SVG to a square transparent PNG buffer at the given size. */
async function renderPng(size) {
  return sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer()
}

/** Assemble a multi-image ICO from PNG buffers (ICO supports embedded PNG entries). */
function buildIco(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: 1 = icon
  header.writeUInt16LE(images.length, 4)

  const dirEntries = []
  const imageData = []
  let offset = 6 + images.length * 16

  for (const { size, data } of images) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(size >= 256 ? 0 : size, 0) // width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1) // height
    entry.writeUInt8(0, 2) // palette
    entry.writeUInt8(0, 3) // reserved
    entry.writeUInt16LE(1, 4) // color planes
    entry.writeUInt16LE(32, 6) // bits per pixel
    entry.writeUInt32LE(data.length, 8) // image size
    entry.writeUInt32LE(offset, 12) // offset
    dirEntries.push(entry)
    imageData.push(data)
    offset += data.length
  }

  return Buffer.concat([header, ...dirEntries, ...imageData])
}

async function main() {
  for (const [name, size] of pngTargets) {
    const buf = await renderPng(size)
    writeFileSync(join(iconsDir, name), buf)
    console.log(`✓ icons/${name} (${size}×${size})`)
  }

  // Multi-size favicon.ico (16, 32, 48) — placed in public/ root for Next.js.
  const icoImages = await Promise.all(
    [16, 32, 48].map(async (size) => ({ size, data: await renderPng(size) })),
  )
  const ico = buildIco(icoImages)
  writeFileSync(join(publicDir, 'favicon.ico'), ico)
  console.log('✓ favicon.ico (16,32,48) → public/')

  console.log('\nAll icon assets generated from public/icons/icon.svg')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
