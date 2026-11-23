import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { extractSlideText } from '../src/xml.mjs'
import { readPptx } from '../src/read-pptx.mjs'
import { renderPptx } from '../src/render-pptx.mjs'
import { getStyle } from '../src/styles.mjs'
import { normalizeDeck } from '../src/model.mjs'

test('extractSlideText 抽文本与计数', () => {
  const xml = '<p:sld><p:sp><a:t>甲</a:t></p:sp><p:sp><a:t>乙 &amp; 丙</a:t></p:sp><p:pic></p:pic></p:sld>'
  const r = extractSlideText(xml)
  assert.deepEqual(r.texts, ['甲', '乙 & 丙'])
  assert.equal(r.shapeCount, 2)
  assert.equal(r.pictureCount, 1)
})
test('往返：build 的 pptx 能 read 回原文', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'deck-'))
  const out = join(dir, 'rt.pptx')
  const deck = normalizeDeck({ slides: [
    { layout: 'cover', title: '往返标题' },
    { layout: 'title-body', title: '要点', body: ['第一', '第二'] },
  ]})
  await renderPptx(deck, getStyle('ink-paper'), out)
  const r = readPptx(out)
  assert.equal(r.slideCount, 2)
  assert.ok(r.slides[0].texts.includes('往返标题'))
  assert.ok(r.slides[1].texts.includes('第一'))
})
