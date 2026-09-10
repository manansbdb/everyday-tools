import { useMemo, useState } from 'react'
import { FileDropzone } from '../components/common/FileDropzone'
import { Alert } from '../components/common/Alert'
import { useI18n } from '../i18n/useI18n'
import { LIMITS } from '../utils/limits'
import { downloadBlob, formatBytes } from '../utils/format'
import { bytesToBlob } from '../utils/blob'
import {
  extractPages,
  getPageCount,
  mergePdfs,
  parsePageRanges,
  reorderPdf,
} from '../utils/pdf'

type Mode = 'merge' | 'split' | 'reorder'

interface PdfItem {
  id: string
  file: File
  pageCount?: number
}

export function PdfTool() {
  const { t } = useI18n()
  const [mode, setMode] = useState<Mode>('merge')
  const [items, setItems] = useState<PdfItem[]>([])
  const [ranges, setRanges] = useState('1-1')
  const [order, setOrder] = useState<number[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onFiles = async (incoming: File[]) => {
    setError(null)
    const accepted: PdfItem[] = []
    for (const file of incoming) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setError(`${t.errorUnsupported}: ${file.name}`)
        continue
      }
      if (file.size > LIMITS.PDF_MAX_BYTES) {
        setError(`${t.errorTooLarge}: ${file.name}`)
        continue
      }
      try {
        const buf = await file.arrayBuffer()
        const pageCount = await getPageCount(buf)
        accepted.push({
          id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
          file,
          pageCount,
        })
      } catch {
        setError(`${t.errorUnsupported}: ${file.name}`)
      }
    }
    setItems((prev) => {
      const next = mode === 'merge' ? [...prev, ...accepted] : accepted.slice(0, 1)
      return next.slice(0, LIMITS.PDF_MAX_FILES)
    })
    if (mode !== 'merge' && accepted[0]?.pageCount) {
      setOrder(Array.from({ length: accepted[0].pageCount }, (_, i) => i))
      setRanges(`1-${accepted[0].pageCount}`)
    }
  }

  const move = (index: number, dir: -1 | 1) => {
    setOrder((prev) => {
      const next = [...prev]
      const j = index + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[index], next[j]] = [next[j], next[index]]
      return next
    })
  }

  const single = items[0]

  const process = async () => {
    setError(null)
    if (items.length === 0) {
      setError(t.errorEmpty)
      return
    }
    setBusy(true)
    try {
      if (mode === 'merge') {
        const buffers = await Promise.all(items.map((i) => i.file.arrayBuffer()))
        const bytes = await mergePdfs(buffers)
        downloadBlob(bytesToBlob(bytes, 'application/pdf'), 'merged.pdf')
      } else if (mode === 'split') {
        if (!single?.pageCount) throw new Error('no pdf')
        const indexes = parsePageRanges(ranges, single.pageCount)
        const bytes = await extractPages(await single.file.arrayBuffer(), indexes)
        downloadBlob(bytesToBlob(bytes, 'application/pdf'), 'split.pdf')
      } else {
        if (!single) throw new Error('no pdf')
        const bytes = await reorderPdf(await single.file.arrayBuffer(), order)
        downloadBlob(bytesToBlob(bytes, 'application/pdf'), 'reordered.pdf')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t.errorGeneric)
    } finally {
      setBusy(false)
    }
  }

  const modeLabel = useMemo(
    () => ({ merge: t.merge, split: t.split, reorder: t.reorder }),
    [t],
  )

  return (
    <div>
      <div className="howto">
        <p>{t.tools.pdf.howto}</p>
        <p className="muted">{t.tools.pdf.example}</p>
        <p>
          <strong>{t.limits}:</strong> {t.pdfLimit}
        </p>
      </div>

      <div className="tabs">
        {(['merge', 'split', 'reorder'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            className={mode === m ? 'active' : ''}
            onClick={() => {
              setMode(m)
              setItems([])
              setOrder([])
              setError(null)
            }}
          >
            {modeLabel[m]}
          </button>
        ))}
      </div>

      <FileDropzone
        accept="application/pdf,.pdf"
        multiple={mode === 'merge'}
        onFiles={onFiles}
        hint={t.pdfLimit}
      />

      {items.length > 0 ? (
        <ul className="file-list">
          {items.map((item, idx) => (
            <li key={item.id}>
              <span>
                {idx + 1}. {item.file.name} · {formatBytes(item.file.size)}
                {item.pageCount != null ? ` · ${item.pageCount} pages` : ''}
              </span>
              <div className="btn-row">
                {mode === 'merge' ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={idx === 0}
                      onClick={() =>
                        setItems((prev) => {
                          const next = [...prev]
                          ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
                          return next
                        })
                      }
                    >
                      {t.moveUp}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={idx === items.length - 1}
                      onClick={() =>
                        setItems((prev) => {
                          const next = [...prev]
                          ;[next[idx + 1], next[idx]] = [next[idx], next[idx + 1]]
                          return next
                        })
                      }
                    >
                      {t.moveDown}
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setItems((prev) => prev.filter((x) => x.id !== item.id))}
                >
                  {t.remove}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {mode === 'split' && single ? (
        <div className="field" style={{ marginTop: '1rem' }}>
          <label htmlFor="ranges">{t.pageRanges}</label>
          <input id="ranges" value={ranges} onChange={(e) => setRanges(e.target.value)} />
        </div>
      ) : null}

      {mode === 'reorder' && order.length > 0 ? (
        <ul className="file-list">
          {order.map((pageIndex, idx) => (
            <li key={`${pageIndex}-${idx}`}>
              <span>Page {pageIndex + 1}</span>
              <div className="btn-row">
                <button type="button" className="btn btn-secondary" disabled={idx === 0} onClick={() => move(idx, -1)}>
                  {t.moveUp}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={idx === order.length - 1}
                  onClick={() => move(idx, 1)}
                >
                  {t.moveDown}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="btn-row" style={{ marginTop: '1rem' }}>
        <button type="button" className="btn" disabled={busy || items.length === 0} onClick={process}>
          {busy ? t.processing : t.download}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setItems([])
            setOrder([])
            setError(null)
          }}
        >
          {t.clear}
        </button>
      </div>

      {error ? <Alert type="error">{error}</Alert> : null}
    </div>
  )
}
