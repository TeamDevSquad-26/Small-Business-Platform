import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import type { ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Initialise Firebase Admin once. Prefer GOOGLE_APPLICATION_CREDENTIALS pointing to a JSON file,
 * or FIREBASE_SERVICE_ACCOUNT_JSON with the raw JSON string.
 */
export function initFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  const jsonFromEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (jsonFromEnv) {
    const parsed = JSON.parse(jsonFromEnv) as ServiceAccount;
    return initializeApp({ credential: cert(parsed) });
  }

  const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!path) {
    throw new Error(
      "Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path, or FIREBASE_SERVICE_ACCOUNT_JSON."
    );
  }

  const absolute = resolve(process.cwd(), path);
  const raw = readFileSync(absolute, "utf8");
  const parsed = JSON.parse(raw) as ServiceAccount;
  return initializeApp({ credential: cert(parsed) });
}

export function getDb() {
  return getFirestore();
}
