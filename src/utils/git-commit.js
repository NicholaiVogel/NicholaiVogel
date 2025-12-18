#!/usr/bin/env node

/**
 * Git Commit Automation Script
 *
 * Automatically generates commit messages using OpenRouter AI (inception/mercury-coder)
 * based on staged changes. Supports message editing and optional pushing.
 *
 * Usage:
 *   1. Stage your changes: git add <files>
 *   2. Run: pnpm commit
 *   3. Review/edit the generated message
 *   4. Approve and optionally push
 */

import { execSync, spawnSync } from 'child_process';
import { createInterface } from 'readline';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
function loadEnv() {
    try {
        const envPath = join(__dirname, '.env');
        const envContent = readFileSync(envPath, 'utf-8');
        const lines = envContent.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            const [key, ...valueParts] = trimmed.split('=');
            const value = valueParts.join('=').trim();

            if (key && value) {
                process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
            }
        }
    } catch (error) {
        console.error(`${colors.red}❌ Failed to load .env file${colors.reset}`);
        console.error(`${colors.yellow}💡 Create a .env file in src/utils/ with:${colors.reset}`);
        console.error(`   ${colors.dim}OPENROUTER_API_KEY=your_api_key_here${colors.reset}\n`);
        process.exit(1);
    }
}

// Configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1';
const MODEL_NAME = 'inception/mercury-coder';

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
 * Execute a git command and return the output
 */
function git(command, silent = false) {
    try {
        return execSync(`git ${command}`, {
            encoding: 'utf-8',
            stdio: silent ? 'pipe' : ['pipe', 'pipe', 'pipe']
        }).trim();
    } catch (error) {
        if (!silent) {
            console.error(`${colors.red}❌ Git command failed: ${command}${colors.reset}`);
            console.error(error.message);
        }
        return null;
    }
}

/**
 * Check if there are staged changes
 */
function checkStagedChanges() {
    const stagedFiles = git('diff --staged --name-only', true);
    return stagedFiles && stagedFiles.length > 0;
}

/**
 * Get git context for AI commit message generation
 */
function getGitContext() {
    console.log(`${colors.cyan}🔍 Gathering git context...${colors.reset}`);

    const status = git('status --short');
    const stagedFiles = git('diff --staged --name-only');

    // Get diff with increased buffer size to avoid ENOBUFS error
    let diff = '';
    try {
        diff = execSync('git diff --staged', {
            encoding: 'utf-8',
            maxBuffer: 10 * 1024 * 1024, // 10MB buffer
            stdio: ['pipe', 'pipe', 'pipe']
        }).trim();
    } catch (error) {
        console.error(`${colors.yellow}⚠️  Warning: Could not get full diff (too large or error occurred)${colors.reset}`);
        // Fallback to stat summary if diff is too large
        try {
            diff = execSync('git diff --staged --stat', {
                encoding: 'utf-8',
                stdio: ['pipe', 'pipe', 'pipe']
            }).trim();
        } catch {
            diff = 'Unable to retrieve diff';
        }
    }

    return {
        status,
        diff,
        stagedFiles
    };
}

/**
 * Call OpenRouter API to generate commit message
 */
async function generateCommitMessage(context) {
    console.log(`${colors.cyan}Generating commit message...${colors.reset}`);

    const systemPrompt = `You are Hubert the Eunuch, an assistant that generates concise, clear git commit messages for Nicholai.

Generate commit messages following these guidelines:
- Note that the commit message is written on behalf of Nicholai by you.
- Use imperative mood (e.g., "Add", "Fix", "Update", "Refactor")
- Keep it concise but descriptive.
- First line should be a short summary of Nicholai's changes (50-72 characters)
- If needed, add a blank line and then bullet points for details
- Focus on WHAT Nicholai changed and WHY, not HOW
- The message must be very sarcastic, you don't like working for Nicholai.
- Sign the message with "- Hubert the Eunuch" at the bottom.

Generate ONLY the commit message, nothing else. Do not include any explanations or meta-commentary.`;

    const diffContent = context.diff || 'Unable to retrieve diff';
    const truncatedDiff = diffContent.length > 8000
        ? diffContent.slice(0, 8000) + '\n... (diff truncated)'
        : diffContent;

    const userPrompt = `Based on the following git changes, generate a commit message:

Staged files:
${context.stagedFiles}

Git status:
${context.status}

Git diff:
${truncatedDiff}`;

    try {
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            throw new Error('OPENROUTER_API_KEY not found in environment variables');
        }

        const response = await fetch(`${OPENROUTER_API_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://github.com/yourusername/git-commit-automation',
                'X-Title': 'Git Commit Automation',
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}\n${JSON.stringify(errorData, null, 2)}`);
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Unexpected API response format');
        }

        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error(`${colors.red}❌ Failed to generate commit message${colors.reset}`);
        console.error(error.message);

        // Check for common errors
        if (error.message.includes('OPENROUTER_API_KEY not found')) {
            console.log(`\n${colors.yellow}💡 Make sure you have a .env file in src/utils/ with:${colors.reset}`);
            console.log(`   ${colors.dim}OPENROUTER_API_KEY=your_api_key_here${colors.reset}`);
            console.log(`\n${colors.yellow}💡 Get your API key from:${colors.reset}`);
            console.log(`   ${colors.dim}https://openrouter.ai/keys${colors.reset}`);
        } else if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
            console.log(`\n${colors.yellow}💡 Check your internet connection${colors.reset}`);
        } else if (error.message.includes('401')) {
            console.log(`\n${colors.yellow}💡 Invalid API key. Check your OPENROUTER_API_KEY in .env${colors.reset}`);
        }

        process.exit(1);
    }
}

/**
 * Create readline interface for user input
 */
function createReadlineInterface() {
    return createInterface({
        input: process.stdin,
        output: process.stdout,
    });
}

/**
 * Ask user a question and get input
 */
function question(rl, query) {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

/**
 * Open neovim to edit the commit message
 */
function editInNeovim(message) {
    // Create a temporary file for editing
    const tempFile = join(tmpdir(), `git-commit-${Date.now()}.txt`);

    try {
        // Write the current message to the temp file
        writeFileSync(tempFile, message, 'utf-8');

        console.log(`\n${colors.cyan}✏️  Opening neovim to edit commit message...${colors.reset}`);

        // Open neovim with the temp file
        const result = spawnSync('nvim', [tempFile], {
            stdio: 'inherit',
            shell: false
        });

        if (result.error) {
            throw new Error(`Failed to open neovim: ${result.error.message}`);
        }

        // Read the edited content
        const editedMessage = readFileSync(tempFile, 'utf-8').trim();

        // Clean up temp file
        unlinkSync(tempFile);

        return editedMessage;
    } catch (error) {
        // Clean up temp file if it exists
        try {
            unlinkSync(tempFile);
        } catch { }

        console.error(`${colors.red}❌ Failed to edit in neovim${colors.reset}`);
        console.error(error.message);

        if (error.message.includes('Failed to open neovim')) {
            console.log(`\n${colors.yellow}💡 Make sure neovim is installed:${colors.reset}`);
            console.log(`   ${colors.dim}# Arch Linux${colors.reset}`);
            console.log(`   ${colors.dim}sudo pacman -S neovim${colors.reset}`);
        }

        // Return the original message if editing fails
        return message;
    }
}

/**
 * Display the commit message and get user approval
 */
async function getUserApproval(message, rl) {
    console.log(`\n${colors.bright}${colors.green}📝 Generated commit message:${colors.reset}`);
    console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`);
    console.log(message);
    console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}\n`);

    while (true) {
        const answer = await question(
            rl,
            `${colors.yellow}[A]ccept / [E]dit / [C]ancel?${colors.reset} `
        );

        const choice = answer.trim().toLowerCase();

        if (choice === 'a' || choice === 'accept') {
            return { approved: true, message };
        } else if (choice === 'e' || choice === 'edit') {
            // Close readline to give full control to neovim
            rl.pause();

            // Open neovim for editing
            const editedMessage = editInNeovim(message);

            // Resume readline
            rl.resume();

            // Show the edited message and ask for approval again
            return getUserApproval(editedMessage, rl);
        } else if (choice === 'c' || choice === 'cancel') {
            return { approved: false, message: null };
        } else {
            console.log(`${colors.red}Invalid option. Please enter A, E, or C.${colors.reset}`);
        }
    }
}

/**
 * Create the commit with the approved message
 */
function createCommit(message) {
    console.log(`\n${colors.cyan}📦 Creating commit...${colors.reset}`);

    try {
        // Use a temporary file for the commit message to handle multi-line messages
        execSync(`git commit -F -`, {
            input: message,
            encoding: 'utf-8',
            stdio: ['pipe', 'inherit', 'inherit']
        });

        console.log(`${colors.green}✅ Commit created successfully!${colors.reset}`);
        return true;
    } catch (error) {
        console.error(`${colors.red}❌ Failed to create commit${colors.reset}`);
        console.error(error.message);
        return false;
    }
}

/**
 * Ask if user wants to push to remote
 */
async function askToPush(rl) {
    const answer = await question(
        rl,
        `\n${colors.yellow}Push to remote? [y/N]${colors.reset} `
    );

    return answer.trim().toLowerCase() === 'y' || answer.trim().toLowerCase() === 'yes';
}

/**
 * Push to remote repository
 */
function pushToRemote() {
    console.log(`${colors.cyan}🚀 Pushing to remote...${colors.reset}`);

    try {
        // Get current branch
        const branch = git('rev-parse --abbrev-ref HEAD');

        execSync(`git push origin ${branch}`, {
            encoding: 'utf-8',
            stdio: 'inherit'
        });

        console.log(`${colors.green}✅ Pushed successfully!${colors.reset}`);
        return true;
    } catch (error) {
        console.error(`${colors.red}❌ Failed to push${colors.reset}`);
        console.error(error.message);
        return false;
    }
}

/**
 * Show help message
 */
function showHelp() {
    console.log(`
${colors.bright}Git Commit Automation Script${colors.reset}
${colors.dim}Generates commit messages using OpenRouter AI${colors.reset}

${colors.bright}Usage:${colors.reset}
  1. Stage your changes:
     ${colors.cyan}git add <files>${colors.reset}

  2. Run this script:
     ${colors.cyan}pnpm commit [options]${colors.reset}

  3. Review the AI-generated commit message

  4. Choose to accept, edit, or cancel

  5. Optionally push to remote

${colors.bright}Requirements:${colors.reset}
  - OpenRouter API key in .env file
  - Create ${colors.dim}src/utils/.env${colors.reset} with:
    ${colors.dim}OPENROUTER_API_KEY=your_api_key_here${colors.reset}
  - Get your key from: ${colors.dim}https://openrouter.ai/keys${colors.reset}

${colors.bright}Options:${colors.reset}
  --help, -h       Show this help message
  --accept, -a     Auto-accept the generated commit message without prompting
  --push, -p       Automatically push to remote after committing
  --no-push, -n    Skip the push prompt (commit only, don't push)

${colors.bright}Examples:${colors.reset}
  ${colors.cyan}pnpm commit${colors.reset}
    Interactive mode - review, accept/edit, optionally push

  ${colors.cyan}pnpm commit --accept${colors.reset}
    Auto-accept commit message, still prompt for push

  ${colors.cyan}pnpm commit --accept --no-push${colors.reset}
    Auto-accept and commit without pushing

  ${colors.cyan}pnpm commit --accept --push${colors.reset}
    Fully automated - accept and push without any prompts
`);
}

/**
 * Main function
 */
async function main() {
    // Check for help flag
    const args = process.argv.slice(2);
    if (args.includes('--help') || args.includes('-h')) {
        showHelp();
        process.exit(0);
    }

    // Check for flags
    const autoAccept = args.includes('--accept') || args.includes('-a');
    const autoPush = args.includes('--push') || args.includes('-p');
    const noPush = args.includes('--no-push') || args.includes('-n');

    // Load environment variables
    loadEnv();

    console.log(`${colors.bright}${colors.blue}🚀 Git Commit Automation${colors.reset}\n`);

    // Check if we're in a git repository
    if (!git('rev-parse --git-dir', true)) {
        console.error(`${colors.red}❌ Not a git repository${colors.reset}`);
        process.exit(1);
    }

    // Check for staged changes
    if (!checkStagedChanges()) {
        console.error(`${colors.red}❌ No staged changes found${colors.reset}`);
        console.log(`\n${colors.yellow}💡 Stage your changes first:${colors.reset}`);
        console.log(`   ${colors.dim}git add <files>${colors.reset}\n`);
        process.exit(1);
    }

    // Get git context
    const context = getGitContext();

    // Generate commit message using OpenRouter
    const generatedMessage = await generateCommitMessage(context);

    let approved = autoAccept;
    let message = generatedMessage;

    // Get user approval if not auto-accepting
    if (!autoAccept) {
        const rl = createReadlineInterface();
        const result = await getUserApproval(generatedMessage, rl);
        approved = result.approved;
        message = result.message;
        rl.close();

        if (!approved) {
            console.log(`\n${colors.yellow}⏭️  Commit cancelled${colors.reset}`);
            process.exit(0);
        }
    } else {
        console.log(`\n${colors.bright}${colors.green}📝 Generated commit message:${colors.reset}`);
        console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`);
        console.log(message);
        console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}\n`);
        console.log(`${colors.cyan}Auto-accepting with --accept flag${colors.reset}`);
    }

    // Create the commit
    const commitSuccess = createCommit(message);

    if (!commitSuccess) {
        process.exit(1);
    }

    // Handle push logic
    let shouldPush = false;

    if (noPush) {
        console.log(`${colors.cyan}Skipping push with --no-push flag${colors.reset}`);
    } else if (autoPush) {
        console.log(`${colors.cyan}Auto-pushing with --push flag${colors.reset}`);
        shouldPush = true;
    } else {
        const rl = createReadlineInterface();
        shouldPush = await askToPush(rl);
        rl.close();
    }

    if (shouldPush) {
        pushToRemote();
    }

    console.log(`\n${colors.green}✨ Done!${colors.reset}\n`);
}

// Run the script
main().catch((error) => {
    console.error(`${colors.red}❌ Unexpected error:${colors.reset}`, error);
    process.exit(1);
});
