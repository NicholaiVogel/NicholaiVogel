#!/usr/bin/env node

/**
 * Image to AVIF Converter
 *
 * Converts images in the assets/ directory to AVIF format using ffmpeg.
 * Originals are preserved, and .avif versions are created alongside them.
 *
 * Usage:
 *   node utils/convert-to-avif.js --all
 *   node utils/convert-to-avif.js --jpeg
 *   node utils/convert-to-avif.js --png
 *   node utils/convert-to-avif.js --jpeg --png
 *   node utils/convert-to-avif.js --webp
 *
 * Options:
 *   --all      Convert all supported formats (jpeg, png, webp, gif, bmp, tiff)
 *   --jpeg     Convert JPEG/JPG files only
 *   --png      Convert PNG files only
 *   --webp     Convert WebP files only
 *   --gif      Convert GIF files only
 *   --bmp      Convert BMP files only
 *   --tiff     Convert TIFF files only
 *   --quality  Set quality (default: 65, range: 0-100)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ASSETS_DIR = path.join(__dirname, '../assets');
const DEFAULT_QUALITY = 65;

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  all: args.includes('--all'),
  jpeg: args.includes('--jpeg'),
  png: args.includes('--png'),
  webp: args.includes('--webp'),
  gif: args.includes('--gif'),
  bmp: args.includes('--bmp'),
  tiff: args.includes('--tiff'),
  quality: DEFAULT_QUALITY
};

// Parse quality option
const qualityIndex = args.indexOf('--quality');
if (qualityIndex !== -1 && args[qualityIndex + 1]) {
  const quality = parseInt(args[qualityIndex + 1]);
  if (!isNaN(quality) && quality >= 0 && quality <= 100) {
    options.quality = quality;
  } else {
    console.error('⚠️  Invalid quality value. Using default: 65');
  }
}

// If no specific format is selected, show help
if (!options.all && !options.jpeg && !options.png && !options.webp && !options.gif && !options.bmp && !options.tiff) {
  console.log(`
Image to AVIF Converter

Usage:
  node utils/convert-to-avif.js [options]

Options:
  --all             Convert all supported formats
  --jpeg            Convert JPEG/JPG files only
  --png             Convert PNG files only
  --webp            Convert WebP files only
  --gif             Convert GIF files only
  --bmp             Convert BMP files only
  --tiff            Convert TIFF files only
  --quality <n>     Set quality (0-100, default: 65)

Examples:
  node utils/convert-to-avif.js --all
  node utils/convert-to-avif.js --jpeg --png
  node utils/convert-to-avif.js --jpeg --quality 80
  `);
  process.exit(0);
}

// Check if ffmpeg is installed
try {
  execSync('ffmpeg -version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ ffmpeg is not installed or not in PATH');
  console.error('   Install it with: sudo apt install ffmpeg (Linux) or brew install ffmpeg (macOS)');
  process.exit(1);
}

// Check if assets directory exists
if (!fs.existsSync(ASSETS_DIR)) {
  console.error(`❌ Assets directory not found: ${ASSETS_DIR}`);
  process.exit(1);
}

// Define supported formats
const formatExtensions = {
  jpeg: ['.jpg', '.jpeg'],
  png: ['.png'],
  webp: ['.webp'],
  gif: ['.gif'],
  bmp: ['.bmp'],
  tiff: ['.tiff', '.tif']
};

// Determine which extensions to process
let extensionsToProcess = [];
if (options.all) {
  extensionsToProcess = Object.values(formatExtensions).flat();
} else {
  Object.keys(formatExtensions).forEach(format => {
    if (options[format]) {
      extensionsToProcess.push(...formatExtensions[format]);
    }
  });
}

// Get all image files in assets directory
const allFiles = fs.readdirSync(ASSETS_DIR);
const imageFiles = allFiles.filter(file => {
  const ext = path.extname(file).toLowerCase();
  return extensionsToProcess.includes(ext);
});

if (imageFiles.length === 0) {
  console.log('ℹ️  No matching images found in assets directory');
  process.exit(0);
}

console.log(`\n🎨 Converting ${imageFiles.length} image(s) to AVIF format`);
console.log(`📁 Source: ${ASSETS_DIR}`);
console.log(`⚙️  Quality: ${options.quality}`);
console.log('');

let successCount = 0;
let skipCount = 0;
let errorCount = 0;

// Convert each image
imageFiles.forEach((file, index) => {
  const inputPath = path.join(ASSETS_DIR, file);
  const outputPath = path.join(ASSETS_DIR, path.basename(file, path.extname(file)) + '.avif');

  // Skip if AVIF already exists
  if (fs.existsSync(outputPath)) {
    console.log(`⏭️  [${index + 1}/${imageFiles.length}] Skipping ${file} (AVIF already exists)`);
    skipCount++;
    return;
  }

  try {
    console.log(`🔄 [${index + 1}/${imageFiles.length}] Converting ${file}...`);

    // Run ffmpeg conversion
    // -i: input file
    // -c:v libaom-av1: use AV1 codec for AVIF
    // -still-picture 1: encode as still image
    // -crf: quality (0=best, 63=worst, 65 is good balance)
    // -y: overwrite output file if it exists
    execSync(
      `ffmpeg -i "${inputPath}" -c:v libaom-av1 -still-picture 1 -crf ${100 - options.quality} -y "${outputPath}"`,
      { stdio: 'ignore' }
    );

    const inputStats = fs.statSync(inputPath);
    const outputStats = fs.statSync(outputPath);
    const savings = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

    console.log(`   ✅ Created ${path.basename(outputPath)} (${(outputStats.size / 1024).toFixed(1)}KB, ${savings}% smaller)`);
    successCount++;
  } catch (error) {
    console.error(`   ❌ Failed to convert ${file}: ${error.message}`);
    errorCount++;
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`✨ Conversion complete!`);
console.log(`   ✅ Converted: ${successCount}`);
if (skipCount > 0) console.log(`   ⏭️  Skipped: ${skipCount}`);
if (errorCount > 0) console.log(`   ❌ Failed: ${errorCount}`);
console.log('='.repeat(50) + '\n');
