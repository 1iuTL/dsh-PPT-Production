import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { registerDeckTools } from '../src/tools.mjs'
import { unzip } from '../src/zip.mjs'

function fakeCtx() {
  const tools = new Map()
  return {
    tools: { register: (t) => { tools.set(t.name, t); return () => tools.delete(t.name) }, restrict: () => () => {}, guard: () => () => {} },
    effect: (fn) => { const c = fn(); return () => c && c() },
    inject: (_deps, fn) => fn(fakeCtx()),
    on: () => () => {}, get: () => undefined,
    logger: { info() {}, warn() {}, error() {} },
    _tools: tools,
  }
}
const defineTool = (def) => def
const run = (ctx, name, args) => ctx._tools.get(name).execute(args, { signal: new AbortController().signal })
const parse = (s) => JSON.parse(s)

test('注册五个工具', () => {
  const ctx = fakeCtx()
  registerDeckTools(ctx, {}, { defineTool })
  for (const n of ['deck_styles', 'deck_plan', 'deck_build', 'deck_read', 'deck_edit']) assert.ok(ctx._tools.has(n), n)
})
test('deck_plan 登记大纲供工作台读取', async () => {
  const ctx = fakeCtx(); registerDeckTools(ctx, {}, { defineTool })
  const r = parse(await run(ctx, 'deck_plan', {
    plan: { title: '工作台测试', audience: '开发', recommendedStyle: 'ink-paper', slides: [{ title: '封面', bullets: ['副标题'] }, { title: '要点', bullets: ['甲', '乙'] }] },
    style: 'ink-paper',
  }))
  assert.equal(r.ok, true)
  assert.equal(r.plan.slides.length, 2)
  assert.equal(r.plan.slides[1].bullets[1], '乙')
})
test('deck_styles 返回原创风格', async () => {
  const ctx = fakeCtx(); registerDeckTools(ctx, {}, { defineTool })
  const r = parse(await run(ctx, 'deck_styles', {}))
  assert.ok(r.length >= 5)
})
test('deck_build 产三件套且 pptx 含真实文本', async () => {
  const ctx = fakeCtx(); registerDeckTools(ctx, {}, { defineTool })
  const dir = mkdtempSync(join(tmpdir(), 'deck-'))
  const deck = { meta: { title: '工具测试' }, style: 'ink-paper', slides: [{ layout: 'cover', title: '工具标题' }] }
  const r = parse(await run(ctx, 'deck_build', { deck, outDir: dir }))
  assert.ok(existsSync(r.modelPath) && existsSync(r.pptxPath) && existsSync(r.htmlPath))
  const s1 = unzip(readFileSync(r.pptxPath)).get('ppt/slides/slide1.xml').toString('utf8')
  assert.ok(s1.includes('<a:t>工具标题</a:t>'))
})
test('deck_build 用 styleOverrides 的强调色附属色', async () => {
  const ctx = fakeCtx(); registerDeckTools(ctx, {}, { defineTool })
  const dir = mkdtempSync(join(tmpdir(), 'deck-'))
  const deck = {
    meta: { title: '多色测试' }, style: 'ink-paper',
    styleOverrides: { accent: '#112233', extras: { accent: ['#ff0000'] } },
    slides: [{ layout: 'cover', title: 'A' }, { layout: 'title-body', title: 'B', body: ['b'] }],
  }
  const r = parse(await run(ctx, 'deck_build', { deck, outDir: dir }))
  const s2 = unzip(readFileSync(r.pptxPath)).get('ppt/slides/slide2.xml').toString('utf8')
  assert.match(s2, /FF0000/i)
})
test('deck_edit 改模型重建', async () => {
  const ctx = fakeCtx(); registerDeckTools(ctx, {}, { defineTool })
  const dir = mkdtempSync(join(tmpdir(), 'deck-'))
  const deck = { meta: { title: '编辑测试' }, style: 'ink-paper', slides: [{ id: 's1', layout: 'cover', title: '原标题' }] }
  const b = parse(await run(ctx, 'deck_build', { deck, outDir: dir }))
  const e = parse(await run(ctx, 'deck_edit', { modelPath: b.modelPath, patch: { op: 'set-text', slideId: 's1', field: 'title', value: '改后标题' }, outDir: dir }))
  const s1 = unzip(readFileSync(e.pptxPath)).get('ppt/slides/slide1.xml').toString('utf8')
  assert.ok(s1.includes('<a:t>改后标题</a:t>'))
})
test('deck_read 读回页数', async () => {
  const ctx = fakeCtx(); registerDeckTools(ctx, {}, { defineTool })
  const dir = mkdtempSync(join(tmpdir(), 'deck-'))
  const deck = { meta: { title: '读测试' }, style: 'ink-paper', slides: [{ layout: 'cover', title: 'A' }, { layout: 'closing', title: 'B' }] }
  const b = parse(await run(ctx, 'deck_build', { deck, outDir: dir }))
  const r = parse(await run(ctx, 'deck_read', { path: b.pptxPath }))
  assert.equal(r.slideCount, 2)
})
test('deck_build 非法 deck 返回可读错误', async () => {
  const ctx = fakeCtx(); registerDeckTools(ctx, {}, { defineTool })
  const r = parse(await run(ctx, 'deck_build', { deck: { slides: [] }, outDir: mkdtempSync(join(tmpdir(), 'deck-')) }))
  assert.equal(r.ok, false)
  assert.match(r.error, /slides/)
})
