import { PDFDocument } from 'pdf-lib'

/** Parse ranges like "1-3,5,8-9" (1-based, inclusive) into 0-based page indexes. */
export function parsePageRanges(input: string, pageCount: number): number[] {
  const trimmed = input.trim()
  if (!trimmed) throw new Error('Empty ranges')
  const indexes = new Set<number>()
  for (const part of trimmed.split(',')) {
    const token = part.trim()
    if (!token) continue
    if (token.includes('-')) {
      const [a, b] = token.split('-').map((s) => Number(s.trim()))
      if (!Number.isInteger(a) || !Number.isInteger(b)) throw new Error(`Invalid range: ${token}`)
      const start = Math.min(a, b)
      const end = Math.max(a, b)
      if (start < 1 || end > pageCount) throw new Error(`Out of bounds: ${token}`)
      for (let p = start; p <= end; p += 1) indexes.add(p - 1)
    } else {
      const n = Number(token)
      if (!Number.isInteger(n) || n < 1 || n > pageCount) throw new Error(`Out of bounds: ${token}`)
      indexes.add(n - 1)
    }
  }
  return Array.from(indexes).sort((x, y) => x - y)
}

export async function mergePdfs(files: ArrayBuffer[]): Promise<Uint8Array> {
  const out = await PDFDocument.create()
  for (const data of files) {
    const doc = await PDFDocument.load(data, { ignoreEncryption: true })
    const pages = await out.copyPages(doc, doc.getPageIndices())
    pages.forEach((p) => out.addPage(p))
  }
  return out.save()
}

export async function extractPages(
  data: ArrayBuffer,
  pageIndexes: number[],
): Promise<Uint8Array> {
  const src = await PDFDocument.load(data, { ignoreEncryption: true })
  const out = await PDFDocument.create()
  const pages = await out.copyPages(src, pageIndexes)
  pages.forEach((p) => out.addPage(p))
  return out.save()
}

export async function reorderPdf(
  data: ArrayBuffer,
  order: number[],
): Promise<Uint8Array> {
  return extractPages(data, order)
}

export async function getPageCount(data: ArrayBuffer): Promise<number> {
  const doc = await PDFDocument.load(data, { ignoreEncryption: true })
  return doc.getPageCount()
}
