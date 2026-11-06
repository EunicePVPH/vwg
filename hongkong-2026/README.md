# Hong Kong 2026 — Our Family Adventure

Private, offline-capable family travel dashboard (React + TypeScript + Vite + Tailwind, installable PWA).

## Deploy on Netlify (from your phone)
1. Netlify → *Add new site → Import from Git* → pick this repo.
2. **Base directory:** `hongkong-2026` · Build command `npm run build` · Publish directory `dist` (also set in `netlify.toml`).
3. Open the site link in Chrome on Android → ⋮ → **Install app**. Choose your 6-digit PIN on first open.

The repo root also holds an unrelated website (`index.html`). This app lives only in `hongkong-2026/`.

## Where things are
- `src/data/seed.ts` — all trip content (days, flights, hotel, tickets, tasks, packing…). Everything is also editable inside the app; edits are stored on the phone on top of this file.
- `src/lib/crypto.ts`, `vault.ts`, `backup.ts` — PIN, AES-GCM encryption, original-file vault, encrypted backup.
- `public/photos/` — drop real header photos (`peak.jpg`, `oceanpark.jpg`, …) and credit them in `credits.json`. Until then the app shows clearly-illustrated placeholders, never fake photos.

## Privacy model (honest version)
No server, no account, no analytics. Documents and edits live only in this browser on your phone, encrypted with a random key that your PIN unlocks (PBKDF2 600k + AES-256-GCM). The site URL itself is public-but-unlisted; it contains no personal data. A 6-digit PIN can be brute-forced offline by someone who copies your phone's storage — treat it as a convenience lock. Clearing browser data erases documents, so keep your originals and make an encrypted backup (Settings & Backup).

## Originals
Imported files are stored byte-for-byte (SHA-256 recorded and re-checked on every open). The viewer never re-encodes, redraws or overlays a QR code; zoom is proportional only.
