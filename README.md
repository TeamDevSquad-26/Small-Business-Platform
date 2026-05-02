# Karobaar.pk

A modern platform for **Pakistan-style commerce**: vendors run shareable shop links, buyers browse and order, with Firebase-backed auth and dashboards.

This repo contains the **Next.js** storefront + vendor dashboard; a separate **`backend/`** folder holds additional Node tooling where applicable.

---

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Build:

```bash
npm run build
npm start
```

---

## Environment variables

Configure Firebase (client), Cloudinary (product images), Firebase Admin (trusted API routes), and optional AI — typically via **`.env.local`** (see existing keys you already use for Firebase / Cloudinary).

**Firebase client:** `NEXT_PUBLIC_FIREBASE_*` (see `src/lib/firebase/env.ts`).

**Firebase Admin (server routes):** `GOOGLE_APPLICATION_CREDENTIALS` or `FIREBASE_SERVICE_ACCOUNT_JSON` — required for API routes that verify ID tokens and read Firestore server-side.

**Cloudinary:** `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.

---

## AI feature: smart product listing draft

Vendors can generate **draft** title, description, suggested category, and tags from:

- a **working title** (hint in the **Name** field), and/or  
- a **new product photo** upload, and/or  
- when **editing** a product, the existing **HTTPS** image URL already stored for that item (e.g. Cloudinary — the server refetches it safely).

**Important:** Drafts are **not** auto-published — the vendor reviews and edits everything (especially **price** and **stock**) before save.

### Requirements

| Requirement | Why |
|-------------|-----|
| `OPENAI_API_KEY` | Calls OpenAI `gpt-4o-mini` (vision when an image is supplied). |
| Firebase Admin + Firestore | Verify the caller’s ID token and ensure they own a **shop** before running AI. |
| Product images on **trusted hosts** for URL refetch | Only **HTTPS** URLs on **`res.cloudinary.com`** or **`firebasestorage.googleapis.com`** whose path includes this shop’s folder (`/karobaar/shops/{shopId}/` or equivalent Storage path) are fetched server-side (SSRF-safe). |

### API

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/ai/status` | Returns `{ "productDraft": true \| false }` depending on whether `OPENAI_API_KEY` is set (no secrets exposed). |
| `POST` | `/api/ai/product-draft` | Body: `{ workingTitle?, imageBase64?, imageMimeType?, imageUrl? }` + header `Authorization: Bearer <Firebase ID token>`. Response: `{ name, description, suggestedCategory, suggestedTags }`. |

### UI

**Dashboard → Products → Add / Edit product** modal includes an **“AI listing draft”** panel. If `productDraft` is false, the UI explains that `OPENAI_API_KEY` must be configured on the server.

### Image types

Uploads accepted for AI and storage: **JPEG, PNG, WebP, GIF** (max **5 MB** per existing product rules).

---

## License

See repository metadata / `package.json` (`ISC` as declared).
