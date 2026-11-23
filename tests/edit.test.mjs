import { test } from 'node:test'
import assert from 'node:assert/strict'
import { applyPatch } from '../src/edit.mjs'
import { normalizeDeck } from '../src/model.mjs'

const base = () => normalizeDeck({ slides: [
  { id: 's1', layout: 'cover', title: '旧标题' },
  { id: 's2', layout: 'title-body', title: '要点', body: ['甲'] },
]})
test('set-text 改标题且不可变', () => {
  const d = base()
  const r = applyPatch(d, { op: 'set-text', slideId: 's1', field: 'title', value: '新标题' })
  assert.equal(r.slides[0].title, '新标题')
  assert.equal(d.slides[0].title, '旧标题')
})
test('set-body / swap-image', () => {
  let d = applyPatch(base(), { op: 'set-body', slideId: 's2', body: ['乙', '丙'] })
  assert.deepEqual(d.slides[1].body, ['乙', '丙'])
  d = applyPatch(d, { op: 'swap-image', slideId: 's2', path: 'new.png', caption: '图' })
  assert.equal(d.slides[1].image.path, 'new.png')
})
test('delete-slide / reorder / add-slide', () => {
  let d = applyPatch(base(), { op: 'delete-slide', slideId: 's1' })
  assert.equal(d.slides.length, 1)
  d = applyPatch(base(), { op: 'reorder', order: ['s2', 's1'] })
  assert.equal(d.slides[0].id, 's2')
  d = applyPatch(base(), { op: 'add-slide', slide: { id: 's3', layout: 'closing', title: '尾' }, after: 's1' })
  assert.equal(d.slides[1].id, 's3')
})
test('非法 op 与缺失 slide 抛错', () => {
  assert.throws(() => applyPatch(base(), { op: 'bogus' }))
  assert.throws(() => applyPatch(base(), { op: 'set-text', slideId: 'nope', field: 'title', value: 'x' }))
})
test('reorder 重复 id / add-slide 撞 id 抛错', () => {
  assert.throws(() => applyPatch(base(), { op: 'reorder', order: ['s2', 's2'] }))
  assert.throws(() => applyPatch(base(), { op: 'add-slide', slide: { id: 's1', layout: 'closing', title: '撞' } }))
})
