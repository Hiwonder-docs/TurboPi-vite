import { mkdir, rm, cp } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = join(__dirname, '..')

const projectName = 'TurboPi'
const version = process.env.DOCS_VERSION || 'latest'
const targetDir = join(repositoryRoot, `projects/${projectName}/en/${version}`)

await rm(targetDir, { recursive: true, force: true })
await mkdir(targetDir, { recursive: true })

await cp(
  join(repositoryRoot, 'docs/.vitepress/dist'),
  targetDir,
  { recursive: true }
)

console.log('Staged files to:', targetDir)
