import { useI18n } from '../../i18n/useI18n'
import type { Locale } from '../../i18n/translations'

interface Props {
  onHome: () => void
}

export function Header({ onHome }: Props) {
  const { t, locale, setLocale } = useI18n()

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <button type="button" className="brand" onClick={onHome} aria-label={t.home}>
          <span className="brand-mark">ET</span>
          <span className="brand-text">
            <strong>{t.appName}</strong>
            <span>{t.privacyBadge}</span>
          </span>
        </button>
        <div className="header-actions">
          <div className="lang-switch" role="group" aria-label={t.language}>
            {(['en', 'pt'] as Locale[]).map((code) => (
              <button
                key={code}
                type="button"
                className={locale === code ? 'active' : ''}
                onClick={() => setLocale(code)}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
