# Utilities

This directory contains utility scripts for the project.

## Image Conversion Script

### convert-to-avif.js

Converts images in the `assets/` directory to AVIF format using ffmpeg. Original images are preserved, and `.avif` versions are created alongside them.

**Prerequisites:**
- ffmpeg must be installed on your system
  - Linux: `sudo apt install ffmpeg`
  - macOS: `brew install ffmpeg`
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

**Usage via pnpm scripts:**

```bash
# Show help and available options
pnpm run convert:avif

# Convert all supported formats (jpeg, png, webp, gif, bmp, tiff)
pnpm run convert:avif:all

# Convert only JPEG images
pnpm run convert:avif:jpeg

# Convert only PNG images
pnpm run convert:avif:png

# Convert with custom quality (0-100, default: 65)
node src/utils/convert-to-avif.js --jpeg --quality 80

# Convert multiple formats at once
node src/utils/convert-to-avif.js --jpeg --png
```

**Options:**
- `--all` - Convert all supported formats
- `--jpeg` - Convert JPEG/JPG files only
- `--png` - Convert PNG files only
- `--webp` - Convert WebP files only
- `--gif` - Convert GIF files only
- `--bmp` - Convert BMP files only
- `--tiff` - Convert TIFF files only
- `--quality <n>` - Set quality (0-100, default: 65)

**Quality Guide:**
- High (80+): Larger file sizes, excellent quality
- Medium (60-75): Balanced file size and quality (recommended)
- Low (40-55): Smaller files, good for web performance

**Features:**
- Preserves original images
- Skips files that already have AVIF versions
- Shows file size savings
- Progress indicators
- Error handling and reporting

**Example output:**
```
🎨 Converting 3 image(s) to AVIF format
📁 Source: /path/to/assets
⚙️  Quality: 65

🔄 [1/3] Converting blog-placeholder-1.jpg...
   ✅ Created blog-placeholder-1.avif (45.2KB, 67.3% smaller)
```
