import pptxgen from '../vendor/pptxgen.bundle.mjs'

const hex = (c) => c.replace('#', '')

function addSlide(pptx, s, style, index) {
  const slide = pptx.addSlide()
  const p = style.palette
  slide.background = { color: hex(p.bg) }
  const ink = hex(p.ink), muted = hex(p.muted)
  const accentPool = [p.accent, ...(Array.isArray(style.extras?.accent) ? style.extras.accent : [])]
    .map(hex)
  const accent = accentPool[index % accentPool.length] || hex(p.accent)
  const H = style.fonts.heading, B = style.fonts.body
  const bar = () => slide.addShape(pptx.ShapeType.rect, { x: 0.6, y: 0.45, w: 0.7, h: 0.07, fill: { color: accent } })
  switch (s.layout) {
    case 'cover':
      slide.addShape(pptx.ShapeType.rect, { x: 0.6, y: 2.5, w: 0.8, h: 0.09, fill: { color: accent } })
      slide.addText(s.title ?? '', { x: 0.6, y: 2.7, w: 12, h: 1.6, fontSize: 54, bold: true, color: ink, fontFace: H })
      if (s.subtitle) slide.addText(s.subtitle, { x: 0.6, y: 4.4, w: 12, h: 1, fontSize: 24, color: muted, fontFace: B })
      break
    case 'section':
      bar()
      slide.addText(s.title ?? '', { x: 0.6, y: 2.8, w: 12, h: 2, fontSize: 60, bold: true, color: ink, fontFace: H })
      break
    case 'title-body':
      bar()
      slide.addText(s.title ?? '', { x: 0.6, y: 0.7, w: 12, h: 1, fontSize: 32, bold: true, color: ink, fontFace: H })
      slide.addText((s.body ?? []).map(t => ({ text: t, options: { bullet: true, fontSize: 20, color: ink, fontFace: B, breakLine: true } })), { x: 0.6, y: 1.8, w: 12, h: 5, valign: 'top' })
      break
    case 'two-col':
      bar()
      slide.addText(s.title ?? '', { x: 0.6, y: 0.7, w: 12, h: 1, fontSize: 32, bold: true, color: ink, fontFace: H })
      slide.addText((s.left ?? []).map(t => ({ text: t, options: { bullet: true, fontSize: 18, color: ink, fontFace: B, breakLine: true } })), { x: 0.6, y: 1.8, w: 5.8, h: 5, valign: 'top' })
      slide.addText((s.right ?? []).map(t => ({ text: t, options: { bullet: true, fontSize: 18, color: ink, fontFace: B, breakLine: true } })), { x: 6.8, y: 1.8, w: 5.8, h: 5, valign: 'top' })
      break
    case 'image':
      bar()
      slide.addText(s.title ?? '', { x: 0.6, y: 0.7, w: 12, h: 1, fontSize: 32, bold: true, color: ink, fontFace: H })
      if (s.image?.path) slide.addImage({ path: s.image.path, x: 0.6, y: 1.8, w: 12, h: 4.6, sizing: { type: 'contain', w: 12, h: 4.6 } })
      if (s.image?.caption) slide.addText(s.image.caption, { x: 0.6, y: 6.5, w: 12, h: 0.6, fontSize: 16, color: muted, fontFace: B })
      break
    case 'closing':
      slide.addShape(pptx.ShapeType.rect, { x: 0.6, y: 2.5, w: 0.8, h: 0.09, fill: { color: accent } })
      slide.addText(s.title ?? '', { x: 0.6, y: 2.7, w: 12, h: 2.4, fontSize: 60, bold: true, color: ink, fontFace: H })
      break
  }
  if (s.notes) slide.addNotes(s.notes)
}

export async function renderPptx(deck, style, outPath) {
  const pptx = new pptxgen()
  pptx.layout = 'LAYOUT_WIDE'
  pptx.author = deck.meta.author
  pptx.title = deck.meta.title
  pptx.subject = deck.meta.subject
  for (let index = 0; index < deck.slides.length; index += 1) addSlide(pptx, deck.slides[index], style, index)
  await pptx.writeFile({ fileName: outPath })
  return outPath
}
