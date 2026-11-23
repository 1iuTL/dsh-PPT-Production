const clone = (d) => structuredClone(d)
function find(deck, id) {
  const i = deck.slides.findIndex(s => s.id === id)
  if (i < 0) throw new Error(`deck_edit: 找不到 slide "${id}"`)
  return i
}
export function applyPatch(deck, patch) {
  const d = clone(deck)
  switch (patch.op) {
    case 'set-text': {
      if (!['title', 'subtitle', 'notes'].includes(patch.field)) throw new Error(`deck_edit: 非法 field "${patch.field}"`)
      if (typeof patch.value !== 'string') throw new Error('deck_edit: set-text 的 value 必须是字符串')
      d.slides[find(d, patch.slideId)][patch.field] = patch.value
      return d
    }
    case 'set-body': {
      if (!Array.isArray(patch.body) || patch.body.some(x => typeof x !== 'string')) throw new Error('deck_edit: body 必须是字符串数组')
      d.slides[find(d, patch.slideId)].body = [...patch.body]
      return d
    }
    case 'swap-image': {
      if (typeof patch.path !== 'string' || !patch.path) throw new Error('deck_edit: swap-image 需要 path')
      d.slides[find(d, patch.slideId)].image = { path: patch.path, ...(patch.caption != null ? { caption: patch.caption } : {}) }
      return d
    }
    case 'delete-slide':
      d.slides.splice(find(d, patch.slideId), 1)
      return d
    case 'reorder': {
      const map = new Map(d.slides.map(s => [s.id, s]))
      if (!Array.isArray(patch.order) || new Set(patch.order).size !== patch.order.length)
        throw new Error('deck_edit: reorder 不能包含重复 id')
      const next = patch.order.map(id => {
        if (!map.has(id)) throw new Error(`deck_edit: reorder 含未知 id "${id}"`)
        return map.get(id)
      })
      if (next.length !== d.slides.length) throw new Error('deck_edit: reorder 必须含全部 slide')
      d.slides = next
      return d
    }
    case 'add-slide': {
      if (!patch.slide || typeof patch.slide !== 'object') throw new Error('deck_edit: add-slide 需要 slide 对象')
      const s = { ...patch.slide, id: patch.slide.id ?? `s${d.slides.length + 1}` }
      if (d.slides.some(x => x.id === s.id)) throw new Error(`deck_edit: add-slide id "${s.id}" 已存在`)
      const at = patch.after ? find(d, patch.after) + 1 : d.slides.length
      d.slides.splice(at, 0, s)
      return d
    }
    default:
      throw new Error(`deck_edit: 未知 op "${patch.op}"`)
  }
}
