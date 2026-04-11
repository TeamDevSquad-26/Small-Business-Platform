/** Web client config: read `process.env.NEXT_PUBLIC_*` directly so Next can inline values. */

export const FIREBASE_PUBLIC_ENV_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

/** Trim and strip stray quotes from env strings. */
function clean(v: string | undefined): string {
  let s = (v ?? "").trim();
  s = s.replace(/,+$/g, "");
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  s = s.replace(/,+$/g, "");
  return s;
}

/** Firebase web config object with cleaned env values (use for `initializeApp`). */
export function getFirebasePublicConfig() {
  return {
    apiKey: clean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain: clean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: clean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: clean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: clean(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    appId: clean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  };
}

export function getMissingFirebasePublicEnvKeys(): string[] {
  const entries: [string, string][] = [
    ["NEXT_PUBLIC_FIREBASE_API_KEY", clean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)],
    [
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      clean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    ],
    ["NEXT_PUBLIC_FIREBASE_PROJECT_ID", clean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)],
    [
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      clean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
    ],
    [
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      clean(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    ],
    ["NEXT_PUBLIC_FIREBASE_APP_ID", clean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID)],
  ];
  return entries.filter(([, v]) => !v).map(([k]) => k);
}

export function isFirebasePublicConfigComplete(): boolean {
  return getMissingFirebasePublicEnvKeys().length === 0;
}

/** Short message when sign-in cannot start (missing web config). */
export function getFirebaseConfigurationHelpMessage(): string {
  return "Sign-in is not available right now. Please try again later.";
}
