const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Build an ICO buffer containing multiple PNG resolutions
function buildIco(pngBuffers, sizes) {
  const count = sizes.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const entries = [];

  for (let i = 0; i < count; i++) {
    const s = sizes[i];
    const buf = pngBuffers[i];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(s >= 256 ? 0 : s, 0); // width
    entry.writeUInt8(s >= 256 ? 0 : s, 1); // height
    entry.writeUInt8(0, 2); // color palette count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buf.length, 8); // size of image data
    entry.writeUInt32LE(offset, 12); // offset of image data
    entries.push(entry);
    offset += buf.length;
  }

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(count, 4); // number of images

  return Buffer.concat([header, ...entries, ...pngBuffers]);
}

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const svgPath = path.join(rootDir, 'src', 'app', 'icon.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf8');

  console.log('Reading source SVG from:', svgPath);

  // Generate crisp PNGs for standard icon sizes
  const sizes = [16, 32, 48, 64, 128, 256];
  const pngBuffers = await Promise.all(
    sizes.map(size =>
      sharp(Buffer.from(svgContent))
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
    )
  );

  // 1. Build standard multi-resolution ICO for sizes 16, 32, 48
  const icoSizes = [16, 32, 48];
  const icoPngBuffers = pngBuffers.slice(0, 3);
  const icoBuffer = buildIco(icoPngBuffers, icoSizes);

  // Write to src/app/favicon.ico
  const appFaviconPath = path.join(rootDir, 'src', 'app', 'favicon.ico');
  fs.writeFileSync(appFaviconPath, icoBuffer);
  console.log(`Wrote ${icoBuffer.length} bytes to ${appFaviconPath}`);

  // Also write to public/favicon.ico so static web servers and direct /favicon.ico queries hit it
  const publicFaviconPath = path.join(rootDir, 'public', 'favicon.ico');
  fs.writeFileSync(publicFaviconPath, icoBuffer);
  console.log(`Wrote ${icoBuffer.length} bytes to ${publicFaviconPath}`);

  // 2. Generate Apple touch icon (180x180) with a clean subtle light squircle background for iOS home screens
  const appleSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
      <rect width="180" height="180" rx="40" fill="#FFFFFF"/>
      <g transform="translate(30, 30) scale(2)">
        <g transform="translate(4, 0)">
          <!-- Cart Frame -->
          <path d="M 4 11.5 C 2.3 11.5 1 10.2 1 8.5 C 1 6.8 2.3 5.5 4 5.5 L 14 5.5 C 17.8 5.5 21 8.6 21.2 12.4 L 23.2 36 C 23.4 39 25.8 41.5 28.8 41.5 L 47 41.5 C 48.7 41.5 50 42.8 50 44.5 C 50 46.2 48.7 47.5 47 47.5 L 28.8 47.5 C 22.5 47.5 17.4 42.5 17.2 36.2 L 15.2 12.6 C 15.1 11.5 14.2 11.5 14 11.5 Z" fill="#0B1C30" />
          <!-- Wheels -->
          <circle cx="28" cy="54" r="4.8" fill="#0B1C30" />
          <circle cx="45" cy="54" r="4.8" fill="#0B1C30" />
          <!-- Orange K -->
          <path d="M 23.5 25.8 L 39.5 7.5 L 48 7.5 L 29.8 25.8 L 48.5 42.5 L 40 42.5 Z" fill="#FD6A19" />
        </g>
      </g>
    </svg>
  `;

  const applePng = await sharp(Buffer.from(appleSvg))
    .resize(180, 180)
    .png()
    .toBuffer();

  const appleTouchPath1 = path.join(rootDir, 'public', 'apple-touch-icon.png');
  fs.writeFileSync(appleTouchPath1, applePng);
  console.log(`Wrote ${applePng.length} bytes to ${appleTouchPath1}`);

  const appleTouchPath2 = path.join(rootDir, 'src', 'app', 'apple-icon.png');
  fs.writeFileSync(appleTouchPath2, applePng);
  console.log(`Wrote ${applePng.length} bytes to ${appleTouchPath2}`);

  // 3. Update public/assets/images/kharidomart-cart-icon.png (192x192)
  const cartIconPng = await sharp(Buffer.from(svgContent))
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const cartIconPath = path.join(rootDir, 'public', 'assets', 'images', 'kharidomart-cart-icon.png');
  fs.writeFileSync(cartIconPath, cartIconPng);
  console.log(`Wrote ${cartIconPng.length} bytes to ${cartIconPath}`);

  // 4. Also generate 512x512 PWA icon
  const pwa512 = await sharp(Buffer.from(svgContent))
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const pwa512Path = path.join(rootDir, 'public', 'assets', 'images', 'kharidomart-icon-512.png');
  fs.writeFileSync(pwa512Path, pwa512);
  console.log(`Wrote ${pwa512Path}`);

  console.log('All favicons successfully generated!');
}

main().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
