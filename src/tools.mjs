import { createRequire } from 'node:module'
import { randomBytes } from 'node:crypto'
import { existsSync, realpathSync, readFileSync, writeFileSync, mkdirSync, renameSync, rmSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { normalizeDeck, validateDeck } from './model.mjs'
import { getStyle, listStyles } from './styles.mjs'
import { normalizePlan } from './plan.mjs'
import { setBuild, setPlan } from './workbench-state.mjs'
import { renderPptx } from './render-pptx.mjs'
import { renderHtml } from './render-html.mjs'
import { readPptx } from './read-pptx.mjs'
import { applyPatch } from './edit.mjs'

/**
 * link 安装时源码包不在 profile 的 node_modules 树内，静态 import
 * `@deepseek-ai/dsh-tools` 会解析失败。这里从运行中的 dsh / profile 路径取。
 */
function loadDefineTool() {
  const candidates = []
  const add = (p) => {
    if (!p) return
    const n = String(p).replace(/\\/g, '/')
    if (!candidates.includes(n)) candidates.push(n)
  }
  const considerBin = (bin) => {
    if (!bin) return
    let text = String(bin).replace(/\\/g, '/')
    try { text = realpathSync(bin).replace(/\\/g, '/') } catch {}
    const needle = '/node_modules/@deepseek-ai/dsh/'
    const at = text.lastIndexOf(needle)
    if (at >= 0) add(text.slice(0, at + needle.length - 1) + '/package.json')
    const nm = text.lastIndexOf('/node_modules/')
    if (nm >= 0) add(join(text.slice(0, nm), 'node_modules', '@deepseek-ai', 'dsh', 'package.json'))
    add(join(dirname(text), '..', 'lib', 'node_modules', '@deepseek-ai', 'dsh', 'package.json'))
    add(join(dirname(text), '..', 'node_modules', '@deepseek-ai', 'dsh', 'package.json'))
  }
  for (const bin of [process.argv[1], process.env.DSH_CLI]) {
    try { considerBin(bin) } catch {}
  }
  for (const home of [process.env.DSH_HOME, join(homedir(), '.dsh')].filter(Boolean)) {
    add(join(home, 'package.json'))
    for (const profile of ['web', 'desktop', 'default']) {
      add(join(home, 'profiles', profile, 'package.json'))
      add(join(home, 'profiles', profile, 'node_modules', '@deepseek-ai', 'dsh', 'package.json'))
    }
  }
  add(join(process.cwd(), 'package.json'))
  for (const pkg of candidates) {
    try {
      if (!existsSync(pkg)) continue
      const mod = createRequire(pkg)('@deepseek-ai/dsh-tools')
      const fn = mod && (mod.defineTool || (mod.default && mod.default.defineTool))
      if (typeof fn === 'function') return fn
    } catch {}
  }
  throw new Error('dsh-ppt-production: 无法从宿主解析 @deepseek-ai/dsh-tools；已尝试: ' + candidates.join(', '))
}

const text = (v) => [{ type: 'text', text: typeof v === 'string' ? v : JSON.stringify(v, null, 2) }]
const slug = (s) => String(s).replace(/[^\w\u4e00-\u9fa5-]+/g, '-').slice(0, 40) || 'deck'
// M7: 每次新构建使用独立随机后缀，避免同标题/同 createdAt 覆盖
const uniqueSlug = (title) => slug(title) + '-' + randomBytes(4).toString('hex')
const errorText = (e) => String(e && e.message ? e.message : e)
// L6: 优先使用会话工作区，无法取得时回退用户 decks 目录
const defaultOutDir = (exec) => {
  const cwd = exec?.agent?.session?.header?.cwd
  return typeof cwd === 'string' && cwd ? cwd : join(homedir(), 'decks')
}

// H2: 从真实宿主 exec.agent.session 提取会话绑定键；子会话优先共享父会话工作台
function sessionKeyOf(exec) {
  const session = exec?.agent?.session
  if (session?.id != null) return String(session.header?.parentSession || session.id)
  return exec?.sessionId || exec?.conversationId || exec?.session?.id || exec?.conversation?.id || 'default'
}

function resolveStyle(id, overrides) {
  const base = getStyle(id) ?? getStyle('ink-paper')
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) return base
  const palette = { ...base.palette }
  for (const key of ['bg', 'ink', 'accent', 'muted', 'line']) {
    if (typeof overrides[key] === 'string') palette[key] = overrides[key]
  }
  const fonts = { ...base.fonts, ...(overrides.fonts && typeof overrides.fonts === 'object' ? overrides.fonts : {}) }
  const pick = (value) => Array.isArray(value)
    ? value.filter(color => typeof color === 'string' && /^#[0-9a-fA-F]{6}$/.test(color))
    : []
  const extras = overrides.extras && typeof overrides.extras === 'object'
    ? { bg: pick(overrides.extras.bg), ink: pick(overrides.extras.ink), accent: pick(overrides.extras.accent) }
    : undefined
  return { ...base, palette, fonts, ...(extras ? { extras } : {}) }
}

async function buildAll(deck, outDir, sessionKey, baseName) {
  const norm = normalizeDeck(deck)
  const v = validateDeck(norm)
  if (!v.ok) throw new Error('deck_build: 模型非法 — ' + v.errors.join('; '))
  const style = resolveStyle(norm.style, norm.styleOverrides)
  mkdirSync(outDir, { recursive: true })
  const base = join(outDir, baseName || uniqueSlug(norm.meta.title))
  const modelPath = base + '.deck.json', pptxPath = base + '.pptx', htmlPath = base + '.preview.html'
  // L5: 三件先写临时文件，全部成功后再提交，避免渲染失败破坏已有产物
  const tmpBase = base + '.tmp-' + process.pid + '-' + randomBytes(4).toString('hex')
  const tmpModel = tmpBase + '.deck.json', tmpPptx = tmpBase + '.pptx', tmpHtml = tmpBase + '.preview.html'
  try {
    await renderPptx(norm, style, tmpPptx)
    writeFileSync(tmpHtml, renderHtml(norm, style), 'utf8')
    writeFileSync(tmpModel, JSON.stringify(norm, null, 2), 'utf8')
    renameSync(tmpPptx, pptxPath)
    renameSync(tmpHtml, htmlPath)
    renameSync(tmpModel, modelPath)
  } catch (error) {
    for (const path of [tmpModel, tmpPptx, tmpHtml]) rmSync(path, { force: true })
    throw error
  }
  setBuild({
    title: norm.meta.title, slideCount: norm.slides.length, style: style.id,
    modelPath, pptxPath, htmlPath,
  }, sessionKey)
  return { modelPath, pptxPath, htmlPath, slideCount: norm.slides.length, style: style.id }
}

function guard(fn) {
  return async (args, exec) => {
    try {
      return JSON.stringify(await fn(args, exec))
    } catch (e) {
      return JSON.stringify({ ok: false, error: errorText(e) })
    }
  }
}

export function registerDeckTools(ctx, config, opts = {}) {
  const defineTool = opts.defineTool ?? loadDefineTool()
  const reg = (def) => ctx.effect(() => ctx.tools.register(defineTool(def)), `dsh-ppt-production: ${def.name}`)

  reg({
    name: 'deck_styles',
    description: '列出内置原创 PPT 风格（色板/字体/密度/三条规则）。选风格前先用本工具看可用项。',
    parameters: {},
    output: { schema: { type: 'string' }, render: (_a, v) => text(v) },
    execute: guard(async () => listStyles()),
  })

  reg({
    name: 'deck_plan',
    description: '把逐页大纲和推荐风格登记到 PPT 工作台（右侧栏），让用户查看/编辑/批准。调用后对话里会出现计划卡，客户端自动展开右侧工作台。用户批准后才会 deck_build；大改必须先走这里。',
    parameters: {
      plan: {
        type: 'object', required: true, additionalProperties: true,
        description: '大纲：{title, audience?, recommendedStyle?, slides:[{title, bullets?:string[], notes?:string}]}',
      },
      style: { type: 'string', description: '推荐风格 id（见 deck_styles）' },
    },
    output: { schema: { type: 'string' }, render: (_a, v) => text(v) },
    execute: guard(async (args, exec) => {
      const plan = normalizePlan(args.plan)
      setPlan(plan, args.style, sessionKeyOf(exec))
      return { ok: true, plan, hint: '计划卡已生成，客户端会展开右侧 PPT 工作台；请让用户确认，批准后再调用 deck_build。' }
    }),
  })

  reg({
    name: 'deck_build',
    description: '把 JSON deck 模型渲染成原生可编辑 pptx + HTML 预览，并落盘模型（.deck.json，事实源）。返回三件套路径。文字为真实文本框，可在 PowerPoint 编辑。构建后请调用 present 交付 pptx，用户点击交付卡即可在 DSH 右侧内置窗口预览。',
    parameters: {
      deck: { type: 'object', required: true, additionalProperties: true, description: 'deck 模型：{meta,style,slides[]}；slide.layout ∈ cover/section/title-body/two-col/image/closing' },
      style: { type: 'string', description: '风格 id（见 deck_styles）；缺省用模型内 style 或 ink-paper' },
      outDir: { type: 'string', description: '输出目录绝对路径；建议显式传会话工作区' },
    },
    output: { schema: { type: 'string' }, render: (_a, v) => text(v) },
    execute: guard(async (args, exec) => {
      const deck = { ...(args.deck ?? {}), ...(args.style ? { style: args.style } : {}) }
      return buildAll(deck, args.outDir || defaultOutDir(exec), sessionKeyOf(exec))
    }),
  })

  reg({
    name: 'deck_read',
    description: '读现有 pptx：页数、每页文字与形状/图片计数（零依赖 unzip+XML 抽取，只读摘要，非完整解析）。',
    parameters: { path: { type: 'string', required: true, description: 'pptx 绝对路径' } },
    output: { schema: { type: 'string' }, render: (_a, v) => text(v) },
    execute: guard(async (args) => {
      if (typeof args.path !== 'string' || !args.path) throw new Error('deck_read: 需要 path')
      if (!existsSync(args.path)) throw new Error('deck_read: 文件不存在: ' + args.path)
      return readPptx(args.path)
    }),
  })

  reg({
    name: 'deck_edit',
    description: '改 deck 模型并重建 pptx+预览（原生可编辑）。patch.op ∈ set-text/set-body/swap-image/delete-slide/reorder/add-slide。小改直接做；大改先给 outline 等批准。',
    parameters: {
      modelPath: { type: 'string', required: true, description: 'deck_build 落盘的 .deck.json 绝对路径' },
      patch: { type: 'object', required: true, additionalProperties: true, description: '单个 patch 操作' },
      outDir: { type: 'string', description: '输出目录；缺省模型所在目录' },
    },
    output: { schema: { type: 'string' }, render: (_a, v) => text(v) },
    execute: guard(async (args, exec) => {
      if (typeof args.modelPath !== 'string' || !existsSync(args.modelPath)) throw new Error('deck_edit: 模型文件不存在: ' + args.modelPath)
      const deck = JSON.parse(readFileSync(args.modelPath, 'utf8'))
      const next = applyPatch(deck, args.patch)
      return buildAll(next, args.outDir || dirname(args.modelPath), sessionKeyOf(exec), basename(args.modelPath, '.deck.json'))
    }),
  })
}
