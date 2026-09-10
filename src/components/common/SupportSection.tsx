import { useState } from 'react'
import { useI18n } from '../../i18n/useI18n'
import { supportConfig } from '../../config/support'

export function SupportSection() {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)

  if (!supportConfig.enabled || !supportConfig.bitcoinAddress) {
    return (
      <div className="panel support-box">
        <h3>{t.supportTitle}</h3>
        <p>{t.supportDisabled}</p>
      </div>
    )
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(supportConfig.bitcoinAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="panel support-box">
      <h3>{t.supportTitle}</h3>
      <p>{t.supportBody}</p>
      <code>{supportConfig.bitcoinAddress}</code>
      <button type="button" className="btn btn-secondary" onClick={copy}>
        {copied ? t.copied : t.copy}
      </button>
    </div>
  )
}
