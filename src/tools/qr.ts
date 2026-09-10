import QRCode from 'qrcode'

export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 512,
    color: { dark: '#0f172a', light: '#ffffff' },
  })
}

export async function generateQrSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
    color: { dark: '#0f172a', light: '#ffffff' },
  })
}
