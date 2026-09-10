import { useI18n } from '../../i18n/I18nContext'
import { supportConfig } from '../../config/support'
import { SupportSection } from '../common/SupportSection'

export function Footer() {
  const { t } = useI18n()
  return (
    <footer className="site-footer">
      <div className="container">
        {supportConfig.enabled ? <SupportSection /> : null}
        <p>{t.footerPrivacy}</p>
        <p>{t.footerCredits}</p>
        <p>{t.footerLicense}</p>
        {!supportConfig.enabled ? (
          <p className="muted">
            {t.support}: {t.supportDisabled}
          </p>
        ) : null}
      </div>
    </footer>
  )
}
