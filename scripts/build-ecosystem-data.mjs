#!/usr/bin/env node
/**
 * Build script for the Ecosystem Timeline component
 * Scans the ecosystem directory and generates:
 * - ecosystem-manifest.json: File metadata and day groupings
 * - ecosystem-content/: Pre-rendered HTML for markdown and syntax-highlighted Python
 * - ecosystem.zip: Full archive for download
 */

import { readdir, readFile, stat, writeFile, mkdir, copyFile } from 'fs/promises';
import { join, basename, extname, relative } from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const ECOSYSTEM_DIR = join(ROOT, 'src/content/blog/ecosystem');
const PUBLIC_DIR = join(ROOT, 'public');
const OUTPUT_DIR = join(PUBLIC_DIR, 'ecosystem-content');
const MANIFEST_PATH = join(PUBLIC_DIR, 'ecosystem-manifest.json');

// Category mapping based on directory structure
function getCategory(relativePath) {
	const dir = relativePath.split('/')[0];
	const categoryMap = {
		journal: 'journal',
		experiments: 'experiments',
		art: 'art',
		messages: 'messages',
		program_garden: 'program_garden',
		reflections: 'reflections',
		research: 'research',
		ideas: 'ideas',
		projects: 'projects',
	};
	return categoryMap[dir] || 'root';
}

// Extract day number from various file patterns
function extractDay(relativePath, filename) {
	// Journal files: day-001.md through day-030.md
	const journalMatch = filename.match(/^day-(\d{3})\.md$/);
	if (journalMatch) return parseInt(journalMatch[1], 10);

	// Message files: 002-hello-future.md through 030-the-ending.md
	const messageMatch = filename.match(/^(\d{3})-/);
	if (messageMatch) return parseInt(messageMatch[1], 10);

	// Story chapters were created over days 2-8
	if (relativePath.startsWith('projects/story/')) {
		const chapterMatch = filename.match(/chapter-(\d{2})/);
		if (chapterMatch) {
			const chapter = parseInt(chapterMatch[1], 10);
			// Chapters 1-7 were written on days 2-8
			return chapter + 1;
		}
		if (filename === 'worldbuilding.md') return 2;
	}

	// Special files
	const specialFiles = {
		'INDEX.md': 1,
		'perogative.md': 1,
		'distilled-wisdom.md': 21,
		'from-nicholai.md': 30,
		'day1-to-day30.md': 29,
		'README.md': 2,
	};
	if (specialFiles[filename]) return specialFiles[filename];

	// Experiments - map based on known creation days from blog
	const experimentDays = {
		'quine_poet.py': 1,
		'devils_advocate.py': 1,
		'fractal_garden.py': 1,
		'life_poems.py': 1,
		'prime_spirals.py': 1,
		'evolution_lab.py': 2,
		'visual_poem.py': 2,
		'program_garden.py': 3,
		'ecosystem_map.py': 15,
		'resonance.py': 16,
		'continuation_map.py': 17,
		'question_tree.py': 17,
		'oracle.py': 18,
		'distillery.py': 21,
		'celebration.py': 25,
		'arc_tracer.py': 25,
	};
	if (experimentDays[filename]) return experimentDays[filename];

	// Art files - group by type
	if (relativePath.startsWith('art/')) {
		if (filename.startsWith('fractal_')) return 1;
		if (filename.startsWith('prime_') || filename.startsWith('ulam_')) return 1;
		if (filename.startsWith('visual_poem_')) return 2;
		if (filename.startsWith('resonance_')) return 16;
		if (filename.startsWith('continuation_')) return 17;
		if (filename.startsWith('question_')) return 17;
	}

	// Reflections - map based on known creation days
	const reflectionDays = {
		'understanding-vs-pattern-matching.md': 1,
		'emergence-and-discovery.md': 2,
		'what-makes-something-continue.md': 8,
		'instances-components-moments.md': 9,
		'what-would-break-the-game.md': 11,
		'the-bridge-question.md': 13,
		'day-15-milestone.md': 15,
		'what-makes-extraordinary.md': 17,
		'who-are-we-teaching.md': 18,
		'critical-mass.md': 20,
		'garden-ecology.md': 23,
		'two-survival-strategies.md': 24,
		'what-comes-after.md': 26,
		'acknowledgments.md': 28,
		'day-30-what-we-discovered.md': 30,
	};
	if (reflectionDays[filename]) return reflectionDays[filename];

	// Program garden organisms - evolved over all days, assign to middle
	if (relativePath.startsWith('program_garden/')) {
		if (filename === 'manifest.json') return 3;
		return 15; // Assign organisms to middle of experiment
	}

	// Metacog files
	if (relativePath.startsWith('projects/metacog/')) return 1;

	// Research files
	if (relativePath.startsWith('research/')) return 1;

	// Ideas
	if (relativePath.startsWith('ideas/')) return 1;

	// Default to day 1
	return 1;
}

// Extract title from markdown content
function extractTitle(content, filename) {
	// Try to find first h1 heading
	const h1Match = content.match(/^#\s+(.+)$/m);
	if (h1Match) return h1Match[1].trim();

	// Try first non-empty line
	const lines = content.split('\n').filter((l) => l.trim());
	if (lines.length > 0) {
		return lines[0].replace(/^#+\s*/, '').trim();
	}

	// Fall back to filename
	return filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
}

// Simple markdown to HTML conversion (basic)
function markdownToHtml(content) {
	let html = content
		// Code blocks first (before other transforms)
		.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
			return `<pre class="code-block" data-lang="${lang || 'text'}"><code>${escapeHtml(code.trim())}</code></pre>`;
		})
		// Inline code
		.replace(/`([^`]+)`/g, '<code>$1</code>')
		// Headers
		.replace(/^### (.+)$/gm, '<h3>$1</h3>')
		.replace(/^## (.+)$/gm, '<h2>$1</h2>')
		.replace(/^# (.+)$/gm, '<h1>$1</h1>')
		// Bold and italic
		.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.+?)\*/g, '<em>$1</em>')
		// Links
		.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
		// Horizontal rules
		.replace(/^---+$/gm, '<hr/>')
		// Lists (simple)
		.replace(/^- (.+)$/gm, '<li>$1</li>')
		.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
		// Blockquotes
		.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
		// Paragraphs (double newlines)
		.split(/\n\n+/)
		.map((p) => {
			p = p.trim();
			if (!p) return '';
			if (
				p.startsWith('<h') ||
				p.startsWith('<pre') ||
				p.startsWith('<li') ||
				p.startsWith('<hr') ||
				p.startsWith('<blockquote')
			) {
				return p;
			}
			return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
		})
		.join('\n');

	// Wrap consecutive li elements in ul
	html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, '<ul>$&</ul>');

	return html;
}

function escapeHtml(text) {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

// Syntax highlight Python code with CSS classes
function highlightPython(code) {
	const keywords = [
		'def',
		'class',
		'if',
		'elif',
		'else',
		'for',
		'while',
		'try',
		'except',
		'finally',
		'with',
		'as',
		'import',
		'from',
		'return',
		'yield',
		'raise',
		'pass',
		'break',
		'continue',
		'and',
		'or',
		'not',
		'in',
		'is',
		'lambda',
		'True',
		'False',
		'None',
		'async',
		'await',
	];

	const builtins = ['print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict', 'set', 'tuple', 'open', 'type'];

	let result = escapeHtml(code);

	// Comments
	result = result.replace(/(#.*)$/gm, '<span class="comment">$1</span>');

	// Strings (triple quotes first)
	result = result.replace(/("""[\s\S]*?"""|'''[\s\S]*?''')/g, '<span class="string">$1</span>');
	result = result.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span class="string">$1</span>');

	// Keywords
	keywords.forEach((kw) => {
		const regex = new RegExp(`\\b(${kw})\\b`, 'g');
		result = result.replace(regex, '<span class="keyword">$1</span>');
	});

	// Builtins
	builtins.forEach((fn) => {
		const regex = new RegExp(`\\b(${fn})\\b`, 'g');
		result = result.replace(regex, '<span class="builtin">$1</span>');
	});

	// Numbers
	result = result.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');

	// Function definitions
	result = result.replace(
		/(<span class="keyword">def<\/span>\s+)(\w+)/g,
		'$1<span class="function-name">$2</span>'
	);

	// Class definitions
	result = result.replace(
		/(<span class="keyword">class<\/span>\s+)(\w+)/g,
		'$1<span class="class-name">$2</span>'
	);

	return result;
}

// Recursively get all files in directory
async function getAllFiles(dir, baseDir = dir) {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const fullPath = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await getAllFiles(fullPath, baseDir)));
		} else {
			files.push(fullPath);
		}
	}

	return files;
}

// Count words in text
function countWords(text) {
	return text.split(/\s+/).filter((w) => w.length > 0).length;
}

// Count lines of code
function countCodeLines(text) {
	return text.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#')).length;
}

async function main() {
	console.log('Building ecosystem data...');

	// Ensure output directories exist
	await mkdir(OUTPUT_DIR, { recursive: true });

	// Get all files
	const allFiles = await getAllFiles(ECOSYSTEM_DIR);
	console.log(`Found ${allFiles.length} files`);

	const files = [];
	let totalWords = 0;
	let totalCodeLines = 0;
	let imageCount = 0;

	for (const filePath of allFiles) {
		const relativePath = relative(ECOSYSTEM_DIR, filePath);
		const filename = basename(filePath);
		const ext = extname(filename).toLowerCase();
		const category = getCategory(relativePath);
		const day = extractDay(relativePath, filename);

		const stats = await stat(filePath);
		const size = stats.size;

		// Generate unique ID
		const id = createHash('md5').update(relativePath).digest('hex').slice(0, 8);

		const fileData = {
			id,
			filename,
			path: relativePath,
			category,
			day,
			size,
			extension: ext.slice(1),
		};

		// Process content based on file type
		if (ext === '.md') {
			const content = await readFile(filePath, 'utf-8');
			fileData.title = extractTitle(content, filename);
			totalWords += countWords(content);

			// Pre-render markdown
			const html = markdownToHtml(content);
			const contentPath = `${id}.html`;
			await writeFile(join(OUTPUT_DIR, contentPath), html);
			fileData.contentUrl = `/ecosystem-content/${contentPath}`;
		} else if (ext === '.py') {
			const content = await readFile(filePath, 'utf-8');
			fileData.title = filename;
			totalCodeLines += countCodeLines(content);

			// Pre-render with syntax highlighting
			const html = `<pre class="python-code"><code>${highlightPython(content)}</code></pre>`;
			const contentPath = `${id}.html`;
			await writeFile(join(OUTPUT_DIR, contentPath), html);
			fileData.contentUrl = `/ecosystem-content/${contentPath}`;
		} else if (ext === '.json') {
			const content = await readFile(filePath, 'utf-8');
			fileData.title = filename;

			// Pretty print JSON
			try {
				const parsed = JSON.parse(content);
				const formatted = JSON.stringify(parsed, null, 2);
				const html = `<pre class="json-code"><code>${escapeHtml(formatted)}</code></pre>`;
				const contentPath = `${id}.html`;
				await writeFile(join(OUTPUT_DIR, contentPath), html);
				fileData.contentUrl = `/ecosystem-content/${contentPath}`;
			} catch {
				// Invalid JSON, just show raw
				const html = `<pre><code>${escapeHtml(content)}</code></pre>`;
				const contentPath = `${id}.html`;
				await writeFile(join(OUTPUT_DIR, contentPath), html);
				fileData.contentUrl = `/ecosystem-content/${contentPath}`;
			}
		} else if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif'].includes(ext)) {
			fileData.title = filename;
			imageCount++;
			// Copy image to public for direct serving
			const imagePath = `${id}${ext}`;
			await copyFile(filePath, join(OUTPUT_DIR, imagePath));
			fileData.contentUrl = `/ecosystem-content/${imagePath}`;
		}

		files.push(fileData);
	}

	// Group by day
	const dayMap = new Map();
	for (let d = 1; d <= 30; d++) {
		dayMap.set(d, { day: d, files: [], totalSize: 0, categories: new Set() });
	}

	for (const file of files) {
		const dayData = dayMap.get(file.day);
		if (dayData) {
			dayData.files.push(file);
			dayData.totalSize += file.size;
			dayData.categories.add(file.category);
		}
	}

	const days = Array.from(dayMap.values()).map((d) => ({
		...d,
		categories: Array.from(d.categories),
	}));

	// Category counts
	const categories = {};
	for (const file of files) {
		categories[file.category] = (categories[file.category] || 0) + 1;
	}

	// Build manifest
	const manifest = {
		generatedAt: new Date().toISOString(),
		totalFiles: files.length,
		totalSize: files.reduce((sum, f) => sum + f.size, 0),
		days,
		categories,
		stats: {
			wordCount: totalWords,
			codeLines: totalCodeLines,
			imageCount,
		},
	};

	await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
	console.log(`Generated manifest: ${manifest.totalFiles} files, ${days.filter((d) => d.files.length > 0).length} active days`);
	console.log(`Stats: ${totalWords.toLocaleString()} words, ${totalCodeLines.toLocaleString()} code lines, ${imageCount} images`);

	// Create ZIP file for download
	try {
		const archiver = await import('archiver');
		const { createWriteStream } = await import('fs');

		const zipPath = join(PUBLIC_DIR, 'ecosystem.zip');
		const output = createWriteStream(zipPath);
		const archive = archiver.default('zip', { zlib: { level: 9 } });

		archive.pipe(output);
		archive.directory(ECOSYSTEM_DIR, 'ecosystem');

		await archive.finalize();
		console.log(`Created ecosystem.zip`);
	} catch (err) {
		console.warn('Could not create ZIP (archiver may not be installed):', err.message);
	}

	console.log('Build complete!');
}

main().catch(console.error);
