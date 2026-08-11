# Zhan-Blog 项目交接文档

## 一、项目概述

个人静态博客项目，核心目标是：**记录项目经历 + 写教程 + 引流接单**。

**定位：我的个人技术品牌站** —— 让第一次进来的访客 3 秒看懂「我是谁、我能做什么、怎么联系我」，承接 Web 开发 / 全栈+Agent / 课程设计的咨询与订单。

**目录：** `D:\Desktop\test\claude-test\zhan-blog\`

**开发周期：** 2026 年 8 月启动，单人开发。当前为设计定稿阶段，尚未开始编码。

**核心功能一句话：** Astro 静态博客 + GitHub Pages 托管 + Twikoo 评论 + GitHub Actions 联系表单/订阅 + Pagefind 搜索，亮暗双模式随系统。

***

## 二、产品定位与差异化

明确不做「功能堆满的大杂烩」，也不做「过度简洁让人找不到入口的极简站」。差异化来自四个方向（2026-08-11 讨论确认）：

| 方向 | 说明 | 落地位置 |
|------|------|---------|
| **① 首次访客友好** | 首页 3 秒传达"你是谁 / 能做什么 / 怎么联系"，Hero + 双 CTA | 首页 |
| **② 内容与代码分离** | 用户直接用 Markdown 编辑文章/服务/关于，无需懂代码 | `src/content/` |
| **③ 接单转化设计** | 独立服务页 + 联系表单 + 项目案例展示 | 服务页、联系页 |
| **④ 国内访客可用** | 评论支持匿名（Twikoo），不强制 GitHub 登录，表单不走被墙服务 | 评论、表单 |

> 核心判断：**博客是个人品牌与接单入口，不是技术演示场** —— 动效与设计服务于阅读与转化，克制不炫技。

***

## 三、架构

```
访客浏览器（亮/暗双模式随系统）
  │
  ├─ 前端：Astro 静态站点（SSG）
  │   托管：GitHub Pages（zhan-zip.github.io，免费）
  │   搜索：Pagefind（构建时生成索引，离线可用，零后端）
  │   内容：src/content/ 下 Markdown（用户编辑）
  │
  ├─ 评论：Twikoo
  │   后端：Hugging Face Space（免费，国内访问待实测）
  │   能力：匿名评论、博主邮件通知、管理后台
  │
  ├─ 联系表单 + 邮件订阅：GitHub Actions
  │   表单 POST → workflow 触发 → SMTP 发邮件到博主邮箱 / 追加订阅列表
  │
  └─ 数据统计：Umami 或百度统计（P2 阶段定）
```

* **前端**：Astro，基于 fuwari 模板改造（保留其一键跳 GitHub 按钮、暗色切换、卡片网格）
* **评论**：Twikoo（匿名、免费、邮件通知），后端部署 Hugging Face Space
* **表单/订阅**：GitHub Actions（免费、不走墙、无第三方依赖）
* **搜索**：Pagefind（离线搜索）
* **无后端服务器**：不租 VPS，全部免费第三方服务

***

## 四、设计决策记录（需求调研结论）

### 4.1 技术栈：Astro（选定）

| 备选 | 取舍 |
|------|------|
| **Astro** | 定制性强、可扩展、可嵌组件做交互效果，2026 社区热度最高。**符合"要定制+交互+扩展"需求** |
| Hugo | 构建快但定制需 Go 模板，交互难做，不符合"要前端效果" |
| Hexo | 中文生态好，但主题定制麻烦，长期维护依赖更新问题 |

### 4.2 主题路线：先主题后自研

用 fuwari 起步快速上线占坑，边用边改，逐步往自己风格迭代（用户 2026-08-11 拍板）。

### 4.3 视觉风格：三站融合

| 来源 | 取 | 不取 |
|------|----|------|
| Josh Comeau | 文章排版、卡片化、精致动效、亮色 + 蓝/粉配色 | 极简顶栏（首次访客找不到入口） |
| Brittany Chiang | Projects 分区结构、时间线项目列表 | 玻璃拟态、过度简洁 |
| fuwari | 一键跳 GitHub 按钮、亮暗切换、卡片网格 | — |

**配色**：主色 `#4242FA` 蓝 / 强调 `#E60067` 粉 / 装饰 `#63BCE9` 天蓝 / 暗色用深藏蓝 `#0F172A` 系
**字体**：中文思源黑体系 + 英文 Inter（近似 Josh 的 Wotfard）+ 代码 JetBrains Mono
**氛围**：圆角卡片 8-12px、轻阴影、克制留白；**不用玻璃拟态**

### 4.4 评论系统：Twikoo（非 Giscus/Gitalk/Waline）

* **弃用 Giscus/Gitalk**：需访客登录 GitHub，国内访客被挡在门外
* **暂缓 Waline**：功能全但默认 Vercel 域名被污染，必须绑自定义域名，现阶段无域名
* **选定 Twikoo**：匿名、免费、配置简单，后端可部署 Hugging Face Space

### 4.5 联系表单：GitHub Actions（非 Formspree）

Formspree 免费版国内访问可能不稳。GitHub Actions 完全免费、不翻墙、无第三方依赖，还能顺带维护订阅列表。

***

## 五、文件结构（规划中，2026-08-11）

```
zhan-blog/
├── zhan-blog-project-summary.md   ← 本文档
├── 实施计划.md                      ← 任务优先级/难度/实现方法
├── .gitignore                      ← 排除 .env、node_modules 等
├── CLAUDE.md                       ← 项目规范（供 Claude Code 维护用）
├── src/
│   ├── content/                    ← 🟢 用户编辑区（Markdown）
│   │   ├── posts/                  ←   每篇文章一个 .md
│   │   ├── projects/               ←   项目展示数据
│   │   ├── services.md             ←   服务页内容
│   │   └── about.md                ←   关于页内容
│   ├── pages/                      ← 路由页面（index/posts/projects/services/about/contact）
│   ├── components/                 ← 可复用组件
│   ├── layouts/                    ← 页面骨架模板
│   └── styles/                     ← 样式（配色/字体变量）
├── public/                         ← 🟢 图片等静态资源（用户放）
├── .github/
│   └── workflows/                  ← GitHub Actions（部署 + 表单 + 订阅）
├── astro.config.mjs
└── package.json
```

**编辑分工**：`src/content/`（写内容）与 `public/`（放图片）归用户；其余代码归 Claude Code。

***

## 六、核心功能设计

### 6.1 页面规划（9 页）

| 页面 | 作用 | 优先级 |
|------|------|--------|
| 首页 | Hero + 精选项目 + 最新文章 + 联系入口 | P0 |
| 文章列表 | 分类/标签/搜索/分页 | P0 |
| 文章详情 | 排版 + 目录 + 代码高亮复制 + Twikoo 评论 | P0 |
| 项目 | 分区项目展示（Brittany 式） | P0 |
| 服务 | 接单方向展示 | P0 |
| 关于 | 经历时间线 + 技能 + 渠道 | P0 |
| 联系 | 表单→邮箱 + 邮箱 + 社交 | P0 |
| 分类/标签 | 自动生成 | P1 |
| RSS | 自动生成 feed | P1 |

### 6.2 首页结构（首次访客友好）

```
导航（常驻）：首页 / 文章 / 项目 / 服务 / 关于 / 联系
Hero：我是谁一句话 + 双 CTA（[联系我] [看我的项目]）
精选项目（3 个卡片，带图）
最新文章（3-4 篇）
页脚：邮箱 + GitHub + RSS
```

### 6.3 服务页（接单转化核心）

```
定位一句 + [联系我聊聊需求]
→ 服务卡片 3 个方向：
    ① Web 开发（网页/网站/可加 PWA）
    ② 全栈 + Agent 辅助开发
    ③ 学生课程设计
→ 合作流程：咨询 → 报价 → 开发 → 交付
→ 成功案例（复用项目页）
→ 联系表单（再次出现，转化点）
```

### 6.4 评论（Twikoo）

* fuwari 支持 Twikoo 评论组件；前端指向 Hugging Face 部署的服务器地址
* **`SECURE_DOMAINS` 必须配置 `zhan-zip.github.io`**（以及未来自定义域名），否则前端请求 403

### 6.5 联系表单 + 订阅（GitHub Actions）

* 表单 POST → workflow → SMTP 发邮件到博主邮箱
* 订阅 POST → workflow → 追加邮箱到订阅列表文件 + 可选欢迎邮件
* 注意：Action 是**异步**处理，前端需处理「提交中 / 成功 / 失败」三态反馈

### 6.6 交互效果清单（用户要"不纯文字"）

滚动渐入动画 / 平滑滚动 / 亮暗切换 / 返回顶部 / 卡片 hover 抬升 / 代码块复制 + 行号高亮 / 阅读进度条 / 目录跟随滚动高亮

***

## 七、关键配置（实施时填）

| 项 | 说明 |
|----|------|
| `SMTP_*` 环境变量 | QQ/163 邮箱授权码，存 GitHub Secrets，**绝不入库** |
| Twikoo `SERVER_URL` | Hugging Face Space 地址；`SECURE_DOMAINS` = zhan-zip.github.io |
| GitHub Pages 仓库 | `zhan-zip/zhan-blog`，Pages 走 Actions 部署 |

> ⚠️ `.env` / Secrets 绝不提交仓库（参照 CLAUDE.md 全局安全规则）。

***

## 八、内容结构（已确认，2026-08-11）

基于 fuwari `src/content/config.ts` 的 postsCollection schema 确认，文章 frontmatter 字段如下：

```
src/content/posts/hello-world.md
---
title: 文章标题        # 必填
published: 2026-08-11 # 必填，发布日期
updated: 2026-08-12   # 可选，更新日期
draft: false          # 可选，草稿（默认 false）
description: 一句话摘要 # 可选
image: /images/xxx.png # 可选，封面图路径
tags: [教程, 前端]      # 可选，标签数组
category: 分类名        # 可选，分类
lang: zh              # 可选，语言代码
---
正文 Markdown…
```

> 另含 `prevTitle/prevSlug/nextTitle/nextSlug` 四个内部字段（自动生成，无需手动填写）。

***

## 九、开发计划（详见 实施计划.md）

| 阶段 | 里程碑 | 内容 | 优先级 |
|------|--------|------|--------|
| 基础 | M0 | 项目初始化 + fuwari 引入 | P0 |
| 上线 | M1–M2 | 本地预览 + GitHub Pages 部署 | P0 |
| 视觉 | M3 | 配色/字体/双模式改造 | P1 |
| 页面 | M4 | 首页/文章/项目/服务/关于/联系 | P1 |
| 内容系统 | M5 | Markdown 写作 + 分类标签 + Pagefind | P1 |
| 互动 | M6 | Twikoo 评论接入 | P1 |
| 互动 | M7 | 联系表单 + 邮件订阅 | P1 |
| 运营 | M8 | 内容填充 + 数据统计 | P2 |
| 打磨 | M9 | 打磨 + 上线运营 | P2 |

***

## 十、已知问题及注意事项

1. **Hugging Face 国内访问**：资料显示尚可但各地不一，实施时实测；不行换 Railway / Zeabur 等备选
2. **GitHub Pages 国内速度**：偶发慢，起步够用；后续引流需要可绑自定义域名 / 加 Cloudflare
3. **Vercel 默认域名被污染**：评论/表单后端**不用 Vercel 默认域名**（国内报 Failed to fetch）
4. **表单异步**：GitHub Actions 提交是异步的，前端要做好提交反馈
5. **Twikoo SECURE_DOMAINS**：白名单必须与实际访问域名一一对应，否则 403
6. **fuwari 依赖**：Node ≥ 20、pnpm ≥ 9；`pnpm install` 需联网（梯子）
7. **Waline 域名绑定问题**：如需升级到 Waline，必须绑自定义域名才能绕开 Vercel 污染

***

## 十一、依赖

### 前端 (Node ≥ 20)

```
astro / pnpm / fuwari 模板（tailwindcss 等）/ pagefind / @astrojs/sitemap
```

### 后端（均为第三方免费服务，无自建依赖）

```
Twikoo（Hugging Face Space）/ GitHub Actions / SMTP（QQ 或 163 邮箱）
```

***

## 十二、参考资源

* [fuwari](https://github.com/saicaca/fuwari) — Astro 博客模板（本项目起步）
* [Josh Comeau](https://www.joshwcomeau.com) — 排版 / 动效风格参考
* [Brittany Chiang](https://brittanychiang.com) — Projects 分区结构参考
* [Twikoo](https://github.com/twikoojs/twikoo) — 评论系统
* [giscus](https://github.com/giscus/giscus) — GitHub Discussions 评论（弃用候选，留档）
* [Waline](https://github.com/walinejs/waline) — 备选评论系统（需绑域名）
* [claude快速对照表.md](../TreaWork/claude快速对照表.md) — 本机 Claude Code 环境速查
