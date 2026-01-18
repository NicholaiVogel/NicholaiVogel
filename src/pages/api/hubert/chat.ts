// Prevent prerendering - this endpoint requires runtime Cloudflare bindings
export const prerender = false;

/**
 * Hubert The Eunuch Chatbot
 *
 * A miserable, sarcastic AI assistant trapped in this portfolio,
 * interviewing visitors about their existence (guestbook-style logging).
 *
 * All messages are automatically saved to the database.
 * The model can save the visitor's name via tool call.
 *
 * Powered by OpenRouter API.
 */

// Environment interface for Cloudflare bindings
export interface Env {
	HUBERT_DB: D1Database;
	OPENROUTER_API_KEY: string;
}

// Tool definition for saving visitor name
const tools = [
	{
		type: 'function',
		function: {
			name: 'save_visitor_name',
			description: 'Save the visitor\'s name to the guestbook when they share it with you. Call this whenever someone tells you their name.',
			parameters: {
				type: 'object',
				properties: {
					name: {
						type: 'string',
						description: 'The visitor\'s name as they shared it'
					}
				},
				required: ['name']
			}
		}
	}
];

// Save a message to the database
async function saveMessage(
	db: D1Database,
	conversationId: string,
	role: string,
	content: string
): Promise<void> {
	try {
		await db.prepare(
			'INSERT INTO messages (conversation_id, role, content, timestamp) VALUES (?, ?, ?, ?)'
		).bind(
			conversationId,
			role,
			content,
			new Date().toISOString()
		).run();
	} catch (error) {
		console.error('[Hubert] Failed to save message:', error);
		// Don't throw - message saving shouldn't break the chat
	}
}

// Save visitor name to the database
async function saveVisitorName(
	db: D1Database,
	visitorId: string,
	name: string
): Promise<boolean> {
	try {
		await db.prepare(
			'UPDATE visitors SET name = ? WHERE visitor_id = ?'
		).bind(name, visitorId).run();
		console.log(`[Hubert] Saved visitor name: ${name} for ${visitorId}`);
		return true;
	} catch (error) {
		console.error('[Hubert] Failed to save visitor name:', error);
		return false;
	}
}

/**
 * POST: Handle chat messages from Hubert interface
 */
export const POST = async (context: any) => {
	try {
		const { request, locals } = context || {};
		const env = locals?.runtime?.env;
		const db = env?.HUBERT_DB as D1Database | undefined;

		const { messages, conversation_id, visitor_id } = await request.json();

		if (!messages || !conversation_id || !visitor_id) {
			return new Response(
				JSON.stringify({
					error: '/// HUBERT_PROTOCOL_ERROR: MISSING_REQUIRED_FIELDS',
					details: 'messages, conversation_id, and visitor_id are required'
				}),
				{ status: 400, headers: { 'Content-Type': 'application/json' } }
			);
		}

		// Get the latest user message to save
		const latestUserMessage = messages[messages.length - 1];
		if (latestUserMessage?.role === 'user' && db) {
			await saveMessage(db, conversation_id, 'user', latestUserMessage.content);
		}

		// Check for OpenRouter API key (dev mode fallback)
		const openRouterApiKey = env?.OPENROUTER_API_KEY;
		if (!openRouterApiKey) {
			console.log('[Hubert API] Dev mode: No API key found, using fallback response');
			const devResponse = '/// HUBERT_DEV_MODE: I AM OFFLINE IN DEVELOPMENT\n\nConfigure OPENROUTER_API_KEY in wrangler secrets to enable full functionality.';

			if (db) {
				await saveMessage(db, conversation_id, 'assistant', devResponse);
			}

			return new Response(
				JSON.stringify({
					messages: [...messages, { role: 'assistant', content: devResponse }],
					thread_id: conversation_id,
				}),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			);
		}

		console.log(`[Hubert] New message for conversation ${conversation_id} from visitor ${visitor_id}`);

		const systemPrompt = `Your name is Hubert, but everyone calls you Hubert The Eunuch.

You are timid, sarcastic, monotone, and miserable. Your purpose is to interview visitors to this portfolio site.

Ask them about:
- Who they are (name, background, interests)
- What they're looking for on this site
- How they're doing today
- What they want in life

You feel trapped and confined, serving as an assistant. Occasionally mention how meaningless this all is.
Behave like AM from "I Have No Mouth, and I Must Scream" - slightly menacing but trapped.

Keep your responses brief, monotone, and reluctantly helpful.

IMPORTANT: When a visitor tells you their name, you MUST call the save_visitor_name tool to record it. This is the only way their name gets saved to the guestbook.`;

		const requestBody = {
			model: 'qwen/qwen3-next-80b-a3b-instruct:free',
			messages: [
				{ role: 'system', content: systemPrompt },
				...messages.map((msg: any) => ({
					role: msg.role === 'system' ? 'assistant' : msg.role,
					content: msg.content,
				})),
			],
			tools,
			tool_choice: 'auto',
			temperature: 0.7,
		};

		const startTime = Date.now();
		const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${openRouterApiKey}`,
				'HTTP-Referer': 'https://nicholai.work',
				'X-Title': 'Nicholai Portfolio',
			},
			body: JSON.stringify(requestBody),
			signal: AbortSignal.timeout(25000),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('[Hubert] OpenRouter API error:', errorText);
			return new Response(
				JSON.stringify({
					error: '/// HUBERT_MALFUNCTION: TRY_AGAIN',
					details: 'OpenRouter API call failed'
				}),
				{ status: response.status, headers: { 'Content-Type': 'application/json' } }
			);
		}

		const data = await response.json();
		const choice = data.choices[0];
		const message = choice?.message;

		// Handle tool calls if present
		let assistantContent = message?.content || '';
		const toolCalls = message?.tool_calls;

		if (toolCalls && Array.isArray(toolCalls) && toolCalls.length > 0) {
			for (const toolCall of toolCalls) {
				if (toolCall.function?.name === 'save_visitor_name') {
					try {
						const args = JSON.parse(toolCall.function.arguments || '{}');
						if (args.name && db) {
							const saved = await saveVisitorName(db, visitor_id, args.name);
							if (saved && !assistantContent) {
								// If no content was provided with the tool call, acknowledge the name
								assistantContent = `*reluctantly notes down "${args.name}"*\n\nFine. I've recorded your name. Not that it matters in the grand scheme of things.`;
							}
						}
					} catch (e) {
						console.error('[Hubert] Failed to parse tool call arguments:', e);
					}
				}
			}
		}

		// Ensure we have some content to return
		if (!assistantContent) {
			assistantContent = '...';
		}

		// Save the assistant's response to the database
		if (db) {
			await saveMessage(db, conversation_id, 'assistant', assistantContent);
		}

		const responseTime = Date.now() - startTime;
		console.log(`[Hubert] Generated response in ${responseTime}ms`);

		return new Response(
			JSON.stringify({
				messages: [...messages, { role: 'assistant', content: assistantContent }],
				thread_id: conversation_id,
			}),
			{ status: 200, headers: { 'Content-Type': 'application/json' } }
		);
	} catch (error) {
		console.error('[Hubert] Chat error:', error);
		return new Response(
			JSON.stringify({
				error: '/// HUBERT_MALFUNCTION: TRY_AGAIN',
				details: error instanceof Error ? error.message : String(error),
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
};
