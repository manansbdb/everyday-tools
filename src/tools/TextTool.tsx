import { useMemo, useState } from 'react'
import { Alert } from '../components/common/Alert'
import { useI18n } from '../i18n/useI18n'
import { cleanText, removeDuplicateLines, wordCount } from '../utils/text'
import { downloadBlob } from '../utils/format'

type Mode = 'clean' | 'dedupe' | 'count'

export function TextTool() {
  const { t } = useI18n()
  const [mode, setMode] = useState<Mode>('clean')
  const [input, setInput] = useState('')
  const [trimLines, setTrimLines] = useState(true)
  const [collapseSpaces, setCollapseSpaces] = useState(true)
  const [removeEmpty, setRemoveEmpty] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(true)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const stats = useMemo(() => wordCount(mode === 'count' ? input : output || input), [input, output, mode])

  const process = () => {
    setError(null)
    if (!input) {
      setError(t.errorEmpty)
      return
    }
    if (mode === 'clean') {
      setOutput(cleanText(input, { trimLines, collapseSpaces, removeEmptyLines: removeEmpty }))
    } else if (mode === 'dedupe') {
      setOutput(removeDuplicateLines(input, caseSensitive))
    } else {
      setOutput('')
    }
  }

  return (
    <div>
      <div className="howto">
        <p>{t.tools.text.howto}</p>
        <p className="muted">{t.tools.text.example}</p>
      </div>

      <div className="tabs">
        <button type="button" className={mode === 'clean' ? 'active' : ''} onClick={() => setMode('clean')}>
          {t.cleanText}
        </button>
        <button type="button" className={mode === 'dedupe' ? 'active' : ''} onClick={() => setMode('dedupe')}>
          {t.removeDupes}
        </button>
        <button type="button" className={mode === 'count' ? 'active' : ''} onClick={() => setMode('count')}>
          {t.wordCount}
        </button>
      </div>

      <div className="field">
        <label htmlFor="text-in">Input</label>
        <textarea id="text-in" value={input} onChange={(e) => setInput(e.target.value)} />
      </div>

      {mode === 'clean' ? (
        <div className="btn-row" style={{ marginBottom: '0.75rem' }}>
          <label>
            <input type="checkbox" checked={trimLines} onChange={(e) => setTrimLines(e.target.checked)} /> {t.trimLines}
          </label>
          <label>
            <input type="checkbox" checked={collapseSpaces} onChange={(e) => setCollapseSpaces(e.target.checked)} />{' '}
            {t.collapseSpaces}
          </label>
          <label>
            <input type="checkbox" checked={removeEmpty} onChange={(e) => setRemoveEmpty(e.target.checked)} />{' '}
            {t.removeEmpty}
          </label>
        </div>
      ) : null}

      {mode === 'dedupe' ? (
        <div className="btn-row" style={{ marginBottom: '0.75rem' }}>
          <label>
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
            />{' '}
            {t.caseSensitive}
          </label>
        </div>
      ) : null}

      <div className="btn-row">
        {mode !== 'count' ? (
          <button type="button" className="btn" onClick={process}>
            {t.process}
          </button>
        ) : null}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setInput('')
            setOutput('')
            setError(null)
          }}
        >
          {t.clear}
        </button>
        {output ? (
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigator.clipboard.writeText(output)}
            >
              {t.copy}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => downloadBlob(new Blob([output], { type: 'text/plain' }), 'text-result.txt')}
            >
              {t.download}
            </button>
          </>
        ) : null}
      </div>

      {error ? <Alert type="error">{error}</Alert> : null}

      {(mode === 'count' || output) && (
        <div className="stats" style={{ marginTop: '1rem' }}>
          <div className="stat">
            <strong>{stats.characters}</strong>
            <span>{t.characters}</span>
          </div>
          <div className="stat">
            <strong>{stats.charactersNoSpaces}</strong>
            <span>{t.charactersNoSpaces}</span>
          </div>
          <div className="stat">
            <strong>{stats.words}</strong>
            <span>{t.words}</span>
          </div>
          <div className="stat">
            <strong>{stats.lines}</strong>
            <span>{t.lines}</span>
          </div>
          <div className="stat">
            <strong>{stats.paragraphs}</strong>
            <span>{t.paragraphs}</span>
          </div>
        </div>
      )}

      {mode !== 'count' && output ? (
        <div className="field" style={{ marginTop: '1rem' }}>
          <label htmlFor="text-out">{t.result}</label>
          <textarea id="text-out" value={output} readOnly />
        </div>
      ) : null}
    </div>
  )
}
