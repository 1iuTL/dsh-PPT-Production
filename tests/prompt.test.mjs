import { test } from 'node:test'
import assert from 'node:assert/strict'
import { registerDeckPrompt } from '../src/prompt.mjs'

function fakeCtx() {
  let section
  return {
    systemPrompt: { section: (s) => { section = s; return () => {} } },
    effect: (fn) => { const c = fn(); return () => c && c() },
    _section: () => section,
  }
}
test('section interpolate:false 且 text 返回策略字符串', () => {
  const ctx = fakeCtx()
  registerDeckPrompt(ctx, {})
  const s = ctx._section()
  assert.equal(s.name, 'dsh-ppt-production-policy')
  assert.equal(s.interpolate, false)
  const out = s.text({ agent: {} })
  assert.equal(typeof out, 'string')
  assert.ok(out.includes('deck_build') && out.includes('原生可编辑'))
})
