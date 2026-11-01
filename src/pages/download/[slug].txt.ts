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

function markdownToText(md: string): string {
	return (
		md
			// 代码块：保留内容并缩进四个空格
			.replace(/```[^\n]*\n([\s\S]*?)```/g, (_m, code: string) =>
				code
					.replace(/\n$/, "")
					.split("\n")
					.map((line) => (line.trim() ? `    ${line}` : ""))
					.join("\n"),
			)
			// 图片 → 占位说明
			.replace(/!\[([^\]]*)\]\([^)]*\)/g, (_m, alt: string) =>
				alt ? `[图片：${alt}]` : "[图片]",
			)
			// 链接 → 保留文字
			.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
			// 标题标记
			.replace(/^#{1,6}\s+/gm, "")
			// 加粗 / 斜体 / 行内代码
			.replace(/(\*\*|__)(.*?)\1/g, "$2")
			.replace(/(\*|_)(.*?)\1/g, "$2")
			.replace(/`([^`]+)`/g, "$1")
			// 引用、列表、分隔线
			.replace(/^>\s?/gm, "")
			.replace(/^\s*[-*+]\s+/gm, "· ")
			.replace(/^\s*\d+\.\s+/gm, (m) => m.trim() + " ")
			.replace(/^-{3,}$/gm, "")
			// HTML 标签
			.replace(/<[^>]+>/g, "")
			// 压缩多余空行
			.replace(/\n{3,}/g, "\n\n")
			.trim()
	);
}

export const GET: APIRoute = async ({ props }) => {
	const post = props.post as { slug: string; data: { title: string; published: Date; tags?: string[]; category?: string }; body?: string };
	const date = post.data.published.toISOString().slice(0, 10);
	const lines = [
		post.data.title,
		"=".repeat(Math.min(post.data.title.length, 60)),
		"",
		`发布日期：${date}`,
		post.data.category ? `分类：${post.data.category}` : "",
		post.data.tags?.length ? `标签：${post.data.tags.join("、")}` : "",
		"",
		"-".repeat(40),
		"",
		markdownToText(post.body || ""),
		"",
	].filter((line) => line !== "");

	return new Response(lines.join("\n"), {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
};
