#!/usr/bin/env node
/**
 * 添加订阅者到 docs/subscribers.md
 * 用法: node scripts/add-subscriber.js <email> [备注]
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const SUBSCRIBERS_FILE = path.join(PROJECT_ROOT, "docs/subscribers.md");

const args = process.argv.slice(2);
const email = args[0];
const note = args[1] || "";

if (!email || !email.includes("@")) {
    console.error("❌ 用法: node scripts/add-subscriber.js <email> [备注]");
    process.exit(1);
}

// 简单邮箱格式校验
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("❌ 邮箱格式无效");
    process.exit(1);
}

// 读取现有列表
let subscribers = [];
if (fs.existsSync(SUBSCRIBERS_FILE)) {
    const content = fs.readFileSync(SUBSCRIBERS_FILE, "utf-8");
    // 解析: - email # note
    const lines = content.split("\n");
    for (const line of lines) {
        const match = line.match(/^-\s+([^\s#]+)\s*(?:#\s*(.+))?$/);
        if (match) {
            subscribers.push({
                email: match[1].trim(),
                note: match[2]?.trim() || "",
            });
        }
    }
}

// 去重
if (subscribers.some(s => s.email === email)) {
    console.log(`⚠️ ${email} 已存在`);
    process.exit(0);
}

subscribers.push({
    email,
    note: note || `手动添加 ${new Date().toISOString().split("T")[0]}`,
});

// 写回 Markdown
const today = new Date().toISOString().split("T")[0];
const lines = [
    "---",
    "title: 订阅者列表",
    "---",
    "",
    "# 订阅者列表",
    "",
    "> 维护说明：每行一个订阅者，格式：`- 邮箱 # 备注（可选）`",
    "> 添加后运行 `node scripts/add-subscriber.js` 会自动同步去重（也可直接改此文件）",
    "",
    ...subscribers.map(s => `- ${s.email}${s.note ? ` # ${s.note}` : ""}`),
    "",
];
fs.writeFileSync(SUBSCRIBERS_FILE, lines.join("\n"));
console.log(`✅ 已添加: ${email} (共 ${subscribers.length} 个订阅者)`);