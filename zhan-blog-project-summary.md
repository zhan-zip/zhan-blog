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
**字体**：中文思源黑体系（PingFang SC / 微软雅黑 / Noto Sans SC 系统栈）+ 英文 Inter + 代码 JetBrains Mono
**界面语言**：**全中文**（fuwari UI 文案经 i18n 切 `zh_CN`，作者/简介/页脚等硬编码文案改中文；2026-08-11 用户确认）
**氛围**：圆角卡片 8-12px、轻阴影、克制留白；**不用玻璃拟态**

### 4.4 评论系统：Twikoo（非 Giscus/Gitalk/Waline）

* **弃用 Giscus/Gitalk**：需访客登录 GitHub，国内访客被挡在门外
* **暂缓 Waline**：功能全但默认 Vercel 域名被污染，必须绑自定义域名，现阶段无域名
* **选定 Twikoo**：匿名、免费、配置简单
* **后端部署：Zeabur（2026-08-11 用户选定）** —— 用 fork 的 `zhan-zip/twikoo-zeabur` 仓库部署，需配 MongoDB（否则重启丢数据）；弃 Hugging Face（需另注册 MongoDB Atlas 且邮件通知被屏蔽）、弃 Railway（国内访问较慢）

### 4.6 评论部署平台调研（2026-08-11，选型留档，供以后参考）

Twikoo 后端部署平台逐一调研结论：

| 平台 | 结论 |
|------|------|
| **Hugging Face Space** | Twikoo 官方支持（Docker `FROM imaegoo/twikoo`，配 MongoDB）。免费。**但无邮件通知**（HF 屏蔽 Twikoo 邮件端口）；需注册 HF + MongoDB Atlas，2026-08-11 实测本机 QQ 邮箱收不到 HF 验证邮件，账号拿不回，卡住 |
| **Zeabur** | 国内友好，Twikoo 官方模板一键部署（含 MongoDB），有邮件通知；**基础订阅 $5/月**（14 天免费试用后） |
| **腾讯云 CloudBase** | 国内节点快、有邮件通知、功能全；**基础版 6.9 元/月**，需实名 + 手机验证 |
| **Railway** | Twikoo 官方支持，免费额度（约 $5/月内）不扣费，有邮件通知；**需绑银行卡**，国内访问可能慢 |
| **LeanCloud 国内版 + Valine** | 免费开发版，但**需已备案域名 + 独立 IP（约 ¥50/月）**，2026 已公告停服风险 |
| **LeanCloud 国际版 + Valine** | 免费、匿名、无需备案；**已停止新账号注册**（2026-08-11 实测） |
| **Giscus / utterances** | 免费无后端，但**访客必须登录 GitHub**，国内访客大多没有，弃用 |

**结论**：免费、国内可用、无需绑卡、能注册的评论方案在 2026-08 **基本不存在**。评论功能**暂缓**，等有预算（腾讯云 6.9 元/月）或新平台出现后再接。
前端评论组件已就绪：文章页已接入 Twikoo（`config.ts` 的 `commentConfig`），届时只需填 `envId` + `enable: true`。

> 参考来源：Twikoo 官方部署文档（HF/腾讯云/Railway）、LeanCloud 官方公告。

### 4.7 技术选型决策详解（2026-08-11 ~ 2026-08-12，记录每个决策的完整过程）

> 本节按时间顺序记录每个选型的「背景 → 尝试过什么 → 为什么放弃/选择」，供以后复用。

**① 框架：Astro**
- 背景：要「可定制 + 前端交互效果 + 扩展性」，不要纯文字博客
- 对比：Hugo（构建快但定制要 Go 模板、交互难做）、Hexo（中文生态好但主题定制麻烦）
- 选择：**Astro**（社区热度高、组件化、可嵌交互组件）
- 落地：fuwari 主题起步（先主题后自研）

**② 主题：fuwari 起步**
- 用户拍板「先现成主题改造 → 后期逐步自研」
- fuwari 自带：亮暗切换、搜索（Pagefind）、代码高亮、多语言（含中文包）、归档/标签/分类

**③ 视觉改造（多次迭代）**
- 界面中文化：fuwari 自带 zh_CN 语言包，切 `lang: "zh_CN"` 即全部 UI 中文；硬编码文案（页脚/按钮 aria）逐个改中文
- 配色：最初 hue 240（蓝）→ 用户要「黑白分明 + 蓝青」→ 亮色纯白背景、暗色近纯黑、强调蓝青 hue 210；青色要多加 → 增青到 210
- 主题色滑块：先固定（fixed:true）→ 用户要求恢复滑块（fixed:false）
- 字体：fuwari 用 Roboto → 引入 Inter（`@fontsource-variable/inter`）+ 中文字体栈（PingFang/微软雅黑/Noto Sans SC）
- 间距：用户明确「组件不要挨太近」→ 全局加大 gap/区块间距/卡片内边距

**④ 评论系统（暂缓）**：详见 4.6，逐平台调研后**免费可用方案全走完**，暂缓。

**⑤ 联系表单：Web3Forms**
- 背景：访客留言直发博主邮箱
- 尝试：GitHub Actions（前端无法安全持有 token 触发，放弃）→ OAuth device flow（GitHub 授权端点无 CORS，浏览器调不了，放弃）→ **Web3Forms**（第三方表单服务，前端直接 POST，免费 250 次/月，access_key 公开安全）
- 用户想「小号邮箱发信」：无服务器做不到（发件人是服务商），接受第三方直发

**⑥ 数据统计：Umami Cloud**
- 选 Umami（开源、隐私友好）而非百度统计（需要注册国内账号）
- **用 GitHub 一键注册**绕开邮箱验证（HF 卡在邮箱的教训）
- API 访问需 Pro（免费版不开放）→ 用**共享仪表盘 iframe 嵌入后台**（免费可用）

**⑦ 无后端内容后台（/admin）**
- 需求：博主自己发文章，无服务器
- 尝试：OAuth device flow（GitHub 授权端点不支持浏览器 CORS，放弃）→ **PAT**（classic token，`repo` scope，存浏览器 localStorage，绝入库）
- 发布：GitHub Contents API 直接写 `src/content/posts/*.md`，触发自动部署

**⑧ 写文章页编辑器（多次推翻）**
- 背景：用户要「像 HorseMD 那样」的富文本编辑体验
- v1 textarea + markdown-it 实时预览：可靠但无工具栏
- v2 集成 CodeMirror（HorseMD 内核）：语法高亮有了，但**拖选在 Edge 真实环境异常**（左右拖只移光标、上下拖选整行），自动化环境无法复现，排查多轮后放弃
- v3 textarea + 手动格式化工具栏：选中弹工具栏包裹语法，但**嵌套格式化在 Markdown 源码模式下有天然局限**（部分已斜体再整句斜体会错乱）
- v4 **集成 Editor.md**（参考 `E:\blog\Aesthetica`）：完整工具栏 + CodeMirror + 分屏实时预览，成熟方案，用户满意
- 教训：用户要的是「所见即所得富文本编辑体验」，**纯 Markdown 源码包裹语法无法满足嵌套格式化**，应直接选成熟编辑器（Editor.md 这类）

### 4.5 联系表单：Web3Forms（2026-08-11 调整，原 GitHub Actions 方案因「前端无法安全触发 Actions」放弃）

访客表单 → Web3Forms（免费 250 次/月）→ 直发博主邮箱（2899893413@qq.com）。

- 前端 JS 直接 POST `api.web3forms.com/submit`，`access_key` 公开安全（等同邮箱别名，可放前端）
- **弃 GitHub Actions 原因**：前端安全持有 token 才能触发 `repository_dispatch`，token 暴露即泄露，不可行
- 备选：mailto 组装（访客自己发）作为国内访问不可用时的兜底
- 邮件订阅：暂未实现，后续需要时再单独设计

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
│   │   ├── projects/               ←   项目展示数据（.md，frontmatter 见第八节）
│   │   └── spec/                   ←   页面内容（about 关于 / home 首页 Hero / services 服务 / contact 联系文案）
│   ├── pages/                      ← 路由页面（index/projects/services/about/contact/archive/posts/admin）
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

* 前端：文章页 `[...slug].astro` 已加 Twikoo 评论区（`config.ts` 的 `commentConfig` 控制 enable/envId）
* 后端：Zeabur 部署（fork 仓库 `zhan-zip/twikoo-zeabur`），配 MongoDB，绑定 `*.zeabur.app` 域名
* 前端 `commentConfig.envId` = Zeabur 域名（如 `https://xxx.zeabur.app`），填好后 `enable: true`
* 后台管理：评论区右下角齿轮设置管理密码，可管理评论/反垃圾/邮件通知

### 6.5 联系表单（Web3Forms）

* 表单 POST `api.web3forms.com/submit` → 直发博主邮箱（2899893413@qq.com）
* `access_key` 存前端（公开安全），无需后端 / 密钥 / SMTP
* 前端「提交中 / 成功 / 失败」三态反馈 + `botcheck` 蜜罐防垃圾
* 联系渠道卡片：邮箱支持「写信（mailto）」+「一键复制」
* 邮件订阅：暂未实现，后续需要时再设计

### 6.6 交互效果清单（用户要"不纯文字"）

滚动渐入动画 / 平滑滚动 / 亮暗切换 / 返回顶部 / 卡片 hover 抬升 / 代码块复制 + 行号高亮 / 阅读进度条 / 目录跟随滚动高亮

### 6.7 数据统计：Umami Cloud（2026-08-12 接入）

- **Umami Cloud 免费版**（Hobby，$0/月，10 万 events/月，1 个网站）
- **注册方式**：用 GitHub 一键注册（绕开邮箱验证），关联账号 2899893413@qq.com
- **网站**：zhan-Blog，Website ID `d550f252-7127-439a-b72e-b32a42f4baa1`，数据区域 US
- **脚本**：`<script defer src="https://cloud.umami.is/script.js" data-website-id="d550f252-7127-439a-b72e-b32a42f4baa1">` 已加在 `Layout.astro` head
- **国内访问实测**：script.js 200（~1.5s），页面访问已成功上报（gateway.umami.is/api/send）
- **管理后台**：cloud.umami.is（GitHub 登录），看访客/来源/页面/设备等
- **伪后台集成**：Umami 共享仪表盘已 iframe 嵌入 `/admin/` 的「数据统计」区块（Share URL `https://cloud.umami.is/share/CTzVRIgXe4jtM1i8`，免费版可用）
- ⚠️ Umami Cloud **API 访问需 Pro 计划**（免费版不开放 API），故无法用 API 拉数到后台，改用 iframe 共享链接
- 注意：Hobby 免费版仅 1 个网站、6 个月数据保留

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

项目数据（`src/content/projects/*.md`）：

```yaml
---
title: 项目名称        # 必填
description: 一句话描述  # 可选
image: /images/xxx.png # 可选，封面图路径
tech: [Astro, Vue]     # 可选，技术栈数组
url: https://...       # 可选，在线访问链接
github: https://...    # 可选，GitHub 仓库链接
status: 建设中          # 可选，状态标签
featured: true         # 可选，是否出现在首页「精选项目」
---
```

> 服务页当前为代码内硬编码（`src/pages/services.astro`），后续可改为 content 驱动。

### 内容管理后台（2026-08-11 新增）

- 地址：`/zhan-blog/admin/`，无后端，纯 GitHub Contents API
- 写文章在独立页 `/admin/new-post/`（无侧边栏，Markdown 实时预览，用 markdown-it CDN）
- 博主在**自己浏览器**填一次 GitHub PAT（classic，`repo` scope，只存 localStorage 不入库），即可在页面写文章 → 直接提交 `src/content/posts/*.md` 到 main → 自动部署
- ⚠️ 曾试 OAuth device flow：GitHub 授权端点不支持浏览器 CORS，无法纯前端换 token，故用 PAT
- ⚠️ 安全：PAT 有 `repo` 权限，绝不写入源码/仓库；泄露则去 GitHub 撤销

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

***

## 十三、迭代记录（每轮工作追加，参考 qq-ai 文档风格）

### 2026-08-11 第一轮：建站到可写
- **建仓**：`zhan-zip/zhan-blog`（public，main），初始提交交接文档 + 实施计划
- **骨架**：引入 fuwari（Astro），`pnpm build` 通过；清理模板 .github/vercel.json；站点配置 `zhan-zip.github.io/zhan-blog`（base `/zhan-blog/`）
- **部署**：deploy.yml + Pages（workflow 构建）上线
- **中文化**：`lang: "zh_CN"` + 硬编码文案改中文
- **配色**：黑白分明 + 蓝青 hue210（用户多次反馈迭代）
- **项目内容**：从 TreaWork 收集食光记/QQ机器人/灵感笔记，写入 projects collection；邮箱 2899893413@qq.com
- **表单**：Web3Forms 接入（access_key 41755341...）
- **无后端后台**：/admin + GitHub PAT（ghp_1Bu...，30 天到期 2026-09-10）

### 2026-08-12 第二轮：统计 + 写文章页编辑器（重点迭代）
- **统计**：Umami Cloud（GitHub 一键注册），脚本接入，共享仪表盘 iframe 嵌入后台
- **六页内容化**：首页/服务/联系文案改为 spec/*.md 驱动
- **写文章页编辑器**（多轮）：
  1. textarea + markdown-it 预览（可靠）
  2. CodeMirror（HorseMD 内核）→ Edge 拖选异常，放弃
  3. textarea + 手动格式化工具栏 → Markdown 嵌套局限，放弃
  4. **Editor.md**（参考 E:\blog Aesthetica）→ 完整工具栏 + 分屏预览，采纳
- **决策思路详解**：见 4.7（本此补充）

### 2026-08-12 第三轮：图片上传 + 构建稳定修复
- **功能**：写文章页图片支持**本地选图上传**（点工具栏图片按钮 → 本地文件选择 → 上传 GitHub `public/images/` → 插入图片链接）；`toolbarHandlers` 对 image dialog 不生效，改用 `onload` 按 title 重绑按钮
- **bug 修复**：fuwari `markdown.css` 的 `@apply link`（依赖 main.css 的自定义类）导致 **CI/本地构建偶发失败**（部署翻车）→ 去掉 `link`，构建稳定（连续构建通过）
- **bug 修复**：图片文件名含中文会带来部署/URL 风险 → 上传文件名只保留 ASCII
- **说明**：图片上传到 GitHub 后，本地预览看不到是正常的（图片在远程、本地无此文件），**线上部署完成（约 2 分钟）后可见**；应在线上 admin 或部署后查看
- **bug 修复**：**发布按钮在 `<form>` 外**（重构布局时按钮挪到编辑区下方），点击不触发表单提交 → 按钮 `type="button"` + 点击时 `form.requestSubmit()` 手动触发
- **bug 修复**：重复发布同名文章时报 `Invalid request. "sha" wasn't supplied`（GitHub 更新已有文件需带当前版本 sha）→ 发布前先 GET 查文件是否存在，存在则 PUT 带 sha 更新
- **功能**：表单验证 + 发布状态改为**屏幕顶部 toast 提示**（字段 `novalidate` 禁用原生验证，由 JS 接管；发布成功弹「已提交，正在部署」）
- **排查**：归档页空白是 **dev Vite 依赖缓存过期（504 Outdated Optimize Dep）**，清 `node_modules/.vite` 重启即恢复；线上为构建产物不受影响
- **功能**：后台支持**编辑 / 删除已发布文章**（列表加编辑/删除操作；编辑跳写文章页加载该文章内容，改完发布更新；删除需确认后调 DELETE API）
- 已推送 commit：图片上传 `987856c`、图片按钮修复 `37913c4`、构建根治 `ea2df2a`、发布按钮修复（待推送）、文档 `58d6525`
