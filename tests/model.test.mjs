import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeDeck, validateDeck, LAYOUTS } from '../src/model.mjs'

test('normalize 补 id 与 meta 默认', () => {
  const d = normalizeDeck({ slides: [{ layout: 'cover', title: 'T' }] })
  assert.equal(d.slides[0].id, 's1')
  assert.equal(typeof d.meta.createdAt, 'string')
  assert.equal(d.style, 'ink-paper')
})
test('validate 拒绝空 slides', () => {
  assert.equal(validateDeck({ slides: [] }).ok, false)
})
test('validate 拒绝非法 layout', () => {
  const r = validateDeck({ slides: [{ id: 's1', layout: 'bogus', title: 'T' }] })
  assert.equal(r.ok, false)
  assert.ok(r.errors.some(e => /layout/.test(e)))
})
test('validate 接受合法 deck', () => {
  assert.equal(validateDeck({ slides: [{ id: 's1', layout: 'title-body', title: 'T', body: ['a'] }] }).ok, true)
})
test('validate 拒绝重复 slide id', () => {
  const r = validateDeck({ slides: [
    { id: 's1', layout: 'cover', title: 'A' },
    { id: 's1', layout: 'closing', title: 'B' },
  ] })
  assert.equal(r.ok, false)
  assert.ok(r.errors.some(e => /重复/.test(e)))
})
test('LAYOUTS 含六种', () => { assert.equal(LAYOUTS.length, 6) })
test('normalize 过滤非对象 slide（L1）', () => {
  const d = normalizeDeck({ slides: [null, { layout: 'cover', title: 'T' }, undefined, 42] })
  assert.equal(d.slides.length, 1)
  assert.equal(d.slides[0].title, 'T')
})
test('validate 校验 extras 非法颜色（L3）', () => {
  const r = validateDeck({
    slides: [{ id: 's1', layout: 'cover', title: 'T' }],
    styleOverrides: { extras: { accent: ['#FF0000', 'not-a-color'] } },
  })
  assert.equal(r.ok, false)
  assert.ok(r.errors.some(e => /extras.*非法颜色/.test(e)))
})
test('validate 拒绝 extras 非数组（L3）', () => {
  const r = validateDeck({
    slides: [{ id: 's1', layout: 'cover', title: 'T' }],
    styleOverrides: { extras: { accent: 'not-array' } },
  })
  assert.equal(r.ok, false)
  assert.ok(r.errors.some(e => /extras.*必须是数组/.test(e)))
})
test('validate 接受合法 extras', () => {
  const r = validateDeck({
    slides: [{ id: 's1', layout: 'cover', title: 'T' }],
    styleOverrides: { extras: { accent: ['#FF0000', '#00FF00'], bg: ['#0000FF'] } },
  })
  assert.equal(r.ok, true)
})
test('validate 直接拒绝 null slide 而不抛 TypeError', () => {
  const r = validateDeck({ slides: [null] })
  assert.equal(r.ok, false)
  assert.ok(r.errors.some(e => /slide 必须是对象/.test(e)))
})
