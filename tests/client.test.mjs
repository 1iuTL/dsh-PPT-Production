import { test } from 'node:test'
import assert from 'node:assert/strict'

let loaded
globalThis.window = {
  __ModuleLoader__: {
    load(definition) { loaded = definition },
  },
}
await import('../client.js?client-registration-test')

const fakeReact = {
  createElement() {},
  useState() {},
  useEffect() {},
  useRef() {},
}

test('client module registers workbench tab type, body and composer button', () => {
  const types = []
  const slots = []
  const opened = []
  const sidebarRight = { openTab: (kind) => opened.push(kind) }
  const sidebarRightTabs = { register: (definition) => { types.push(definition); return () => {} } }
  const ctx = {
    get(name) {
      if (name === 'sidebarRight') return sidebarRight
      if (name === 'sidebarRightTabs') return sidebarRightTabs
      return undefined
    },
    slots: {
      inject(_key, callback) { callback(); return () => {} },
      register(definition) { slots.push(definition); return () => {} },
    },
    effect(callback) { callback(); return () => {} },
  }
  const module = loaded.factory((name) => {
    assert.equal(name, 'react')
    return fakeReact
  })
  assert.deepEqual(module.inject, ['slots'])
  const color = module.__test
  assert.deepEqual(color.hexToRgb('#ff0000'), { r: 255, g: 0, b: 0 })
  assert.equal(color.rgbToHex({ r: 255, g: 255, b: 255 }), '#ffffff')
  assert.equal(color.hsvToHex({ h: 0, s: 1, v: 1 }), '#ff0000')
  assert.equal(color.hsvToHex({ h: 120, s: 1, v: 1 }), '#00ff00')
  assert.deepEqual(color.cmykOf({ r: 0, g: 0, b: 0 }), { c: 0, m: 0, y: 0, k: 100 })
  assert.equal(color.cmykToHex({ c: 0, m: 100, y: 100, k: 0 }), '#ff0000')
  assert.deepEqual(color.deleteColorEntry({ main: '#111111', extras: ['#222222', '#333333'] }, 'main'), { main: '#222222', extras: ['#333333'] })
  assert.deepEqual(color.deleteColorEntry({ main: '#111111', extras: ['#222222', '#333333'] }, '0'), { main: '#111111', extras: ['#333333'] })
  assert.equal(color.deleteColorEntry({ main: '#111111', extras: [] }, 'main'), null)
  module.apply(ctx)
  assert.equal(types[0].id, 'dsh-ppt-production')
  assert.equal(types[0].kind, 'dsh-ppt-production')
  assert.equal(types[0].title(), 'PPT 工作台')
  const body = slots.find(slot => slot.name === 'sidebar.right.pane.tab')
  const toolview = slots.find(slot => slot.name === 'tool.call.toolview')
  const bar = slots.find(slot => slot.name === 'conversation.input.dock')
  assert.equal(body.key, 'dsh-ppt-production')
  assert.equal(toolview.key, 'deck_plan')
  assert.equal(bar.id, 'dsh-ppt-production.auto')
})

test('大纲编辑支持标题转义且改标题不继承旧备注', () => {
  const module = loaded.factory(() => fakeReact)
  const { planToText, textToSlides } = module.__test
  const base = { slides: [
    { id: 'a', title: '含|竖线', bullets: ['甲'], notes: 'A备注' },
    { id: 'b', title: '第二页', bullets: ['乙'], notes: 'B备注' },
  ] }
  const text = planToText(base)
  assert.ok(text.includes('含\\|竖线'))
  const roundTrip = textToSlides(text, base)
  assert.equal(roundTrip[0].title, '含|竖线')
  assert.equal(roundTrip[0].notes, 'A备注')
  const reordered = textToSlides('第二页 | 乙\n含\\|竖线 | 甲', base)
  assert.equal(reordered[0].id, 'b')
  assert.equal(reordered[0].notes, 'B备注')
  const renamed = textToSlides('全新标题 | 甲\n第二页 | 乙', base)
  assert.equal(renamed[0].notes, undefined)
  assert.equal(renamed[1].notes, 'B备注')
})
