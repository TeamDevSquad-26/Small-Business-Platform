import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth, type User } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import {
  getFirebasePublicConfig,
  getMissingFirebasePublicEnvKeys,
  isFirebasePublicConfigComplete,
} from "./env";

const firebaseConfig = getFirebasePublicConfig();

/** True when all six public Firebase env vars are non-empty */
export const isFirebaseConfigured = isFirebasePublicConfigComplete();

/** Which `NEXT_PUBLIC_FIREBASE_*` keys are empty (for debugging) */
export const missingFirebasePublicEnvKeys = getMissingFirebasePublicEnvKeys();

let auth: Auth | null = null;

if (isFirebaseConfigured) {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
} else if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // eslint-disable-next-line no-console
  console.warn("[Karobaar] App sign-in config incomplete.");
}

function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  return getApps()[0] ?? null;
}

/** Firestore (browser SDK). Returns null if Firebase env is not configured. */
export function getFirebaseDb(): Firestore | null {
  const app = getFirebaseApp();
  return app ? getFirestore(app) : null;
}

/** Cloud Storage (browser SDK). Returns null if Firebase env is not configured. */
export function getFirebaseStorageApp(): FirebaseStorage | null {
  const app = getFirebaseApp();
  return app ? getStorage(app) : null;
}

/**
 * After a full page load, `auth.currentUser` can be null until the persisted
 * session is restored. Call this before Firestore/Storage writes from the client.
 */
export async function getFirebaseCurrentUserWhenReady(): Promise<User | null> {
  if (!auth) return null;
  await auth.authStateReady();
  return auth.currentUser;
}

export { auth };
