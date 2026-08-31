# Zhan-Blog

个人技术博客 —— **记录项目经历、写技术教程、承接 Web 开发 / 全栈 + Agent / 课程设计**。

基于 [Astro](https://astro.build) + [fuwari](https://github.com/saicaca/fuwari) 模板改造的个人品牌站，已上线运行。

## 在线访问

🔗 [https://zhan-zip.github.io/zhan-blog/](https://zhan-zip.github.io/zhan-blog/)

## 站点特色

- **个人品牌站**：首页 3 秒传达「我是谁、能做什么、怎么联系我」，独立服务页承接咨询与接单
- **内容与代码分离**：文章 / 项目 / 服务等全部用 Markdown 编辑（`src/content/`），无需懂代码
- **无后端架构**：GitHub Pages 托管 + GitHub Actions 部署，零服务器成本
- **亮暗双模式**：随系统自动切换
- **离线搜索**：Pagefind 构建时生成索引，站内搜索零后端
- **代码体验**：代码高亮 + 行号 + 折叠 + 一键复制、阅读进度条、目录跟随、KaTeX 数学公式、GitHub 卡片、提示块（admonition）
- **联系与转化**：Web3Forms 联系表单直发邮箱、邮件订阅（本地脚本 + SMTP）
- **数据统计**：Umami Cloud（隐私友好）
- **无服务器后台**：`/admin` 用 GitHub API 直写文章（含 Editor.md 富文本编辑器）

## 技术栈

| 项 | 方案 |
|----|------|
| 框架 | Astro（SSG）+ fuwari 模板 |
| 样式 | Tailwind + 自定义配色（黑白 + 蓝青） |
| 动画 | swup（页面切换 + 平滑滚动） |
| 搜索 | Pagefind（离线索引） |
| 代码高亮 | expressive-code（行号 / 折叠 / 复制） |
| 数学 | KaTeX |
| 托管 | GitHub Pages（`zhan-zip.github.io/zhan-blog`） |
| 表单 / 订阅 | Web3Forms + 本地 Node 脚本（SMTP） |
| 统计 | Umami Cloud |

## 开发命令

```bash
pnpm install       # 安装依赖
pnpm dev           # 本地开发（http://localhost:4321/zhan-blog/）
pnpm build         # 构建（含 pagefind 索引）
pnpm preview       # 预览构建产物
```

> 要求 Node ≥ 20、pnpm ≥ 9。

## 目录结构

```
src/content/          # 🟢 内容区（Markdown，用户直接编辑）
  posts/              文章
  projects/           项目展示
  spec/               页面内容（首页/服务/联系/推荐）
src/pages/            # 路由页面
src/components/       # 可复用组件（含订阅表单）
public/               # 🟢 图片等静态资源
scripts/              # 本地脚本（邮件订阅 / 新文章模板）
.github/workflows/    # GitHub Actions（部署）
```

**编辑分工**：`src/content/` 与 `public/` 归内容作者直接编辑；其余代码按需维护。

## 相关文档

项目交接文档、内容编辑指南、订阅配置均在本地 `docs/` 文件夹（含敏感信息，不提交 GitHub）。

## 许可

基于 [fuwari](https://github.com/saicaca/fuwari)（MIT License）改造。
