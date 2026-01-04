import { getEntry } from 'astro:content';

// Prevent prerendering - this endpoint requires runtime Cloudflare bindings
export const prerender = false;

/**
 * Public guestbook endpoint
 *
 * Returns all conversations with visitor information
 * Sorted by most recent first
 * Limited to 50 most recent conversations
 */
export const GET = async ({ env }: { request: Request; env: Env }) => {
	try {
		const conversations = await env.HUBERT_DB.prepare(`
			SELECT 
				c.id,
				c.conversation_id,
				c.started_at,
				c.ended_at,
				c.summary,
				COUNT(m.id) as message_count,
				v.visitor_id
			FROM conversations c
			JOIN visitors v ON c.visitor_id = v.visitor_id
			LEFT JOIN messages m ON c.conversation_id = m.conversation_id
			GROUP BY c.id
			ORDER BY c.started_at DESC
			LIMIT 50
		`).all();
		
		return Response.json({
			status: '/// GUESTBOOK_ARCHIVE',
			total: conversations.length,
			conversations: conversations.map((conv: any) => ({
				...conv,
				started_at: new Date(conv.started_at).toISOString(),
				ended_at: conv.ended_at ? new Date(conv.ended_at).toISOString() : null,
			})),
		});
	} catch (error) {
		console.error('[Hubert] Failed to fetch conversations:', error);
		
		return Response.json({
			status: '/// GUESTBOOK_ERROR',
			error: 'Failed to retrieve conversations',
		}),
		{ status: 500, headers: { 'Content-Type': 'application/json' } }
	}
};

export interface Env {
	HUBERT_DB: D1Database;
	OPENROUTER_API_KEY: string;
}
