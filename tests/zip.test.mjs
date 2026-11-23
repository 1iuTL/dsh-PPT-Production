import { test } from 'node:test'
import assert from 'node:assert/strict'
import { deflateRawSync } from 'node:zlib'
import { unzip } from '../src/zip.mjs'

// 手工构造一个最小 ZIP（两个条目：stored + deflate），不依赖任何写库
function makeZip(entries) {
  const locals = [], centrals = []
  let offset = 0
  for (const [name, data, method] of entries) {
    const nameBuf = Buffer.from(name, 'utf8')
    const comp = method === 0 ? data : deflateRawSync(data)
    const lh = Buffer.alloc(30)
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0, 6)
    lh.writeUInt16LE(method, 8); lh.writeUInt32LE(0, 10); lh.writeUInt32LE(0, 14)
    lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(data.length, 22)
    lh.writeUInt16LE(nameBuf.length, 26); lh.writeUInt16LE(0, 28)
    locals.push(lh, nameBuf, comp)
    const ch = Buffer.alloc(46)
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6)
    ch.writeUInt16LE(method, 10); ch.writeUInt32LE(comp.length, 20); ch.writeUInt32LE(data.length, 24)
    ch.writeUInt16LE(nameBuf.length, 28); ch.writeUInt32LE(offset, 42)
    centrals.push(ch, nameBuf)
    offset += lh.length + nameBuf.length + comp.length
  }
  const localBuf = Buffer.concat(locals)
  const centralBuf = Buffer.concat(centrals)
  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(entries.length, 8); eocd.writeUInt16LE(entries.length, 10)
  eocd.writeUInt32LE(centralBuf.length, 12); eocd.writeUInt32LE(localBuf.length, 16)
  return Buffer.concat([localBuf, centralBuf, eocd])
}

test('解出 stored 与 deflate 条目', () => {
  const zip = makeZip([['a.txt', Buffer.from('hello'), 0], ['b.txt', Buffer.from('世界'.repeat(50)), 8]])
  const m = unzip(zip)
  assert.equal(m.get('a.txt').toString('utf8'), 'hello')
  assert.equal(m.get('b.txt').toString('utf8'), '世界'.repeat(50))
})
test('非 ZIP 抛错', () => { assert.throws(() => unzip(Buffer.from('not a zip'))) })
