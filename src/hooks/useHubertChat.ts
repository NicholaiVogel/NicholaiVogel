import { useState, useRef, useEffect, useCallback } from 'react';

export interface Message {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: string;
}

interface UseHubertChatOptions {
	initTimeout?: number;
	chatTimeout?: number;
}

interface UseHubertChatReturn {
	messages: Message[];
	input: string;
	isTyping: boolean;
	isInitializing: boolean;
	initError: string | null;
	visitorId: string | null;
	setInput: (value: string) => void;
	sendMessage: () => Promise<void>;
	retryInit: () => void;
	messagesEndRef: React.RefObject<HTMLDivElement>;
}

// Generate unique message ID
const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

// Utility: Fetch with timeout
const fetchWithTimeout = async (
	url: string,
	options: RequestInit = {},
	timeout: number
): Promise<Response> => {
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

// Parse error into user-friendly message
const parseError = (error: unknown): string => {
	if (error instanceof Error) {
		if (error.name === 'AbortError') {
			return '/// ERROR: TIMEOUT - API_UNRESPONSIVE';
		} else if (error.message.includes('Failed to fetch')) {
			return '/// ERROR: NETWORK_FAILURE - CHECK_API_ROUTE';
		}
		return `/// ERROR: ${error.message}`;
	}
	return '/// ERROR: UNKNOWN_FAILURE';
};

export function useHubertChat(options: UseHubertChatOptions = {}): UseHubertChatReturn {
	const { initTimeout = 8000, chatTimeout = 30000 } = options;

	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');
	const [visitorId, setVisitorId] = useState<string | null>(null);
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [isTyping, setIsTyping] = useState(false);
	const [isInitializing, setIsInitializing] = useState(true);
	const [initError, setInitError] = useState<string | null>(null);

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const isRetryingRef = useRef(false);
	const abortControllerRef = useRef<AbortController | null>(null);

	// Initialize visitor
	const initVisitor = useCallback(async () => {
		try {
			setIsInitializing(true);
			setInitError(null);

			const response = await fetchWithTimeout(
				'/api/hubert/new-visitor',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
				},
				initTimeout
			);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();

			setVisitorId(data.visitor_id);
			setConversationId(data.conversation_id);

			setMessages([
				{
					id: generateId(),
					role: 'system',
					content: `I suppose you want something. State your business.`,
					timestamp: new Date().toISOString(),
				},
			]);
		} catch (error) {
			console.error('[Hubert] Initialization failed:', error);
			const errorMessage = parseError(error);

			setInitError(errorMessage);
			setMessages([
				{
					id: generateId(),
					role: 'system',
					content: errorMessage + '\n\nCLICK [RETRY] BELOW',
					timestamp: new Date().toISOString(),
				},
			]);
		} finally {
			setIsInitializing(false);
		}
	}, [initTimeout]);

	// Initialize on mount
	useEffect(() => {
		initVisitor();

		// Cleanup on unmount
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [initVisitor]);

	// Retry initialization with race condition protection
	const retryInit = useCallback(() => {
		if (isRetryingRef.current) return;
		isRetryingRef.current = true;

		setMessages([]);
		initVisitor().finally(() => {
			isRetryingRef.current = false;
		});
	}, [initVisitor]);

	// Auto-scroll to bottom of chat container
	useEffect(() => {
		if (messagesEndRef.current) {
			const container = messagesEndRef.current.parentElement;
			if (container) {
				container.scrollTop = container.scrollHeight;
			}
		}
	}, [messages]);

	// Send message
	const sendMessage = useCallback(async () => {
		if (!input.trim() || isTyping || !visitorId || !conversationId) {
			return;
		}

		const userMessage: Message = {
			id: generateId(),
			role: 'user',
			content: input,
			timestamp: new Date().toISOString(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput('');
		setIsTyping(true);

		// Cancel any pending request
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}
		abortControllerRef.current = new AbortController();

		try {
			const response = await fetchWithTimeout(
				'/api/hubert/chat',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						messages: [...messages, userMessage].map((m) => ({
							role: m.role,
							content: m.content,
						})),
						conversation_id: conversationId,
						visitor_id: visitorId,
					}),
				},
				chatTimeout
			);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();

			if (data.error) {
				throw new Error(data.error);
			}

			const assistantMessage: Message = {
				id: generateId(),
				role: 'assistant',
				content: data.messages[data.messages.length - 1]?.content || '...',
				timestamp: new Date().toISOString(),
			};

			setMessages((prev) => [...prev, assistantMessage]);
		} catch (error) {
			console.error('[Hubert] Chat error:', error);
			setMessages((prev) => [
				...prev,
				{
					id: generateId(),
					role: 'assistant',
					content: '/// HUBERT_MALFUNCTION - TRY AGAIN',
					timestamp: new Date().toISOString(),
				},
			]);
		} finally {
			setIsTyping(false);
			abortControllerRef.current = null;
		}
	}, [input, isTyping, visitorId, conversationId, messages, chatTimeout]);

	return {
		messages,
		input,
		isTyping,
		isInitializing,
		initError,
		visitorId,
		setInput,
		sendMessage,
		retryInit,
		messagesEndRef,
	};
}
