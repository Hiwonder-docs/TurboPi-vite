# 多版本文档部署流程（4-Line-Follower-vite）

> 适用于同一个 GitHub 仓库支持多个文档版本（如 GPIO 版本、I2C 版本）的场景。
> 每个版本独立构建，共享同一个 `main` 分支，通过宝塔 Nginx 反向代理统一对外提供服务。

---

## 架构说明

```
GitHub 仓库：4-Line-Follower-vite（单一仓库）
    │
    ├── content/                    ← 两个版本的源文件
    │   ├── gpio-version/
    │   │   ├── docs/               ← GPIO 版本的 Markdown
    │   │   └── _static/            ← GPIO 版本的静态资源
    │   └── i2c-version/
    │       ├── docs/               ← I2C 版本的 Markdown
    │       └── _static/            ← I2C 版本的静态资源
    │
    ├── projects/                   ← 构建产物（同时包含两个版本）
    │   └── 4-Ch-Knob-Line-Follower/
    │       └── en/
    │           ├── gpio-version/   ← 第一个版本
    │           │   ├── assets/
    │           │   ├── docs/
    │           │   └── index.html
    │           └── i2c-version/   ← 第二个版本
    │               ├── assets/
    │               ├── docs/
    │               └── index.html
    │
    └── docs/                        ← VitePress 工作目录
    │   └── .vitepress/
    │       └── config.mts          ← 构建时通过环境变量动态配置
    │
    └── scripts/
        └── build_version.mjs       ← 多版本构建脚本

访问地址：
- GPIO 版本：https://wiki-test.hiwonder.com/projects/4-Ch-Knob-Line-Follower/en/gpio-version/
- I2C 版本：https://wiki-test.hiwonder.com/projects/4-Ch-Knob-Line-Follower/en/i2c-version/
```

---

## 占位符说明

| 占位符 | 含义 | 示例值 |
|--------|------|--------|
| `<项目名>` | URL 路由中的项目标识 | `4-Ch-Knob-Line-Follower` |
| `<仓库名>` | GitHub 仓库名称 | `4-Line-Follower-vite` |
| `<版本1>` | 第一个版本标识 | `gpio-version` |
| `<版本2>` | 第二个版本标识 | `i2c-version` |

---

## 第一步：准备文档内容

### 1.1 放置 Markdown 文件

将各版本的 Markdown 文件放入对应目录：

```bash
# GPIO 版本
content/gpio-version/docs/*.md

# I2C 版本
content/i2c-version/docs/*.md
```

### 1.2 放置静态资源

将各版本的图片等资源放入对应目录：

```bash
# GPIO 版本
content/gpio-version/_static/**/*

# I2C 版本
content/i2c-version/_static/**/*
```

> ⚠️ 文件命名保持原样（如 `2.xxx.md`、`media/xxx.jpg`），构建时会自动处理路径。

---

## 第二步：本地构建验证

在仓库根目录执行：

```bash
# 安装依赖（首次需要）
npm ci

# 构建所有版本
npm run build:all

# 或单独构建某个版本
npm run build:gpio
npm run build:i2c
```

构建完成后，检查产物结构：

```
projects/4-Ch-Knob-Line-Follower/en/
├── gpio-version/
│   ├── assets/
│   ├── docs/
│   └── index.html
└── i2c-version/
    ├── assets/
    ├── docs/
    └── index.html
```

### 关键检查

打开 `projects/4-Ch-Knob-Line-Follower/en/<版本>/index.html`，确认 CSS 路径正确：

```
/projects/4-Ch-Knob-Line-Follower/en/<版本>/assets/xxx.css
```

### 本地预览

```bash
# 启动开发服务器
npm run dev

# 访问
# GPIO: http://localhost:4173/4-Ch-Knob-Line-Follower/en/gpio-version/
# I2C: http://localhost:4173/4-Ch-Knob-Line-Follower/en/i2c-version/
```

---

## 第三步：提交并推送到 GitHub

```bash
# 添加所有文件（projects/、docs/、scripts/ 等）
git add -A

# 提交
git commit -m "update: 更新 <版本1>/<版本2> 版本文档"

# 推送到 main 分支
git push origin main
```

> ⚠️ 确保 `.gitignore` 包含 `node_modules/` 和 `docs/.vitepress/dist/`。

---

## 第四步：配置 GitHub Pages

1. 打开 GitHub 仓库 → **Settings** → **Pages**
2. **Source**: `Deploy from a branch`
3. **Branch**: `main` / `root`
4. **不要绑定自定义域名**（Custom domain 留空）

等待几分钟，验证 GitHub Pages 直连：

```
https://hiwonder-docs.github.io/4-Line-Follower-vite/projects/4-Ch-Knob-Line-Follower/en/gpio-version/
https://hiwonder-docs.github.io/4-Line-Follower-vite/projects/4-Ch-Knob-Line-Follower/en/i2c-version/
```

---

## 第五步：配置宝塔 Nginx 反向代理

登录宝塔面板 → `wiki-test.hiwonder.com` 站点 → **设置** → **配置文件**，在 `server {}` 块内追加：

```nginx
# 4-Ch-Knob-Line-Follower - GPIO 版本
location ^~ /projects/4-Ch-Knob-Line-Follower/en/gpio-version/ {
    proxy_pass https://hiwonder-docs.github.io/4-Line-Follower-vite/projects/4-Ch-Knob-Line-Follower/en/gpio-version/;
    proxy_set_header Host hiwonder-docs.github.io;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_ssl_server_name on;
}

# 4-Ch-Knob-Line-Follower - I2C 版本
location ^~ /projects/4-Ch-Knob-Line-Follower/en/i2c-version/ {
    proxy_pass https://hiwonder-docs.github.io/4-Line-Follower-vite/projects/4-Ch-Knob-Line-Follower/en/i2c-version/;
    proxy_set_header Host hiwonder-docs.github.io;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_ssl_server_name on;
}
```

**保存并重载 Nginx**。

> ⚠️ `proxy_pass` 后面不要加反引号，直接写 URL，以分号 `;` 结尾。

---

## 第六步：验证访问

```
https://wiki-test.hiwonder.com/projects/4-Ch-Knob-Line-Follower/en/gpio-version/
https://wiki-test.hiwonder.com/projects/4-Ch-Knob-Line-Follower/en/i2c-version/
```

- 页面能正常打开，样式正常 → 部署成功
- 导航栏版本切换器可在两个版本间跳转
- 图片显示正常

---

## 构建脚本说明

### `package.json` 命令

```json
{
  "scripts": {
    "dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:stage-main": "node scripts/stage_main_site.mjs",
    "build:gpio": "node scripts/build_version.mjs gpio-version",
    "build:i2c": "node scripts/build_version.mjs i2c-version",
    "build:all": "npm run build:gpio && npm run build:i2c"
  }
}
```

### `build_version.mjs` 工作流程

1. 从 `content/<版本>/docs/` 复制 Markdown 到 `docs/docs/`
2. 从 `content/<版本>/_static/` 复制静态资源到 `docs/_static/`
3. 设置环境变量 `DOCS_BASE` 和 `DOCS_VERSION`
4. 执行 `vitepress build`
5. 将构建产物整理到 `projects/<项目名>/en/<版本>/`

### `config.mts` 关键配置

```typescript
// 第 15 行 - base 路径
const docsBase = normalizeBase(
  process.env.DOCS_BASE || '/projects/4-Ch-Knob-Line-Follower/en/gpio-version/'
)

// 第 16 行 - 当前版本
const currentVersion = process.env.DOCS_VERSION || 'gpio-version'

// 版本切换器导航
nav: [
  {
    text: 'Version',
    items: [
      { text: 'GPIO Version', link: '/projects/4-Ch-Knob-Line-Follower/en/gpio-version/' },
      { text: 'I2C Version', link: '/projects/4-Ch-Knob-Line-Follower/en/i2c-version/' }
    ]
  },
  { text: 'Home', link: '/' }
]
```

---

## 快速检查清单

- [ ] `content/<版本>/docs/` 下的 Markdown 已准备好
- [ ] `content/<版本>/_static/` 下的静态资源已准备好
- [ ] `npm run build:all` 构建成功
- [ ] `projects/4-Ch-Knob-Line-Follower/en/` 下同时包含两个版本目录
- [ ] 每个版本的 `index.html` CSS 路径正确
- [ ] GitHub 仓库已推送
- [ ] GitHub Pages 配置为 `main` / `root`
- [ ] GitHub Pages 直连可访问
- [ ] Nginx 已添加两条 `location` 规则
- [ ] Nginx 已重载
- [ ] 两个版本的 `wiki-test.hiwonder.com` 地址都可正常访问

---

## 常见问题

### Q1: 版本切换器跳转后链接不对

**原因**：`config.mts` 中 `nav` 配置的链接路径错误。

**检查**：
- 确认 `nav` 中的 `link` 是绝对路径（以 `/` 开头）
- 确保路径格式：`/projects/<项目名>/en/<版本>/`

### Q2: 页面能打开但 CSS 丢失

**原因**：`DOCS_BASE` 环境变量未正确设置，或构建产物路径错误。

**检查**：
1. 打开 `projects/<项目名>/en/<版本>/index.html`，检查 CSS 路径
2. 确认 `base` 配置为 `/projects/<项目名>/en/<版本>/`
3. 重新执行 `npm run build:all`

### Q3: 版本切换器样式没生效

**原因**：修改 CSS 后没有重新构建。

**解决**：修改 `custom.css` 后必须重新执行 `npm run build:all`。

### Q4: 新增版本需要改哪些文件

只需修改以下 3 处：

1. **`config.mts`**：在 `nav` 中添加新版本链接
2. **创建源文件目录**：`content/<新版本>/docs/` 和 `content/<新版本>/_static/`
3. **`build_version.mjs`**：在脚本中添加新版本的构建支持

### Q5: Nginx 配置报错

**常见原因**：
- `proxy_pass` URL 被反引号包裹
- 仓库名和项目名混淆
- location 规则没有 `^~` 前缀

**正确示例**：
```nginx
location ^~ /projects/4-Ch-Knob-Line-Follower/en/gpio-version/ {
    proxy_pass https://hiwonder-docs.github.io/4-Line-Follower-vite/projects/4-Ch-Knob-Line-Follower/en/gpio-version/;
    proxy_set_header Host hiwonder-docs.github.io;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_ssl_server_name on;
}
```

---

## 项目文件结构

```
4-Line-Follower-vite/
├── content/                        ← 源文件（你放文档的地方）
│   ├── gpio-version/
│   │   ├── docs/
│   │   │   └── *.md
│   │   └── _static/
│   │       └── media/
│   └── i2c-version/
│       ├── docs/
│       │   └── *.md
│       └── _static/
│           └── media/
├── docs/
│   ├── .vitepress/
│   │   ├── config.mts              ← VitePress 配置（自动读取环境变量）
│   │   ├── autoSidebar.mts
│   │   └── theme/
│   │       ├── Layout.vue          ← 版本切换器注入逻辑
│   │       ├── custom.css          ← 版本切换器样式
│   │       └── ...
│   ├── docs/                       ← 构建时临时存放 Markdown
│   ├── _static/                    ← 构建时临时存放资源
│   ├── public/
│   └── index.md
├── scripts/
│   ├── build_version.mjs           ← 多版本构建脚本（核心）
│   └── stage_main_site.mjs         ← 构建产物整理
├── projects/                       ← 构建产物
│   └── 4-Ch-Knob-Line-Follower/
│       └── en/
│           ├── gpio-version/
│           └── i2c-version/
├── .nojekyll
├── .gitignore
├── index.html                      ← 版本选择页
├── package.json
├── package-lock.json
└── README.md
```
