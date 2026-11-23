import { readFileSync } from 'node:fs'
import { unzip } from './zip.mjs'
import { extractSlideText } from './xml.mjs'

export function readPptx(path) {
  const entries = unzip(readFileSync(path))
  const slideKeys = [...entries.keys()]
    .filter(k => /^ppt\/slides\/slide\d+\.xml$/.test(k))
    .sort((a, b) => parseInt(a.match(/slide(\d+)/)[1], 10) - parseInt(b.match(/slide(\d+)/)[1], 10))
  const slides = slideKeys.map((k, i) => ({ index: i + 1, ...extractSlideText(entries.get(k).toString('utf8')) }))
  return { slideCount: slides.length, slides }
}
