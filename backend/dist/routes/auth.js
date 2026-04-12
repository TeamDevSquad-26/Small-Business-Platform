import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { z } from "zod";
import { getDb } from "../config/firebase.js";
import { HttpError } from "../lib/errors.js";
const router = Router();
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1).max(120),
    role: z.enum(["customer", "shop_owner"]).optional().default("customer"),
});
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
/**
 * POST /register
 * Creates Firebase Auth user + Firestore `users/{uid}`.
 * `admin` role cannot be self-signed; set manually in Firestore or via Admin.
 */
router.post("/register", async (req, res, next) => {
    try {
        const body = registerSchema.parse(req.body);
        const db = getDb();
        let userRecord;
        try {
            userRecord = await getAuth().createUser({
                email: body.email,
                password: body.password,
                displayName: body.name,
            });
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : "Registration failed";
            if (msg.includes("email-already-exists")) {
                throw new HttpError(409, "Email already registered");
            }
            throw new HttpError(400, msg);
        }
        await db
            .collection("users")
            .doc(userRecord.uid)
            .set({
            userId: userRecord.uid,
            name: body.name,
            email: body.email.toLowerCase(),
            role: body.role,
            createdAt: FieldValue.serverTimestamp(),
        });
        return res.status(201).json({
            message: "User registered",
            userId: userRecord.uid,
            email: body.email.toLowerCase(),
            role: body.role,
        });
    }
    catch (e) {
        next(e);
    }
});
/**
 * POST /login
 * Uses Firebase Identity Toolkit REST (same flow as client SDK email/password).
 * Returns ID token for subsequent Bearer auth on protected routes.
 */
router.post("/login", async (req, res, next) => {
    try {
        const body = loginSchema.parse(req.body);
        const apiKey = process.env.FIREBASE_WEB_API_KEY?.trim();
        if (!apiKey) {
            throw new HttpError(500, "FIREBASE_WEB_API_KEY is not set (required for Identity Toolkit login)", "CONFIG");
        }
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: body.email,
                password: body.password,
                returnSecureToken: true,
            }),
        });
        const json = (await resp.json());
        if (!resp.ok) {
            const msg = json.error?.message ?? "Login failed";
            if (msg.includes("INVALID_PASSWORD") || msg.includes("EMAIL_NOT_FOUND")) {
                throw new HttpError(401, "Invalid email or password");
            }
            throw new HttpError(400, msg);
        }
        return res.json({
            idToken: json.idToken,
            refreshToken: json.refreshToken,
            expiresIn: json.expiresIn,
            userId: json.localId,
        });
    }
    catch (e) {
        next(e);
    }
});
export default router;
