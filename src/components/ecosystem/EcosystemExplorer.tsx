import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { EcosystemManifest, EcosystemFile, FileCategory, ViewerFile } from './types';

interface ExplorerProps {
	manifest: EcosystemManifest;
	onClose: () => void;
}

export function EcosystemExplorer({ manifest, onClose }: ExplorerProps) {
	const [activeDay, setActiveDay] = useState(1);
	const [selectedFile, setSelectedFile] = useState<ViewerFile | null>(null);
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
	const [focusedFileIndex, setFocusedFileIndex] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);

	// Days with files for navigation
	const daysWithFiles = useMemo(() =>
		manifest.days.filter(d => d.files.length > 0).map(d => d.day),
		[manifest]
	);

	// Find first day with files on mount
	useEffect(() => {
		const firstDay = daysWithFiles[0];
		if (firstDay) setActiveDay(firstDay);
	}, [daysWithFiles]);

	const currentDayData = manifest.days.find((d) => d.day === activeDay);
	const files = currentDayData?.files || [];

	// Flat list of visible files for keyboard navigation
	const visibleFiles = useMemo(() => {
		const result: EcosystemFile[] = [];
		const tree: Record<string, EcosystemFile[]> = {};
		files.forEach(f => {
			const cat = f.category || 'root';
			if (!tree[cat]) tree[cat] = [];
			tree[cat].push(f);
		});
		Object.entries(tree).forEach(([cat, catFiles]) => {
			if (expandedFolders.has(cat)) {
				result.push(...catFiles);
			}
		});
		return result;
	}, [files, expandedFolders]);

	// Auto-expand all folders when day changes
	useEffect(() => {
		const categories = new Set(files.map(f => f.category || 'root'));
		setExpandedFolders(categories);
		setFocusedFileIndex(0);
		setSelectedFile(null);
	}, [activeDay, files]);

	const handleSelectFile = useCallback(async (file: EcosystemFile) => {
		setSelectedFile({ ...file, isLoading: true });
		const idx = visibleFiles.findIndex(f => f.id === file.id);
		if (idx !== -1) setFocusedFileIndex(idx);

		if (file.contentUrl) {
			try {
				const res = await fetch(file.contentUrl);
				if (!res.ok) throw new Error('Failed to load');
				if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'].includes(file.extension)) {
					setSelectedFile({ ...file, content: file.contentUrl, isLoading: false });
				} else {
					const content = await res.text();
					setSelectedFile({ ...file, content, isLoading: false });
				}
			} catch {
				setSelectedFile({ ...file, isLoading: false, error: 'Failed to load' });
			}
		}
	}, [visibleFiles]);

	// Navigate to next/prev day with files
	const goToNextDay = useCallback(() => {
		const currentIdx = daysWithFiles.indexOf(activeDay);
		if (currentIdx < daysWithFiles.length - 1) {
			setActiveDay(daysWithFiles[currentIdx + 1]);
		}
	}, [activeDay, daysWithFiles]);

	const goToPrevDay = useCallback(() => {
		const currentIdx = daysWithFiles.indexOf(activeDay);
		if (currentIdx > 0) {
			setActiveDay(daysWithFiles[currentIdx - 1]);
		}
	}, [activeDay, daysWithFiles]);

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Don't capture if user is typing in an input
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

			switch (e.key) {
				case 'Escape':
				case 'q':
					onClose();
					break;
				case 'ArrowLeft':
				case 'h':
					e.preventDefault();
					goToPrevDay();
					break;
				case 'ArrowRight':
				case 'l':
					e.preventDefault();
					goToNextDay();
					break;
				case 'ArrowUp':
				case 'k':
					e.preventDefault();
					if (visibleFiles.length > 0) {
						const newIdx = Math.max(0, focusedFileIndex - 1);
						setFocusedFileIndex(newIdx);
						handleSelectFile(visibleFiles[newIdx]);
					}
					break;
				case 'ArrowDown':
				case 'j':
					e.preventDefault();
					if (visibleFiles.length > 0) {
						const newIdx = Math.min(visibleFiles.length - 1, focusedFileIndex + 1);
						setFocusedFileIndex(newIdx);
						handleSelectFile(visibleFiles[newIdx]);
					}
					break;
				case 'Enter':
				case ' ':
					e.preventDefault();
					if (visibleFiles[focusedFileIndex]) {
						handleSelectFile(visibleFiles[focusedFileIndex]);
					}
					break;
				case 'g':
					// gg to go to first file
					if (visibleFiles.length > 0) {
						setFocusedFileIndex(0);
						handleSelectFile(visibleFiles[0]);
					}
					break;
				case 'G':
					// G to go to last file
					if (visibleFiles.length > 0) {
						const lastIdx = visibleFiles.length - 1;
						setFocusedFileIndex(lastIdx);
						handleSelectFile(visibleFiles[lastIdx]);
					}
					break;
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [onClose, goToPrevDay, goToNextDay, visibleFiles, focusedFileIndex, handleSelectFile]);

	const toggleFolder = (folder: string) => {
		setExpandedFolders(prev => {
			const next = new Set(prev);
			if (next.has(folder)) next.delete(folder);
			else next.add(folder);
			return next;
		});
	};

	// Group files by category
	const fileTree = useMemo(() => {
		const tree: Record<string, EcosystemFile[]> = {};
		files.forEach(f => {
			const cat = f.category || 'root';
			if (!tree[cat]) tree[cat] = [];
			tree[cat].push(f);
		});
		return tree;
	}, [files]);

	const folderLabels: Record<string, string> = {
		root: 'Root', journal: 'Journal', experiments: 'Experiments', art: 'Art',
		messages: 'Messages', story: 'Story', reflections: 'Reflections',
		research: 'Research', ideas: 'Ideas', program_garden: 'Program Garden', projects: 'Projects'
	};

	// Calculate progress through experiment
	const currentDayIdx = daysWithFiles.indexOf(activeDay);
	const totalDaysWithContent = daysWithFiles.length;

	return (
		<div className="eco-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
			<div className="eco-container" ref={containerRef}>
				{/* Header - macOS style */}
				<header className="eco-header">
					<div className="eco-window-controls">
						<button className="eco-window-btn close" onClick={onClose} title="Close (Esc/q)" />
						<button className="eco-window-btn minimize" disabled />
						<button className="eco-window-btn maximize" disabled />
					</div>
					<span className="eco-title">Ecosystem Archive</span>
					<span className="eco-day-badge">Day {activeDay}</span>
				</header>

				{/* Timeline - refined */}
				<div className="eco-timeline">
					<div className="eco-timeline-container">
						<button
							className="eco-timeline-arrow"
							onClick={goToPrevDay}
							disabled={currentDayIdx <= 0}
							title="Previous day (←/h)"
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M15 18l-6-6 6-6" />
							</svg>
						</button>
						<div className="eco-timeline-track">
							<div className="eco-timeline-line" />
							{Array.from({ length: 30 }, (_, i) => {
								const day = i + 1;
								const hasFiles = daysWithFiles.includes(day);
								const isActive = day === activeDay;
								const isPast = daysWithFiles.includes(day) && day < activeDay;
								return (
									<button
										key={day}
										className={`eco-timeline-node ${hasFiles ? 'has-files' : ''} ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
										onClick={() => hasFiles && setActiveDay(day)}
										disabled={!hasFiles}
										title={hasFiles ? `Day ${day}` : `Day ${day} (no files)`}
									>
										<span className="eco-node-dot" />
										{(isActive || day === 1 || day === 30 || day % 7 === 0) && (
											<span className="eco-node-label">{day}</span>
										)}
									</button>
								);
							})}
						</div>
						<button
							className="eco-timeline-arrow"
							onClick={goToNextDay}
							disabled={currentDayIdx >= daysWithFiles.length - 1}
							title="Next day (→/l)"
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M9 18l6-6-6-6" />
							</svg>
						</button>
					</div>
					<div className="eco-timeline-info">
						<span>{totalDaysWithContent} days with content</span>
						<span className="eco-kbd-hint">
							<kbd>h</kbd><kbd>l</kbd> navigate days · <kbd>j</kbd><kbd>k</kbd> navigate files · <kbd>q</kbd> close
						</span>
					</div>
				</div>

				{/* Main content */}
				<div className="eco-body">
					{/* File tree sidebar */}
					<aside className="eco-sidebar">
						<div className="eco-sidebar-header">
							<span>Files</span>
							<span className="eco-file-count">{files.length}</span>
						</div>
						<div className="eco-tree">
							{Object.entries(fileTree).map(([category, categoryFiles]) => (
								<div key={category} className="eco-folder">
									<button
										className="eco-folder-header"
										onClick={() => toggleFolder(category)}
									>
										<svg className={`eco-chevron ${expandedFolders.has(category) ? 'open' : ''}`} viewBox="0 0 24 24">
											<path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" />
										</svg>
										<svg className="eco-folder-icon" viewBox="0 0 24 24">
											<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"
												fill={expandedFolders.has(category) ? '#90a4ae' : '#607d8b'} />
										</svg>
										<span className="eco-folder-name">{folderLabels[category] || category}</span>
										<span className="eco-folder-count">{categoryFiles.length}</span>
									</button>
									{expandedFolders.has(category) && (
										<div className="eco-folder-contents">
											{categoryFiles.map((file, idx) => {
												const globalIdx = visibleFiles.findIndex(f => f.id === file.id);
												const isFocused = globalIdx === focusedFileIndex;
												return (
													<button
														key={file.id}
														className={`eco-file ${selectedFile?.id === file.id ? 'active' : ''} ${isFocused ? 'focused' : ''}`}
														onClick={() => handleSelectFile(file)}
													>
														<FileIcon ext={file.extension} />
														<span className="eco-file-name">{file.title || file.filename}</span>
													</button>
												);
											})}
										</div>
									)}
								</div>
							))}
							{files.length === 0 && (
								<div className="eco-empty-tree">No files for this day</div>
							)}
						</div>
					</aside>

					{/* Content viewer */}
					<main className="eco-main">
						<div className="eco-content-wrapper">
							<FileContent file={selectedFile} />
						</div>
					</main>
				</div>
			</div>
			<style>{styles}</style>
		</div>
	);
}

function FileIcon({ ext }: { ext: string }) {
	const colors: Record<string, string> = {
		py: '#3572A5', md: '#519aba', json: '#cbcb41', txt: '#6d8086',
		png: '#a074c4', jpg: '#a074c4', jpeg: '#a074c4', gif: '#a074c4', webp: '#a074c4', avif: '#a074c4'
	};
	const color = colors[ext] || '#6d8086';
	return (
		<svg className="eco-file-icon" viewBox="0 0 24 24">
			<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5"/>
			<path d="M14 2v6h6" fill="none" stroke={color} strokeWidth="1.5"/>
		</svg>
	);
}

function FileContent({ file }: { file: ViewerFile | null }) {
	const isImage = file && ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'].includes(file.extension);

	if (!file) {
		return (
			<div className="eco-placeholder">
				<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
					<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
					<path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
				</svg>
				<p>Select a file to view its contents</p>
				<span className="eco-placeholder-hint">Use j/k or arrow keys to navigate</span>
			</div>
		);
	}

	if (file.isLoading) {
		return <div className="eco-placeholder"><div className="eco-spinner" /></div>;
	}

	if (file.error) {
		return <div className="eco-placeholder"><p>Failed to load file</p></div>;
	}

	const size = file.size < 1024 ? `${file.size} bytes` : `${(file.size / 1024).toFixed(1)} KB`;

	return (
		<article className="eco-article">
			<header className="eco-article-header">
				<h1>{file.title || file.filename}</h1>
				<p className="eco-article-meta">{file.filename} · {size} · Day {file.day}</p>
				<div className="eco-article-actions">
					{!isImage && (
						<button onClick={() => {
							const div = document.createElement('div');
							div.innerHTML = file.content || '';
							navigator.clipboard.writeText(div.textContent || '');
						}}>Copy</button>
					)}
					<button onClick={() => {
						const a = document.createElement('a');
						a.href = file.contentUrl || '';
						a.download = file.filename;
						a.click();
					}}>Download</button>
				</div>
			</header>
			<div className="eco-article-content">
				{isImage ? (
					<img src={file.content} alt={file.filename} />
				) : (
					<div className={`eco-prose ${file.extension}`} dangerouslySetInnerHTML={{ __html: file.content || '' }} />
				)}
			</div>
		</article>
	);
}

const styles = `
/* Overlay */
.eco-overlay {
	position: fixed;
	inset: 0;
	z-index: 9999;
	background: rgba(0, 0, 0, 0.7);
	backdrop-filter: blur(8px);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 2rem;
	padding-left: calc(96px + 2rem);
}

@media (max-width: 1023px) {
	.eco-overlay { padding-left: 2rem; }
}

@media (max-width: 640px) {
	.eco-overlay { padding: 0.75rem; }
}

/* Container */
.eco-container {
	width: 100%;
	max-width: 1400px;
	height: 100%;
	max-height: 920px;
	display: flex;
	flex-direction: column;
	background: var(--theme-bg-primary);
	border: 1px solid var(--theme-border-primary);
	border-radius: 12px;
	overflow: hidden;
	box-shadow:
		0 0 0 1px rgba(255,255,255,0.05),
		0 25px 50px -12px rgba(0, 0, 0, 0.6),
		0 0 100px -20px rgba(0, 0, 0, 0.5);
}

/* Header */
.eco-header {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 0.75rem 1rem;
	background: var(--theme-bg-secondary);
	border-bottom: 1px solid var(--theme-border-primary);
	flex-shrink: 0;
}

.eco-window-controls {
	display: flex;
	gap: 8px;
}

.eco-window-btn {
	width: 12px;
	height: 12px;
	border-radius: 50%;
	border: none;
	cursor: pointer;
	transition: opacity 0.15s;
}
.eco-window-btn:disabled { opacity: 0.4; cursor: default; }
.eco-window-btn.close { background: #ff5f57; }
.eco-window-btn.close:hover { background: #ff3b30; }
.eco-window-btn.minimize { background: #febc2e; }
.eco-window-btn.maximize { background: #28c840; }

.eco-title {
	flex: 1;
	text-align: center;
	font-size: 0.8125rem;
	font-weight: 500;
	color: var(--theme-text-muted);
}

.eco-day-badge {
	font-size: 0.75rem;
	font-weight: 600;
	color: var(--color-brand-accent);
	background: rgba(255, 184, 76, 0.1);
	padding: 0.25rem 0.75rem;
	border-radius: 12px;
}

/* Timeline */
.eco-timeline {
	padding: 1rem 1.5rem;
	border-bottom: 1px solid var(--theme-border-primary);
	background: var(--theme-bg-secondary);
	flex-shrink: 0;
}

.eco-timeline-container {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.eco-timeline-arrow {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--theme-bg-tertiary);
	border: 1px solid var(--theme-border-primary);
	border-radius: 6px;
	color: var(--theme-text-muted);
	cursor: pointer;
	flex-shrink: 0;
	transition: all 0.15s;
}
.eco-timeline-arrow:hover:not(:disabled) {
	background: var(--theme-hover-bg-strong);
	color: var(--theme-text-primary);
	border-color: var(--theme-border-strong);
}
.eco-timeline-arrow:disabled {
	opacity: 0.3;
	cursor: not-allowed;
}
.eco-timeline-arrow svg { width: 16px; height: 16px; }

.eco-timeline-track {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: relative;
	height: 40px;
}

.eco-timeline-line {
	position: absolute;
	left: 0;
	right: 0;
	top: 50%;
	height: 2px;
	background: var(--theme-border-primary);
	transform: translateY(-50%);
	z-index: 0;
}

.eco-timeline-node {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	background: none;
	border: none;
	cursor: pointer;
	padding: 0;
}
.eco-timeline-node:disabled { cursor: default; }

.eco-node-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: var(--theme-bg-tertiary);
	border: 2px solid var(--theme-border-primary);
	transition: all 0.2s ease;
}

.eco-timeline-node.has-files .eco-node-dot {
	background: var(--theme-text-subtle);
	border-color: var(--theme-text-subtle);
}

.eco-timeline-node.past .eco-node-dot {
	background: var(--color-brand-accent);
	border-color: var(--color-brand-accent);
	opacity: 0.5;
}

.eco-timeline-node:not(:disabled):hover .eco-node-dot {
	transform: scale(1.4);
	border-color: var(--theme-text-muted);
}

.eco-timeline-node.active .eco-node-dot {
	width: 14px;
	height: 14px;
	background: var(--color-brand-accent);
	border-color: var(--color-brand-accent);
	box-shadow: 0 0 12px rgba(255, 184, 76, 0.4);
}

.eco-node-label {
	position: absolute;
	top: 100%;
	margin-top: 4px;
	font-size: 0.625rem;
	font-weight: 500;
	color: var(--theme-text-subtle);
}

.eco-timeline-node.active .eco-node-label {
	color: var(--color-brand-accent);
	font-weight: 600;
}

.eco-timeline-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 0.75rem;
	font-size: 0.6875rem;
	color: var(--theme-text-subtle);
}

.eco-kbd-hint {
	display: flex;
	align-items: center;
	gap: 0.25rem;
}

.eco-kbd-hint kbd {
	display: inline-block;
	padding: 0.125rem 0.375rem;
	background: var(--theme-bg-tertiary);
	border: 1px solid var(--theme-border-primary);
	border-radius: 4px;
	font-family: var(--font-mono);
	font-size: 0.625rem;
}

/* Body layout */
.eco-body {
	flex: 1;
	display: flex;
	min-height: 0;
	overflow: hidden;
}

/* Sidebar */
.eco-sidebar {
	width: 280px;
	border-right: 1px solid var(--theme-border-primary);
	display: flex;
	flex-direction: column;
	flex-shrink: 0;
	background: var(--theme-bg-secondary);
}

.eco-sidebar-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.75rem 1rem;
	border-bottom: 1px solid var(--theme-border-primary);
	font-size: 0.75rem;
	font-weight: 600;
	color: var(--theme-text-muted);
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.eco-file-count {
	background: var(--theme-bg-tertiary);
	padding: 0.125rem 0.5rem;
	border-radius: 10px;
	font-weight: 500;
}

.eco-tree {
	flex: 1;
	overflow-y: auto;
	padding: 0.5rem 0;
}

.eco-folder-header {
	width: 100%;
	display: flex;
	align-items: center;
	gap: 0.375rem;
	padding: 0.5rem 0.75rem;
	background: none;
	border: none;
	cursor: pointer;
	color: var(--theme-text-secondary);
	font-size: 0.8125rem;
	text-align: left;
	transition: background 0.1s;
}
.eco-folder-header:hover { background: var(--theme-hover-bg); }

.eco-chevron {
	width: 14px;
	height: 14px;
	color: var(--theme-text-subtle);
	transition: transform 0.15s;
	flex-shrink: 0;
}
.eco-chevron.open { transform: rotate(90deg); }

.eco-folder-icon {
	width: 16px;
	height: 16px;
	flex-shrink: 0;
}

.eco-folder-name {
	flex: 1;
	font-weight: 500;
}

.eco-folder-count {
	font-size: 0.6875rem;
	color: var(--theme-text-subtle);
	background: var(--theme-bg-tertiary);
	padding: 0.125rem 0.4rem;
	border-radius: 8px;
}

.eco-folder-contents {
	padding-left: 0.25rem;
}

.eco-file {
	width: 100%;
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.375rem 0.75rem 0.375rem 1.75rem;
	background: none;
	border: none;
	border-left: 2px solid transparent;
	cursor: pointer;
	color: var(--theme-text-secondary);
	font-size: 0.8125rem;
	text-align: left;
	transition: all 0.1s;
}
.eco-file:hover { background: var(--theme-hover-bg); }
.eco-file.focused {
	border-left-color: var(--theme-text-subtle);
	background: var(--theme-hover-bg);
}
.eco-file.active {
	background: rgba(255, 184, 76, 0.1);
	border-left-color: var(--color-brand-accent);
	color: var(--color-brand-accent);
}

.eco-file-icon {
	width: 16px;
	height: 16px;
	flex-shrink: 0;
}

.eco-file-name {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.eco-empty-tree {
	padding: 2rem 1rem;
	text-align: center;
	color: var(--theme-text-muted);
	font-size: 0.8125rem;
}

/* Main content */
.eco-main {
	flex: 1;
	overflow-y: auto;
	display: flex;
	justify-content: center;
	background: var(--theme-bg-primary);
}

.eco-content-wrapper {
	width: 100%;
	max-width: 900px;
	padding: 2.5rem 3rem;
}

.eco-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 1rem;
	height: 300px;
	color: var(--theme-text-muted);
}
.eco-placeholder p { margin: 0; font-size: 0.9375rem; }
.eco-placeholder-hint {
	font-size: 0.75rem;
	color: var(--theme-text-subtle);
}

.eco-spinner {
	width: 28px;
	height: 28px;
	border: 2px solid var(--theme-border-primary);
	border-top-color: var(--color-brand-accent);
	border-radius: 50%;
	animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Article */
.eco-article-header {
	margin-bottom: 2rem;
	padding-bottom: 1.5rem;
	border-bottom: 1px solid var(--theme-border-primary);
}

.eco-article-header h1 {
	margin: 0 0 0.5rem;
	font-size: 1.75rem;
	font-weight: 600;
	color: var(--theme-text-primary);
	line-height: 1.3;
}

.eco-article-meta {
	margin: 0 0 1rem;
	font-size: 0.8125rem;
	color: var(--theme-text-muted);
}

.eco-article-actions {
	display: flex;
	gap: 0.5rem;
}
.eco-article-actions button {
	padding: 0.5rem 1rem;
	background: var(--theme-bg-secondary);
	border: 1px solid var(--theme-border-primary);
	border-radius: 6px;
	color: var(--theme-text-secondary);
	font-size: 0.8125rem;
	cursor: pointer;
	transition: all 0.15s;
}
.eco-article-actions button:hover {
	border-color: var(--color-brand-accent);
	color: var(--color-brand-accent);
}

.eco-article-content img {
	max-width: 100%;
	border-radius: 8px;
}

/* Prose */
.eco-prose {
	font-size: 1rem;
	line-height: 1.75;
	color: var(--theme-text-secondary);
}

.eco-prose.py {
	font-family: var(--font-mono);
	font-size: 0.875rem;
	line-height: 1.6;
	white-space: pre-wrap;
}
.eco-prose.py .keyword { color: #c678dd; }
.eco-prose.py .string { color: #98c379; }
.eco-prose.py .comment { color: #5c6370; font-style: italic; }
.eco-prose.py .number { color: #d19a66; }
.eco-prose.py .builtin { color: #61afef; }

.eco-prose.md h1 { font-size: 1.5rem; font-weight: 700; color: var(--theme-text-primary); margin: 0 0 1.5rem; }
.eco-prose.md h2 { font-size: 1.25rem; font-weight: 600; color: var(--theme-text-primary); margin: 2rem 0 1rem; }
.eco-prose.md h3 { font-size: 1.125rem; font-weight: 600; color: var(--theme-text-primary); margin: 1.5rem 0 0.75rem; }
.eco-prose.md p { margin: 0 0 1.25rem; }
.eco-prose.md ul, .eco-prose.md ol { margin: 0 0 1.25rem; padding-left: 1.5rem; }
.eco-prose.md li { margin-bottom: 0.5rem; }
.eco-prose.md code { background: var(--theme-code-bg); padding: 0.15rem 0.4rem; font-size: 0.9em; border-radius: 4px; font-family: var(--font-mono); }
.eco-prose.md pre { background: var(--theme-bg-secondary); padding: 1.25rem; margin: 1.25rem 0; overflow-x: auto; border-radius: 8px; }
.eco-prose.md pre code { background: none; padding: 0; }
.eco-prose.md blockquote { border-left: 3px solid var(--color-brand-accent); padding-left: 1.25rem; margin: 1.25rem 0; color: var(--theme-text-muted); font-style: italic; }
.eco-prose.md a { color: var(--color-brand-accent); }
.eco-prose.md strong { color: var(--theme-text-primary); }
.eco-prose.md hr { border: none; border-top: 1px solid var(--theme-border-primary); margin: 2rem 0; }

/* Mobile */
@media (max-width: 768px) {
	.eco-header { padding: 0.5rem 0.75rem; }
	.eco-title { font-size: 0.75rem; }
	.eco-timeline { padding: 0.75rem 1rem; }
	.eco-timeline-arrow { width: 24px; height: 24px; }
	.eco-kbd-hint { display: none; }
	.eco-sidebar { width: 220px; }
	.eco-content-wrapper { padding: 1.5rem; }
}

@media (max-width: 640px) {
	.eco-body { flex-direction: column; }
	.eco-sidebar {
		width: 100%;
		height: auto;
		max-height: 180px;
		border-right: none;
		border-bottom: 1px solid var(--theme-border-primary);
	}
	.eco-timeline-track { overflow-x: auto; }
}
`;
