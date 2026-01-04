import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			// Blog hub fields
			featured: z.boolean().optional().default(false),
			category: z.string().optional(),
			tags: z.array(z.string()).optional(),
		}),
});

const sections = defineCollection({
	loader: glob({ base: './src/content/sections', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		// Hero section
		headlineLine1: z.string().optional(),
		headlineLine2: z.string().optional(),
		portfolioYear: z.string().optional(),
		location: z.string().optional(),
		locationLabel: z.string().optional(),
		bio: z.string().optional(),
		// Experience section
		sectionTitle: z.string().optional(),
		sectionSubtitle: z.string().optional(),
		sectionLabel: z.string().optional(),
		description: z.string().optional(),
		// Experience entries
		entries: z.array(z.object({
			systemId: z.string(),
			status: z.string(),
			dates: z.string(),
			company: z.string(),
			role: z.string(),
			tags: z.array(z.string()).optional(),
			description: z.string(),
			achievements: z.array(z.object({
				label: z.string(),
				text: z.string(),
			})).optional(),
			link: z.object({
				url: z.string(),
				text: z.string(),
			}).optional(),
		})).optional(),
		// Skills entries
		skills: z.array(z.object({
			id: z.string(),
			domain: z.string(),
			tools: z.string(),
			proficiency: z.string(),
		})).optional(),
		// Featured project
		role: z.string().optional(),
		client: z.string().optional(),
		year: z.string().optional(),
		region: z.string().optional(),
		projectTitle: z.string().optional(),
		projectSubtitle: z.string().optional(),
		projectDescription: z.string().optional(),
		stats: z.array(z.object({
			label: z.string(),
			value: z.string(),
		})).optional(),
		linkUrl: z.string().optional(),
	}),
});


const pages = defineCollection({
	loader: glob({ base: './src/content/pages', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		pageTitleLine1: z.string().optional(),
		pageTitleLine2: z.string().optional(),
		availabilityText: z.string().optional(),
		email: z.string().optional(),
		location: z.string().optional(),
		locationCountry: z.string().optional(),
		coordinates: z.string().optional(),
		socialLinks: z.array(z.object({
			name: z.string(),
			url: z.string(),
		})).optional(),
		formLabels: z.object({
			name: z.string().optional(),
			email: z.string().optional(),
			subject: z.string().optional(),
			message: z.string().optional(),
			submit: z.string().optional(),
			transmissionUplink: z.string().optional(),
		}).optional(),
		subjectOptions: z.array(z.object({
			value: z.string(),
			label: z.string(),
		})).optional(),
	}),
});

const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			link: z.string(),
			category: z.string(),
			tags: z.array(z.string()).optional(),
			image: image().optional(),
			order: z.number().optional().default(0),
		}),
});

export const collections = { blog, sections, pages, projects };
