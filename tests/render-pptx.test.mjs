import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { renderPptx } from '../src/render-pptx.mjs'
import { getStyle } from '../src/styles.mjs'
import { normalizeDeck } from '../src/model.mjs'
import { unzip } from '../src/zip.mjs'

test('pptx 含真实 <a:t> 文本框（非整页图片）', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'deck-'))
  const out = join(dir, 't.pptx')
  const deck = normalizeDeck({ slides: [
    { layout: 'cover', title: '原生可编辑标题', subtitle: '副标题' },
    { layout: 'title-body', title: '要点页', body: ['甲点', '乙点'], notes: '备注' },
  ]})
  await renderPptx(deck, getStyle('ink-paper'), out)
  const entries = unzip(readFileSync(out))
  const s1 = entries.get('ppt/slides/slide1.xml').toString('utf8')
  const s2 = entries.get('ppt/slides/slide2.xml').toString('utf8')
  assert.ok(s1.includes('<a:t>原生可编辑标题</a:t>'))
  assert.ok(s2.includes('<a:t>甲点</a:t>'))
  assert.ok(!s1.includes('<p:pic>'), 'cover 不应是整页图片')
  assert.ok([...entries.keys()].some(k => k.startsWith('ppt/notesSlides/')), '应含备注')
})

test('强调色附属色按页轮换到形状', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'deck-'))
  const out = join(dir, 'colors.pptx')
  const style = { ...getStyle('ink-paper'), extras: { accent: ['#ff0000'] } }
  const deck = normalizeDeck({ slides: [
    { layout: 'cover', title: 'A' },
    { layout: 'title-body', title: 'B', body: ['b'] },
  ]})
  await renderPptx(deck, style, out)
  const entries = unzip(readFileSync(out))
  const s2 = entries.get('ppt/slides/slide2.xml').toString('utf8')
  assert.match(s2, /FF0000/i)
})
