# Everyday Tools

Free, privacy-first browser utilities for non-technical users. **All processing happens on your device** — no uploads, no ads, no trackers, no signup.

**Live demo (free GitHub Pages):** https://manansbdb.github.io/everyday-tools/

**Português:** see [README.pt.md](./README.pt.md)

## Tools

1. **Compress & resize images** — quality/size comparison; downloads new files (never overwrites originals)
2. **Convert images** — PNG / JPEG / WebP with clear errors and size limits
3. **PDF merge, split, reorder** — client-side via [pdf-lib](https://pdf-lib.js.org/)
4. **QR codes** — download PNG and SVG
5. **Text tools** — clean whitespace, remove duplicate lines, word count
6. **Money calculators** — discounts, unit price, bill split with tip

## Privacy

- Files and text never leave your browser
- No analytics, ads, or accounts
- Optional Support/Donate UI is **disabled by default** (`src/config/support.ts`)

## Install & run (local)

Requirements: Node.js 20+ (recommended).

```bash
npm install
npm run dev
```

### Tests & production build

```bash
npm test
npm run build
npm run preview
```

## Deploy (free options)

This project is static. You can host the `dist/` folder on any static host.

### GitHub Pages (free)

**Demo is live:** https://manansbdb.github.io/everyday-tools/

Served from the `gh-pages` branch (standard free public Pages). No paid plan required.

To redeploy after changes:

```bash
npm run build
# publish contents of dist/ to the gh-pages branch
```

## Size limits (soft, browser memory)

- Images: 25 MB each, up to 20 files
- PDFs: 50 MB each, up to 30 files

Very large files may fail depending on device memory.

## Credits (third-party)

| Library | License | Use |
|---------|---------|-----|
| [React](https://react.dev/) | MIT | UI |
| [Vite](https://vitejs.dev/) | MIT | Build |
| [pdf-lib](https://github.com/Hopding/pdf-lib) | MIT | PDF merge/split/reorder |
| [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression) | MIT | Image compress/resize |
| [qrcode](https://github.com/soldair/node-qrcode) | MIT | QR PNG/SVG |

## Limitations

- Image conversion uses Canvas — animated GIFs typically become a single frame; exotic formats may be unsupported
- Encrypted/password-protected PDFs may fail or be partially ignored (`ignoreEncryption`)
- Compression ratio depends on content; PNG often shrinks less than JPEG/WebP
- No server-side batch processing (by design)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE) © 2026 manansbdb
