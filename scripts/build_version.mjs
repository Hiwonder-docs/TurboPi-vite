import { rm, cp, readFile, writeFile, mkdtemp } from 'fs/promises'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { tmpdir } from 'os'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = join(__dirname, '..')

const requestedVersion = process.argv[2]
if (!requestedVersion) {
  console.error('Usage: node scripts/build_version.mjs <version>')
  console.error('Example: node scripts/build_version.mjs standard')
  process.exit(1)
}

const versionAliasMap = {
  'v1.1': 'standard',
  'v1.2': 'advanced'
}
const version = versionAliasMap[requestedVersion] || requestedVersion
const validVersions = ['standard', 'advanced']
if (!validVersions.includes(version)) {
  console.error(`Invalid version: ${requestedVersion}`)
  console.error(`Valid versions: ${validVersions.join(', ')}`)
  process.exit(1)
}

const projectName = 'TurboPi'
const docsBase = `/projects/${projectName}/en/${version}/`
const contentDir = join(repositoryRoot, 'content', version)
const rootIndexPath = join(repositoryRoot, 'docs', 'index.md')
const versionIndexPath = join(contentDir, 'docs', 'index.md')
const docsDocsDir = join(repositoryRoot, 'docs', 'docs')
const docsStaticDir = join(repositoryRoot, 'docs', '_static')
const backupRoot = await mkdtemp(join(tmpdir(), 'turbopi-docs-'))
const backupDocsDir = join(backupRoot, 'docs')
const backupStaticDir = join(backupRoot, 'static')
const hasOriginalDocsDir = existsSync(docsDocsDir)
const hasOriginalStaticDir = existsSync(docsStaticDir)

console.log(`\n========== Building ${version} ==========`)
console.log(`DOCS_BASE: ${docsBase}`)

const originalRootIndex = await readFile(rootIndexPath, 'utf8')
const versionRootIndex = await readFile(versionIndexPath, 'utf8')

try {
  if (hasOriginalDocsDir) {
    await cp(docsDocsDir, backupDocsDir, { recursive: true })
  }
  if (hasOriginalStaticDir) {
    await cp(docsStaticDir, backupStaticDir, { recursive: true })
  }

  await writeFile(rootIndexPath, versionRootIndex)

  console.log('\n[1/3] Copying content files...')
  await rm(docsDocsDir, { recursive: true, force: true })
  await rm(docsStaticDir, { recursive: true, force: true })
  await cp(join(contentDir, 'docs'), docsDocsDir, { recursive: true })
  await cp(join(contentDir, '_static'), docsStaticDir, { recursive: true })
  console.log('  Done.')

  console.log('\n[2/3] Building with VitePress...')
  execSync('npx vitepress build docs', {
    stdio: 'inherit',
    cwd: repositoryRoot,
    env: { ...process.env, DOCS_BASE: docsBase, DOCS_VERSION: version }
  })
  console.log('  Done.')

  console.log('\n[3/3] Staging production files...')
  execSync('node scripts/stage_main_site.mjs', {
    stdio: 'inherit',
    cwd: repositoryRoot,
    env: {
      ...process.env,
      DOCS_BASE: docsBase,
      DOCS_PROJECT: projectName,
      DOCS_VERSION: version
    }
  })
  console.log('  Done.')

  console.log(`\n========== ${version} build complete ==========\n`)
} finally {
  await writeFile(rootIndexPath, originalRootIndex)
  await rm(docsDocsDir, { recursive: true, force: true })
  await rm(docsStaticDir, { recursive: true, force: true })

  if (hasOriginalDocsDir) {
    await cp(backupDocsDir, docsDocsDir, { recursive: true })
  }
  if (hasOriginalStaticDir) {
    await cp(backupStaticDir, docsStaticDir, { recursive: true })
  }

  await rm(backupRoot, { recursive: true, force: true })
}
