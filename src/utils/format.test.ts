import { describe, expect, it } from 'vitest'
import { formatBytes, stemAndExt } from './format'

describe('formatBytes', () => {
  it('formats bytes and KB', () => {
    expect(formatBytes(500)).toBe('500 B')
    expect(formatBytes(2048)).toBe('2.0 KB')
  })
})

describe('stemAndExt', () => {
  it('splits filename', () => {
    expect(stemAndExt('photo.JPEG')).toEqual({ stem: 'photo', ext: '.JPEG' })
  })
})
