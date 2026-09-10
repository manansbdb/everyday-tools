# Contributing

Thanks for helping improve Everyday Tools.

## Principles

- Keep **all file/text processing client-side**
- Do not add trackers, ads, analytics, or paid third-party APIs
- Do not invent donation wallet addresses; leave `src/config/support.ts` disabled unless the maintainer sets a real address
- Prefer small, tested pure helpers in `src/utils/`

## Setup

```bash
npm install
npm run dev
npm test
npm run build
```

## Pull requests

1. Fork and create a branch
2. Add/adjust Vitest coverage for pure logic when possible
3. Keep EN + PT strings in `src/i18n/translations.ts` in sync
4. Do not commit `node_modules/`, `dist/`, or secrets

## License

By contributing, you agree your changes are licensed under the MIT License.
