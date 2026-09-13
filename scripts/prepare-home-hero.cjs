// Export the approved master without generative edits or global sharpening.
// Usage: node scripts/prepare-home-hero.cjs --source <2508x1412 PNG>
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
  const sourceIndex = process.argv.indexOf('--source');
  const source = sourceIndex >= 0 ? process.argv[sourceIndex + 1] : undefined;
  if (!source) throw new Error('Provide the approved master with --source.');
  const metadata = await sharp(source).metadata();
  if (metadata.width !== 2508 || metadata.height !== 1412) {
    throw new Error('The approved master must be 2508x1412; crop coordinates are not valid for another size.');
  }
  const outputDirectory = path.resolve(__dirname, '../public/hero-assets');
  const crop = { left: 840, top: 0, width: 1128, height: 1410 };
  const exports = [
    ...[1280, 1920, 2508].map(width => ({ kind: 'desktop', width })),
    ...[640, 960, 1128].map(width => ({ kind: 'mobile', width })),
  ].map(item => ({ ...item, file: path.join(outputDirectory, `weft-street-${item.kind}-${item.width}.webp`) }));
  for (const item of exports) {
    try {
      await fs.access(item.file);
      throw new Error(`Preserving existing asset: ${item.file}`);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  await fs.mkdir(outputDirectory, { recursive: true });
  for (const item of exports) {
    let pipeline = sharp(source);
    if (item.kind === 'mobile') pipeline = pipeline.extract(crop);
    const info = await pipeline.resize({ width: item.width, withoutEnlargement: true })
      .webp({ quality: 86, effort: 6 }).toFile(item.file);
    console.log(JSON.stringify({ ...item, height: info.height, bytes: info.size, crop: item.kind === 'mobile' ? crop : null }));
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
