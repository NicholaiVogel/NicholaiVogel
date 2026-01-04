import React, { useState, useRef, useEffect } from 'react';
import { randomUUID } from 'crypto';

interface Message {
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: string;
}

export default function HubertChat() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');
	const [visitorId, setVisitorId] = useState<string | null>(null);
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [isTyping, setIsTyping] = useState(false);
	const [isInitializing, setIsInitializing] = useState(true);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Initialize visitor on mount
	useEffect(() => {
		const initVisitor = async () => {
			try {
				setIsInitializing(true);
				const response = await fetch('/api/hubert/new-visitor', { method: 'POST' });
				const data = await response.json();
				setVisitorId(data.visitor_id);
				setConversationId(data.conversation_id);
				
				// Add system welcome message from Hubert
				setMessages([{
					role: 'system',
					content: `/// HUBERT_EUNUCH /// ONLINE\\n\\nI suppose you want something. State your business.`,
					timestamp: new Date().toISOString(),
				}]);
			} catch (error) {
				console.error('Failed to initialize Hubert:', error);
				setMessages([{
					role: 'system',
					content: '/// ERROR: HUBERT_OFFLINE - REFRESH_PAGE',
					timestamp: new Date().toISOString(),
				}]);
			} finally {
				setIsInitializing(false);
			}
		};
		initVisitor();
	}, []);

	// Auto-scroll to bottom
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const sendMessage = async () => {
		if (!input.trim() || isTyping || !visitorId || !conversationId) return;

		const userMessage: Message = {
			role: 'user',
			content: input,
			timestamp: new Date().toISOString(),
		};

		setMessages(prev => [...prev, userMessage]);
		setInput('');
		setIsTyping(true);

		try {
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

			const data = await response.json();
			
			if (data.error) {
				throw new Error(data.error);
			}
			
			const assistantMessage: Message = {
				role: 'assistant',
				content: data.messages[data.messages.length - 1]?.content || '...',
				timestamp: new Date().toISOString(),
			};

			setMessages(prev => [...prev, assistantMessage]);
		} catch (error) {
			console.error('Hubert chat error:', error);
			setMessages(prev => [...prev, {
				role: 'assistant',
				content: '/// HUBERT_MALFUNCTION - TRY AGAIN',
				timestamp: new Date().toISOString(),
			}]);
		} finally {
			setIsTyping(false);
		}
	};

	if (isInitializing) {
		return (
			<div className="bg-[var(--theme-bg-secondary)] border-2 border-[var(--theme-border-primary)] shadow-2xl">
				<div className="flex items-center justify-center py-12">
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
