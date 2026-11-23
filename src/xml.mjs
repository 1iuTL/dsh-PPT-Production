const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }
function decode(s) {
  return s.replace(/&(#x?[0-9a-fA-F]+|amp|lt|gt|quot|apos);/g, (_, g) => {
    if (g[0] === '#') {
      const code = g[1] === 'x' ? parseInt(g.slice(2), 16) : parseInt(g.slice(1), 10)
      return String.fromCodePoint(code)
    }
    return NAMED[g]
  })
}
export function extractSlideText(xml) {
  const texts = []
  const re = /<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g
  let m
  while ((m = re.exec(xml))) texts.push(decode(m[1]))
  return {
    texts,
    shapeCount: (xml.match(/<p:sp\b/g) || []).length,
    pictureCount: (xml.match(/<p:pic\b/g) || []).length,
  }
}
