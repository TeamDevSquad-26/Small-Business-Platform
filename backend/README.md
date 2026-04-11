# Karobaar API (Firebase + Express)

Production-style REST backend for the Small Business Platform: **Firebase Authentication (email/password)** for identities, **Cloud Firestore** for data, and **Firebase Admin SDK** on the server (bypasses security rules; rules still protect direct client SDK access).

## Folder structure

```
backend/
  package.json
  tsconfig.json
  .env.example
  README.md
  src/
    index.ts                 # Express app entry
    config/firebase.ts       # Admin SDK init
    lib/errors.ts
    middleware/
      auth.ts                # Bearer ID token + Firestore role
      errorHandler.ts
    routes/
      auth.ts                # POST /register, POST /login
      shops.ts               # /shops
      products.ts            # /products
      orders.ts              # /orders
    types/
      auth.ts
      express.d.ts
```

Root (Firestore CLI):

```
firebase.json
firestore.rules
firestore.indexes.json
```

## Firestore data model

| Collection | Document ID | Notes |
|------------|-------------|--------|
| `users` | `{uid}` (same as Firebase Auth UID) | `userId`, `name`, `email`, `role`, `createdAt` |
| `shops` | auto ID | `shopId`, `ownerId`, `shopName`, `description`, `createdAt` |
| `products` | auto ID | `productId`, `shopId`, `name`, `price`, `stock`, `imageUrl`, `createdAt` |
| `orders` | auto ID | `orderId`, `userId`, `shopId`, `products[]`, `totalPrice`, `status`, `createdAt` |

`role`: `customer` | `shop_owner` | `admin` (admin is **not** self-registered; set manually in Firestore).

## Prerequisites

1. Firebase project with **Authentication → Email/Password** enabled.
2. **Firestore** created (production or test mode).
3. **Service account** JSON: Firebase Console → Project settings → Service accounts → Generate new private key.

## Setup (step by step)

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Environment file**

   Copy `backend/.env.example` to `backend/.env` and fill in:

   - `FIREBASE_WEB_API_KEY` — same value as your web app’s API key (Firebase Console → Project settings → General → Your apps).
   - `GOOGLE_APPLICATION_CREDENTIALS` — path to the service account JSON, e.g. `serviceAccountKey.json` placed inside `backend/` (file is gitignored).

   **Alternative:** set `FIREBASE_SERVICE_ACCOUNT_JSON` to the **entire JSON as one line** (useful on some hosts).

3. **Deploy Firestore rules & indexes** (from repo root)

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use <your-project-id>
   firebase deploy --only firestore:rules,firestore:indexes
   ```

   Wait until indexes show as **Enabled** in the Firebase Console (Firestore → Indexes).

4. **Run the API**

   ```bash
   cd backend
   npm run dev
   ```

   Default URL: `http://localhost:4000`  
   Health: `GET http://localhost:4000/health`

## API overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Create Auth user + `users/{uid}` |
| POST | `/login` | No | Returns `idToken` (Identity Toolkit) |
| GET | `/shops` | No | List shops (paginated: `?limit=20&cursor=`) |
| GET | `/shops/:id` | No | Shop detail |
| POST | `/shops` | Bearer | Create shop; promotes `customer` → `shop_owner` |
| GET | `/products/:shopId` | No | Catalog for a shop |
| POST | `/products` | Bearer | Create product (shop owner only) |
| PUT | `/products/:id` | Bearer | Update product |
| DELETE | `/products/:id` | Bearer | Delete product |
| POST | `/orders` | Bearer | Place order (stock + total in transaction) |
| GET | `/orders/user/:userId` | Bearer | Own orders (or admin) |
| GET | `/orders/shop/:shopId` | Bearer | Shop’s orders (owner or admin) |
| PUT | `/orders/:id` | Bearer | Update `status` (owner or admin) |

Protected routes expect:

```http
Authorization: Bearer <idToken>
```

## Postman examples

Base URL: `http://localhost:4000`

### 1. Register

- **POST** `/register`
- Body (JSON):

```json
{
  "email": "owner@example.com",
  "password": "secret12",
  "name": "Ali Owner",
  "role": "shop_owner"
}
```

### 2. Login

- **POST** `/login`
- Body:

```json
{
  "email": "owner@example.com",
  "password": "secret12"
}
```

Copy `idToken` from the response.

### 3. Create shop

- **POST** `/shops`
- Headers: `Authorization: Bearer {{idToken}}`
- Body:

```json
{
  "shopName": "Lahore Bakers",
  "description": "Fresh cakes daily"
}
```

Save `shopId` from response.

### 4. Create product

- **POST** `/products`
- Headers: `Authorization: Bearer {{idToken}}`
- Body:

```json
{
  "shopId": "<shopId>",
  "name": "Chocolate Cake",
  "price": 1200,
  "stock": 20,
  "imageUrl": ""
}
```

### 5. Place order (as another user)

Register/login as a **customer**, then:

- **POST** `/orders`
- Headers: `Authorization: Bearer {{customerIdToken}}`
- Body:

```json
{
  "shopId": "<shopId>",
  "products": [
    { "productId": "<productId>", "quantity": 2 }
  ]
}
```

### 6. Update order status (shop owner)

- **PUT** `/orders/<orderId>`
- Headers: `Authorization: Bearer {{ownerIdToken}}`
- Body:

```json
{
  "status": "confirmed"
}
```

## Admin users

1. Register a normal user in Firebase Auth.
2. In Firestore, open `users/{uid}` and set `role` to `"admin"`.

## Security notes

- Never commit service account JSON or `.env`.
- The API uses Admin SDK; **Firestore rules** apply when the browser/mobile app talks to Firestore directly (with the user’s ID token).
- `POST /login` uses your **Web API key** in Identity Toolkit; restrict it in Google Cloud Console if needed.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server with hot reload (`tsx watch`) |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run `node dist/index.js` |
| `npm run lint` | Typecheck `tsc --noEmit` |
