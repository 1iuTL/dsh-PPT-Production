import { pathToFileURL } from 'node:url'
import { slideColors } from './slide-colors.mjs'

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ESC[c])
// 字体名只允许安全字符，防止 CSS 注入（L4）
const safeFont = (s) => String(s ?? '').replace(/['"\\;{}()<>&:]/g, '')

function imgSrc(p) {
  const value = String(p ?? '')
  if (!value) return ''
  if (/^[a-zA-Z]:[\\/]/.test(value) || value.startsWith('\\\\') || value.startsWith('/')) {
    try { return pathToFileURL(value).href } catch { return value }
  }
  return value
}

function slideInner(s) {
  const title = `<h1>${esc(s.title)}</h1>`
  switch (s.layout) {
    case 'cover': return `${title}${s.subtitle ? `<p class="sub">${esc(s.subtitle)}</p>` : ''}`
    case 'section': return `<div class="sec">${title}</div>`
    case 'title-body': return `${title}<ul>${(s.body ?? []).map(b => `<li>${esc(b)}</li>`).join('')}</ul>`
    case 'two-col': return `${title}<div class="cols"><ul>${(s.left ?? []).map(b => `<li>${esc(b)}</li>`).join('')}</ul><ul>${(s.right ?? []).map(b => `<li>${esc(b)}</li>`).join('')}</ul></div>`
    case 'image': return `${title}${s.image ? `<img src="${esc(imgSrc(s.image.path))}" alt="">` : ''}${s.image?.caption ? `<p class="cap">${esc(s.image.caption)}</p>` : ''}`
    case 'closing': return `<div class="close">${title}</div>`
    default: return title
  }
}

export function renderHtml(deck, style) {
  const p = style.palette
  const css = `body{margin:0;background:#222;font-family:'${safeFont(style.fonts.body)}',sans-serif}
section{width:1280px;height:720px;margin:24px auto;background:var(--slide-bg,${p.bg});color:var(--slide-ink,${p.ink});padding:64px;box-sizing:border-box;position:relative;overflow:hidden}
h1{font-family:'${safeFont(style.fonts.heading)}';font-size:44px;margin:0 0 24px}
.sub{color:${p.muted};font-size:24px}.sec h1,.close h1{font-size:64px}
ul{font-size:24px;line-height:1.7}.cols{display:flex;gap:48px}.cols ul{flex:1}
img{max-width:100%;max-height:480px}.cap{color:${p.muted};font-size:18px}
section::before{content:'';position:absolute;left:64px;top:48px;width:64px;height:6px;background:var(--slide-accent,${p.accent})}`
  const sections = deck.slides.map((s, i) => {
    const colors = slideColors(style, s.layout, i)
    return `<section style="--slide-accent:#${colors.accent};--slide-bg:#${colors.bg};--slide-ink:#${colors.ink};">${slideInner(s)}</section>`
  }).join('\n')
  return `<!DOCTYPE html>\n<html lang="zh"><head><meta charset="utf-8"><title>${esc(deck.meta.title)}</title><style>${css}</style></head><body>\n${sections}\n</body></html>`
}
