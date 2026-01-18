import { randomUUID } from 'crypto';

// Prevent prerendering - this endpoint requires runtime Cloudflare bindings
export const prerender = false;

/**
 * Initialize new visitor
 * Generates a unique visitor ID and creates initial conversation
 * Used when Hubert interface first loads
 */
export const POST = async (context: any) => {
	try {
		const { request, locals } = context;
		const env = locals?.runtime?.env;

		const userAgent = request.headers.get('user-agent') || 'unknown';
		const ip = request.headers.get('cf-connecting-ip') || 'unknown';

		const visitorId = randomUUID();
		const conversationId = randomUUID();

		// Only insert into database if HUBERT_DB binding exists (production)
		if (env && env.HUBERT_DB) {
			try {
				// Create visitor
				await env.HUBERT_DB.prepare(`
					INSERT INTO visitors (visitor_id, first_seen_at, last_seen_at, ip_address, user_agent)
					VALUES (?, datetime('now'), datetime('now'), ?, ?)
				`).bind(visitorId, ip, userAgent).run();

				// Create conversation for this visitor
				await env.HUBERT_DB.prepare(`
					INSERT INTO conversations (conversation_id, visitor_id, started_at)
					VALUES (?, ?, datetime('now'))
				`).bind(conversationId, visitorId).run();

				console.log(`[Hubert] New visitor ${visitorId} with conversation ${conversationId}`);
			} catch (dbError) {
				console.error('[Hubert] Database insert failed (continuing anyway):', dbError);
			}
		} else {
			console.log(`[Hubert] Dev mode: Skipping database for visitor: ${visitorId}`);
		}

		return Response.json({
			visitor_id: visitorId,
			conversation_id: conversationId,
			status: '/// INTERVIEW_TERMINAL_READY',
		});
	} catch (error) {
		console.error('[Hubert] Failed to initialize visitor:', error);

		return new Response(
			JSON.stringify({
				error: '/// HUBERT_INIT_FAILED',
				details: String(error),
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
};

export interface Env {
	HUBERT_DB: D1Database;
	OPENROUTER_API_KEY: string;
}
