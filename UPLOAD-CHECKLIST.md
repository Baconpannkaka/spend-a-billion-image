# Kontroll efter uppladdning till GitHub

Följande ska synas direkt i repositoryts rot under **Code**:

- `.github`
- `data`
- `public`
- `schemas`
- `scripts`
- `src`
- `package.json`
- `package-lock.json`
- `next.config.ts`
- `IMAGE-IMPORT.md`

Kontrollera dessutom följande exakta filer via **Go to file**:

- `.github/workflows/pages.yml`
- `.github/workflows/import-images.yml`
- `.github/workflows/review-images.yml`
- `scripts/import-wikimedia-images.mjs`
- `scripts/review-images.mjs`
- `scripts/lib/wikimedia-images.mjs`
- `src/types/index.ts`
- `src/lib/site.ts`
- `src/app/bildgranskning/page.tsx`
- `src/components/image-review-client.tsx`
- `data/image-overrides.json`
- `public/data/image-manifest.json`
- `public/data/image-review.json`

Om någon av dessa saknas ska projektet inte kompletteras med små patchar. Ladda i stället upp hela den rena zip-versionen till ett nytt tomt repository.
