import pptxgen from '../vendor/pptxgen.bundle.mjs'
import { readFileSync } from 'node:fs'
import { inflateRawSync } from 'node:zlib'

const deck = JSON.parse(readFileSync(new URL('../tests/fixtures/sample-deck.json', import.meta.url), 'utf8'))
const pptx = new pptxgen()
pptx.layout = 'LAYOUT_WIDE'
if (!pptx.ShapeType || typeof pptx.ShapeType.rect !== 'string') {
  throw new Error('spike FAIL: pptx.ShapeType.rect 不可用')
}
for (const s of deck.slides) {
  const slide = pptx.addSlide()
  slide.addShape(pptx.ShapeType.rect, { x: 0.6, y: 0.45, w: 0.7, h: 0.07, fill: { color: 'FF6900' } })
  slide.addText(s.title, { x: 0.6, y: 0.5, w: 12, h: 1, fontSize: 32, bold: true })
  if (s.body) slide.addText(s.body.map(t => ({ text: t, options: { bullet: true, breakLine: true } })), { x: 0.6, y: 1.7, w: 12, h: 5 })
  if (s.notes) slide.addNotes(s.notes)
}
await pptx.writeFile({ fileName: 'scripts/spike-out.pptx' })

const buf = readFileSync('scripts/spike-out.pptx')
let eocd = -1
for (let i = buf.length - 22; i >= 0; i--) if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break }
if (eocd < 0) throw new Error('spike FAIL: EOCD not found')
const count = buf.readUInt16LE(eocd + 10)
let ptr = buf.readUInt32LE(eocd + 16)
let slideXml = ''
const names = []
for (let n = 0; n < count; n++) {
  const nameLen = buf.readUInt16LE(ptr + 28), extraLen = buf.readUInt16LE(ptr + 30), commentLen = buf.readUInt16LE(ptr + 32)
  const name = buf.toString('utf8', ptr + 46, ptr + 46 + nameLen)
  names.push(name)
  const method = buf.readUInt16LE(ptr + 10), compSize = buf.readUInt32LE(ptr + 20), lo = buf.readUInt32LE(ptr + 42)
  if (name === 'ppt/slides/slide1.xml') {
    const lnl = buf.readUInt16LE(lo + 26), lel = buf.readUInt16LE(lo + 28)
    const ds = lo + 30 + lnl + lel
    const comp = buf.subarray(ds, ds + compSize)
    slideXml = (method === 0 ? comp : inflateRawSync(comp)).toString('utf8')
  }
  ptr += 46 + nameLen + extraLen + commentLen
}
if (!/<a:t>原生可编辑验证<\/a:t>/.test(slideXml)) throw new Error('spike FAIL: 无真实文本 run')
if (!names.some(n => n.startsWith('ppt/notesSlides/'))) throw new Error('spike FAIL: 无备注页')
console.log('spike PASS: pptx 含真实 <a:t> 文本框，ShapeType.rect 可用，含备注')
