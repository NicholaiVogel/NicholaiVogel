import { useEffect, useState, useRef } from 'react';
import lunr from 'lunr';

interface SearchResult {
	id: string;
	title: string;
	description: string;
	category: string;
	tags: string[];
	url: string;
	pubDate: string;
}

interface IndexedResult extends SearchResult {
	score: number;
}

export default function SearchDialog() {
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<IndexedResult[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [searchData, setSearchData] = useState<SearchResult[]>([]);
	const [searchIndex, setSearchIndex] = useState<lunr.Index | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const inputRef = useRef<HTMLInputElement>(null);
	const resultsRef = useRef<HTMLDivElement>(null);

	// Load search data and build index
	useEffect(() => {
		fetch('/search.json')
			.then((res) => res.json())
			.then((data: SearchResult[]) => {
				setSearchData(data);

				// Build Lunr index
				const idx = lunr(function () {
					this.ref('id');
					this.field('title', { boost: 10 });
					this.field('description', { boost: 5 });
					this.field('content');
					this.field('category', { boost: 3 });
					this.field('tags', { boost: 3 });

					data.forEach((doc) => {
						this.add(doc);
					});
				});

				setSearchIndex(idx);
				setIsLoading(false);
			})
			.catch((err) => {
				console.error('Failed to load search data:', err);
				setIsLoading(false);
			});
	}, []);

	// Keyboard shortcut to open search
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				setIsOpen(true);
			}

			if (e.key === 'Escape' && isOpen) {
				closeSearch();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isOpen]);

	// Focus input when dialog opens
	useEffect(() => {
		if (isOpen) {
			inputRef.current?.focus();
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
	}, [isOpen]);

	// Real-time search
	useEffect(() => {
		if (!query.trim() || !searchIndex || !searchData) {
			setResults([]);
			setSelectedIndex(0);
			return;
		}

		try {
			// Add wildcards for partial matching
			const searchQuery = query
				.trim()
				.split(/\s+/)
				.map((term) => `${term}* ${term}~1`)
				.join(' ');

			const searchResults = searchIndex.search(searchQuery);
			const matchedResults = searchResults
				.map((result) => {
					const data = searchData.find((d) => d.id === result.ref);
					return data ? { ...data, score: result.score } : null;
				})
				.filter((r): r is IndexedResult => r !== null)
				.slice(0, 8);

			setResults(matchedResults);
			setSelectedIndex(0);
		} catch (err) {
			// Fallback to simple search if query syntax is invalid
			try {
				const searchResults = searchIndex.search(query);
				const matchedResults = searchResults
					.map((result) => {
						const data = searchData.find((d) => d.id === result.ref);
						return data ? { ...data, score: result.score } : null;
					})
					.filter((r): r is IndexedResult => r !== null)
					.slice(0, 8);

				setResults(matchedResults);
				setSelectedIndex(0);
			} catch {
				setResults([]);
			}
		}
	}, [query, searchIndex, searchData]);

	const closeSearch = () => {
		setIsOpen(false);
		setQuery('');
		setResults([]);
		setSelectedIndex(0);
	};

	// Keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setSelectedIndex((prev) => Math.max(prev - 1, 0));
		} else if (e.key === 'Enter' && results[selectedIndex]) {
			window.location.href = results[selectedIndex].url;
		}
	};

	// Scroll selected item into view
	useEffect(() => {
		if (resultsRef.current && results.length > 0) {
			const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
			selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
		}
	}, [selectedIndex, results]);

	if (!isOpen) {
		return (
			<button
				onClick={() => setIsOpen(true)}
				className="hidden md:flex items-center gap-3 px-4 py-2 border border-[var(--theme-border-primary)] bg-[var(--theme-hover-bg)] text-[var(--theme-text-muted)] hover:border-brand-accent hover:text-[var(--theme-text-primary)] transition-all duration-300 text-xs"
				aria-label="Open search"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.3-4.3" />
				</svg>
				<span className="font-mono text-[10px] uppercase tracking-wider">Search</span>
				<kbd className="px-2 py-1 bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-secondary)] font-mono text-[9px] text-[var(--theme-text-subtle)]">
					⌘K
				</kbd>
			</button>
		);
	}

	return (
		<div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
			{/* Backdrop with scan line effect */}
			<div
				className="absolute inset-0 bg-[var(--theme-bg-primary)]/95 backdrop-blur-md"
				onClick={closeSearch}
				style={{
					backgroundImage: 'linear-gradient(0deg, transparent 50%, rgba(221, 65, 50, 0.02) 50%)',
					backgroundSize: '100% 4px',
				}}
			/>

			{/* Search Dialog */}
			<div className="relative w-full max-w-3xl animate-on-scroll fade-in is-visible">
				<div className="bg-[var(--theme-bg-secondary)] border-2 border-[var(--theme-border-primary)] shadow-2xl">
					{/* Header Bar */}
					<div className="flex items-center justify-between px-6 py-4 border-b-2 border-[var(--theme-border-primary)] bg-[var(--theme-hover-bg)]">
						<div className="flex items-center gap-3">
							<div className="flex gap-1.5">
								<div className="w-2 h-2 bg-brand-accent animate-pulse" />
								<div className="w-2 h-2 bg-[var(--theme-border-strong)]" />
								<div className="w-2 h-2 bg-[var(--theme-border-strong)]" />
							</div>
							<span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-accent">
								/// SEARCH_QUERY
							</span>
						</div>
						<button
							onClick={closeSearch}
							className="text-[9px] font-mono uppercase tracking-wider px-3 py-1.5 border border-[var(--theme-border-primary)] text-[var(--theme-text-muted)] hover:border-brand-accent hover:text-brand-accent transition-all"
						>
							[ESC]
						</button>
					</div>

					{/* Search Input */}
					<div className="px-6 py-5 border-b border-[var(--theme-border-secondary)]">
						<div className="flex items-center gap-4">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="text-brand-accent flex-shrink-0"
							>
								<circle cx="11" cy="11" r="8" />
								<path d="m21 21-4.3-4.3" />
							</svg>
							<input
								ref={inputRef}
								type="text"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder="ENTER SEARCH QUERY..."
								className="flex-1 bg-transparent border-none outline-none text-[var(--theme-text-primary)] placeholder:text-[var(--theme-text-subtle)] font-mono text-base tracking-wide uppercase"
							/>
							{query && (
								<button
									onClick={() => {
										setQuery('');
										inputRef.current?.focus();
									}}
									className="text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 border border-[var(--theme-border-primary)] text-[var(--theme-text-muted)] hover:border-brand-accent hover:text-brand-accent transition-all"
								>
									[CLR]
								</button>
							)}
						</div>
					</div>

					{/* Results */}
					<div
						ref={resultsRef}
						className="max-h-[55vh] overflow-y-auto"
					>
						{isLoading ? (
							<div className="p-16 text-center">
								<div className="text-brand-accent font-mono text-sm uppercase tracking-widest mb-3 animate-pulse">
									/// INITIALIZING SEARCH PROTOCOL
								</div>
								<div className="flex justify-center gap-1">
									<div className="w-2 h-2 bg-brand-accent animate-pulse" style={{ animationDelay: '0ms' }} />
									<div className="w-2 h-2 bg-brand-accent animate-pulse" style={{ animationDelay: '150ms' }} />
									<div className="w-2 h-2 bg-brand-accent animate-pulse" style={{ animationDelay: '300ms' }} />
								</div>
							</div>
						) : results.length > 0 ? (
							<>
								{results.map((result, index) => (
									<a
										key={result.id}
										href={result.url}
										className={`block border-l-4 transition-all duration-200 ${
											index === selectedIndex
												? 'border-brand-accent bg-[var(--theme-hover-bg-strong)]'
												: 'border-transparent hover:border-[var(--theme-border-strong)] hover:bg-[var(--theme-hover-bg)]'
										}`}
										onMouseEnter={() => setSelectedIndex(index)}
									>
										<div className="px-6 py-5 border-b border-[var(--theme-border-secondary)]">
											<div className="flex items-start justify-between gap-4 mb-3">
												<h3 className="text-base font-bold text-[var(--theme-text-primary)] uppercase tracking-tight leading-tight">
													{result.title}
												</h3>
												{result.category && (
													<span className="px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-widest border border-brand-accent/50 text-brand-accent whitespace-nowrap">
														{result.category}
													</span>
												)}
											</div>
											<p className="text-sm text-[var(--theme-text-secondary)] line-clamp-2 mb-3 leading-relaxed">
												{result.description}
											</p>
											{result.tags && result.tags.length > 0 && (
												<div className="flex flex-wrap gap-2">
													{result.tags.slice(0, 4).map((tag) => (
														<span
															key={tag}
															className="text-[9px] font-mono text-[var(--theme-text-muted)] uppercase"
														>
															#{tag}
														</span>
													))}
												</div>
											)}
										</div>
									</a>
								))}
							</>
						) : query ? (
							<div className="p-16 text-center">
								<div className="text-[var(--theme-text-muted)] font-mono text-sm uppercase tracking-widest mb-3">
									/// NO RESULTS FOUND
								</div>
								<p className="text-[var(--theme-text-secondary)] text-sm font-mono">
									Query returned 0 matches. Try different keywords.
								</p>
							</div>
						) : (
							<div className="p-16 text-center">
								<div className="text-[var(--theme-text-muted)] font-mono text-sm uppercase tracking-widest mb-3">
									/// AWAITING INPUT
								</div>
								<p className="text-[var(--theme-text-secondary)] text-sm font-mono">
									Begin typing to search all blog content
								</p>
							</div>
						)}
					</div>

					{/* Footer */}
					{results.length > 0 && (
						<div className="px-6 py-4 bg-[var(--theme-hover-bg)] border-t-2 border-[var(--theme-border-primary)] flex items-center justify-between">
							<div className="flex items-center gap-6 text-[9px] font-mono text-[var(--theme-text-muted)] uppercase tracking-wider">
								<span className="flex items-center gap-2">
									<span className="text-brand-accent">↑↓</span> Navigate
								</span>
								<span className="flex items-center gap-2">
									<span className="text-brand-accent">↵</span> Select
								</span>
								<span className="flex items-center gap-2">
									<span className="text-brand-accent">ESC</span> Close
								</span>
							</div>
							<div className="px-3 py-1.5 bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-primary)]">
								<span className="text-[9px] font-mono font-bold text-brand-accent uppercase tracking-wider">
									{results.length} RESULT{results.length !== 1 ? 'S' : ''}
								</span>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
