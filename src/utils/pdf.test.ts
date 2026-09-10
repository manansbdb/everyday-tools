import { PDFDocument } from 'pdf-lib'
import { describe, expect, it } from 'vitest'
import {
  extractPages,
  getPageCount,
  mergePdfs,
  parsePageRanges,
  reorderPdf,
} from './pdf'

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
}

/** Build a tiny in-memory PDF with `pageCount` blank pages (unique widths). */
async function makePdf(pageCount: number): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create()
  for (let i = 0; i < pageCount; i += 1) {
    doc.addPage([100 + i, 200])
  }
  return toArrayBuffer(await doc.save())
}

async function pageSizes(data: ArrayBuffer | Uint8Array): Promise<Array<[number, number]>> {
  const doc = await PDFDocument.load(data instanceof Uint8Array ? data : data)
  return doc.getPages().map((p) => {
    const { width, height } = p.getSize()
    return [width, height]
  })
}

describe('parsePageRanges', () => {
  it('parses mixed ranges', () => {
    expect(parsePageRanges('1-3,5', 10)).toEqual([0, 1, 2, 4])
  })

  it('parses single pages and reversed ranges', () => {
    expect(parsePageRanges('5,2-4', 10)).toEqual([1, 2, 3, 4])
    expect(parsePageRanges('3-1', 5)).toEqual([0, 1, 2])
  })

  it('dedupes overlapping ranges and sorts', () => {
    expect(parsePageRanges('1-3,2,3-5', 10)).toEqual([0, 1, 2, 3, 4])
  })

  it('ignores empty tokens between commas', () => {
    expect(parsePageRanges('1,,3', 5)).toEqual([0, 2])
  })

  it('throws on empty input', () => {
    expect(() => parsePageRanges('', 5)).toThrow(/Empty ranges/)
    expect(() => parsePageRanges('   ', 5)).toThrow(/Empty ranges/)
  })

  it('throws on out of bounds', () => {
    expect(() => parsePageRanges('1-99', 5)).toThrow(/Out of bounds/)
    expect(() => parsePageRanges('0', 5)).toThrow(/Out of bounds/)
    expect(() => parsePageRanges('6', 5)).toThrow(/Out of bounds/)
  })

  it('throws on invalid tokens', () => {
    expect(() => parsePageRanges('a-b', 5)).toThrow(/Invalid range/)
    expect(() => parsePageRanges('1.5', 5)).toThrow(/Out of bounds/)
  })
})

describe('getPageCount', () => {
  it('returns page count for in-memory PDFs', async () => {
    expect(await getPageCount(await makePdf(1))).toBe(1)
    expect(await getPageCount(await makePdf(3))).toBe(3)
    expect(await getPageCount(await makePdf(7))).toBe(7)
  })
})

describe('mergePdfs', () => {
  it('concatenates pages from multiple PDFs in order', async () => {
    const a = await makePdf(2) // widths 100, 101
    const b = await makePdf(1) // width 100
    const c = await makePdf(3) // widths 100, 101, 102

    const merged = await mergePdfs([a, b, c])
    expect(await getPageCount(toArrayBuffer(merged))).toBe(6)
    expect(await pageSizes(merged)).toEqual([
      [100, 200],
      [101, 200],
      [100, 200],
      [100, 200],
      [101, 200],
      [102, 200],
    ])
  })

  it('merges a single PDF as an identity copy', async () => {
    const a = await makePdf(2)
    const merged = await mergePdfs([a])
    expect(await getPageCount(toArrayBuffer(merged))).toBe(2)
    expect(await pageSizes(merged)).toEqual([
      [100, 200],
      [101, 200],
    ])
  })

  it('returns a loadable PDF when given no files', async () => {
    // pdf-lib save/load of an empty document yields 1 page; just assert it loads.
    const merged = await mergePdfs([])
    const doc = await PDFDocument.load(merged)
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(0)
    expect(merged.byteLength).toBeGreaterThan(0)
  })
})

describe('extractPages', () => {
  it('extracts selected pages preserving order of indexes', async () => {
    const src = await makePdf(4) // widths 100..103
    const out = await extractPages(src, [0, 2, 3])
    expect(await pageSizes(out)).toEqual([
      [100, 200],
      [102, 200],
      [103, 200],
    ])
  })

  it('can extract a single page', async () => {
    const src = await makePdf(3)
    const out = await extractPages(src, [1])
    expect(await pageSizes(out)).toEqual([[101, 200]])
  })

  it('allows duplicate indexes (copies same page twice)', async () => {
    const src = await makePdf(2)
    const out = await extractPages(src, [0, 0, 1])
    expect(await pageSizes(out)).toEqual([
      [100, 200],
      [100, 200],
      [101, 200],
    ])
  })
})

describe('reorderPdf', () => {
  it('reorders pages according to the given index list', async () => {
    const src = await makePdf(3)
    const out = await reorderPdf(src, [2, 0, 1])
    expect(await pageSizes(out)).toEqual([
      [102, 200],
      [100, 200],
      [101, 200],
    ])
  })

  it('can reverse pages', async () => {
    const src = await makePdf(4)
    const out = await reorderPdf(src, [3, 2, 1, 0])
    expect(await pageSizes(out)).toEqual([
      [103, 200],
      [102, 200],
      [101, 200],
      [100, 200],
    ])
  })

  it('delegates to extractPages (subset reorder)', async () => {
    const src = await makePdf(5)
    const out = await reorderPdf(src, [4, 1])
    expect(await pageSizes(out)).toEqual([
      [104, 200],
      [101, 200],
    ])
  })
})
