export const LAYOUTS = ['cover', 'section', 'title-body', 'two-col', 'image', 'closing']

export function normalizeDeck(input) {
  const src = input && typeof input === 'object' ? input : {}
  const slides = Array.isArray(src.slides) ? src.slides : []
  return {
    meta: {
      title: src.meta?.title ?? '未命名演示',
      author: src.meta?.author ?? 'PPT 工作台',
      subject: src.meta?.subject ?? '',
      createdAt: src.meta?.createdAt ?? new Date().toISOString(),
    },
    style: typeof src.style === 'string' ? src.style : 'ink-paper',
    ...(src.styleOverrides && typeof src.styleOverrides === 'object' && !Array.isArray(src.styleOverrides)
      ? { styleOverrides: { ...src.styleOverrides } }
      : {}),
    slides: slides.map((s, i) => ({ ...s, id: s.id ?? `s${i + 1}` })),
  }
}

const HEX = /^#[0-9A-Fa-f]{6}$/
const OVERRIDE_COLORS = ['bg', 'ink', 'accent', 'muted', 'line']

export function validateDeck(deck) {
  const errors = []
  if (!deck || typeof deck !== 'object') return { ok: false, errors: ['deck 必须是对象'] }
  if (!Array.isArray(deck.slides) || deck.slides.length === 0) errors.push('slides 必须是非空数组')
  if (deck.styleOverrides != null) {
    if (typeof deck.styleOverrides !== 'object' || Array.isArray(deck.styleOverrides)) {
      errors.push('styleOverrides 必须是对象')
    } else {
      for (const key of OVERRIDE_COLORS) {
        const value = deck.styleOverrides[key]
        if (value != null && !HEX.test(String(value))) errors.push(`styleOverrides.${key} 必须是 #RRGGBB`)
      }
      for (const key of ['heading', 'body']) {
        const value = deck.styleOverrides.fonts?.[key]
        if (value != null && typeof value !== 'string') errors.push(`styleOverrides.fonts.${key} 必须是字符串`)
      }
    }
  }
  const ids = new Set()
  for (const s of deck.slides ?? []) {
    if (!LAYOUTS.includes(s.layout)) errors.push(`slide ${s.id ?? '?'}: 非法 layout "${s.layout}"`)
    if (s.id != null) {
      if (typeof s.id !== 'string') errors.push(`slide ${s.id}: id 必须是字符串`)
      else if (ids.has(s.id)) errors.push(`slide ${s.id}: 重复的 slide id`)
      else ids.add(s.id)
    }
    if (s.title != null && typeof s.title !== 'string') errors.push(`slide ${s.id ?? '?'}: title 必须是字符串`)
    if (s.subtitle != null && typeof s.subtitle !== 'string') errors.push(`slide ${s.id ?? '?'}: subtitle 必须是字符串`)
    if (s.notes != null && typeof s.notes !== 'string') errors.push(`slide ${s.id ?? '?'}: notes 必须是字符串`)
    if (s.body != null && (!Array.isArray(s.body) || s.body.some(x => typeof x !== 'string')))
      errors.push(`slide ${s.id ?? '?'}: body 必须是字符串数组`)
    for (const field of ['left', 'right']) {
      const value = s[field]
      if (value != null && (!Array.isArray(value) || value.some(x => typeof x !== 'string')))
        errors.push(`slide ${s.id ?? '?'}: ${field} 必须是字符串数组`)
    }
    if (s.image != null && (typeof s.image !== 'object' || typeof s.image.path !== 'string'))
      errors.push(`slide ${s.id ?? '?'}: image.path 必须是字符串`)
  }
  return { ok: errors.length === 0, errors }
}
