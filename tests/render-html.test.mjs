import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderHtml } from '../src/render-html.mjs'
import { getStyle } from '../src/styles.mjs'
import { normalizeDeck } from '../src/model.mjs'

const deck = normalizeDeck({ slides: [
  { layout: 'cover', title: '标题 <b> & "引号"', subtitle: '副标题' },
  { layout: 'title-body', title: '要点', body: ['甲', '乙'] },
]})
test('输出含全部文本且转义', () => {
  const html = renderHtml(deck, getStyle('ink-paper'))
  assert.ok(html.includes('标题 &lt;b&gt; &amp; &quot;引号&quot;'))
  assert.ok(html.includes('甲') && html.includes('乙'))
  assert.ok(!html.includes('<b>'))
})
test('每页一个 section，含 doctype', () => {
  const html = renderHtml(deck, getStyle('ink-paper'))
  assert.match(html, /^<!DOCTYPE html>/)
  assert.equal((html.match(/<section/g) || []).length, 2)
})
test('无外部资源引用', () => {
  const html = renderHtml(deck, getStyle('ink-paper'))
  assert.ok(!/src=["']http/.test(html))
  assert.ok(!/<script/.test(html))
})
test('绝对 Windows 图片路径转 file URL', () => {
  const d = normalizeDeck({ slides: [{ layout: 'image', title: '图', image: { path: 'C:\\pics\\a b.png' } }] })
  const html = renderHtml(d, getStyle('ink-paper'))
  assert.ok(html.includes('file:///C:/pics/a%20b.png'), html)
})
