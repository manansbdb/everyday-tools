import { useCallback, useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import { useI18n } from '../../i18n/useI18n'

interface Props {
  accept: string
  multiple?: boolean
  onFiles: (files: File[]) => void
  hint?: string
}

export function FileDropzone({ accept, multiple = true, onFiles, hint }: Props) {
  const { t } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragover, setDragover] = useState(false)

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return
      onFiles(Array.from(list))
    },
    [onFiles],
  )

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragover(false)
    handleFiles(e.dataTransfer.files)
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    e.target.value = ''
  }

  return (
    <div
      className={`dropzone${dragover ? ' dragover' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragover(true)
      }}
      onDragLeave={() => setDragover(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
      }}
    >
      <strong>{t.dropHere}</strong>
      {hint ? <p className="muted">{hint}</p> : null}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onChange}
      />
    </div>
  )
}
