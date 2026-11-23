import { test } from 'node:test'
import assert from 'node:assert/strict'
import { contrastRatio, slideColors } from '../src/slide-colors.mjs'
import { getStyle } from '../src/styles.mjs'

test('section 使用背景附属色且 HTML/PPTX 共用选择逻辑', () => {
  const style = { ...getStyle('ink-paper'), extras: { bg: ['#E8F0FE'], ink: ['#123456'] } }
  const colors = slideColors(style, 'section', 0)
  assert.equal(colors.bg, 'E8F0FE')
  assert.equal(colors.ink, '123456')
})

test('白底白字时回退到可读颜色', () => {
  const style = { ...getStyle('ink-paper'), extras: { bg: ['#FFFFFF'], ink: ['#FFFFFF'] } }
  const colors = slideColors(style, 'section', 0)
  assert.equal(colors.bg, 'FFFFFF')
  assert.notEqual(colors.ink, 'FFFFFF')
  assert.ok(contrastRatio(colors.bg, colors.ink) >= 3)
})

test('深底深字时回退到可读颜色', () => {
  const style = { ...getStyle('ink-paper'), extras: { bg: ['#000000'], ink: ['#000000'] } }
  const colors = slideColors(style, 'closing', 0)
  assert.equal(colors.bg, '000000')
  assert.notEqual(colors.ink, '000000')
  assert.ok(contrastRatio(colors.bg, colors.ink) >= 3)
})
