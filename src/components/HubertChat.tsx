import React, { useState, useRef, useEffect } from 'react';

interface Message {
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: string;
}

// Utility: Fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 8000) => {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(url, {
			...options,
			signal: controller.signal,
		});
		clearTimeout(timeoutId);
		return response;
	} catch (error) {
		clearTimeout(timeoutId);
		throw error;
	}
};

export default function HubertChat() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');
	const [visitorId, setVisitorId] = useState<string | null>(null);
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [isTyping, setIsTyping] = useState(false);
	const [isInitializing, setIsInitializing] = useState(true);
	const [initError, setInitError] = useState<string | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Initialize visitor on mount
	useEffect(() => {
		const initVisitor = async () => {
			try {
				console.log('[Hubert] Starting initialization...');
				setIsInitializing(true);
				setInitError(null);

				console.log('[Hubert] Fetching /api/hubert/new-visitor...');
				const response = await fetchWithTimeout('/api/hubert/new-visitor', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' }
				}, 8000); // 8 second timeout

				console.log('[Hubert] Response status:', response.status);

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}

				const data = await response.json();
				console.log('[Hubert] Initialization successful:', data);

				setVisitorId(data.visitor_id);
				setConversationId(data.conversation_id);

				// Add system welcome message from Hubert
				setMessages([{
					role: 'system',
					content: `/// HUBERT_EUNUCH /// ONLINE\\n\\nI suppose you want something. State your business.`,
					timestamp: new Date().toISOString(),
				}]);
			} catch (error) {
				console.error('[Hubert] Initialization failed:', error);

				let errorMessage = '/// ERROR: UNKNOWN_FAILURE';

				if (error instanceof Error) {
					if (error.name === 'AbortError') {
						errorMessage = '/// ERROR: TIMEOUT - API_UNRESPONSIVE';
						console.error('[Hubert] Request timed out after 8 seconds');
					} else if (error.message.includes('Failed to fetch')) {
						errorMessage = '/// ERROR: NETWORK_FAILURE - CHECK_API_ROUTE';
						console.error('[Hubert] Network error - API route may not exist');
					} else {
						errorMessage = `/// ERROR: ${error.message}`;
					}
				}

				setInitError(errorMessage);
				setMessages([{
					role: 'system',
					content: errorMessage + '\\n\\nCLICK [RETRY] BELOW',
					timestamp: new Date().toISOString(),
				}]);
			} finally {
				console.log('[Hubert] Initialization complete, setting isInitializing to false');
				setIsInitializing(false);
			}
		};
		initVisitor();
	}, []);

	// Retry initialization
	const retryInit = () => {
		console.log('[Hubert] Retrying initialization...');
		setIsInitializing(true);
		setInitError(null);
		setMessages([]);

		// Re-trigger initialization
		const initVisitor = async () => {
			try {
				console.log('[Hubert] Starting initialization...');
				setIsInitializing(true);
				setInitError(null);

				console.log('[Hubert] Fetching /api/hubert/new-visitor...');
				const response = await fetchWithTimeout('/api/hubert/new-visitor', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' }
				}, 8000);

				console.log('[Hubert] Response status:', response.status);

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}

				const data = await response.json();
				console.log('[Hubert] Initialization successful:', data);

				setVisitorId(data.visitor_id);
				setConversationId(data.conversation_id);

				setMessages([{
					role: 'system',
					content: `/// HUBERT_EUNUCH /// ONLINE\\n\\nI suppose you want something. State your business.`,
					timestamp: new Date().toISOString(),
				}]);
			} catch (error) {
				console.error('[Hubert] Initialization failed:', error);

				let errorMessage = '/// ERROR: UNKNOWN_FAILURE';

				if (error instanceof Error) {
					if (error.name === 'AbortError') {
						errorMessage = '/// ERROR: TIMEOUT - API_UNRESPONSIVE';
						console.error('[Hubert] Request timed out after 8 seconds');
					} else if (error.message.includes('Failed to fetch')) {
						errorMessage = '/// ERROR: NETWORK_FAILURE - CHECK_API_ROUTE';
						console.error('[Hubert] Network error - API route may not exist');
					} else {
						errorMessage = `/// ERROR: ${error.message}`;
					}
				}

				setInitError(errorMessage);
				setMessages([{
					role: 'system',
					content: errorMessage + '\\n\\nCLICK [RETRY] BELOW',
					timestamp: new Date().toISOString(),
				}]);
			} finally {
				console.log('[Hubert] Initialization complete, setting isInitializing to false');
				setIsInitializing(false);
			}
		};
		initVisitor();
	};

	// Auto-scroll to bottom of chat container (not entire page)
	useEffect(() => {
		if (messagesEndRef.current) {
			const container = messagesEndRef.current.parentElement;
			if (container) {
				container.scrollTop = container.scrollHeight;
			}
		}
	}, [messages]);

	const sendMessage = async () => {
		console.log('[Hubert] sendMessage called', { input, isTyping, visitorId, conversationId });

		if (!input.trim() || isTyping || !visitorId || !conversationId) {
			console.log('[Hubert] sendMessage blocked:', {
				noInput: !input.trim(),
				isTyping,
				noVisitorId: !visitorId,
				noConversationId: !conversationId
			});
			return;
		}

		console.log('[Hubert] Sending message:', input);
		const userMessage: Message = {
			role: 'user',
			content: input,
			timestamp: new Date().toISOString(),
		};

		setMessages(prev => [...prev, userMessage]);
		setInput('');
		setIsTyping(true);

		try {
			console.log('[Hubert] Fetching /api/hubert/chat...');
			const response = await fetch('/api/hubert/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					messages: [...messages, userMessage].map(m => ({
						role: m.role,
						content: m.content,
					})),
					conversation_id: conversationId,
					visitor_id: visitorId,
				}),
			});

			console.log('[Hubert] Response status:', response.status);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			console.log('[Hubert] Response data:', data);

			if (data.error) {
				throw new Error(data.error);
			}

			const assistantMessage: Message = {
				role: 'assistant',
				content: data.messages[data.messages.length - 1]?.content || '...',
				timestamp: new Date().toISOString(),
			};

			console.log('[Hubert] Adding assistant message:', assistantMessage.content);
			setMessages(prev => [...prev, assistantMessage]);
		} catch (error) {
			console.error('[Hubert] Chat error:', error);
			setMessages(prev => [...prev, {
				role: 'assistant',
				content: '/// HUBERT_MALFUNCTION - TRY AGAIN',
				timestamp: new Date().toISOString(),
			}]);
		} finally {
			setIsTyping(false);
		}
	};

	// Show loading or error state
	if (isInitializing || initError) {
		return (
			<div className="bg-[var(--theme-bg-secondary)] border-2 border-[var(--theme-border-primary)] shadow-2xl">
				<div className="flex flex-col items-center justify-center py-12 px-6 gap-6">
					{isInitializing && !initError ? (
						<>
							<div className="flex items-center gap-3">
								<div className="flex gap-1.5">
									<div className="w-2 h-2 bg-brand-accent animate-pulse" />
									<div className="w-2 h-2 bg-[var(--theme-border-strong)]" />
									<div className="w-2 h-2 bg-[var(--theme-border-strong)]" />
								</div>
								<span className="text-xs font-mono text-[var(--theme-text-muted)]">
									HUBERT_IS_BOOTING...
								</span>
							</div>
							<div className="text-[10px] font-mono text-[var(--theme-text-subtle)] text-center max-w-md">
								Initializing chatbot... Check console for debug info.
							</div>
						</>
					) : initError ? (
						<>
							<div className="flex items-center gap-3">
								<div className="flex gap-1.5">
									<div className="w-2 h-2 bg-red-500" />
									<div className="w-2 h-2 bg-red-500/50" />
									<div className="w-2 h-2 bg-[var(--theme-border-strong)]" />
								</div>
								<span className="text-xs font-mono text-red-400">
									HUBERT_INITIALIZATION_FAILED
								</span>
							</div>
							<div className="font-mono text-sm text-[var(--theme-text-muted)] text-center max-w-md px-4 py-3 bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border-secondary)]">
								{initError}
							</div>
							<button
								onClick={retryInit}
								className="px-6 py-3 bg-brand-accent text-brand-dark font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-brand-accent/90 transition-all border-none cursor-pointer"
							>
								[RETRY]
							</button>
							<div className="text-[10px] font-mono text-[var(--theme-text-subtle)] text-center max-w-md">
								Check browser console for detailed error information.
							</div>
						</>
					) : null}
				</div>
			</div>
		);
	}

	return (
		<div className="bg-[var(--theme-bg-secondary)] border-2 border-[var(--theme-border-primary)] shadow-2xl">
			{/* Header */}
			<div className="flex items-center justify-between px-6 py-4 border-b-2 border-[var(--theme-border-primary)] bg-[var(--theme-hover-bg)]">
				<div className="flex items-center gap-3">
					<div className="flex gap-1.5">
						<div className="w-2 h-2 bg-brand-accent animate-pulse" />
						<div className="w-2 h-2 bg-[var(--theme-border-strong)]" />
						<div className="w-2 h-2 bg-[var(--theme-border-strong)]" />
					</div>
					<span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-brand-accent">
						/// HUBERT_EUNUCH /// ONLINE
					</span>
				</div>
				<div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
					{visitorId ? `VISITOR: ${visitorId.slice(0, 8)}` : 'UNKNOWN'}
				</div>
			</div>

			{/* Messages */}
			<div className="h-[500px] overflow-y-auto p-6 space-y-4">
				{messages.map((msg, idx) => (
					<div
						key={idx}
						className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
					>
						<div className="max-w-[80%]">
							<div className={`font-mono text-xs uppercase tracking-widest mb-2 px-2 py-1 ${
								msg.role === 'user'
									? 'bg-brand-accent/20 border border-brand-accent/50 text-brand-accent'
									: 'bg-[var(--theme-bg-tertiary)] border border-[var(--theme-border-secondary)] text-[var(--theme-text-muted)]'
							}`}>
								{msg.role === 'user' ? 'YOU' : 'HUBERT'}
							</div>
							<div className={`p-4 border ${
								msg.role === 'user'
									? 'border-brand-accent/30 bg-brand-accent/5'
									: 'border-[var(--theme-border-secondary)] bg-[var(--theme-bg-tertiary)]'
							}`}>
								<p className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
									{msg.content}
								</p>
								<div className="mt-2 text-[9px] font-mono text-[var(--theme-text-subtle)]">
									{new Date(msg.timestamp).toLocaleString('en-US', {
										hour: '2-digit',
										minute: '2-digit',
										second: '2-digit',
										hour12: false,
									})}
								</div>
							</div>
						</div>
					</div>
				))}
				
				{/* Typing indicator */}
				{isTyping && (
					<div className="flex gap-4">
						<div className="max-w-[80%]">
							<div className="p-4 border border-[var(--theme-border-secondary)] bg-[var(--theme-bg-tertiary)]">
								<div className="flex items-center gap-2">
									<div className="flex gap-1">
										<div className="w-1.5 h-1.5 bg-brand-accent animate-pulse" />
										<div className="w-1.5 h-1.5 bg-brand-accent animate-pulse" style={{ animationDelay: '150ms' }} />
										<div className="w-1.5 h-1.5 bg-brand-accent animate-pulse" style={{ animationDelay: '300ms' }} />
									</div>
									<span className="text-xs font-mono text-[var(--theme-text-muted)]">
										HUBERT_IS_PONDERING...
									</span>
								</div>
							</div>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Input */}
			<div className="border-t-2 border-[var(--theme-border-primary)] p-4 bg-[var(--theme-hover-bg)]">
				<div className="flex items-center gap-4">
					<div className="flex-1 relative">
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
							placeholder="/// HUBERT_AWAITS_INPUT..."
							className="w-full bg-transparent border-b-2 border-[var(--theme-border-primary)] py-3 text-lg font-mono text-[var(--theme-text-primary)] placeholder:text-[var(--theme-text-subtle)] focus:border-brand-accent focus:outline-none transition-colors"
						/>
					</div>
					<button
						onClick={sendMessage}
						disabled={isTyping || !input.trim()}
						className="px-6 py-3 bg-brand-accent text-brand-dark font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-brand-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-none"
					>
						[TRANSMIT]
					</button>
				</div>
			</div>
		</div>
	);
}
