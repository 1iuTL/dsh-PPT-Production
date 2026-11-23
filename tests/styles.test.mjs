import { test } from 'node:test'
import assert from 'node:assert/strict'
import { STYLES, getStyle, listStyles } from '../src/styles.mjs'

const AMAZON = ['data-drift', 'neon-lattice', 'bright-paper', 'terracotta-venture', 'working-paper', 'red-poster']
test('至少 5 个风格', () => { assert.ok(STYLES.length >= 5) })
test('不得含 Amazon 预设名/id', () => {
  for (const s of STYLES) {
    assert.ok(!AMAZON.includes(s.id), `id 撞 Amazon: ${s.id}`)
    assert.ok(!AMAZON.some(a => s.name.toLowerCase().replace(/\s/g, '-') === a))
  }
})
test('每个风格三条规则、合法 hex', () => {
  for (const s of STYLES) {
    assert.equal(s.rules.length, 3)
    for (const c of Object.values(s.palette)) assert.match(c, /^#[0-9A-Fa-f]{6}$/)
  }
})
test('getStyle/listStyles', () => {
  assert.ok(getStyle(STYLES[0].id))
  assert.equal(getStyle('nope'), undefined)
  assert.equal(listStyles().length, STYLES.length)
  assert.ok(listStyles()[0].rules.length === 3)
})
test('listStyles 返回含 palette 和 fonts（M2）', () => {
  for (const s of listStyles()) {
    assert.ok(s.palette && typeof s.palette === 'object', `${s.id} 缺 palette`)
    assert.ok(s.palette.bg && s.palette.ink && s.palette.accent, `${s.id} palette 不完整`)
    assert.ok(s.fonts && typeof s.fonts === 'object', `${s.id} 缺 fonts`)
    assert.ok(typeof s.fonts.heading === 'string', `${s.id} 缺 fonts.heading`)
    assert.ok(typeof s.fonts.body === 'string', `${s.id} 缺 fonts.body`)
  }
})
