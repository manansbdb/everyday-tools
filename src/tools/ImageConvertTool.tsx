import { useState } from 'react'
import { FileDropzone } from '../components/common/FileDropzone'
import { Alert } from '../components/common/Alert'
import { useI18n } from '../i18n/I18nContext'
import {
  ACCEPTED_IMAGE_TYPES,
  CONVERT_OUTPUT_FORMATS,
  LIMITS,
  type ConvertOutputFormat,
} from '../utils/limits'
import { downloadBlob, formatBytes, stemAndExt } from '../utils/format'

interface ResultRow {
  name: string
  originalSize: number
  resultSize: number
  blob: Blob
  outName: string
}

function extFor(mime: ConvertOutputFormat): string {
  if (mime === 'image/png') return '.png'
  if (mime === 'image/webp') return '.webp'
  return '.jpg'
}

async function convertImage(file: File, mime: ConvertOutputFormat, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')
  if (mime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mime, quality),
  )
  if (!blob) throw new Error('Conversion failed')
  return blob
}

export function ImageConvertTool() {
  const { t } = useI18n()
  const [files, setFiles] = useState<File[]>([])
  const [format, setFormat] = useState<ConvertOutputFormat>('image/webp')
  const [quality, setQuality] = useState(0.9)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<ResultRow[]>([])

  const onFiles = (incoming: File[]) => {
    setError(null)
    const next: File[] = []
    for (const f of incoming) {
      const okType =
        ACCEPTED_IMAGE_TYPES.includes(f.type as (typeof ACCEPTED_IMAGE_TYPES)[number]) ||
        f.type.startsWith('image/')
      if (!okType) {
        setError(`${t.errorUnsupported}: ${f.name} (${f.type || 'unknown'})`)
        continue
      }
      if (f.size > LIMITS.IMAGE_MAX_BYTES) {
        setError(`${t.errorTooLarge}: ${f.name}`)
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
        const blob = await convertImage(file, format, quality)
        const { stem } = stemAndExt(file.name)
        const outName = `${stem}-converted${extFor(format)}`
        rows.push({
          name: file.name,
          originalSize: file.size,
          resultSize: blob.size,
          blob,
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
        <p>{t.tools.imageConvert.howto}</p>
        <p className="muted">{t.tools.imageConvert.example}</p>
        <p>
          <strong>{t.limits}:</strong> {t.imageLimit}
        </p>
      </div>

      <FileDropzone accept="image/*" onFiles={onFiles} hint={t.imageLimit} />

      {files.length > 0 ? (
        <ul className="file-list">
          {files.map((f) => (
            <li key={`${f.name}-${f.size}-${f.lastModified}`}>
              <span>
                {f.name} · {formatBytes(f.size)} · {f.type || 'unknown'}
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
          <label htmlFor="fmt">{t.outputFormat}</label>
          <select
            id="fmt"
            value={format}
            onChange={(e) => setFormat(e.target.value as ConvertOutputFormat)}
          >
            {CONVERT_OUTPUT_FORMATS.map((m) => (
              <option key={m} value={m}>
                {m.replace('image/', '').toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="cq">
            {t.quality}: {quality.toFixed(2)}
          </label>
          <input
            id="cq"
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            disabled={format === 'image/png'}
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
          <table className="results-table">
            <thead>
              <tr>
                <th>{t.original}</th>
                <th>{t.result}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
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
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => downloadBlob(r.blob, r.outName)}
                    >
                      {t.download}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="muted">{t.noResultsYet}</p>
      )}
    </div>
  )
}
