import React, { useRef, useEffect, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion';
import { useHubertChat } from '../hooks/useHubertChat';

// Configure marked for safe rendering
marked.setOptions({
	breaks: true,
	gfm: true,
});

// Render markdown to sanitized HTML
function renderMarkdown(content: string): string {
	const rawHtml = marked.parse(content, { async: false }) as string;
	return DOMPurify.sanitize(rawHtml);
}

export default function HubertChat() {
	const {
		messages,
		input,
		isTyping,
		isInitializing,
		initError,
		setInput,
		sendMessage,
		retryInit,
		messagesEndRef,
	} = useHubertChat({ initTimeout: 8000, chatTimeout: 30000 });

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [inputHeight, setInputHeight] = useState(40);

	// Auto-resize textarea and track height for dynamic border radius
	const adjustTextareaHeight = () => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = 'auto';
			const newHeight = Math.min(textarea.scrollHeight, 200);
			textarea.style.height = `${newHeight}px`;
			setInputHeight(newHeight);
		}
	};

	useEffect(() => {
		adjustTextareaHeight();
	}, [input]);

	// Check if multiline for padding adjustments
	const isMultiline = inputHeight > 48;

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	// Initial/Loading state - centered branding with input
	if (isInitializing && !initError) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center px-4">
				{/* Branding */}
				<div className="flex items-center gap-3 mb-8">
					<span className="text-2xl font-semibold text-[var(--theme-text-primary)]">Hubert</span>
					<div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
				</div>
				<p className="text-sm text-[var(--theme-text-muted)]">Waking up...</p>
				<span className="sr-only" role="status" aria-live="polite">
					Loading Hubert chat interface
				</span>
			</div>
		);
	}

	// Error state
	if (initError) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center px-4">
				<span className="text-2xl font-semibold text-[var(--theme-text-primary)] mb-6">Hubert</span>
				<p className="text-sm text-[var(--theme-text-muted)] mb-4 text-center max-w-sm" role="alert">
					{initError}
				</p>
				<button
					onClick={retryInit}
					className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-sm text-[var(--theme-text-primary)] transition-colors"
					aria-label="Retry connecting to Hubert"
				>
					Try again
				</button>
			</div>
		);
	}

	// No messages yet - show centered input
	if (messages.length === 0) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center px-4">
				{/* Branding */}
				<span className="text-3xl font-semibold text-[var(--theme-text-primary)] mb-10">Hubert</span>

				{/* Input bar */}
				<div className="w-full max-w-2xl">
					<motion.div
						layout
						transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
						className={`relative bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-primary)] focus-within:border-[var(--theme-border-strong)] ${isMultiline ? 'p-4' : 'flex items-center px-6 py-3'}`}
						style={{ borderRadius: isMultiline ? 28 : 9999 }}
					>
						<textarea
							ref={textareaRef}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="What do you want to know?"
							aria-label="Type your message"
							rows={1}
							className={`bg-transparent text-[var(--theme-text-primary)] placeholder:text-[var(--theme-text-subtle)] text-base outline-none resize-none max-h-[200px] ${isMultiline ? 'w-full leading-relaxed px-2' : 'flex-1 leading-[40px]'}`}
						/>
						<motion.div layout={false} className={isMultiline ? 'flex justify-end mt-3' : 'ml-3 flex-shrink-0'}>
							<button
								onClick={sendMessage}
								disabled={isTyping || !input.trim()}
								aria-label="Send message"
								className="w-10 h-10 rounded-full bg-[var(--theme-text-primary)] hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
							>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--theme-bg-primary)]">
									<path d="M12 19V5M5 12l7-7 7 7"/>
								</svg>
							</button>
						</motion.div>
					</motion.div>
				</div>

				{/* Subtitle */}
				<p className="text-xs text-[var(--theme-text-subtle)] mt-6">
					A miserable AI assistant, here to interview you.
				</p>
			</div>
		);
	}

	// Chat mode - messages with input at bottom
	return (
		<div className="flex-1 flex flex-col min-h-0 overflow-hidden">
			{/* Messages area - scrollable */}
			<div
				className="flex-1 overflow-y-auto px-4 py-6 min-h-0"
				role="log"
				aria-live="polite"
				aria-label="Chat messages"
			>
				<div className="max-w-3xl mx-auto space-y-6">
					{messages.map((msg, index) => (
						<div
							key={msg.id}
							className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
						>
							{msg.role === 'user' ? (
								// User message - right aligned pill with markdown
								<div className="max-w-[80%] bg-[var(--theme-bg-secondary)] rounded-3xl px-5 py-3">
									<div
										className="user-message text-[var(--theme-text-primary)] text-[15px] leading-relaxed"
										dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
									/>
								</div>
							) : (
								// Assistant message - left aligned with subtle label and markdown
								<div className="max-w-[85%] space-y-1.5">
									{(index === 0 || messages[index - 1]?.role === 'user') && (
										<span className="text-[11px] font-medium uppercase tracking-wide text-brand-accent">
											Hubert
										</span>
									)}
									<div
										className="hubert-message text-[var(--theme-text-secondary)] text-[15px] leading-[1.7]"
										dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
									/>
								</div>
							)}
						</div>
					))}

					{/* Typing indicator */}
					{isTyping && (
						<div className="flex justify-start">
							<div className="space-y-1.5">
								<span className="text-[11px] font-medium uppercase tracking-wide text-brand-accent">
									Hubert
								</span>
								<div className="flex items-center gap-1.5">
									<div className="w-2 h-2 rounded-full bg-[var(--theme-text-muted)] animate-pulse" />
									<div className="w-2 h-2 rounded-full bg-[var(--theme-text-muted)] animate-pulse" style={{ animationDelay: '150ms' }} />
									<div className="w-2 h-2 rounded-full bg-[var(--theme-text-muted)] animate-pulse" style={{ animationDelay: '300ms' }} />
								</div>
							</div>
							<span className="sr-only" role="status">Hubert is typing</span>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>
			</div>

			{/* Input bar - pinned to bottom */}
			<div className="flex-shrink-0 px-4 pb-4 pt-2">
				<div className="max-w-3xl mx-auto">
					<motion.div
						layout
						transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
						className={`relative bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-primary)] focus-within:border-[var(--theme-border-strong)] ${isMultiline ? 'p-4' : 'flex items-center px-6 py-3'}`}
						style={{ borderRadius: isMultiline ? 28 : 9999 }}
					>
						<textarea
							ref={textareaRef}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="How can Hubert help?"
							aria-label="Type your message"
							rows={1}
							className={`bg-transparent text-[var(--theme-text-primary)] placeholder:text-[var(--theme-text-subtle)] text-base outline-none resize-none max-h-[200px] ${isMultiline ? 'w-full leading-relaxed px-2' : 'flex-1 leading-[40px]'}`}
						/>
						<motion.div layout={false} className={isMultiline ? 'flex justify-end mt-3' : 'ml-3 flex-shrink-0'}>
							<button
								onClick={sendMessage}
								disabled={isTyping || !input.trim()}
								aria-label="Send message"
								className="w-10 h-10 rounded-full bg-[var(--theme-text-primary)] hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
							>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--theme-bg-primary)]">
									<path d="M12 19V5M5 12l7-7 7 7"/>
								</svg>
							</button>
						</motion.div>
					</motion.div>
				</div>
			</div>

			{/* Styles for markdown content */}
			<style>{`
				.hubert-message p,
				.user-message p {
					margin-bottom: 0.75rem;
				}
				.hubert-message p:last-child,
				.user-message p:last-child {
					margin-bottom: 0;
				}
				.hubert-message strong,
				.user-message strong {
					font-weight: 600;
				}
				.hubert-message strong {
					color: var(--theme-text-primary);
				}
				.hubert-message em,
				.user-message em {
					font-style: italic;
				}
				.hubert-message code,
				.user-message code {
					background: var(--theme-bg-secondary);
					padding: 0.15rem 0.4rem;
					border-radius: 0.25rem;
					font-family: var(--font-mono);
					font-size: 0.875em;
				}
				.user-message code {
					background: rgba(255,255,255,0.1);
				}
				.hubert-message pre,
				.user-message pre {
					background: var(--theme-bg-secondary);
					padding: 1rem;
					border-radius: 0.5rem;
					overflow-x: auto;
					margin: 0.75rem 0;
				}
				.user-message pre {
					background: rgba(255,255,255,0.05);
				}
				.hubert-message pre code,
				.user-message pre code {
					background: none;
					padding: 0;
				}
				.hubert-message ul, .hubert-message ol,
				.user-message ul, .user-message ol {
					margin: 0.5rem 0;
					padding-left: 1.5rem;
				}
				.hubert-message li,
				.user-message li {
					margin-bottom: 0.25rem;
				}
				.hubert-message ul li,
				.user-message ul li {
					list-style-type: disc;
				}
				.hubert-message ol li,
				.user-message ol li {
					list-style-type: decimal;
				}
				.hubert-message blockquote,
				.user-message blockquote {
					border-left: 3px solid var(--color-brand-accent);
					padding-left: 1rem;
					margin: 0.75rem 0;
					font-style: italic;
				}
				.hubert-message blockquote {
					color: var(--theme-text-muted);
				}
				.hubert-message a,
				.user-message a {
					color: var(--color-brand-accent);
					text-decoration: underline;
				}
				.hubert-message a:hover,
				.user-message a:hover {
					color: var(--theme-text-primary);
				}
				.hubert-message h1, .hubert-message h2, .hubert-message h3,
				.user-message h1, .user-message h2, .user-message h3 {
					font-weight: 600;
					margin-top: 1rem;
					margin-bottom: 0.5rem;
				}
				.hubert-message h1, .hubert-message h2, .hubert-message h3 {
					color: var(--theme-text-primary);
				}
				.hubert-message h1, .user-message h1 { font-size: 1.25rem; }
				.hubert-message h2, .user-message h2 { font-size: 1.125rem; }
				.hubert-message h3, .user-message h3 { font-size: 1rem; }
			`}</style>
		</div>
	);
}
