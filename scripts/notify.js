#!/usr/bin/env node
/**
 * 一键群发订阅通知脚本
 * 用法:
 *   node scripts/notify.js              # 自动取上次通知后的新文章
 *   node scripts/notify.js --since=2026-08-10  # 指定日期后的文章
 *   node scripts/notify.js --dry-run    # 只打印不发送
 *   node scripts/notify.js --help       # 显示帮助
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createTransport } from "nodemailer";
import matter from "gray-matter";

// ========== 配置 ==========
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(PROJECT_ROOT, "src/content/posts");
const SUBSCRIBERS_FILE = path.join(PROJECT_ROOT, "docs/subscribers.json");
const STATE_FILE = path.join(PROJECT_ROOT, "docs/notify-state.json");
const SITE_URL = "https://zhan-zip.github.io/zhan-blog";

// 读取 .env
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

const SMTP_HOST = process.env.SMTP_HOST || "smtp.qq.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;
const SMTP_SECURE = SMTP_PORT === 465; // 465 用 SSL，587 用 STARTTLS

if (!SMTP_USER || !SMTP_PASS) {
    console.error("❌ 未配置 SMTP 账号/密码，请在项目根目录 .env 设置 SMTP_USER / SMTP_PASS");
    process.exit(1);
}

// ========== 参数解析 ==========
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const help = args.includes("--help") || args.includes("-h");
let sinceDate = null;

const sinceArg = args.find(a => a.startsWith("--since="));
if (sinceArg) {
    sinceDate = new Date(sinceArg.split("=")[1]);
    if (isNaN(sinceDate.getTime())) {
        console.error("❌ --since 日期格式错误，用 YYYY-MM-DD");
        process.exit(1);
    }
}

if (help) {
    console.log(`
用法: node scripts/notify.js [选项]

选项:
  --since=YYYY-MM-DD   只通知该日期之后发布/更新的文章（默认：上次通知时间）
  --dry-run            只预览邮件内容，不实际发送
  --help               显示帮助

环境变量 (.env):
  SMTP_HOST=smtp.qq.com
  SMTP_PORT=465
  SMTP_USER=your@qq.com
  SMTP_PASS=auth_code
  SMTP_FROM=your@qq.com
`);
    process.exit(0);
}

// ========== 读取订阅者列表 ==========
function loadSubscribers() {
    if (!fs.existsSync(SUBSCRIBERS_FILE)) {
        console.error(`❌ 订阅者文件不存在: ${SUBSCRIBERS_FILE}`);
        console.log("💡 先用 scripts/add-subscriber.js 添加订阅者");
        process.exit(1);
    }
    const data = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, "utf-8"));
    return data.map(s => s.email).filter(Boolean);
}

// ========== 读取上次通知时间 ==========
function loadLastNotify() {
    if (fs.existsSync(STATE_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
            return data.lastNotify ? new Date(data.lastNotify) : null;
        } catch { }
    }
    return null;
}

function saveLastNotify() {
    fs.writeFileSync(STATE_FILE, JSON.stringify({ lastNotify: new Date().toISOString() }, null, 2));
}

// ========== 扫描文章 ==========
function scanPosts(since) {
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

        // 判断是否为新增/更新文章
        const effectiveDate = updated || published;
        if (!effectiveDate) continue;

        if (since && effectiveDate <= since) continue;

        posts.push({
            slug,
            title: data.title || slug,
            description: data.description || "",
            published,
            updated,
            url: `${SITE_URL}/posts/${slug}/`,
        });
    }

    // 按发布时间倒序
    posts.sort((a, b) => (b.published || 0) - (a.published || 0));
    return posts;
}

// ========== 生成邮件内容 ==========
function buildEmail(posts) {
    const dateStr = new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
    const count = posts.length;

    const listHtml = posts.map(p => `
        <li style="margin-bottom: 16px;">
            <a href="${p.url}" style="color: #4242FA; text-decoration: none; font-weight: 600; font-size: 16px;">
                ${p.title}
            </a>
            ${p.description ? `<p style="margin: 6px 0 0; color: #666; font-size: 14px;">${p.description}</p>` : ""}
            <p style="margin: 4px 0 0; color: #999; font-size: 12px;">${p.published?.toLocaleDateString("zh-CN") || ""}</p>
        </li>
    `).join("");

    const listText = posts.map(p =>
        `• ${p.title}\n  ${p.url}\n  ${p.description || ""}\n`
    ).join("\n");

    const subject = `📬 ${count} 篇新文章更新通知 (${dateStr})`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { border-bottom: 2px solid #4242FA; padding-bottom: 16px; margin-bottom: 24px; }
        .title { color: #4242FA; margin: 0; }
        .subtitle { color: #666; margin: 8px 0 0; }
        ul { list-style: none; padding: 0; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; color: #999; font-size: 13px; }
        .unsubscribe { color: #4242FA; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">📬 博客更新通知</h1>
        <p class="subtitle">${dateStr} · 共 ${count} 篇新内容</p>
    </div>
    <ul>
        ${listHtml}
    </ul>
    <div class="footer">
        <p>你收到这封邮件是因为订阅了 <a href="${SITE_URL}">zhan-Blog</a> 的更新通知。</p>
        <p class="unsubscribe">不想收到？<a href="mailto:${SMTP_FROM}?subject=退订">回复此邮件</a> 告诉我，我会手动移除。</p>
    </div>
</body>
</html>
`;

    const text = `
📬 博客更新通知 (${dateStr}) · 共 ${count} 篇新内容

${listText}

---
你收到这封邮件是因为订阅了 zhan-Blog (${SITE_URL}) 的更新通知。
不想收到？回复此邮件告诉我，我会手动移除。
`;

    return { subject, html, text };
}

// ========== 发送邮件 ==========
async function sendEmails(transporter, emails, { subject, html, text }) {
    const results = { sent: 0, failed: 0 };

    for (const email of emails) {
        try {
            if (dryRun) {
                console.log(`[DRY-RUN] 发送给: ${email}`);
                results.sent++;
                continue;
            }

            await transporter.sendMail({
                from: `"zhan-Blog" <${SMTP_FROM}>`,
                to: email,
                subject,
                html,
                text,
            });
            console.log(`✅ 发送成功: ${email}`);
            results.sent++;
        } catch (err) {
            console.error(`❌ 发送失败: ${email} - ${err.message}`);
            results.failed++;
        }
    }

    return results;
}

// ========== 主流程 ==========
async function main() {
    console.log("📬 启动订阅通知...");

    const subscribers = loadSubscribers();
    if (subscribers.length === 0) {
        console.log("⚠️ 订阅者列表为空，无需发送");
        return;
    }
    console.log(`📋 订阅者: ${subscribers.length} 个`);

    const lastNotify = sinceDate || loadLastNotify();
    if (lastNotify) {
        console.log(`🕐 上次通知时间: ${lastNotify.toLocaleString("zh-CN")}`);
    } else {
        console.log("🕐 首次通知，将包含所有已发布文章");
    }

    const posts = scanPosts(lastNotify);
    if (posts.length === 0) {
        console.log("✅ 没有新文章，无需发送");
        return;
    }
    console.log(`📝 新文章: ${posts.length} 篇`);
    posts.forEach(p => console.log(`   - ${p.title} (${p.published?.toLocaleDateString("zh-CN")})`));

    const { subject, html, text } = buildEmail(posts);
    console.log(`\n📧 邮件主题: ${subject}`);

    if (dryRun) {
        console.log("\n--- 邮件预览 (HTML) ---");
        console.log(html);
        console.log("\n--- 邮件预览 (Text) ---");
        console.log(text);
        console.log("\n💡 这是预览模式，未实际发送。去掉 --dry-run 正式发送。");
        return;
    }

    const transporter = createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    // 验证连接
    try {
        await transporter.verify();
        console.log("🔗 SMTP 连接验证通过");
    } catch (err) {
        console.error("❌ SMTP 连接失败:", err.message);
        process.exit(1);
    }

    const results = await sendEmails(transporter, subscribers, { subject, html, text });

    console.log(`\n📊 发送完成: 成功 ${results.sent} 个, 失败 ${results.failed} 个`);

    if (results.sent > 0) {
        saveLastNotify();
        console.log("💾 已更新上次通知时间");
    }

    transporter.close();
}

main().catch(err => {
    console.error("❌ 脚本异常:", err);
    process.exit(1);
});