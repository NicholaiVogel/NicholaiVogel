/**
 * Calculate reading time for a given text content
 * @param content - The text content to analyze
 * @param wordsPerMinute - Reading speed (default: 200 wpm)
 * @returns Reading time string (e.g., "5 min read")
 */
export function calculateReadingTime(content: string, wordsPerMinute: number = 200): string {
	const wordCount = content?.split(/\s+/).length || 0;
	const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
	return `${readingTime} min read`;
}
