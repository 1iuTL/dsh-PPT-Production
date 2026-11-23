import { test } from 'node:test'
import assert from 'node:assert/strict'
import { registerDeckSkill } from '../src/skill.mjs'

function fakeCtx() {
  let provider
  return {
    skills: { registerProvider: (fn) => { provider = fn(); return () => {} } },
    effect: (fn) => { const c = fn(); return () => c && c() },
    _provider: () => provider,
  }
}
test('provider list/get 必须 async 且返回 bundled skill', async () => {
  const ctx = fakeCtx()
  registerDeckSkill(ctx)
  const p = ctx._provider()
  const list = p.list()
  assert.ok(typeof list.then === 'function', 'list 必须返回 Promise')
  const items = await list
  assert.equal(items[0].name, 'deck-maker')
  assert.equal(items[0].rank, 600)
  const got = await p.get('deck-maker')
  assert.equal(got.source, 'bundled')
  assert.equal(got.resourceBase.kind, 'directory')
  assert.ok(got.content.includes('deck_build'))
  assert.equal(await p.get('nope'), undefined)
})

// 回归：宿主对 list() 返回的每个 skill 校验 source 必须是字符串。
// 旧 candidate 只有 {name,description,rank}，source=undefined → 宿主抛
// "returned skill ... with a non-string source" 整轮失败。
test('list candidate 必须带字符串 source 与完整形状', async () => {
  const ctx = fakeCtx()
  registerDeckSkill(ctx)
  const items = await ctx._provider().list()
  for (const it of items) {
    assert.equal(typeof it.source, 'string', 'list candidate.source 必须是字符串')
    assert.equal(it.source, 'bundled')
    assert.equal(it.provider, 'dsh-ppt-production')
    assert.equal(it.resourceBase.kind, 'directory')
    assert.equal(typeof it.path, 'string')
    assert.equal(typeof it.locator, 'string')
    assert.equal(it.invocation.modelInvocable, true)
  }
})
