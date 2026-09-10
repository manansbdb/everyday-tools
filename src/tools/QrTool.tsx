import { useState } from 'react'
import QRCode from 'qrcode'
import { Alert } from '../components/common/Alert'
import { useI18n } from '../i18n/I18nContext'
import { downloadBlob } from '../utils/format'

export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 512,
    color: { dark: '#0f172a', light: '#ffffff' },
  })
}

export async function generateQrSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
    color: { dark: '#0f172a', light: '#ffffff' },
  })
}

export function QrTool() {
  const { t } = useI18n()
  const [text, setText] = useState('https://example.com')
  const [pngUrl, setPngUrl] = useState<string | null>(null)
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const generate = async () => {
    if (!text.trim()) {
      setError(t.errorEmpty)
      return
    }
    setBusy(true)
    setError(null)
    try {
      const [dataUrl, svgStr] = await Promise.all([
        generateQrDataUrl(text.trim()),
        generateQrSvg(text.trim()),
      ])
      setPngUrl(dataUrl)
      setSvg(svgStr)
    } catch {
      setError(t.errorGeneric)
    } finally {
      setBusy(false)
    }
  }

  const downloadPng = () => {
    if (!pngUrl) return
    const bin = atob(pngUrl.split(',')[1] ?? '')
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i)
    downloadBlob(new Blob([bytes], { type: 'image/png' }), 'qrcode.png')
  }

  const downloadSvg = () => {
    if (!svg) return
    downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), 'qrcode.svg')
  }

  return (
    <div>
      <div className="howto">
        <p>{t.tools.qr.howto}</p>
        <p className="muted">{t.tools.qr.example}</p>
      </div>

      <div className="field">
        <label htmlFor="qrtext">Text / URL</label>
        <textarea id="qrtext" value={text} onChange={(e) => setText(e.target.value)} />
      </div>

      <div className="btn-row">
        <button type="button" className="btn" disabled={busy} onClick={generate}>
          {busy ? t.processing : t.generate}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={!pngUrl}
          onClick={downloadPng}
        >
          {t.downloadPng}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={!svg}
          onClick={downloadSvg}
        >
          {t.downloadSvg}
        </button>
      </div>

      {error ? <Alert type="error">{error}</Alert> : null}

      {pngUrl ? (
        <div className="qr-preview" style={{ marginTop: '1rem' }}>
          <img src={pngUrl} alt="QR code preview" />
        </div>
      ) : (
        <p className="muted">{t.noResultsYet}</p>
      )}
    </div>
  )
}
