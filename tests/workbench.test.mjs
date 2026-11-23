import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizePlan } from '../src/plan.mjs'
import { markOpened, resetWorkbenchState, setBuild, setPlan, snapshot } from '../src/workbench-state.mjs'

test('normalizePlan 校验并归一', () => {
  const plan = normalizePlan({
    title: ' 大纲 ',
    audience: ' 研发 ',
    recommendedStyle: 'ink-paper',
    slides: [{ title: '封面', bullets: ['副标题', ''] }, { title: '要点', bullets: ['甲'], notes: '备注' }],
  })
  assert.equal(plan.title, '大纲')
  assert.equal(plan.audience, '研发')
  assert.equal(plan.slides[0].bullets.length, 1)
  assert.equal(plan.slides[1].notes, '备注')
  assert.equal(plan.slides[0].id, 'p1')
})
test('normalizePlan 拒绝空 slides / 缺标题', () => {
  assert.throws(() => normalizePlan({ title: 'T', slides: [] }))
  assert.throws(() => normalizePlan({ title: 'T', slides: [{ title: '' }] }))
})
test('workbench 快照带风格与 build', () => {
  resetWorkbenchState()
  setPlan(normalizePlan({ title: 'T', slides: [{ title: 'S' }] }), 'indigo-deep')
  setBuild({ title: 'T', slideCount: 1, style: 'indigo-deep', pptxPath: 'x.pptx' })
  const state = snapshot()
  assert.equal(state.selectedStyle, 'indigo-deep')
  assert.equal(state.build.pptxPath, 'x.pptx')
  assert.ok(state.styles.length >= 5)
  assert.ok(state.styles[0].palette.bg.startsWith('#'))
  markOpened()
  assert.equal(typeof snapshot().openedAt, 'string')
  resetWorkbenchState()
})
