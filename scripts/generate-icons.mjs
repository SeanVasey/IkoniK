#!/usr/bin/env node
/**
 * Generate the full IkoniK PWA / favicon asset suite from the master SVGs.
 *
 * Two sources of truth, each rendered to the targets it is designed for:
 *
 *  1. ikonik-icon-ios.svg (repo root) — the iOS Home Screen tile. It is opaque
 *     full-bleed edge-to-edge (a pink border plate under the dark rounded body)
 *     *by design*: iOS applies its own squircle mask, so an opaque plate keeps
 *     light/dark mode from ever showing through the corners. This is the source
 *     for the apple-touch-icons only.
 *
 *  2. public/icons/icon-ios.svg — the optimized icon with a transparent
 *     background (transparent outside the rounded body). It is the source for
 *     every raster where a transparent background is ideal: the PWA / Android /
 *     browser-chrome icons, the favicons, and favicon.ico. Per CLAUDE.md, these
 *     rasters preserve the source's transparency (no solid-color compositing).
 *     This file is a hand-authored source — this script READS it and never
 *     overwrites it; the SVG favicon in layout.tsx links to it directly.
 *
 * Never hand-edit the PNGs — regenerate. Never delete either source SVG.
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

// Opaque full-bleed master → iOS Home Screen apple-touch-icons.
const appleSvg = readFileSync(join(root, 'ikonik-icon-ios.svg'))
// Optimized transparent master → PWA / favicon / browser-chrome rasters.
const transparentSvg = readFileSync(join(iconsDir, 'icon-ios.svg'))

/**
 * PNGs to emit: [filename, size, source].
 * apple-touch-icons render from the opaque tile; everything else from the
 * transparent optimized icon.
 */
const pngTargets = [
  ['icon-1024.png', 1024, transparentSvg],
  ['icon-512.png', 512, transparentSvg],
  ['icon-384.png', 384, transparentSvg],
  ['icon-192.png', 192, transparentSvg],
  ['icon-144.png', 144, transparentSvg],
  ['icon-96.png', 96, transparentSvg],
  ['apple-touch-icon.png', 180, appleSvg],
  ['apple-touch-icon-180.png', 180, appleSvg],
  ['apple-touch-icon-167.png', 167, appleSvg],
  ['apple-touch-icon-152.png', 152, appleSvg],
  ['apple-touch-icon-120.png', 120, appleSvg],
  ['favicon-32.png', 32, transparentSvg],
  ['favicon-16.png', 16, transparentSvg],
]

/** Render an SVG buffer to a square transparent PNG buffer at the given size. */
async function renderPng(svg, size) {
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
  for (const [name, size, svg] of pngTargets) {
    const buf = await renderPng(svg, size)
    writeFileSync(join(iconsDir, name), buf)
    console.log(`✓ icons/${name} (${size}×${size})`)
  }

  // Multi-size favicon.ico (16, 32, 48) — transparent optimized icon, placed in
  // public/ root for Next.js.
  const icoImages = await Promise.all(
    [16, 32, 48].map(async (size) => ({ size, data: await renderPng(transparentSvg, size) })),
  )
  const ico = buildIco(icoImages)
  writeFileSync(join(publicDir, 'favicon.ico'), ico)
  console.log('✓ favicon.ico (16,32,48) → public/')

  console.log('\nApple-touch icons ← ikonik-icon-ios.svg (opaque tile)')
  console.log('PWA / favicon rasters ← public/icons/icon-ios.svg (transparent)')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
