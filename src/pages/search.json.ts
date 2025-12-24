import { getCollection } from 'astro:content';

export async function GET() {
	const posts = await getCollection('blog');

	const searchData = posts.map((post) => ({
		id: post.id,
		title: post.data.title,
		description: post.data.description,
		content: post.body,
		category: post.data.category || '',
		tags: post.data.tags || [],
		url: `/blog/${post.id}/`,
		pubDate: post.data.pubDate.toISOString(),
	}));

	return new Response(JSON.stringify(searchData), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
		},
	});
}
