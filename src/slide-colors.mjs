// PPTX 与 HTML 共用的逐页颜色选择，避免预览与交付物不一致。
const clean = (color) => String(color || '').replace('#', '')
const extrasOf = (style, key) => Array.isArray(style.extras?.[key]) ? style.extras[key] : []

function luminance(color) {
  const value = clean(color)
  const channels = [0, 2, 4].map(offset => parseInt(value.slice(offset, offset + 2), 16) / 255)
  const linear = channels.map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

export function contrastRatio(a, b) {
  const high = Math.max(luminance(a), luminance(b))
  const low = Math.min(luminance(a), luminance(b))
  return (high + 0.05) / (low + 0.05)
}

function readableInk(bg, candidates) {
  for (const candidate of candidates) {
    if (candidate && contrastRatio(bg, candidate) >= 3) return clean(candidate)
  }
  // 大标题最低 3:1；候选都不合格时选择可读的黑/白兜底。
  return contrastRatio(bg, '#FFFFFF') >= contrastRatio(bg, '#000000') ? 'FFFFFF' : '000000'
}

export function slideColors(style, layout, index) {
  const palette = style.palette
  const baseBg = clean(palette.bg)
  const bgExtras = extrasOf(style, 'bg')
  const useExtraBg = (layout === 'section' || layout === 'closing') && bgExtras.length > 0
  const bg = useExtraBg ? clean(bgExtras[index % bgExtras.length]) : baseBg

  const inkExtras = extrasOf(style, 'ink')
  const shift = inkExtras.length ? index % inkExtras.length : 0
  const candidates = useExtraBg
    ? [...inkExtras.slice(shift), ...inkExtras.slice(0, shift), palette.ink]
    : [palette.ink]
  const ink = readableInk(bg, candidates)

  const accentPool = [palette.accent, ...extrasOf(style, 'accent')]
  const accent = clean(accentPool[index % accentPool.length] || palette.accent)
  return { bg, ink, accent }
}
