# Zhan-Blog

个人技术博客 —— **记录项目经历 + 写教程 + 引流接单**。

基于 [Astro](https://astro.build) + [fuwari](https://github.com/saicaca/fuwari) 模板改造。

## 技术栈

| 项 | 方案 |
|----|------|
| 框架 | Astro（SSG） |
| 主题 | fuwari 改造（亮暗双模式随系统） |
| 托管 | GitHub Pages（`zhan-zip.github.io/zhan-blog`） |
| 评论 | Twikoo（Hugging Face Space 后端） |
| 联系表单 / 订阅 | GitHub Actions → SMTP |
| 搜索 | Pagefind（离线索引） |

## 开发命令

```bash
pnpm install       # 安装依赖
pnpm dev           # 本地开发（http://localhost:4321）
pnpm build         # 构建（含 pagefind 索引）
pnpm preview       # 预览构建产物
pnpm new-post      # 生成新文章模板
```

> 要求 Node ≥ 20、pnpm ≥ 9。

## 目录结构

```
src/content/posts/    # 🟢 文章（Markdown，用户编辑区）
public/               # 🟢 图片等静态资源（用户编辑区）
src/components/       # 可复用组件（代码区）
src/pages/            # 路由页面（代码区）
.github/workflows/    # GitHub Actions（部署 / 表单 / 订阅）
```

**编辑分工**：`src/content/` 与 `public/` 归内容作者直接编辑；其余代码按需由 Claude Code 维护。

## 相关文档

- [zhan-blog-project-summary.md](./zhan-blog-project-summary.md) —— 项目交接文档（定位 / 架构 / 设计决策）
- [实施计划.md](./实施计划.md) —— 里程碑实施计划

> 基于 fuwari（MIT License）改造。
