import { describe, expect, it } from 'vitest'
import { parsePageRanges } from './pdf'

describe('parsePageRanges', () => {
  it('parses mixed ranges', () => {
    expect(parsePageRanges('1-3,5', 10)).toEqual([0, 1, 2, 4])
  })

  it('throws on out of bounds', () => {
    expect(() => parsePageRanges('1-99', 5)).toThrow()
  })
})
