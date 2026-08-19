#!/usr/bin/env node
/**
 * 添加订阅者到 docs/subscribers.json
 * 用法: node scripts/add-subscriber.js <email> [备注]
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const SUBSCRIBERS_FILE = path.join(PROJECT_ROOT, "docs/subscribers.json");

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

let subscribers = [];
if (fs.existsSync(SUBSCRIBERS_FILE)) {
    try {
        subscribers = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, "utf-8"));
    } catch {
        subscribers = [];
    }
}

// 去重
if (subscribers.some(s => s.email === email)) {
    console.log(`⚠️ ${email} 已存在`);
    process.exit(0);
}

subscribers.push({
    email,
    added: new Date().toISOString().split("T")[0],
    note: note || "手动添加",
});

fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
console.log(`✅ 已添加: ${email} (共 ${subscribers.length} 个订阅者)`);