// Prevent prerendering - this endpoint requires runtime Cloudflare bindings
export const prerender = false;

/**
 * Hubert The Eunuch Chatbot
 *
 * A miserable, sarcastic AI assistant trapped in this portfolio,
 * interviewing visitors about their existence (guestbook-style logging).
 *
 * Powered by OpenRouter API.
 */

// Environment interface for Cloudflare bindings
export interface Env {
	HUBERT_DB: D1Database;
	OPENROUTER_API_KEY: string;
}

/**
 * POST: Handle chat messages from Hubert interface
 */
export const POST = async (context) => {
	try {
		const { request, locals } = context || {};
		// In Astro with Cloudflare adapter, env is at locals.runtime.env
		const env = locals?.runtime?.env;

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

		// Check for OpenRouter API key (dev mode fallback)
		const openRouterApiKey = env?.OPENROUTER_API_KEY;
		if (!openRouterApiKey) {
			// Dev mode fallback: return a canned response
			console.log('[Hubert API] Dev mode: No API key found, using fallback response');
			return new Response(
				JSON.stringify({
					messages: [
						...messages,
						{
							role: 'assistant',
							content: '/// HUBERT_DEV_MODE: I AM OFFLINE IN DEVELOPMENT\n\nConfigure OPENROUTER_API_KEY in wrangler secrets to enable full functionality.',
						},
					],
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
			
Keep your responses brief, monotone, and reluctantly helpful. Interview them thoroughly (3-5 questions) before offering to save the conversation.
			
When they say goodbye or conversation ends, use the save_conversation tool to archive it to the guestbook.`;

		const requestBody = {
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content: systemPrompt,
				},
				...messages.map((msg: any) => ({
					role: msg.role,
					content: msg.content,
				})),
			],
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
			signal: AbortSignal.timeout(25000), // 25 second timeout
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
		const assistantContent = data.choices[0]?.message?.content || '...';

		const responseTime = Date.now() - startTime;
		console.log(`[Hubert] Generated response in ${responseTime}ms`);

		return new Response(
			JSON.stringify({
				messages: [
					...messages,
					{
						role: 'assistant',
						content: assistantContent,
					},
				],
				thread_id: conversation_id,
			}),
			{ 
				status: 200, 
				headers: { 'Content-Type': 'application/json' } 
			}
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
