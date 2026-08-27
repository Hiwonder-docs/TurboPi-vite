# TurboPi Documentation

This repository contains the TurboPi VitePress documentation site. The source
files for each version are stored under `content/standard/` and
`content/advanced/`.

## Local development

Install dependencies and start a version-specific documentation server:

```bash
npm ci
npm run dev:standard
npm run dev:advanced
```

The legacy VitePress command still works against the current `docs/` working
copy:

```bash
npm run docs:dev
```

## Build

Build both versions and stage the production artifacts:

```bash
npm run build:all
```

The staged production files are generated in:

- `projects/TurboPi/en/standard/`
- `projects/TurboPi/en/advanced/`

## GitHub Pages deployment

The build artifacts under `projects/` are committed to the repository. Open
**Settings > Pages**, select **Deploy from a branch**, and choose **main** and
**/(root)**. Do not bind a custom domain.

The GitHub Pages direct URL is:

```text
https://GITHUB-USERNAME.github.io/TurboPi-vite/projects/TurboPi/en/standard/
```

The public-facing URL (via the baota Nginx reverse proxy) is:

```text
https://wiki.hiwonder.com/projects/TurboPi/en/standard/
```
