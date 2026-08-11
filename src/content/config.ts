import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		lang: z.string().optional().default(""),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});
const specCollection = defineCollection({
	// passthrough 保留任意 frontmatter 字段（首页/服务/联系页内容）
	schema: z.object({}).passthrough(),
});
const projectsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tech: z.array(z.string()).optional().default([]),
		url: z.string().optional().default(""),
		github: z.string().optional().default(""),
		status: z.string().optional().default(""),
		featured: z.boolean().optional().default(false),
	}),
});
export const collections = {
	posts: postsCollection,
	spec: specCollection,
	projects: projectsCollection,
};
