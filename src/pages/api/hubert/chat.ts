// Prevent prerendering - this endpoint requires runtime Cloudflare bindings
export const prerender = false;

import { ChatOpenAI } from '@langchain/openai';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getCollection } from 'astro:content';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

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
 * Tool: Search blog content (RAG)
 * Searches portfolio blog for relevant content when user asks questions
 * about the site, projects, or blog posts.
 */
const searchBlog = tool(
	async (input: { query: string }) => {
		try {
			const blog = await getCollection('blog');

			const queryLower = input.query.toLowerCase();
			const results = blog.filter(post =>
				post.data.title.toLowerCase().includes(queryLower) ||
				post.data.description.toLowerCase().includes(queryLower) ||
				post.body.toLowerCase().includes(queryLower)
			).slice(0, 3);

			console.log(`[Hubert] Blog search for "${input.query}" returned ${results.length} results`);

			return {
				results: results.map(post => ({
					title: post.data.title,
					url: `/blog/${post.id}/`,
					description: post.data.description,
				})),
				count: results.length,
			};
		} catch (error) {
			console.error('[Hubert] Blog search failed:', error);
			return {
				error: 'Failed to search blog content',
				details: String(error),
			};
		}
	},
	{
		name: 'search_blog',
		description: 'Search portfolio blog for relevant content when user asks questions about the site, projects, or blog posts.',
		schema: z.object({
			query: z.string().describe('Search query for blog content'),
		}),
	},
);

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
		
		const lastMessage = messages[messages.length - 1];
		const userContent = lastMessage.content;

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

		const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${openRouterApiKey}`,
				'HTTP-Referer': 'https://nicholai.work',
				'X-Title': 'Nicholai Portfolio',
			},
			body: JSON.stringify(requestBody),
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

		const responseTime = response.headers.get('date') ? Date.now() - Date.parse(response.headers.get('date')) : 0;
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
