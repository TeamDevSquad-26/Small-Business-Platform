import type { NextFunction, Request, Response } from "express";
import { getAuth } from "firebase-admin/auth";
import { getDb } from "../config/firebase.js";
import { HttpError } from "../lib/errors.js";
import type { Role } from "../types/auth.js";

/**
 * Verifies Firebase ID token and loads role from Firestore `users/{uid}`.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
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
      email: (decoded.email as string) ?? (data?.email as string) ?? "",
      role: (data?.role as Role) ?? "customer",
      name: data?.name as string | undefined,
    };

    next();
  } catch (e) {
    next(e instanceof HttpError ? e : new HttpError(401, "Invalid or expired token"));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    return next(new HttpError(403, "Admin access required"));
  }
  next();
}

export function requireShopOwnerOrAdmin(req: Request, _res: Response, next: NextFunction) {
  const r = req.user?.role;
  if (r !== "shop_owner" && r !== "admin") {
    return next(new HttpError(403, "Shop owner or admin access required"));
  }
  next();
}
