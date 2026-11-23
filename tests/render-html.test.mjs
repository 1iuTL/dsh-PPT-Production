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
test('色条随页轮换 accent extras（M4）', () => {
  const style = { ...getStyle('ink-paper'), extras: { accent: ['#FF0000', '#00FF00'] } }
  const d = normalizeDeck({ slides: [
    { layout: 'cover', title: 'A' },
    { layout: 'title-body', title: 'B', body: ['b'] },
    { layout: 'closing', title: 'C' },
  ]})
  const html = renderHtml(d, style)
  // 第 1 页用主色，第 2 页用 extras[0]，第 3 页用 extras[1]
  const sections = html.match(/<section[^>]*--slide-accent:([^;]+);/g)
  assert.ok(sections && sections.length === 3, '应有 3 个带 --slide-accent 的 section')
  assert.ok(sections[0].includes('#FF6900'), '第 1 页用主色')
  assert.ok(sections[1].includes('#FF0000'), '第 2 页用 extras[0]')
  assert.ok(sections[2].includes('#00FF00'), '第 3 页用 extras[1]')
})
test('字体名特殊字符被清除（L4）', () => {
  const style = {
    ...getStyle('ink-paper'),
    fonts: { heading: 'Font";}body{background:red', body: "Font';}body{display:none" },
  }
  const d = normalizeDeck({ slides: [{ layout: 'cover', title: 'T' }] })
  const html = renderHtml(d, style)
  assert.ok(!html.includes('background:red'), '不应包含注入的 CSS')
  assert.ok(!html.includes('display:none'), '不应包含注入的 CSS')
})
