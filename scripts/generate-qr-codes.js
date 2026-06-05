const QRCode = require('qrcode');
const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

async function generateQRWithLogo(url, outputPath) {
  const logoPath = path.join(__dirname, '..', 'public', 'sr-logo.png');
  const qrSize = 1000;
  const logoScale = 0.25; // 25% of QR size

  // Generate QR code as a buffer with high error correction to survive logo overlay
  const qrBuffer = await QRCode.toBuffer(url, {
    width: qrSize,
    height: qrSize,
    margin: 2,
    errorCorrectionLevel: 'H',
    type: 'png',
  });

  const [qrImage, logoImage] = await Promise.all([
    Jimp.read(qrBuffer),
    Jimp.read(logoPath),
  ]);

  // Resize logo to fit in center
  const logoSize = Math.round(qrSize * logoScale);
  logoImage.cover({ w: logoSize, h: logoSize });

  // Center the logo on the QR code
  const x = Math.round((qrImage.bitmap.width - logoImage.bitmap.width) / 2);
  const y = Math.round((qrImage.bitmap.height - logoImage.bitmap.height) / 2);

  // Composite logo onto QR code
  qrImage.composite(logoImage, x, y, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacitySource: 1,
    opacityDest: 1,
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await qrImage.write(outputPath);
  console.log(`Generated: ${outputPath}`);
}

async function main() {
  const outputDir = path.join(__dirname, '..', 'public', 'qr');

  await generateQRWithLogo('https://solsticerow.ca/', path.join(outputDir, 'solsticerow-home.png'));
  await generateQRWithLogo('https://solsticerow.ca/register', path.join(outputDir, 'solsticerow-register.png'));

  console.log('Done!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
