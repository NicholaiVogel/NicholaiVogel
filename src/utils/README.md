# Utilities

This directory contains utility scripts for the project.

## Git Commit Automation Script

### git-commit.js

Automatically generates commit messages using OpenRouter AI (inception/mercury-coder) based on your staged changes. The script analyzes both the git diff and status to create meaningful commit messages, then allows you to review, edit, and approve before committing.

**Prerequisites:**
- OpenRouter API key (free to get started)
  - Sign up: [openrouter.ai](https://openrouter.ai)
  - Get your API key: [openrouter.ai/keys](https://openrouter.ai/keys)
- Create a `.env` file in `src/utils/` directory:
  ```bash
  # Copy the example file
  cp src/utils/.env.example src/utils/.env

  # Edit the file and add your API key
  OPENROUTER_API_KEY=your_actual_api_key_here
  ```

**Usage:**

```bash
# 1. Stage your changes
git add <files>

# 2. Run the commit script
pnpm commit

# 3. Review the AI-generated message
# 4. Choose to [A]ccept, [E]dit, or [C]ancel
# 5. Optionally push to remote
```

**Workflow:**
1. **Staged Files Check** - Verifies you have changes staged
2. **Context Gathering** - Collects git diff and status
3. **AI Generation** - Calls OpenRouter API (inception/mercury-coder model) to generate commit message
4. **Review & Edit** - Shows message and prompts for approval
5. **Commit** - Creates the commit with approved message
6. **Optional Push** - Asks if you want to push to remote

**Features:**
- AI-powered commit message generation
- Interactive approval process
- Message editing capability
- Optional automatic push
- Follows project commit message conventions
- Detailed error messages and help text

**Example session:**
```
🚀 Git Commit Automation

🔍 Gathering git context...
🤖 Generating commit message with OpenRouter...

📝 Generated commit message:
────────────────────────────────────────────────────────────
Add git commit automation script with OpenRouter integration

- Create interactive commit message generator using inception/mercury-coder
- Support message editing and approval workflow
- Add optional push to remote after commit
────────────────────────────────────────────────────────────

[A]ccept / [E]dit / [C]ancel? a

📦 Creating commit...
✅ Commit created successfully!

Push to remote? [y/N] y
🚀 Pushing to remote...
✅ Pushed successfully!

✨ Done!
```

**Options:**
- `--help`, `-h` - Show help message

**Troubleshooting:**
- If you get ".env file not found" error, create `src/utils/.env` with your OpenRouter API key
- Get your API key from: https://openrouter.ai/keys
- If you get "401 Unauthorized", check that your API key is correct in the `.env` file
- The script requires staged changes - use `git add` first
- Make sure `.env` is git-ignored (already configured in `.gitignore`)

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
