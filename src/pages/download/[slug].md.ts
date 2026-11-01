import fs from "node:fs/promises";
import path from "node:path";
import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";

export const getStaticPaths = (async () => {
	const posts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	return posts.map((post) => ({
		params: { slug: post.slug },
		props: { post },
	}));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
	const post = props.post as { filePath?: string; body?: string };
	let raw = post.body || "";
	try {
		if (post.filePath) {
			raw = await fs.readFile(path.join(process.cwd(), post.filePath), "utf-8");
		}
	} catch {
		// 读取失败则退回渲染用 body
	}
	return new Response(raw, {
		headers: { "Content-Type": "text/markdown; charset=utf-8" },
	});
};
