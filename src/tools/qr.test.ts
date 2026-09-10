import { describe, expect, it } from 'vitest'
import { generateQrDataUrl, generateQrSvg } from './QrTool'

describe('QR generation smoke', () => {
  it('creates PNG data URL', async () => {
    const url = await generateQrDataUrl('https://example.com')
    expect(url.startsWith('data:image/png;base64,')).toBe(true)
  })

  it('creates SVG markup', async () => {
    const svg = await generateQrSvg('hello')
    expect(svg).toContain('<svg')
  })
})
