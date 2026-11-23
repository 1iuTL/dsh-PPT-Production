const MAX_SLIDES = 60

export function normalizePlan(input) {
  if (!input || typeof input !== 'object') throw new Error('deck_plan: plan 必须是对象')
  const title = String(input.title ?? '').trim()
  if (!title) throw new Error('deck_plan: plan.title 不能为空')
  const rawSlides = Array.isArray(input.slides) ? input.slides : []
  if (rawSlides.length === 0) throw new Error('deck_plan: plan.slides 必须是非空数组')
  if (rawSlides.length > MAX_SLIDES) throw new Error(`deck_plan: 最多 ${MAX_SLIDES} 页`)
  const slides = rawSlides.map((raw, i) => {
    if (!raw || typeof raw !== 'object') throw new Error(`deck_plan: slide ${i + 1} 必须是对象`)
    const slideTitle = String(raw.title ?? '').trim()
    if (!slideTitle) throw new Error(`deck_plan: slide ${i + 1} 缺少 title`)
    const bullets = Array.isArray(raw.bullets)
      ? raw.bullets.map(x => String(x).trim()).filter(Boolean)
      : []
    return {
      id: String(raw.id ?? `p${i + 1}`),
      title: slideTitle,
      bullets,
      ...(raw.notes != null && String(raw.notes).trim() ? { notes: String(raw.notes).trim() } : {}),
    }
  })
  return {
    title,
    audience: input.audience != null ? String(input.audience).trim() : '',
    ...(input.recommendedStyle != null && String(input.recommendedStyle).trim()
      ? { recommendedStyle: String(input.recommendedStyle).trim() }
      : {}),
    slides,
  }
}
