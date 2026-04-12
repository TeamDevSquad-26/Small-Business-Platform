/**
 * Initialise Firebase Admin once. Prefer GOOGLE_APPLICATION_CREDENTIALS pointing to a JSON file,
 * or FIREBASE_SERVICE_ACCOUNT_JSON with the raw JSON string.
 */
export declare function initFirebaseAdmin(): import("firebase-admin/app").App;
export declare function getDb(): FirebaseFirestore.Firestore;
