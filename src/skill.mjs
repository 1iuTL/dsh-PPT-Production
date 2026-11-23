import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const SKILL_DIR = fileURLToPath(new URL('../skills/deck-maker/', import.meta.url))
const RANK = 600
const PROVIDER = 'dsh-ppt-production'

function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  const fm = m ? m[1] : ''
  const name = (fm.match(/^name:\s*(.+)$/m) || [])[1]?.trim()
  const description = (fm.match(/^description:\s*(.+)$/m) || [])[1]?.trim()
  return { name, description, body: m ? content.slice(m[0].length) : content }
}

export function registerDeckSkill(ctx) {
  const path = join(SKILL_DIR, 'SKILL.md')
  const raw = readFileSync(path, 'utf8')
  const { name, description, body } = parseFrontmatter(raw)
  if (!name || !description) throw new Error('dsh-ppt-production: deck-maker SKILL.md frontmatter 缺 name/description')
  const resourceBase = { kind: 'directory', path: SKILL_DIR.replace(/\\/g, '/') }
  const candidate = {
    name, description,
    invocation: { modelInvocable: true, userInvocable: true },
    source: 'bundled',
    provider: PROVIDER,
    rank: RANK,
    resourceBase,
    path,
    locator: path,
  }
  const provider = {
    name: PROVIDER,
    list: async () => [candidate],
    get: async (n) => n === name ? {
      name, description,
      invocation: { modelInvocable: true, userInvocable: true },
      source: 'bundled', provider: PROVIDER,
      rank: RANK,
      resourceBase,
      path,
      locator: path,
      content: body,
    } : undefined,
  }
  return ctx.skills.registerProvider(() => provider)
}
