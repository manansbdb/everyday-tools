import { useState } from 'react'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { useI18n } from './i18n/useI18n'
import { ImageCompressTool } from './tools/ImageCompressTool'
import { ImageConvertTool } from './tools/ImageConvertTool'
import { PdfTool } from './tools/PdfTool'
import { QrTool } from './tools/QrTool'
import { TextTool } from './tools/TextTool'
import { MoneyTool } from './tools/MoneyTool'

type ToolId =
  | 'home'
  | 'imageCompress'
  | 'imageConvert'
  | 'pdf'
  | 'qr'
  | 'text'
  | 'money'

const TOOL_META: { id: Exclude<ToolId, 'home'>; icon: string }[] = [
  { id: 'imageCompress', icon: '🗜️' },
  { id: 'imageConvert', icon: '🔄' },
  { id: 'pdf', icon: '📄' },
  { id: 'qr', icon: '▣' },
  { id: 'text', icon: '✏️' },
  { id: 'money', icon: '💰' },
]

export default function App() {
  const { t } = useI18n()
  const [tool, setTool] = useState<ToolId>('home')

  const title =
    tool === 'home'
      ? t.appName
      : t.tools[tool].title

  return (
    <div className="app-shell">
      <Header onHome={() => setTool('home')} />
      <main className="container">
        {tool === 'home' ? (
          <>
            <section className="hero">
              <h1>{t.appName}</h1>
              <p>{t.tagline}</p>
              <div className="badge">{t.privacyBadge}</div>
            </section>
            <section className="tool-grid" aria-label="Tools">
              {TOOL_META.map((item) => {
                const meta = t.tools[item.id]
                return (
                  <article key={item.id} className="tool-card">
                    <div className="icon" aria-hidden>
                      {item.icon}
                    </div>
                    <h2>{meta.title}</h2>
                    <p>{meta.desc}</p>
                    <button type="button" className="btn" onClick={() => setTool(item.id)}>
                      {t.openTool}
                    </button>
                  </article>
                )
              })}
            </section>
          </>
        ) : (
          <section className="tool-page">
            <div className="back-link">
              <button type="button" className="btn btn-secondary" onClick={() => setTool('home')}>
                ← {t.back}
              </button>
            </div>
            <div className="panel">
              <h1 style={{ marginTop: 0 }}>{title}</h1>
              <p className="muted">{t.tools[tool].desc}</p>
              {tool === 'imageCompress' ? <ImageCompressTool /> : null}
              {tool === 'imageConvert' ? <ImageConvertTool /> : null}
              {tool === 'pdf' ? <PdfTool /> : null}
              {tool === 'qr' ? <QrTool /> : null}
              {tool === 'text' ? <TextTool /> : null}
              {tool === 'money' ? <MoneyTool /> : null}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
