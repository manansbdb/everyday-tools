# Lockfile

`package-lock.json` is committed on `main` for reproducible `npm ci` / `npm install`.

If it is missing locally after clone, run `npm install` to regenerate (should match committed lock when deps unchanged).
