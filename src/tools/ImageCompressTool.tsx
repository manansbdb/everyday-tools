import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import { FileDropzone } from '../components/common/FileDropzone'
import { Alert } from '../components/common/Alert'
import { useI18n } from '../i18n/useI18n'
import { ACCEPTED_IMAGE_TYPES, LIMITS } from '../utils/limits'
import { downloadBlob, formatBytes, stemAndExt } from '../utils/format'

interface ResultRow {
  name: string
  originalSize: number
  resultSize: number
  blob: Blob
  outName: string
}

export function ImageCompressTool() {
  const { t } = useI18n()
  const [files, setFiles] = useState<File[]>([])
  const [quality, setQuality] = useState(0.7)
  const [maxWidth, setMaxWidth] = useState('')
  const [maxHeight, setMaxHeight] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<ResultRow[]>([])

  const onFiles = (incoming: File[]) => {
    setError(null)
    const next: File[] = []
    for (const f of incoming) {
      if (!ACCEPTED_IMAGE_TYPES.includes(f.type as (typeof ACCEPTED_IMAGE_TYPES)[number]) && !f.type.startsWith('image/')) {
        setError(`${t.errorUnsupported}: ${f.name}`)
        continue
      }
      if (f.size > LIMITS.IMAGE_MAX_BYTES) {
        setError(`${t.errorTooLarge}: ${f.name} (${formatBytes(f.size)})`)
        continue
      }
      next.push(f)
    }
    setFiles((prev) => [...prev, ...next].slice(0, LIMITS.IMAGE_MAX_FILES))
  }

  const process = async () => {
    if (files.length === 0) {
      setError(t.errorEmpty)
      return
    }
    setBusy(true)
    setError(null)
    const rows: ResultRow[] = []
    try {
      for (const file of files) {
        const options: Parameters<typeof imageCompression>[1] = {
          maxSizeMB: Math.max(0.1, (file.size / (1024 * 1024)) * quality),
          initialQuality: quality,
          useWebWorker: true,
          fileType: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        }
        const w = Number(maxWidth)
        const h = Number(maxHeight)
        if (Number.isFinite(w) && w > 0) options.maxWidthOrHeight = w
        // library uses single maxWidthOrHeight; prefer the smaller constraint if both set
        if (Number.isFinite(h) && h > 0) {
          options.maxWidthOrHeight = options.maxWidthOrHeight
            ? Math.min(options.maxWidthOrHeight, h)
            : h
        }
        const compressed = await imageCompression(file, options)
        const { stem, ext } = stemAndExt(file.name)
        const outExt = compressed.type === 'image/png' ? '.png' : compressed.type === 'image/webp' ? '.webp' : '.jpg'
        const outName = `${stem}-compressed${outExt || ext || '.jpg'}`
        rows.push({
          name: file.name,
          originalSize: file.size,
          resultSize: compressed.size,
          blob: compressed,
          outName,
        })
      }
      setResults(rows)
    } catch {
      setError(t.errorGeneric)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="howto">
        <p>{t.tools.imageCompress.howto}</p>
        <p className="muted">{t.tools.imageCompress.example}</p>
        <p>
          <strong>{t.limits}:</strong> {t.imageLimit}
        </p>
      </div>

      <FileDropzone
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        onFiles={onFiles}
        hint={t.imageLimit}
      />

      {files.length > 0 ? (
        <ul className="file-list">
          {files.map((f) => (
            <li key={`${f.name}-${f.size}-${f.lastModified}`}>
              <span>
                {f.name} · {formatBytes(f.size)}
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setFiles((prev) => prev.filter((x) => x !== f))}
              >
                {t.remove}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid-2" style={{ marginTop: '1rem' }}>
        <div className="field">
          <label htmlFor="quality">
            {t.quality}: {quality.toFixed(2)}
          </label>
          <input
            id="quality"
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
          />
        </div>
        <div className="field">
          <label htmlFor="maxW">
            {t.maxWidth} ({t.optional})
          </label>
          <input
            id="maxW"
            type="number"
            min={1}
            placeholder="1920"
            value={maxWidth}
            onChange={(e) => setMaxWidth(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="maxH">
            {t.maxHeight} ({t.optional})
          </label>
          <input
            id="maxH"
            type="number"
            min={1}
            placeholder="1080"
            value={maxHeight}
            onChange={(e) => setMaxHeight(e.target.value)}
          />
        </div>
      </div>

      <div className="btn-row">
        <button type="button" className="btn" disabled={busy || files.length === 0} onClick={process}>
          {busy ? t.processing : t.process}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setFiles([])
            setResults([])
            setError(null)
          }}
        >
          {t.clear}
        </button>
      </div>

      {error ? <Alert type="error">{error}</Alert> : null}

      {results.length > 0 ? (
        <div className="panel" style={{ marginTop: '1rem' }}>
          <h3>{t.result}</h3>
          <table className="results-table">
            <thead>
              <tr>
                <th>{t.original}</th>
                <th>{t.result}</th>
                <th>{t.savings}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const saved = r.originalSize - r.resultSize
                const pct = r.originalSize ? Math.round((saved / r.originalSize) * 100) : 0
                return (
                  <tr key={r.outName}>
                    <td>
                      {r.name}
                      <br />
                      <span className="muted">{formatBytes(r.originalSize)}</span>
                    </td>
                    <td>
                      {r.outName}
                      <br />
                      <span className="muted">{formatBytes(r.resultSize)}</span>
                    </td>
                    <td>
                      {formatBytes(Math.max(0, saved))} ({pct}%)
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => downloadBlob(r.blob, r.outName)}
                      >
                        {t.download}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="muted">{t.noResultsYet}</p>
      )}
    </div>
  )
}
