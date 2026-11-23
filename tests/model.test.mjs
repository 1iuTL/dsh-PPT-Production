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
