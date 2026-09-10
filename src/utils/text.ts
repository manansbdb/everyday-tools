export function cleanText(input: string, options?: {
  trimLines?: boolean
  collapseSpaces?: boolean
  removeEmptyLines?: boolean
}): string {
  const {
    trimLines = true,
    collapseSpaces = true,
    removeEmptyLines = false,
  } = options ?? {}

  let lines = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')

  if (trimLines) {
    lines = lines.map((l) => l.trim())
  }
  if (collapseSpaces) {
    lines = lines.map((l) => l.replace(/[ \t]+/g, ' '))
  }
  if (removeEmptyLines) {
    lines = lines.filter((l) => l.length > 0)
  }

  return lines.join('\n')
}

/** Remove duplicate lines (exact match). Preserves first occurrence order. */
export function removeDuplicateLines(input: string, caseSensitive = true): string {
  const lines = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const seen = new Set<string>()
  const out: string[] = []
  for (const line of lines) {
    const key = caseSensitive ? line : line.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(line)
  }
  return out.join('\n')
}

export interface WordCountStats {
  characters: number
  charactersNoSpaces: number
  words: number
  lines: number
  paragraphs: number
}

export function wordCount(input: string): WordCountStats {
  const normalized = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const characters = normalized.length
  const charactersNoSpaces = normalized.replace(/\s/g, '').length
  const lines = normalized.length === 0 ? 0 : normalized.split('\n').length
  const words =
    normalized.trim().length === 0
      ? 0
      : normalized.trim().split(/\s+/).filter(Boolean).length
  const paragraphs =
    normalized.trim().length === 0
      ? 0
      : normalized
          .trim()
          .split(/\n\s*\n/)
          .filter((p) => p.trim().length > 0).length

  return { characters, charactersNoSpaces, words, lines, paragraphs }
}
