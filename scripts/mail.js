#!/usr/bin/env node
/**
 * 统一邮件发送脚本
 * 用法:
 *   node scripts/mail.js welcome    # 发送欢迎邮件
 *   node scripts/mail.js notify     # 发送更新通知
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createTransport } from "nodemailer";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(PROJECT_ROOT, "src/content/posts");

const MODE = process.argv[2];

if (!MODE || !["welcome", "notify"].includes(MODE)) {
    console.error("❌ 用法: node scripts/mail.js [welcome|notify]");
    process.exit(1);
}

const CONFIG_FILE = path.join(PROJECT_ROOT, "docs", `${MODE}.md`);
const LOG_FILE = path.join(PROJECT_ROOT, "docs", `${MODE}-log.md`);

function loadEnv() {
    const envPath = path.join(PROJECT_ROOT, ".env");
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        content.split("\n").forEach(line => {
            const [key, ...val] = line.split("=");
            if (key && val.length) process.env[key.trim()] = val.join("=").trim();
        });
    }
}
loadEnv();

function parseConfig() {
    if (!fs.existsSync(CONFIG_FILE)) {
        console.error(`❌ 配置文件不存在: ${CONFIG_FILE}`);
        process.exit(1);
    }
    const content = fs.readFileSync(CONFIG_FILE, "utf-8");
    const { data, content: body } = matter(content);
    
    // 提取邮箱列表（在 body 中以 "- email # note" 格式）
    const emails = [];
    const lines = body.split("\n");
    let inList = false;
    for (const line of lines) {
        if (line.trim() === "# 邮箱列表") {
            inList = true;
            continue;
        }
        if (inList && line.trim().startsWith("##")) break;
        const match = line.match(/^-\s+([^\s#]+)\s*(?:#\s*(.+))?$/);
        if (match) {
            emails.push({ email: match[1].trim(), note: match[2]?.trim() || "" });
        }
    }
    
    // 提取模板（在 "# 邮件模板" 之后）
    const templateStart = body.indexOf("# 邮件模板");
    let template = "";
    if (templateStart !== -1) {
        template = body.substring(templateStart + "# 邮件模板".length).trim();
    }
    
    if (emails.length === 0) {
        console.error("❌ 邮箱列表为空");
        process.exit(1);
    }
    if (!template) {
        console.error("❌ 邮件模板为空");
        process.exit(1);
    }
    
    return { config: data, emails, template };
}

function scanAllPosts() {
    if (!fs.existsSync(POSTS_DIR)) return [];
    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith(".md"));
    const posts = [];
    for (const file of files) {
        const fullPath = path.join(POSTS_DIR, file);
        const content = fs.readFileSync(fullPath, "utf-8");
        const { data } = matter(content);
        if (data.draft === true) continue;
        const slug = file.replace(/\.md$/, "");
        const published = data.published ? new Date(data.published) : null;
        const updated = data.updated ? new Date(data.updated) : null;
        const effectiveDate = updated || published;
        if (!effectiveDate) continue;
        posts.push({ slug, title: data.title || slug, description: data.description || "", published, updated, url: `https://zhan-zip.github.io/zhan-blog/posts/${slug}/` });
    }
    posts.sort((a, b) => (b.published || 0) - (a.published || 0));
    return posts;
}

function scanNewPosts(since) {
    const allPosts = scanAllPosts();
    return allPosts.filter(p => {
        const effectiveDate = p.updated || p.published;
        return !since || effectiveDate > since;
    });
}

function buildWelcomeEmail(posts, config) {
    const dateStr = new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
    const totalPosts = posts.length;
    const articlesMd = posts.map(p => {
        const descLine = p.description ? `  > ${p.description}` : "";
        return `- [${p.title}](${p.url})${descLine}\n  <small>${p.published?.toLocaleDateString("zh-CN") || ""}</small>`;
    }).join("\n\n");
    
    const vars = {
        site_name: config.site_name || "zhan-Blog",
        date: dateStr,
        total_posts: String(totalPosts),
        articles_list: articlesMd,
        site_url: config.site_url || "https://zhan-zip.github.io/zhan-blog",
        from_email: config.from_email || config.smtp_user,
    };
    
    let rendered = config.template;
    for (const [key, val] of Object.entries(vars)) {
        rendered = rendered.replaceAll(`{{${key}}}`, val);
    }
    
    const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
    const html = md.render(rendered);
    const text = rendered.replace(/^#+\s+/gm, "").replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[(.+?)\]\((.+?)\)/g, "$1 ($2)").replace(/^>\s+/gm, "").replace(/<small>(.+?)<\/small>/g, "  $1").trim();
    
    return { subject: config.subject || "🎉 欢迎订阅！", html, text };
}

function buildNotifyEmail(posts, config) {
    const dateStr = new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
    const count = posts.length;
    const articlesMd = posts.map(p => {
        const descLine = p.description ? `  > ${p.description}` : "";
        return `- [${p.title}](${p.url})${descLine}\n  <small>${p.published?.toLocaleDateString("zh-CN") || ""}</small>`;
    }).join("\n\n");
    
    const vars = {
        site_name: config.site_name || "zhan-Blog",
        date: dateStr,
        count: String(count),
        articles_list: articlesMd,
        site_url: config.site_url || "https://zhan-zip.github.io/zhan-blog",
        from_email: config.from_email || config.smtp_user,
    };
    
    let rendered = config.template;
    for (const [key, val] of Object.entries(vars)) {
        rendered = rendered.replaceAll(`{{${key}}}`, val);
    }
    
    const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
    const html = md.render(rendered);
    const text = rendered.replace(/^#+\s+/gm, "").replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[(.+?)\]\((.+?)\)/g, "$1 ($2)").replace(/^>\s+/gm, "").replace(/<small>(.+?)<\/small>/g, "  $1").trim();
    
    const subject = config.subject?.replace("{{count}}", count).replace("{{date}}", dateStr) || `📬 ${count} 篇新文章更新通知 (${dateStr})`;
    const articleSlugs = posts.map(p => p.slug);
    
    return { subject, html, text, articleSlugs };
}

function loadLog() {
    if (fs.existsSync(LOG_FILE)) {
        return fs.readFileSync(LOG_FILE, "utf-8");
    }
    return "";
}

function appendLog(entry) {
    const timestamp = new Date().toLocaleString("zh-CN");
    const line = `\n${timestamp} | ${entry}`;
    fs.appendFileSync(LOG_FILE, line);
}

function updateLastSent(config) {
    const now = new Date().toISOString();
    let content = fs.readFileSync(CONFIG_FILE, "utf-8");
    content = content.replace(/^last_sent:.*$/m, `last_sent: "${now}"`);
    fs.writeFileSync(CONFIG_FILE, content);
}

async function sendEmail(transporter, email, { subject, html, text }) {
    await transporter.sendMail({
        from: `"zhan-Blog" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject,
        html,
        text,
    });
}

async function main() {
    console.log(`📬 启动 ${MODE === "welcome" ? "欢迎邮件" : "更新通知"} 发送...`);
    
    const { config, emails, template } = parseConfig();
    console.log(`📋 收件人: ${emails.length} 个`);
    
    const allPosts = scanAllPosts();
    let posts = [];
    let emailData = { subject: "", html: "", text: "", articleSlugs: [] };
    
    if (MODE === "welcome") {
        posts = allPosts;
        const { subject, html, text } = buildWelcomeEmail(posts, { ...config, template });
        emailData = { subject, html, text, articleSlugs: posts.map(p => p.slug) };
    } else {
        let lastSent = null;
        if (config.last_sent) lastSent = new Date(config.last_sent);
        posts = scanNewPosts(lastSent);
        if (posts.length === 0) {
            console.log("✅ 没有新文章，无需发送");
            return;
        }
        const { subject, html, text, articleSlugs } = buildNotifyEmail(posts, { ...config, template });
        emailData = { subject, html, text, articleSlugs };
    }
    
    console.log(`📝 文章数: ${posts.length}`);
    console.log(`📧 邮件主题: ${emailData.subject}`);
    
    const transporter = createTransport({
        host: config.smtp_host || "smtp.qq.com",
        port: parseInt(config.smtp_port || "465"),
        secure: (config.smtp_port || "465") === "465",
        auth: { user: config.smtp_user, pass: config.smtp_pass },
    });
    
    try {
        await transporter.verify();
        console.log("🔗 SMTP 连接验证通过");
    } catch (err) {
        console.error("❌ SMTP 连接失败:", err.message);
        process.exit(1);
    }
    
    let sent = 0, failed = 0;
    for (const target of emails) {
        try {
            await sendEmail(transporter, target.email, emailData);
            console.log(`✅ 发送成功: ${target.email}`);
            sent++;
            if (MODE === "welcome") {
                appendLog(`${target.email} | 成功 | ${emailData.subject} | 全部博客列表`);
            } else {
                appendLog(`第 1 期 | ${target.email} | 成功 | ${emailData.articleSlugs.join(", ")} | ${emailData.subject}`);
            }
        } catch (err) {
            console.error(`❌ 发送失败: ${target.email} - ${err.message}`);
            failed++;
            if (MODE === "welcome") {
                appendLog(`${target.email} | 失败 | ${err.message}`);
            } else {
                appendLog(`第 1 期 | ${target.email} | 失败 | ${err.message}`);
            }
        }
    }
    
    console.log(`\n📊 发送完成: 成功 ${sent} 个, 失败 ${failed} 个`);
    console.log(`📝 日志已记录到: ${LOG_FILE}`);
    
    if (MODE === "notify" && sent > 0) {
        updateLastSent(config);
        console.log("💾 已更新上次发送时间");
    }
    
    transporter.close();
    if (failed > 0) process.exit(1);
}

main().catch(err => {
    console.error("❌ 脚本异常:", err);
    process.exit(1);
});