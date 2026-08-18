# 博客使用说明

本仓库使用 [Hexo](https://hexo.io/) + [ParticleX](https://github.com/theme-particlex/hexo-theme-particlex) 主题。

| 分支     | 内容                                                          |
| -------- | ------------------------------------------------------------- |
| `hexo`   | 博客源码（文章 Markdown、配置、主题），日常只改这个分支        |
| `master` | GitHub Actions 自动生成的静态站点，GitHub Pages 读取，别手改  |

## 1. 本地环境

需要 Node.js 18 或 20。

```bash
git clone -b hexo https://github.com/HanMingZhou/hanmingzhou.github.io.git
cd hanmingzhou.github.io
npm install
```

本地预览（默认 http://localhost:4000 ，改动 Markdown 会自动刷新）：

```bash
npm run server
```

生成静态文件到 `public/`（一般不需要手动执行，Actions 会做）：

```bash
npm run clean && npm run build
```

## 2. 新增一篇博客

```bash
npx hexo new "文章标题"
```

会生成 `source/_posts/文章标题.md`。文件名就是 URL 之外的标识，中文文件名也可以，但建议用英文短横线命名。

编辑开头的 Front-Matter：

```yaml
---
title: 文章标题
date: 2025-01-01 12:00:00
tags:
    - 美剧
    - Life
categories:
    - 生活
description: |
    首页上显示的摘要，支持 Markdown，可省略
pinned: 0 # 置顶权重，数字越大越靠前，默认 0
---
正文从这里开始……
```

要点：

-   `tags` / `categories` 可写多个，页面 `分类`、`标签` 会自动汇总，不用手动维护。
-   摘要有两种写法：Front-Matter 里写 `description`，或者在正文中插入 `<!-- more -->`，`<!-- more -->` 之前的内容作为摘要。
-   文章链接形式是 `/posts/<abbrlink>/`，`abbrlink` 由 `hexo-abbrlink` 根据标题自动生成。**已发布文章不要删掉它 Front-Matter 里已有的 `abbrlink`**，否则链接会变。新文章不用写，第一次生成后会自动写入。
-   草稿：`npx hexo new draft "标题"` 生成在 `source/_drafts/`，不会发布；写好后 `npx hexo publish "标题"` 转正。

## 3. 插入图片

三种方式，按需选择。

### 3.1 文章专属图片（推荐）

已开启 `post_asset_folder: true`，所以 `npx hexo new` 时会同时生成一个和文章同名的目录，把图片放进去即可：

```
source/_posts/my-post.md
source/_posts/my-post/cover.jpg
```

正文里直接用相对路径引用：

```markdown
![封面](cover.jpg)
```

### 3.2 全站公用图片

放到 `source/images/`，用绝对路径引用：

```markdown
![头像](/images/avatar.jpg)
```

头像 `source/images/avatar.jpg`、首页背景 `source/images/background.jpg` 就在这里，直接替换同名文件即可换掉。

### 3.3 外链图床

直接写完整 URL：

```markdown
![示意图](https://files.catbox.moe/kusadf.png)
```

## 4. 站点与主题配置

-   `_config.yml`：站点配置（标题、副标题、作者、时区、链接格式、每页文章数等）。
-   `_config.particlex.yml`：主题配置（头像、背景、导航菜单、首页卡片文案与图标链接、页脚、代码高亮样式、数学公式、搜索、评论系统等）。这个文件会覆盖 `themes/particlex/_config.yml`，**改配置请改这里，不要改主题目录里的文件**，方便以后升级主题。

导航栏、卡片里的图标名取自 [Font Awesome 6](https://fontawesome.com/icons)，`name` 填图标名，`theme` 填 `solid` / `regular` / `brands`。

### 4.1 评论（giscus，GitHub 账号登录）

评论存放在本仓库的 Discussions 里，读者用 GitHub 账号登录即可评论。启用步骤：

1. 仓库 Settings → General → Features 勾选 **Discussions**。
2. 安装 [giscus App](https://github.com/apps/giscus) 并授权本仓库。
3. 打开 [giscus.app](https://giscus.app)，填入 `HanMingZhou/hanmingzhou.github.io`，选择「Discussion 分类」（建议 `Announcements`），把生成代码里的 `data-category-id` 复制到 `_config.particlex.yml` 的 `giscus.categoryID`。
4. 把 `giscus.enable` 改为 `true`，push 到 `hexo` 分支。

`repo` 与 `repoID` 已经填好，`mapping: pathname` 表示按文章路径对应一条 Discussion。

### 4.2 访问量统计

由 [Vercount](https://vercount.one)（不蒜子的替代品，免注册）提供：页脚显示站点总访问量与访客数，文章页显示该篇阅读次数。开关在 `_config.particlex.yml` 的 `visitors`。本地 `hexo server` 下统计的是 `localhost` 的数据，属正常现象。

### 4.3 预计阅读时间

由 `hexo-symbols-count-time` 插件统计正文字数并换算：文章页显示「字数 + 预计阅读时间」，首页列表显示预计阅读时间。开关在 `_config.particlex.yml` 的 `readTime`，换算参数（`awl` 每词字符数、`wpm` 每分钟词数、`suffix` 后缀）在 `_config.yml` 的 `symbols_count_time`。

### 4.4 音乐播放器

右下角固定的 [APlayer](https://aplayer.js.org) 迷你播放器，歌单通过 Meting 接口解析。在 `_config.particlex.yml` 的 `music` 中配置：

-   `id`：网易云歌单 ID（歌单链接 `music.163.com/#/playlist?id=xxxx` 中的数字），`server` 可换 `tencent`、`kugou` 等，`type` 可为 `playlist` / `song` / `album`。
-   `mini`、`fixed`、`autoplay`、`volume`、`order`、`loop`：播放器外观与播放行为（浏览器策略会阻止未交互时自动播放，`autoplay` 建议保持 `false`）。
-   `lrc`：滚动歌词，默认关闭；打开后歌词会浮在页面右下角，长页面底部可能与页脚重叠。
-   `audio`：想固定几首歌、不依赖第三方接口时，直接写 `name` / `artist` / `url` / `cover` 列表，优先级高于 `id` 歌单。

其他评论系统（Gitalk / Waline / Twikoo）同样在 `_config.particlex.yml` 中把对应块 `enable` 改为 `true` 并填参数，参数含义见[主题文档](https://github.com/theme-particlex/hexo-theme-particlex#34-评论配置)。

升级主题：

```bash
cd themes/particlex && git pull   # 或重新下载覆盖，配置在仓库根目录不受影响
```

## 5. 部署

推送到 `hexo` 分支即自动部署，不需要在本地执行 `hexo deploy`：

```bash
git add .
git commit -m "post: 新增文章 xxx"
git push origin hexo
```

流程：GitHub Actions（[.github/workflows/deploy.yml](.github/workflows/deploy.yml)）在 `hexo` 分支上 `npm ci` → `hexo generate` → 把 `public/` 推送到 `master` 分支（`force_orphan`，每次都用最新产物完全覆盖 `master`，不保留旧历史）→ GitHub Pages 发布 https://hanmingzhou.github.io 。一般 1-2 分钟生效，可在仓库 Actions 页查看进度。

首次使用需要确认两个仓库设置：

1. Settings → Actions → General → Workflow permissions 选 **Read and write permissions**（否则 Actions 无法推送到 `master`）。
2. Settings → Pages → Source 选 **Deploy from a branch**，分支 `master`，目录 `/ (root)`。

也可以在 Actions 页面手动触发 `Deploy Blog`（workflow_dispatch）重新发布。

## 6. 常见问题

-   **改了内容但网站没变**：先看 Actions 是否成功；浏览器强制刷新（Ctrl+F5）；Pages 有几十秒缓存。
-   **本地代码块样式不对**：ParticleX 用 Highlight.js，Hexo 自带高亮已在 `_config.yml` 中通过空的 `syntax_highlighter:` 关闭，不要再打开。
-   **文章不显示**：检查 Front-Matter 的 `date` 是否是未来时间、文件是否在 `source/_posts/` 下、YAML 缩进是否正确。
-   **改完配置没生效**：`npm run clean` 清缓存后重新 `npm run server`。
