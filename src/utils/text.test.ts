import { describe, expect, it } from 'vitest'
import { cleanText, removeDuplicateLines, wordCount } from './text'

describe('cleanText', () => {
  it('trims lines and collapses spaces', () => {
    const input = '  hello   world  \n\tfoo\t  bar  '
    expect(cleanText(input)).toBe('hello world\nfoo bar')
  })

  it('removes empty lines when requested', () => {
    expect(cleanText('a\n\n\nb', { removeEmptyLines: true })).toBe('a\nb')
  })
})

describe('removeDuplicateLines', () => {
  it('keeps first occurrence order', () => {
    expect(removeDuplicateLines('a\nb\na\nc\nb')).toBe('a\nb\nc')
  })

  it('supports case-insensitive dedupe', () => {
    expect(removeDuplicateLines('A\na\nB', false)).toBe('A\nB')
  })
})

describe('wordCount', () => {
  it('counts empty input as zeros', () => {
    expect(wordCount('')).toEqual({
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      lines: 0,
      paragraphs: 0,
    })
  })

  it('counts words, lines, paragraphs', () => {
    const stats = wordCount('Hello world\n\nNext para')
    expect(stats.words).toBe(4)
    expect(stats.lines).toBe(3)
    expect(stats.paragraphs).toBe(2)
    expect(stats.characters).toBe('Hello world\n\nNext para'.length)
  })
})
