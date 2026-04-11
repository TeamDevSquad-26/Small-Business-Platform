import { readFileSync, existsSync } from "node:fs";
import { basename, resolve } from "node:path";
import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminSingleton: App | null | undefined;

/** Resolve `GOOGLE_APPLICATION_CREDENTIALS` — often the JSON lives in `backend/` only. */
function resolveServiceAccountFile(envPath: string): string | null {
  const trimmed = envPath.trim();
  const cwd = process.cwd();
  const fileName = basename(trimmed);
  const candidates = [
    trimmed,
    resolve(cwd, trimmed),
    resolve(cwd, trimmed.replace(/^\.\//, "")),
    resolve(cwd, "backend", trimmed.replace(/^\.\//, "")),
    resolve(cwd, "backend", fileName),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

/** Optional Admin SDK for server API routes when client writes need a trusted path. */
export function getAdminApp(): App | null {
  if (adminSingleton !== undefined) return adminSingleton;
  try {
    if (getApps().length > 0) {
      adminSingleton = getApps()[0]!;
      return adminSingleton;
    }

    const jsonFromEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
    if (jsonFromEnv) {
      const parsed = JSON.parse(jsonFromEnv) as ServiceAccount;
      adminSingleton = initializeApp({ credential: cert(parsed) });
      return adminSingleton;
    }

    const path = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
    if (path) {
      const absolute = resolveServiceAccountFile(path);
      if (!absolute) {
        adminSingleton = null;
        return null;
      }
      const raw = readFileSync(absolute, "utf8");
      const parsed = JSON.parse(raw) as ServiceAccount;
      adminSingleton = initializeApp({ credential: cert(parsed) });
      return adminSingleton;
    }

    adminSingleton = null;
    return null;
  } catch {
    adminSingleton = null;
    return null;
  }
}

export function getAdminFirestore(): Firestore | null {
  const a = getAdminApp();
  return a ? getFirestore(a) : null;
}

export function getAdminAuth(): Auth | null {
  const a = getAdminApp();
  return a ? getAuth(a) : null;
}
