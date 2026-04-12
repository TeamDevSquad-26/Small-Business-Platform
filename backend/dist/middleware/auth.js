import { getAuth } from "firebase-admin/auth";
import { getDb } from "../config/firebase.js";
import { HttpError } from "../lib/errors.js";
/**
 * Verifies Firebase ID token and loads role from Firestore `users/{uid}`.
 */
export async function requireAuth(req, _res, next) {
    try {
        const header = req.headers.authorization;
        if (!header?.startsWith("Bearer ")) {
            throw new HttpError(401, "Missing or invalid Authorization header (Bearer token required)");
        }
        const idToken = header.slice(7);
        const decoded = await getAuth().verifyIdToken(idToken);
        const snap = await getDb().collection("users").doc(decoded.uid).get();
        const data = snap.data();
        req.user = {
            uid: decoded.uid,
            email: decoded.email ?? data?.email ?? "",
            role: data?.role ?? "customer",
            name: data?.name,
        };
        next();
    }
    catch (e) {
        next(e instanceof HttpError ? e : new HttpError(401, "Invalid or expired token"));
    }
}
export function requireAdmin(req, _res, next) {
    if (req.user?.role !== "admin") {
        return next(new HttpError(403, "Admin access required"));
    }
    next();
}
export function requireShopOwnerOrAdmin(req, _res, next) {
    const r = req.user?.role;
    if (r !== "shop_owner" && r !== "admin") {
        return next(new HttpError(403, "Shop owner or admin access required"));
    }
    next();
}
