import { inflateRawSync } from 'node:zlib'

export function unzip(buf) {
  let eocd = -1
  for (let i = buf.length - 22; i >= 0; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break }
  }
  if (eocd < 0) throw new Error('zip: EOCD not found')
  const count = buf.readUInt16LE(eocd + 10)
  let ptr = buf.readUInt32LE(eocd + 16)
  const out = new Map()
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(ptr) !== 0x02014b50) throw new Error('zip: bad central header')
    const method = buf.readUInt16LE(ptr + 10)
    const compSize = buf.readUInt32LE(ptr + 20)
    const nameLen = buf.readUInt16LE(ptr + 28)
    const extraLen = buf.readUInt16LE(ptr + 30)
    const commentLen = buf.readUInt16LE(ptr + 32)
    const localOffset = buf.readUInt32LE(ptr + 42)
    const name = buf.toString('utf8', ptr + 46, ptr + 46 + nameLen)
    if (buf.readUInt32LE(localOffset) !== 0x04034b50) throw new Error('zip: bad local header')
    const lNameLen = buf.readUInt16LE(localOffset + 26)
    const lExtraLen = buf.readUInt16LE(localOffset + 28)
    const dataStart = localOffset + 30 + lNameLen + lExtraLen
    const comp = buf.subarray(dataStart, dataStart + compSize)
    out.set(name, method === 0 ? Buffer.from(comp) : inflateRawSync(comp))
    ptr += 46 + nameLen + extraLen + commentLen
  }
  return out
}
