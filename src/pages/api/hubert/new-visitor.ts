import { randomUUID } from 'crypto';

// Prevent prerendering - this endpoint requires runtime Cloudflare bindings
export const prerender = false;

/**
 * Initialize new visitor
 * Generates a unique visitor ID and creates initial conversation ID
 * Used when Hubert interface first loads
 */
export const POST = async (context) => {
	try {
		const { request, env } = context;
		const userAgent = request.headers.get('user-agent') || 'unknown';
		const ip = request.headers.get('cf-connecting-ip') || 'unknown';

		const visitorId = randomUUID();

		// Only insert into database if HUBERT_DB binding exists (production)
		// In dev mode, this allows the chatbot to work without Cloudflare bindings
		if (env && env.HUBERT_DB) {
			await env.HUBERT_DB.prepare(`
				INSERT INTO visitors (visitor_id, first_seen_at, last_seen_at, ip_address, user_agent)
				VALUES (?, datetime('now'), datetime('now'), ?, ?)
			`).bind(visitorId, ip, userAgent).run();
			console.log(`[Hubert] New visitor initialized: ${visitorId}`);
		} else {
			console.log(`[Hubert] Dev mode: Skipping database insert for visitor: ${visitorId}`);
		}

		return Response.json({
			visitor_id: visitorId,
			conversation_id: visitorId, // Use visitor_id as initial conversation_id
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
