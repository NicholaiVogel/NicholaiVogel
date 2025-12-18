#!/usr/bin/env node

/**
 * Notepad Script
 *
 * Appends timestamped notes to the notepad MDX file, commits, and deploys.
 *
 * Usage:
 *   pnpm notepad "Your note content here"
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const NOTEPAD_FILE = join(__dirname, '..', 'content', 'blog', 'nicholais-notepad.mdx');
const MAX_COMMIT_MSG_LENGTH = 50;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Execute a command and return the output
 */
function exec(command, options = {}) {
  try {
    return execSync(command, {
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
  } catch (error) {
    console.error(`${colors.red}❌ Command failed: ${command}${colors.reset}`);
    console.error(error.message);
    throw error;
  }
}

/**
 * Format current timestamp
 */
function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Append note to notepad file
 */
function appendNote(content) {
  console.log(`${colors.cyan}📝 Adding note to notepad...${colors.reset}`);

  const timestamp = getTimestamp();
  const noteEntry = `\n**[${timestamp}]** ${content}\n`;

  try {
    // Read current content
    const currentContent = readFileSync(NOTEPAD_FILE, 'utf-8');

    // Append new note
    const updatedContent = currentContent + noteEntry;

    // Write back to file
    writeFileSync(NOTEPAD_FILE, updatedContent, 'utf-8');

    console.log(`${colors.green}✅ Note added successfully${colors.reset}`);
    return timestamp;
  } catch (error) {
    console.error(`${colors.red}❌ Failed to write note${colors.reset}`);
    console.error(error.message);
    throw error;
  }
}

/**
 * Commit and push changes
 */
function commitAndPush(content) {
  console.log(`${colors.cyan}📦 Committing changes...${colors.reset}`);

  try {
    // Stage the notepad file
    exec(`git add "${NOTEPAD_FILE}"`);

    // Create commit message (truncate if too long)
    const commitMsg = content.length > MAX_COMMIT_MSG_LENGTH
      ? content.substring(0, MAX_COMMIT_MSG_LENGTH)
      : content;

    // Commit
    exec(`git commit -m "notepad: ${commitMsg}"`, { silent: true });

    console.log(`${colors.green}✅ Commit created${colors.reset}`);

    // Push to remote
    console.log(`${colors.cyan}🚀 Pushing to remote...${colors.reset}`);
    exec('git push');

    console.log(`${colors.green}✅ Pushed successfully${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Git operation failed${colors.reset}`);
    throw error;
  }
}

/**
 * Deploy the site
 */
function deploy() {
  console.log(`${colors.cyan}🚢 Deploying site...${colors.reset}`);

  try {
    exec('pnpm run deploy');
    console.log(`${colors.green}✅ Deployment complete${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Deployment failed${colors.reset}`);
    throw error;
  }
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
${colors.bright}Notepad Script${colors.reset}
${colors.dim}Append timestamped notes to your notepad${colors.reset}

${colors.bright}Usage:${colors.reset}
  ${colors.cyan}pnpm notepad "Your note content here"${colors.reset}

${colors.bright}Example:${colors.reset}
  ${colors.cyan}pnpm notepad "Implemented new feature for user authentication"${colors.reset}

${colors.bright}What it does:${colors.reset}
  1. Appends a timestamped note to ${colors.dim}src/content/blog/nicholais-notepad.mdx${colors.reset}
  2. Commits the change with message: ${colors.dim}notepad: [your note]${colors.reset}
  3. Pushes to remote repository
  4. Deploys the site

${colors.bright}Options:${colors.reset}
  --help, -h    Show this help message
`);
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  // Check for help flag
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  // Get note content
  const content = args.join(' ').trim();

  if (!content) {
    console.error(`${colors.red}❌ No note content provided${colors.reset}`);
    console.log(`\n${colors.yellow}💡 Usage:${colors.reset}`);
    console.log(`   ${colors.dim}pnpm notepad "Your note content here"${colors.reset}\n`);
    process.exit(1);
  }

  console.log(`${colors.bright}${colors.blue}📓 Notepad Script${colors.reset}\n`);

  try {
    // Append note to file
    appendNote(content);

    // Commit and push
    commitAndPush(content);

    // Deploy site
    deploy();

    console.log(`\n${colors.green}✨ Done!${colors.reset}\n`);
  } catch (error) {
    console.error(`\n${colors.red}❌ Operation failed${colors.reset}`);
    process.exit(1);
  }
}

// Run the script
main();
